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
  Sparkles,
  HelpCircle,
  X,
  Percent,
  Calculator
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

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
    broadcasts,
    zonasEntrega
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

  // State to control ROI & Net Profit calculations Help Modal
  const [showRoiHelp, setShowRoiHelp] = React.useState(false);

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

  // Proportional costs calculation for selected date (reused in ROI card and transparency modal)
  const selectedProdCost = selectedVendas.reduce((acc, curr) => {
    const prod = produtos.find(p => p.id === curr.produto_id);
    return acc + ((prod ? prod.preco_compra : 0) * (curr.quantidade || 1));
  }, 0);

  const selectedDeliveryCost = selectedVendas.reduce((acc, curr) => {
    const zone = zonasEntrega.find(z => z.id === curr.zona_entrega_id);
    return acc + (zone ? zone.custo : 0);
  }, 0);

  const selectedAdCost = selectedVendas.reduce((acc, curr) => {
    const adsCx = caixinhas.find(c => c.tipo === 'anuncios');
    return acc + (adsCx ? (curr.distribuicao[adsCx.id] || 0) : 0);
  }, 0);

  const selectedTotalC = selectedProdCost + selectedDeliveryCost + selectedAdCost;
  const selectedProportionalProfit = selectedSoldTotal - selectedTotalC;
  const selectedProportionalRoi = selectedTotalC > 0 ? (selectedProportionalProfit / selectedTotalC) * 100 : 0;

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

  // Calculation of daily net profit for 30-day trend
  const getDailyNetProfit = React.useCallback((dateStr: string) => {
    const dateVendas = (vendas || []).filter(v => v.data_venda === dateStr);
    const dateDespesas = (despesas || []).filter(d => d.data === dateStr);
    
    const revenue = dateVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
    const prodCost = dateVendas.reduce((acc, curr) => {
      const prod = produtos.find(p => p.id === curr.produto_id);
      return acc + ((prod ? prod.preco_compra : 0) * (curr.quantidade || 1));
    }, 0);
    const deliveryCost = dateVendas.reduce((acc, curr) => {
      const zone = zonasEntrega.find(z => z.id === curr.zona_entrega_id);
      return acc + (zone ? zone.custo : 0);
    }, 0);
    const adCost = dateVendas.reduce((acc, curr) => {
      const adsCx = caixinhas.find(c => c.tipo === 'anuncios');
      return acc + (adsCx ? (curr.distribuicao[adsCx.id] || 0) : 0);
    }, 0);
    const expenseAmt = dateDespesas.reduce((acc, curr) => acc + curr.valor, 0);
    
    return revenue - (prodCost + deliveryCost + adCost) - expenseAmt;
  }, [vendas, despesas, produtos, zonasEntrega, caixinhas]);

  const last30DaysData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const profit = getDailyNetProfit(dateStr);
      
      const formattedLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      data.push({
        dateStr,
        label: formattedLabel,
        "Lucro Líquido": profit,
      });
    }
    return data;
  }, [getDailyNetProfit, getLocalDateStr]);

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

        {/* Monthly Revenue Display Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between" id="dash_monthly_revenue_card">
          {/* Decorative backdrop glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

          <div className="space-y-1 relative" id="monthly_revenue_details">
            <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Faturamento Mensal</span>
            <div className="flex items-baseline space-x-2" id="monthly_revenue_amount_group">
              <h1 className="text-4xl font-black text-slate-950 tracking-tight">
                {totalSoldMonth.toLocaleString()}
              </h1>
              <span className="text-indigo-600 font-extrabold text-lg">{currency}</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 leading-snug">
              Faturamento bruto acumulado de todas as vendas deste mês.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-6 relative" id="monthly_revenue_breakdown">
            <div className="bg-white/75 border border-slate-200/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase mb-0.5">Vendas Registadas</span>
              <span className="text-xs font-extrabold text-indigo-600">{monthVendas.length}</span>
            </div>
            <div className="bg-white/75 border border-slate-200/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase mb-0.5">Gastos do Mês</span>
              <span className="text-xs font-extrabold text-rose-600">{totalExpensesMonth.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Net Profit Trend Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="net_profit_trend_container">
        <div className="flex justify-between items-center" id="trend_header">
          <div className="space-y-0.5" id="trend_title_group">
            <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Tendência de Lucro Líquido
            </h3>
            <p className="text-[10px] font-semibold text-slate-500">
              Evolução dos lucros líquidos nos últimos 30 dias
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold" id="trend_period">
            Últimos 30 dias
          </div>
        </div>

        <div className="h-56 w-full" id="trend_chart_wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={last30DaysData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false}
                stroke="#94a3b8"
                fontSize={9}
                dy={10}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                stroke="#94a3b8"
                fontSize={9}
                dx={-5}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const value = payload[0].value as number;
                    return (
                      <div className="bg-slate-950 border border-slate-800 text-white p-3 rounded-2xl shadow-xl space-y-1 text-left" id="custom_chart_tooltip">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{formatFriendlyDate(data.dateStr)}</p>
                        <p className={`text-xs font-black ${value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Lucro Líquido: {value >= 0 ? '+' : ''}{value.toLocaleString()} {currency}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Lucro Líquido" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendário & Controlo Diário */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-sm space-y-4" id="daily_calendar_container">
        
        {/* Calendar Header with Selected Date and Date Picker Button */}
        <div className="flex justify-between items-center" id="calendar_header">
          <div className="space-y-0.5" id="calendar_title_group">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-sm text-slate-900 font-display">Controlo Diário</h3>
              <button
                type="button"
                id="btn_help_controlo_diario"
                onClick={() => setShowRoiHelp(true)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="Ver explicação das métricas e cálculos"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
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

        {/* Cost-Proportional ROI Detail Card */}
        {selectedVendas.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4.5 space-y-3.5" id="roi_proporcional_card">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">Análise de Retorno Real (ROI)</span>
                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">Vendas</span>
                <button
                  type="button"
                  id="btn_open_roi_help"
                  onClick={() => setShowRoiHelp(true)}
                  className="flex items-center space-x-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Clique para ver o detalhe do cálculo"
                >
                  <HelpCircle className="w-3 h-3 shrink-0" />
                  <span>Como é calculado?</span>
                </button>
              </div>
              <button
                type="button"
                id="btn_info_roi"
                onClick={() => setShowRoiHelp(true)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all"
                title="Ver explicação detalhada do ROI"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="col-span-1 md:border-r md:border-slate-200/80 pr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">ROI Proporcional aos Custos</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className={`text-2xl font-black ${
                    selectedTotalC === 0 
                      ? 'text-slate-700' 
                      : selectedProportionalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {selectedTotalC === 0 
                      ? (selectedSoldTotal > 0 ? '+100%+' : '0%') 
                      : `${selectedProportionalRoi >= 0 ? '+' : ''}${Math.round(selectedProportionalRoi)}%`
                    }
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Fórmula: (Vendas - Custos de Venda) / Custos de Venda</p>
              </div>

              <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Custo Produto</span>
                  <span className="text-xs font-black text-slate-800">
                    {selectedProdCost.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">{currency}</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Custo Entrega</span>
                  <span className="text-xs font-black text-slate-800">
                    {selectedDeliveryCost.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">{currency}</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Custo Anúncios</span>
                  <span className="text-xs font-black text-slate-800">
                    {selectedAdCost.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">{currency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Transparency & Calculations Help Modal */}
      {showRoiHelp && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          id="roi_help_modal_backdrop"
          onClick={() => setShowRoiHelp(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-scale-up"
            id="roi_help_modal_content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50" id="roi_help_header">
              <div className="flex items-center space-x-2.5">
                <div className="bg-indigo-50 text-indigo-700 p-2 rounded-xl">
                  <Calculator className="w-5 h-5 shrink-0" />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-slate-900 text-sm">Transparência de Métricas & ROI</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Entenda detalhadamente como os seus lucros e retorno são calculados no DroopFlow</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRoiHelp(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer"
                id="btn_close_roi_help_modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed text-left" id="roi_help_body">
              
              {/* Introduction */}
              <p className="text-slate-500">
                No dropshipping, controlar a margem real de cada venda é o fator de sucesso número um. O DroopFlow divide as suas métricas em dois conceitos fundamentais para que saiba com precisão para onde vai cada cêntimo/metical.
              </p>

              {/* Concept 1: Balance (Cashflow) */}
              <div className="space-y-2.5" id="help_concept_balance">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <h4 className="font-extrabold text-slate-900 text-xs">1. Balanço Diário (Fluxo de Caixa)</h4>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2">
                  <p className="font-medium text-slate-700">
                    Mede o dinheiro real que entrou versus o dinheiro real que saiu (despesas registadas no dia).
                  </p>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl font-mono text-[10px] text-slate-800 text-center flex items-center justify-center space-x-2">
                    <span className="font-bold text-emerald-600">Faturamento Real</span>
                    <span>-</span>
                    <span className="font-bold text-rose-600">Gastos Registados (Saídas)</span>
                    <span>=</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-900">Balanço do Dia</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 pt-1">
                    <li><strong>Faturamento Real:</strong> Valor total em dinheiro que cobrou aos clientes pelas vendas desse dia.</li>
                    <li><strong>Gastos Registados:</strong> Quaisquer despesas ou retiradas de caixa feitas manualmente nesse dia (como almoço, custos operacionais gerais, etc.).</li>
                  </ul>
                </div>
              </div>

              {/* Concept 2: Proportional ROI */}
              <div className="space-y-2.5" id="help_concept_roi">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <h4 className="font-extrabold text-slate-900 text-xs">2. ROI Proporcional & Custos de Venda</h4>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-3">
                  <p className="font-medium text-slate-700">
                    O <strong>ROI (Retorno sobre o Investimento)</strong> analisa a viabilidade comercial dos seus produtos deduzindo os custos inerentes à operação de cada venda.
                  </p>
                  
                  {/* Formulas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl text-center flex flex-col justify-center">
                      <span className="text-[8px] text-slate-400 font-bold block uppercase mb-1">Custo de Venda</span>
                      <span className="text-slate-800 font-bold">Custo Prod. + Custo Entr. + Custo Ads</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl text-center flex flex-col justify-center">
                      <span className="text-[8px] text-slate-400 font-bold block uppercase mb-1">Fórmula do ROI</span>
                      <span className="text-indigo-600 font-black">((Faturamento - Custos) / Custos) × 100</span>
                    </div>
                  </div>

                  {/* Breakdown detail list */}
                  <div className="space-y-2.5 pt-1" id="breakdown_explanations">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Como cada custo é obtido:</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center space-x-1 text-slate-800 font-extrabold">
                          <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Custo de Produto</span>
                        </div>
                        <p className="text-slate-500 text-[10px] leading-snug">
                          Multiplicação da quantidade vendida pelo <strong>Preço de Compra</strong> original configurado no produto.
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center space-x-1 text-slate-800 font-extrabold">
                          <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Custo de Entrega</span>
                        </div>
                        <p className="text-slate-500 text-[10px] leading-snug">
                          Baseia-se no valor de custo fixo atribuído à <strong>Zona de Entrega</strong> selecionada no momento de registar a venda.
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center space-x-1 text-slate-800 font-extrabold">
                          <Megaphone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>Custo de Anúncios</span>
                        </div>
                        <p className="text-slate-500 text-[10px] leading-snug">
                          Valor alocado da <strong>Caixinha de Anúncios (Marketing)</strong> no registo da venda para cobrir o tráfego pago proporcional.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic live simulation based on current view date */}
              <div className="space-y-2.5 pt-1" id="live_simulation_area">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs">Simulação em Tempo Real ({formatFriendlyDate(selectedDateStr)})</h4>
                </div>

                {selectedVendas.length === 0 ? (
                  <div className="bg-amber-50/55 border border-amber-100/60 rounded-2xl p-4 text-center">
                    <p className="text-amber-800 font-semibold text-[11px] leading-relaxed">
                      Não existem vendas registadas em <strong>{formatFriendlyDate(selectedDateStr)}</strong>. 
                      Selecione um dia com vendas na barra do calendário para ver uma demonstração exata de como os seus dados reais foram processados.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 space-y-3.5 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400 font-semibold">Métrica de Simulação</span>
                      <span className="text-slate-400 font-semibold">Valor em {currency}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Faturamento Bruto (+)</span>
                        <span className="text-emerald-400 font-bold">{selectedSoldTotal.toLocaleString()} {currency}</span>
                      </div>
                      <div className="flex justify-between pl-3 text-slate-400 text-[10px]">
                        <span>- Custo dos Produtos</span>
                        <span>{selectedProdCost.toLocaleString()} {currency}</span>
                      </div>
                      <div className="flex justify-between pl-3 text-slate-400 text-[10px]">
                        <span>- Custo de Entregas</span>
                        <span>{selectedDeliveryCost.toLocaleString()} {currency}</span>
                      </div>
                      <div className="flex justify-between pl-3 text-slate-400 text-[10px]">
                        <span>- Custo de Publicidade</span>
                        <span>{selectedAdCost.toLocaleString()} {currency}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                        <span>Custos de Venda Totais (=)</span>
                        <span className="text-amber-500">{selectedTotalC.toLocaleString()} {currency}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-700 pt-2.5 space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>Lucro Proporcional Real (=)</span>
                        <span className={selectedProportionalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {selectedProportionalProfit >= 0 ? '+' : ''}{selectedProportionalProfit.toLocaleString()} {currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span>ROI Proporcional Calculado {"(=>)"}</span>
                        <span className={selectedProportionalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {selectedTotalC === 0 ? '+100%+' : `${selectedProportionalRoi >= 0 ? '+' : ''}${Math.round(selectedProportionalRoi)}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50" id="roi_help_footer_actions">
              <button
                type="button"
                onClick={() => setShowRoiHelp(false)}
                className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                id="btn_close_roi_help_modal_bottom"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
