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
  RefreshCw
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoadingAuth } = useApp();
  
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
