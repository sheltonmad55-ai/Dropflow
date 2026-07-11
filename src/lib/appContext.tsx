/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as db from './db.ts';
import { Profile, Caixinha, Venda, Despesa, Produto, Fornecedor, ZonaEntrega, SyncQueueItem } from '../types.ts';
import { 
  auth, 
  loginWithGoogle, 
  pullAllUserData, 
  pushQueueToFirestore,
  getFcmToken,
  registerForegroundFcm
} from './firebase.ts';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

interface AppContextType {
  // Auth
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, pais: string, moeda: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginDemo: (role: 'admin' | 'regular') => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  triggerMockUpgrade: () => Promise<void>;

  // Data State
  caixinhas: Caixinha[];
  vendas: Venda[];
  despesas: Despesa[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  zonasEntrega: ZonaEntrega[];

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
  addCaixinha: (nome: string, icone: string, cor: string, percentual?: number) => Promise<void>;
  editCaixinha: (id: string, updates: Partial<Caixinha>) => Promise<void>;
  deleteCaixinha: (id: string) => Promise<void>;

  // FCM / Push Notifications
  fcmSupported: boolean;
  fcmToken: string | null;
  activeAlert: { title: string; body: string; type: 'summary' | 'goal'; data?: any } | null;
  triggerLocalNotification: (title: string, body: string, type: 'summary' | 'goal', data?: any) => void;
  clearActiveAlert: () => void;
  requestFcmPermission: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // App data state
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [zonasEntrega, setZonasEntrega] = useState<ZonaEntrega[]>([]);

  // Sync / Online state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'offline'>(
    navigator.onLine ? 'synced' : 'offline'
  );

  // FCM / Notifications state
  const [fcmSupported, setFcmSupported] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<{ title: string; body: string; type: 'summary' | 'goal'; data?: any } | null>(null);

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

  // Load initial local data once authenticated and listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken();
          setToken(freshToken);
          localStorage.setItem('dropflow_token', freshToken);

          const freshData = await pullAllUserData(user.uid);
          let userProfile: Profile;

          if (freshData.profile) {
            userProfile = freshData.profile as Profile;
            // Safe merge user's email if missing
            if (user.email && !userProfile.email) {
              userProfile.email = user.email.toLowerCase();
              try {
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db: firestoreDb } = await import('./firebase.ts');
                await updateDoc(doc(firestoreDb, 'profiles', user.uid), { email: user.email.toLowerCase() });
              } catch (emailErr) {
                console.warn("Could not save user email to profile:", emailErr);
              }
            }
          } else {
            // Auto-create missing profile
            const trialExpiry = new Date();
            trialExpiry.setDate(trialExpiry.getDate() + 7);
            userProfile = {
              id: user.uid,
              nome: user.displayName || user.email?.split('@')[0] || 'Utilizador DropFlow',
              email: user.email || undefined,
              pais: 'Moçambique',
              moeda: 'MT',
              plano: 'trial',
              trial_expires_at: trialExpiry.toISOString(),
              anuncios_percent: 50,
              lucro_percent: 50,
              criado_em: new Date().toISOString()
            };

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

            try {
              await pushQueueToFirestore([
                { type: 'profile', action: 'create', data: userProfile },
                ...defaultCaixinhas.map(cx => ({ type: 'caixinha', action: 'create', data: cx }))
              ]);
              // Save to local IndexedDB
              await db.putItem('profiles', userProfile);
              for (const cx of defaultCaixinhas) {
                await db.putItem('caixinhas', cx);
              }
            } catch (createErr) {
              console.warn("Could not push auto-created profile to Firestore:", createErr);
            }
          }

          setProfile(userProfile);
          localStorage.setItem('dropflow_profile', JSON.stringify(userProfile));
          await db.putItem('profiles', userProfile);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Error pulling user data on auth state change:", e);
        }
      } else {
        setToken(null);
        setProfile(null);
        setIsAuthenticated(false);
        localStorage.removeItem('dropflow_token');
        localStorage.removeItem('dropflow_profile');
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Check FCM Support and Load Token if available on startup
  useEffect(() => {
    async function initFcm() {
      if (isAuthenticated && profile) {
        try {
          const tokenVal = await getFcmToken();
          if (tokenVal) {
            setFcmToken(tokenVal);
            setFcmSupported(true);
          }
        } catch (e) {
          console.warn('FCM initial check bypassed or unsupported');
        }
      }
    }
    initFcm();
  }, [isAuthenticated]);

  // Handle Foreground FCM listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (isAuthenticated && profile) {
      registerForegroundFcm((payload) => {
        console.log('FCM Foreground payload received:', payload);
        const title = payload.notification?.title || 'Notificação Dropflow';
        const body = payload.notification?.body || 'Mensagem do sistema.';
        triggerLocalNotification(title, body, 'summary', payload.data);
      }).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, profile]);

  function triggerLocalNotification(title: string, body: string, type: 'summary' | 'goal', data?: any) {
    setActiveAlert({ title, body, type, data });
    
    // Play double-chime synth sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      setTimeout(() => {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        setTimeout(() => osc.stop(), 350);
      }, 150);
    } catch (e) {
      console.log('Audio preview bypassed');
    }

    // Standard HTML5 Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.log('HTML5 notification blocked or failed in iframe');
      }
    }
  }

  function clearActiveAlert() {
    setActiveAlert(null);
  }

  async function requestFcmPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('Browser does not support notifications.');
        return false;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getFcmToken();
        if (token && profile) {
          setFcmToken(token);
          setFcmSupported(true);
          await updateProfile({ fcm_token: token, fcm_enabled: true });
          return true;
        } else {
          // If token registration fails but permission was granted, allow simulated notifications
          setFcmSupported(true);
          await updateProfile({ fcm_enabled: true });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Whenever user becomes authenticated, load local storage & database
  useEffect(() => {
    if (isAuthenticated && profile) {
      loadAllLocalData();
      // Schedule periodic background synchronization
      const interval = setInterval(() => {
        if (navigator.onLine) {
          syncWithServer();
        }
      }, 20000); // sync every 20s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, profile?.id]);

  async function loadAllLocalData() {
    try {
      const dbProfiles = await db.getAll<Profile>('profiles');
      const currentUserProfile = dbProfiles.find(p => p.id === profile?.id);
      if (currentUserProfile) {
        setProfile(currentUserProfile);
      }

      const dbCaixinhas = await db.getAll<Caixinha>('caixinhas');
      setCaixinhas(dbCaixinhas.filter(c => c.user_id === profile?.id));

      const dbVendas = await db.getAll<Venda>('vendas');
      setVendas(dbVendas.filter(v => v.user_id === profile?.id).sort((a,b) => b.data_venda.localeCompare(a.data_venda)));

      const dbDespesas = await db.getAll<Despesa>('despesas');
      setDespesas(dbDespesas.filter(d => d.user_id === profile?.id).sort((a,b) => b.data.localeCompare(a.data)));

      const dbProdutos = await db.getAll<Produto>('produtos');
      setProdutos(dbProdutos.filter(p => p.user_id === profile?.id));

      const dbFornecedores = await db.getAll<Fornecedor>('fornecedores');
      setFornecedores(dbFornecedores.filter(f => f.user_id === profile?.id));

      const dbZonas = await db.getAll<ZonaEntrega>('zonas_entrega');
      setZonasEntrega(dbZonas.filter(z => z.user_id === profile?.id));

      const queue = await db.getAll<SyncQueueItem>('sync_queue');
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const freshToken = await user.getIdToken();
      
      const data = await pullAllUserData(user.uid);
      let userProfile: Profile;

      if (data.profile) {
        userProfile = data.profile as Profile;
        // Merge user email if missing
        if (user.email && !userProfile.email) {
          userProfile.email = user.email.toLowerCase();
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db: firestoreDb } = await import('./firebase.ts');
            await updateDoc(doc(firestoreDb, 'profiles', user.uid), { email: user.email.toLowerCase() });
          } catch (emailErr) {
            console.warn("Could not save user email to profile:", emailErr);
          }
        }
      } else {
        // Auto-create missing profile
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 7);
        userProfile = {
          id: user.uid,
          nome: user.displayName || user.email?.split('@')[0] || 'Utilizador DropFlow',
          email: user.email || email.toLowerCase(),
          pais: 'Moçambique',
          moeda: 'MT',
          plano: 'trial',
          trial_expires_at: trialExpiry.toISOString(),
          anuncios_percent: 50,
          lucro_percent: 50,
          criado_em: new Date().toISOString()
        };

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

        try {
          await pushQueueToFirestore([
            { type: 'profile', action: 'create', data: userProfile },
            ...defaultCaixinhas.map(cx => ({ type: 'caixinha', action: 'create', data: cx }))
          ]);
          data.caixinhas = defaultCaixinhas;
        } catch (createErr) {
          console.warn("Could not push auto-created profile to Firestore:", createErr);
        }
      }

      localStorage.setItem('dropflow_token', freshToken);
      localStorage.setItem('dropflow_profile', JSON.stringify(userProfile));

      // Overwrite local tables in IndexedDB
      await db.putItem('profiles', userProfile);
      
      await db.clearStore('caixinhas');
      for (const cx of data.caixinhas) {
        await db.putItem('caixinhas', cx);
      }
      
      await db.clearStore('vendas');
      for (const vd of data.vendas) {
        await db.putItem('vendas', vd);
      }

      await db.clearStore('despesas');
      for (const dp of data.despesas) {
        await db.putItem('despesas', dp);
      }

      await db.clearStore('produtos');
      for (const pr of data.produtos) {
        await db.putItem('produtos', pr);
      }

      await db.clearStore('fornecedores');
      for (const fn of data.fornecedores) {
        await db.putItem('fornecedores', fn);
      }

      await db.clearStore('zonas_entrega');
      for (const zn of data.zonas_entrega) {
        await db.putItem('zonas_entrega', zn);
      }

      setToken(freshToken);
      setProfile(userProfile);
      setIsAuthenticated(true);
      
      // Perform instant full sync to pull everything
      setTimeout(() => syncWithServer(), 100);
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
      const freshToken = await user.getIdToken();

      // Calculate trial expiry (7 days from now)
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const newProfile: Profile = {
        id: user.uid,
        nome,
        email: email.toLowerCase(),
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

      // Save to local IndexedDB
      await db.putItem('profiles', newProfile);
      for (const cx of defaultCaixinhas) {
        await db.putItem('caixinhas', cx);
      }

      localStorage.setItem('dropflow_token', freshToken);
      localStorage.setItem('dropflow_profile', JSON.stringify(newProfile));

      setToken(freshToken);
      setProfile(newProfile);
      setIsAuthenticated(true);
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

      if (userProfile) {
        // Safe merge user's email if missing
        if (user.email && !userProfile.email) {
          userProfile.email = user.email.toLowerCase();
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db: firestoreDb } = await import('./firebase.ts');
            await updateDoc(doc(firestoreDb, 'profiles', user.uid), { email: user.email.toLowerCase() });
          } catch (emailErr) {
            console.warn("Could not save user email to profile:", emailErr);
          }
        }
      } else {
        // If not, register a new profile with Google's details
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 7);

        userProfile = {
          id: user.uid,
          nome: user.displayName || 'Empreendedor Google',
          email: user.email?.toLowerCase() || undefined,
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
      
      await db.clearStore('caixinhas');
      for (const cx of userCaixinhas) {
        await db.putItem('caixinhas', cx);
      }

      await db.clearStore('vendas');
      if (data.vendas) {
        for (const vd of data.vendas) {
          await db.putItem('vendas', vd);
        }
      }

      await db.clearStore('despesas');
      if (data.despesas) {
        for (const dp of data.despesas) {
          await db.putItem('despesas', dp);
        }
      }

      await db.clearStore('produtos');
      if (data.produtos) {
        for (const pr of data.produtos) {
          await db.putItem('produtos', pr);
        }
      }

      await db.clearStore('fornecedores');
      if (data.fornecedores) {
        for (const fn of data.fornecedores) {
          await db.putItem('fornecedores', fn);
        }
      }

      await db.clearStore('zonas_entrega');
      if (data.zonas_entrega) {
        for (const zn of data.zonas_entrega) {
          await db.putItem('zonas_entrega', zn);
        }
      }

      localStorage.setItem('dropflow_token', freshToken);
      localStorage.setItem('dropflow_profile', JSON.stringify(userProfile));

      setToken(freshToken);
      setProfile(userProfile);
      setIsAuthenticated(true);

      // Perform instant full sync to pull everything
      setTimeout(() => syncWithServer(), 100);
    } catch (e: any) {
      setIsLoadingAuth(false);
      throw e;
    }
  }

  async function loginDemo(role: 'admin' | 'regular') {
    setIsLoadingAuth(true);
    try {
      const demoId = role === 'admin' ? 'demo-admin-id' : 'demo-user-id';
      const demoEmail = role === 'admin' ? 'sheltonmad55@gmail.com' : 'convidado@dropflow.com';
      const demoNome = role === 'admin' ? 'Shelton Mad' : 'Empreendedor Convidado';
      const freshToken = 'demo-token-' + crypto.randomUUID();

      const demoProfile: Profile = {
        id: demoId,
        nome: demoNome,
        email: demoEmail,
        pais: 'Moçambique',
        moeda: 'MT',
        plano: role === 'admin' ? 'pro' : 'trial',
        trial_expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        anuncios_percent: 50,
        lucro_percent: 50,
        criado_em: new Date().toISOString()
      };

      const defaultCaixinhas: Caixinha[] = [
        {
          id: 'demo-cx-lucro',
          user_id: demoId,
          nome: 'Lucro',
          icone: '📈',
          cor: 'bg-emerald-500',
          tipo: 'lucro',
          saldo_atual: 45000,
          criado_em: new Date().toISOString()
        },
        {
          id: 'demo-cx-anuncios',
          user_id: demoId,
          nome: 'Anúncios',
          icone: '📢',
          cor: 'bg-sky-500',
          tipo: 'anuncios',
          saldo_atual: 15000,
          criado_em: new Date().toISOString()
        },
        {
          id: 'demo-cx-fornecedores',
          user_id: demoId,
          nome: 'Produtos/Fornecedores',
          icone: '📦',
          cor: 'bg-amber-500',
          tipo: 'fornecedores',
          saldo_atual: 22000,
          criado_em: new Date().toISOString()
        },
        {
          id: 'demo-cx-delivery',
          user_id: demoId,
          nome: 'Delivery',
          icone: '🚚',
          cor: 'bg-indigo-500',
          tipo: 'delivery',
          saldo_atual: 8000,
          criado_em: new Date().toISOString()
        }
      ];

      // Save to local IndexedDB
      await db.putItem('profiles', demoProfile);
      for (const cx of defaultCaixinhas) {
        await db.putItem('caixinhas', cx);
      }

      localStorage.setItem('dropflow_token', freshToken);
      localStorage.setItem('dropflow_profile', JSON.stringify(demoProfile));

      setToken(freshToken);
      setProfile(demoProfile);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (e) {
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

  // Bi-directional Synchronization Engine using client-side Firestore
  async function syncWithServer() {
    if (!token || !profile || !navigator.onLine || !auth.currentUser) {
      return;
    }

    setSyncStatus('syncing');
    try {
      // 1. Get the local queue
      const queue = await db.getAll<SyncQueueItem>('sync_queue');

      // 2. Post queue to Firestore
      if (queue.length > 0) {
        await pushQueueToFirestore(queue);
      }

      // 3. Pull fresh data from Firestore
      const serverData = await pullAllUserData(profile.id);

      // 4. Update client database with the returned gold standard from server
      if (serverData) {
        // Clear all local tables before re-populating to prevent sync bloat or mismatches
        const storesToUpdate = [
          { store: 'profiles', data: serverData.profile ? [serverData.profile] : [] },
          { store: 'caixinhas', data: serverData.caixinhas },
          { store: 'vendas', data: serverData.vendas },
          { store: 'despesas', data: serverData.despesas },
          { store: 'produtos', data: serverData.produtos },
          { store: 'fornecedores', data: serverData.fornecedores },
          { store: 'zonas_entrega', data: serverData.zonas_entrega }
        ];

        for (const item of storesToUpdate) {
          await db.clearStore(item.store);
          for (const row of item.data) {
            await db.putItem(item.store, row);
          }
        }

        // Clear successfully synced items from queue
        await db.clearStore('sync_queue');

        // Reload local React state with fresh server data
        if (serverData.profile) setProfile(serverData.profile as Profile);
        setCaixinhas(serverData.caixinhas as Caixinha[]);
        setVendas((serverData.vendas as Venda[]).sort((a: any, b: any) => b.data_venda.localeCompare(a.data_venda)));
        setDespesas((serverData.despesas as Despesa[]).sort((a: any, b: any) => b.data.localeCompare(a.data)));
        setProdutos(serverData.produtos as Produto[]);
        setFornecedores(serverData.fornecedores as Fornecedor[]);
        setZonasEntrega(serverData.zonas_entrega as ZonaEntrega[]);
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
    
    // Find selected product
    const product = produtos.find(p => p.id === vendaData.produto_id);
    const purchaseCost = product ? product.preco_compra : 0;

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

    // 3. Distribute remainder between Ads and Profit
    const remainder = value - purchaseCost - shippingCost;
    if (remainder > 0) {
      const adsPercent = vendaData.custom_anuncios_percent !== undefined ? vendaData.custom_anuncios_percent : profile.anuncios_percent;
      const adsAmount = Math.round(remainder * (adsPercent / 100) * 100) / 100;
      const profitAmount = Math.round((remainder - adsAmount) * 100) / 100;

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

    // Deduct stock quantity of product by 1
    if (product) {
      const newQty = Math.max(0, product.quantidade - 1);
      const updatedProduct = { ...product, quantidade: newQty };
      await db.putItem('produtos', updatedProduct);
      await db.addToSyncQueue({ type: 'produto', action: 'update', data: updatedProduct });
      setProdutos(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    }

    // Save Venda to Local DB & queue sync
    await db.putItem('vendas', newVenda);
    await db.addToSyncQueue({ type: 'venda', action: 'create', data: newVenda });

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
  async function addCaixinha(nome: string, icone: string, cor: string, percentual?: number) {
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

  return (
    <AppContext.Provider value={{
      profile,
      token,
      isAuthenticated,
      isLoadingAuth,
      login,
      register,
      loginGoogle,
      loginDemo,
      logout,
      updateProfile,
      triggerMockUpgrade,

      caixinhas,
      vendas,
      despesas,
      produtos,
      fornecedores,
      zonasEntrega,

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

      fcmSupported,
      fcmToken,
      activeAlert,
      triggerLocalNotification,
      clearActiveAlert,
      requestFcmPermission
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
