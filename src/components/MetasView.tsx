/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { Target, Calendar, Award, Save, CheckCircle2, Clock } from 'lucide-react';

export default function MetasView() {
  const { profile, updateProfile, vendas } = useApp();
  
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

    </div>
  );
}
