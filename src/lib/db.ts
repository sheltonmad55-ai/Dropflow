/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, Caixinha, Venda, Despesa, Produto, Fornecedor, ZonaEntrega, SyncQueueItem, Campanha, DespesaRecorrente } from '../types.ts';

const DB_NAME = 'DroopFlowDB';
const DB_VERSION = 5;

function createQueueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `queue-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      const stores = [
        'profiles',
        'caixinhas',
        'vendas',
        'despesas',
        'produtos',
        'fornecedores',
        'zonas_entrega',
        'campanhas',
        'despesas_recorrentes',
        'meta_items',
        'contas_bancarias',
        'sync_queue'
      ];

      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function getAll<T>(storeName: string): Promise<T[]> {
  return initDB().then(db => {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export function getById<T>(storeName: string, id: string): Promise<T | null> {
  return initDB().then(db => {
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  });
}

export function putItem<T>(storeName: string, item: T): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteItem(storeName: string, id: string): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function clearStore(storeName: string): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
  const queueItem: SyncQueueItem = {
    ...item,
    id: createQueueId(),
    timestamp: Date.now()
  };
  return putItem('sync_queue', queueItem);
}

/** Remove only queue entries that were included in a completed sync batch. */
export function deleteSyncQueueItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return Promise.resolve();
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      ids.forEach(id => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Failed to delete sync queue items'));
    });
  });
}
