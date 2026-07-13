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
import CampanhasView from './components/CampanhasView.tsx';
import RelatoriosView from './components/RelatoriosView.tsx';
import DefinicoesView from './components/DefinicoesView.tsx';
import AdminView from './components/AdminView.tsx';
import MetasView from './components/MetasView.tsx';
import VendaModal from './components/VendaModal.tsx';
import DespesaModal from './components/DespesaModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import WelcomeTour from './components/WelcomeTour.tsx';
import dropflowLogo from './assets/images/droopflow_logo_1783896707656.jpg';

import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  BarChart2, 
  Megaphone,
  Settings, 
  Plus, 
  ArrowDownRight, 
  Sparkles,
  RefreshCw,
  Target,
  Shield
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoadingAuth, isAdmin } = useApp();
  
  // Navigation tabs: 'dashboard' | 'caixinhas' | 'vendas' | 'relatorios' | 'metas' | 'admin' | 'definicoes'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Initialize and apply dark mode preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('dropflow_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Modal Triggers
  const [isVendaOpen, setIsVendaOpen] = useState(false);
  const [isDespesaOpen, setIsDespesaOpen] = useState(false);

  // Quick Action Menu Trigger (for adding sales or expenses)
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Tour Guide State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-start tour for new users on mount
  React.useEffect(() => {
    if (isAuthenticated) {
      const tourCompleted = localStorage.getItem('dropflow_tour_completed');
      if (tourCompleted !== 'true') {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  // 1. Loading Splash Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-6 text-slate-800 dark:text-slate-100" id="loading_splash">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 p-1 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-pulse overflow-hidden flex items-center justify-center" id="loading_logo">
          <img 
            src={dropflowLogo} 
            alt="DroopFlow Logo" 
            className="w-full h-full object-cover rounded-2xl" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-2 text-center" id="loading_text_group">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-display">DroopFlow</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">A inicializar o DroopFlow...</p>
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row relative" id="app_root_layout">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col justify-between p-6 h-screen sticky top-0 shrink-0 z-40 shadow-sm" id="desktop_sidebar">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Logo Group */}
          <div className="flex items-center space-x-2.5" id="sidebar_logo_group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <img 
                src={dropflowLogo} 
                alt="DroopFlow Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-slate-50 tracking-tight font-display">DroopFlow</span>
          </div>
 
          {/* Navigation Links */}
          <nav className="space-y-1" id="sidebar_nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setActiveTab('caixinhas')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'caixinhas' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>Pockets</span>
            </button>

            <button
              onClick={() => setActiveTab('vendas')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vendas' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
              <span>Vendas</span>
            </button>

            <button
              onClick={() => setActiveTab('campanhas')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'campanhas' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Megaphone className="w-4 h-4 stroke-[2.5]" />
              <span>Campanhas</span>
            </button>

            <button
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'relatorios' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <BarChart2 className="w-4 h-4 stroke-[2.5]" />
              <span>Relatórios</span>
            </button>

            <button
              onClick={() => setActiveTab('metas')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'metas' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Target className="w-4 h-4 stroke-[2.5]" />
              <span>Metas</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-4 h-4 stroke-[2.5]" />
                <span>Admin</span>
              </button>
            )}

            <button
              id="sidebar_btn_tour"
              onClick={() => setIsTourOpen(true)}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-transparent hover:border-amber-100/30 dark:hover:border-amber-900/10"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5] text-amber-500 animate-pulse animate-none" />
              <span>Tour Guiado</span>
            </button>

            <button
              onClick={() => setActiveTab('definicoes')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'definicoes' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-4 h-4 stroke-[2.5]" />
              <span>Definições</span>
            </button>
          </nav>
        </div>

        {/* Desktop Quick Actions Panel inside Sidebar */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800" id="sidebar_actions">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block px-1">Registos Rápidos</span>
          <button
            onClick={() => setIsVendaOpen(true)}
            className="w-full bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registar Venda</span>
          </button>
          <button
            onClick={() => setIsDespesaOpen(true)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-500 stroke-[2.5]" />
            <span>Registar Saída</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER: Responsive width & Layout */}
      <div className="flex-1 flex flex-col min-h-screen relative bg-white dark:bg-slate-950 md:bg-slate-50/20" id="main_layout_body">
        
        {/* Top Header Panel */}
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center" id="app_header">
          <div className="flex items-center space-x-2 md:space-x-3" id="header_logo_group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-700 flex items-center justify-center shadow-sm md:hidden" id="header_logo_badge">
              <img 
                src={dropflowLogo} 
                alt="DroopFlow Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-sm md:text-base font-black text-slate-900 dark:text-slate-50 font-display">
              {activeTab === 'dashboard' ? 'Painel de Controlo' :
               activeTab === 'caixinhas' ? 'Gestão de Pockets' :
               activeTab === 'vendas' ? 'Lista de Vendas' :
               activeTab === 'campanhas' ? 'Campanhas de Anúncios' :
               activeTab === 'relatorios' ? 'Relatórios Financeiros' :
               activeTab === 'metas' ? 'Metas de Vendas' :
               activeTab === 'admin' ? 'Painel de Admin' : 'Configurações'}
            </span>
          </div>

          <div className="flex items-center space-x-2" id="header_actions">
            {/* Active indicator */}
            <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeTab === 'dashboard' ? 'Início' :
               activeTab === 'caixinhas' ? 'Pockets' :
               activeTab === 'vendas' ? 'Operações' :
               activeTab === 'campanhas' ? 'Campanhas' :
               activeTab === 'relatorios' ? 'Relatórios' :
               activeTab === 'metas' ? 'Metas' :
               activeTab === 'admin' ? 'Admin' : 'Opções'}
            </span>
          </div>
        </header>

        {/* Main Tab View Contents (spans nicely on desktop) */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto max-w-5xl w-full mx-auto pb-24 md:pb-8" id="app_main_content">
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
              {activeTab === 'campanhas' && <CampanhasView />}
              {activeTab === 'relatorios' && <RelatoriosView />}
              {activeTab === 'metas' && <MetasView />}
              {activeTab === 'admin' && <AdminView />}
              {activeTab === 'definicoes' && (
                <DefinicoesView onStartTour={() => setIsTourOpen(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Action Menu (PWA style center button - Mobile Only) */}
        <div className="fixed bottom-24 right-4 z-40 md:hidden" id="quick_floating_wrapper">
          <div className="relative" id="quick_floating_relative">
            {/* Quick options popup */}
            {showQuickMenu && (
              <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-xl flex flex-col space-y-2 w-40 text-center animate-fade-in animate-none" id="quick_menu_pop">
                <button
                  id="btn_pop_venda"
                  onClick={() => {
                    setIsVendaOpen(true);
                    setShowQuickMenu(false);
                  }}
                  className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-emerald-600 flex items-center space-x-1.5 justify-start transition-colors cursor-pointer"
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
                  className="py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-1.5 justify-start transition-colors cursor-pointer"
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
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform cursor-pointer ${showQuickMenu ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 rotate-45 border border-slate-200 dark:border-slate-700 shadow-slate-100' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'}`}
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Bottom PWA Navigation Bar - Mobile Only */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 px-4 z-40 flex items-center overflow-x-auto scrollbar-none flex-nowrap space-x-2 shadow-lg md:hidden" id="app_navbar">
          <button
            id="nav_dashboard"
            onClick={() => { setActiveTab('dashboard'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Painel</span>
          </button>

          <button
            id="nav_caixinhas"
            onClick={() => { setActiveTab('caixinhas'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'caixinhas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Pockets</span>
          </button>

          <button
            id="nav_vendas"
            onClick={() => { setActiveTab('vendas'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'vendas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Vendas</span>
          </button>

          <button
            id="nav_campanhas"
            onClick={() => { setActiveTab('campanhas'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'campanhas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Campanhas</span>
          </button>

          <button
            id="nav_relatorios"
            onClick={() => { setActiveTab('relatorios'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'relatorios' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Relatórios</span>
          </button>

          <button
            id="nav_metas"
            onClick={() => { setActiveTab('metas'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'metas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Metas</span>
          </button>

          {isAdmin && (
            <button
              id="nav_admin"
              onClick={() => { setActiveTab('admin'); setShowQuickMenu(false); }}
              className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Admin</span>
            </button>
          )}

          <button
            id="nav_definicoes"
            onClick={() => { setActiveTab('definicoes'); setShowQuickMenu(false); }}
            className={`flex-shrink-0 min-w-[64px] flex flex-col items-center space-y-1 py-1 transition-colors cursor-pointer ${activeTab === 'definicoes' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Definições</span>
          </button>
        </nav>

      </div>

      {/* Global Form Modals */}
      <VendaModal isOpen={isVendaOpen} onClose={() => setIsVendaOpen(false)} />
      <DespesaModal isOpen={isDespesaOpen} onClose={() => setIsDespesaOpen(false)} />

      {/* Welcome Guided Onboarding Tour */}
      <WelcomeTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
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
