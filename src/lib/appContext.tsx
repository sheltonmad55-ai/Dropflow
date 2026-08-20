/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as db from './db.ts';
import { Profile, Caixinha, Venda, Despesa, Produto, Fornecedor, ZonaEntrega, SyncQueueItem, Broadcast, Relatorio, Campanha, DespesaRecorrente, MetaItem, ContaBancaria } from '../types.ts';
import { checkCampaignBudget, startNotificationScheduler, sendNotification } from './notifications.ts';
import { 
  auth, 
  db as fDb,
  loginWithGoogle, 
  pullAllUserData, 
  pushQueueToFirestore,
  cleanUndefined
} from './firebase.ts';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
  setDoc
} from 'firebase/firestore';

interface AppContextType {
  // Auth
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, pais: string, moeda: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  triggerMockUpgrade: () => Promise<void>;

  // Admin and Metas/Relatorios
  isAdmin: boolean;
  broadcasts: Broadcast[];
  relatorios: Relatorio[];
  allProfiles: Profile[];
  addBroadcast: (texto: string, publicoAlvo: 'todos' | 'trial_expira_2d', titulo?: string, link?: string, imagemUrl?: string, tipo?: 'aviso' | 'novidade') => Promise<void>;
  addRelatorio: (tipo: 'diario' | 'semanal' | 'mensal', totalVendido: number, totalGasto: number, balanco: number, progressoMetas: string, metasAtingidas: string[]) => Promise<void>;
  updateUserProfileByAdmin: (targetUserId: string, updates: Partial<Profile>) => Promise<void>;

  // Data State
  caixinhas: Caixinha[];
  contasBancarias: ContaBancaria[];
  vendas: Venda[];
  despesas: Despesa[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  zonasEntrega: ZonaEntrega[];
  campanhas: Campanha[];
  despesasRecorrentes: DespesaRecorrente[];
  metaItems: MetaItem[];

  // Modo Foco / Privacy State
  modoFoco: boolean;
  setModoFoco: (val: boolean) => void;
  toggleModoFoco: () => void;
  formatMoney: (val: number, customMoeda?: string) => string;
  maskValue: (valStr: string) => string;

  // Toast / Notification Popup State
  activeToast: { title: string; body: string; type?: 'success' | 'info' | 'warning' } | null;
  triggerToast: (title: string, body: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: () => void;

  // Sync / Online State
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'offline';
  syncWithServer: () => Promise<void>;

  // Business Actions
  addVenda: (vendaData: Omit<Venda, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) => Promise<void>;
  editVenda: (id: string, updates: Partial<Venda>) => Promise<void>;
  deleteVenda: (id: string) => Promise<void>;
  addDespesa: (despesaData: Omit<Despesa, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) => Promise<void>;
  deleteDespesa: (id: string) => Promise<void>;
  addProduto: (produtoData: Omit<Produto, 'id' | 'user_id' | 'margem' | 'criado_em'>) => Promise<void>;
  editProduto: (id: string, updates: Partial<Produto>) => Promise<void>;
  addFornecedor: (fornecedorData: Omit<Fornecedor, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editFornecedor: (id: string, updates: Partial<Fornecedor>) => Promise<void>;
  addZonaEntrega: (zonaData: Omit<ZonaEntrega, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editZonaEntrega: (id: string, updates: Partial<ZonaEntrega>) => Promise<void>;
  
  // Custom Goals (Metas de Objetivos) Management
  addMetaItem: (metaData: Omit<MetaItem, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editMetaItem: (id: string, updates: Partial<MetaItem>) => Promise<void>;
  deleteMetaItem: (id: string) => Promise<void>;
  alocarParaMetaItem: (id: string, valorMT: number) => Promise<void>;
  
  // Caixinhas management
  addCaixinha: (nome: string, icone: string, cor: string, percentual?: number, auto_distribuir?: boolean) => Promise<void>;
  editCaixinha: (id: string, updates: Partial<Caixinha>) => Promise<void>;
  deleteCaixinha: (id: string) => Promise<void>;
  retirarDaCaixinha: (caixinhaId: string, valor: number, motivo?: string, contaId?: string) => Promise<void>;
  ajustarSaldoCaixinha: (caixinhaId: string, novoSaldo: number) => Promise<void>;

  // Contas Bancarias & Carteiras management
  addContaBancaria: (contaData: Omit<ContaBancaria, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editContaBancaria: (id: string, updates: Partial<ContaBancaria>) => Promise<void>;
  deleteContaBancaria: (id: string) => Promise<void>;
  retirarDaConta: (contaId: string, valor: number, motivo?: string) => Promise<void>;
  transferirEntreContas: (deContaId: string, paraContaId: string, valor: number) => Promise<void>;

  // Campanhas management
  addCampanha: (campanhaData: Omit<Campanha, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editCampanha: (id: string, updates: Partial<Campanha>) => Promise<void>;
  deleteCampanha: (id: string) => Promise<void>;

  // Despesas Recorrentes management
  addDespesaRecorrente: (despesaRecorrenteData: Omit<DespesaRecorrente, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editDespesaRecorrente: (id: string, updates: Partial<DespesaRecorrente>) => Promise<void>;
  deleteDespesaRecorrente: (id: string) => Promise<void>;
  processarDespesaRecorrente: (id: string, dataEfetivacao: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Admin and Metas/Relatorios state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  // App data state
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [zonasEntrega, setZonasEntrega] = useState<ZonaEntrega[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [despesasRecorrentes, setDespesasRecorrentes] = useState<DespesaRecorrente[]>([]);
  const [metaItems, setMetaItems] = useState<MetaItem[]>([]);

  // Modo Foco / Privacy State
  const [modoFoco, setModoFocoState] = useState<boolean>(() => {
    return localStorage.getItem('dropflow_modo_foco') === 'true';
  });

  const setModoFoco = (val: boolean) => {
    setModoFocoState(val);
    localStorage.setItem('dropflow_modo_foco', val ? 'true' : 'false');
  };

  const toggleModoFoco = () => {
    setModoFoco(!modoFoco);
  };

  const formatMoney = (val: number, customMoeda?: string) => {
    const m = customMoeda || profile?.moeda || 'MT';
    if (modoFoco) {
      return `•••••• ${m}`;
    }
    return `${val.toLocaleString()} ${m}`;
  };

  const maskValue = (valStr: string) => {
    if (modoFoco) {
      return '••••••';
    }
    return valStr;
  };

  // Toast / Notification Popup State for Mobile & Desktop
  const [activeToast, setActiveToast] = useState<{ title: string; body: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const triggerToast = (title: string, body: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setActiveToast({ title, body, type });
    // Also dispatch native browser / mobile notification via SW
    sendNotification(title, body);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  // Sync / Online state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'offline'>(
    navigator.onLine ? 'synced' : 'offline'
  );

  // Ref to track active Firestore subscriptions for clean-up
  const unsubscribesRef = useRef<(() => void)[]>([]);

  type PendingMutation = Omit<SyncQueueItem, 'id' | 'timestamp'>;
  type PendingMutationState = PendingMutation & { version: number };
  const pendingMutationsRef = useRef<Map<string, PendingMutationState>>(new Map());
  const mutationVersionRef = useRef(0);
  const syncPromiseRef = useRef<Promise<void> | null>(null);

  const mutationKey = (type: SyncQueueItem['type'], id: string) => `${type}:${id}`;

  async function enqueueMutation(item: PendingMutation) {
    const id = item.data?.id;
    if (id) {
      const version = ++mutationVersionRef.current;
      pendingMutationsRef.current.set(mutationKey(item.type, id), { ...item, version });
    }
    await db.addToSyncQueue(item);
  }

  function acknowledgeCollectionSnapshot<T extends { id: string }>(type: SyncQueueItem['type'], remoteData: T[]) {
    const remoteById = new Map(remoteData.map(item => [item.id, item]));
    pendingMutationsRef.current.forEach((mutation, key) => {
      if (mutation.type !== type || !mutation.data?.id) return;
      const remote = remoteById.get(mutation.data.id);
      const matches = mutation.action === 'delete'
        ? !remote
        : !!remote && JSON.stringify(remote) === JSON.stringify(mutation.data);
      if (matches) pendingMutationsRef.current.delete(key);
    });
  }

  function acknowledgeDocumentSnapshot<T extends { id: string }>(type: SyncQueueItem['type'], remoteData: T | null) {
    if (!remoteData?.id) return;
    const key = mutationKey(type, remoteData.id);
    const mutation = pendingMutationsRef.current.get(key);
    if (!mutation) return;
    const matches = mutation.action !== 'delete' && JSON.stringify(remoteData) === JSON.stringify(mutation.data);
    if (matches) pendingMutationsRef.current.delete(key);
  }

  function reconcileCollection<T extends { id: string }>(
    type: SyncQueueItem['type'],
    remoteData: T[],
    localData: T[]
  ): T[] {
    const result = new Map(remoteData.map(item => [item.id, item]));

    pendingMutationsRef.current.forEach((mutation, key) => {
      if (mutation.type !== type || !mutation.data?.id) return;
      if (mutation.action === 'delete') {
        result.delete(mutation.data.id);
      } else {
        result.set(mutation.data.id, mutation.data as T);
      }
      // Keep a local record that has not reached the server yet, including creates.
      if (mutation.action !== 'delete' && !result.has(mutation.data.id)) {
        const local = localData.find(item => item.id === mutation.data.id);
        if (local) result.set(local.id, local);
      }
    });

    return Array.from(result.values());
  }

  function reconcileDocument<T extends { id: string }>(
    type: SyncQueueItem['type'],
    remoteData: T | null,
    localData: T | null
  ): T | null {
    if (!remoteData && !localData) return null;
    const id = remoteData?.id || localData?.id;
    if (!id) return remoteData || localData;
    const pending = pendingMutationsRef.current.get(mutationKey(type, id));
    if (!pending) return remoteData || localData;
    return pending.action === 'delete' ? null : (pending.data as T);
  }

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('pending');
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  // Load initial local data once authenticated and listen to Firebase Auth / Firestore real-time snapshots
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clear any previous subscriptions first
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];

      if (user) {
        try {
          pendingMutationsRef.current.clear();
          const freshToken = await user.getIdToken();
          setToken(freshToken);
          localStorage.setItem('dropflow_token', freshToken);

          // Try to load cached profile immediately for instant rendering
          const cachedProfileStr = localStorage.getItem('dropflow_profile');
          if (cachedProfileStr) {
            try {
              const cachedProfile = JSON.parse(cachedProfileStr);
              if (cachedProfile?.id === user.uid) {
                setProfile(cachedProfile);
                setIsAuthenticated(true);
                setIsLoadingAuth(false); // Speed optimization for immediate UI rendering
              } else {
                localStorage.removeItem('dropflow_profile');
              }
            } catch (err) {
              console.error("Error parsing cached profile:", err);
            }
          }

          // Pre-populate state from IndexedDB instantly to guarantee zero-flicker offline rendering
          await loadAllLocalData(user.uid);

          // 1. Listen to user profile document
          const unsubProfile = onSnapshot(doc(fDb, 'profiles', user.uid), (snapshot) => {
            if (snapshot.exists()) {
              const profileData = snapshot.data() as Profile;
              acknowledgeDocumentSnapshot('profile', profileData);
              const reconciledProfile = reconcileDocument('profile', profileData, profileRef.current);
              if (reconciledProfile) {
                setProfile(reconciledProfile);
                localStorage.setItem('dropflow_profile', JSON.stringify(reconciledProfile));
                void db.putItem('profiles', reconciledProfile);
              }
              setIsAuthenticated(true);
            } else {
              setProfile(null);
            }
            setIsLoadingAuth(false);
          }, (error) => {
            console.error("Profile real-time listener error:", error);
            setIsLoadingAuth(false);
          });
          unsubscribesRef.current.push(unsubProfile);

          // 2. Listen to user caixinhas collection
          const unsubCaixinhas = onSnapshot(
            query(collection(fDb, 'caixinhas'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Caixinha);
              acknowledgeCollectionSnapshot('caixinha', data);
              const reconciled = reconcileCollection('caixinha', data, caixinhas);
              setCaixinhas(reconciled);
              void db.clearStore('caixinhas').then(() => {
                reconciled.forEach(item => void db.putItem('caixinhas', item));
              });
            },
            (error) => console.error("Caixinhas real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubCaixinhas);

          // 3. Listen to user vendas collection
          const unsubVendas = onSnapshot(
            query(collection(fDb, 'vendas'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Venda);
              acknowledgeCollectionSnapshot('venda', data);
              const reconciled = reconcileCollection('venda', data, vendas);
              setVendas(reconciled.sort((a, b) => b.data_venda.localeCompare(a.data_venda)));
              void db.clearStore('vendas').then(() => {
                reconciled.forEach(item => void db.putItem('vendas', item));
              });
            },
            (error) => console.error("Vendas real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubVendas);

          // 4. Listen to user despesas collection
          const unsubDespesas = onSnapshot(
            query(collection(fDb, 'despesas'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Despesa);
              acknowledgeCollectionSnapshot('despesa', data);
              const reconciled = reconcileCollection('despesa', data, despesas);
              setDespesas(reconciled.sort((a, b) => b.data.localeCompare(a.data)));
              void db.clearStore('despesas').then(() => {
                reconciled.forEach(item => void db.putItem('despesas', item));
              });
            },
            (error) => console.error("Despesas real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubDespesas);

          // 5. Listen to user produtos collection
          const unsubProdutos = onSnapshot(
            query(collection(fDb, 'produtos'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Produto);
              acknowledgeCollectionSnapshot('produto', data);
              const reconciled = reconcileCollection('produto', data, produtos);
              setProdutos(reconciled);
              void db.clearStore('produtos').then(() => {
                reconciled.forEach(item => void db.putItem('produtos', item));
              });
            },
            (error) => console.error("Produtos real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubProdutos);

          // 6. Listen to user fornecedores collection
          const unsubFornecedores = onSnapshot(
            query(collection(fDb, 'fornecedores'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Fornecedor);
              acknowledgeCollectionSnapshot('fornecedor', data);
              const reconciled = reconcileCollection('fornecedor', data, fornecedores);
              setFornecedores(reconciled);
              void db.clearStore('fornecedores').then(() => {
                reconciled.forEach(item => void db.putItem('fornecedores', item));
              });
            },
            (error) => console.error("Fornecedores real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubFornecedores);

          // 7. Listen to user zonas_entrega collection
          const unsubZonas = onSnapshot(
            query(collection(fDb, 'zonas_entrega'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as ZonaEntrega);
              acknowledgeCollectionSnapshot('zona', data);
              const reconciled = reconcileCollection('zona', data, zonasEntrega);
              setZonasEntrega(reconciled);
              void db.clearStore('zonas_entrega').then(() => {
                reconciled.forEach(item => void db.putItem('zonas_entrega', item));
              });
            },
            (error) => console.error("Zonas real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubZonas);

          // 7.5. Listen to user campanhas collection
          const unsubCampanhas = onSnapshot(
            query(collection(fDb, 'campanhas'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as Campanha);
              acknowledgeCollectionSnapshot('campanha', data);
              const reconciled = reconcileCollection('campanha', data, campanhas);
              setCampanhas(reconciled.sort((a, b) => b.data.localeCompare(a.data)));
              void db.clearStore('campanhas').then(() => {
                reconciled.forEach(item => void db.putItem('campanhas', item));
              });
            },
            (error) => console.error("Campanhas real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubCampanhas);

          // 7.6. Listen to user despesas_recorrentes collection
          const unsubDespesasRecorrentes = onSnapshot(
            query(collection(fDb, 'despesas_recorrentes'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as DespesaRecorrente);
              acknowledgeCollectionSnapshot('despesa_recorrente', data);
              const reconciled = reconcileCollection('despesa_recorrente', data, despesasRecorrentes);
              setDespesasRecorrentes(reconciled);
              void db.clearStore('despesas_recorrentes').then(() => {
                reconciled.forEach(item => void db.putItem('despesas_recorrentes', item));
              });
            },
            (error) => console.error("DespesasRecorrentes real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubDespesasRecorrentes);

          // 7.7. Listen to user meta_items collection
          const unsubMetaItems = onSnapshot(
            query(collection(fDb, 'meta_items'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as MetaItem);
              acknowledgeCollectionSnapshot('meta_item', data);
              const reconciled = reconcileCollection('meta_item', data, metaItems);
              setMetaItems(reconciled.sort((a, b) => b.criado_em.localeCompare(a.criado_em)));
              void db.clearStore('meta_items').then(() => {
                reconciled.forEach(item => void db.putItem('meta_items', item));
              });
            },
            (error) => console.error("MetaItems real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubMetaItems);

          // 7.8. Listen to user contas_bancarias collection
          const unsubContasBancarias = onSnapshot(
            query(collection(fDb, 'contas_bancarias'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as ContaBancaria);
              acknowledgeCollectionSnapshot('conta_bancaria', data);
              const reconciled = reconcileCollection('conta_bancaria', data, contasBancarias);
              const seededKey = `dropflow_contas_seeded_${user.uid}`;
              const hasSeeded = localStorage.getItem(seededKey) === 'true';

              if (reconciled.length === 0 && !hasSeeded) {
                localStorage.setItem(seededKey, 'true');
                seedDefaultContas(user.uid);
              } else {
                if (reconciled.length > 0) {
                  localStorage.setItem(seededKey, 'true');
                }
                setContasBancarias(reconciled);
                void db.clearStore('contas_bancarias').then(() => {
                  reconciled.forEach(item => void db.putItem('contas_bancarias', item));
                });
              }
            },
            (error) => console.error("ContasBancarias real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubContasBancarias);

          // 8. Listen to broadcasts collection
          const unsubBroadcasts = onSnapshot(
            collection(fDb, 'broadcasts'),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as any);
              setBroadcasts(data.sort((a, b) => (b.criado_em || '').localeCompare(a.criado_em || '')));
            },
            (error) => console.error("Broadcasts real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubBroadcasts);

          // 9. Listen to relatorios collection
          const unsubRelatorios = onSnapshot(
            query(collection(fDb, 'relatorios'), where('user_id', '==', user.uid)),
            (snapshot) => {
              const data = snapshot.docs.map(doc => doc.data() as any);
              setRelatorios(data.sort((a, b) => (b.data_geracao || '').localeCompare(a.data_geracao || '')));
            },
            (error) => console.error("Relatorios real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubRelatorios);

          // 10. Check if Admin and listen to all profiles
          const idTokenResult = await user.getIdTokenResult();
          const isAdminUser = user.email === 'sheltonmad55@gmail.com' || !!idTokenResult.claims.admin;
          setIsAdmin(isAdminUser);

          if (isAdminUser) {
            const unsubAllProfiles = onSnapshot(
              collection(fDb, 'profiles'),
              (snapshot) => {
                const data = snapshot.docs.map(doc => doc.data() as Profile);
                setAllProfiles(data.sort((a, b) => (b.criado_em || '').localeCompare(a.criado_em || '')));
              },
              (error) => console.error("AllProfiles real-time listener error:", error)
            );
            unsubscribesRef.current.push(unsubAllProfiles);
          }

        } catch (e) {
          console.error("Error setting up real-time sync:", e);
          setIsLoadingAuth(false);
        }
      } else {
        pendingMutationsRef.current.clear();
        setToken(null);
        setProfile(null);
        setIsAdmin(false);
        setBroadcasts([]);
        setRelatorios([]);
        setAllProfiles([]);
        setCaixinhas([]);
        setVendas([]);
        setDespesas([]);
        setProdutos([]);
        setFornecedores([]);
        setZonasEntrega([]);
        setCampanhas([]);
        setIsAuthenticated(false);
        localStorage.removeItem('dropflow_token');
        localStorage.removeItem('dropflow_profile');

        // Clear local IndexedDB safely to prevent profile/data leakage between account sign-ins
        try {
          await db.clearStore('profiles');
          await db.clearStore('caixinhas');
          await db.clearStore('vendas');
          await db.clearStore('despesas');
          await db.clearStore('produtos');
          await db.clearStore('fornecedores');
          await db.clearStore('zonas_entrega');
          await db.clearStore('campanhas');
          await db.clearStore('despesas_recorrentes');
          await db.clearStore('sync_queue');
        } catch (err) {
          console.error("Error clearing IndexedDB on logout:", err);
        }

        setIsLoadingAuth(false);
      }
    });

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];
      unsubscribe();
    };
  }, []);

  // Whenever user becomes authenticated, push offline edits
  useEffect(() => {
    if (isAuthenticated && profile) {
      if (navigator.onLine) {
        syncWithServer();
      }
      // Schedule periodic background synchronization for offline queue pushing
      const interval = setInterval(() => {
        if (navigator.onLine) {
          syncWithServer();
        }
      }, 20000); // sync every 20s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, profile?.id]);

  const vendasRef = useRef(vendas);
  const profileRef = useRef(profile);

  useEffect(() => {
    vendasRef.current = vendas;
  }, [vendas]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Start local notification scheduler for daily sales goal reminders
  useEffect(() => {
    if (isAuthenticated && profile) {
      const cleanup = startNotificationScheduler(
        () => vendasRef.current,
        () => profileRef.current
      );
      return cleanup;
    }
  }, [isAuthenticated, profile?.id]);

  const previousMetGoalsRef = useRef<{
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    profileId: string | null;
  }>({
    daily: false,
    weekly: false,
    monthly: false,
    profileId: null
  });

  // Watch sales progress in real-time to alert the user via local browser notifications when a goal is achieved/exceeded
  useEffect(() => {
    if (!profile) {
      previousMetGoalsRef.current = { daily: false, weekly: false, monthly: false, profileId: null };
      return;
    }

    // 1. Daily Goal Calculations
    const goalDailyVal = profile.metaDiaria || 0;
    const pDiaria = profile.periodoDiaria || 1;
    const startDaily = new Date();
    startDaily.setHours(0, 0, 0, 0);
    startDaily.setDate(startDaily.getDate() - (pDiaria - 1));

    const salesDaily = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startDaily;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const isDailyMet = goalDailyVal > 0 && salesDaily >= goalDailyVal;

    // 2. Weekly Goal Calculations
    const goalWeeklyVal = profile.metaSemanal || 0;
    const pSemanal = profile.periodoSemanal || 1;
    const getStartOfWeek = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const m = new Date(d.setDate(diff));
      m.setHours(0, 0, 0, 0);
      return m;
    };
    const mondayDate = getStartOfWeek();
    const startWeekly = new Date(mondayDate);
    startWeekly.setDate(mondayDate.getDate() - (pSemanal - 1) * 7);

    const salesWeekly = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startWeekly;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const isWeeklyMet = goalWeeklyVal > 0 && salesWeekly >= goalWeeklyVal;

    // 3. Monthly Goal Calculations
    const goalMonthlyVal = profile.metaMensal || 0;
    const pMensal = profile.periodoMensal || 1;
    const now = new Date();
    const startMonthly = new Date(now.getFullYear(), now.getMonth() - (pMensal - 1), 1, 0, 0, 0, 0);

    const salesMonthly = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startMonthly;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const isMonthlyMet = goalMonthlyVal > 0 && salesMonthly >= goalMonthlyVal;

    // If it's the initial load for this profile, initialize ref silently to avoid spamming alerts on page refresh
    if (previousMetGoalsRef.current.profileId !== profile.id) {
      previousMetGoalsRef.current = {
        daily: isDailyMet,
        weekly: isWeeklyMet,
        monthly: isMonthlyMet,
        profileId: profile.id
      };
      return;
    }

    // Subsequent changes: trigger notifications and sound effect when any goal state shifts from incomplete to achieved
    const dailyJustMet = isDailyMet && !previousMetGoalsRef.current.daily;
    const weeklyJustMet = isWeeklyMet && !previousMetGoalsRef.current.weekly;
    const monthlyJustMet = isMonthlyMet && !previousMetGoalsRef.current.monthly;

    if (dailyJustMet || weeklyJustMet || monthlyJustMet) {
      import('./notifications.ts').then(({ sendNotification }) => {
        let msg = '';
        const currency = profile.moeda || 'MT';
        
        if (dailyJustMet) {
          msg = `A sua Meta Diária de ${goalDailyVal.toLocaleString()} ${currency} foi atingida com sucesso! Faturamento atual: ${salesDaily.toLocaleString()} ${currency}. 🎉`;
          sendNotification("Meta Diária Alcançada! 🎉", msg);
        }
        if (weeklyJustMet) {
          msg = `Espetacular! A sua Meta Semanal de ${goalWeeklyVal.toLocaleString()} ${currency} foi superada! Faturamento atual: ${salesWeekly.toLocaleString()} ${currency}. 🚀`;
          sendNotification("Meta Semanal Alcançada! 🚀", msg);
        }
        if (monthlyJustMet) {
          msg = `Histórico! A sua Meta Mensal de ${goalMonthlyVal.toLocaleString()} ${currency} foi batida! Faturamento atual: ${salesMonthly.toLocaleString()} ${currency}. 🏆`;
          sendNotification("Meta Mensal Alcançada! 🏆", msg);
        }

        // Play the cash register celebration sound
        import('./audio.ts').then(({ playCashRegister }) => {
          playCashRegister(profile.ativarSons !== false && profile.somMetas !== false);
        });
      });
    }

    // Keep ref values synchronized
    previousMetGoalsRef.current = {
      daily: isDailyMet,
      weekly: isWeeklyMet,
      monthly: isMonthlyMet,
      profileId: profile.id
    };
  }, [
    vendas,
    profile?.id,
    profile?.metaDiaria,
    profile?.metaSemanal,
    profile?.metaMensal,
    profile?.periodoDiaria,
    profile?.periodoSemanal,
    profile?.periodoMensal,
    profile?.moeda,
    profile?.ativarSons,
    profile?.somMetas
  ]);

  async function loadAllLocalData(userId: string) {
    try {
      const [
        dbProfiles,
        dbCaixinhas,
        dbVendas,
        dbDespesas,
        dbProdutos,
        dbFornecedores,
        dbZonas,
        dbCampanhas,
        dbDespesasRecorrentes,
        dbMetaItems,
        dbContas,
        queue
      ] = await Promise.all([
        db.getAll<Profile>('profiles'),
        db.getAll<Caixinha>('caixinhas'),
        db.getAll<Venda>('vendas'),
        db.getAll<Despesa>('despesas'),
        db.getAll<Produto>('produtos'),
        db.getAll<Fornecedor>('fornecedores'),
        db.getAll<ZonaEntrega>('zonas_entrega'),
        db.getAll<Campanha>('campanhas'),
        db.getAll<DespesaRecorrente>('despesas_recorrentes'),
        db.getAll<MetaItem>('meta_items'),
        db.getAll<ContaBancaria>('contas_bancarias'),
        db.getAll<SyncQueueItem>('sync_queue')
      ]);

      const currentUserProfile = dbProfiles.find(p => p.id === userId);
      if (currentUserProfile) {
        setProfile(currentUserProfile);
      }

      // Restore the latest local mutations before real-time listeners start.
      // This prevents a cached/old Firestore snapshot from flashing over a
      // change that is still waiting for its first successful sync.
      const latestPending = new Map<string, SyncQueueItem>();
      queue
        .filter(item => item.data?.user_id === userId || (item.type === 'profile' && item.data?.id === userId))
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(item => {
          if (item.data?.id) latestPending.set(mutationKey(item.type, item.data.id), item);
        });
      pendingMutationsRef.current.clear();
      latestPending.forEach((item, key) => {
        pendingMutationsRef.current.set(key, { ...item, version: ++mutationVersionRef.current });
      });

      setCaixinhas(dbCaixinhas.filter(c => c.user_id === userId));
      const userContas = dbContas.filter(c => c.user_id === userId);
      const seededKey = `dropflow_contas_seeded_${userId}`;
      const hasSeeded = localStorage.getItem(seededKey) === 'true';

      if (userContas.length > 0) {
        localStorage.setItem(seededKey, 'true');
        setContasBancarias(userContas);
      } else if (!hasSeeded) {
        localStorage.setItem(seededKey, 'true');
        seedDefaultContas(userId);
      } else {
        setContasBancarias([]);
      }
      setVendas(dbVendas.filter(v => v.user_id === userId).sort((a,b) => b.data_venda.localeCompare(a.data_venda)));
      setDespesas(dbDespesas.filter(d => d.user_id === userId).sort((a,b) => b.data.localeCompare(a.data)));
      setProdutos(dbProdutos.filter(p => p.user_id === userId));
      setFornecedores(dbFornecedores.filter(f => f.user_id === userId));
      setZonasEntrega(dbZonas.filter(z => z.user_id === userId));
      setCampanhas(dbCampanhas.filter(c => c.user_id === userId).sort((a,b) => b.data.localeCompare(a.data)));
      setDespesasRecorrentes(dbDespesasRecorrentes.filter(dr => dr.user_id === userId));
      setMetaItems(dbMetaItems.filter(m => m.user_id === userId).sort((a,b) => b.criado_em.localeCompare(a.criado_em)));

      if (queue.length > 0) {
        setSyncStatus('pending');
      }
    } catch (e) {
      console.error('Error loading local offline database:', e);
    }
  }

  async function seedDefaultContas(userId: string) {
    const defaults: ContaBancaria[] = [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        nome: 'e-Mola',
        tipo: 'carteira_movel',
        saldo_atual: 0,
        cor: 'bg-amber-500',
        editavel: true,
        status_liberdade: 'livre',
        criado_em: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        nome: 'M-Pesa',
        tipo: 'carteira_movel',
        saldo_atual: 0,
        cor: 'bg-rose-500',
        editavel: true,
        status_liberdade: 'livre',
        criado_em: new Date().toISOString()
      }
    ];

    setContasBancarias(defaults);
    for (const c of defaults) {
      await db.putItem('contas_bancarias', c);
      await enqueueMutation({ type: 'conta_bancaria', action: 'create', data: c });
    }
  }

  // Auth operations via Firebase Auth & Firestore
  async function login(email: string, password: string) {
    setIsLoadingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Real-time onAuthStateChanged will handle profile retrieval and loading states
    } catch (e: any) {
      setIsLoadingAuth(false);
      throw e;
    }
  }

  async function register(email: string, password: string, nome: string, pais: string, moeda: string) {
    setIsLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Default initial plan to expired/payment pending
      const newProfile: Profile = {
        id: user.uid,
        nome,
        pais: pais || 'Moçambique',
        moeda: moeda || 'MT',
        plano: 'expired',
        trial_expires_at: new Date().toISOString(),
        anuncios_percent: 50,
        lucro_percent: 50,
        criado_em: new Date().toISOString()
      };

      // Create default Pockets (Caixinhas)
      const defaultCaixinhas: Caixinha[] = [
        {
          id: crypto.randomUUID(),
          user_id: user.uid,
          nome: 'Lucro',
          icone: 'TrendingUp',
          cor: 'bg-emerald-500',
          tipo: 'lucro',
          saldo_atual: 0,
          criado_em: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          user_id: user.uid,
          nome: 'Anúncios',
          icone: 'Megaphone',
          cor: 'bg-sky-500',
          tipo: 'anuncios',
          saldo_atual: 0,
          criado_em: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          user_id: user.uid,
          nome: 'Produtos/Fornecedores',
          icone: 'Package',
          cor: 'bg-amber-500',
          tipo: 'fornecedores',
          saldo_atual: 0,
          criado_em: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          user_id: user.uid,
          nome: 'Delivery',
          icone: 'Truck',
          cor: 'bg-indigo-500',
          tipo: 'delivery',
          saldo_atual: 0,
          criado_em: new Date().toISOString()
        }
      ];

      // Save to Firestore
      await pushQueueToFirestore([
        { type: 'profile', action: 'create', data: newProfile },
        ...defaultCaixinhas.map(cx => ({ type: 'caixinha', action: 'create', data: cx }))
      ]);

      // Save to local IndexedDB to match immediately
      await db.putItem('profiles', newProfile);
      for (const cx of defaultCaixinhas) {
        await db.putItem('caixinhas', cx);
      }

      // Real-time onAuthStateChanged will handle setting isAuthenticated = true
    } catch (e: any) {
      setIsLoadingAuth(false);
      throw e;
    }
  }

  async function loginGoogle() {
    setIsLoadingAuth(true);
    try {
      const user = await loginWithGoogle();
      const freshToken = await user.getIdToken();

      // Check if user already has a profile in Firestore
      const data = await pullAllUserData(user.uid);
      let userProfile = data.profile as Profile | null;
      let userCaixinhas = data.caixinhas as Caixinha[];

      if (!userProfile) {
        // If not, register a new profile with Google's details (default to payment pending/expired)
        userProfile = {
          id: user.uid,
          nome: user.displayName || 'Empreendedor Google',
          pais: 'Moçambique',
          moeda: 'MT',
          plano: 'expired',
          trial_expires_at: new Date().toISOString(),
          anuncios_percent: 50,
          lucro_percent: 50,
          criado_em: new Date().toISOString()
        };

        userCaixinhas = [
          {
            id: crypto.randomUUID(),
            user_id: user.uid,
            nome: 'Lucro',
            icone: 'TrendingUp',
            cor: 'bg-emerald-500',
            tipo: 'lucro',
            saldo_atual: 0,
            criado_em: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            user_id: user.uid,
            nome: 'Anúncios',
            icone: 'Megaphone',
            cor: 'bg-sky-500',
            tipo: 'anuncios',
            saldo_atual: 0,
            criado_em: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            user_id: user.uid,
            nome: 'Produtos/Fornecedores',
            icone: 'Package',
            cor: 'bg-amber-500',
            tipo: 'fornecedores',
            saldo_atual: 0,
            criado_em: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            user_id: user.uid,
            nome: 'Delivery',
            icone: 'Truck',
            cor: 'bg-indigo-500',
            tipo: 'delivery',
            saldo_atual: 0,
            criado_em: new Date().toISOString()
          }
        ];

        // Save new user profile and default pockets to Firestore
        await pushQueueToFirestore([
          { type: 'profile', action: 'create', data: userProfile },
          ...userCaixinhas.map(cx => ({ type: 'caixinha', action: 'create', data: cx }))
        ]);
      }

      // Save user profile and tables locally in IndexedDB
      await db.putItem('profiles', userProfile);
      for (const cx of userCaixinhas) {
        await db.putItem('caixinhas', cx);
      }

      // Real-time onAuthStateChanged will handle loading data and setting isAuthenticated = true
    } catch (e: any) {
      setIsLoadingAuth(false);
      throw e;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out from Firebase Auth:", e);
    }
    localStorage.removeItem('dropflow_token');
    localStorage.removeItem('dropflow_profile');
    setToken(null);
    setProfile(null);
    setIsAuthenticated(false);
    setCaixinhas([]);
    setVendas([]);
    setDespesas([]);
    setProdutos([]);
    setFornecedores([]);
    setZonasEntrega([]);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('dropflow_profile', JSON.stringify(updated));

    await db.putItem('profiles', updated);
    await enqueueMutation({
      type: 'profile',
      action: 'update',
      data: updated
    });
    setSyncStatus('pending');
    syncWithServer();
  }

  async function triggerMockUpgrade() {
    if (!profile) return;
    await updateProfile({ plano: 'pro' });
  }

  async function addBroadcast(texto: string, publicoAlvo: 'todos' | 'trial_expira_2d', titulo?: string, link?: string, imagemUrl?: string, tipo?: 'aviso' | 'novidade') {
    if (!profile) return;
    const newBroadcast = {
      id: crypto.randomUUID(),
      texto,
      publico_alvo: publicoAlvo,
      criado_em: new Date().toISOString(),
      titulo,
      link,
      imagem_url: imagemUrl,
      tipo: tipo || 'aviso'
    };
    try {
      await setDoc(doc(fDb, 'broadcasts', newBroadcast.id), cleanUndefined(newBroadcast));
      await setDoc(doc(collection(fDb, 'admin_logs')), {
        adminEmail: auth.currentUser?.email || 'admin',
        acao: `Criou aviso: "${texto}" para público: ${publicoAlvo}`,
        utilizadorAfetado: 'Todos',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error creating broadcast:", e);
      throw e;
    }
  }

  async function addRelatorio(tipo: 'diario' | 'semanal' | 'mensal', totalVendido: number, totalGasto: number, balanco: number, progressoMetas: string, metasAtingidas: string[]) {
    if (!profile) return;
    const newRelatorio = {
      id: crypto.randomUUID(),
      user_id: auth.currentUser?.uid || profile.id,
      tipo,
      data_geracao: new Date().toISOString(),
      total_vendido: totalVendido,
      total_gasto: totalGasto,
      balanco,
      progresso_metas: progressoMetas,
      metas_atingidas: metasAtingidas,
      lido: false
    };
    try {
      await setDoc(doc(fDb, 'relatorios', newRelatorio.id), newRelatorio);
    } catch (e) {
      console.error("Error creating report:", e);
      throw e;
    }
  }

  async function updateUserProfileByAdmin(targetUserId: string, updates: Partial<Profile>) {
    if (!profile || !isAdmin) return;
    try {
      await setDoc(doc(fDb, 'profiles', targetUserId), cleanUndefined(updates), { merge: true });
      await setDoc(doc(collection(fDb, 'admin_logs')), {
        adminEmail: auth.currentUser?.email || 'admin',
        acao: `Alterou perfil de ${targetUserId}: ${JSON.stringify(updates)}`,
        utilizadorAfetado: targetUserId,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error updating user profile by admin:", e);
      throw e;
    }
  }

  // Real-time server pushing engine for offline writes
  async function syncWithServer() {
    if (syncPromiseRef.current) return syncPromiseRef.current;
    if (!token || !profile || !navigator.onLine || !auth.currentUser) {
      return;
    }

    let shouldRetry = false;
    const run = (async () => {
      setSyncStatus('syncing');
      try {
        const queue = await db.getAll<SyncQueueItem>('sync_queue');
        if (queue.length === 0) {
          setSyncStatus('synced');
          return;
        }

        // IndexedDB is shared by browser sessions. Never send another user's
        // queued mutation in the current user's batch: one unauthorized write
        // would reject the entire Firestore batch and make every balance appear
        // to roll back locally.
        const currentUserId = auth.currentUser.uid;
        const ownedQueue = queue.filter(item =>
          item.data?.user_id === currentUserId
          || (item.type === 'profile' && item.data?.id === currentUserId)
        );
        // Keep another user's queue intact for a possible later sign-in, but
        // quarantine malformed legacy entries that have no owner at all.
        const malformedQueueIds = queue
          .filter(item => !item.data?.user_id && !(item.type === 'profile' && item.data?.id))
          .map(item => item.id);
        await db.deleteSyncQueueItems(malformedQueueIds);

        if (ownedQueue.length === 0) {
          setSyncStatus('synced');
          return;
        }

        // Keep only the latest mutation per document; older snapshots cannot win later.
        const latestByDocument = new Map<string, SyncQueueItem>();
        ownedQueue
          .sort((a, b) => a.timestamp - b.timestamp)
          .forEach(item => {
            if (item.data?.id) {
              latestByDocument.set(mutationKey(item.type, item.data.id), item);
            }
          });
        const compactedQueue = Array.from(latestByDocument.values());
        const syncResult = await pushQueueToFirestore(compactedQueue);
        const successfulQueueIds = new Set(syncResult.successfulIds);
        // Remove only mutations confirmed by Firestore. Failed items remain
        // visible locally and can be retried after their owner is corrected.
        await db.deleteSyncQueueItems(
          ownedQueue
            .filter(item => successfulQueueIds.has(item.id))
            .map(item => item.id)
        );

        const remaining = await db.getAll<SyncQueueItem>('sync_queue');
        shouldRetry = syncResult.failedIds.length > 0 || remaining.some(item =>
          item.data?.user_id === currentUserId
          || (item.type === 'profile' && item.data?.id === currentUserId)
        );
        setSyncStatus(shouldRetry ? 'pending' : 'synced');
      } catch (e) {
        console.error('Synchronization failed (retrying later):', e);
        setSyncStatus('pending');
      }
    })();

    syncPromiseRef.current = run;
    void run.finally(() => {
      syncPromiseRef.current = null;
      if (shouldRetry && navigator.onLine) {
        window.setTimeout(() => void syncWithServer(), 250);
      }
    });
    return run;
  }

  // CORE BUSINESS ACTION: ADD SALE (AUTOMATIC POCKET DISTRIBUTION)
  async function addVenda(vendaData: Omit<Venda, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) {
    if (!profile) return;
    const userId = auth.currentUser?.uid || profile.id;
    const vendaId = crypto.randomUUID();

    const value = vendaData.valor_recebido;
    const qty = vendaData.quantidade || 1;
    
    // Find selected product
    const product = produtos.find(p => p.id === vendaData.produto_id);
    const purchaseCost = (product ? product.preco_compra : 0) * qty;

    // Find selected delivery zone
    const zone = zonasEntrega.find(z => z.id === vendaData.zona_entrega_id);
    const shippingCost = zone ? zone.custo : 0;

    // Check supplier type (imported vs local)
    const supplierId = vendaData.fornecedor_id || (product ? product.fornecedor_id : '');
    const supplier = fornecedores.find(f => f.id === supplierId);
    const isLocalSupplier = supplier?.tipo_origem === 'local';

    // Find relevant standard pockets (Caixinhas)
    const lucrosCx = caixinhas.find(c => c.tipo === 'lucro');
    const anunciosCx = caixinhas.find(c => c.tipo === 'anuncios');
    const fornecedoresCx = caixinhas.find(c => c.tipo === 'fornecedores');
    const deliveryCx = caixinhas.find(c => c.tipo === 'delivery');

    const distribution: { [id: string]: number } = {};

    // 1. Reserve product purchase price for Suppliers pocket (ONLY for imported items, local items return directly to main account)
    if (fornecedoresCx && !isLocalSupplier) {
      distribution[fornecedoresCx.id] = purchaseCost;
    } else if (fornecedoresCx && isLocalSupplier) {
      distribution[fornecedoresCx.id] = 0;
    }

    // 2. Reserve shipping cost for Delivery pocket
    if (deliveryCx) {
      distribution[deliveryCx.id] = shippingCost;
    }

    // 3. Distribute remainder: local purchases do not subtract cost from distribution remainder
    const remainder = isLocalSupplier 
      ? (value - shippingCost) 
      : (value - purchaseCost - shippingCost);
    let availableRemainder = remainder;

    if (remainder > 0) {
      const activePockets = caixinhas.filter(c => 
        c.tipo === 'lucro' || 
        c.tipo === 'anuncios' || 
        (c.tipo === 'personalizado' && c.auto_distribuir)
      );

      // A. Process Fixed allocations first
      activePockets.forEach(cx => {
        if (cx.distribuicao_modo === 'fixo' && cx.valor_distribuicao && cx.valor_distribuicao > 0) {
          const amt = Math.min(availableRemainder, cx.valor_distribuicao);
          distribution[cx.id] = amt;
          availableRemainder -= amt;
        }
      });

      // B. Process Percentage allocations for the rest of the available remainder
      const pctPockets = activePockets.filter(cx => 
        cx.distribuicao_modo !== 'fixo' || !cx.valor_distribuicao
      );

      if (pctPockets.length > 0 && availableRemainder > 0) {
        // Sum total percentage points requested
        const totalPct = pctPockets.reduce((sum, cx) => {
          if (cx.tipo === 'lucro') {
            return sum + (profile.lucro_percent || 50);
          } else if (cx.tipo === 'anuncios') {
            const adsPercent = vendaData.custom_anuncios_percent !== undefined ? vendaData.custom_anuncios_percent : (profile.anuncios_percent || 50);
            return sum + adsPercent;
          } else {
            return sum + (cx.valor_distribuicao || cx.percentual_padrao || 0);
          }
        }, 0);

        if (totalPct > 0) {
          let allocatedPctSum = 0;
          pctPockets.forEach((cx, idx) => {
            let cxPct = 0;
            if (cx.tipo === 'lucro') {
              cxPct = profile.lucro_percent || 50;
            } else if (cx.tipo === 'anuncios') {
              cxPct = vendaData.custom_anuncios_percent !== undefined ? vendaData.custom_anuncios_percent : (profile.anuncios_percent || 50);
            } else {
              cxPct = cx.valor_distribuicao || cx.percentual_padrao || 0;
            }

            let amt = 0;
            if (idx === pctPockets.length - 1) {
              amt = Math.round(availableRemainder * 100) / 100;
            } else {
              amt = Math.round(availableRemainder * (cxPct / totalPct) * 100) / 100;
            }
            distribution[cx.id] = (distribution[cx.id] || 0) + amt;
            allocatedPctSum += amt;
          });
          availableRemainder = Math.max(0, availableRemainder - allocatedPctSum);
        }
      }
    } else {
      // In case of loss or negative margin, write 0 to auto-distribute pockets
      const activePockets = caixinhas.filter(c => 
        c.tipo === 'lucro' || 
        c.tipo === 'anuncios' || 
        (c.tipo === 'personalizado' && c.auto_distribuir)
      );
      activePockets.forEach(cx => {
        distribution[cx.id] = 0;
      });
    }

    // Prepare full venda object
    const newVenda: Venda = {
      ...vendaData,
      id: vendaId,
      user_id: userId,
      fornecedor_id: supplierId,
      custo_compra_total: purchaseCost,
      distribuicao: distribution,
      sync_status: 'pending',
      criado_em: new Date().toISOString()
    };

    // Update local balances of Caixinhas
    const updatedCaixinhas = caixinhas.map(cx => {
      const addedAmt = distribution[cx.id] || 0;
      if (addedAmt > 0) {
        const newBalance = Math.round((cx.saldo_atual + addedAmt) * 100) / 100;
        // Save updated pocket to DB
        const updatedCx = { ...cx, saldo_atual: newBalance };
        db.putItem('caixinhas', updatedCx);
        void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
        return updatedCx;
      }
      return cx;
    });

    // Update supplier outstanding value (valor_pendente) ONLY if imported supplier
    if (supplier && !isLocalSupplier) {
      const newPending = Math.round((supplier.valor_pendente + purchaseCost) * 100) / 100;
      const updatedSupplier = { ...supplier, valor_pendente: newPending };
      await db.putItem('fornecedores', updatedSupplier);
      await enqueueMutation({ type: 'fornecedor', action: 'update', data: updatedSupplier });
      setFornecedores(prev => prev.map(f => f.id === supplier.id ? updatedSupplier : f));
    }

    // Update target Bank/Mobile Wallet Account balance if specified
    if (vendaData.conta_id) {
      const targetAcc = contasBancarias.find(c => c.id === vendaData.conta_id);
      if (targetAcc) {
        const newAccBal = Math.round((targetAcc.saldo_atual + value) * 100) / 100;
        await editContaBancaria(targetAcc.id, { saldo_atual: newAccBal });
      }
    }

    // Deduct stock quantity of product by quantity sold
    if (product) {
      const newQty = Math.max(0, product.quantidade - qty);
      const updatedProduct = { ...product, quantidade: newQty };
      await db.putItem('produtos', updatedProduct);
      await enqueueMutation({ type: 'produto', action: 'update', data: updatedProduct });
      setProdutos(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    }

    // Save Venda to Local DB & queue sync
    await db.putItem('vendas', newVenda);
    await enqueueMutation({ type: 'venda', action: 'create', data: newVenda });

    // If a goal allocation was selected, allocate funds to that custom goal
    if (vendaData.meta_id && vendaData.meta_valor_alocado && vendaData.meta_valor_alocado > 0) {
      await alocarParaMetaItem(vendaData.meta_id, vendaData.meta_valor_alocado);
    }

    // Update React states
    setCaixinhas(updatedCaixinhas);
    setVendas(prev => [newVenda, ...prev]);

    const curr = profile.moeda || 'MT';
    triggerToast(
      'Venda Registada com Sucesso! 💰',
      `Faturamento: +${value.toLocaleString()} ${curr}`,
      'success'
    );

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editVenda(id: string, updates: Partial<Venda>) {
    const original = vendas.find(v => v.id === id);
    if (!original) return;

    const updated = { ...original, ...updates, sync_status: 'pending' as const };
    await db.putItem('vendas', updated);
    await enqueueMutation({ type: 'venda', action: 'update', data: updated });
    setVendas(prev => prev.map(v => v.id === id ? updated : v));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteVenda(id: string) {
    const original = vendas.find(v => v.id === id);
    if (!original) return;

    // 1. Revert product stock quantity (add back quantity sold).
    const product = produtos.find(p => p.id === original.produto_id);
    if (product) {
      const newQty = product.quantidade + (original.quantidade || 1);
      const updatedProduct = { ...product, quantidade: newQty };
      await db.putItem('produtos', updatedProduct);
      await enqueueMutation({ type: 'produto', action: 'update', data: updatedProduct });
      setProdutos(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    }

    // 2. Revert supplier outstanding value, including the product fallback used on sale creation.
    const supplierId = original.fornecedor_id || product?.fornecedor_id;
    const supplier = fornecedores.find(f => f.id === supplierId);
    if (supplier && supplier.tipo_origem !== 'local') {
      const purchaseCost = original.custo_compra_total ?? (product ? product.preco_compra : 0) * (original.quantidade || 1);
      const newPending = Math.max(0, Math.round((supplier.valor_pendente - purchaseCost) * 100) / 100);
      const updatedSupplier = { ...supplier, valor_pendente: newPending };
      await db.putItem('fornecedores', updatedSupplier);
      await enqueueMutation({ type: 'fornecedor', action: 'update', data: updatedSupplier });
      setFornecedores(prev => prev.map(f => f.id === supplier.id ? updatedSupplier : f));
    }

    // 3. Revert every pocket allocation recorded on the sale.
    const updatedCaixinhas = caixinhas.map(cx => {
      const distributedAmt = original.distribuicao?.[cx.id] || 0;
      if (!distributedAmt) return cx;
      const updatedCx = { ...cx, saldo_atual: Math.round((cx.saldo_atual - distributedAmt) * 100) / 100 };
      void db.putItem('caixinhas', updatedCx);
      void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
      return updatedCx;
    });
    setCaixinhas(updatedCaixinhas);

    // 4. Revert the account that received the sale, without clamping away money.
    if (original.conta_id) {
      const account = contasBancarias.find(c => c.id === original.conta_id);
      if (account) {
        const updatedAccount = {
          ...account,
          saldo_atual: Math.round((account.saldo_atual - original.valor_recebido) * 100) / 100
        };
        await db.putItem('contas_bancarias', updatedAccount);
        await enqueueMutation({ type: 'conta_bancaria', action: 'update', data: updatedAccount });
        setContasBancarias(prev => prev.map(c => c.id === account.id ? updatedAccount : c));
      }
    }

    // 5. Revert an allocation made to a custom goal.
    if (original.meta_id && original.meta_valor_alocado && original.meta_valor_alocado > 0) {
      const meta = metaItems.find(m => m.id === original.meta_id);
      if (meta) {
        const updatedMeta = {
          ...meta,
          valor_atual: Math.max(0, Math.round((meta.valor_atual - original.meta_valor_alocado) * 100) / 100)
        };
        await db.putItem('meta_items', updatedMeta);
        await enqueueMutation({ type: 'meta_item', action: 'update', data: updatedMeta });
        setMetaItems(prev => prev.map(m => m.id === meta.id ? updatedMeta : m));
      }
    }

    // 6. Delete the sale only after all local reversals have been persisted.
    await db.deleteItem('vendas', id);
    await enqueueMutation({ type: 'venda', action: 'delete', data: original });
    setVendas(prev => prev.filter(v => v.id !== id));

    setSyncStatus('pending');
    void syncWithServer();
  }

  // CORE BUSINESS ACTION: ADD EXPENSE (SUBTRACT BALANCES FROM SOURCE POCKET)
  async function addDespesa(despesaData: Omit<Despesa, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) {
    if (!profile) return;
    const userId = auth.currentUser?.uid || profile.id;
    const despesaId = crypto.randomUUID();

    const newDespesa: Despesa = {
      ...despesaData,
      id: despesaId,
      user_id: userId,
      sync_status: 'pending',
      criado_em: new Date().toISOString(),
      distribuicao_caixinhas: {},
      distribuicao_contas: {}
    };

    // Subtract expense value from selected Caixinha balance
    let updatedCaixinhas = caixinhas;
    if (despesaData.caixinha_id === 'todas') {
      const totalBal = caixinhas.reduce((acc, c) => acc + c.saldo_atual, 0);
      let allocated = 0;
      updatedCaixinhas = caixinhas.map((cx, index) => {
        const deduct = index === caixinhas.length - 1
          ? Math.round((despesaData.valor - allocated) * 100) / 100
          : totalBal > 0
            ? Math.round((despesaData.valor * (cx.saldo_atual / totalBal)) * 100) / 100
            : Math.round((despesaData.valor / (caixinhas.length || 1)) * 100) / 100;
        allocated += deduct;
        newDespesa.distribuicao_caixinhas![cx.id] = deduct;
        const newBalance = Math.round((cx.saldo_atual - deduct) * 100) / 100;
        const updatedCx = { ...cx, saldo_atual: newBalance };
        void db.putItem('caixinhas', updatedCx);
        void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
        return updatedCx;
      });
    } else {
      updatedCaixinhas = caixinhas.map(cx => {
        if (cx.id === despesaData.caixinha_id) {
          const deduct = despesaData.valor;
          newDespesa.distribuicao_caixinhas![cx.id] = deduct;
          const newBalance = Math.round((cx.saldo_atual - deduct) * 100) / 100;
          const updatedCx = { ...cx, saldo_atual: newBalance };
          void db.putItem('caixinhas', updatedCx);
          void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
          return updatedCx;
        }
        return cx;
      });
    }

    // If source pocket is Suppliers and there is a supplier, check if we want to deduct from pending supplier balance?
    // Let's assume expenses can also be recorded to pay suppliers. If category is "Pagamento Fornecedor", deduct their pending balance!
    if (despesaData.categoria.toLowerCase().includes('fornecedor') || despesaData.descricao.toLowerCase().includes('fornecedor')) {
      // Find supplier with matching name or just deduct the first one that has pending balance
      const suppliersWithPending = fornecedores.filter(f => f.valor_pendente > 0);
      if (suppliersWithPending.length > 0) {
        const s = suppliersWithPending[0];
        const paidToSupplier = Math.min(s.valor_pendente, despesaData.valor);
        const newPending = Math.max(0, Math.round((s.valor_pendente - paidToSupplier) * 100) / 100);
        const updatedSupplier = { ...s, valor_pendente: newPending };
        newDespesa.fornecedor_id_pagamento = s.id;
        newDespesa.fornecedor_valor_pago = paidToSupplier;
        await db.putItem('fornecedores', updatedSupplier);
        await enqueueMutation({ type: 'fornecedor', action: 'update', data: updatedSupplier });
        setFornecedores(prev => prev.map(f => f.id === s.id ? updatedSupplier : f));
      }
    }

    // If source account (Bank/Wallet) is selected, deduct from account balance
    if (despesaData.conta_id) {
      if (despesaData.conta_id === 'todas') {
        // Only include accounts with status_liberdade !== 'emergencia'
        const livreContas = contasBancarias.filter(c => c.status_liberdade !== 'emergencia');
        const targetList = livreContas.length > 0 ? livreContas : contasBancarias;
        const totalBankBal = targetList.reduce((acc, c) => acc + c.saldo_atual, 0);
        for (const targetAcc of targetList) {
          let deduct = 0;
          if (targetList.indexOf(targetAcc) === targetList.length - 1) {
            deduct = Math.round((despesaData.valor - targetList.slice(0, -1).reduce((sum, acc) => sum + (newDespesa.distribuicao_contas?.[acc.id] || 0), 0)) * 100) / 100;
          } else if (totalBankBal > 0) {
            deduct = Math.round((targetAcc.saldo_atual / totalBankBal) * despesaData.valor * 100) / 100;
          } else {
            deduct = Math.round((despesaData.valor / (targetList.length || 1)) * 100) / 100;
          }
          newDespesa.distribuicao_contas![targetAcc.id] = deduct;
          const newAccBal = Math.round((targetAcc.saldo_atual - deduct) * 100) / 100;
          await editContaBancaria(targetAcc.id, { saldo_atual: newAccBal });
        }
      } else {
          const targetAcc = contasBancarias.find(c => c.id === despesaData.conta_id);
          if (targetAcc) {
            newDespesa.distribuicao_contas![targetAcc.id] = despesaData.valor;
            const newAccBal = Math.round((targetAcc.saldo_atual - despesaData.valor) * 100) / 100;
          const updates: Partial<ContaBancaria> = { saldo_atual: newAccBal };

          if (targetAcc.status_liberdade === 'emergencia' || despesaData.motivo_emergencia) {
            const novoHist = [
              ...(targetAcc.historico_retiradas || []),
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                valor: despesaData.valor,
                motivo: despesaData.motivo_emergencia || 'Retirada de Emergência em Saída',
                despesa_descricao: despesaData.descricao,
                despesa_id: newDespesa.id
              }
            ];
            updates.historico_retiradas = novoHist;
          }

          await editContaBancaria(targetAcc.id, updates);
        }
      }
    }

    // Save Despesa to Local DB & queue sync
    await db.putItem('despesas', newDespesa);
    await enqueueMutation({ type: 'despesa', action: 'create', data: newDespesa });

    // Update React states
    setCaixinhas(updatedCaixinhas);
    setDespesas(prev => [newDespesa, ...prev]);

    const curr = profile.moeda || 'MT';
    triggerToast(
      'Saída Registada com Sucesso! 📉',
      `Despesa: -${despesaData.valor.toLocaleString()} ${curr} (${despesaData.categoria})`,
      'warning'
    );

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteDespesa(id: string) {
    const original = despesas.find(d => d.id === id);
    if (!original) return;

    // Restore pocket balances using the exact distribution stored with the expense.
    const pocketDistribution = original.distribuicao_caixinhas || {
      [original.caixinha_id]: original.valor
    };
    const updatedCaixinhas = caixinhas.map(cx => {
      const restored = pocketDistribution[cx.id] || 0;
      if (!restored) return cx;
      const updatedCx = { ...cx, saldo_atual: Math.round((cx.saldo_atual + restored) * 100) / 100 };
      void db.putItem('caixinhas', updatedCx);
      void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
      return updatedCx;
    });
    setCaixinhas(updatedCaixinhas);

    // Restore account balances and remove the emergency-history entries created by this expense.
    const accountDistribution = original.distribuicao_contas || (original.conta_id ? {
      [original.conta_id]: original.valor
    } : {});
    const updatedContas = contasBancarias.map(account => {
      const restored = accountDistribution[account.id] || 0;
      const history = (account.historico_retiradas || []).filter(item => item.despesa_id !== original.id);
      if (!restored && history.length === (account.historico_retiradas || []).length) return account;
      const updatedAccount = {
        ...account,
        saldo_atual: Math.round((account.saldo_atual + restored) * 100) / 100,
        historico_retiradas: history
      };
      void db.putItem('contas_bancarias', updatedAccount);
      void enqueueMutation({ type: 'conta_bancaria', action: 'update', data: updatedAccount });
      return updatedAccount;
    });
    setContasBancarias(updatedContas);

    // Restore the exact amount paid against a supplier, when this metadata exists.
    if (original.fornecedor_id_pagamento && original.fornecedor_valor_pago) {
      const supplier = fornecedores.find(f => f.id === original.fornecedor_id_pagamento);
      if (supplier) {
        const updatedSupplier = {
          ...supplier,
          valor_pendente: Math.round((supplier.valor_pendente + original.fornecedor_valor_pago) * 100) / 100
        };
        await db.putItem('fornecedores', updatedSupplier);
        await enqueueMutation({ type: 'fornecedor', action: 'update', data: updatedSupplier });
        setFornecedores(prev => prev.map(f => f.id === supplier.id ? updatedSupplier : f));
      }
    }

    setDespesas(prev => prev.filter(d => d.id !== id));
    await db.deleteItem('despesas', id);
    await enqueueMutation({ type: 'despesa', action: 'delete', data: original });
    setSyncStatus('pending');
    void syncWithServer();
  }

  // Custom Goals (Metas de Objetivos / Compras) Management
  async function addMetaItem(metaData: Omit<MetaItem, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const newMeta: MetaItem = {
      ...metaData,
      id: crypto.randomUUID(),
      user_id: auth.currentUser?.uid || profile.id,
      valor_atual: metaData.valor_atual || 0,
      criado_em: new Date().toISOString()
    };

    setMetaItems(prev => [newMeta, ...prev]);
    await db.putItem('meta_items', newMeta);
    await enqueueMutation({ type: 'meta_item', action: 'create', data: newMeta });
    
    triggerToast(
      'Nova Meta Criada! 🎯',
      `Meta "${newMeta.nome}" de ${newMeta.valor_alvo.toLocaleString()} MT guardada com sucesso!`,
      'success'
    );
    setSyncStatus('pending');
    syncWithServer();
  }

  async function editMetaItem(id: string, updates: Partial<MetaItem>) {
    if (!profile) return;
    const target = metaItems.find(m => m.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };

    setMetaItems(prev => prev.map(m => m.id === id ? updated : m));
    await db.putItem('meta_items', updated);
    await enqueueMutation({ type: 'meta_item', action: 'update', data: updated });
    triggerToast('Meta Atualizada! ✏️', `A meta "${updated.nome}" foi atualizada.`, 'info');
    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteMetaItem(id: string) {
    if (!profile) return;
    const target = metaItems.find(m => m.id === id);
    setMetaItems(prev => prev.filter(m => m.id !== id));
      await db.deleteItem('meta_items', id);
      await enqueueMutation({ type: 'meta_item', action: 'delete', data: { id, user_id: auth.currentUser?.uid || profile.id } });
    if (target) {
      triggerToast('Meta Eliminada', `A meta "${target.nome}" foi removida.`, 'warning');
    }
    setSyncStatus('pending');
    syncWithServer();
  }

  async function alocarParaMetaItem(id: string, valorMT: number) {
    if (!profile || valorMT <= 0) return;
    const target = metaItems.find(m => m.id === id);
    if (!target) return;

    const newCurrent = Math.round((target.valor_atual + valorMT) * 100) / 100;
    const updated = { ...target, valor_atual: newCurrent };

    setMetaItems(prev => prev.map(m => m.id === id ? updated : m));
    await db.putItem('meta_items', updated);
    await enqueueMutation({ type: 'meta_item', action: 'update', data: updated });
    
    const pct = Math.min(100, Math.round((newCurrent / target.valor_alvo) * 100));
    triggerToast(
      'Progresso na Meta! 🎉', 
      `+${valorMT.toLocaleString()} MT transferidos para "${target.nome}"! (${pct}% concluído)`,
      'success'
    );
    setSyncStatus('pending');
    syncWithServer();
  }

  // Products CRUD
  async function addProduto(produtoData: Omit<Produto, 'id' | 'user_id' | 'margem' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const margem = Math.round(((produtoData.preco_venda - produtoData.preco_compra) / produtoData.preco_venda) * 100 * 100) / 100;

    const newProduto: Produto = {
      ...produtoData,
      id,
      user_id: auth.currentUser?.uid || profile.id,
      margem,
      criado_em: new Date().toISOString()
    };

    await db.putItem('produtos', newProduto);
    await enqueueMutation({ type: 'produto', action: 'create', data: newProduto });
    setProdutos(prev => [...prev, newProduto]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editProduto(id: string, updates: Partial<Produto>) {
    const original = produtos.find(p => p.id === id);
    if (!original) return;

    let updated = { ...original, ...updates };
    // Recalculate margin if prices change
    if (updates.preco_compra !== undefined || updates.preco_venda !== undefined) {
      const comp = updated.preco_compra;
      const vend = updated.preco_venda;
      updated.margem = vend > 0 ? Math.round(((vend - comp) / vend) * 100 * 100) / 100 : 0;
    }

    await db.putItem('produtos', updated);
    await enqueueMutation({ type: 'produto', action: 'update', data: updated });
    setProdutos(prev => prev.map(p => p.id === id ? updated : p));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Suppliers CRUD
  async function addFornecedor(fornecedorData: Omit<Fornecedor, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newFornecedor: Fornecedor = {
      ...fornecedorData,
      id,
      user_id: auth.currentUser?.uid || profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('fornecedores', newFornecedor);
    await enqueueMutation({ type: 'fornecedor', action: 'create', data: newFornecedor });
    setFornecedores(prev => [...prev, newFornecedor]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editFornecedor(id: string, updates: Partial<Fornecedor>) {
    const original = fornecedores.find(f => f.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('fornecedores', updated);
    await enqueueMutation({ type: 'fornecedor', action: 'update', data: updated });
    setFornecedores(prev => prev.map(f => f.id === id ? updated : f));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Delivery Zones CRUD
  async function addZonaEntrega(zonaData: Omit<ZonaEntrega, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newZona: ZonaEntrega = {
      ...zonaData,
      id,
      user_id: auth.currentUser?.uid || profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('zonas_entrega', newZona);
    await enqueueMutation({ type: 'zona', action: 'create', data: newZona });
    setZonasEntrega(prev => [...prev, newZona]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editZonaEntrega(id: string, updates: Partial<ZonaEntrega>) {
    const original = zonasEntrega.find(z => z.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('zonas_entrega', updated);
    await enqueueMutation({ type: 'zona', action: 'update', data: updated });
    setZonasEntrega(prev => prev.map(z => z.id === id ? updated : z));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Caixinhas management
  async function addCaixinha(
    nome: string, 
    icone: string, 
    cor: string, 
    percentual?: number, 
    auto_distribuir?: boolean,
    distribuicao_modo?: 'percentual' | 'fixo',
    valor_distribuicao?: number
  ) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newCx: Caixinha = {
      id,
      user_id: auth.currentUser?.uid || profile.id,
      nome,
      icone,
      cor,
      tipo: 'personalizado',
      percentual_padrao: percentual,
      saldo_atual: 0,
      auto_distribuir: auto_distribuir || false,
      distribuicao_modo: distribuicao_modo || 'percentual',
      valor_distribuicao: valor_distribuicao !== undefined ? valor_distribuicao : (percentual || 0),
      criado_em: new Date().toISOString()
    };

    await db.putItem('caixinhas', newCx);
    await enqueueMutation({ type: 'caixinha', action: 'create', data: newCx });
    setCaixinhas(prev => [...prev, newCx]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editCaixinha(id: string, updates: Partial<Caixinha>) {
    const original = caixinhas.find(c => c.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('caixinhas', updated);
    await enqueueMutation({ type: 'caixinha', action: 'update', data: updated });
    setCaixinhas(prev => prev.map(c => c.id === id ? updated : c));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteCaixinha(id: string) {
    const original = caixinhas.find(c => c.id === id);
    if (!original || original.tipo !== 'personalizado') return; // cannot delete default caixinhas

    await db.deleteItem('caixinhas', id);
    await enqueueMutation({ type: 'caixinha', action: 'delete', data: original });
    setCaixinhas(prev => prev.filter(c => c.id !== id));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function retirarDaCaixinha(caixinhaId: string, valor: number, motivo?: string, contaId?: string) {
    if (!profile || valor <= 0) return;

    const positivePockets = caixinhas.filter(c => c.saldo_atual > 0);
    const totalActual = positivePockets.reduce((acc, c) => acc + c.saldo_atual, 0);
    if (caixinhaId === 'todas' && totalActual < valor) {
      throw new Error('Saldo insuficiente nas caixinhas para esta retirada.');
    }
    const selected = caixinhas.find(c => c.id === caixinhaId);
    if (selected && selected.saldo_atual < valor) {
      throw new Error('Saldo insuficiente na caixinha seleccionada.');
    }
    if (contaId) {
      const accountTargets = contaId === 'todas'
        ? contasBancarias.filter(c => c.status_liberdade !== 'emergencia')
        : contasBancarias.filter(c => c.id === contaId);
      const usableTargets = accountTargets.length > 0 ? accountTargets : contasBancarias;
      const accountTotal = usableTargets.reduce((sum, account) => sum + account.saldo_atual, 0);
      if (accountTotal < valor) throw new Error('Saldo insuficiente na conta seleccionada.');
    }

    let allocated = 0;
    const positiveIds = new Set(positivePockets.map(c => c.id));
    const updatedList = caixinhas.map(cx => {
      const shouldUpdate = caixinhaId === 'todas' ? positiveIds.has(cx.id) : cx.id === caixinhaId;
      if (!shouldUpdate) return cx;
      const positiveIndex = positivePockets.findIndex(item => item.id === cx.id);
      const portion = caixinhaId === 'todas'
        ? positiveIndex === positivePockets.length - 1
          ? Math.round((valor - allocated) * 100) / 100
          : Math.round((valor * (cx.saldo_atual / totalActual)) * 100) / 100
        : valor;
      allocated += portion;
      const updatedCx = { ...cx, saldo_atual: Math.round((cx.saldo_atual - portion) * 100) / 100 };
      void db.putItem('caixinhas', updatedCx);
      void enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
      return updatedCx;
    });

    setCaixinhas(updatedList);
    if (contaId) await retirarDaConta(contaId, valor, motivo);

    const curr = profile.moeda || 'MT';
    triggerToast(
      'Levantamento Realizado!',
      `Subtraído ${valor.toLocaleString()} ${curr}${motivo ? ` (${motivo})` : ''}`,
      'info'
    );
    setSyncStatus('pending');
    void syncWithServer();
  }

  async function ajustarSaldoCaixinha(caixinhaId: string, novoSaldo: number) {
    if (!profile) return;
    const cx = caixinhas.find(c => c.id === caixinhaId);
    if (!cx) return;
    const val = Math.max(0, Math.round(novoSaldo * 100) / 100);
    const updatedCx = { ...cx, saldo_atual: val };
    await db.putItem('caixinhas', updatedCx);
    await enqueueMutation({ type: 'caixinha', action: 'update', data: updatedCx });
    setCaixinhas(prev => prev.map(c => c.id === caixinhaId ? updatedCx : c));
    
    const curr = profile.moeda || 'MT';
    triggerToast('Saldo Atualizado! ✏️', `${cx.nome}: ${val.toLocaleString()} ${curr}`, 'success');
    setSyncStatus('pending');
    syncWithServer();
  }

  // Contas Bancárias Actions
  async function addContaBancaria(contaData: Omit<ContaBancaria, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const newConta: ContaBancaria = {
      ...contaData,
      id: crypto.randomUUID(),
      user_id: auth.currentUser?.uid || profile.id,
      editavel: true,
      criado_em: new Date().toISOString()
    };
    await db.putItem('contas_bancarias', newConta);
    await enqueueMutation({ type: 'conta_bancaria', action: 'create', data: newConta });
    setContasBancarias(prev => [...prev, newConta]);
    setSyncStatus('pending');
    syncWithServer();
  }

  async function editContaBancaria(id: string, updates: Partial<ContaBancaria>) {
    if (!profile) return;
    const conta = contasBancarias.find(c => c.id === id);
    if (!conta) return;
    const updated = { ...conta, ...updates };
    await db.putItem('contas_bancarias', updated);
    await enqueueMutation({ type: 'conta_bancaria', action: 'update', data: updated });
    setContasBancarias(prev => prev.map(c => c.id === id ? updated : c));
    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteContaBancaria(id: string) {
    if (!profile) return;
    const conta = contasBancarias.find(c => c.id === id);
    if (!conta) return;
    await db.deleteItem('contas_bancarias', id);
    await enqueueMutation({ type: 'conta_bancaria', action: 'delete', data: { id, user_id: auth.currentUser?.uid || profile.id } });
    setContasBancarias(prev => prev.filter(c => c.id !== id));
    setSyncStatus('pending');
    syncWithServer();
  }

  async function retirarDaConta(contaId: string, valor: number, motivo?: string) {
    if (!profile || valor <= 0) return;

    const targets = contaId === 'todas'
      ? contasBancarias.filter(c => c.status_liberdade !== 'emergencia')
      : contasBancarias.filter(c => c.id === contaId);
    const usableTargets = targets.length > 0 ? targets : contasBancarias;
    const totalBalance = usableTargets.reduce((sum, account) => sum + account.saldo_atual, 0);
    if (totalBalance < valor) throw new Error('Saldo insuficiente para esta retirada.');

    let allocated = 0;
    const updatedAccounts = contasBancarias.map(account => {
      if (!usableTargets.some(target => target.id === account.id)) return account;
      const index = usableTargets.findIndex(target => target.id === account.id);
      const portion = index === usableTargets.length - 1
        ? Math.round((valor - allocated) * 100) / 100
        : Math.round((valor * (account.saldo_atual / totalBalance)) * 100) / 100;
      allocated += portion;
      const updates: Partial<ContaBancaria> = {
        saldo_atual: Math.round((account.saldo_atual - portion) * 100) / 100
      };
      if (motivo || account.status_liberdade === 'emergencia') {
        updates.historico_retiradas = [
          ...(account.historico_retiradas || []),
          {
            id: crypto.randomUUID(),
            data: new Date().toISOString(),
            valor: portion,
            motivo: motivo || 'Retirada Direta'
          }
        ];
      }
      const updated = { ...account, ...updates };
      void db.putItem('contas_bancarias', updated);
      void enqueueMutation({ type: 'conta_bancaria', action: 'update', data: updated });
      return updated;
    });
    setContasBancarias(updatedAccounts);
    const curr = profile.moeda || 'MT';
    triggerToast('Levantamento de Conta!', `Retirado ${valor.toLocaleString()} ${curr}`, 'info');
    setSyncStatus('pending');
    void syncWithServer();
  }

  async function transferirEntreContas(deContaId: string, paraContaId: string, valor: number) {
    if (!profile || valor <= 0) return;
    const deConta = contasBancarias.find(c => c.id === deContaId);
    const paraConta = contasBancarias.find(c => c.id === paraContaId);
    if (!deConta || !paraConta) return;
    if (deConta.saldo_atual < valor) throw new Error('Saldo insuficiente na conta de origem.');

    const deAtualizada = { ...deConta, saldo_atual: Math.round((deConta.saldo_atual - valor) * 100) / 100 };
    const paraAtualizada = { ...paraConta, saldo_atual: Math.round((paraConta.saldo_atual + valor) * 100) / 100 };
    await db.putItem('contas_bancarias', deAtualizada);
    await enqueueMutation({ type: 'conta_bancaria', action: 'update', data: deAtualizada });
    await db.putItem('contas_bancarias', paraAtualizada);
    await enqueueMutation({ type: 'conta_bancaria', action: 'update', data: paraAtualizada });
    setContasBancarias(prev => prev.map(c => c.id === deConta.id ? deAtualizada : c.id === paraConta.id ? paraAtualizada : c));
    const curr = profile.moeda || 'MT';
    triggerToast('Transferência Concluída!', `Transferido ${valor.toLocaleString()} ${curr} de ${deConta.nome} para ${paraConta.nome}`, 'success');
    setSyncStatus('pending');
    void syncWithServer();
  }

  // Campanhas management
  async function addCampanha(campanhaData: Omit<Campanha, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newCampanha: Campanha = {
      ...campanhaData,
      id,
      user_id: auth.currentUser?.uid || profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('campanhas', newCampanha);
    await enqueueMutation({ type: 'campanha', action: 'create', data: newCampanha });
    setCampanhas(prev => [newCampanha, ...prev].sort((a,b) => b.data.localeCompare(a.data)));

    const currencySymbol = newCampanha.orcamento_usd ? '$' : (profile.moeda || 'MT');
    checkCampaignBudget(newCampanha, 0, currencySymbol);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editCampanha(id: string, updates: Partial<Campanha>) {
    const original = campanhas.find(c => c.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('campanhas', updated);
    await enqueueMutation({ type: 'campanha', action: 'update', data: updated });
    setCampanhas(prev => prev.map(c => c.id === id ? updated : c).sort((a,b) => b.data.localeCompare(a.data)));

    const currencySymbol = updated.orcamento_usd ? '$' : (profile.moeda || 'MT');
    checkCampaignBudget(updated, original.gasto, currencySymbol);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteCampanha(id: string) {
    const original = campanhas.find(c => c.id === id);
    if (!original) return;

    await db.deleteItem('campanhas', id);
    await enqueueMutation({ type: 'campanha', action: 'delete', data: original });
    setCampanhas(prev => prev.filter(c => c.id !== id));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Despesas Recorrentes management
  async function addDespesaRecorrente(despesaRecorrenteData: Omit<DespesaRecorrente, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newDR: DespesaRecorrente = {
      ...despesaRecorrenteData,
      id,
      user_id: auth.currentUser?.uid || profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('despesas_recorrentes', newDR);
    await enqueueMutation({ type: 'despesa_recorrente', action: 'create', data: newDR });
    setDespesasRecorrentes(prev => [...prev, newDR]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editDespesaRecorrente(id: string, updates: Partial<DespesaRecorrente>) {
    const original = despesasRecorrentes.find(dr => dr.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('despesas_recorrentes', updated);
    await enqueueMutation({ type: 'despesa_recorrente', action: 'update', data: updated });
    setDespesasRecorrentes(prev => prev.map(dr => dr.id === id ? updated : dr));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteDespesaRecorrente(id: string) {
    const original = despesasRecorrentes.find(dr => dr.id === id);
    if (!original) return;

    await db.deleteItem('despesas_recorrentes', id);
    await enqueueMutation({ type: 'despesa_recorrente', action: 'delete', data: original });
    setDespesasRecorrentes(prev => prev.filter(dr => dr.id !== id));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function processarDespesaRecorrente(id: string, dataEfetivacao: string) {
    const dr = despesasRecorrentes.find(item => item.id === id);
    if (!dr) return;

    // 1. Registra a despesa real vinculada a caixinha selecionada
    await addDespesa({
      descricao: `${dr.descricao} (Recorrente)`,
      valor: dr.valor,
      caixinha_id: dr.caixinha_id,
      categoria: dr.categoria,
      data: dataEfetivacao // YYYY-MM-DD
    });

    // 2. Atualiza a data de último processamento da despesa recorrente
    await editDespesaRecorrente(dr.id, {
      ultimo_processado: dataEfetivacao
    });
  }

  return (
    <AppContext.Provider value={{
      profile,
      token,
      isAuthenticated,
      isLoadingAuth,
      login,
      register,
      loginGoogle,
      logout,
      updateProfile,
      triggerMockUpgrade,

      isAdmin,
      broadcasts,
      relatorios,
      allProfiles,
      addBroadcast,
      addRelatorio,
      updateUserProfileByAdmin,

      caixinhas,
      contasBancarias,
      vendas,
      despesas,
      produtos,
      fornecedores,
      zonasEntrega,
      campanhas,
      despesasRecorrentes,
      metaItems,

      modoFoco,
      setModoFoco,
      toggleModoFoco,
      formatMoney,
      maskValue,

      activeToast,
      triggerToast,
      dismissToast,

      isOnline,
      syncStatus,
      syncWithServer,

      addVenda,
      editVenda,
      deleteVenda,
      addDespesa,
      deleteDespesa,
      addProduto,
      editProduto,
      addFornecedor,
      editFornecedor,
      addZonaEntrega,
      editZonaEntrega,

      addMetaItem,
      editMetaItem,
      deleteMetaItem,
      alocarParaMetaItem,
      
      addCaixinha,
      editCaixinha,
      deleteCaixinha,
      retirarDaCaixinha,
      ajustarSaldoCaixinha,

      addContaBancaria,
      editContaBancaria,
      deleteContaBancaria,
      retirarDaConta,
      transferirEntreContas,

      addCampanha,
      editCampanha,
      deleteCampanha,

      addDespesaRecorrente,
      editDespesaRecorrente,
      deleteDespesaRecorrente,
      processarDespesaRecorrente
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
