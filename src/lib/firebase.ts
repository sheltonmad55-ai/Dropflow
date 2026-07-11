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
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Safe FCM messaging provider
export async function getFcmToken(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('FCM is not supported in this browser environment.');
      return null;
    }
    const messaging = getMessaging(app);
    // VAPID Public key allows registration with the Web Push protocol
    const token = await getToken(messaging, {
      vapidKey: 'BIsS7Icl0K4Iq_1fHshv6rUsc6rby00g4U3h1Nn5KkK3yP7X6Uv6D8U_P3vVjFq9D8h3s6B69_eF2qC-vXp9o7E'
    });
    return token;
  } catch (error) {
    console.error('Error during FCM token retrieval:', error);
    return null;
  }
}

export async function registerForegroundFcm(onMessageReceived: (payload: any) => void): Promise<() => void> {
  try {
    const supported = await isSupported();
    if (!supported) return () => {};
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('Foreground FCM Message received:', payload);
      onMessageReceived(payload);
    });
  } catch (error) {
    console.error('Error registering foreground FCM listener:', error);
    return () => {};
  }
}

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

  const caixinhas = await fetchCol('caixinhas') || [];
  const vendas = await fetchCol('vendas') || [];
  const despesas = await fetchCol('despesas') || [];
  const produtos = await fetchCol('produtos') || [];
  const fornecedores = await fetchCol('fornecedores') || [];
  const zonas_entrega = await fetchCol('zonas_entrega') || [];

  return {
    profile,
    caixinhas,
    vendas,
    despesas,
    produtos,
    fornecedores,
    zonas_entrega
  };
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
    }
    const docId = data.id;
    if (!docId) continue;

    const docRef = doc(db, colName, docId);

    if (action === 'create' || action === 'update') {
      batch.set(docRef, data, { merge: true });
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
