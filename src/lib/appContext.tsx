/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as db from './db.ts';
import { Profile, Caixinha, Venda, Despesa, Produto, Fornecedor, ZonaEntrega, SyncQueueItem, Broadcast, Relatorio, Campanha, DespesaRecorrente } from '../types.ts';
import { checkCampaignBudget, startNotificationScheduler } from './notifications.ts';
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
  vendas: Venda[];
  despesas: Despesa[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  zonasEntrega: ZonaEntrega[];
  campanhas: Campanha[];
  despesasRecorrentes: DespesaRecorrente[];

  // Sync / Online State
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'offline';
  syncWithServer: () => Promise<void>;

  // Business Actions
  addVenda: (vendaData: Omit<Venda, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) => Promise<void>;
  addDespesa: (despesaData: Omit<Despesa, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) => Promise<void>;
  addProduto: (produtoData: Omit<Produto, 'id' | 'user_id' | 'margem' | 'criado_em'>) => Promise<void>;
  editProduto: (id: string, updates: Partial<Produto>) => Promise<void>;
  addFornecedor: (fornecedorData: Omit<Fornecedor, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editFornecedor: (id: string, updates: Partial<Fornecedor>) => Promise<void>;
  addZonaEntrega: (zonaData: Omit<ZonaEntrega, 'id' | 'user_id' | 'criado_em'>) => Promise<void>;
  editZonaEntrega: (id: string, updates: Partial<ZonaEntrega>) => Promise<void>;
  
  // Caixinhas management
  addCaixinha: (nome: string, icone: string, cor: string, percentual?: number, auto_distribuir?: boolean) => Promise<void>;
  editCaixinha: (id: string, updates: Partial<Caixinha>) => Promise<void>;
  deleteCaixinha: (id: string) => Promise<void>;

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
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [zonasEntrega, setZonasEntrega] = useState<ZonaEntrega[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [despesasRecorrentes, setDespesasRecorrentes] = useState<DespesaRecorrente[]>([]);

  // Sync / Online state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'offline'>(
    navigator.onLine ? 'synced' : 'offline'
  );

  // Ref to track active Firestore subscriptions for clean-up
  const unsubscribesRef = useRef<(() => void)[]>([]);

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
          const freshToken = await user.getIdToken();
          setToken(freshToken);
          localStorage.setItem('dropflow_token', freshToken);

          // Try to load cached profile immediately for instant rendering
          const cachedProfileStr = localStorage.getItem('dropflow_profile');
          if (cachedProfileStr) {
            try {
              const cachedProfile = JSON.parse(cachedProfileStr);
              setProfile(cachedProfile);
              setIsAuthenticated(true);
              setIsLoadingAuth(false); // Speed optimization for immediate UI rendering
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
              setProfile(profileData);
              localStorage.setItem('dropflow_profile', JSON.stringify(profileData));
              db.putItem('profiles', profileData);
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
              setCaixinhas(data);
              db.clearStore('caixinhas').then(() => {
                data.forEach(item => db.putItem('caixinhas', item));
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
              setVendas(data.sort((a, b) => b.data_venda.localeCompare(a.data_venda)));
              db.clearStore('vendas').then(() => {
                data.forEach(item => db.putItem('vendas', item));
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
              setDespesas(data.sort((a, b) => b.data.localeCompare(a.data)));
              db.clearStore('despesas').then(() => {
                data.forEach(item => db.putItem('despesas', item));
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
              setProdutos(data);
              db.clearStore('produtos').then(() => {
                data.forEach(item => db.putItem('produtos', item));
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
              setFornecedores(data);
              db.clearStore('fornecedores').then(() => {
                data.forEach(item => db.putItem('fornecedores', item));
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
              setZonasEntrega(data);
              db.clearStore('zonas_entrega').then(() => {
                data.forEach(item => db.putItem('zonas_entrega', item));
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
              setCampanhas(data.sort((a, b) => b.data.localeCompare(a.data)));
              db.clearStore('campanhas').then(() => {
                data.forEach(item => db.putItem('campanhas', item));
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
              setDespesasRecorrentes(data);
              db.clearStore('despesas_recorrentes').then(() => {
                data.forEach(item => db.putItem('despesas_recorrentes', item));
              });
            },
            (error) => console.error("DespesasRecorrentes real-time listener error:", error)
          );
          unsubscribesRef.current.push(unsubDespesasRecorrentes);

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
        db.getAll<SyncQueueItem>('sync_queue')
      ]);

      const currentUserProfile = dbProfiles.find(p => p.id === userId);
      if (currentUserProfile) {
        setProfile(currentUserProfile);
      }

      setCaixinhas(dbCaixinhas.filter(c => c.user_id === userId));
      setVendas(dbVendas.filter(v => v.user_id === userId).sort((a,b) => b.data_venda.localeCompare(a.data_venda)));
      setDespesas(dbDespesas.filter(d => d.user_id === userId).sort((a,b) => b.data.localeCompare(a.data)));
      setProdutos(dbProdutos.filter(p => p.user_id === userId));
      setFornecedores(dbFornecedores.filter(f => f.user_id === userId));
      setZonasEntrega(dbZonas.filter(z => z.user_id === userId));
      setCampanhas(dbCampanhas.filter(c => c.user_id === userId).sort((a,b) => b.data.localeCompare(a.data)));
      setDespesasRecorrentes(dbDespesasRecorrentes.filter(dr => dr.user_id === userId));

      if (queue.length > 0) {
        setSyncStatus('pending');
      }
    } catch (e) {
      console.error('Error loading local offline database:', e);
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

      // Calculate trial expiry (7 days from now)
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const newProfile: Profile = {
        id: user.uid,
        nome,
        pais: pais || 'Moçambique',
        moeda: moeda || 'MT',
        plano: 'trial',
        trial_expires_at: trialExpiry.toISOString(),
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
        // If not, register a new profile with Google's details
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 7);

        userProfile = {
          id: user.uid,
          nome: user.displayName || 'Empreendedor Google',
          pais: 'Moçambique',
          moeda: 'MT',
          plano: 'trial',
          trial_expires_at: trialExpiry.toISOString(),
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
    await db.addToSyncQueue({
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
      user_id: profile.id,
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
    if (!token || !profile || !navigator.onLine || !auth.currentUser) {
      return;
    }

    setSyncStatus('syncing');
    try {
      // 1. Get the local queue of modifications
      const queue = await db.getAll<SyncQueueItem>('sync_queue');

      // 2. Post queue to Firestore
      if (queue.length > 0) {
        await pushQueueToFirestore(queue);
        // Clear successfully synced items from queue
        await db.clearStore('sync_queue');
      }

      setSyncStatus('synced');
    } catch (e) {
      console.error('Synchronization failed (retrying later):', e);
      setSyncStatus('pending'); // keep as pending to indicate changes are waiting
    }
  }

  // CORE BUSINESS ACTION: ADD SALE (AUTOMATIC POCKET DISTRIBUTION)
  async function addVenda(vendaData: Omit<Venda, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) {
    if (!profile) return;
    const userId = profile.id;
    const vendaId = crypto.randomUUID();

    const value = vendaData.valor_recebido;
    const qty = vendaData.quantidade || 1;
    
    // Find selected product
    const product = produtos.find(p => p.id === vendaData.produto_id);
    const purchaseCost = (product ? product.preco_compra : 0) * qty;

    // Find selected delivery zone
    const zone = zonasEntrega.find(z => z.id === vendaData.zona_entrega_id);
    const shippingCost = zone ? zone.custo : 0;

    // Find relevant standard pockets (Caixinhas)
    const lucrosCx = caixinhas.find(c => c.tipo === 'lucro');
    const anunciosCx = caixinhas.find(c => c.tipo === 'anuncios');
    const fornecedoresCx = caixinhas.find(c => c.tipo === 'fornecedores');
    const deliveryCx = caixinhas.find(c => c.tipo === 'delivery');

    const distribution: { [id: string]: number } = {};

    // 1. Reserve product purchase price for Suppliers pocket
    if (fornecedoresCx) {
      distribution[fornecedoresCx.id] = purchaseCost;
    }

    // 2. Reserve shipping cost for Delivery pocket
    if (deliveryCx) {
      distribution[deliveryCx.id] = shippingCost;
    }

    // 3. Distribute remainder: first to personalized auto-distribute pockets, then between Ads and Profit
    const remainder = value - purchaseCost - shippingCost;
    if (remainder > 0) {
      // Find personalized pockets with auto_distribuir: true and percentual_padrao > 0
      const autoDists = caixinhas.filter(c => c.tipo === 'personalizado' && c.auto_distribuir && (c.percentual_padrao || 0) > 0);
      
      let allocatedToCustom = 0;
      autoDists.forEach(cx => {
        const pct = cx.percentual_padrao || 0;
        const amt = Math.round(remainder * (pct / 100) * 100) / 100;
        distribution[cx.id] = amt;
        allocatedToCustom += amt;
      });

      const actualRemainder = Math.max(0, remainder - allocatedToCustom);

      const adsPercent = vendaData.custom_anuncios_percent !== undefined ? vendaData.custom_anuncios_percent : profile.anuncios_percent;
      const adsAmount = Math.round(actualRemainder * (adsPercent / 100) * 100) / 100;
      const profitAmount = Math.round((actualRemainder - adsAmount) * 100) / 100;

      if (anunciosCx) {
        distribution[anunciosCx.id] = adsAmount;
      }
      if (lucrosCx) {
        distribution[lucrosCx.id] = profitAmount;
      }
    } else {
      // In case of loss or negative margin, write 0 to Ads and Profit
      if (anunciosCx) distribution[anunciosCx.id] = 0;
      if (lucrosCx) distribution[lucrosCx.id] = 0;
      
      const autoDists = caixinhas.filter(c => c.tipo === 'personalizado' && c.auto_distribuir);
      autoDists.forEach(cx => {
        distribution[cx.id] = 0;
      });
    }

    // Prepare full venda object
    const newVenda: Venda = {
      ...vendaData,
      id: vendaId,
      user_id: userId,
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
        db.addToSyncQueue({ type: 'caixinha', action: 'update', data: updatedCx });
        return updatedCx;
      }
      return cx;
    });

    // Update supplier outstanding value (valor_pendente) if there is any supplier
    if (vendaData.fornecedor_id) {
      const supplier = fornecedores.find(f => f.id === vendaData.fornecedor_id);
      if (supplier) {
        const newPending = Math.round((supplier.valor_pendente + purchaseCost) * 100) / 100;
        const updatedSupplier = { ...supplier, valor_pendente: newPending };
        await db.putItem('fornecedores', updatedSupplier);
        await db.addToSyncQueue({ type: 'fornecedor', action: 'update', data: updatedSupplier });
        setFornecedores(prev => prev.map(f => f.id === supplier.id ? updatedSupplier : f));
      }
    }

    // Deduct stock quantity of product by quantity sold
    if (product) {
      const newQty = Math.max(0, product.quantidade - qty);
      const updatedProduct = { ...product, quantidade: newQty };
      await db.putItem('produtos', updatedProduct);
      await db.addToSyncQueue({ type: 'produto', action: 'update', data: updatedProduct });
      setProdutos(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    }

    // Save Venda to Local DB & queue sync
    await db.putItem('vendas', newVenda);
    await db.addToSyncQueue({ type: 'venda', action: 'create', data: newVenda });

    // Evaluate goals before and after this sale to trigger comemmorations/notifications
    const goalDailyVal = profile.metaDiaria || 0;
    const goalWeeklyVal = profile.metaSemanal || 0;
    const goalMonthlyVal = profile.metaMensal || 0;

    const pDiaria = profile.periodoDiaria || 1;
    const startDaily = new Date();
    startDaily.setHours(0,0,0,0);
    startDaily.setDate(startDaily.getDate() - (pDiaria - 1));

    const pSemanal = profile.periodoSemanal || 1;
    const getStartOfWeek = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const m = new Date(d.setDate(diff));
      m.setHours(0,0,0,0);
      return m;
    };
    const mondayDate = getStartOfWeek();
    const startWeekly = new Date(mondayDate);
    startWeekly.setDate(mondayDate.getDate() - (pSemanal - 1) * 7);

    const pMensal = profile.periodoMensal || 1;
    const now = new Date();
    const startMonthly = new Date(now.getFullYear(), now.getMonth() - (pMensal - 1), 1, 0, 0, 0, 0);

    const salesDailyBefore = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startDaily;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const salesWeeklyBefore = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startWeekly;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const salesMonthlyBefore = vendas
      .filter(v => {
        const vDate = new Date(v.data_venda + 'T00:00:00');
        return vDate >= startMonthly;
      })
      .reduce((acc, v) => acc + v.valor_recebido, 0);

    const salesDailyAfter = salesDailyBefore + value;
    const salesWeeklyAfter = salesWeeklyBefore + value;
    const salesMonthlyAfter = salesMonthlyBefore + value;

    const dailyGoalCrossed = goalDailyVal > 0 && salesDailyBefore < goalDailyVal && salesDailyAfter >= goalDailyVal;
    const weeklyGoalCrossed = goalWeeklyVal > 0 && salesWeeklyBefore < goalWeeklyVal && salesWeeklyAfter >= goalWeeklyVal;
    const monthlyGoalCrossed = goalMonthlyVal > 0 && salesMonthlyBefore < goalMonthlyVal && salesMonthlyAfter >= goalMonthlyVal;

    if (dailyGoalCrossed || weeklyGoalCrossed || monthlyGoalCrossed) {
      import('./audio.ts').then(({ playCashRegister }) => {
        playCashRegister(profile.ativarSons !== false && profile.somMetas !== false);
      });

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        let msg = '';
        if (dailyGoalCrossed) {
          msg += `Meta Diária (${pDiaria === 1 ? 'Hoje' : `${pDiaria} dias`}) de ${goalDailyVal.toLocaleString()} ${profile.moeda || 'MT'} alcançada! 🎉 `;
        }
        if (weeklyGoalCrossed) {
          msg += `Meta Semanal (${pSemanal === 1 ? 'Esta Semana' : `${pSemanal} semanas`}) de ${goalWeeklyVal.toLocaleString()} ${profile.moeda || 'MT'} alcançada! 🚀 `;
        }
        if (monthlyGoalCrossed) {
          msg += `Meta Mensal (${pMensal === 1 ? 'Este Mês' : `${pMensal} meses`}) de ${goalMonthlyVal.toLocaleString()} ${profile.moeda || 'MT'} alcançada! 🏆 `;
        }
        try {
          new Notification("DroopFlow - Meta Atingida!", { body: msg.trim() });
        } catch (e) {
          console.warn("Notification error:", e);
        }
      }
    }

    // Update React states
    setCaixinhas(updatedCaixinhas);
    setVendas(prev => [newVenda, ...prev]);

    setSyncStatus('pending');
    syncWithServer();
  }

  // CORE BUSINESS ACTION: ADD EXPENSE (SUBTRACT BALANCES FROM SOURCE POCKET)
  async function addDespesa(despesaData: Omit<Despesa, 'id' | 'user_id' | 'sync_status' | 'criado_em'>) {
    if (!profile) return;
    const userId = profile.id;
    const despesaId = crypto.randomUUID();

    const newDespesa: Despesa = {
      ...despesaData,
      id: despesaId,
      user_id: userId,
      sync_status: 'pending',
      criado_em: new Date().toISOString()
    };

    // Subtract expense value from selected Caixinha balance
    const updatedCaixinhas = caixinhas.map(cx => {
      if (cx.id === despesaData.caixinha_id) {
        const newBalance = Math.round((cx.saldo_atual - despesaData.valor) * 100) / 100;
        const updatedCx = { ...cx, saldo_atual: newBalance };
        db.putItem('caixinhas', updatedCx);
        db.addToSyncQueue({ type: 'caixinha', action: 'update', data: updatedCx });
        return updatedCx;
      }
      return cx;
    });

    // If source pocket is Suppliers and there is a supplier, check if we want to deduct from pending supplier balance?
    // Let's assume expenses can also be recorded to pay suppliers. If category is "Pagamento Fornecedor", deduct their pending balance!
    if (despesaData.categoria.toLowerCase().includes('fornecedor') || despesaData.descricao.toLowerCase().includes('fornecedor')) {
      // Find supplier with matching name or just deduct the first one that has pending balance
      const suppliersWithPending = fornecedores.filter(f => f.valor_pendente > 0);
      if (suppliersWithPending.length > 0) {
        const s = suppliersWithPending[0];
        const newPending = Math.max(0, Math.round((s.valor_pendente - despesaData.valor) * 100) / 100);
        const updatedSupplier = { ...s, valor_pendente: newPending };
        await db.putItem('fornecedores', updatedSupplier);
        await db.addToSyncQueue({ type: 'fornecedor', action: 'update', data: updatedSupplier });
        setFornecedores(prev => prev.map(f => f.id === s.id ? updatedSupplier : f));
      }
    }

    // Save Despesa to Local DB & queue sync
    await db.putItem('despesas', newDespesa);
    await db.addToSyncQueue({ type: 'despesa', action: 'create', data: newDespesa });

    // Update React states
    setCaixinhas(updatedCaixinhas);
    setDespesas(prev => [newDespesa, ...prev]);

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
      user_id: profile.id,
      margem,
      criado_em: new Date().toISOString()
    };

    await db.putItem('produtos', newProduto);
    await db.addToSyncQueue({ type: 'produto', action: 'create', data: newProduto });
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
    await db.addToSyncQueue({ type: 'produto', action: 'update', data: updated });
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
      user_id: profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('fornecedores', newFornecedor);
    await db.addToSyncQueue({ type: 'fornecedor', action: 'create', data: newFornecedor });
    setFornecedores(prev => [...prev, newFornecedor]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editFornecedor(id: string, updates: Partial<Fornecedor>) {
    const original = fornecedores.find(f => f.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('fornecedores', updated);
    await db.addToSyncQueue({ type: 'fornecedor', action: 'update', data: updated });
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
      user_id: profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('zonas_entrega', newZona);
    await db.addToSyncQueue({ type: 'zona', action: 'create', data: newZona });
    setZonasEntrega(prev => [...prev, newZona]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editZonaEntrega(id: string, updates: Partial<ZonaEntrega>) {
    const original = zonasEntrega.find(z => z.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('zonas_entrega', updated);
    await db.addToSyncQueue({ type: 'zona', action: 'update', data: updated });
    setZonasEntrega(prev => prev.map(z => z.id === id ? updated : z));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Caixinhas management
  async function addCaixinha(nome: string, icone: string, cor: string, percentual?: number, auto_distribuir?: boolean) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newCx: Caixinha = {
      id,
      user_id: profile.id,
      nome,
      icone,
      cor,
      tipo: 'personalizado',
      percentual_padrao: percentual,
      saldo_atual: 0,
      auto_distribuir: auto_distribuir || false,
      criado_em: new Date().toISOString()
    };

    await db.putItem('caixinhas', newCx);
    await db.addToSyncQueue({ type: 'caixinha', action: 'create', data: newCx });
    setCaixinhas(prev => [...prev, newCx]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editCaixinha(id: string, updates: Partial<Caixinha>) {
    const original = caixinhas.find(c => c.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('caixinhas', updated);
    await db.addToSyncQueue({ type: 'caixinha', action: 'update', data: updated });
    setCaixinhas(prev => prev.map(c => c.id === id ? updated : c));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteCaixinha(id: string) {
    const original = caixinhas.find(c => c.id === id);
    if (!original || original.tipo !== 'personalizado') return; // cannot delete default caixinhas

    await db.deleteItem('caixinhas', id);
    await db.addToSyncQueue({ type: 'caixinha', action: 'delete', data: original });
    setCaixinhas(prev => prev.filter(c => c.id !== id));

    setSyncStatus('pending');
    syncWithServer();
  }

  // Campanhas management
  async function addCampanha(campanhaData: Omit<Campanha, 'id' | 'user_id' | 'criado_em'>) {
    if (!profile) return;
    const id = crypto.randomUUID();
    const newCampanha: Campanha = {
      ...campanhaData,
      id,
      user_id: profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('campanhas', newCampanha);
    await db.addToSyncQueue({ type: 'campanha', action: 'create', data: newCampanha });
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
    await db.addToSyncQueue({ type: 'campanha', action: 'update', data: updated });
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
    await db.addToSyncQueue({ type: 'campanha', action: 'delete', data: original });
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
      user_id: profile.id,
      criado_em: new Date().toISOString()
    };

    await db.putItem('despesas_recorrentes', newDR);
    await db.addToSyncQueue({ type: 'despesa_recorrente', action: 'create', data: newDR });
    setDespesasRecorrentes(prev => [...prev, newDR]);

    setSyncStatus('pending');
    syncWithServer();
  }

  async function editDespesaRecorrente(id: string, updates: Partial<DespesaRecorrente>) {
    const original = despesasRecorrentes.find(dr => dr.id === id);
    if (!original) return;

    const updated = { ...original, ...updates };
    await db.putItem('despesas_recorrentes', updated);
    await db.addToSyncQueue({ type: 'despesa_recorrente', action: 'update', data: updated });
    setDespesasRecorrentes(prev => prev.map(dr => dr.id === id ? updated : dr));

    setSyncStatus('pending');
    syncWithServer();
  }

  async function deleteDespesaRecorrente(id: string) {
    const original = despesasRecorrentes.find(dr => dr.id === id);
    if (!original) return;

    await db.deleteItem('despesas_recorrentes', id);
    await db.addToSyncQueue({ type: 'despesa_recorrente', action: 'delete', data: original });
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
      vendas,
      despesas,
      produtos,
      fornecedores,
      zonasEntrega,
      campanhas,
      despesasRecorrentes,

      isOnline,
      syncStatus,
      syncWithServer,

      addVenda,
      addDespesa,
      addProduto,
      editProduto,
      addFornecedor,
      editFornecedor,
      addZonaEntrega,
      editZonaEntrega,
      
      addCaixinha,
      editCaixinha,
      deleteCaixinha,

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
