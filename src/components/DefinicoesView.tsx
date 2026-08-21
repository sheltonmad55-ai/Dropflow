/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { useApp } from '../lib/appContext.tsx';
import { auth } from '../lib/firebase.ts';
import { playCashRegister, playNotificationPing } from '../lib/audio.ts';
import { requestNotificationPermission as requestBrowserNotificationPermission, sendNotification } from '../lib/notifications.ts';
import { 
  Settings, 
  User, 
  Percent, 
  Crown, 
  LogOut, 
  Check, 
  Sparkles, 
  Coins, 
  ShieldAlert,
  Megaphone,
  TrendingUp,
  AlertCircle,
  Database,
  Download,
  FileSpreadsheet,
  Mail,
  Shield,
  Calendar,
  Key,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  Play,
  ChevronRight,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  ArrowLeftRight,
  Plus,
  Edit,
  Trash2,
  MinusCircle,
  X,
  ArrowDownRight,
  History,
  Eye,
  EyeOff
} from 'lucide-react';

interface DefinicoesViewProps {
  onStartTour?: () => void;
}

export default function DefinicoesView({ onStartTour }: DefinicoesViewProps) {
  const { 
    profile, 
    updateProfile, 
    triggerMockUpgrade, 
    logout,
    caixinhas,
    contasBancarias,
    addContaBancaria,
    editContaBancaria,
    deleteContaBancaria,
    transferirEntreContas,
    retirarDaConta,
    vendas,
    despesas,
    produtos,
    fornecedores,
    zonasEntrega,
    isAdmin,
    modoFoco,
    toggleModoFoco,
    formatMoney
  } = useApp();

  // Delete modal state
  const [deletingConta, setDeletingConta] = useState<any>(null);

  // Profile forms
  const [nome, setNome] = useState(profile?.nome || '');
  const [pais, setPais] = useState(profile?.pais || 'Moçambique');
  const [moeda, setMoeda] = useState(profile?.moeda || 'MT');

  // Contas Bancárias & Carteiras state
  const [showAddConta, setShowAddConta] = useState(false);
  const [contaNome, setContaNome] = useState('');
  const [contaTipo, setContaTipo] = useState<'banco' | 'carteira_movel' | 'caixa_fisico' | 'outros'>('banco');
  const [contaSaldo, setContaSaldo] = useState('0');
  const [contaCor, setContaCor] = useState('bg-indigo-600');
  const [contaBanco, setContaBanco] = useState('');
  const [contaStatusLiberdade, setContaStatusLiberdade] = useState<'livre' | 'emergencia'>('livre');

  const [editingConta, setEditingConta] = useState<any>(null);
  const [editContaNome, setEditContaNome] = useState('');
  const [editContaTipo, setEditContaTipo] = useState<string>('banco');
  const [editContaSaldo, setEditContaSaldo] = useState('0');
  const [editContaCor, setEditContaCor] = useState('bg-indigo-600');
  const [editContaStatusLiberdade, setEditContaStatusLiberdade] = useState<'livre' | 'emergencia'>('livre');

  const [showHistoricoContaModal, setShowHistoricoContaModal] = useState(false);
  const [historicoContaSelected, setHistoricoContaSelected] = useState<any>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transfDeConta, setTransfDeConta] = useState('');
  const [transfParaConta, setTransfParaConta] = useState('');
  const [transfValor, setTransfValor] = useState('');

  const [showRetiradaContaModal, setShowRetiradaContaModal] = useState(false);
  const [retiradaContaIdSelected, setRetiradaContaIdSelected] = useState('');
  const [retiradaContaValor, setRetiradaContaValor] = useState('');
  const [retiradaContaMotivo, setRetiradaContaMotivo] = useState('');

  const totalSaldoBancos = contasBancarias.reduce((acc, c) => acc + c.saldo_atual, 0);

  const handleCreateConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaNome) return;
    try {
      await addContaBancaria({
        nome: contaNome,
        tipo: contaTipo as any,
        saldo_atual: parseFloat(contaSaldo) || 0,
        cor: contaCor,
        banco: contaBanco || undefined,
        status_liberdade: contaStatusLiberdade,
        editavel: true
      });
      setContaNome('');
      setContaSaldo('0');
      setContaBanco('');
      setContaStatusLiberdade('livre');
      setShowAddConta(false);
    } catch (e) {
      alert('Erro ao criar conta bancária.');
    }
  };

  const handleSaveEditConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConta || !editContaNome) return;
    try {
      await editContaBancaria(editingConta.id, {
        nome: editContaNome,
        tipo: editContaTipo as any,
        saldo_atual: parseFloat(editContaSaldo) || 0,
        cor: editContaCor,
        status_liberdade: editContaStatusLiberdade
      });
      setEditingConta(null);
    } catch (e) {
      alert('Erro ao editar conta bancária.');
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfDeConta || !transfParaConta) {
      alert('Selecione a conta de origem e destino.');
      return;
    }
    if (transfDeConta === transfParaConta) {
      alert('As contas de origem e destino devem ser diferentes.');
      return;
    }
    const val = parseFloat(transfValor);
    if (!val || val <= 0) {
      alert('Introduza um valor válido para transferência.');
      return;
    }

    try {
      await transferirEntreContas(transfDeConta, transfParaConta, val);
      setTransfValor('');
      setShowTransferModal(false);
    } catch (e) {
      alert('Erro ao realizar transferência entre contas.');
    }
  };

  const handleExecuteRetiradaConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retiradaContaIdSelected) return;
    const val = parseFloat(retiradaContaValor);
    if (!val || val <= 0) {
      alert('Introduza um valor válido para a retirada.');
      return;
    }

    try {
      await retirarDaConta(retiradaContaIdSelected, val, retiradaContaMotivo || 'Levantamento de Saldo');
      setRetiradaContaValor('');
      setRetiradaContaMotivo('');
      setShowRetiradaContaModal(false);
    } catch (e) {
      alert('Erro ao realizar retirada da conta.');
    }
  };

  // Appearance (Theme state)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dropflow_theme') as 'light' | 'dark') || 'light';
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('dropflow_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Distribution sliders and inputs
  const [anunciosPercent, setAnunciosPercent] = useState<number>(profile?.anuncios_percent || 50);
  const [anunciosInput, setAnunciosInput] = useState<string>((profile?.anuncios_percent ?? 50).toString());
  const [lucroInput, setLucroInput] = useState<string>((profile?.lucro_percent ?? 50).toString());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savePercentLoading, setSavePercentLoading] = useState<boolean>(false);

  // Sync inputs with profile changes
  useEffect(() => {
    if (profile) {
      setAnunciosInput((profile.anuncios_percent ?? 50).toString());
      setLucroInput((profile.lucro_percent ?? 50).toString());
      setAnunciosPercent(profile.anuncios_percent ?? 50);
      setNome(profile.nome || '');
      setPais(profile.pais || 'Moçambique');
      setMoeda(profile.moeda || 'MT');
    }
  }, [profile]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  // Permission status state
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('As notificações não são suportadas neste navegador.');
      return;
    }

    const permission = await requestBrowserNotificationPermission();
    setPermissionStatus(permission);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (permission === 'denied' && isIOS) {
      alert('No iPhone/iPad, active as notificações depois de instalar o DropFlow no ecrã inicial.');
      return;
    }

    if (permission === 'granted') {
      await sendNotification('DropFlow', 'Notificações activadas com sucesso!');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        nome,
        pais,
        moeda
      });
      alert('Perfil comercial atualizado com sucesso!');
    } catch (e) {
      alert('Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSliderChange = (val: number) => {
    setAnunciosPercent(val);
    setAnunciosInput(val.toString());
    setLucroInput((100 - val).toString());
  };

  const handlePresetClick = (adsVal: number) => {
    setAnunciosPercent(adsVal);
    setAnunciosInput(adsVal.toString());
    setLucroInput((100 - adsVal).toString());
  };

  const handleSaveDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const ads = parseInt(anunciosInput) || 0;
    const profit = parseInt(lucroInput) || 0;

    if (ads + profit !== 100) {
      alert('A soma das percentagens deve ser exatamente 100%!');
      return;
    }

    setSavePercentLoading(true);
    try {
      await updateProfile({
        anuncios_percent: ads,
        lucro_percent: profit
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Error saving distribution percentages:', e);
      alert('Erro ao guardar a configuração de distribuição.');
    } finally {
      setSavePercentLoading(false);
    }
  };

  // Dynamic exports
  const handleExportBackupJSON = () => {
    try {
      const backupData = {
        versao_backup: '1.0',
        exportado_em: new Date().toISOString(),
        usuario: {
          uid: auth.currentUser?.uid || 'offline',
          email: auth.currentUser?.email || 'N/A',
          nome_comercial: profile?.nome || 'DroopFlow User',
        },
        profile,
        caixinhas,
        produtos,
        fornecedores,
        zonasEntrega,
        vendas,
        despesas
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute(
        "download", 
        `droopflow_backup_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar backup JSON.');
    }
  };

  const handleExportVendasCSV = () => {
    try {
      const headers = ['ID Venda', 'Data Venda', 'Produto', 'Preço Unitário', 'Fornecedor', 'Zona Entrega', 'Valor Recebido', 'Forma Pagamento', 'Data Criação'];
      const rows = vendas.map(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        const prodNome = prod ? prod.nome : 'Produto Customizado';
        const prodPreco = prod ? prod.preco_venda : v.valor_recebido;
        const forn = fornecedores.find(f => f.id === v.fornecedor_id)?.nome || 'Sem Fornecedor';
        const zona = zonasEntrega.find(z => z.id === v.zona_entrega_id)?.nome_zona || 'Sem Entrega';
        return [
          v.id,
          v.data_venda,
          `"${prodNome.replace(/"/g, '""')}"`,
          prodPreco,
          `"${forn.replace(/"/g, '""')}"`,
          `"${zona.replace(/"/g, '""')}"`,
          v.valor_recebido,
          v.forma_pagamento,
          v.criado_em || ''
        ];
      });

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `droopflow_vendas_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar vendas para CSV.');
    }
  };

  const handleExportDespesasCSV = () => {
    try {
      const headers = ['ID Despesa', 'Data Despesa', 'Categoria', 'Origem Caixinha', 'Descrição', 'Valor', 'Data Criação'];
      const rows = despesas.map(d => {
        const cx = caixinhas.find(c => c.id === d.caixinha_id)?.nome || 'Despesa Geral';
        return [
          d.id,
          d.data,
          `"${d.categoria.replace(/"/g, '""')}"`,
          `"${cx.replace(/"/g, '""')}"`,
          `"${(d.descricao || '').replace(/"/g, '""')}"`,
          d.valor,
          d.criado_em || ''
        ];
      });

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `droopflow_despesas_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar despesas para CSV.');
    }
  };

  const handleExportTodasTransacoesCSV = () => {
    try {
      const headers = ['ID Transacao', 'Data', 'Tipo', 'Descricao / Detalhes', 'Valor', 'Origem / Destino', 'Data Criacao'];
      
      const rowsVendas = vendas.map(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        const prodNome = prod ? prod.nome : 'Produto Customizado';
        const forn = fornecedores.find(f => f.id === v.fornecedor_id)?.nome || 'Sem Fornecedor';
        const desc = `Venda: ${prodNome} (Fornecedor: ${forn})`;
        const pag = v.forma_pagamento || 'N/A';
        return {
          id: v.id,
          data: v.data_venda,
          tipo: 'Venda (Entrada)',
          desc: desc,
          valor: v.valor_recebido,
          origem: pag,
          criado_em: v.criado_em || ''
        };
      });

      const rowsDespesas = despesas.map(d => {
        const cx = caixinhas.find(c => c.id === d.caixinha_id)?.nome || 'Despesa Geral';
        const desc = `Despesa: [${d.categoria}] ${d.descricao || ''}`.trim();
        return {
          id: d.id,
          data: d.data,
          tipo: 'Despesa (Saida)',
          desc: desc,
          valor: -d.valor, // represented as negative outflow
          origem: cx,
          criado_em: d.criado_em || ''
        };
      });

      // Combine and sort chronologically (newest first)
      const todas = [...rowsVendas, ...rowsDespesas].sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      const csvRows = todas.map(t => [
        t.id,
        t.data,
        `"${t.tipo}"`,
        `"${t.desc.replace(/"/g, '""')}"`,
        t.valor,
        `"${t.origem.replace(/"/g, '""')}"`,
        t.criado_em
      ]);

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...csvRows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `droopflow_todas_transacoes_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar transações completas para CSV.');
    }
  };

  const adsNum = parseInt(anunciosInput) || 0;
  const profitNum = parseInt(lucroInput) || 0;
  const sum = adsNum + profitNum;
  const isSumValid = sum === 100;

  const handleProUpgrade = async () => {
    try {
      await triggerMockUpgrade();
      setShowUpgradeSuccess(true);
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    } catch (e) {
      alert('Erro no upgrade.');
    }
  };

  // Formatting utility
  const formatIsoDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  const currentUser = auth.currentUser;

  const sonsGlobais = profile?.ativarSons !== false;
  const somMetasAtivo = profile?.somMetas !== false;
  const somRelatoriosAtivo = profile?.somRelatorios !== false;

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="definicoes_view">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display">Configurações e Conta</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Gere as tuas preferências, exporta dados e vê a tua conta</p>
      </div>

      {/* 0. Ver Conta (Account Information Panel) */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_ver_conta_panel">
        <div className="flex items-center justify-between" id="account_header">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <User className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> A Minha Conta
          </h3>
          <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50">
            Plano: DroopFlow Ativo
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-3" id="account_details_box">
          <div className="flex items-center space-x-3" id="account_user_intro">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-sm" id="user_avatar">
              {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : 'DF'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.nome || 'Usuário DroopFlow'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {currentUser?.email || 'Acesso Local / Convidado'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 grid grid-cols-2 gap-3 text-[10px]" id="account_meta_info">
            <div className="space-y-1" id="account_meta_id">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">ID de Conta</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono block truncate" title={currentUser?.uid}>
                {currentUser?.uid || 'offline_dev'}
              </span>
            </div>
            <div className="space-y-1" id="account_meta_created">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">Membro Desde</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold block">
                {formatIsoDate(profile?.criado_em)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Replay Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-100/40 dark:border-emerald-950/20 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm" id="definicoes_tour_replay_card">
        <div className="space-y-1" id="tour_replay_text">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 flex items-center font-display gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" /> Tour Guiado de Boas-Vindas
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Aprenda a utilizar os principais recursos do DroopFlow, incluindo a gestão de Pockets (caixinhas), cálculo de ROAS e controlo de margens.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartTour}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          id="btn_replay_tour"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Iniciar Tour</span>
        </button>
      </div>

      {/* 1. Profile Panel */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_perfil_panel">
        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
          <Settings className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Perfil Comercial
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3.5" id="profile_form">
          <div className="space-y-1" id="field_def_nome">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nome Comercial / Loja</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3" id="field_def_grid">
            <div className="space-y-1" id="field_def_pais">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">País</label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Moçambique">Moçambique</option>
                <option value="África do Sul">África do Sul</option>
                <option value="Portugal">Portugal</option>
                <option value="Angola">Angola</option>
                <option value="Brasil">Brasil</option>
              </select>
            </div>
            <div className="space-y-1" id="field_def_moeda">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Moeda Padrão</label>
              <select
                value={moeda}
                onChange={(e) => setMoeda(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="MT">MT (Meticais)</option>
                <option value="ZAR">ZAR (Rands)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
          </div>

          <button
            id="btn_save_profile"
            type="submit"
            disabled={savingProfile}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors border border-slate-900 dark:border-slate-100 shadow-sm cursor-pointer"
          >
            {savingProfile ? 'A guardar...' : 'Guardar Alterações do Perfil'}
          </button>
        </form>
      </div>

      {/* 1.2. Contas Bancárias & Carteiras Móveis (Empresa, e-Mola, BIM, BCE) Panel */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_contas_bancarias_panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" id="contas_panel_header">
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
              <CreditCard className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> Contas Bancárias & Carteiras Móveis
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Gira as contas reais (e-Mola, M-Pesa e contas personalizadas) onde os pagamentos entram e saem</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn_open_transfer_modal"
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-extrabold px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors flex items-center text-xs space-x-1 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Transferir</span>
            </button>
            <button
              id="btn_open_add_conta"
              type="button"
              onClick={() => setShowAddConta(true)}
              className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center text-xs space-x-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Total Liquid Capital Display */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-indigo-600/15" id="contas_total_card">
          <div className="flex items-center space-x-3">
            <div className="bg-white/15 p-2.5 rounded-xl border border-white/10">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">Saldo Total em Bancos & Carteiras</span>
              <span className="text-[10px] text-indigo-200 block">Soma de todas as contas ativas</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-white block">
              {formatMoney(totalSaldoBancos, moeda)}
            </span>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="contas_cards_grid">
          {contasBancarias.map(conta => {
            const isMovel = conta.tipo === 'carteira_movel';
            const isCaixa = conta.tipo === 'caixa_fisico' || conta.tipo === 'caixa';
            const isEmergencia = conta.status_liberdade === 'emergencia';
            return (
              <div
                key={conta.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 relative overflow-hidden"
                id={`card_conta_${conta.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl text-white ${conta.cor || 'bg-indigo-600'}`}>
                      {isMovel ? (
                        <Smartphone className="w-4 h-4" />
                      ) : isCaixa ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{conta.nome}</span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
                          {isMovel ? 'Carteira Móvel' : isCaixa ? 'Caixa Físico' : 'Conta Bancária'} {conta.banco ? `• ${conta.banco}` : ''}
                        </span>
                        {isEmergencia ? (
                          <span className="text-[9px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/50">
                            🔴 Não Mexer
                          </span>
                        ) : (
                          <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                            🟢 Livre
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn_edit_conta_${conta.id}`}
                      onClick={() => {
                        setEditingConta(conta);
                        setEditContaNome(conta.nome);
                        setEditContaTipo(conta.tipo);
                        setEditContaSaldo(conta.saldo_atual.toString());
                        setEditContaCor(conta.cor || 'bg-indigo-600');
                        setEditContaStatusLiberdade(conta.status_liberdade || 'livre');
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="Editar saldo / nome / status"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn_delete_conta_${conta.id}`}
                      onClick={() => {
                        setDeletingConta(conta);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Apagar conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Saldo Atual</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">
                      {formatMoney(conta.saldo_atual, moeda)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {conta.historico_retiradas && conta.historico_retiradas.length > 0 && (
                      <button
                        id={`btn_hist_conta_${conta.id}`}
                        onClick={() => {
                          setHistoricoContaSelected(conta);
                          setShowHistoricoContaModal(true);
                        }}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Ver histórico de retiradas e motivos"
                      >
                        <History className="w-3 h-3" />
                        <span>Histórico ({conta.historico_retiradas.length})</span>
                      </button>
                    )}

                  <button
                    id={`btn_retirar_conta_${conta.id}`}
                    onClick={() => {
                      setRetiradaContaIdSelected(conta.id);
                      setShowRetiradaContaModal(true);
                    }}
                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-800/50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                    <span>Levantar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 1.5. Appearance/Aparência (Dark Mode) Panel */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_aparencia_panel">
        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
          <Moon className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> Tema e Aparência
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Escolha a sua preferência visual. O modo escuro é ideal para utilizadores avançados que trabalham até tarde, reduzindo o cansaço visual e otimizando o consumo de bateria.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1" id="theme_selection_grid">
          {/* Light Theme Option */}
          <button
            id="btn_theme_light"
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/80 dark:text-emerald-400'
                : 'bg-slate-50/50 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Modo Claro</span>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
          </button>

          {/* Dark Theme Option */}
          <button
            id="btn_theme_dark"
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/80 dark:text-emerald-400'
                : 'bg-slate-50/50 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Modo Escuro</span>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Banner de Permissões (Permissions Banner) */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="banner_permissoes_alertas">
        <div className="flex items-center justify-between" id="permissoes_header">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <Shield className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> Permissões de Notificação e Som
          </h3>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
            permissionStatus === 'granted'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
              : permissionStatus === 'denied'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50'
                : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50'
          }`}>
            {permissionStatus === 'granted' ? 'Autorizado' : permissionStatus === 'denied' ? 'Bloqueado' : 'Pendente'}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="permissoes_banner_content">
          <div className="space-y-1.5 max-w-xl">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {permissionStatus === 'granted' 
                ? 'Aplicação pronta para disparar alertas! 🎉' 
                : 'Ative as notificações para receber avisos de metas batidas'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              O sistema de metas do DroopFlow emite alertas visuais no seu ambiente de trabalho e comemorações sonoras em tempo real quando atinge os seus objetivos. Para isso, precisamos que autorize as notificações no navegador.
            </p>
          </div>

          {permissionStatus !== 'granted' ? (
            <button
              id="btn_request_permission"
              type="button"
              onClick={requestNotificationPermission}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-extrabold text-[10px] py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Autorizar Alertas</span>
            </button>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-2 rounded-xl">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Notificações Prontas</span>
            </div>
          )}
        </div>

        {permissionStatus === 'granted' && (
          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center" id="test_notifications_row">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mr-1">Testar Alertas:</span>
            <button
              type="button"
              onClick={() => sendNotification("DroopFlow - Meta Diária Alcançada! 🎉", `Meta Diária de ${profile?.metaDiaria?.toLocaleString() || '1.000'} ${profile?.moeda || 'MT'} batida com sucesso!`)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-slate-200/40 dark:border-slate-800/60"
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Alerta de Meta</span>
            </button>
            <button
              type="button"
              onClick={() => sendNotification("Orçamento Próximo do Limite! ⚠️", "A campanha de teste consumiu 90% do orçamento máximo definido.")}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-slate-200/40 dark:border-slate-800/60"
            >
              <Megaphone className="w-3 h-3 text-amber-500" />
              <span>Alerta de Orçamento</span>
            </button>
          </div>
        )}
      </div>

      {/* Sistema Global de Gestão de Som */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_som_panel">
        <div className="flex items-center justify-between" id="som_header">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <Volume2 className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> Sistema de Som e Efeitos
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Estado Geral</span>
            <button
              type="button"
              onClick={() => updateProfile({ ativarSons: !sonsGlobais })}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sonsGlobais ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  sonsGlobais ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Personalize as preferências de som para as suas conquistas e relatórios. Ative os efeitos sonoros para as suas metas batidas ou para as notificações de fecho de caixa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1" id="sound_settings_grid">
          {/* Card Meta Batida Sound */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between" id="config_som_metas">
            <div className="space-y-1 pr-4">
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Comemoração de Metas</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">Efeito sonoro festivo disparado ao atingir qualquer meta de faturamento.</span>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => playCashRegister(true)}
                className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                title="Testar som de metas"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => updateProfile({ somMetas: !somMetasAtivo })}
                disabled={!sonsGlobais}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  !sonsGlobais ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800' : somMetasAtivo ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    somMetasAtivo && sonsGlobais ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card Relatório Sound */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between" id="config_som_relatorios">
            <div className="space-y-1 pr-4">
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Notificação de Relatórios</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">Sinal sonoro curto e discreto emitido na criação e fecho de novos relatórios.</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => playNotificationPing(true)}
                className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                title="Testar som de relatórios"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => updateProfile({ somRelatorios: !somRelatoriosAtivo })}
                disabled={!sonsGlobais}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  !sonsGlobais ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800' : somRelatoriosAtivo ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    somRelatoriosAtivo && sonsGlobais ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Remainder Auto-Distribution Rules */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_distribuicao_panel">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <Percent className="w-4 h-4 mr-1.5 text-sky-600 dark:text-sky-400" /> Distribuição de Margem Líquida
          </h3>
          <span className="text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
            Sobra das Vendas
          </span>
        </div>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Edite manualmente as percentagens de distribuição automática para cada caixinha ou use os botões rápidos. O valor de fornecedor e entrega sempre é resgatado antes da divisão.
        </p>

        <form onSubmit={handleSaveDistribution} className="space-y-4 pt-1" id="distribution_manual_form">
          <div className="grid grid-cols-2 gap-3.5" id="manual_percent_inputs_grid">
            <div className="bg-slate-50/50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 space-y-1.5" id="input_box_anuncios">
              <div className="flex items-center space-x-1.5">
                <Megaphone className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">📢 Anúncios</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={anunciosInput}
                  onChange={(e) => setAnunciosInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 space-y-1.5" id="input_box_lucro">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">💰 Lucro</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lucroInput}
                  onChange={(e) => setLucroInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1" id="field_percent_calibrator">
            <input
              id="slider_anuncios_range"
              type="range"
              min="0"
              max="100"
              step="5"
              value={isSumValid ? adsNum : anunciosPercent}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2" id="presets_buttons">
            <button
              id="btn_preset_50"
              type="button"
              onClick={() => handlePresetClick(50)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 50) ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              50/50
            </button>
            <button
              id="btn_preset_40"
              type="button"
              onClick={() => handlePresetClick(40)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 40) ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              40% Ads / 60% Lucro
            </button>
            <button
              id="btn_preset_70"
              type="button"
              onClick={() => handlePresetClick(70)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 70) ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              70% Ads / 30% Lucro
            </button>
          </div>

          <div className="pt-1.5 space-y-3" id="validation_section">
            {!isSumValid ? (
              <div className="bg-rose-50 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 p-3 rounded-2xl flex items-start space-x-2 text-[11px] text-rose-700 dark:text-rose-300 font-medium" id="validation_alert_invalid">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5] text-rose-600 dark:text-rose-400" />
                <div className="space-y-1">
                  <p>A soma atual é <strong className="font-extrabold">{sum}%</strong>. Os valores devem totalizar exatamente 100%.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const ads = Math.min(100, Math.max(0, parseInt(anunciosInput) || 0));
                      setLucroInput((100 - ads).toString());
                    }}
                    className="text-[10px] text-rose-800 dark:text-rose-400 font-bold underline hover:no-underline flex items-center"
                  >
                    💡 Equilibrar automaticamente
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-2.5 rounded-2xl flex items-center space-x-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold" id="validation_alert_valid">
                <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Soma perfeita de 100%! Prontos para salvar.</span>
              </div>
            )}

            {saveSuccess && (
              <div className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-2 animate-fade-in" id="save_percent_success_toast">
                <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Percentagens guardadas localmente!</span>
              </div>
            )}

            <button
              id="btn_save_distribution"
              type="submit"
              disabled={!isSumValid || savePercentLoading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-2 ${isSumValid ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 dark:border-slate-100 text-white border-slate-900 shadow-sm cursor-pointer' : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-850 cursor-not-allowed'}`}
            >
              <span>{savePercentLoading ? 'A guardar...' : 'Guardar Percentagens'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* NEW: Exportar Dados (Backups Section) */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_export_panel">
        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
          <Database className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Exportar Dados e Backups
        </h3>
        
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Garante que tens o controlo total sobre os teus dados. Descarrega relatórios de fluxos separados ou do total de transações compatíveis com o Excel, ou efetua um backup de segurança completo de toda a atividade do DroopFlow.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2" id="export_actions_grid">
          {/* JSON Full Backup */}
          <button
            id="btn_export_json_backup"
            type="button"
            onClick={handleExportBackupJSON}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Backup Completo (JSON)</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Perfil, Produtos, Vendas e Caixinhas</span>
            </div>
          </button>

          {/* Vendas CSV */}
          <button
            id="btn_export_vendas_csv"
            type="button"
            onClick={handleExportVendasCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Vendas (CSV)</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Relatório completo para o Excel</span>
            </div>
          </button>

          {/* Despesas CSV */}
          <button
            id="btn_export_despesas_csv"
            type="button"
            onClick={handleExportDespesasCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Despesas (CSV)</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Registo de saídas e despesas</span>
            </div>
          </button>

          {/* Total Transactions CSV */}
          <button
            id="btn_export_todas_transacoes_csv"
            type="button"
            onClick={handleExportTodasTransacoesCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-sky-50 dark:bg-slate-950 dark:hover:bg-sky-950/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <Coins className="w-6 h-6 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Fluxo de Caixa (CSV)</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Todas as transações combinadas</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Subscription Management (DroopFlow Pro) */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-sm" id="definicoes_billing_panel">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"></div>

        <div className="flex justify-between items-center" id="billing_header">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <Crown className="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400" /> Plano DroopFlow Pro
          </h3>
          <span className="text-[9px] bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200/65 dark:border-slate-800 font-bold">
            297 MT / mês
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 rounded-2xl space-y-1.5" id="pro_status_info">
          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wide flex items-center">
            <Check className="w-3.5 h-3.5 mr-1" /> Assinatura Ativa
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Estás a usufruir de lançamentos ilimitados, sincronização multi-dispositivo e relatórios completos.</p>
        </div>
      </div>

      {/* Modo Foco & Privacidade */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_modo_foco_panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shrink-0">
              {modoFoco ? <EyeOff className="w-5 h-5 stroke-[2.5]" /> : <Eye className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-display">Modo Foco (Privacidade)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Esconde saldos e valores monetários sensíveis no painel principal para proteger a privacidade em locais públicos.</p>
            </div>
          </div>

          <button
            type="button"
            id="btn_toggle_modo_foco_definicoes"
            onClick={toggleModoFoco}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 ${
              modoFoco 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 font-extrabold' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {modoFoco ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{modoFoco ? 'Modo Foco Ativo' : 'Ativar Modo Foco'}</span>
          </button>
        </div>
      </div>

      {/* 4. Logout / Reset */}
      <div className="pt-2" id="definicoes_system_panel">
        <button
          id="btn_system_logout"
          onClick={logout}
          className="w-full bg-rose-50 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-600 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors font-extrabold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* ================= MODAL: ADICIONAR CONTA BANCÁRIA ================= */}
      {showAddConta && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" id="modal_add_conta">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="modal_add_conta_content">
              <div className="flex justify-between items-center" id="modal_add_conta_header">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <CreditCard className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Adicionar Conta ou Carteira</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Registe uma nova conta bancária ou serviço financeiro</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddConta(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateConta} className="space-y-3.5" id="form_add_conta">
                <div className="space-y-1" id="field_add_conta_nome">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Nome da Conta / Carteira</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BCE, Standard Bank, e-Mola, M-Pesa"
                    value={contaNome}
                    onChange={(e) => setContaNome(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3" id="grid_add_conta_tipo_banco">
                  <div className="space-y-1" id="field_add_conta_tipo">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Tipo de Conta</label>
                    <select
                      value={contaTipo}
                      onChange={(e: any) => setContaTipo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="banco">Banco Comercial</option>
                      <option value="carteira_movel">Carteira Móvel</option>
                      <option value="caixa_fisico">Caixa Físico</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div className="space-y-1" id="field_add_conta_banco">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Instituição (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: BIM, BCI, BCE"
                      value={contaBanco}
                      onChange={(e) => setContaBanco(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1" id="field_add_conta_saldo">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Saldo Inicial ({moeda})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={contaSaldo}
                    onChange={(e) => setContaSaldo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1" id="field_add_conta_status">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Status de Liberdade do Saldo
                  </label>
                  <select
                    value={contaStatusLiberdade}
                    onChange={(e: any) => setContaStatusLiberdade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="livre">🟢 Livre Movimentação (Uso Diário / Saídas Gerais)</option>
                    <option value="emergencia">🔴 Não Mexer (Reserva de Emergência / Excluir de Saídas Gerais)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Contas &quot;Não Mexer&quot; são excluídas de saídas automáticas e exigem motivo ao retirar.
                  </p>
                </div>

                <div className="flex space-x-2 pt-2" id="add_conta_modal_actions">
                  <button
                    type="button"
                    onClick={() => setShowAddConta(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    Criar Conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ================= MODAL: EDITAR CONTA ================= */}
      {editingConta && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" id="modal_edit_conta">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="modal_edit_conta_content">
              <div className="flex justify-between items-center" id="modal_edit_conta_header">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Editar Conta: {editingConta.nome}</h3>
                <button
                  onClick={() => setEditingConta(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditConta} className="space-y-3.5" id="form_edit_conta">
                <div className="space-y-1" id="field_edit_conta_nome">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Nome da Conta / Carteira</label>
                  <input
                    type="text"
                    required
                    value={editContaNome}
                    onChange={(e) => setEditContaNome(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1" id="field_edit_conta_saldo">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Ajustar Saldo Atual ({moeda})</label>
                  <input
                    type="number"
                    step="any"
                    value={editContaSaldo}
                    onChange={(e) => setEditContaSaldo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1" id="field_edit_conta_status">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Status de Liberdade do Saldo
                  </label>
                  <select
                    value={editContaStatusLiberdade}
                    onChange={(e: any) => setEditContaStatusLiberdade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="livre">🟢 Livre Movimentação (Uso Diário / Saídas Gerais)</option>
                    <option value="emergencia">🔴 Não Mexer (Reserva de Emergência / Excluir de Saídas Gerais)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Contas &quot;Não Mexer&quot; são protegidas. Ao retirar valor delas, é pedido o motivo em popup.
                  </p>
                </div>

                <div className="flex space-x-2 pt-2" id="edit_conta_modal_actions">
                  <button
                    type="button"
                    onClick={() => setEditingConta(null)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ================= MODAL: TRANSFERÊNCIA ENTRE CONTAS ================= */}
      {showTransferModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" id="modal_transfer">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="modal_transfer_content">
              <div className="flex justify-between items-center" id="modal_transfer_header">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Transferência entre Contas</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Mova fundos entre e-Mola, M-Pesa e as suas contas bancárias personalizadas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteTransfer} className="space-y-3.5" id="form_transfer">
                <div className="space-y-1" id="field_transf_origem">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Conta de Origem (Debitar)</label>
                  <select
                    value={transfDeConta}
                    onChange={(e) => setTransfDeConta(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">Selecionar Origem...</option>
                    {contasBancarias.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (Saldo: {c.saldo_atual.toLocaleString()} {moeda})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1" id="field_transf_destino">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Conta de Destino (Creditar)</label>
                  <select
                    value={transfParaConta}
                    onChange={(e) => setTransfParaConta(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">Selecionar Destino...</option>
                    {contasBancarias.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (Saldo: {c.saldo_atual.toLocaleString()} {moeda})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1" id="field_transf_valor">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Valor a Transferir ({moeda})</label>
                  <input
                    type="number"
                    required
                    step="any"
                    min="0.01"
                    placeholder="Ex: 2500"
                    value={transfValor}
                    onChange={(e) => setTransfValor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2" id="transfer_modal_actions">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    Executar Transferência
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ================= MODAL: RETIRADA DA CONTA ================= */}
      {showRetiradaContaModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" id="modal_retirada_conta">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="modal_retirada_conta_content">
              <div className="flex justify-between items-center" id="modal_retirada_conta_header">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                    <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Levantamento de Saldo Bancário</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Subtrai o valor diretamente da conta bancária ou carteira</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRetiradaContaModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteRetiradaConta} className="space-y-3.5" id="form_retirada_conta">
                <div className="space-y-1" id="field_retirada_conta_sel">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Conta / Carteira</label>
                  <select
                    value={retiradaContaIdSelected}
                    onChange={(e) => setRetiradaContaIdSelected(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {contasBancarias.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (Saldo Banco: {c.saldo_atual.toLocaleString()} {moeda}) {c.status_liberdade === 'emergencia' ? ' (🔴 NÃO MEXER)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const selAcc = contasBancarias.find(c => c.id === retiradaContaIdSelected);
                  if (selAcc?.status_liberdade === 'emergencia') {
                    return (
                      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-2xl text-xs text-rose-900 dark:text-rose-200 space-y-1" id="emergencia_retirada_warning">
                        <p className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-4 h-4" /> Conta de Emergência (Não Mexer)
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          O motivo digitado abaixo ficará registrado permanentemente no histórico da conta.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="space-y-1" id="field_retirada_conta_val">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Valor a Levantado ({moeda})</label>
                  <input
                    type="number"
                    required
                    step="any"
                    min="0.01"
                    placeholder="Ex: 1000"
                    value={retiradaContaValor}
                    onChange={(e) => setRetiradaContaValor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1" id="field_retirada_conta_motivo">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Motivo {contasBancarias.find(c => c.id === retiradaContaIdSelected)?.status_liberdade === 'emergencia' ? '(Obrigatório) *' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={contasBancarias.find(c => c.id === retiradaContaIdSelected)?.status_liberdade === 'emergencia'}
                    placeholder="Ex: Taxa bancária / Levantamento pessoal / Emergência"
                    value={retiradaContaMotivo}
                    onChange={(e) => setRetiradaContaMotivo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2" id="retirada_conta_actions">
                  <button
                    type="button"
                    onClick={() => setShowRetiradaContaModal(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/20"
                  >
                    Confirmar Levantamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ================= MODAL: HISTÓRICO DE RETIRADAS ================= */}
      {showHistoricoContaModal && historicoContaSelected && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" id="modal_hist_conta">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col" id="modal_hist_conta_content">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                    <History className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">
                      Histórico da Conta: {historicoContaSelected.nome}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registro permanente de retiradas e motivos de emergência
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHistoricoContaModal(false);
                    setHistoricoContaSelected(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
                {(!historicoContaSelected.historico_retiradas || historicoContaSelected.historico_retiradas.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum registro de retirada até o momento.</p>
                ) : (
                  historicoContaSelected.historico_retiradas.map((item: any) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                          -{item.valor.toLocaleString()} {moeda}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.data).toLocaleString('pt-MZ', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 mt-1">
                        💬 <strong>Motivo:</strong> {item.motivo}
                      </p>
                      {item.despesa_descricao && (
                        <p className="text-[10px] text-slate-400 italic">
                          Descrição: {item.despesa_descricao}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowHistoricoContaModal(false);
                    setHistoricoContaSelected(null);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Confirmation Modal for Deleting Account */}
      <ConfirmDeleteModal
        isOpen={!!deletingConta}
        title="Eliminar Conta Bancária"
        itemName={deletingConta?.nome}
        description={`Tem certeza que deseja eliminar a conta "${deletingConta?.nome}"? Ela deixará de constar na sua lista de carteiras e saldos.`}
        onConfirm={async () => {
          if (deletingConta) {
            await deleteContaBancaria(deletingConta.id);
            setDeletingConta(null);
          }
        }}
        onClose={() => setDeletingConta(null)}
      />

    </div>
  );
}
