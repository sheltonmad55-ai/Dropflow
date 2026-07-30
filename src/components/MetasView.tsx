/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import ModalPortal from './ModalPortal.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { 
  Target, Calendar, Award, Save, CheckCircle2, Clock, Plus, Trash2, Edit, 
  Smartphone, Car, Laptop, Home, Gift, DollarSign, Briefcase, Plane, ShoppingBag, 
  History, RotateCcw, AlertCircle, Sparkles, ChevronRight 
} from 'lucide-react';
import { MetaItem, HistoricoMeta } from '../types.ts';

// Date Helpers
const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToBR = (dateStr: string): string => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const getTodayStr = () => formatDateToISO(new Date());

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateToISO(d);
};

const getThisWeekRange = () => {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDateToISO(monday), end: formatDateToISO(sunday) };
};

const getNextWeekRange = () => {
  const thisWeek = getThisWeekRange();
  const monday = new Date(thisWeek.start + 'T00:00:00');
  monday.setDate(monday.getDate() + 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDateToISO(monday), end: formatDateToISO(sunday) };
};

const getThisMonthRange = () => {
  const d = new Date();
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: formatDateToISO(firstDay), end: formatDateToISO(lastDay) };
};

const getNextMonthRange = () => {
  const d = new Date();
  const firstDay = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 2, 0);
  return { start: formatDateToISO(firstDay), end: formatDateToISO(lastDay) };
};

export default function MetasView() {
  const { profile, updateProfile, vendas, metaItems, addMetaItem, editMetaItem, deleteMetaItem, alocarParaMetaItem, formatMoney } = useApp();

  const currency = profile?.moeda || 'MT';
  const todayStr = getTodayStr();

  // Delete modal state
  const [deletingMeta, setDeletingMeta] = useState<any>(null);
  const [isClearingHistoryOpen, setIsClearingHistoryOpen] = useState(false);

  // Custom Goal Creation State
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetVal, setGoalTargetVal] = useState('');
  const [goalInitialVal, setGoalInitialVal] = useState('');
  const [goalCategory, setGoalCategory] = useState('Sonho');
  const [goalIcon, setGoalIcon] = useState('smartphone');
  const [goalDataLimite, setGoalDataLimite] = useState('');

  // Custom Goal Editing State
  const [editingMeta, setEditingMeta] = useState<MetaItem | null>(null);
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalTargetVal, setEditGoalTargetVal] = useState('');
  const [editGoalCurrentVal, setEditGoalCurrentVal] = useState('');
  const [editGoalCategory, setEditGoalCategory] = useState('Sonho');
  const [editGoalIcon, setEditGoalIcon] = useState('smartphone');
  const [editGoalDataLimite, setEditGoalDataLimite] = useState('');

  // Manual Deposit Modal State
  const [depositMetaId, setDepositMetaId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // 1. Daily Goal States
  const [metaDiariaVal, setMetaDiariaVal] = useState<string>(profile?.metaDiaria?.toString() || '');
  const [metaDiariaInicio, setMetaDiariaInicio] = useState<string>(profile?.metaDiariaInicio || todayStr);
  const [metaDiariaFim, setMetaDiariaFim] = useState<string>(profile?.metaDiariaFim || todayStr);
  const [dailyPreset, setDailyPreset] = useState<'hoje' | 'amanha' | 'custom'>('hoje');
  const [savingDaily, setSavingDaily] = useState(false);
  const [successDaily, setSuccessDaily] = useState(false);

  // 2. Weekly Goal States
  const thisWeek = getThisWeekRange();
  const [metaSemanalVal, setMetaSemanalVal] = useState<string>(profile?.metaSemanal?.toString() || '');
  const [metaSemanalInicio, setMetaSemanalInicio] = useState<string>(profile?.metaSemanalInicio || thisWeek.start);
  const [metaSemanalFim, setMetaSemanalFim] = useState<string>(profile?.metaSemanalFim || thisWeek.end);
  const [weeklyPreset, setWeeklyPreset] = useState<'esta_semana' | 'proxima_semana' | 'custom'>('esta_semana');
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [successWeekly, setSuccessWeekly] = useState(false);

  // 3. Monthly Goal States
  const thisMonth = getThisMonthRange();
  const [metaMensalVal, setMetaMensalVal] = useState<string>(profile?.metaMensal?.toString() || '');
  const [metaMensalInicio, setMetaMensalInicio] = useState<string>(profile?.metaMensalInicio || thisMonth.start);
  const [metaMensalFim, setMetaMensalFim] = useState<string>(profile?.metaMensalFim || thisMonth.end);
  const [monthlyPreset, setMonthlyPreset] = useState<'este_mes' | 'proximo_mes' | 'custom'>('este_mes');
  const [savingMonthly, setSavingMonthly] = useState(false);
  const [successMonthly, setSuccessMonthly] = useState(false);

  // Auto-reset check & sync when loading
  useEffect(() => {
    if (!profile) return;

    let historyUpdated = false;
    const newHistory: HistoricoMeta[] = [...(profile.historicoMetas || [])];
    const profileUpdates: Partial<typeof profile> = {};

    // Check Daily Goal Expiry
    const dStart = profile.metaDiariaInicio || todayStr;
    const dFim = profile.metaDiariaFim || todayStr;
    const dTarget = profile.metaDiaria || 0;

    if (dFim < todayStr && dTarget > 0) {
      // Calculate final sales achieved for that daily cycle
      const dSales = vendas
        .filter(v => v.data_venda >= dStart && v.data_venda <= dFim)
        .reduce((sum, v) => sum + v.valor_recebido, 0);

      newHistory.unshift({
        id: crypto.randomUUID(),
        tipo: 'diaria',
        titulo: `Meta Diária (${formatDateToBR(dStart)} a ${formatDateToBR(dFim)})`,
        data_inicio: dStart,
        data_fim: dFim,
        valor_alvo: dTarget,
        valor_atingido: dSales,
        status: dSales >= dTarget ? 'batida' : 'nao_atingida',
        porcentagem: dTarget > 0 ? Math.min(100, Math.round((dSales / dTarget) * 100)) : 0,
        criado_em: new Date().toISOString()
      });

      // Auto Reset Daily dates to Today
      profileUpdates.metaDiariaInicio = todayStr;
      profileUpdates.metaDiariaFim = todayStr;
      setMetaDiariaInicio(todayStr);
      setMetaDiariaFim(todayStr);
      historyUpdated = true;
    }

    // Check Weekly Goal Expiry
    const wStart = profile.metaSemanalInicio || thisWeek.start;
    const wFim = profile.metaSemanalFim || thisWeek.end;
    const wTarget = profile.metaSemanal || 0;

    if (wFim < todayStr && wTarget > 0) {
      const wSales = vendas
        .filter(v => v.data_venda >= wStart && v.data_venda <= wFim)
        .reduce((sum, v) => sum + v.valor_recebido, 0);

      newHistory.unshift({
        id: crypto.randomUUID(),
        tipo: 'semanal',
        titulo: `Meta Semanal (${formatDateToBR(wStart)} a ${formatDateToBR(wFim)})`,
        data_inicio: wStart,
        data_fim: wFim,
        valor_alvo: wTarget,
        valor_atingido: wSales,
        status: wSales >= wTarget ? 'batida' : 'nao_atingida',
        porcentagem: wTarget > 0 ? Math.min(100, Math.round((wSales / wTarget) * 100)) : 0,
        criado_em: new Date().toISOString()
      });

      // Auto Reset Weekly dates to This Week
      const tw = getThisWeekRange();
      profileUpdates.metaSemanalInicio = tw.start;
      profileUpdates.metaSemanalFim = tw.end;
      setMetaSemanalInicio(tw.start);
      setMetaSemanalFim(tw.end);
      historyUpdated = true;
    }

    // Check Monthly Goal Expiry
    const mStart = profile.metaMensalInicio || thisMonth.start;
    const mFim = profile.metaMensalFim || thisMonth.end;
    const mTarget = profile.metaMensal || 0;

    if (mFim < todayStr && mTarget > 0) {
      const mSales = vendas
        .filter(v => v.data_venda >= mStart && v.data_venda <= mFim)
        .reduce((sum, v) => sum + v.valor_recebido, 0);

      newHistory.unshift({
        id: crypto.randomUUID(),
        tipo: 'mensal',
        titulo: `Meta Mensal (${formatDateToBR(mStart)} a ${formatDateToBR(mFim)})`,
        data_inicio: mStart,
        data_fim: mFim,
        valor_alvo: mTarget,
        valor_atingido: mSales,
        status: mSales >= mTarget ? 'batida' : 'nao_atingida',
        porcentagem: mTarget > 0 ? Math.min(100, Math.round((mSales / mTarget) * 100)) : 0,
        criado_em: new Date().toISOString()
      });

      // Auto Reset Monthly dates to This Month
      const tm = getThisMonthRange();
      profileUpdates.metaMensalInicio = tm.start;
      profileUpdates.metaMensalFim = tm.end;
      setMetaMensalInicio(tm.start);
      setMetaMensalFim(tm.end);
      historyUpdated = true;
    }

    if (historyUpdated) {
      profileUpdates.historicoMetas = newHistory;
      updateProfile(profileUpdates);
    }
  }, [profile?.id]);

  // Helper calculation for sales in date range
  const calcSalesInRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    return vendas
      .filter(v => v.data_venda >= startStr && v.data_venda <= endStr)
      .reduce((sum, v) => sum + v.valor_recebido, 0);
  };

  // Dynamic Sales Calculations
  const salesDaily = calcSalesInRange(metaDiariaInicio, metaDiariaFim);
  const salesWeekly = calcSalesInRange(metaSemanalInicio, metaSemanalFim);
  const salesMonthly = calcSalesInRange(metaMensalInicio, metaMensalFim);

  const goalDailyVal = parseFloat(metaDiariaVal) || 0;
  const goalWeeklyVal = parseFloat(metaSemanalVal) || 0;
  const goalMonthlyVal = parseFloat(metaMensalVal) || 0;

  const progressDaily = goalDailyVal > 0 ? Math.min(100, Math.round((salesDaily / goalDailyVal) * 100)) : 0;
  const progressWeekly = goalWeeklyVal > 0 ? Math.min(100, Math.round((salesWeekly / goalWeeklyVal) * 100)) : 0;
  const progressMonthly = goalMonthlyVal > 0 ? Math.min(100, Math.round((salesMonthly / goalMonthlyVal) * 100)) : 0;

  // Preset Handlers
  const handleDailyPresetChange = (preset: 'hoje' | 'amanha' | 'custom') => {
    setDailyPreset(preset);
    if (preset === 'hoje') {
      const today = getTodayStr();
      setMetaDiariaInicio(today);
      setMetaDiariaFim(today);
    } else if (preset === 'amanha') {
      const tom = getTomorrowStr();
      setMetaDiariaInicio(tom);
      setMetaDiariaFim(tom);
    }
  };

  const handleWeeklyPresetChange = (preset: 'esta_semana' | 'proxima_semana' | 'custom') => {
    setWeeklyPreset(preset);
    if (preset === 'esta_semana') {
      const tw = getThisWeekRange();
      setMetaSemanalInicio(tw.start);
      setMetaSemanalFim(tw.end);
    } else if (preset === 'proxima_semana') {
      const nw = getNextWeekRange();
      setMetaSemanalInicio(nw.start);
      setMetaSemanalFim(nw.end);
    }
  };

  const handleMonthlyPresetChange = (preset: 'este_mes' | 'proximo_mes' | 'custom') => {
    setMonthlyPreset(preset);
    if (preset === 'este_mes') {
      const tm = getThisMonthRange();
      setMetaMensalInicio(tm.start);
      setMetaMensalFim(tm.end);
    } else if (preset === 'proximo_mes') {
      const nm = getNextMonthRange();
      setMetaMensalInicio(nm.start);
      setMetaMensalFim(nm.end);
    }
  };

  // Individual Save Handlers
  const handleSaveDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDaily(true);
    setSuccessDaily(false);
    try {
      await updateProfile({
        metaDiaria: goalDailyVal,
        metaDiariaInicio,
        metaDiariaFim
      });
      setSuccessDaily(true);
      setTimeout(() => setSuccessDaily(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar meta diária:", err);
    } finally {
      setSavingDaily(false);
    }
  };

  const handleSaveWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWeekly(true);
    setSuccessWeekly(false);
    try {
      await updateProfile({
        metaSemanal: goalWeeklyVal,
        metaSemanalInicio,
        metaSemanalFim
      });
      setSuccessWeekly(true);
      setTimeout(() => setSuccessWeekly(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar meta semanal:", err);
    } finally {
      setSavingWeekly(false);
    }
  };

  const handleSaveMonthly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMonthly(true);
    setSuccessMonthly(false);
    try {
      await updateProfile({
        metaMensal: goalMonthlyVal,
        metaMensalInicio,
        metaMensalFim
      });
      setSuccessMonthly(true);
      setTimeout(() => setSuccessMonthly(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar meta mensal:", err);
    } finally {
      setSavingMonthly(false);
    }
  };

  // Custom Goal Creation
  const handleCreateCustomGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTargetVal) return;

    await addMetaItem({
      nome: goalName,
      valor_alvo: parseFloat(goalTargetVal) || 0,
      valor_atual: parseFloat(goalInitialVal) || 0,
      categoria: goalCategory,
      icone: goalIcon,
      data_limite: goalDataLimite || undefined
    });

    setGoalName('');
    setGoalTargetVal('');
    setGoalInitialVal('');
    setGoalDataLimite('');
    setShowAddGoalModal(false);
  };

  // Custom Goal Edit
  const handleStartEditGoal = (m: MetaItem) => {
    setEditingMeta(m);
    setEditGoalName(m.nome);
    setEditGoalTargetVal(m.valor_alvo.toString());
    setEditGoalCurrentVal(m.valor_atual.toString());
    setEditGoalCategory(m.categoria || 'Sonho');
    setEditGoalIcon(m.icone || 'smartphone');
    setEditGoalDataLimite(m.data_limite || '');
  };

  const handleSaveEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeta || !editGoalName || !editGoalTargetVal) return;

    await editMetaItem(editingMeta.id, {
      nome: editGoalName,
      valor_alvo: parseFloat(editGoalTargetVal) || 0,
      valor_atual: parseFloat(editGoalCurrentVal) || 0,
      categoria: editGoalCategory,
      icone: editGoalIcon,
      data_limite: editGoalDataLimite || undefined
    });

    setEditingMeta(null);
  };

  // Deposit Handler
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositMetaId || !depositAmount) return;

    await alocarParaMetaItem(depositMetaId, parseFloat(depositAmount) || 0);
    setDepositMetaId(null);
    setDepositAmount('');
  };

  // History Actions
  const handleClearHistoryItem = async (histId: string) => {
    if (!profile) return;
    const currentHist = profile.historicoMetas || [];
    const updated = currentHist.filter(h => h.id !== histId);
    await updateProfile({ historicoMetas: updated });
  };

  const handleClearAllHistory = () => {
    if (!profile) return;
    setIsClearingHistoryOpen(true);
  };

  const confirmClearAllHistory = async () => {
    if (!profile) return;
    await updateProfile({ historicoMetas: [] });
    setIsClearingHistoryOpen(false);
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'car': return <Car className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      case 'gift': return <Gift className="w-5 h-5" />;
      case 'briefcase': return <Briefcase className="w-5 h-5" />;
      case 'plane': return <Plane className="w-5 h-5" />;
      case 'shopping-bag': return <ShoppingBag className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const historicoList = profile?.historicoMetas || [];

  return (
    <div className="space-y-8 animate-fade-in" id="metas_view_container">
      
      {/* Title section */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display">Controlo de Metas Inteligente</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Configure metas para hoje, próximas semanas ou períodos futuros. Ao expirar o período, o sistema guarda o histórico automaticamente e reinicia a meta para o novo ciclo!
        </p>
      </div>

      {/* Grid of Sales Goal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="metas_individual_cards_grid">
        
        {/* CARD 1: META DIÁRIA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_diaria">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-2xl" id="meta_diaria_icon">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Diária</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    {formatDateToBR(metaDiariaInicio)} {metaDiariaInicio !== metaDiariaFim ? `a ${formatDateToBR(metaDiariaFim)}` : ''}
                  </span>
                </div>
              </div>
              
              {todayStr < metaDiariaInicio ? (
                <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Futura ⏳
                </span>
              ) : progressDaily >= 100 ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Batida! 🎉
                </span>
              ) : (
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Ativa 📈
                </span>
              )}
            </div>

            {/* Inputs / Settings Section */}
            <form onSubmit={handleSaveDaily} className="space-y-3 pt-1">
              
              {/* Preset Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Selecione o Período</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDailyPresetChange('hoje')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      dailyPreset === 'hoje' 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyPresetChange('amanha')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      dailyPreset === 'amanha' 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Amanhã
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyPresetChange('custom')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      dailyPreset === 'custom' 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Outro Dia
                  </button>
                </div>
              </div>

              {/* Date Inputs if Custom */}
              {dailyPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Início</label>
                    <input
                      type="date"
                      value={metaDiariaInicio}
                      onChange={e => setMetaDiariaInicio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Fim</label>
                    <input
                      type="date"
                      value={metaDiariaFim}
                      onChange={e => setMetaDiariaFim(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  value={metaDiariaVal}
                  onChange={e => setMetaDiariaVal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vendas Acumuladas</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                    {salesDaily.toLocaleString()} <span className="text-slate-400 text-xs font-semibold">/ {goalDailyVal > 0 ? goalDailyVal.toLocaleString() : '---'} {currency}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${progressDaily >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressDaily}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>{progressDaily}% alcançado</span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {todayStr < metaDiariaInicio ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Inicia em {formatDateToBR(metaDiariaInicio)}</span>
                    ) : goalDailyVal > salesDaily ? (
                      `Faltam ${(goalDailyVal - salesDaily).toLocaleString()} ${currency}`
                    ) : (
                      'Meta superada!'
                    )}
                  </span>
                </div>
              </div>

              {successDaily && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta diária atualizada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingDaily}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingDaily ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Meta Diária</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 2: META SEMANAL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_semanal">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl" id="meta_semanal_icon">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Semanal</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    {formatDateToBR(metaSemanalInicio)} até {formatDateToBR(metaSemanalFim)}
                  </span>
                </div>
              </div>
              
              {todayStr < metaSemanalInicio ? (
                <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Futura ⏳
                </span>
              ) : progressWeekly >= 100 ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Batida! 🎉
                </span>
              ) : (
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Ativa 📈
                </span>
              )}
            </div>

            {/* Inputs / Settings Section */}
            <form onSubmit={handleSaveWeekly} className="space-y-3 pt-1">
              
              {/* Preset Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Selecione o Período</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleWeeklyPresetChange('esta_semana')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      weeklyPreset === 'esta_semana' 
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeeklyPresetChange('proxima_semana')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      weeklyPreset === 'proxima_semana' 
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Próx. Semana 🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeeklyPresetChange('custom')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      weeklyPreset === 'custom' 
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Personalizada
                  </button>
                </div>
              </div>

              {/* Date Inputs if Custom */}
              {weeklyPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Início</label>
                    <input
                      type="date"
                      value={metaSemanalInicio}
                      onChange={e => setMetaSemanalInicio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Fim</label>
                    <input
                      type="date"
                      value={metaSemanalFim}
                      onChange={e => setMetaSemanalFim(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                <input
                  type="number"
                  placeholder="Ex: 30000"
                  value={metaSemanalVal}
                  onChange={e => setMetaSemanalVal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vendas Acumuladas</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                    {salesWeekly.toLocaleString()} <span className="text-slate-400 text-xs font-semibold">/ {goalWeeklyVal > 0 ? goalWeeklyVal.toLocaleString() : '---'} {currency}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${progressWeekly >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'}`}
                    style={{ width: `${progressWeekly}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>{progressWeekly}% alcançado</span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {todayStr < metaSemanalInicio ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Inicia em {formatDateToBR(metaSemanalInicio)}</span>
                    ) : goalWeeklyVal > salesWeekly ? (
                      `Faltam ${(goalWeeklyVal - salesWeekly).toLocaleString()} ${currency}`
                    ) : (
                      'Meta superada!'
                    )}
                  </span>
                </div>
              </div>

              {successWeekly && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta semanal atualizada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingWeekly}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingWeekly ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Meta Semanal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: META MENSAL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_mensal">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 p-2.5 rounded-2xl" id="meta_mensal_icon">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Mensal</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    {formatDateToBR(metaMensalInicio)} até {formatDateToBR(metaMensalFim)}
                  </span>
                </div>
              </div>
              
              {todayStr < metaMensalInicio ? (
                <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Futura ⏳
                </span>
              ) : progressMonthly >= 100 ? (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Batida! 🎉
                </span>
              ) : (
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Ativa 📈
                </span>
              )}
            </div>

            {/* Inputs / Settings Section */}
            <form onSubmit={handleSaveMonthly} className="space-y-3 pt-1">
              
              {/* Preset Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Selecione o Período</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleMonthlyPresetChange('este_mes')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      monthlyPreset === 'este_mes' 
                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Este Mês
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMonthlyPresetChange('proximo_mes')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      monthlyPreset === 'proximo_mes' 
                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Próx. Mês 📅
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMonthlyPresetChange('custom')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      monthlyPreset === 'custom' 
                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Personalizada
                  </button>
                </div>
              </div>

              {/* Date Inputs if Custom */}
              {monthlyPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Início</label>
                    <input
                      type="date"
                      value={metaMensalInicio}
                      onChange={e => setMetaMensalInicio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Data Fim</label>
                    <input
                      type="date"
                      value={metaMensalFim}
                      onChange={e => setMetaMensalFim(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                <input
                  type="number"
                  placeholder="Ex: 120000"
                  value={metaMensalVal}
                  onChange={e => setMetaMensalVal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vendas Acumuladas</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                    {salesMonthly.toLocaleString()} <span className="text-slate-400 text-xs font-semibold">/ {goalMonthlyVal > 0 ? goalMonthlyVal.toLocaleString() : '---'} {currency}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${progressMonthly >= 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
                    style={{ width: `${progressMonthly}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>{progressMonthly}% alcançado</span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {todayStr < metaMensalInicio ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Inicia em {formatDateToBR(metaMensalInicio)}</span>
                    ) : goalMonthlyVal > salesMonthly ? (
                      `Faltam ${(goalMonthlyVal - salesMonthly).toLocaleString()} ${currency}`
                    ) : (
                      'Meta superada!'
                    )}
                  </span>
                </div>
              </div>

              {successMonthly && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta mensal atualizada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingMonthly}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingMonthly ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Meta Mensal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* --- SECTION: Custom Personal Goals / Sonhos & Objetivos --- */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 space-y-4" id="custom_goals_section">
        <div className="flex flex-wrap justify-between items-center gap-2" id="custom_goals_header">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Objetivos & Compras (Metas de Carro, Celular, Sonhos)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crie e edite metas para aquisição de veículos, computadores, bens pessoais ou investimentos. Aloque fundos diretamente de vendas!
            </p>
          </div>

          <button
            onClick={() => setShowAddGoalModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            id="btn_add_custom_goal"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta de Compra</span>
          </button>
        </div>

        {/* List of Custom Goal Cards */}
        {metaItems && metaItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="custom_goals_grid">
            {metaItems.map(m => {
              const pct = m.valor_alvo > 0 ? Math.min(100, Math.round((m.valor_atual / m.valor_alvo) * 100)) : 0;
              const isCompleted = pct >= 100;

              return (
                <div 
                  key={m.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
                  id={`goal_card_${m.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
                          {renderIcon(m.icone)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-display">{m.nome}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{m.categoria || 'Sonho'}</span>
                          {m.data_limite && (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-semibold">
                              Meta: {formatDateToBR(m.data_limite)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditGoal(m)}
                          className="text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar esta meta"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMeta(m)}
                          className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Eliminar esta meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 dark:text-slate-400">Progresso:</span>
                        <span className="text-slate-900 dark:text-slate-100 font-extrabold">
                          {m.valor_atual.toLocaleString()} / {m.valor_alvo.toLocaleString()} {currency}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span>{pct}% concluído</span>
                        {isCompleted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Concluído!
                          </span>
                        ) : (
                          <span>Faltam {(m.valor_alvo - m.valor_atual).toLocaleString()} {currency}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setDepositMetaId(m.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Depositar Fundos</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <Target className="w-8 h-8 text-amber-500/40 mx-auto" />
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Nenhuma meta de compra registada</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Defina metas como "Comprar Carro", "Comprar Celular" ou "Comprar Computador". Pode editá-las a qualquer momento e alocar lucros de vendas diretamente para elas!
            </p>
          </div>
        )}
      </div>

      {/* --- SECTION: HISTÓRICO DE METAS POR BAIXO --- */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 space-y-4" id="history_goals_section">
        <div className="flex justify-between items-center" id="history_goals_header">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50 font-display flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              <span>Histórico de Ciclos de Metas Concluídos</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ao terminar o período de cada meta (dia, semana ou mês), os resultados anteriores ficam gravados aqui automaticamente.
            </p>
          </div>

          {historicoList.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors cursor-pointer"
            >
              Limpar Histórico
            </button>
          )}
        </div>

        {historicoList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="history_goals_grid">
            {historicoList.map(h => (
              <div 
                key={h.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                      {h.tipo === 'diaria' ? 'Meta Diária' : h.tipo === 'semanal' ? 'Meta Semanal' : h.tipo === 'mensal' ? 'Meta Mensal' : 'Meta Personalizada'}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{h.titulo}</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    {h.status === 'batida' ? (
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Batida! ({h.porcentagem}%)
                      </span>
                    ) : (
                      <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                        Incompleta ({h.porcentagem}%)
                      </span>
                    )}

                    <button
                      onClick={() => handleClearHistoryItem(h.id)}
                      className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 p-1"
                      title="Remover este registo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium text-[10px]">Alvo: {h.valor_alvo.toLocaleString()} {currency}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black">
                    Atingido: <strong className={h.status === 'batida' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                      {h.valor_atingido.toLocaleString()} {currency}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 text-center space-y-1">
            <History className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nenhum histórico acumulado até ao momento.</p>
            <p className="text-[10px] text-slate-400">Assim que o período da sua meta atual terminar, os totais serão guardados aqui automaticamente.</p>
          </div>
        )}
      </div>

      {/* MODAL: CREATE CUSTOM GOAL */}
      {showAddGoalModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-display">Nova Meta de Compra / Sonho</h3>
              
              <form onSubmit={handleCreateCustomGoal} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nome do Objetivo / Produto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comprar Carro Novo, Celular, Laptop..."
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Valor Alvo ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Ex: 250000"
                      value={goalTargetVal}
                      onChange={e => setGoalTargetVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Valor Inicial ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 0"
                      value={goalInitialVal}
                      onChange={e => setGoalInitialVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Categoria</label>
                    <select
                      value={goalCategory}
                      onChange={e => setGoalCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="Sonho">Sonho Pessoal</option>
                      <option value="Veículo">Veículo / Carro</option>
                      <option value="Equipamento">Equipamento Negócio</option>
                      <option value="Imóvel">Imóvel / Loja</option>
                      <option value="Viagem">Viagem / Férias</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Ícone</label>
                    <select
                      value={goalIcon}
                      onChange={e => setGoalIcon(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="car">🚗 Carro / Veículo</option>
                      <option value="smartphone">📱 Celular</option>
                      <option value="laptop">💻 Computador</option>
                      <option value="home">🏠 Casa / Loja</option>
                      <option value="plane">✈️ Viagem</option>
                      <option value="gift">🎁 Presente / Sonho</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Data Limite Desejada (Opcional)</label>
                  <input
                    type="date"
                    value={goalDataLimite}
                    onChange={e => setGoalDataLimite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    Criar Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: EDIT CUSTOM GOAL */}
      {editingMeta && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-display">Editar Meta de Compra</h3>
              
              <form onSubmit={handleSaveEditGoal} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nome do Objetivo / Produto</label>
                  <input
                    type="text"
                    required
                    value={editGoalName}
                    onChange={e => setEditGoalName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Valor Alvo ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editGoalTargetVal}
                      onChange={e => setEditGoalTargetVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Valor Atual Salvo ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      value={editGoalCurrentVal}
                      onChange={e => setEditGoalCurrentVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Categoria</label>
                    <select
                      value={editGoalCategory}
                      onChange={e => setEditGoalCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="Sonho">Sonho Pessoal</option>
                      <option value="Veículo">Veículo / Carro</option>
                      <option value="Equipamento">Equipamento Negócio</option>
                      <option value="Imóvel">Imóvel / Loja</option>
                      <option value="Viagem">Viagem / Férias</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Ícone</label>
                    <select
                      value={editGoalIcon}
                      onChange={e => setEditGoalIcon(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="car">🚗 Carro / Veículo</option>
                      <option value="smartphone">📱 Celular</option>
                      <option value="laptop">💻 Computador</option>
                      <option value="home">🏠 Casa / Loja</option>
                      <option value="plane">✈️ Viagem</option>
                      <option value="gift">🎁 Presente / Sonho</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Data Limite Desejada (Opcional)</label>
                  <input
                    type="date"
                    value={editGoalDataLimite}
                    onChange={e => setEditGoalDataLimite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMeta(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    Guardar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: MANUAL DEPOSIT */}
      {depositMetaId && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-display">Depositar Fundos na Meta</h3>

              <form onSubmit={handleDepositSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Valor a Depositar ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 1000"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDepositMetaId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    Confirmar Depósito
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Confirmation Modal for Goal Deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingMeta}
        title="Eliminar Meta / Objetivo"
        itemName={deletingMeta?.nome}
        description={`Tem certeza que deseja eliminar a meta "${deletingMeta?.nome}"? Os valores já poupados para esta meta não serão perdidos.`}
        onConfirm={async () => {
          if (deletingMeta) {
            await deleteMetaItem(deletingMeta.id);
            setDeletingMeta(null);
          }
        }}
        onClose={() => setDeletingMeta(null)}
      />

      {/* Confirmation Modal for Goal History Clearing */}
      <ConfirmDeleteModal
        isOpen={isClearingHistoryOpen}
        title="Limpar Histórico de Metas"
        description="Tem certeza que deseja limpar todo o histórico de metas concluídas? Esta ação é irreversível."
        confirmText="Limpar Histórico"
        onConfirm={confirmClearAllHistory}
        onClose={() => setIsClearingHistoryOpen(false)}
      />

    </div>
  );
}
