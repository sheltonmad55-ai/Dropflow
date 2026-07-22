/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { Target, Calendar, Award, Save, CheckCircle2, Clock, Plus, Trash2, Smartphone, Car, Laptop, Home, Gift, DollarSign } from 'lucide-react';

export default function MetasView() {
  const { profile, updateProfile, vendas, metaItems, addMetaItem, deleteMetaItem, alocarParaMetaItem } = useApp();

  // Custom Goal Creation State
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetVal, setGoalTargetVal] = useState('');
  const [goalInitialVal, setGoalInitialVal] = useState('');
  const [goalCategory, setGoalCategory] = useState('Sonho');
  const [goalIcon, setGoalIcon] = useState('smartphone');

  // Manual Deposit Modal State
  const [depositMetaId, setDepositMetaId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  const handleCreateCustomGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTargetVal) return;

    await addMetaItem({
      nome: goalName,
      valor_alvo: parseFloat(goalTargetVal) || 0,
      valor_atual: parseFloat(goalInitialVal) || 0,
      categoria: goalCategory,
      icone: goalIcon
    });

    setGoalName('');
    setGoalTargetVal('');
    setGoalInitialVal('');
    setShowAddGoalModal(false);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositMetaId || !depositAmount) return;

    await alocarParaMetaItem(depositMetaId, parseFloat(depositAmount) || 0);
    setDepositMetaId(null);
    setDepositAmount('');
  };
  
  // Silent permission request on mount for a smoother experience
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(err => console.error("Error requesting notification permission:", err));
      }
    }
  }, []);

  // 1. Daily Goal States
  const [metaDiaria, setMetaDiaria] = useState<string>(profile?.metaDiaria?.toString() || '');
  const [periodoDiaria, setPeriodoDiaria] = useState<number>(profile?.periodoDiaria || 1);
  const [savingDaily, setSavingDaily] = useState(false);
  const [successDaily, setSuccessDaily] = useState(false);

  // 2. Weekly Goal States
  const [metaSemanal, setMetaSemanal] = useState<string>(profile?.metaSemanal?.toString() || '');
  const [periodoSemanal, setPeriodoSemanal] = useState<number>(profile?.periodoSemanal || 1);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [successWeekly, setSuccessWeekly] = useState(false);

  // 3. Monthly Goal States
  const [metaMensal, setMetaMensal] = useState<string>(profile?.metaMensal?.toString() || '');
  const [periodoMensal, setPeriodoMensal] = useState<number>(profile?.periodoMensal || 1);
  const [savingMonthly, setSavingMonthly] = useState(false);
  const [successMonthly, setSuccessMonthly] = useState(false);

  const currency = profile?.moeda || 'MT';

  // Helper date calculations
  const now = new Date();

  const getStartOfWeek = () => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  };

  // --- Real-time Dynamic Calculations Based on Local Inputs ---
  
  // A. Daily Sales Calculation
  const startDaily = new Date();
  startDaily.setHours(0,0,0,0);
  startDaily.setDate(startDaily.getDate() - (periodoDiaria - 1));

  const salesDaily = vendas
    .filter(v => {
      const vDate = new Date(v.data_venda + 'T00:00:00');
      return vDate >= startDaily;
    })
    .reduce((acc, v) => acc + v.valor_recebido, 0);

  // B. Weekly Sales Calculation
  const mondayDate = getStartOfWeek();
  const startWeekly = new Date(mondayDate);
  startWeekly.setDate(mondayDate.getDate() - (periodoSemanal - 1) * 7);

  const salesWeekly = vendas
    .filter(v => {
      const vDate = new Date(v.data_venda + 'T00:00:00');
      return vDate >= startWeekly;
    })
    .reduce((acc, v) => acc + v.valor_recebido, 0);

  // C. Monthly Sales Calculation
  const startMonthly = new Date(now.getFullYear(), now.getMonth() - (periodoMensal - 1), 1, 0, 0, 0, 0);

  const salesMonthly = vendas
    .filter(v => {
      const vDate = new Date(v.data_venda + 'T00:00:00');
      return vDate >= startMonthly;
    })
    .reduce((acc, v) => acc + v.valor_recebido, 0);

  // Goal configurations
  const goalDailyVal = parseFloat(metaDiaria) || 0;
  const goalWeeklyVal = parseFloat(metaSemanal) || 0;
  const goalMonthlyVal = parseFloat(metaMensal) || 0;

  // Progress Percentages
  const progressDaily = goalDailyVal > 0 ? Math.min(100, Math.round((salesDaily / goalDailyVal) * 100)) : 0;
  const progressWeekly = goalWeeklyVal > 0 ? Math.min(100, Math.round((salesWeekly / goalWeeklyVal) * 100)) : 0;
  const progressMonthly = goalMonthlyVal > 0 ? Math.min(100, Math.round((salesMonthly / goalMonthlyVal) * 100)) : 0;

  // --- Individual Save Handlers ---
  const handleSaveDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDaily(true);
    setSuccessDaily(false);
    try {
      await updateProfile({
        metaDiaria: goalDailyVal,
        periodoDiaria: periodoDiaria
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
        periodoSemanal: periodoSemanal
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
        periodoMensal: periodoMensal
      });
      setSuccessMonthly(true);
      setTimeout(() => setSuccessMonthly(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar meta mensal:", err);
    } finally {
      setSavingMonthly(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="metas_view_container">
      
      {/* Title section */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display">Controlo de Metas</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Defina os seus objetivos de vendas personalizados, escolha o período exato e acompanhe o progresso de cada um.</p>
      </div>

      {/* Individual, Modular Grid of Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="metas_individual_cards_grid">
        
        {/* CARD 1: META DIÁRIA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_diaria_individual">
          <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-2xl" id="meta_diaria_icon">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Diária</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">Progresso em Tempo Real</span>
                </div>
              </div>
              
              {progressDaily >= 100 ? (
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
            <form onSubmit={handleSaveDaily} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Período</label>
                  <select
                    value={periodoDiaria}
                    onChange={e => setPeriodoDiaria(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2.5 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                  >
                    <option value={1}>Hoje (1 dia)</option>
                    <option value={2}>2 dias</option>
                    <option value={3}>3 dias</option>
                    <option value={4}>4 dias</option>
                    <option value={5}>5 dias</option>
                    <option value={6}>6 dias</option>
                    <option value={7}>7 dias (1 semana)</option>
                    <option value={10}>10 dias</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                  <input
                    type="number"
                    placeholder="Ex: 5000"
                    value={metaDiaria}
                    onChange={e => setMetaDiaria(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Acumulado</span>
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
                    {goalDailyVal > salesDaily 
                      ? `Faltam ${(goalDailyVal - salesDaily).toLocaleString()} ${currency}` 
                      : 'Meta superada!'}
                  </span>
                </div>
              </div>

              {successDaily && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta diária guardada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingDaily}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingDaily ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Diária</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 2: META SEMANAL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_semanal_individual">
          <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl" id="meta_semanal_icon">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Semanal</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">Objetivo de Médio Prazo</span>
                </div>
              </div>
              
              {progressWeekly >= 100 ? (
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
            <form onSubmit={handleSaveWeekly} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Período</label>
                  <select
                    value={periodoSemanal}
                    onChange={e => setPeriodoSemanal(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2.5 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                  >
                    <option value={1}>Esta semana (1 semana)</option>
                    <option value={2}>2 semanas</option>
                    <option value={3}>3 semanas</option>
                    <option value={4}>4 semanas</option>
                    <option value={6}>6 semanas</option>
                    <option value={8}>8 semanas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                  <input
                    type="number"
                    placeholder="Ex: 30000"
                    value={metaSemanal}
                    onChange={e => setMetaSemanal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Acumulado</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                    {salesWeekly.toLocaleString()} <span className="text-slate-400 text-xs font-semibold">/ {goalWeeklyVal > 0 ? goalWeeklyVal.toLocaleString() : '---'} {currency}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${progressWeekly >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressWeekly}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>{progressWeekly}% alcançado</span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {goalWeeklyVal > salesWeekly 
                      ? `Faltam ${(goalWeeklyVal - salesWeekly).toLocaleString()} ${currency}` 
                      : 'Meta superada!'}
                  </span>
                </div>
              </div>

              {successWeekly && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta semanal guardada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingWeekly}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingWeekly ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Semanal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: META MENSAL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md" id="card_meta_mensal_individual">
          <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 p-2.5 rounded-2xl" id="meta_mensal_icon">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-display">Meta Mensal</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">Faturamento e Escala</span>
                </div>
              </div>
              
              {progressMonthly >= 100 ? (
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
            <form onSubmit={handleSaveMonthly} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Período</label>
                  <select
                    value={periodoMensal}
                    onChange={e => setPeriodoMensal(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2.5 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                  >
                    <option value={1}>Este mês (1 mês)</option>
                    <option value={2}>2 meses</option>
                    <option value={3}>3 meses</option>
                    <option value={4}>4 meses</option>
                    <option value={5}>5 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses (1 ano)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Valor Alvo ({currency})</label>
                  <input
                    type="number"
                    placeholder="Ex: 120000"
                    value={metaMensal}
                    onChange={e => setMetaMensal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Progress Display */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Acumulado</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                    {salesMonthly.toLocaleString()} <span className="text-slate-400 text-xs font-semibold">/ {goalMonthlyVal > 0 ? goalMonthlyVal.toLocaleString() : '---'} {currency}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${progressMonthly >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressMonthly}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>{progressMonthly}% alcançado</span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {goalMonthlyVal > salesMonthly 
                      ? `Faltam ${(goalMonthlyVal - salesMonthly).toLocaleString()} ${currency}` 
                      : 'Meta superada!'}
                  </span>
                </div>
              </div>

              {successMonthly && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl text-center animate-fade-in">
                  Meta mensal guardada com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={savingMonthly}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingMonthly ? (
                  <span>A guardar...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Mensal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* --- SECTION: Custom Personal Goals / Sonhos & Objetivos --- */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 space-y-4" id="custom_goals_section">
        <div className="flex justify-between items-center" id="custom_goals_header">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Objetivos & Compras (Sonhos)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crie metas para aquisição de equipamentos, bens pessoais ou investimentos do negócio.
            </p>
          </div>

          <button
            onClick={() => setShowAddGoalModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            id="btn_add_custom_goal"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta</span>
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
                          {m.icone === 'car' ? <Car className="w-5 h-5" /> :
                           m.icone === 'laptop' ? <Laptop className="w-5 h-5" /> :
                           m.icone === 'home' ? <Home className="w-5 h-5" /> :
                           m.icone === 'gift' ? <Gift className="w-5 h-5" /> :
                           <Smartphone className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-display">{m.nome}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{m.categoria || 'Geral'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMetaItem(m.id)}
                        className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Eliminar esta meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                            <CheckCircle2 className="w-3 h-3" /> Meta Alcançada!
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
              Defina metas como "Comprar Celular" ou "Comprar Carro". Ao registar vendas, você poderá alocar percentagens do lucro diretamente para estas metas!
            </p>
          </div>
        )}
      </div>

      {/* Modal: Create Goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-display">Nova Meta de Compra / Sonho</h3>
            
            <form onSubmit={handleCreateCustomGoal} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nome do Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comprar Celular Novo, Carro, etc."
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
                    placeholder="Ex: 25000"
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
                    <option value="Equipamento">Equipamento Negócio</option>
                    <option value="Veículo">Veículo / Transporte</option>
                    <option value="Imóvel">Imóvel / Instalações</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Ícone</label>
                  <select
                    value={goalIcon}
                    onChange={e => setGoalIcon(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                  >
                    <option value="smartphone">📱 Celular</option>
                    <option value="car">🚗 Carro / Veículo</option>
                    <option value="laptop">💻 Computador</option>
                    <option value="home">🏠 Casa / Loja</option>
                    <option value="gift">🎁 Outro Presente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manual Deposit into Goal */}
      {depositMetaId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
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
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm"
                >
                  Confirmar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
