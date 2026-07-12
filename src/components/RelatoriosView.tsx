/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { 
  TrendingUp, 
  ArrowDownRight, 
  Award, 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  FileText, 
  Volume2, 
  Bell, 
  Eye, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function RelatoriosView() {
  const { 
    vendas, 
    despesas, 
    produtos, 
    caixinhas, 
    profile, 
    relatorios, 
    addRelatorio 
  } = useApp();

  const [subTab, setSubTab] = useState<'dashboard' | 'gerar' | 'historico'>('dashboard');
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [generatingType, setGeneratingType] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const [reportFeedback, setReportFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currency = profile?.moeda || 'MT';
  const sonsAtivos = profile?.ativarSons !== false && profile?.somRelatorios !== false;
  const isInitial = useRef(true);

  // Play Sound and Vibrate on New Reports (Real-time trigger)
  useEffect(() => {
    if (isInitial.current) {
      if (relatorios.length > 0) {
        isInitial.current = false;
      }
      return;
    }
    
    // Play alert sound for new reports
    import('../lib/audio.ts').then(({ playNotificationPing }) => {
      playNotificationPing(sonsAtivos);
    });

    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (err) {
        console.warn("Vibration failed or blocked:", err);
      }
    }
  }, [relatorios.length, sonsAtivos]);

  // Helper date calculations
  const getPeriodFilter = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (period === 'hoje') {
      return (dateStr: string) => dateStr === todayStr;
    } else if (period === 'semana') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return (dateStr: string) => new Date(dateStr) >= weekAgo;
    } else if (period === 'mes') {
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      return (dateStr: string) => new Date(dateStr) >= monthAgo;
    } else {
      return () => true;
    }
  };

  const isWithinPeriod = getPeriodFilter();

  // Filter records
  const filteredVendas = vendas.filter(v => isWithinPeriod(v.data_venda));
  const filteredDespesas = despesas.filter(d => isWithinPeriod(d.data));

  // Calculations
  const totalRevenue = filteredVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  
  // Calculate specific product and shipping costs from vendas distribution
  let totalSupplierCost = 0;
  let totalDeliveryCost = 0;

  filteredVendas.forEach(v => {
    const prod = produtos.find(p => p.id === v.produto_id);
    if (prod) {
      totalSupplierCost += prod.preco_compra;
    }
    const suppCx = caixinhas.find(c => c.tipo === 'fornecedores');
    const delivCx = caixinhas.find(c => c.tipo === 'delivery');
    if (suppCx) totalSupplierCost += (v.distribuicao[suppCx.id] || 0);
    if (delivCx) totalDeliveryCost += (v.distribuicao[delivCx.id] || 0);
  });

  // Calculate actual operating expenses (despesas)
  const totalOperatingExpenses = filteredDespesas.reduce((acc, curr) => acc + curr.valor, 0);

  // Profit calculations
  const totalCosts = totalSupplierCost + totalDeliveryCost + totalOperatingExpenses;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Products performance
  const productSalesMap: { [name: string]: { qty: number; rev: number } } = {};
  filteredVendas.forEach(v => {
    const prod = produtos.find(p => p.id === v.produto_id);
    const prodName = prod ? prod.nome : 'Produto Customizado';
    if (!productSalesMap[prodName]) {
      productSalesMap[prodName] = { qty: 0, rev: 0 };
    }
    productSalesMap[prodName].qty += 1;
    productSalesMap[prodName].rev += v.valor_recebido;
  });

  const bestSellers = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 3);

  // Expense categories split
  const categoryExpensesMap: { [cat: string]: number } = {};
  filteredDespesas.forEach(d => {
    if (!categoryExpensesMap[d.categoria]) {
      categoryExpensesMap[d.categoria] = 0;
    }
    categoryExpensesMap[d.categoria] += d.valor;
  });

  const categoryExpenses = Object.entries(categoryExpensesMap)
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value);

  // Helper to safely format YYYY-MM-DD
  const getYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper to generate last 5 weeks of data for the line chart
  const getWeeklyData = () => {
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const end = new Date(now.getTime());
      end.setDate(now.getDate() - i * 7);
      
      const start = new Date(end.getTime());
      start.setDate(end.getDate() - 6);
      
      const startStr = getYYYYMMDD(start);
      const endStr = getYYYYMMDD(end);
      
      const weekVendas = vendas.filter(v => v.data_venda >= startStr && v.data_venda <= endStr);
      const weekDespesas = despesas.filter(d => d.data >= startStr && d.data <= endStr);
      
      const weekRevenue = weekVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
      
      let weekSupplierCost = 0;
      let weekDeliveryCost = 0;
      const suppCx = caixinhas.find(c => c.tipo === 'fornecedores');
      const delivCx = caixinhas.find(c => c.tipo === 'delivery');
      
      weekVendas.forEach(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        if (prod) weekSupplierCost += prod.preco_compra;
        if (suppCx) weekSupplierCost += (v.distribuicao[suppCx.id] || 0);
        if (delivCx) weekDeliveryCost += (v.distribuicao[delivCx.id] || 0);
      });
      
      const weekOperatingExpenses = weekDespesas.reduce((acc, curr) => acc + curr.valor, 0);
      const weekCosts = weekSupplierCost + weekDeliveryCost + weekOperatingExpenses;
      const weekNetProfit = weekRevenue - weekCosts;
      
      const formatDayMonth = (date: Date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        return `${d}/${m}`;
      };
      
      weeklyData.push({
        name: `${formatDayMonth(start)} - ${formatDayMonth(end)}`,
        Receita: weekRevenue,
        Despesas: weekCosts,
        Lucro: weekNetProfit,
      });
    }
    
    return weeklyData;
  };

  const weeklyData = getWeeklyData();
  const COLORS = ['#6366F1', '#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Handle manual/automatic report generation
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportFeedback('');
    
    try {
      const now = new Date();
      let filterFn: (dateStr: string) => boolean;
      
      if (generatingType === 'diario') {
        const todayStr = now.toISOString().split('T')[0];
        filterFn = (dateStr) => dateStr === todayStr;
      } else if (generatingType === 'semanal') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        filterFn = (dateStr) => new Date(dateStr) >= weekAgo;
      } else {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        filterFn = (dateStr) => new Date(dateStr) >= monthAgo;
      }

      const repVendas = vendas.filter(v => filterFn(v.data_venda));
      const repDespesas = despesas.filter(d => filterFn(d.data));

      const repRevenue = repVendas.reduce((acc, v) => acc + v.valor_recebido, 0);
      
      let repSupplier = 0;
      let repDelivery = 0;
      repVendas.forEach(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        if (prod) repSupplier += prod.preco_compra;
        const suppCx = caixinhas.find(c => c.tipo === 'fornecedores');
        const delivCx = caixinhas.find(c => c.tipo === 'delivery');
        if (suppCx) repSupplier += (v.distribuicao[suppCx.id] || 0);
        if (delivCx) repDelivery += (v.distribuicao[delivCx.id] || 0);
      });

      const repOperating = repDespesas.reduce((acc, d) => acc + d.valor, 0);
      const repCosts = repSupplier + repDelivery + repOperating;
      const repProfit = repRevenue - repCosts;

      // Goal indicators
      const goalDailyVal = profile?.metaDiaria || 0;
      const goalWeeklyVal = profile?.metaSemanal || 0;
      const goalMonthlyVal = profile?.metaMensal || 0;

      const progressDaily = goalDailyVal > 0 ? Math.round((repRevenue / goalDailyVal) * 100) : 0;
      const progressWeekly = goalWeeklyVal > 0 ? Math.round((repRevenue / goalWeeklyVal) * 100) : 0;
      const progressMonthly = goalMonthlyVal > 0 ? Math.round((repRevenue / goalMonthlyVal) * 100) : 0;

      const progressString = `Meta Diária: ${progressDaily}% | Meta Semanal: ${progressWeekly}% | Meta Mensal: ${progressMonthly}%`;
      
      const achieved: string[] = [];
      if (goalDailyVal > 0 && progressDaily >= 100) achieved.push('metaDiaria');
      if (goalWeeklyVal > 0 && progressWeekly >= 100) achieved.push('metaSemanal');
      if (goalMonthlyVal > 0 && progressMonthly >= 100) achieved.push('metaMensal');

      await addRelatorio(generatingType, repRevenue, repCosts, repProfit, progressString, achieved);

      setReportFeedback(`Sucesso! Relatório ${generatingType.toUpperCase()} gerado e enviado para o histórico.`);
      setTimeout(() => setReportFeedback(''), 4000);
    } catch (err) {
      console.error(err);
      setReportFeedback('Erro ao compilar o relatório.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="relatorios_view">
      
      {/* Sub tabs navigation */}
      <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl grid grid-cols-3 gap-1" id="relatorios_subtabs">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`py-2 text-[11px] font-black rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center space-x-1.5 ${subTab === 'dashboard' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow border border-slate-200/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Controlo</span>
        </button>
        <button
          onClick={() => setSubTab('gerar')}
          className={`py-2 text-[11px] font-black rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center space-x-1.5 ${subTab === 'gerar' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow border border-slate-200/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Gerar</span>
        </button>
        <button
          onClick={() => setSubTab('historico')}
          className={`py-2 text-[11px] font-black rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center space-x-1.5 ${subTab === 'historico' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow border border-slate-200/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Histórico</span>
        </button>
      </div>

      {/* ================= 1. FINANCIAL DASHBOARD TAB ================= */}
      {subTab === 'dashboard' && (
        <div className="space-y-6" id="dashboard_tab_content">
          <div className="flex flex-col space-y-3" id="relatorios_header">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display">DRE e Análise de Margens</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Rentabilidade real e desempenho operacional do seu drop</p>
            </div>

            {/* Filters */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex space-x-1" id="period_filter_bar">
              {(['hoje', 'semana', 'mes', 'todos'] as const).map(p => (
                <button
                  key={p}
                  id={`filter_period_${p}`}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${period === p ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow border border-slate-200/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  {p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 Dias' : p === 'mes' ? '30 Dias' : 'Tudo'}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Financial Overview Cards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm" id="accounting_hero">
            <div className="flex justify-between items-center" id="accounting_hero_header">
              <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">Demonstração de Resultados (DRE)</span>
              <span className="text-emerald-600 text-xs font-black flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Margem: {profitMargin}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4" id="accounting_breakdown">
              <div className="space-y-1" id="dre_receita">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Faturamento Bruto</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">
                  {totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
                </span>
              </div>

              <div className="space-y-1" id="dre_lucro">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Resultado Líquido</span>
                <span className={`text-lg font-black block ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {netProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
                </span>
              </div>
            </div>

            {/* Progress gauge for costs vs revenue */}
            {totalRevenue > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800" id="cost_ratio_gauge">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Custos Totais ({Math.round(totalCosts / totalRevenue * 100)}%)</span>
                  <span>Lucro Líquido ({profitMargin}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 flex overflow-hidden" id="gauge_bar">
                  <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, totalCosts / totalRevenue * 100)}%` }}></div>
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.max(0, 100 - (totalCosts / totalRevenue * 100))}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Recharts Chart: Revenue vs Costs Line Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm" id="relatorios_chart_wrapper">
            <div className="flex justify-between items-center" id="relatorios_chart_header">
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
                <BarChart2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Evolução do Lucro Líquido Semanal
              </h3>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Últimas 5 semanas</span>
            </div>

            <div className="h-56 w-full text-xs" id="recharts_weekly_profit">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '16px', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, 'Lucro Líquido']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Lucro" 
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorLucro)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best Sellers & Operating Costs Breakdown */}
          <div className="grid grid-cols-1 gap-6" id="relatorios_details_grid">
            
            {/* Best Sellers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-sm" id="panel_best_sellers">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
                <Award className="w-4 h-4 mr-1.5 text-yellow-600" /> Produtos Campeões
              </h4>

              {bestSellers.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-4">Sem vendas no período.</p>
              ) : (
                <div className="space-y-3" id="best_sellers_list">
                  {bestSellers.map((item, index) => (
                    <div key={item.name} className="space-y-1.5" id={`bestseller_${index}`}>
                      <div className="flex justify-between text-xs font-semibold" id="bestseller_info">
                        <span className="text-slate-800 dark:text-slate-200 truncate pr-4">{item.name}</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.rev.toLocaleString()} {currency}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5" id="bestseller_progress">
                        <div 
                          className="bg-yellow-500 h-full rounded-full" 
                          style={{ width: `${(item.rev / bestSellers[0].rev) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-medium">{item.qty} pedidos realizados</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operating Costs split */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm" id="panel_category_expenses">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
                <ArrowDownRight className="w-4 h-4 mr-1.5 text-rose-600" /> Despesas por Categoria ({period.toUpperCase()})
              </h4>

              {categoryExpenses.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-8">Nenhuma despesa registada neste período.</p>
              ) : (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2" id="category_expenses_content">
                  <div className="w-full md:w-1/2 h-44 flex justify-center items-center text-xs" id="pie_chart_container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryExpenses}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryExpenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            borderRadius: '12px', 
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            fontSize: '11px',
                            fontFamily: 'Inter, sans-serif'
                          }}
                          formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, 'Valor']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full md:w-1/2 space-y-3.5 self-center" id="category_expenses_list">
                    {categoryExpenses.map((item, index) => {
                      const total = categoryExpenses.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      const color = COLORS[index % COLORS.length];

                      return (
                        <div key={item.name} className="space-y-1.5" id={`cat_expense_${index}`}>
                          <div className="flex justify-between text-xs font-semibold" id="cat_expense_info">
                            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                              {item.name}
                            </span>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">
                              {item.value.toLocaleString()} {currency} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5" id="cat_expense_progress">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= 2. GENERATE REPORT TAB ================= */}
      {subTab === 'gerar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-sm" id="generate_report_panel">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Gerador de Relatórios Periódicos</span>
            </h2>
            <p className="text-[10px] text-slate-500">Compile dados reais de faturamento, custos e metas em documentos arquivados</p>
          </div>

          <div className="space-y-4" id="generator_form">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Tipo de Fechamento</label>
              <div className="grid grid-cols-3 gap-2" id="report_type_selectors">
                {(['diario', 'semanal', 'mensal'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGeneratingType(t)}
                    className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-2xl border transition-all ${generatingType === t ? 'bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                  >
                    {t === 'diario' ? 'Diário' : t === 'semanal' ? 'Semanal' : 'Mensal'}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Nota: O DroopFlow irá verificar todas as vendas, taxas de envio e despesas operacionais realizadas no período selecionado, calcular as margens exatas de lucro líquido e atualizar o seu registo de metas.
            </p>

            {reportFeedback && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-3.5 rounded-2xl text-[11px] font-bold text-emerald-700 dark:text-emerald-400 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{reportFeedback}</span>
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
            >
              <Bell className="w-4 h-4 animate-swing" />
              <span>{isGenerating ? 'A gerar análise...' : `Gerar Relatório ${generatingType.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. REPORT ARCHIVE / HISTORY TAB ================= */}
      {subTab === 'historico' && (
        <div className="space-y-4" id="report_archive_panel">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 font-display">Arquivo de Fechamentos</h2>
            <p className="text-[10px] text-slate-500">Histórico de relatórios gerados e desempenho alcançado</p>
          </div>

          <div className="space-y-2.5" id="reports_list_feed">
            {relatorios.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum fechamento arquivado.</p>
                <p className="text-[10px] text-slate-500">Aceda ao separador "Gerar" para criar o primeiro relatório periódico.</p>
              </div>
            ) : (
              relatorios.map(r => (
                <div 
                  key={r.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                  id={`report_card_${r.id}`}
                >
                  <div className="space-y-1 flex-1 min-w-0" id="report_meta_side">
                    <div className="flex items-center space-x-2" id="report_badge_group">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${r.tipo === 'diario' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : r.tipo === 'semanal' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'}`}>
                        {r.tipo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(r.data_geracao).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-black text-slate-900 dark:text-slate-100 pt-1" id="report_numbers_snapshot">
                      <span>Faturado: <strong className="text-emerald-600 font-extrabold">{r.total_vendido.toLocaleString()} {currency}</strong></span>
                      <span>Líquido: <strong className={r.balanco >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{r.balanco.toLocaleString()} {currency}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(r)}
                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Visualizar Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= DETAILED REPORT MODAL ================= */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="report_details_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative" id="report_details_content">
            
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3" id="report_modal_header">
              <div className="space-y-0.5" id="report_modal_title">
                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded uppercase block w-max">
                  Relatório {selectedReport.tipo}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">
                  Gerado em: {new Date(selectedReport.data_geracao).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body stats summary */}
            <div className="space-y-4" id="report_modal_body">
              <div className="grid grid-cols-2 gap-3" id="report_modal_stats_grid">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-0.5 border border-slate-100/40">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Faturamento</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">
                    {selectedReport.total_vendido.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-0.5 border border-slate-100/40">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Custos Totais</span>
                  <span className="text-sm font-black text-rose-600 block">
                    {selectedReport.total_gasto.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl col-span-2 space-y-0.5 border border-slate-100/40">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Resultado Líquido</span>
                  <span className={`text-base font-black block ${selectedReport.balanco >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedReport.balanco.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* Goal achievements feedback inside modal */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/40 space-y-1.5" id="report_modal_goals_feedback">
                <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-400 block uppercase tracking-wider">Acompanhamento de Metas</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedReport.progresso_metas || 'Nenhuma meta registada no momento.'}
                </p>
                {selectedReport.metas_atingidas && selectedReport.metas_atingidas.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1" id="report_achieved_badges">
                    {selectedReport.metas_atingidas.map((m: string) => (
                      <span key={m} className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" />
                        {m === 'metaDiaria' ? 'Diária batida' : m === 'metaSemanal' ? 'Semanal batida' : 'Mensal batida'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedReport(null)}
              className="w-full bg-slate-900 text-white font-extrabold text-xs py-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
