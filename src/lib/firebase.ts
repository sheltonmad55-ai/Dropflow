/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Validate Connection to Firestore on boot as per guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export async function loginWithGoogle() {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function pullAllUserData(userId: string) {
  let profileDoc;
  try {
    profileDoc = await getDoc(doc(db, 'profiles', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `profiles/${userId}`);
  }
  const profile = profileDoc.exists() ? profileDoc.data() : null;

  // Helper to fetch collection
  const fetchCol = async (colName: string) => {
    try {
      const q = query(collection(db, colName), where('user_id', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colName);
    }
  };

  const [
    caixinhas,
    vendas,
    despesas,
    produtos,
    fornecedores,
    zonas_entrega,
    campanhas,
    despesas_recorrentes
  ] = await Promise.all([
    fetchCol('caixinhas').then(res => res || []),
    fetchCol('vendas').then(res => res || []),
    fetchCol('despesas').then(res => res || []),
    fetchCol('produtos').then(res => res || []),
    fetchCol('fornecedores').then(res => res || []),
    fetchCol('zonas_entrega').then(res => res || []),
    fetchCol('campanhas').then(res => res || []),
    fetchCol('despesas_recorrentes').then(res => res || [])
  ]);

  return {
    profile,
    caixinhas,
    vendas,
    despesas,
    produtos,
    fornecedores,
    zonas_entrega,
    campanhas,
    despesas_recorrentes
  };
}

export function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  return JSON.parse(JSON.stringify(obj));
}

export async function pushQueueToFirestore(queue: any[]) {
  if (queue.length === 0) return;

  const batch = writeBatch(db);

  for (const item of queue) {
    const { type, action, data } = item;
    if (!data) continue;

    let colName = `${type}s`;
    if (type === 'zona') {
      colName = 'zonas_entrega';
    } else if (type === 'fornecedor') {
      colName = 'fornecedores';
    } else if (type === 'despesa_recorrente') {
      colName = 'despesas_recorrentes';
    }
    const docId = data.id;
    if (!docId) continue;

    const docRef = doc(db, colName, docId);

    if (action === 'create' || action === 'update') {
      batch.set(docRef, cleanUndefined(data), { merge: true });
    } else if (action === 'delete') {
      batch.delete(docRef);
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_commit');
  }
}
