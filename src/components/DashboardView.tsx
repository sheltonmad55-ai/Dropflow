/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../lib/appContext.tsx';
import { 
  TrendingUp, 
  Megaphone, 
  Package, 
  Truck, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  Plus, 
  ChevronRight,
  Info
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
    isOnline, 
    syncStatus, 
    syncWithServer 
  } = useApp();

  const currency = profile?.moeda || 'MT';

  // Calculations
  const totalBalance = caixinhas.reduce((acc, curr) => acc + curr.saldo_atual, 0);

  // Today dates
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  const todayVendas = vendas.filter(v => v.data_venda === todayStr);
  const monthVendas = vendas.filter(v => v.data_venda.startsWith(currentMonthStr));
  const monthDespesas = despesas.filter(d => d.data.startsWith(currentMonthStr));

  const totalSoldToday = todayVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  const totalSoldMonth = monthVendas.reduce((acc, curr) => acc + curr.valor_recebido, 0);
  const totalExpensesMonth = monthDespesas.reduce((acc, curr) => acc + curr.valor, 0);

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

  // Combine and sort recent transactions (last 3)
  const recentActivities = [
    ...vendas.map(v => ({ ...v, type: 'venda' as const, date: v.criado_em })),
    ...despesas.map(d => ({ ...d, type: 'despesa' as const, date: d.criado_em }))
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Render sync banner
  const renderSyncBanner = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-2xl flex items-center justify-between text-xs text-emerald-700 animate-pulse" id="sync_banner">
            <span className="flex items-center">
              <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
              A sincronizar dados com a nuvem...
            </span>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-amber-50 border border-amber-100 px-3.5 py-2 rounded-2xl flex items-center justify-between text-xs text-amber-700 cursor-pointer" onClick={syncWithServer} id="sync_banner">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-2 animate-bounce" />
              Alterações locais guardadas offline. Toca para sincronizar.
            </span>
            <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
          </div>
        );
      case 'offline':
      case 'synced':
      default:
        // Hide these statuses to keep the UI clean as requested by the user
        return null;
    }
  };

  return (
    <div className="space-y-6" id="dashboard_view">
      
      {/* Greetings / Sync Indicator */}
      <div className="space-y-3" id="dash_header_section">
        <div className="flex justify-between items-center" id="dash_welcome_group">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Olá, {profile?.nome || 'Empreendedor'}!</h2>
            <p className="text-[11px] text-slate-500">
              {profile?.plano === 'trial' ? 'Período experimental grátis' : 'Plano DropFlow Pro Ativo'}
            </p>
          </div>
          {profile?.plano === 'trial' && (
            <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700" id="trial_countdown">
              7 dias grátis
            </div>
          )}
        </div>

        {renderSyncBanner()}
      </div>

      {/* Hero: Balance Display */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden" id="dash_balance_card">
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
            className="bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Venda</span>
          </button>
          <button
            id="btn_shortcut_despesa"
            onClick={onOpenDespesa}
            className="bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1.5 border border-slate-200/50"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Saída</span>
          </button>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5" id="dash_metrics_grid">
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1 text-center shadow-sm" id="metric_venda_dia">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Hoje</span>
          <span className="text-xs font-bold text-emerald-600 block">{totalSoldToday.toLocaleString()} {currency}</span>
          <span className="text-[9px] text-slate-400 block">Vendido</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1 text-center shadow-sm" id="metric_venda_mes">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">No Mês</span>
          <span className="text-xs font-bold text-sky-600 block">{totalSoldMonth.toLocaleString()} {currency}</span>
          <span className="text-[9px] text-slate-400 block">Vendido</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1 text-center shadow-sm" id="metric_despesas_mes">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Gastos Mês</span>
          <span className="text-xs font-bold text-rose-600 block">{totalExpensesMonth.toLocaleString()} {currency}</span>
          <span className="text-[9px] text-slate-400 block">Investido</span>
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
          {caixinhas.slice(0, 4).map(cx => {
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

      {/* Recent Activities Section */}
      <div className="space-y-3" id="dash_history_section">
        <h3 className="font-bold text-sm text-slate-900 font-display">Atividade Recente</h3>

        {recentActivities.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-1" id="empty_activity">
            <Info className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">Nenhum registo feito ainda.</p>
            <p className="text-[10px] text-slate-400">Adicione uma venda para ver a distribuição.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden" id="dash_history_list">
            {recentActivities.map((act: any) => (
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
                      {act.type === 'venda' ? 'Venda Registada' : act.descricao}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {act.type === 'venda' ? `ID venda: ${act.id.slice(0, 8)}` : act.categoria}
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
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
