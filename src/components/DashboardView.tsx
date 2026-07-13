/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../lib/appContext.tsx';
import { 
  TrendingUp, 
  TrendingDown,
  Megaphone, 
  Package, 
  Truck, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  ChevronRight,
  ChevronLeft,
  Info,
  Calendar,
  DollarSign,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  onOpenVenda: () => void;
  onOpenDespesa: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ onOpenVenda, onOpenDespesa, setActiveTab }: DashboardViewProps) {
  const { 
    profile, 
    caixinhas, 
    vendas, 
    despesas,
    produtos,
    broadcasts
  } = useApp();

  const currency = profile?.moeda || 'MT';

  // Date utilities (local-safe to avoid timezone mismatches)
  const getLocalDateStr = (date: Date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getYesterdayDateStr = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return getLocalDateStr(today);
  };

  const getPrevDateStr = (dateStr: string) => {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() - 1);
    return getLocalDateStr(date);
  };

  const formatFriendlyDate = (dateStr: string) => {
    const todayStr = getLocalDateStr(new Date());
    const yesterdayStr = getYesterdayDateStr();
    
    if (dateStr === todayStr) {
      return 'Hoje';
    } else if (dateStr === yesterdayStr) {
      return 'Ontem';
    }
    
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const getDayName = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  // State for focused date selection
  const [selectedDateStr, setSelectedDateStr] = React.useState(() => {
    return getLocalDateStr(new Date());
  });

  // Pivot date to anchor the stable 7-day strip
  const [pivotDateStr, setPivotDateStr] = React.useState(() => {
    return getLocalDateStr(new Date());
  });

  // Stable days array centered on or ending at the pivotDateStr
  const getDaysArray = (pivotStr: string) => {
    const days = [];
    const parts = pivotStr.split('-');
    const pivotDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    // We display 7 days ending with pivotDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(pivotDate.getTime());
      d.setDate(pivotDate.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    
    // Update pivot if the selected date is not in the currently displayed 7 days
    const currentDays = getDaysArray(pivotDateStr).map(d => getLocalDateStr(d));
    if (!currentDays.includes(dateStr)) {
      setPivotDateStr(dateStr);
    }
  };

  const shiftPivotDate = (daysCount: number) => {
    const parts = pivotDateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() + daysCount);
    
    const today = new Date();
    if (date > today) {
      setPivotDateStr(getLocalDateStr(today));
    } else {
      setPivotDateStr(getLocalDateStr(date));
    }
  };

  const jumpToToday = () => {
    const todayStr = getLocalDateStr(new Date());
    setSelectedDateStr(todayStr);
    setPivotDateStr(todayStr);
  };

  // Calculations
  const totalBalance = caixinhas.reduce((acc, curr) => acc + curr.saldo_atual, 0);
  const totalFaturamento = (vendas || []).reduce((acc, curr) => acc + curr.valor_recebido, 0);

  // Month stats
  const todayStr = getLocalDateStr(new Date());
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const monthVendas = vendas.filter(v => v.data_venda.startsWith(currentMonthStr));
  const monthDespesas = despesas.filter(d => d.data.startsWith(currentMonthStr));
  const totalSoldMonth = monthVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  const totalExpensesMonth = monthDespesas.reduce((acc, curr) => acc + curr.valor, 0);

  // Selected Date specific metrics
  const selectedVendas = vendas.filter(v => v.data_venda === selectedDateStr);
  const selectedDespesas = despesas.filter(d => d.data === selectedDateStr);

  const selectedSoldTotal = selectedVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  const selectedExpensesTotal = selectedDespesas.reduce((acc, curr) => acc + curr.valor, 0);
  const selectedNetTotal = selectedSoldTotal - selectedExpensesTotal;

  // Comparison Day specific metrics (the day prior to selected date)
  const prevDateStr = getPrevDateStr(selectedDateStr);
  const prevVendas = vendas.filter(v => v.data_venda === prevDateStr);
  const prevDespesas = despesas.filter(d => d.data === prevDateStr);

  const prevSoldTotal = prevVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  const prevExpensesTotal = prevDespesas.reduce((acc, curr) => acc + curr.valor, 0);

  // Growth percentages
  let salesChangePercent = 0;
  if (prevSoldTotal > 0) {
    salesChangePercent = Math.round(((selectedSoldTotal - prevSoldTotal) / prevSoldTotal) * 100);
  } else if (selectedSoldTotal > 0) {
    salesChangePercent = 100;
  }

  let expensesChangePercent = 0;
  if (prevExpensesTotal > 0) {
    expensesChangePercent = Math.round(((selectedExpensesTotal - prevExpensesTotal) / prevExpensesTotal) * 100);
  } else if (selectedExpensesTotal > 0) {
    expensesChangePercent = 100;
  }

  // ROI Calculation for selected day
  const roiValue = (() => {
    if (selectedExpensesTotal === 0) {
      if (selectedSoldTotal > 0) {
        return { label: '100%+', status: 'positive' };
      }
      return { label: '0%', status: 'neutral' };
    }
    const roi = ((selectedSoldTotal - selectedExpensesTotal) / selectedExpensesTotal) * 100;
    const roundedRoi = Math.round(roi);
    return {
      label: `${roundedRoi >= 0 ? '+' : ''}${roundedRoi}%`,
      status: roundedRoi > 0 ? 'positive' : roundedRoi < 0 ? 'negative' : 'neutral'
    };
  })();

  // Icon mapping helper
  const getIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-sky-600" />;
      case 'Package': return <Package className="w-5 h-5 text-amber-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-indigo-600" />;
      default: return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  // Sort activities specifically of the selected date
  const selectedDateActivities = [
    ...selectedVendas.map(v => ({ ...v, type: 'venda' as const, date: v.criado_em })),
    ...selectedDespesas.map(d => ({ ...d, type: 'despesa' as const, date: d.criado_em }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  // Combine and sort recent transactions overall (last 3) for fallback display
  const recentActivities = [
    ...vendas.map(v => ({ ...v, type: 'venda' as const, date: v.criado_em })),
    ...despesas.map(d => ({ ...d, type: 'despesa' as const, date: d.criado_em }))
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const userBroadcasts = (broadcasts || []).filter(b => {
    if (b.publico_alvo === 'todos') return true;
    if (b.publico_alvo === 'trial_expira_2d') {
      if (!profile || profile.plano !== 'trial' || !profile.trial_expires_at) return false;
      const diff = new Date(profile.trial_expires_at).getTime() - Date.now();
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 2 && days >= 0;
    }
    return false;
  }).sort((a,b) => b.criado_em.localeCompare(a.criado_em));

  return (
    <div className="space-y-6" id="dashboard_view">
      
      {/* Greetings / Sync Indicator */}
      <div className="space-y-3" id="dash_header_section">
        <div className="flex justify-between items-center" id="dash_welcome_group">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Olá, {profile?.nome || 'Empreendedor'}!</h2>
            <p className="text-[11px] text-slate-500">
              {profile?.plano === 'trial' ? 'Período experimental grátis' : 'Plano DroopFlow Pro Ativo'}
            </p>
          </div>
          {profile?.plano === 'trial' && (
            <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700" id="trial_countdown">
              7 dias grátis
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Banners & News */}
      {userBroadcasts.length > 0 && (
        <div className="space-y-3 animate-fade-in" id="user_broadcasts_container">
          {userBroadcasts.map(b => (
            <div 
              key={b.id} 
              className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
                b.tipo === 'novidade' 
                  ? 'bg-gradient-to-r from-indigo-50 via-sky-50 to-white border-indigo-100/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 dark:border-indigo-900/50' 
                  : 'bg-amber-50/50 border-amber-100/60 dark:bg-amber-950/10 dark:border-amber-900/40 text-slate-700 dark:text-slate-300'
              }`}
              id={`broadcast_banner_${b.id}`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center relative z-10">
                <div className="flex gap-3 items-start flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    b.tipo === 'novidade' ? 'bg-indigo-600 text-white' : 'bg-amber-500/20 text-amber-700'
                  }`}>
                    {b.tipo === 'novidade' ? <Sparkles className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        b.tipo === 'novidade' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.tipo === 'novidade' ? 'Novidade' : 'Aviso'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {new Date(b.criado_em).toLocaleDateString()}
                      </span>
                    </div>
                    {b.titulo && (
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">{b.titulo}</h4>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{b.texto}</p>
                  </div>
                </div>

                {b.link && (
                  <a 
                    href={b.link} 
                    target="_blank" 
                    referrerPolicy="no-referrer" 
                    rel="noopener noreferrer"
                    className="bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10 shrink-0 text-center"
                  >
                    Saber Mais
                  </a>
                )}
              </div>

              {b.imagem_url && (
                <div className="mt-3.5 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 max-h-56">
                  <img 
                    src={b.imagem_url} 
                    alt={b.titulo || 'Mídia da novidade'} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hero: Metrics Grid at the top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="top_metrics_grid">
        {/* Balance Display Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between" id="dash_balance_card">
          {/* Decorative backdrop glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

          <div className="space-y-1 relative" id="balance_details">
            <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Saldo Total Disponível</span>
            <div className="flex items-baseline space-x-2" id="balance_amount_group">
              <h1 className="text-4xl font-black text-slate-950 tracking-tight">
                {totalBalance.toLocaleString()}
              </h1>
              <span className="text-emerald-600 font-extrabold text-lg">{currency}</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">Soma das caixinhas (Lucro, Ads, Entrega, Fornecedor)</p>
          </div>

          {/* Quick action shortcuts */}
          <div className="grid grid-cols-2 gap-3 pt-6 relative" id="quick_action_grid">
            <button
              id="btn_shortcut_venda"
              onClick={onOpenVenda}
              className="bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Venda</span>
            </button>
            <button
              id="btn_shortcut_despesa"
              onClick={onOpenDespesa}
              className="bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1.5 border border-slate-200/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Saída</span>
            </button>
          </div>
        </div>

        {/* Daily ROI Metrics Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between" id="dash_roi_card">
          {/* Decorative backdrop glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none transition-all ${
            roiValue.status === 'positive' ? 'bg-emerald-500/10' : roiValue.status === 'negative' ? 'bg-rose-500/10' : 'bg-slate-500/5'
          }`}></div>

          <div className="space-y-1 relative" id="roi_details">
            <div className="flex items-center space-x-2" id="roi_title_wrap">
              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                ROI Diário ({formatFriendlyDate(selectedDateStr)})
              </span>
              <div className="group relative cursor-pointer" id="roi_info_tooltip">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900/95 backdrop-blur-md text-white text-[9px] leading-relaxed p-2.5 rounded-xl w-48 shadow-xl z-30 transition-all">
                  Retorno Sobre Investimento do dia: (Vendas - Gastos) / Gastos. Indica quanto faturou para cada unidade monetária investida.
                </div>
              </div>
            </div>

            <div className="flex items-baseline space-x-2" id="roi_amount_group">
              <h1 className={`text-4xl font-black tracking-tight transition-colors ${
                roiValue.status === 'positive' ? 'text-emerald-600' : roiValue.status === 'negative' ? 'text-rose-600' : 'text-slate-700'
              }`}>
                {roiValue.label}
              </h1>
              {roiValue.status === 'positive' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
              {roiValue.status === 'negative' && <TrendingDown className="w-5 h-5 text-rose-600" />}
            </div>

            <p className="text-[10px] text-slate-400 pt-1 leading-snug">
              {roiValue.status === 'positive' && `Excelente! Lucro líquido de +${selectedNetTotal.toLocaleString()} ${currency}`}
              {roiValue.status === 'negative' && `Défice: Gastos excederam as vendas em ${Math.abs(selectedNetTotal).toLocaleString()} ${currency}`}
              {roiValue.status === 'neutral' && selectedSoldTotal === 0 && selectedExpensesTotal === 0 && 'Sem movimentos financeiros registados nesta data'}
              {roiValue.status === 'neutral' && (selectedSoldTotal > 0 || selectedExpensesTotal > 0) && 'Retorno nulo (ponto de equilíbrio atingido)'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-6 relative" id="roi_breakdown_grid">
            <div className="bg-white/75 border border-slate-200/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase mb-0.5">Vendas do Dia</span>
              <span className="text-xs font-extrabold text-emerald-600">{selectedSoldTotal.toLocaleString()} {currency}</span>
            </div>
            <div className="bg-white/75 border border-slate-200/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase mb-0.5">Gastos do Dia</span>
              <span className="text-xs font-extrabold text-rose-600">{selectedExpensesTotal.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário & Controlo Diário */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-sm space-y-4" id="daily_calendar_container">
        
        {/* Calendar Header with Selected Date and Date Picker Button */}
        <div className="flex justify-between items-center" id="calendar_header">
          <div className="space-y-0.5" id="calendar_title_group">
            <h3 className="font-bold text-sm text-slate-900 font-display">Controlo Diário</h3>
            <p className="text-[10px] font-semibold text-slate-500">
              Métricas de <span className="text-emerald-600 font-bold">{formatFriendlyDate(selectedDateStr)}</span>
            </p>
          </div>
          
          {/* Custom Date Selector Trigger & Today buttons */}
          <div className="flex items-center space-x-2 shrink-0" id="calendar_actions_wrapper">
            <button
              onClick={jumpToToday}
              className="bg-emerald-50 border border-emerald-100/50 hover:bg-emerald-100 text-emerald-700 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              id="btn_jump_to_today"
            >
              Hoje
            </button>

            <div className="relative shrink-0" id="custom_date_trigger_wrapper">
              <button className="flex items-center space-x-1 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Outra Data</span>
              </button>
              <input
                type="date"
                value={selectedDateStr}
                max={getLocalDateStr(new Date())} // restrict choosing future dates
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectDate(e.target.value);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* 7-Day Carousel Strip wrapped with stable Week Navigators */}
        <div className="flex items-center space-x-1" id="calendar_strip_wrapper">
          <button
            type="button"
            onClick={() => shiftPivotDate(-7)}
            className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Semana Anterior"
            id="btn_prev_week"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1.5" id="calendar_days_grid">
            {getDaysArray(pivotDateStr).map((dayDate, idx) => {
              const dayStr = getLocalDateStr(dayDate);
              const isSelected = dayStr === selectedDateStr;
              
              // Check transactions for the heat-dot indicators
              const hasSales = vendas.some(v => v.data_venda === dayStr);
              const hasExp = despesas.some(d => d.data === dayStr);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(dayStr)}
                  className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl transition-all cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                      : 'bg-slate-50/60 hover:bg-slate-50 text-slate-700 border border-slate-100/50'
                  }`}
                  style={{ minHeight: '60px' }}
                  id={`calendar_day_btn_${dayStr}`}
                >
                  <span className={`text-[8px] font-extrabold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {getDayName(dayDate)}
                  </span>
                  
                  <span className="text-xs font-black leading-none">
                    {dayDate.getDate()}
                  </span>

                  {/* Heat-dot indicators */}
                  <div className="flex space-x-0.5 items-center justify-center h-1 mt-1">
                    {hasSales && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                    )}
                    {hasExp && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-rose-500'}`} />
                    )}
                    {!hasSales && !hasExp && (
                      <span className="w-1 h-1 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => shiftPivotDate(7)}
            className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Semana Seguinte"
            id="btn_next_week"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Selected Day Bento Stats Grid */}
        <div className="grid grid-cols-3 gap-2" id="selected_day_metrics_grid">
          
          {/* Sales Card */}
          <div className="bg-slate-50/70 border border-slate-100/70 rounded-2xl p-3 flex flex-col justify-between space-y-1 text-center" id="day_vendas_stat">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Vendido</span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-emerald-600 block">
                {selectedSoldTotal.toLocaleString()} {currency}
              </span>
              <span className="text-[9px] text-slate-500 block font-medium">
                {selectedVendas.length} {selectedVendas.length === 1 ? 'venda' : 'vendas'}
              </span>
            </div>
            {salesChangePercent !== 0 && (
              <span className={`text-[8px] font-bold block ${salesChangePercent > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {salesChangePercent > 0 ? '↑' : '↓'} {Math.abs(salesChangePercent)}% vs ontem
              </span>
            )}
            {salesChangePercent === 0 && (
              <span className="text-[8px] font-medium text-slate-400 block">
                igual a ontem
              </span>
            )}
          </div>

          {/* Expenses Card */}
          <div className="bg-slate-50/70 border border-slate-100/70 rounded-2xl p-3 flex flex-col justify-between space-y-1 text-center" id="day_expenses_stat">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Gastos</span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-rose-600 block">
                {selectedExpensesTotal.toLocaleString()} {currency}
              </span>
              <span className="text-[9px] text-slate-500 block font-medium">
                {selectedDespesas.length} {selectedDespesas.length === 1 ? 'saída' : 'saídas'}
              </span>
            </div>
            {expensesChangePercent !== 0 && (
              <span className={`text-[8px] font-bold block ${expensesChangePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expensesChangePercent > 0 ? '↑' : '↓'} {Math.abs(expensesChangePercent)}% vs ontem
              </span>
            )}
            {expensesChangePercent === 0 && (
              <span className="text-[8px] font-medium text-slate-400 block">
                igual a ontem
              </span>
            )}
          </div>

          {/* Balance/Cashflow Card */}
          <div className={`border rounded-2xl p-3 flex flex-col justify-between space-y-1 text-center ${
            selectedNetTotal >= 0 
              ? 'bg-emerald-50/20 border-emerald-100/40' 
              : 'bg-rose-50/10 border-rose-100/30'
          }`} id="day_balance_stat">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Balanço</span>
            <div className="space-y-0.5">
              <span className={`text-xs font-black block ${selectedNetTotal >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {selectedNetTotal >= 0 ? '+' : ''}{selectedNetTotal.toLocaleString()} {currency}
              </span>
              <span className="text-[9px] text-slate-500 block font-medium">
                fluxo de caixa
              </span>
            </div>
            <span className={`text-[8px] font-bold block ${selectedNetTotal >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {selectedNetTotal >= 0 ? 'Superávit' : 'Défice'}
            </span>
          </div>

        </div>

        {/* Monthly Summary mini-bar */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100/60" id="monthly_summary_row">
          <div className="bg-slate-50/50 p-2 rounded-xl flex items-center justify-between" id="metric_venda_mes">
            <span className="text-[9px] font-bold uppercase text-slate-400">Total do Mês</span>
            <span className="text-xs font-extrabold text-sky-600">{totalSoldMonth.toLocaleString()} {currency}</span>
          </div>
          <div className="bg-slate-50/50 p-2 rounded-xl flex items-center justify-between" id="metric_despesas_mes">
            <span className="text-[9px] font-bold uppercase text-slate-400">Gastos do Mês</span>
            <span className="text-xs font-extrabold text-rose-600">{totalExpensesMonth.toLocaleString()} {currency}</span>
          </div>
        </div>

      </div>

      {/* Caixinhas Grid Section */}
      <div className="space-y-3" id="dash_caixinhas_section">
        <div className="flex justify-between items-center" id="dash_caixinhas_header">
          <h3 className="font-bold text-sm text-slate-900 font-display">As Minhas Caixinhas</h3>
          <button id="btn_goto_caixinhas" onClick={() => setActiveTab('caixinhas')} className="text-xs text-emerald-600 hover:underline font-bold flex items-center">
            Ver todas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3" id="dash_caixinhas_cards">
          {/* 1st Premium Card: Faturamento & Saldo Total */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md shadow-emerald-600/10" id="dash_caixinha_faturamento">
            <div className="flex justify-between items-start" id="caixinha_badge_wrapper_faturamento">
              <div className="bg-white/15 p-2 rounded-xl border border-white/10" id="caixinha_badge_icon_faturamento">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="bg-white/20 text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded text-white border border-white/5">
                Geral
              </span>
            </div>
            <div className="space-y-1" id="caixinha_values_faturamento">
              <span className="text-[11px] font-semibold text-emerald-100 block truncate">Faturamento (Saldo)</span>
              <span className="text-base font-extrabold text-white">
                {totalBalance.toLocaleString()} <span className="text-emerald-100 text-xs font-normal">{currency}</span>
              </span>
              <span className="text-[9px] text-emerald-200/80 block truncate">
                Vendas: {totalFaturamento.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {caixinhas.slice(0, 3).map(cx => {
            const lightColor = cx.cor.replace('bg-', 'bg-');
            return (
              <div key={cx.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow" id={`dash_caixinha_${cx.id}`}>
                <div className="flex justify-between items-start" id="caixinha_badge_wrapper">
                  <div className={`${lightColor} bg-opacity-10 p-2 rounded-xl`} id="caixinha_badge_icon" style={{ backgroundColor: `rgba(${lightColor === 'bg-emerald-500' ? '16, 185, 129, 0.1' : lightColor === 'bg-sky-500' ? '14, 165, 233, 0.1' : lightColor === 'bg-amber-500' ? '245, 158, 11, 0.1' : lightColor === 'bg-indigo-500' ? '99, 102, 241, 0.1' : '139, 92, 246, 0.1'})` }}>
                    {getIcon(cx.icone)}
                  </div>
                  {cx.tipo !== 'personalizado' && (
                    <span className="bg-slate-50 text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded text-slate-500 border border-slate-100">
                      Sistema
                    </span>
                  )}
                </div>
                <div className="space-y-1" id="caixinha_values">
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">{cx.nome}</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {cx.saldo_atual.toLocaleString()} <span className="text-slate-400 text-xs font-normal">{currency}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Activities Section */}
      <div className="space-y-3" id="dash_history_section">
        <h3 className="font-bold text-sm text-slate-900 font-display">
          {selectedDateStr === getLocalDateStr(new Date()) ? 'Atividade de Hoje' :
           selectedDateStr === getYesterdayDateStr() ? 'Atividade de Ontem' :
           `Atividade em ${formatFriendlyDate(selectedDateStr)}`}
        </h3>

        {selectedDateActivities.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-center space-y-4" id="empty_selected_activity">
            <div className="space-y-1" id="empty_text_wrapper">
              <Info className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Nenhum registo neste dia.</p>
              <p className="text-[10px] text-slate-400">Podes registar vendas ou saídas no menu flutuante.</p>
            </div>
            
            {/* Fallback Recent Activities inside the empty state so they can still see recent data */}
            <div className="pt-3.5 border-t border-slate-100 text-left" id="fallback_recent_activities">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-2">Últimos Registos do Sistema</span>
              {recentActivities.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2">Nenhum registo no sistema.</p>
              ) : (
                <div className="divide-y divide-slate-100/50" id="fallback_activity_list">
                  {recentActivities.map((act: any) => {
                    const prod = produtos?.find(p => p.id === act.produto_id);
                    const label = act.type === 'venda' ? (prod ? prod.nome : 'Venda Registada') : act.descricao;
                    return (
                      <div key={act.id} className="py-2.5 flex items-center justify-between text-xs" id={`fallback_act_${act.id}`}>
                        <div className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${act.type === 'venda' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-semibold text-slate-700 truncate max-w-[160px]">{label}</span>
                        </div>
                        <span className={`font-bold ${act.type === 'venda' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {act.type === 'venda' ? '+' : '-'}{act.type === 'venda' ? act.valor_recebido : act.valor} {currency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden" id="dash_history_list">
            {selectedDateActivities.map((act: any) => {
              const prod = produtos?.find(p => p.id === act.produto_id);
              const displayName = act.type === 'venda' ? (prod ? prod.nome : 'Venda Registada') : act.descricao;
              return (
                <div key={act.id} className="p-3.5 flex items-center justify-between" id={`activity_${act.id}`}>
                  <div className="flex items-center space-x-3" id="activity_details">
                    <div className={`p-2 rounded-xl shrink-0 ${act.type === 'venda' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`} id="activity_badge">
                      {act.type === 'venda' ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0" id="activity_text">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {displayName} {act.type === 'venda' && act.quantidade > 1 && (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded-md font-bold ml-1">
                            {act.quantidade}x
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {act.type === 'venda' ? (
                          <span className="inline-flex items-center space-x-1.5">
                            <span>ID: {act.id.slice(0, 8)}</span>
                            {act.desconto > 0 && (
                              <span className="text-rose-600 font-bold bg-rose-50 px-1 py-0.2 rounded text-[8px]">Desconto: -{act.desconto} {currency}</span>
                            )}
                          </span>
                        ) : act.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0" id="activity_value_col">
                    <span className={`text-xs font-extrabold block ${act.type === 'venda' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {act.type === 'venda' ? '+' : '-'}{act.type === 'venda' ? act.valor_recebido : act.valor} {currency}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{act.data_venda || act.data}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
