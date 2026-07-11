/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { TrendingUp, ArrowDownRight, Award, BarChart2 } from 'lucide-react';
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
  const { vendas, despesas, produtos, caixinhas, profile } = useApp();
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');

  const currency = profile?.moeda || 'MT';

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

  // Expense categories split (restructured with name and value for Recharts)
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

  // Helper to safely format YYYY-MM-DD for current timezones
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

  // Vibrant color palette for the category pie chart segments
  const COLORS = ['#6366F1', '#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-fade-in" id="relatorios_view">
      
      {/* Header and Filter */}
      <div className="flex flex-col space-y-3" id="relatorios_header">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">Relatórios e IA</h2>
          <p className="text-[10px] text-slate-500">Análise de rentabilidade em tempo real</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-100 p-1 rounded-xl flex space-x-1" id="period_filter_bar">
          {(['hoje', 'semana', 'mes', 'todos'] as const).map(p => (
            <button
              key={p}
              id={`filter_period_${p}`}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${period === p ? 'bg-white text-slate-900 shadow border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 Dias' : p === 'mes' ? '30 Dias' : 'Tudo'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm" id="accounting_hero">
        <div className="flex justify-between items-center" id="accounting_hero_header">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Demonstração de Resultados (DRE)</span>
          <span className="text-emerald-600 text-xs font-black flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Margem: {profitMargin}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4" id="accounting_breakdown">
          <div className="space-y-1" id="dre_receita">
            <span className="text-[10px] text-slate-500 block">Faturamento Bruto</span>
            <span className="text-lg font-black text-slate-900 block">
              {totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
            </span>
          </div>

          <div className="space-y-1" id="dre_lucro">
            <span className="text-[10px] text-slate-500 block">Resultado Líquido</span>
            <span className={`text-lg font-black block ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
            </span>
          </div>
        </div>

        {/* Progress gauge for costs vs revenue */}
        {totalRevenue > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100" id="cost_ratio_gauge">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Custos Totais ({Math.round(totalCosts / totalRevenue * 100)}%)</span>
              <span>Lucro Líquido ({profitMargin}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden" id="gauge_bar">
              <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, totalCosts / totalRevenue * 100)}%` }}></div>
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.max(0, 100 - (totalCosts / totalRevenue * 100))}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Recharts Chart: Revenue vs Costs Line Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm" id="relatorios_chart_wrapper">
        <div className="flex justify-between items-center" id="relatorios_chart_header">
          <h3 className="font-bold text-xs text-slate-900 flex items-center font-display">
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

      {/* Two-Column Section: Top Products & Category Expenses */}
      <div className="grid grid-cols-1 gap-6" id="relatorios_details_grid">
        
        {/* Best Sellers */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 shadow-sm" id="panel_best_sellers">
          <h4 className="font-bold text-xs text-slate-900 flex items-center font-display">
            <Award className="w-4 h-4 mr-1.5 text-yellow-600" /> Produtos Campeões
          </h4>

          {bestSellers.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-4">Sem vendas no período.</p>
          ) : (
            <div className="space-y-3" id="best_sellers_list">
              {bestSellers.map((item, index) => (
                <div key={item.name} className="space-y-1.5" id={`bestseller_${index}`}>
                  <div className="flex justify-between text-xs font-semibold" id="bestseller_info">
                    <span className="text-slate-800 truncate pr-4">{item.name}</span>
                    <span className="font-extrabold text-slate-900">{item.rev.toLocaleString()} {currency}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5" id="bestseller_progress">
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

        {/* Operating Costs split with Recharts PieChart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm" id="panel_category_expenses">
          <h4 className="font-bold text-xs text-slate-900 flex items-center font-display">
            <ArrowDownRight className="w-4 h-4 mr-1.5 text-rose-600" /> Despesas por Categoria ({period.toUpperCase()})
          </h4>

          {categoryExpenses.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-8">Nenhuma despesa registada neste período.</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2" id="category_expenses_content">
              {/* Pie Chart container */}
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

              {/* Detailed Category List with custom colored bullet indicators */}
              <div className="w-full md:w-1/2 space-y-3.5 self-center" id="category_expenses_list">
                {categoryExpenses.map((item, index) => {
                  const total = categoryExpenses.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={item.name} className="space-y-1.5" id={`cat_expense_${index}`}>
                      <div className="flex justify-between text-xs font-semibold" id="cat_expense_info">
                        <span className="text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                          {item.name}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {item.value.toLocaleString()} {currency} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5" id="cat_expense_progress">
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
  );
}
