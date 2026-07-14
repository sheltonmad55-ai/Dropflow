/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Megaphone, 
  BarChart2, 
  Target, 
  CheckCircle2,
  HelpCircle,
  Play
} from 'lucide-react';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface StepConfig {
  title: string;
  content: string;
  targetSelector: string;
  tab?: string;
  icon: React.ReactNode;
  badge: string;
}

export default function WelcomeTour({ isOpen, onClose, activeTab, setActiveTab }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Tour steps definition
  const steps: StepConfig[] = [
    {
      title: 'Bem-vindo ao DroopFlow! 🚀',
      content: 'Este é o seu centro inteligente de gestão financeira e operacional para Dropshipping. Vamos fazer um tour guiado rápido de 1 minuto para dominar a aplicação? Clique no botão "Seguinte" abaixo para começar!',
      targetSelector: 'none',
      icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
      badge: 'Início'
    },
    {
      title: 'Resumo Diário (Bento Grid) 📊',
      content: 'Aqui vê o seu balanço financeiro diário. Pode clicar diretamente num dos cards de métricas (como "Faturação" ou "Caixinha") para ver detalhes ou escolher outro dia para recalcular os valores.',
      targetSelector: '#selected_day_metrics_grid',
      tab: 'dashboard',
      icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
      badge: 'Painel'
    },
    {
      title: 'Calendário Semanal 📅',
      content: 'Navegue livremente pelos dias. Clique diretamente numa data do calendário com ponto colorido para carregar as vendas (ponto verde) ou despesas (ponto vermelho) desse dia.',
      targetSelector: '#calendar_strip_wrapper',
      tab: 'dashboard',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      badge: 'Calendário'
    },
    {
      title: 'Registos Rápidos de Caixa ➕',
      content: 'Estes botões no menu lateral são para registos imediatos. Clique em "Registar Venda" para adicionar uma encomenda com divisão de lucro automática ou "Registar Despesa" para registar saídas.',
      targetSelector: '#sidebar_actions',
      tab: 'dashboard',
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      badge: 'Registos'
    },
    {
      title: 'Pockets Virtuais (Caixinhas) 📦',
      content: 'Clique em "Configurar Caixinhas" no canto superior direito para ir ao seu perfil comercial e definir exatamente a percentagem de lucro que cada venda distribui para estas caixas.',
      targetSelector: '#caixinhas_view',
      tab: 'caixinhas',
      icon: <Layers className="w-8 h-8 text-purple-500" />,
      badge: 'Pockets'
    },
    {
      title: 'Controlo de Vendas e Estoque 💰',
      content: 'Gestão operacional completa. Clique em "Nova Venda" para adicionar novos pedidos de dropshipping ou clique em "Exportar CSV" para descarregar todo o seu histórico financeiro.',
      targetSelector: '#vendas_view',
      tab: 'vendas',
      icon: <CheckCircle2 className="w-8 h-8 text-sky-500" />,
      badge: 'Operações'
    },
    {
      title: 'Performance de Anúncios & ROAS 📣',
      content: 'Clique no botão de edição de gastos diários (lápis) na tabela para introduzir o valor investido em tráfego pago (Facebook Ads, TikTok). O DroopFlow calcula o seu ROAS real de imediato!',
      targetSelector: '#campanhas_view_wrapper',
      tab: 'campanhas',
      icon: <Megaphone className="w-8 h-8 text-rose-500" />,
      badge: 'Tráfego'
    },
    {
      title: 'Relatórios Dinâmicos e DRE 📈',
      content: 'Para obter uma análise em PDF completa do seu negócio para fornecedores ou sócios, clique no botão "Descarregar Relatório" ou passe o cursor sobre os gráficos para ver o detalhe diário.',
      targetSelector: '#relatorios_view',
      tab: 'relatorios',
      icon: <BarChart2 className="w-8 h-8 text-indigo-500" />,
      badge: 'Relatórios'
    },
    {
      title: 'Objetivos e Metas Financeiras 🎯',
      content: 'Clique em "Nova Meta" para estipular o seu objetivo de faturamento diário, semanal ou mensal. A barra de progresso visual é atualizada automaticamente a cada nova venda registada!',
      targetSelector: '#metas_view_container',
      tab: 'metas',
      icon: <Target className="w-8 h-8 text-rose-500" />,
      badge: 'Objetivos'
    },
    {
      title: 'Tudo Pronto! 🎉',
      content: 'Concluiu o tour com sucesso! Pode aceder a este guia interativo sempre que quiser clicando em "Rever Tour de Boas-vindas" nas Definições. Clique no botão "Concluir" abaixo para começar!',
      targetSelector: 'none',
      tab: 'dashboard',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      badge: 'Sucesso'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setHasMounted(true);
      setCurrentStep(0);
    } else {
      setHasMounted(false);
    }
  }, [isOpen]);

  // Handle automatic tab changing when step changes
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (step && step.tab && activeTab !== step.tab) {
      setActiveTab(step.tab);
    }
  }, [currentStep, isOpen]);

  // Spotlight Position Calculator
  useEffect(() => {
    if (!isOpen) return;
    const targetSelector = steps[currentStep]?.targetSelector;
    if (!targetSelector || targetSelector === 'none') {
      setSpotlightStyle(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        
        // Scroll element gently into view if it is not fully visible
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

        setSpotlightStyle({
          top: `${rect.top + window.scrollY - 8}px`,
          left: `${rect.left + window.scrollX - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
          position: 'absolute',
        });
      } else {
        // Fallback or retry after brief delay (especially useful when switching tabs)
        setSpotlightStyle(null);
      }
    };

    // Delayed computations to wait for tab change animation/layout shifts
    updatePosition();
    const t1 = setTimeout(updatePosition, 150);
    const t2 = setTimeout(updatePosition, 400);
    const t3 = setTimeout(updatePosition, 750);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, activeTab, isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('dropflow_tour_completed', 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('dropflow_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" id="welcome_tour_overlay_root">
      
      {/* 1. Black Backdrop / Spotlight Mask */}
      {spotlightStyle ? (
        <div 
          className="pointer-events-none fixed z-[100] border border-emerald-500/80 rounded-3xl transition-all duration-300 ease-out shadow-[0_0_0_9999px_rgba(2,6,23,0.65),0_0_30px_rgba(16,185,129,0.35)]"
          style={spotlightStyle}
          id="tour_spotlight_ring"
        >
          {/* Pulse Indicator dot */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
        </div>
      ) : (
        <div 
          onClick={handleSkip}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-[1px] z-[100] transition-opacity duration-300"
          id="tour_general_backdrop"
        />
      )}

      {/* 2. Bento Onboarding Card */}
      <div className="fixed inset-x-0 bottom-6 md:bottom-8 flex justify-center items-end px-4 pointer-events-none z-[110]" id="tour_card_container">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-5 md:p-6 flex flex-col space-y-4 pointer-events-auto"
          id="tour_onboarding_bento"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between" id="tour_card_header">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold" id="tour_step_badge">
              {step.badge}
            </span>
            <div className="flex items-center space-x-2" id="tour_progress_indicator">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                {currentStep + 1} de {steps.length}
              </span>
              <button 
                onClick={handleSkip}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Sair do Tour"
                id="btn_tour_close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Micro bar */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" id="tour_micro_progress">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              id="tour_progress_bar_fill"
            />
          </div>

          {/* Icon and Text Body */}
          <div className="flex items-start space-x-4" id="tour_card_body">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100/50 dark:border-slate-800 rounded-2xl shrink-0" id="tour_step_icon">
              {step.icon}
            </div>
            <div className="space-y-1" id="tour_text_group">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-50 text-sm tracking-tight font-display" id="tour_step_title">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed" id="tour_step_description">
                {step.content}
              </p>
            </div>
          </div>

          {/* Interactive Navigation Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80" id="tour_card_footer">
            <button
              onClick={handleSkip}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-1 cursor-pointer"
              id="btn_tour_skip"
            >
              {isLast ? 'Fechar' : 'Pular Tour'}
            </button>

            <div className="flex items-center space-x-2" id="tour_nav_buttons_group">
              <button
                disabled={isFirst}
                onClick={handlePrev}
                className={`p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300'}`}
                title="Passo Anterior"
                id="btn_tour_prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md shadow-emerald-600/10 transition-all flex items-center space-x-1 cursor-pointer"
                id="btn_tour_next"
              >
                <span>{isLast ? 'Concluir' : 'Seguinte'}</span>
                {!isLast && <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
