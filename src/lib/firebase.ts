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
    despesas_recorrentes,
    meta_items,
    contas_bancarias
  ] = await Promise.all([
    fetchCol('caixinhas').then(res => res || []),
    fetchCol('vendas').then(res => res || []),
    fetchCol('despesas').then(res => res || []),
    fetchCol('produtos').then(res => res || []),
    fetchCol('fornecedores').then(res => res || []),
    fetchCol('zonas_entrega').then(res => res || []),
    fetchCol('campanhas').then(res => res || []),
    fetchCol('despesas_recorrentes').then(res => res || []),
    fetchCol('meta_items').then(res => res || []),
    fetchCol('contas_bancarias').then(res => res || [])
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
    despesas_recorrentes,
    meta_items,
    contas_bancarias
  };
}

export function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  return JSON.parse(JSON.stringify(obj));
}

function getQueueDocument(item: any) {
  const { type, data } = item;
  if (!data?.id) return null;

  let colName = `${type}s`;
  if (type === 'zona') {
    colName = 'zonas_entrega';
  } else if (type === 'fornecedor') {
    colName = 'fornecedores';
  } else if (type === 'despesa_recorrente') {
    colName = 'despesas_recorrentes';
  } else if (type === 'meta_item') {
    colName = 'meta_items';
  } else if (type === 'conta_bancaria') {
    colName = 'contas_bancarias';
  }

  return doc(db, colName, data.id);
}

function addQueueMutation(batch: ReturnType<typeof writeBatch>, item: any) {
  const docRef = getQueueDocument(item);
  if (!docRef || !item.data) return false;

  if (item.action === 'create' || item.action === 'update') {
    batch.set(docRef, cleanUndefined(item.data), { merge: true });
    return true;
  }
  if (item.action === 'delete') {
    batch.delete(docRef);
    return true;
  }
  return false;
}

export async function pushQueueToFirestore(queue: any[]) {
  const keyedQueue = queue.map((item, index) => ({
    item,
    key: item.id || `queue-item-${index}`
  }));
  if (keyedQueue.length === 0) return { successfulIds: [], failedIds: [] };

  const batch = writeBatch(db);
  keyedQueue.forEach(({ item }) => addQueueMutation(batch, item));

  try {
    await batch.commit();
    return {
      successfulIds: keyedQueue.map(({ key }) => key),
      failedIds: []
    };
  } catch (batchError) {
    // A single invalid/unauthorised document must not block every other
    // balance or sale. Retry each mutation independently and identify the
    // exact failing queue item for the caller.
    console.warn('Firestore batch rejected; retrying mutations individually.', batchError);
    const successfulIds: string[] = [];
    const failedIds: string[] = [];

    for (const { item, key } of keyedQueue) {
      const singleBatch = writeBatch(db);
      if (!addQueueMutation(singleBatch, item)) {
        failedIds.push(key);
        continue;
      }
      try {
        await singleBatch.commit();
        successfulIds.push(key);
      } catch (itemError) {
        failedIds.push(key);
        console.error('Firestore mutation rejected:', JSON.stringify({
          queueId: key,
          type: item.type,
          action: item.action,
          documentId: item.data?.id,
          userId: item.data?.user_id,
          error: itemError instanceof Error ? itemError.message : String(itemError)
        }));
      }
    }

    if (failedIds.length > 0) {
      console.error('Some Firestore mutations remain pending:', failedIds);
    }
    return { successfulIds, failedIds };
  }
}
