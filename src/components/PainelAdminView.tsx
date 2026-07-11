/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { useApp } from '../lib/appContext.tsx';
import { Profile, Caixinha, Venda, Despesa, Produto } from '../types.ts';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Filter, 
  Search, 
  Award, 
  RefreshCw, 
  ChevronRight, 
  Eye, 
  Package, 
  ArrowLeft, 
  Plus,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function PainelAdminView() {
  const { profile } = useApp();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'todos' | 'trial' | 'pro'>('todos');
  
  // Selected user for details & operations
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedUserCaixinhas, setSelectedUserCaixinhas] = useState<Caixinha[]>([]);
  const [selectedUserVendas, setSelectedUserVendas] = useState<Venda[]>([]);
  const [selectedUserDespesas, setSelectedUserDespesas] = useState<Despesa[]>([]);
  const [selectedUserProdutos, setSelectedUserProdutos] = useState<Produto[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'info' | 'caixinhas' | 'vendas' | 'despesas' | 'produtos'>('info');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editPais, setEditPais] = useState('');
  const [editMoeda, setEditMoeda] = useState('');
  const [editTrialExpiry, setEditTrialExpiry] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = profile?.email === 'sheltonmad55@gmail.com' || auth.currentUser?.email === 'sheltonmad55@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadProfiles();
    }
  }, [isAdmin]);

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const q = collection(db, 'profiles');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Profile));
      setProfiles(list.sort((a, b) => b.criado_em.localeCompare(a.criado_em)));
    } catch (err: any) {
      console.error('Error loading profiles for admin:', err);
      setError('Erro ao carregar perfis dos utilizadores. Verifique se as regras do Firestore foram atualizadas.');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedUserDetails = async (userProfile: Profile) => {
    setLoadingDetails(true);
    setError('');
    setSelectedProfile(userProfile);
    setActiveDetailsTab('info');
    setIsEditing(false);
    
    // Initialize edit fields
    setEditNome(userProfile.nome);
    setEditPais(userProfile.pais);
    setEditMoeda(userProfile.moeda);
    setEditTrialExpiry(userProfile.trial_expires_at ? userProfile.trial_expires_at.split('T')[0] : '');

    try {
      const fetchUserCollection = async (colName: string) => {
        const q = query(collection(db, colName), where('user_id', '==', userProfile.id));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      };

      const [caxs, vends, desps, prods] = await Promise.all([
        fetchUserCollection('caixinhas'),
        fetchUserCollection('vendas'),
        fetchUserCollection('despesas'),
        fetchUserCollection('produtos')
      ]);

      setSelectedUserCaixinhas(caxs as Caixinha[]);
      setSelectedUserVendas(vends as Venda[]);
      setSelectedUserDespesas(desps as Despesa[]);
      setSelectedUserProdutos(prods as Produto[]);
    } catch (err: any) {
      console.error('Error fetching details:', err);
      setError('Falha ao carregar todos os dados do utilizador selecionado.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const docRef = doc(db, 'profiles', selectedProfile.id);
      const trialExpiryDate = editTrialExpiry ? new Date(editTrialExpiry).toISOString() : selectedProfile.trial_expires_at;
      
      const updates = {
        nome: editNome,
        pais: editPais,
        moeda: editMoeda,
        trial_expires_at: trialExpiryDate
      };

      await updateDoc(docRef, updates);
      
      // Update local profiles list
      setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, ...updates } : p));
      setSelectedProfile(prev => prev ? { ...prev, ...updates } : null);
      
      setIsEditing(false);
      setSuccessMessage('Perfil do utilizador atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      setError('Erro ao atualizar o perfil no Firestore.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePlan = async (userProfile: Profile) => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    const newPlan = userProfile.plano === 'pro' ? 'trial' : 'pro';

    try {
      const docRef = doc(db, 'profiles', userProfile.id);
      await updateDoc(docRef, { plano: newPlan });

      setProfiles(prev => prev.map(p => p.id === userProfile.id ? { ...p, plano: newPlan } : p));
      if (selectedProfile && selectedProfile.id === userProfile.id) {
        setSelectedProfile(prev => prev ? { ...prev, plano: newPlan } : null);
      }
      setSuccessMessage(`Plano do utilizador alterado para ${newPlan.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error toggling plan:', err);
      setError('Erro ao atualizar o plano de subscrição.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendTrial = async (userProfile: Profile, days: number) => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const currentExpiry = userProfile.trial_expires_at ? new Date(userProfile.trial_expires_at) : new Date();
      // If trial was already expired, start from today
      const baseDate = currentExpiry.getTime() < Date.now() ? new Date() : currentExpiry;
      baseDate.setDate(baseDate.getDate() + days);

      const newExpiryStr = baseDate.toISOString();
      const docRef = doc(db, 'profiles', userProfile.id);
      await updateDoc(docRef, { trial_expires_at: newExpiryStr });

      setProfiles(prev => prev.map(p => p.id === userProfile.id ? { ...p, trial_expires_at: newExpiryStr } : p));
      if (selectedProfile && selectedProfile.id === userProfile.id) {
        setSelectedProfile(prev => prev ? { ...prev, trial_expires_at: newExpiryStr } : null);
        setEditTrialExpiry(newExpiryStr.split('T')[0]);
      }

      setSuccessMessage(`Período de trial estendido por +${days} dias!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error extending trial:', err);
      setError('Erro ao estender o período de trial.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userProfile: Profile) => {
    const confirmDelete = window.confirm(`Tem a certeza absoluta de que deseja ELIMINAR a conta e todo o perfil do utilizador "${userProfile.nome}" (${userProfile.email || 'Sem email'})?\nEsta ação é irreversível e removerá o perfil do Firestore.`);
    if (!confirmDelete) return;

    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Delete profile document
      await deleteDoc(doc(db, 'profiles', userProfile.id));

      // Also clean up related records across collections in a batch if permissions allow
      try {
        const batch = writeBatch(db);
        const collectionsToClear = ['caixinhas', 'vendas', 'despesas', 'produtos', 'fornecedores', 'zonas_entrega'];
        
        for (const col of collectionsToClear) {
          const q = query(collection(db, col), where('user_id', '==', userProfile.id));
          const snap = await getDocs(q);
          snap.docs.forEach(d => {
            batch.delete(doc(db, col, d.id));
          });
        }
        await batch.commit();
      } catch (cleanError) {
        console.warn('Could not clean up child subcollections (it is fine if rules restrict it):', cleanError);
      }

      setProfiles(prev => prev.filter(p => p.id !== userProfile.id));
      setSelectedProfile(null);
      setSuccessMessage(`Utilizador "${userProfile.nome}" eliminado com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError('Erro ao eliminar o perfil do utilizador.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm space-y-4" id="admin_restricted_view">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-full border border-rose-100">
          <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h2 className="text-lg font-black text-slate-900 font-display">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Esta área é reservada exclusivamente para o Administrador oficial da plataforma (<span className="font-semibold text-slate-900">sheltonmad55@gmail.com</span>).
        </p>
      </div>
    );
  }

  // Filtered profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (planFilter === 'todos') return matchesSearch;
    return matchesSearch && p.plano === planFilter;
  });

  // Global platform statistics
  const totalUsersCount = profiles.length;
  const proUsersCount = profiles.filter(p => p.plano === 'pro').length;
  const trialUsersCount = profiles.filter(p => p.plano === 'trial').length;

  return (
    <div className="space-y-6" id="admin_dashboard_root">
      
      {/* Title */}
      <div className="flex justify-between items-center" id="admin_title_group">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Consola do Administrador
          </h1>
          <p className="text-xs text-slate-400">Olá Shelton Mad, gira e monitorize toda a infraestrutura DropFlow.</p>
        </div>
        <button 
          onClick={loadProfiles} 
          disabled={loading}
          className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 border border-slate-100 rounded-xl transition-colors disabled:opacity-50"
          title="Recarregar dados"
          id="btn_refresh_admin"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Global stats bento grids */}
      <div className="grid grid-cols-3 gap-3" id="admin_bento_grids">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 text-center space-y-1" id="bento_users">
          <div className="flex justify-center text-slate-400"><Users className="w-5 h-5" /></div>
          <div className="text-xl font-black text-slate-900">{loading ? '...' : totalUsersCount}</div>
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Membros</div>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center space-y-1" id="bento_pro">
          <div className="flex justify-center text-emerald-600"><Award className="w-5 h-5" /></div>
          <div className="text-xl font-black text-emerald-700">{loading ? '...' : proUsersCount}</div>
          <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Premium Pro</div>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50 text-center space-y-1" id="bento_trials">
          <div className="flex justify-center text-sky-600"><Clock className="w-5 h-5" /></div>
          <div className="text-xl font-black text-sky-700">{loading ? '...' : trialUsersCount}</div>
          <div className="text-[9px] text-sky-600 font-bold uppercase tracking-wider">Trial 7 Dias</div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-xl text-xs text-center font-bold animate-fade-in" id="admin_success_msg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs text-center font-bold" id="admin_error_msg">
          {error}
        </div>
      )}

      {/* Main administration area */}
      {!selectedProfile ? (
        <div className="space-y-4" id="users_list_section">
          
          {/* Search bar & Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5" id="users_filters_row">
            <div className="relative flex-1" id="admin_search_group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin_search_input"
                type="text"
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            
            <div className="flex gap-1.5" id="admin_filter_group">
              {(['todos', 'trial', 'pro'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPlanFilter(filter)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-all ${planFilter === filter ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* User profiles list */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden" id="profiles_table_container">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
                A listar empreendedores de dropshipping...
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum empreendedor encontrado com os filtros atuais.
              </div>
            ) : (
              filteredProfiles.map((user) => {
                const isPro = user.plano === 'pro';
                const hasExpired = user.plano === 'trial' && user.trial_expires_at && new Date(user.trial_expires_at).getTime() < Date.now();
                
                return (
                  <div 
                    key={user.id} 
                    className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between cursor-pointer"
                    onClick={() => loadSelectedUserDetails(user)}
                    id={`profile_item_${user.id}`}
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{user.nome}</span>
                        {isPro ? (
                          <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full tracking-wider">Pro</span>
                        ) : hasExpired ? (
                          <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full tracking-wider">Expirado</span>
                        ) : (
                          <span className="text-[8px] font-black uppercase bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full tracking-wider">Trial</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-mono">{user.email || 'Sem email registado'}</p>
                      <div className="flex items-center gap-3 text-[9px] text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-slate-400" /> {user.pais || 'Moçambique'} ({user.moeda || 'MT'})</span>
                        <span className="text-slate-300">|</span>
                        <span>Membro desde: {user.criado_em ? user.criado_em.split('T')[0] : 'Desconhecido'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Selected User Details view */
        <div className="space-y-5 animate-fade-in" id="user_details_section">
          
          {/* Back Header */}
          <button 
            onClick={() => setSelectedProfile(null)}
            className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 gap-1.5"
            id="btn_back_to_list"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a lista de utilizadores
          </button>

          {/* User profile card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="user_details_summary_card">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">{selectedProfile.nome}</h2>
                  {selectedProfile.plano === 'pro' ? (
                    <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full tracking-wider">Premium Pro</span>
                  ) : (
                    <span className="text-[8px] font-black uppercase bg-sky-500 text-white px-1.5 py-0.5 rounded-full tracking-wider">Trial Grátis</span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400">{selectedProfile.email || 'Nenhum email fornecido'}</p>
                <p className="text-[10px] text-slate-500">ID Único: {selectedProfile.id}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5" id="user_card_actions">
                <button
                  id="btn_toggle_user_plan"
                  onClick={() => handleTogglePlan(selectedProfile)}
                  disabled={actionLoading}
                  className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${selectedProfile.plano === 'pro' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{selectedProfile.plano === 'pro' ? 'Despromover' : 'Promover Pro'}</span>
                </button>
                <button
                  id="btn_delete_user"
                  onClick={() => handleDeleteUser(selectedProfile)}
                  disabled={actionLoading}
                  className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Eliminar utilizador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 gap-4 text-xs" id="user_quick_metrics_grid">
              <div>
                <span className="text-slate-400 text-[10px]">País de Atuação:</span>
                <p className="font-bold text-slate-800">{selectedProfile.pais || 'Moçambique'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Moeda Monetária:</span>
                <p className="font-bold text-slate-800">{selectedProfile.moeda || 'MT'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Data de Expiração (Trial):</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {selectedProfile.trial_expires_at ? new Date(selectedProfile.trial_expires_at).toLocaleDateString() : 'Sem data'}
                  {selectedProfile.plano === 'trial' && selectedProfile.trial_expires_at && new Date(selectedProfile.trial_expires_at).getTime() < Date.now() && (
                    <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-1 rounded">EXPIRADO</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Divisão de Sobras:</span>
                <p className="font-bold text-slate-800">📢 {selectedProfile.anuncios_percent}% Anúncios | 💰 {selectedProfile.lucro_percent}% Lucro</p>
              </div>
            </div>

            {/* Trial shortcuts */}
            {selectedProfile.plano === 'trial' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" id="trial_extend_pnl">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Estender Trial do Utilizador:
                </span>
                <div className="flex gap-1.5" id="trial_shortcuts_group">
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => handleExtendTrial(selectedProfile, days)}
                      disabled={actionLoading}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-[10px] cursor-pointer"
                    >
                      +{days} Dias
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs header for relations */}
          <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap" id="user_details_tabs">
            {(['info', 'caixinhas', 'vendas', 'despesas', 'produtos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDetailsTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeDetailsTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'info' ? 'Editar Perfil' :
                 tab === 'caixinhas' ? `Pockets (${selectedUserCaixinhas.length})` :
                 tab === 'vendas' ? `Vendas (${selectedUserVendas.length})` :
                 tab === 'despesas' ? `Despesas (${selectedUserDespesas.length})` :
                 `Produtos (${selectedUserProdutos.length})`}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="min-h-48" id="details_tab_content">
            
            {/* EDIT PROFILE FORM */}
            {activeDetailsTab === 'info' && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm" id="tab_content_info">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Modificar Parâmetros de Perfil</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4" id="form_edit_user_profile">
                  <div className="space-y-1" id="edit_user_nome_group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Comercial</label>
                    <input
                      id="edit_user_nome"
                      type="text"
                      required
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3" id="edit_user_selectors_grid">
                    <div className="space-y-1" id="edit_user_pais_group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">País</label>
                      <input
                        id="edit_user_pais"
                        type="text"
                        required
                        value={editPais}
                        onChange={(e) => setEditPais(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="edit_user_moeda_group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Moeda</label>
                      <input
                        id="edit_user_moeda"
                        type="text"
                        required
                        value={editMoeda}
                        onChange={(e) => setEditMoeda(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1" id="edit_user_trial_group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data Limite do Período de Experiência (Trial)</label>
                    <input
                      id="edit_user_trial"
                      type="date"
                      value={editTrialExpiry}
                      onChange={(e) => setEditTrialExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    id="btn_submit_edit_profile"
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{actionLoading ? 'A guardar alterações...' : 'Gravar Alterações'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* POCKETS / CAIXINHAS */}
            {activeDetailsTab === 'caixinhas' && (
              <div className="space-y-3" id="tab_content_caixinhas">
                {selectedUserCaixinhas.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    Nenhum pocket financeiro registado no servidor.
                  </div>
                ) : (
                  selectedUserCaixinhas.map((cx) => (
                    <div key={cx.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex justify-between items-center" id={`details_cx_${cx.id}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl text-white ${cx.cor || 'bg-slate-400'}`}>
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{cx.nome}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{cx.tipo}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">{cx.saldo_atual.toLocaleString()} {selectedProfile.moeda}</span>
                        <span className="text-[9px] text-slate-400">Saldo atual</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SALES / VENDAS */}
            {activeDetailsTab === 'vendas' && (
              <div className="space-y-3" id="tab_content_vendas">
                {selectedUserVendas.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    Nenhuma venda registada no servidor.
                  </div>
                ) : (
                  selectedUserVendas.map((vd) => (
                    <div key={vd.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2" id={`details_venda_${vd.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold">{vd.data_venda} | ID: {vd.id.slice(0, 8)}...</span>
                          <p className="text-xs font-bold text-slate-800">Forma de pagamento: {vd.forma_pagamento}</p>
                        </div>
                        <span className="text-xs font-black text-emerald-600">+{vd.valor_recebido.toLocaleString()} {selectedProfile.moeda}</span>
                      </div>
                      {vd.observacao && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">"{vd.observacao}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EXPENSES / DESPESAS */}
            {activeDetailsTab === 'despesas' && (
              <div className="space-y-3" id="tab_content_despesas">
                {selectedUserDespesas.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    Nenhuma despesa registada no servidor.
                  </div>
                ) : (
                  selectedUserDespesas.map((dp) => (
                    <div key={dp.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex justify-between items-center animate-fade-in" id={`details_desp_${dp.id}`}>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold">{dp.data}</span>
                        <p className="text-xs font-bold text-slate-800">{dp.descricao}</p>
                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-semibold">{dp.categoria}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-600">-{dp.valor.toLocaleString()} {selectedProfile.moeda}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PRODUCTS / PRODUTOS */}
            {activeDetailsTab === 'produtos' && (
              <div className="space-y-3" id="tab_content_produtos">
                {selectedUserProdutos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    Nenhum produto registado no servidor.
                  </div>
                ) : (
                  selectedUserProdutos.map((pr) => (
                    <div key={pr.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex justify-between items-center" id={`details_prod_${pr.id}`}>
                      <div>
                        <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">{pr.categoria}</span>
                        <h4 className="text-xs font-extrabold text-slate-800 mt-1">{pr.nome}</h4>
                        <div className="flex gap-3 text-[9px] text-slate-400 mt-0.5">
                          <span>Preço de compra: <strong className="text-slate-600">{pr.preco_compra} {selectedProfile.moeda}</strong></span>
                          <span>|</span>
                          <span>Preço de venda: <strong className="text-slate-600">{pr.preco_venda} {selectedProfile.moeda}</strong></span>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg block">+{pr.margem ? pr.margem.toFixed(0) : '0'}% Margem</span>
                        <span className="text-[9px] text-slate-400 block">Qtd: {pr.quantidade}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
