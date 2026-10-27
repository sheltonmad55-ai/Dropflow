/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useApp } from '../lib/appContext.tsx';
import { 
  Users, 
  Megaphone, 
  Shield, 
  Search, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  RefreshCw,
  Clock,
  Activity,
  TrendingUp,
  DollarSign,
  Calendar,
  Smartphone,
  Laptop,
  Download,
  Flame,
  Sparkles,
  Filter,
  ArrowUpRight,
  UserCheck,
  ShoppingBag,
  Info,
  Trash2
} from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db as fDb } from '../lib/firebase.ts';

export default function AdminView() {
  const { allProfiles, broadcasts, addBroadcast, updateUserProfileByAdmin, deleteUserProfileByAdmin } = useApp();
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'hoje' | 'ativos' | 'vendas' | 'pro' | 'trial'>('todos');
  const [sortBy, setSortBy] = useState<'recentes' | 'faturamento' | 'ativos' | 'nome'>('recentes');

  // Announcement Form State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'todos' | 'trial_expira_2d'>('todos');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementImage, setAnnouncementImage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'aviso' | 'novidade'>('novidade');
  
  // User Config Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPlan, setNewPlan] = useState<'trial' | 'pro' | 'free' | 'expired'>('trial');
  const [isSuspended, setIsSuspended] = useState(false);
  const [trialExpiresDays, setTrialExpiresDays] = useState('15');
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalizeStatus, setNormalizeStatus] = useState('');

  const handleNormalizarPlanos = async () => {
    const pros = allProfiles.filter(u => {
      const email = (u.email || '').toLowerCase().trim();
      return u.plano === 'pro' && email !== 'sheltonmad55@gmail.com';
    });

    if (pros.length === 0) {
      alert("Não existem contas indevidas no plano PRO. Todas as outras contas já estão em TRIAL.");
      return;
    }

    const confirmRun = window.confirm(
      `Existem ${pros.length} conta(s) com plano PRO antigo.\n\nDesejas convertê-las para TRIAL (15 dias de teste) agora no Firestore?\n\nA conta Admin permanecerá intacta.`
    );
    if (!confirmRun) return;

    setIsNormalizing(true);
    setNormalizeStatus('A atualizar contas no Firestore...');
    try {
      const trialExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      let updatedCount = 0;

      for (const u of pros) {
        await updateUserProfileByAdmin(u.id, {
          plano: 'trial',
          trial_expires_at: trialExpiry
        });
        updatedCount++;
      }

      setNormalizeStatus(`Sucesso! ${updatedCount} conta(s) convertida(s) de PRO para TRIAL.`);
      setTimeout(() => setNormalizeStatus(''), 5000);
    } catch (err) {
      console.error(err);
      alert('Erro ao normalizar planos.');
    } finally {
      setIsNormalizing(false);
    }
  };
  
  // Admin Audit Logs
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isSendingAnnounce, setIsSendingAnnounce] = useState(false);
  const [announceSuccess, setAnnounceSuccess] = useState('');

  // Fetch admin logs real-time
  useEffect(() => {
    try {
      const q = query(collection(fDb, 'admin_logs'), orderBy('timestamp', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminLogs(logs);
      }, (err) => {
        console.error("Error reading admin logs:", err);
      });
      return unsubscribe;
    } catch (e) {
      console.error("Admin logs query failed:", e);
    }
  }, []);

  // Helper: Format exact ISO Date and Time
  const formatExactDateTime = (isoString?: string) => {
    if (!isoString) return 'Data não registada';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Data inválida';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoString;
    }
  };

  // Helper: Format relative friendly time
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Desconhecido';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 60) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      if (diffHours < 24 && d.getDate() === now.getDate()) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `Hoje às ${hh}:${mm}`;
      }
      if (diffDays === 1) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `Ontem às ${hh}:${mm}`;
      }
      if (diffDays < 7) return `Há ${diffDays} dias`;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()}`;
    } catch {
      return '---';
    }
  };

  // Helper: Activity indicator
  const getUserActivityStatus = (user: any) => {
    const lastActive = user.ultimo_acesso_em || user.criado_em;
    if (!lastActive) return { label: 'Sem registo', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' };
    
    const d = new Date(lastActive);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

    if (diffMinutes <= 10) {
      return { label: 'Online agora', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', dot: 'bg-emerald-500 animate-pulse' };
    }
    if (diffMinutes <= 1440 && d.getDate() === now.getDate()) {
      return { label: 'Ativo hoje', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', dot: 'bg-amber-500' };
    }
    if (diffMinutes <= 4320) {
      return { label: 'Ativo recente (2-3d)', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40', dot: 'bg-sky-400' };
    }
    const days = Math.floor(diffMinutes / 1440);
    return { label: `Inativo (${days}d)`, color: 'text-slate-400 dark:text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' };
  };

  // KPI Calculations
  const totalUsers = allProfiles.length;
  const proUsersCount = allProfiles.filter(u => u.plano === 'pro').length;
  const trialUsersCount = allProfiles.filter(u => u.plano === 'trial' || (!u.plano && u.trial_expires_at)).length;
  const suspendedCount = allProfiles.filter(u => u.suspenso === true).length;

  const todayStr = new Date().toDateString();
  const usersJoinedToday = allProfiles.filter(u => u.criado_em && new Date(u.criado_em).toDateString() === todayStr);
  const usersJoinedLast48h = allProfiles.filter(u => {
    if (!u.criado_em) return false;
    const diffHours = (Date.now() - new Date(u.criado_em).getTime()) / (1000 * 60 * 60);
    return diffHours <= 48;
  });

  const usersActiveToday = allProfiles.filter(u => {
    const last = u.ultimo_acesso_em || u.criado_em;
    if (!last) return false;
    return new Date(last).toDateString() === todayStr;
  });

  const usersWithSales = allProfiles.filter(u => (u.total_vendas_count || 0) > 0 || (u.total_faturamento || 0) > 0);
  const totalFaturamentoGeral = allProfiles.reduce((sum, u) => sum + (u.total_faturamento || 0), 0);
  const totalVendasGeral = allProfiles.reduce((sum, u) => sum + (u.total_vendas_count || 0), 0);

  // Helper to detect potential duplicate accounts (same name or same email)
  const duplicateMap = useMemo(() => {
    const nameCounts: Record<string, number> = {};
    const emailCounts: Record<string, number> = {};
    for (const u of allProfiles) {
      const cleanName = (u.nome || '').trim().toLowerCase();
      if (cleanName && cleanName !== 'sem nome') {
        nameCounts[cleanName] = (nameCounts[cleanName] || 0) + 1;
      }
      const cleanEmail = (u.email || '').trim().toLowerCase();
      if (cleanEmail) {
        emailCounts[cleanEmail] = (emailCounts[cleanEmail] || 0) + 1;
      }
    }
    return { nameCounts, emailCounts };
  }, [allProfiles]);

  const isPotentialDuplicate = (user: any) => {
    const cleanName = (user.nome || '').trim().toLowerCase();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    return (cleanName && duplicateMap.nameCounts[cleanName] > 1) || (cleanEmail && duplicateMap.emailCounts[cleanEmail] > 1);
  };

  // Filtered and Sorted Users List
  const filteredAndSortedUsers = useMemo(() => {
    let list = allProfiles.filter(user => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        (user.nome || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.pais || '').toLowerCase().includes(term)
      );

      if (!matchesSearch) return false;

      if (filterTab === 'hoje') {
        return user.criado_em && new Date(user.criado_em).toDateString() === todayStr;
      }
      if (filterTab === 'ativos') {
        const last = user.ultimo_acesso_em || user.criado_em;
        return last && new Date(last).toDateString() === todayStr;
      }
      if (filterTab === 'vendas') {
        return (user.total_vendas_count || 0) > 0 || (user.total_faturamento || 0) > 0;
      }
      if (filterTab === 'duplicados') {
        return isPotentialDuplicate(user);
      }
      if (filterTab === 'pro') {
        return user.plano === 'pro';
      }
      if (filterTab === 'trial') {
        return user.plano === 'trial' || (!user.plano && user.trial_expires_at);
      }
      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'recentes') {
        return (b.criado_em || '').localeCompare(a.criado_em || '');
      }
      if (sortBy === 'faturamento') {
        return (b.total_faturamento || 0) - (a.total_faturamento || 0);
      }
      if (sortBy === 'ativos') {
        return (b.ultimo_acesso_em || b.criado_em || '').localeCompare(a.ultimo_acesso_em || a.criado_em || '');
      }
      if (sortBy === 'nome') {
        return (a.nome || '').localeCompare(b.nome || '');
      }
      return 0;
    });

    return list;
  }, [allProfiles, searchTerm, filterTab, sortBy, todayStr, duplicateMap]);

  // Export Users CSV
  const handleExportUsersCsv = () => {
    if (allProfiles.length === 0) {
      alert("Não há utilizadores registados para exportar.");
      return;
    }

    const exportRows = allProfiles.map(u => {
      const status = getUserActivityStatus(u);
      return {
        'Nome': u.nome || 'Sem nome',
        'Email': u.email || 'Não informado',
        'ID Usuário': u.id,
        'Horário Exato de Adesão': formatExactDateTime(u.criado_em),
        'Data ISO Adesão': u.criado_em || '',
        'Plano Atual': u.plano || 'trial',
        'Expiração Trial': u.trial_expires_at || '',
        'Status Atividade': status.label,
        'Último Acesso': formatExactDateTime(u.ultimo_acesso_em),
        'Última Ação': u.ultimo_evento || '---',
        'Dispositivo': u.dispositivo || '---',
        'Total de Vendas Registadas': u.total_vendas_count || 0,
        'Faturamento Total': u.total_faturamento || 0,
        'País': u.pais || 'Moçambique',
        'Moeda': u.moeda || 'MT',
        'Conta Suspensa': u.suspenso ? 'Sim' : 'Não'
      };
    });

    const csv = Papa.unparse(exportRows);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dropflow_utilizadores_admin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setIsSendingAnnounce(true);
    setAnnounceSuccess('');
    try {
      await addBroadcast(
        announcementText, 
        announcementTarget,
        announcementTitle.trim() || undefined,
        announcementLink.trim() || undefined,
        announcementImage.trim() || undefined,
        announcementType
      );
      setAnnouncementText('');
      setAnnouncementTitle('');
      setAnnouncementLink('');
      setAnnouncementImage('');
      setAnnouncementType('novidade');
      setAnnounceSuccess('Banner / Comunicado de novidade transmitido com sucesso!');
      setTimeout(() => setAnnounceSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingAnnounce(false);
    }
  };

  const handleOpenUserConfig = (user: any) => {
    setSelectedUser(user);
    setNewPlan(user.plano || 'trial');
    setIsSuspended(!!user.suspenso);
    setEditNome(user.nome || '');
    setEditEmail(user.email || '');
    
    if (user.trial_expires_at) {
      const diff = new Date(user.trial_expires_at).getTime() - Date.now();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setTrialExpiresDays(days.toString());
    } else {
      setTrialExpiresDays('15');
    }
  };

  const handleSaveUserConfig = async () => {
    if (!selectedUser) return;
    try {
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + parseInt(trialExpiresDays || '15'));

      await updateUserProfileByAdmin(selectedUser.id, {
        nome: editNome.trim() || selectedUser.nome || 'Sem nome',
        email: editEmail.trim().toLowerCase(),
        plano: newPlan,
        suspenso: isSuspended,
        trial_expires_at: trialExpiry.toISOString()
      });
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar alterações.');
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (!userToDelete) return;
    const confirmDelete = window.confirm(
      `Tens a certeza que desejas eliminar a conta de "${userToDelete.nome || userToDelete.id}"?\n\nEsta ação removerá este registo definitivamente da base de dados Firestore.`
    );
    if (!confirmDelete) return;

    try {
      setIsDeletingUser(true);
      await deleteUserProfileByAdmin(userToDelete.id);
      setSelectedUser(null);
    } catch (err) {
      console.error("Erro ao eliminar conta:", err);
      alert('Erro ao eliminar conta.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin_dashboard">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 font-display">
              Painel de Controlo do Administrador
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitorização em tempo real de adesão, horários de entrada, planos ativos, métricas de vendas e engajamento.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleNormalizarPlanos}
            disabled={isNormalizing}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Converte contas antigas PRO para TRIAL"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isNormalizing ? 'A converter...' : '⚡ Corrigir PRO para TRIAL'}</span>
          </button>

          <button
            onClick={handleExportUsersCsv}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Descarregar relatório de utilizadores em CSV"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Exportar Utilizadores (CSV)</span>
          </button>
          
          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Admin Master</span>
          </span>
        </div>
      </div>

      {normalizeStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{normalizeStatus}</span>
        </div>
      )}

      {/* ORGANIC CAMPAIGN TRACKING HERO BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center space-x-1">
                <Flame className="w-3 h-3 fill-current" />
                <span>Mini Campanha Orgânica Ativa</span>
              </span>
              <span className="text-[10px] text-indigo-200 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Atualizado em tempo real</span>
              </span>
            </div>
            <h3 className="text-base font-black text-white">
              {usersJoinedToday.length > 0 
                ? `🚀 ${usersJoinedToday.length} novo(s) utilizador(es) entraram hoje através da tua campanha!`
                : `📈 ${usersJoinedLast48h.length} novos utilizadores entraram nas últimas 48 horas.`}
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Vê abaixo o horário exato de adesão de cada contato que recebeu o teu link, o plano atual e se já começaram a registrar faturamento ou adicionar vendas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-[9px] font-bold text-indigo-200 uppercase block">Hoje</span>
              <span className="text-xl font-black text-white">+{usersJoinedToday.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-[9px] font-bold text-indigo-200 uppercase block">Últimas 48h</span>
              <span className="text-xl font-black text-emerald-400">+{usersJoinedLast48h.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-[9px] font-bold text-indigo-200 uppercase block">Com Vendas</span>
              <span className="text-xl font-black text-amber-300">{usersWithSales.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" id="admin_stats_grid">
        
        {/* Total Cadastros */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Total Utilizadores</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50">{totalUsers}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
              +{usersJoinedToday.length} hoje
            </span>
          </div>
          <span className="text-[9px] text-slate-400 block">Cadastros totais no sistema</span>
        </div>

        {/* Em Trial */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Em Teste Grátis</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{trialUsersCount}</span>
            <span className="text-[10px] font-bold text-slate-400">
              ({totalUsers > 0 ? ((trialUsersCount / totalUsers) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <span className="text-[9px] text-slate-400 block">Trial de 15 dias ativo</span>
        </div>

        {/* Assinantes PRO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Assinantes PRO</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{proUsersCount}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
              {totalUsers > 0 ? ((proUsersCount / totalUsers) * 100).toFixed(0) : 0}% conv.
            </span>
          </div>
          <span className="text-[9px] text-slate-400 block">Plano Premium ilimitado</span>
        </div>

        {/* A Usar de Facto / Vendas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">A Usar de Facto</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-amber-500">{usersWithSales.length}</span>
            <span className="text-[10px] font-bold text-slate-400">
              com vendas
            </span>
          </div>
          <span className="text-[9px] text-slate-400 block">
            {totalVendasGeral} vendas registadas
          </span>
        </div>

        {/* Facturação Global Registada */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-1 relative overflow-hidden col-span-2 lg:col-span-1">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Facturação Geral</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              +{totalFaturamentoGeral.toLocaleString()}
            </span>
            <span className="text-[10px] font-extrabold text-slate-400">MT</span>
          </div>
          <span className="text-[9px] text-slate-400 block">Movimentação nos negócios</span>
        </div>
      </div>

      {/* MAIN ADMIN MANAGEMENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="admin_modules_grid">
        
        {/* USERS MONITOR PANEL (COL-SPAN 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 xl:col-span-2" id="user_management_panel">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Utilizadores & Horários de Entrada ({filteredAndSortedUsers.length})</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Acompanha a adesão exata da campanha e atividade de cada conta.
              </p>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="recentes">Mais Recentes</option>
                <option value="ativos">Mais Ativos</option>
                <option value="faturamento">Maior Facturação</option>
                <option value="nome">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            {[
              { id: 'todos', label: `Todos (${totalUsers})` },
              { id: 'hoje', label: `Entraram Hoje (${usersJoinedToday.length})`, highlight: usersJoinedToday.length > 0 },
              { id: 'ativos', label: `Ativos Hoje (${usersActiveToday.length})` },
              { id: 'vendas', label: `Com Vendas (${usersWithSales.length})` },
              { id: 'duplicados', label: 'Possíveis Duplicados', isAlert: true },
              { id: 'pro', label: `Plano PRO (${proUsersCount})` },
              { id: 'trial', label: `Em Trial (${trialUsersCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : (tab as any).isAlert
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : tab.highlight
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table List of Users */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full min-w-[700px] text-[11px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-black tracking-wider text-[9px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Utilizador & Contato</th>
                  <th className="px-4 py-3">Horário de Adesão</th>
                  <th className="px-4 py-3">Plano & Teste</th>
                  <th className="px-4 py-3">Atividade / Uso</th>
                  <th className="px-4 py-3 text-right">Vendas & Facturação</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Nenhum utilizador encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map(user => {
                    const activity = getUserActivityStatus(user);
                    const isNewToday = user.criado_em && new Date(user.criado_em).toDateString() === todayStr;
                    const vendasCount = user.total_vendas_count || 0;
                    const faturamento = user.total_faturamento || 0;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        
                        {/* 1. Utilizador & Contato */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-xs font-black shrink-0">
                              {(user.nome || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-slate-900 dark:text-slate-50 font-black truncate max-w-[150px]">
                                  {user.nome || 'Sem nome'}
                                </span>
                                {isNewToday && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    Novo
                                  </span>
                                )}
                                {isPotentialDuplicate(user) && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" title="Possível registo duplicado (mesmo nome ou e-mail)">
                                    Duplicado?
                                  </span>
                                )}
                              </div>
                              {user.email ? (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[170px]" title={user.email}>
                                  {user.email}
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 italic block">
                                  Conta Direta (sem e-mail)
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400">
                                {user.pais || 'Moçambique'} ({user.moeda || 'MT'})
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Horário de Adesão */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-200">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              <span className="font-black text-[11px]">{formatRelativeTime(user.criado_em)}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {formatExactDateTime(user.criado_em)}
                            </span>
                          </div>
                        </td>

                        {/* 3. Plano & Teste Grátis */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            {user.plano === 'pro' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900/40">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Plano PRO</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-100 dark:border-indigo-900/40">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Trial 15 Dias</span>
                              </span>
                            )}

                            {user.suspenso && (
                              <span className="inline-flex items-center space-x-0.5 text-[9px] text-rose-500 font-black block">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Suspenso</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Atividade / Uso Real */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${activity.bg} ${activity.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${activity.dot}`}></span>
                              <span>{activity.label}</span>
                            </span>
                            
                            {user.ultimo_evento && (
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate max-w-[130px]" title={user.ultimo_evento}>
                                {user.ultimo_evento}
                              </span>
                            )}

                            {user.ultimo_acesso_em && (
                              <span className="text-[8px] text-slate-400 block font-mono">
                                Último: {formatRelativeTime(user.ultimo_acesso_em)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Vendas & Facturação */}
                        <td className="px-4 py-3.5 text-right">
                          {vendasCount > 0 || faturamento > 0 ? (
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs block">
                                +{faturamento.toLocaleString()} {user.moeda || 'MT'}
                              </span>
                              <span className="text-[9px] text-slate-400 block">
                                {vendasCount} venda(s) registada(s)
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Sem vendas ainda
                            </span>
                          )}
                        </td>

                        {/* 6. Ações */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenUserConfig(user)}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="Configurar utilizador"
                            >
                              <Settings className="w-3 h-3 text-slate-500" />
                              <span>Ajustar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Eliminar utilizador ou registo de teste do Firestore"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE PANELS: BROADCAST & AUDIT LOGS */}
        <div className="space-y-6">
          
          {/* BROADCAST / NOTIFICATION TO USERS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4" id="warning_broadcast_panel">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Comunicado em Banner</span>
            </h3>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Envia comunicados ou novidades com imagens e links de ação destacados para todos os utilizadores da plataforma.
            </p>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Tipo de Mensagem</label>
                <select
                  value={announcementType}
                  onChange={e => setAnnouncementType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                >
                  <option value="novidade">🎉 Novidade (Banner em Destaque)</option>
                  <option value="aviso">⚠️ Aviso Importante</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Título (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Nova Função de CSV Disponível!"
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Mensagem</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Escreve aqui o texto do aviso ou da novidade..."
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Público Alvo</label>
                <select
                  value={announcementTarget}
                  onChange={e => setAnnouncementTarget(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                >
                  <option value="todos">Todos os Utilizadores</option>
                  <option value="trial_expira_2d">Trial a expirar em 2 dias</option>
                </select>
              </div>

              {announceSuccess && (
                <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl text-center">
                  {announceSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={isSendingAnnounce}
                className="w-full bg-indigo-600 text-white font-extrabold text-xs py-3 px-4 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/15"
              >
                <Megaphone className="w-4 h-4" />
                <span>{isSendingAnnounce ? 'A transmitir...' : 'Publicar Comunicado'}</span>
              </button>
            </form>
          </div>

          {/* AUDIT LOGS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3" id="admin_audit_logs">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 font-display">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Registo de Ações Administrativas</span>
            </h4>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2" id="audit_logs_list">
              {adminLogs.length === 0 ? (
                <p className="text-[10px] text-slate-400 py-4 text-center">Sem registos recentes.</p>
              ) : (
                adminLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-start text-[10px] p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/30 dark:border-slate-700/40" id={`log_${log.id}`}>
                    <div className="space-y-0.5">
                      <span className="font-black text-indigo-600 dark:text-indigo-400">{log.adminEmail}</span>
                      <span className="text-slate-700 dark:text-slate-300 block font-bold">{log.acao}</span>
                      <span className="text-slate-400 text-[8px] font-medium block">Alvo: {log.utilizadorAfetado}</span>
                    </div>
                    <span className="text-slate-400 text-[8px] font-medium shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* USER CONFIGURATION MODAL OVERLAY */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 shadow-2xl animate-scale-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-black text-slate-900 dark:text-slate-50 text-sm">Ajustar Utilizador</h4>
              <p className="text-[10px] text-slate-500 truncate">
                {selectedUser.nome} {selectedUser.email ? `(${selectedUser.email})` : '• Conta Direta'}
              </p>
              <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                Entrou em: {formatExactDateTime(selectedUser.criado_em)}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Nome do Utilizador / Loja</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  placeholder="Nome do utilizador ou loja"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="Ex: cliente@gmail.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                />
                {!editEmail && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-normal">
                    * Sem e-mail gravado no perfil. Podes associar o e-mail aqui.
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Plano de Subscrição</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                >
                  <option value="trial">Trial (Teste Grátis)</option>
                  <option value="pro">Pro (Premium Ilimitado)</option>
                  <option value="free">Free (Gratuito Limitado)</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              {newPlan === 'trial' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Dias de Trial a Contar de Hoje</label>
                  <input
                    type="number"
                    value={trialExpiresDays}
                    onChange={e => setTrialExpiresDays(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-50 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-50 block">Suspender Conta</span>
                  <span className="text-[8px] text-slate-400 block">Bloquear acesso do utilizador</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuspended(!isSuspended)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isSuspended ? 'bg-rose-500 flex justify-end' : 'bg-slate-300 dark:bg-slate-700 flex justify-start'}`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingUser ? 'A eliminar...' : 'Eliminar Registo do Firestore'}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUserConfig}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
