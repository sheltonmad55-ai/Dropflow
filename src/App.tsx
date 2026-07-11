/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './lib/appContext.tsx';
import Onboarding from './components/Onboarding.tsx';
import DashboardView from './components/DashboardView.tsx';
import CaixinhasView from './components/CaixinhasView.tsx';
import VendasView from './components/VendasView.tsx';
import RelatoriosView from './components/RelatoriosView.tsx';
import DefinicoesView from './components/DefinicoesView.tsx';
import VendaModal from './components/VendaModal.tsx';
import DespesaModal from './components/DespesaModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import dropflowLogo from './assets/images/dropflow_logo_1783728024322.jpg';

import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  BarChart2, 
  Settings, 
  Plus, 
  ArrowDownRight, 
  Sparkles,
  RefreshCw,
  Bell,
  X,
  Award,
  CheckCircle
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoadingAuth, activeAlert, clearActiveAlert, profile } = useApp();
  
  // Navigation tabs: 'dashboard' | 'caixinhas' | 'vendas' | 'relatorios' | 'definicoes'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal Triggers
  const [isVendaOpen, setIsVendaOpen] = useState(false);
  const [isDespesaOpen, setIsDespesaOpen] = useState(false);

  // Quick Action Menu Trigger (for adding sales or expenses)
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // 1. Loading Splash Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6" id="loading_splash">
        <div className="w-20 h-20 bg-white p-1 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse overflow-hidden flex items-center justify-center" id="loading_logo">
          <img 
            src={dropflowLogo} 
            alt="DropFlow Logo" 
            className="w-full h-full object-cover rounded-2xl" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-2 text-center" id="loading_text_group">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">DropFlow</h2>
          <p className="text-xs text-slate-400">A inicializar o DropFlow...</p>
        </div>
      </div>
    );
  }

  // 2. Onboarding Flow
  if (!isAuthenticated) {
    return <Onboarding />;
  }

  // 3. Main Dashboard & PWA App Skeleton
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between pb-24 md:max-w-md md:mx-auto md:shadow-2xl md:border md:border-slate-100 md:my-4 md:rounded-3xl relative shadow-slate-200/50" id="app_frame">
      
      {/* Top Header Panel */}
      <header className="px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center" id="app_header">
        <div className="flex items-center space-x-2" id="header_logo_group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200/50 flex items-center justify-center shadow-sm" id="header_logo_badge">
            <img 
              src={dropflowLogo} 
              alt="DropFlow Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-sm font-black text-slate-900 font-display">DropFlow</span>
        </div>

        <div className="flex items-center space-x-2" id="header_actions">
          {/* Active indicator */}
          <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeTab === 'dashboard' ? 'Início' :
             activeTab === 'caixinhas' ? 'Pockets' :
             activeTab === 'vendas' ? 'Operações' :
             activeTab === 'relatorios' ? 'Relatórios' : 'Opções'}
          </span>
        </div>
      </header>

      {/* Main Tab View Contents */}
      <main className="flex-1 px-6 py-6 overflow-y-auto" id="app_main_content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {activeTab === 'dashboard' && (
              <DashboardView 
                onOpenVenda={() => setIsVendaOpen(true)} 
                onOpenDespesa={() => setIsDespesaOpen(true)} 
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'caixinhas' && <CaixinhasView />}
            {activeTab === 'vendas' && <VendasView />}
            {activeTab === 'relatorios' && <RelatoriosView />}
            {activeTab === 'definicoes' && <DefinicoesView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Menu (PWA style center button) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40" id="quick_floating_wrapper">
        <div className="relative" id="quick_floating_relative">
          {/* Quick options popup */}
          {showQuickMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-xl flex flex-col space-y-2 w-40 text-center animate-fade-in" id="quick_menu_pop">
              <button
                id="btn_pop_venda"
                onClick={() => {
                  setIsVendaOpen(true);
                  setShowQuickMenu(false);
                }}
                className="py-2 px-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-emerald-600 flex items-center space-x-1.5 justify-start transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nova Venda</span>
              </button>
              <button
                id="btn_pop_despesa"
                onClick={() => {
                  setIsDespesaOpen(true);
                  setShowQuickMenu(false);
                }}
                className="py-2 px-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-1.5 justify-start transition-colors"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Nova Despesa</span>
              </button>
            </div>
          )}

          {/* Central Button */}
          <button
            id="btn_main_quick_add"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${showQuickMenu ? 'bg-slate-100 text-slate-600 rotate-45 border border-slate-200 shadow-slate-100' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'}`}
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Bottom PWA Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 border-t border-slate-100 px-4 md:max-w-md md:mx-auto z-40 flex items-center justify-between shadow-lg" id="app_navbar">
        <button
          id="nav_dashboard"
          onClick={() => { setActiveTab('dashboard'); setShowQuickMenu(false); }}
          className={`flex-1 flex flex-col items-center space-y-1 py-1 transition-colors ${activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Painel</span>
        </button>

        <button
          id="nav_caixinhas"
          onClick={() => { setActiveTab('caixinhas'); setShowQuickMenu(false); }}
          className={`flex-1 flex flex-col items-center space-y-1 py-1 transition-colors ${activeTab === 'caixinhas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Pockets</span>
        </button>

        {/* Center spacing spacer for floating action button */}
        <div className="flex-1 w-12" id="navbar_floating_spacer"></div>

        <button
          id="nav_vendas"
          onClick={() => { setActiveTab('vendas'); setShowQuickMenu(false); }}
          className={`flex-1 flex flex-col items-center space-y-1 py-1 transition-colors ${activeTab === 'vendas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Vendas</span>
        </button>

        <button
          id="nav_definicoes"
          onClick={() => { setActiveTab('definicoes'); setShowQuickMenu(false); }}
          className={`flex-1 flex flex-col items-center space-y-1 py-1 transition-colors ${activeTab === 'definicoes' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Definições</span>
        </button>
      </nav>

      {/* Global Form Modals */}
      <VendaModal isOpen={isVendaOpen} onClose={() => setIsVendaOpen(false)} />
      <DespesaModal isOpen={isDespesaOpen} onClose={() => setIsDespesaOpen(false)} />

      {/* FCM Push Notification Card Overlay */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-50 flex flex-col space-y-3 font-sans"
            id="fcm_notification_popup"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-lg ${activeAlert.type === 'goal' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {activeAlert.type === 'goal' ? <Award className="w-5 h-5 animate-bounce" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Notificação Push (FCM)</h4>
                  <h3 className="text-xs font-extrabold text-white">{activeAlert.title}</h3>
                </div>
              </div>
              <button onClick={clearActiveAlert} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">{activeAlert.body}</p>

            {/* Daily summary interactive report details inside Push Notification */}
            {activeAlert.type === 'summary' && activeAlert.data && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Faturação Bruta:</span>
                  <span className="text-emerald-400 font-semibold">+{activeAlert.data.vendasTotal} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Custos Fornecedor:</span>
                  <span className="text-amber-500 font-semibold">-{activeAlert.data.fornecedoresTotal} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Taxas de Entrega:</span>
                  <span className="text-indigo-400 font-semibold">-{activeAlert.data.deliveryTotal} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Anúncios & Despesas:</span>
                  <span className="text-rose-400 font-semibold">-{activeAlert.data.despesasTotal + activeAlert.data.adsTotal} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white text-xs border-t border-slate-800">
                  <span className="text-slate-300 font-sans">Lucro Líquido:</span>
                  <span className="text-emerald-400">+{activeAlert.data.lucroLiquido} {profile?.moeda || 'MT'}</span>
                </div>
              </div>
            )}

            {/* Goal batida alert celebratory statistics inside Push Notification */}
            {activeAlert.type === 'goal' && activeAlert.data && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[10px] font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Meta Diária:</span>
                  <span className="text-slate-200 font-bold font-mono">{activeAlert.data.meta} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Lucro Registado:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{activeAlert.data.lucroReal} {profile?.moeda || 'MT'}</span>
                </div>
                <div className="pt-2 text-center text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center justify-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Meta superada em {activeAlert.data.percent}%!</span>
                </div>
              </div>
            )}

            <button
              onClick={clearActiveAlert}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl transition-colors shadow-lg shadow-emerald-900/10"
            >
              Entendido
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
