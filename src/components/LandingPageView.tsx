/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  BarChart2, 
  Megaphone, 
  Plus, 
  ArrowDownRight, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  Play, 
  HelpCircle, 
  ChevronDown,
  X,
  RotateCcw,
  Package,
  Truck,
  Wallet,
  Coins,
  Building2,
  Calendar,
  Eye,
  Target,
  Percent,
  RefreshCw,
  Zap,
  Award,
  Flame,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  CreditCard
} from 'lucide-react';
import dropflowLogo from '../assets/images/dropflow-icon.png';
import { useApp } from '../lib/appContext.tsx';

interface LandingPageViewProps {
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
  paywallUser?: any;
  onCheckPayment?: () => Promise<boolean>;
  onLogout?: () => void;
}

export default function LandingPageView({ onOpenAuth, paywallUser, onCheckPayment, onLogout }: LandingPageViewProps) {
  const { login, loginGoogle, register } = useApp();

  const [checkingPayment, setCheckingPayment] = useState(false);

  const handleVerifyPayment = async () => {
    if (!onCheckPayment) return;
    setCheckingPayment(true);
    try {
      await onCheckPayment();
    } finally {
      setCheckingPayment(false);
    }
  };

  // Navigation anchors
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth modal inside landing page
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authNome, setAuthNome] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ================= SIMULATOR GAMIFICADO =================
  const [simTab, setSimTab] = useState<'painel' | 'pockets' | 'metas' | 'vendas'>('painel');
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [showFeedbackToast, setShowFeedbackToast] = useState<{ title: string; desc: string; type: 'success' | 'expense' } | null>(null);

  // Simulated sales reflecting real screenshot data
  const [simVendas, setSimVendas] = useState([
    {
      id: 'v1',
      data: '2026-10-24',
      produto: 'Suporte para máquina de lavar',
      metodo: 'M-Pesa',
      zona: 'Maputo Cidade (Estafeta)',
      valor: 650,
      custoProduto: 110,
      frete: 150,
      anuncios: 150,
      metaAlocada: 50,
      lucroLiquido: 190,
      status: 'Entregue'
    },
    {
      id: 'v2',
      data: '2026-10-24',
      produto: 'Kit (4) Fixador autoadesivo',
      metodo: 'e-Mola',
      zona: 'Matola Rio',
      valor: 1150,
      custoProduto: 120,
      frete: 200,
      anuncios: 250,
      metaAlocada: 100,
      lucroLiquido: 480,
      status: 'Entregue'
    },
    {
      id: 'v3',
      data: '2026-10-23',
      produto: 'Veda portas premium beira',
      metodo: 'M-Pesa',
      zona: 'Beira / Sofala',
      valor: 1100,
      custoProduto: 180,
      frete: 250,
      anuncios: 200,
      metaAlocada: 70,
      lucroLiquido: 400,
      status: 'Entregue'
    }
  ]);

  // Form states for new sale
  const [formProd, setFormProd] = useState('Suporte para máquina de lavar');
  const [formValor, setFormValor] = useState('650');
  const [formCustoProd, setFormCustoProd] = useState('110');
  const [formMetodo, setFormMetodo] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');
  const [formZona, setFormZona] = useState('Maputo Cidade');
  const [formMetaAlvo, setFormMetaAlvo] = useState<'nenhuma' | 'diaria' | 'semanal' | 'mensal'>('diaria');
  const [formValorMeta, setFormValorMeta] = useState('50');

  // Form states for expense
  const [despesaDesc, setDespesaDesc] = useState('Anúncios Facebook / IG');
  const [despesaValor, setDespesaValor] = useState('350');
  const [despesaPocket, setDespesaPocket] = useState<'anuncios' | 'comida' | 'wifi' | 'renda'>('anuncios');
  const [despesaCarteira, setDespesaCarteira] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');

  // Dynamic Pockets based on sales & expenses
  const [pockets, setPockets] = useState({
    lucro: 761.51,
    anuncios: 7069.63,
    fornecedor: 5488.00,
    delivery: 6108.14,
    metaDiaria: 650.00,
    metaSemanal: 2450.00,
    metaMensal: 8900.00,
    saldoMpesa: 3221.00,
    saldoEmola: 2222.51
  });

  const triggerToast = (title: string, desc: string, type: 'success' | 'expense') => {
    setShowFeedbackToast({ title, desc, type });
    setTimeout(() => {
      setShowFeedbackToast(null);
    }, 4000);
  };

  const handleSimularVenda = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formValor) || 650;
    const cProd = parseFloat(formCustoProd) || 110;
    const frete = 150;
    const ads = 150;
    const alocMeta = formMetaAlvo !== 'nenhuma' ? (parseFloat(formValorMeta) || 50) : 0;
    const lucro = Math.max(0, val - cProd - frete - ads - alocMeta);

    const novaVenda = {
      id: 'v' + Date.now(),
      data: new Date().toISOString().split('T')[0],
      produto: formProd,
      metodo: formMetodo,
      zona: formZona,
      valor: val,
      custoProduto: cProd,
      frete,
      anuncios: ads,
      metaAlocada: alocMeta,
      lucroLiquido: lucro,
      status: 'Entregue'
    };

    setSimVendas([novaVenda, ...simVendas]);
    setPockets(prev => ({
      ...prev,
      lucro: prev.lucro + lucro,
      anuncios: prev.anuncios + ads,
      fornecedor: prev.fornecedor + cProd,
      delivery: prev.delivery + frete,
      metaDiaria: formMetaAlvo === 'diaria' ? prev.metaDiaria + alocMeta : prev.metaDiaria,
      metaSemanal: formMetaAlvo === 'semanal' ? prev.metaSemanal + alocMeta : prev.metaSemanal,
      metaMensal: formMetaAlvo === 'mensal' ? prev.metaMensal + alocMeta : prev.metaMensal,
      saldoMpesa: formMetodo === 'M-Pesa' ? prev.saldoMpesa + val : prev.saldoMpesa,
      saldoEmola: formMetodo === 'e-Mola' ? prev.saldoEmola + val : prev.saldoEmola
    }));

    setIsVendaModalOpen(false);
    triggerToast(
      'Venda Registada com Sucesso! 🚀',
      `+${val} MT recebido via ${formMetodo}. O dinheiro do fornecedor (+${cProd} MT) e da entrega (+${frete} MT) foram protegidos nas caixinhas!`,
      'success'
    );
  };

  const handleSimularDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(despesaValor) || 300;

    setPockets(prev => ({
      ...prev,
      anuncios: despesaPocket === 'anuncios' ? Math.max(0, prev.anuncios - val) : prev.anuncios,
      lucro: despesaPocket !== 'anuncios' ? Math.max(0, prev.lucro - val) : prev.lucro,
      saldoMpesa: despesaCarteira === 'M-Pesa' ? Math.max(0, prev.saldoMpesa - val) : prev.saldoMpesa,
      saldoEmola: despesaCarteira === 'e-Mola' ? Math.max(0, prev.saldoEmola - val) : prev.saldoEmola
    }));

    setIsDespesaModalOpen(false);
    triggerToast(
      'Despesa Registada! 📉',
      `-${val} MT deduzido com sucesso do Pocket ${despesaPocket.toUpperCase()} e da carteira ${despesaCarteira}.`,
      'expense'
    );
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register(authEmail, authPassword, authNome);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar. Verifica os dados.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await loginGoogle();
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar com Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const totalFaturamento = simVendas.reduce((acc, v) => acc + v.valor, 0);
  const totalLucro = simVendas.reduce((acc, v) => acc + v.lucroLiquido, 0);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Background ambient light gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[550px] h-[550px] bg-teal-500/8 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      {/* Dynamic Feedback Toast */}
      {showFeedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm w-full">
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 ${
            showFeedbackToast.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-500/20' 
              : 'bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-500/20'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${showFeedbackToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {showFeedbackToast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <h5 className="font-bold text-sm text-white">{showFeedbackToast.title}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{showFeedbackToast.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <img src={dropflowLogo} alt="DroopFlow Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5 font-display">
                DroopFlow
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollTo('simulador')} className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Simulador
            </button>
            <button onClick={() => scrollTo('sistema-real')} className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-400" /> O Sistema Real (Prints)
            </button>
            <button onClick={() => scrollTo('diferenciais')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Recursos
            </button>
            <button onClick={() => scrollTo('precos')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Planos & Preço
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              FAQ
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {paywallUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="truncate max-w-[130px]">{paywallUser.nome || 'Lojista'}</span>
                </div>
                {onCheckPayment && (
                  <button
                    onClick={handleVerifyPayment}
                    disabled={checkingPayment}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${checkingPayment ? 'animate-spin' : ''}`} />
                    <span>{checkingPayment ? 'A verificar...' : 'Verificar Pagamento'}</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-xs font-bold text-slate-400 hover:text-rose-400 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Sair
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                Entrar
              </button>
            )}

            <a 
              href={`https://checkout.escalepay.com/9729350${paywallUser?.email ? `?email=${encodeURIComponent(paywallUser.email)}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>Assinar Pro (297 MT)</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </nav>

      {/* Paywall Banner for authenticated users needing subscription */}
      {paywallUser && (
        <div className="bg-gradient-to-r from-emerald-950/95 via-slate-900 to-amber-950/85 border-b border-emerald-500/30 p-4 sticky top-16 z-30 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-white">
                    Assinatura Pendente: {paywallUser.nome || 'Lojista'}
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30 font-bold">
                    🔒 Dados 100% Salvos na App
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conta conectada com sucesso ({paywallUser.email}). Para liberar o painel do DroopFlow, conclui o pagamento do plano Pro no EscalePay.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <a
                href={`https://checkout.escalepay.com/9729350${paywallUser.email ? `?email=${encodeURIComponent(paywallUser.email)}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Pagar no EscalePay (297 MT)</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
              {onCheckPayment && (
                <button
                  onClick={handleVerifyPayment}
                  disabled={checkingPayment}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${checkingPayment ? 'animate-spin' : ''}`} />
                  <span>{checkingPayment ? 'A verificar...' : 'Já Paguei'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXCLUSIVO PARA QUEM VENDE NA SHOPIFY, NO WHATSAPP OU DROP NACIONAL EM MOÇAMBIQUE</span>
        </div>

        {/* Powerful Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.12] mb-6 text-white font-display">
          Podes faturar maning, mas no final paras, olhas e <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
            não vês onde foi o dinheiro?
          </span>
        </h1>

        {/* Direct Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Fazer tudo de cabeça e só olhar faturamento bruto é o caminho mais rápido para quebrar. Sem planilhas que bugam e sem cálculos manuais, o <strong>DroopFlow</strong> calcula o teu Lucro Líquido Real, separa as caixinhas de Fornecedor, Estafeta e Anúncios, e protege o teu bolso contra o tio Zuck.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <a 
            href={`https://checkout.escalepay.com/9729350${paywallUser?.email ? `?email=${encodeURIComponent(paywallUser.email)}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Garantir Acesso Pro Instantâneo</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>
          
          <button 
            onClick={() => scrollTo('simulador')}
            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm sm:text-base px-7 py-4 rounded-2xl border border-slate-700/60 transition-all flex items-center justify-center gap-2 hover:border-slate-500 cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Ver Demonstração Interativa</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-white/5 text-xs text-slate-400 font-medium">
          <div className="flex items-center justify-center gap-2 py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>M-Pesa & e-Mola 100% Integrados</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cálculo de ROAS e Lucro Real</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pockets de Reposição Blindados</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PWA: Funciona Offline e no Celular</span>
          </div>
        </div>

        {/* Hero Visual Mockup: Real App Screenshot */}
        <div className="mt-14 max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-medium">painel.droopflow.com • Visão em Tempo Real</span>
              <div className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sincronizado
              </div>
            </div>
            <img 
              src="/assets/screenshots/painel-dashboard.webp" 
              alt="DroopFlow Painel de Controlo Real" 
              className="w-full h-auto object-cover" 
            />
          </div>
        </div>
      </section>

      {/* ================= SIMULADOR INTERATIVO GAMIFICADO ================= */}
      <section id="simulador" className="py-20 bg-slate-950/60 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider block mb-2">
              EXPERIMENTAÇÃO EM TEMPO REAL
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 font-display">
              Toque no simulador e veja o DroopFlow em ação
            </h2>
            <p className="text-sm text-slate-300">
              Diferente de fotos estáticas, abaixo podes simular adicionar uma venda real ou registar uma saída e ver como o dinheiro se auto-divide na hora.
            </p>
          </div>

          {/* Interactive Playground Box */}
          <div className="bg-[#0b1320] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header Tabs & Quick Actions */}
            <div className="bg-slate-900/90 border-b border-white/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setSimTab('painel')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    simTab === 'painel' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Painel & Lucro Real</span>
                </button>
                <button
                  onClick={() => setSimTab('pockets')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    simTab === 'pockets' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rateio em Pockets</span>
                </button>
                <button
                  onClick={() => setSimTab('metas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    simTab === 'metas' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Metas & Objetivos</span>
                </button>
                <button
                  onClick={() => setSimTab('vendas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    simTab === 'vendas' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Vendas ({simVendas.length})</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => setIsVendaModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Simular Venda</span>
                </button>
                <button
                  onClick={() => setIsDespesaModalOpen(true)}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Simular Saída</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: PAINEL & LUCRO REAL */}
            {simTab === 'painel' && (
              <div className="p-6 space-y-6 animate-fade-in">
                
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Faturamento */}
                  <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">FATURAMENTO TOTAL</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {totalFaturamento.toLocaleString()} <span className="text-xs text-emerald-400 font-sans">MT</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium block mt-1">
                      {simVendas.length} pedidos confirmados
                    </span>
                  </div>

                  {/* Lucro Líquido Real */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-emerald-400">LUCRO LÍQUIDO REAL</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVRE</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-300 font-mono">
                      {totalLucro.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-sans">MT</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium block mt-1">
                      Descontado produto, anúncios e estafetas
                    </span>
                  </div>

                  {/* Carteiras M-Pesa & e-Mola */}
                  <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">SALDO M-PESA & E-MOLA</span>
                    <div className="text-xl font-black text-white font-mono">
                      {(pockets.saldoMpesa + pockets.saldoEmola).toLocaleString()} <span className="text-xs text-slate-400 font-sans">MT</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>M-Pesa: <strong>{pockets.saldoMpesa.toLocaleString()} MT</strong></span>
                      <span>•</span>
                      <span>e-Mola: <strong>{pockets.saldoEmola.toLocaleString()} MT</strong></span>
                    </div>
                  </div>

                  {/* Protegido para Fornecedor */}
                  <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-amber-400 block mb-1">REPOSIÇÃO BLINDADA</span>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      {pockets.fornecedor.toLocaleString()} <span className="text-xs font-sans">MT</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      Dinheiro intocável para novos lotes
                    </span>
                  </div>
                </div>

                {/* Breakdown de Onde Foi Cada Metical */}
                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      Raio-X: Onde Foi Cada Metical do Faturamento
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">Taxa de Conversão 100%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">1. Custo Produtos (COGS)</span>
                      <span className="text-sm font-bold text-white font-mono">{pockets.fornecedor.toLocaleString()} MT</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-400 h-full w-[24%]" />
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">2. Entregas & Estafetas</span>
                      <span className="text-sm font-bold text-white font-mono">{pockets.delivery.toLocaleString()} MT</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-400 h-full w-[20%]" />
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">3. Anúncios (Facebook / IG)</span>
                      <span className="text-sm font-bold text-white font-mono">{pockets.anuncios.toLocaleString()} MT</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-sky-400 h-full w-[28%]" />
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-emerald-400 block">4. Lucro Líquido Real</span>
                      <span className="text-sm font-bold text-emerald-300 font-mono">{totalLucro.toLocaleString()} MT</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[28%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: RATEIO EM POCKETS */}
            {simTab === 'pockets' && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">Caixinhas Financeiras com Rateio Inteligente</h4>
                  <span className="text-xs text-emerald-400 font-mono font-bold">100% Protegidas</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-white">Pocket Fornecedor (COGS)</h5>
                        <p className="text-xs text-slate-400">Garante reposição imediata de lotes de 100 unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-300 font-mono">{pockets.fornecedor.toLocaleString()} MT</span>
                      <span className="text-[10px] block text-emerald-400 font-bold">🔒 Não Mexer</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-white">Pocket Anúncios (Facebook / Google Ads)</h5>
                        <p className="text-xs text-slate-400">Verba acumulada para escalar campanhas no Facebook Ads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-sky-300 font-mono">{pockets.anuncios.toLocaleString()} MT</span>
                      <span className="text-[10px] block text-slate-400">Auto-alimentado</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-white">Pocket Delivery & Motoboys</h5>
                        <p className="text-xs text-slate-400">Maputo, Matola, Beira e Nampula reservados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-indigo-300 font-mono">{pockets.delivery.toLocaleString()} MT</span>
                      <span className="text-[10px] block text-emerald-400 font-bold">🔒 Blindado</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-emerald-300">Pocket Lucro Líquido Real</h5>
                        <p className="text-xs text-slate-300">O dinheiro livre para colocares no bolso sem quebrar o caixa</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-300 font-mono">{pockets.lucro.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT</span>
                      <span className="text-[10px] block text-emerald-400 font-bold">Disponível</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: METAS FINANCEIRAS */}
            {simTab === 'metas' && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Metas Financeiras Gamificadas
                  </h4>
                  <span className="text-xs text-slate-400">Alocação Automática por Venda</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Meta Diária */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Meta Diária
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full font-mono">
                        65% Batida
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      {pockets.metaDiaria.toLocaleString()} <span className="text-xs text-slate-400 font-sans">/ 1.000 MT</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[65%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Cada venda reserva 50 MT para completar o dia.</p>
                  </div>

                  {/* Meta Semanal */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" /> Meta Semanal
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full font-mono">
                        49% Batida
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      {pockets.metaSemanal.toLocaleString()} <span className="text-xs text-slate-400 font-sans">/ 5.000 MT</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full w-[49%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Reserva 100 MT por pedido para bater os custos da semana.</p>
                  </div>

                  {/* Meta Mensal */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" /> Meta Mensal
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">
                        44% Batida
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      {pockets.metaMensal.toLocaleString()} <span className="text-xs text-slate-400 font-sans">/ 20.000 MT</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[44%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Alocação direta de lucro retido para atingir a independência.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: VENDAS SIMULADAS */}
            {simTab === 'vendas' && (
              <div className="p-6 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">Extrato de Vendas com Distribuição Automática</h4>
                  <span className="text-xs text-slate-400">Total: {simVendas.length} pedidos</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-mono">
                        <th className="pb-2.5">PRODUTO</th>
                        <th className="pb-2.5">PAGAMENTO</th>
                        <th className="pb-2.5">ZONA</th>
                        <th className="pb-2.5">VALOR</th>
                        <th className="pb-2.5">RATEIO AUTOMÁTICO</th>
                        <th className="pb-2.5">LUCRO REAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {simVendas.map((v) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-medium text-white">{v.produto}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.metodo === 'M-Pesa' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {v.metodo}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300">{v.zona}</td>
                          <td className="py-3 font-mono font-bold text-white">{v.valor} MT</td>
                          <td className="py-3 text-[11px] text-slate-400 font-mono">
                            <span className="text-amber-400">Prod: {v.custoProduto}</span> • <span className="text-indigo-400">Entr: {v.frete}</span> • <span className="text-sky-400">Ads: {v.anuncios}</span>
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-400">+{v.lucroLiquido} MT</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= SHOWCASE DO SISTEMA REAL (PRINTS DOS MÓDULOS) ================= */}
      <section id="sistema-real" className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider block mb-2">
            TRANSPARÊNCIA TOTAL • FOTOS REAIS DO APP
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 font-display">
            Conheça por dentro o sistema que vai salvar a sua loja
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Nada de promessas no ar ou maquetes conceituais. Abaixo estão as telas reais do DroopFlow operando em lojas reais no dia a dia.
          </p>
        </div>

        {/* 1. O Raio-X do Dinheiro (Detalhamento de Lucro Real) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> O Recurso Mais Amado
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Detalhamento Financeiro: Onde Foi Cada Metical
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Descubra em segundos para onde está indo o teu faturamento. O modal de Lucro Líquido Real calcula exatamente:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>1. Custo dos Produtos (COGS):</strong> Reposição de estoque com fornecedores locais.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>2. Entregas & Estafetas:</strong> Valores separados para motoboys e entregas.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>3. Anúncios & Tráfego Pago:</strong> Gastos sincronizados com campanhas no Facebook Ads.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>4. Despesas Operacionais:</strong> Softwares (Claude, CapCut), internet e embalagens.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-emerald-500/40 transition-all">
              <img 
                src="/assets/screenshots/detalhamento-lucro-real.webp" 
                alt="Detalhamento Financeiro e Lucro Líquido Real" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* 2. Gestão de Pockets e Caixinhas com Travas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-emerald-500/40 transition-all">
              <img 
                src="/assets/screenshots/gestao-pockets.webp" 
                alt="Gestão de Pockets e Caixinhas DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Blindagem de Caixa
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Pockets: O Dinheiro do Fornecedor Não Se Toca
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              O maior erro de quem vende online é gastar o dinheiro que deveria ser para pagar o fornecedor ou a entrega do cliente. No DroopFlow, cada venda divide os valores em caixinhas isoladas:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Caixinha de Renda, Wifi e Custos da Casa.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pocket Anúncios para reinvestimento contínuo.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Controle de saldo negativo caso precises adiantar despesas.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Campanhas de Anúncios & ROAS Real */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
              <Megaphone className="w-3.5 h-3.5" /> Otimização de Tráfego
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Campanhas de Anúncios com ROAS Real e CPA Médio
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analisa o orçamento diário, gastos realizados e retorno em vendas das tuas campanhas de Facebook Ads e tráfego pago.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Cálculo automático de ROAS Geral (ex: 39.23x).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Acompanhamento por criativo UGC ou campanha específica.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Identifica na hora quais anúncios dão lucro e quais dão prejuízo.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-sky-500/40 transition-all">
              <img 
                src="/assets/screenshots/campanhas-roas.webp" 
                alt="Campanhas de Anúncios e ROAS DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4. Produtos, Margens Brutas & Fornecedores */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-emerald-500/40 transition-all">
              <img 
                src="/assets/screenshots/produtos-margens.webp" 
                alt="Lista de Produtos e Margens Brutas DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
              <Package className="w-3.5 h-3.5" /> Gestão de Catálogo
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Catálogo de Produtos, Lotes de Reposição & Margens
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tem o controle total de cada produto vendido na tua loja, do estoque restante até o fornecedor responsável:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Cálculo automático de margem bruta (83%, 89%, 75%).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Controle de lote de reposição (ex: 100 unidades por compra).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Vinculação direta com fornecedores (Refine, Raju, Droopstore).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Registo Inteligente de Venda com Alocação para Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Plus className="w-3.5 h-3.5" /> Entrada Rápida de Pedidos
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Registo Inteligente de Venda com Alocação para Metas
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cada venda no DroopFlow faz muito mais do que somar faturamento. No momento do registo:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Escolhe o método de recebimento (M-Pesa ou e-Mola) e a zona com motoboy.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Alocar para Meta:</strong> Reserva na hora uma fatia do pedido para a Meta Diária, Semanal ou Mensal.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resumo visual imediato de quanto foi para o Fornecedor e quanto sobrou de Lucro Limpo.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-emerald-500/40 transition-all">
              <img 
                src="/assets/screenshots/modal-registar-venda.webp" 
                alt="Registo Inteligente de Venda DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* 6. Saldos Unificados de Carteiras (M-Pesa, e-Mola e Bancos) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-teal-500/40 transition-all">
              <img 
                src="/assets/screenshots/saldos-carteiras-bancos.webp" 
                alt="Saldos de Carteiras e Bancos DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/20">
              <Wallet className="w-3.5 h-3.5" /> Conexão Financeira Real
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Visão Unificada de Carteiras: M-Pesa, e-Mola e BIM
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Chega de abrir 3 aplicativos diferentes no telemóvel para saber quanto dinheiro realmente tens.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Saldo combinado de todas as tuas contas em tempo real.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Visão individual por carteira (M-Pesa 1, M-Pesa 2, e-Mola, BIM).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Ajuste ou consulta sem alterar o teu faturamento histórico de vendas.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 7. Gestão de Saídas Operacionais & Ferramentas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
              <ArrowDownRight className="w-3.5 h-3.5" /> Controle de Custos
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Gestão de Saídas Operacionais com Estorno Automático
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tem o registo minucioso de onde o dinheiro da empresa está saindo, com categorização completa:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Controle de assinaturas de IA e ferramentas (Claude, ElevenLabs, CapCut).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Dedução precisa da caixinha (Pocket) e carteira móvel correspondente.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Estorno com 1 clique se a compra for cancelada ou digitada com erro.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl hover:border-rose-500/40 transition-all">
              <img 
                src="/assets/screenshots/lista-saidas-despesas.webp" 
                alt="Lista de Saídas e Despesas DroopFlow" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

      </section>

      {/* ================= DIFERENCIAIS SECTION ================= */}
      <section id="diferenciais" className="py-20 bg-slate-950/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider block mb-2">
              FEITO PARA QUEM VENDE DE VERDADE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-display">
              Porque o DroopFlow é diferente de tudo o que já usou
            </h2>
            <p className="text-sm text-slate-300">
              Construído a pensar especificamente na realidade de quem opera e-commerce e drop nacional em Moçambique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Metas Pessoais com Alocação Direta</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Define metas diárias, semanais e mensais. A cada nova venda registada, podes escolher transferir uma fatia pré-estabelecida direto para a tua meta.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Gestão de Saídas com Estorno</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gastou errado ou a compra foi cancelada? Ao excluir uma saída no DroopFlow, o valor é estornado automaticamente para a caixinha correspondente.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Modo Foco e Privacidade</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vai trabalhar num café ou em público? Ativa o Modo Foco com um clique para ocultar saldos sensíveis e faturamento de curiosos ao teu redor.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">100% Offline-First (PWA)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ficou sem internet ou com rede fraca? O DroopFlow grava tudo no teu telemóvel via IndexedDB e sincroniza quando a conexão voltar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Taxas Reais M-Pesa e e-Mola</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                O aplicativo desconta automaticamente as taxas reais de saque e transferência de acordo com as tabelas oficiais locais.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Zero Perda de Dados</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Podes criar conta, exportar backups em JSON ou CSV para o Excel e renovar quando quiseres sem nunca perder uma única venda anotada.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION (LIMPO E SEM CONFUSÃO) ================= */}
      <section id="precos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider block mb-2">
            PREÇO SIMPLES E TRANSPARENTE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 font-display">
            Menos que o lucro de uma única encomenda por mês
          </h2>
          <p className="text-base text-slate-300">
            Acesso completo a todas as ferramentas, sem planos escondidos e sem taxas adicionais.
          </p>
        </div>

        {/* The Cleaned Pro Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative group">
            
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
            
            <div className="relative bg-[#0d1522] border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-10 text-left shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">ASSINATURA MENSAL</span>
                  <h3 className="text-2xl font-black text-white font-display">DroopFlow Pro</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                  MAIS POPULAR
                </span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-2 pt-2 border-b border-white/5 pb-6">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono">297</span>
                <span className="text-emerald-400 font-black text-xl">MT</span>
                <span className="text-slate-400 text-sm">/ mês</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Caixinhas (Pockets) ilimitadas com Rateio Automático</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Gestão Completa de Carteiras Móveis (M-Pesa & e-Mola)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Cálculo Preciso de Lucro Líquido Real & Custos Locais</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Acompanhamento de Campanhas Facebook Ads & ROAS</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Controle de Fornecedores e Reposição de Estoque</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Metas Financeiras Pessoais (Diárias, Semanais e Mensais)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Gestão de Saídas e Despesas com Estorno Seguro</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Modo Foco e Privacidade com 1 Clique</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Sincronização Nuvem + Funcionamento 100% Offline</span>
                </li>
              </ul>

              {/* SINGLE UNIFIED PRIMARY ACTION BUTTON */}
              <div className="pt-4 space-y-3">
                <a 
                  href={`https://checkout.escalepay.com/9729350${paywallUser?.email ? `?email=${encodeURIComponent(paywallUser.email)}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <span>GARANTIR ACESSO PRO INSTANTÂNEO 🚀</span>
                </a>

                {/* Subtle login text for existing users */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Já realizaste o pagamento ou já tens conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Clica aqui para entrar
                    </button>
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pagamento 100% Seguro via EscalePay • Ativação Imediata</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="py-20 bg-slate-950/40 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-display">
              Perguntas Frequentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Tudo o que precisas de saber sobre o DroopFlow e o acesso à plataforma.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Como funciona o pagamento via EscalePay e a liberação?",
                a: "O pagamento é processado com total segurança através da EscalePay (cartão ou carteira móvel). Assim que o pagamento de 297 MT for aprovado, o teu e-mail é ativado na hora e tens acesso irrestrito ao DroopFlow Pro."
              },
              {
                q: "Devo criar a conta antes ou depois de fazer o pagamento?",
                a: "Podes fazer como preferires! Se pagares primeiro no EscalePay com o teu e-mail, quando criares a conta o teu Pro já estará liberado. Se criares a conta primeiro no app, podes clicar no botão do EscalePay para pagar e todos os teus dados ficam 100% salvos."
              },
              {
                q: "O que acontece se a assinatura expirar?",
                a: "Ao expirar o período contratado, o sistema apenas pausa o acesso ao painel principal e apresenta a tela de renovação. Nenhum dado teu é apagado ou perdido (produtos, vendas, caixinhas e configurações ficam 100% preservados)."
              },
              {
                q: "O DroopFlow funciona sem internet?",
                a: "Sim! O DroopFlow foi desenvolvido como um PWA offline-first. Podes registrar vendas na rua, no armazém ou sem rede que ele salva localmente no teu dispositivo e sincroniza com a nuvem quando a conexão retornar."
              },
              {
                q: "O que são as Caixinhas (Pockets) e porque elas me impedem de quebrar?",
                a: "Diferente de planilhas onde o dinheiro parece um bolo só, o DroopFlow separa automaticamente cada Metical que entra: a parte do fornecedor vai para a caixinha de reposição, a taxa do estafeta para o delivery, os anúncios para reinvestimento e só o que sobra de verdade é o teu lucro líquido."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-sm text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <img src={dropflowLogo} alt="Logo" className="w-4 h-4 object-contain" />
          </div>
          <span className="font-bold text-slate-300">DroopFlow Moçambique</span>
        </div>
        <p className="max-w-md mx-auto px-4">
          O sistema financeiro de ponta a ponta projetado exclusivamente para lojistas de e-commerce e drop nacional.
        </p>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} DroopFlow. Todos os direitos reservados.
        </p>
      </footer>

      {/* ================= MODAL DE REGISTO DE VENDA (SIMULADOR) ================= */}
      {isVendaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1726] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-white">Registar Nova Venda</h3>
              </div>
              <button 
                onClick={() => setIsVendaModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimularVenda} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Valor Recebido (Total Pago em MT)</label>
                <input
                  type="number"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-base focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Produto Vendido</label>
                <select
                  value={formProd}
                  onChange={(e) => {
                    setFormProd(e.target.value);
                    if (e.target.value.includes('máquina')) setFormCustoProd('110');
                    else if (e.target.value.includes('Fixador')) setFormCustoProd('120');
                    else setFormCustoProd('180');
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none"
                >
                  <option value="Suporte para máquina de lavar">Suporte para máquina de lavar (Custo: 110 MT)</option>
                  <option value="Kit (4) Fixador autoadesivo">Kit (4) Fixador autoadesivo (Custo: 120 MT)</option>
                  <option value="Veda portas premium beira">Veda portas premium beira (Custo: 180 MT)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Pagamento</label>
                  <select
                    value={formMetodo}
                    onChange={(e: any) => setFormMetodo(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Zona de Entrega</label>
                  <select
                    value={formZona}
                    onChange={(e) => setFormZona(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Maputo Cidade">Maputo Cidade</option>
                    <option value="Matola Rio">Matola Rio</option>
                    <option value="Beira / Sofala">Beira / Sofala</option>
                    <option value="Nampula">Nampula</option>
                  </select>
                </div>
              </div>

              {/* Alocação para Meta Financeira (Exatamente como nos prints reais!) */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                <label className="font-bold text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Alocar para Meta / Objetivo (Opcional)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Gamificação</span>
                </label>
                <select
                  value={formMetaAlvo}
                  onChange={(e: any) => setFormMetaAlvo(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="nenhuma">Não transferir para nenhuma meta</option>
                  <option value="diaria">🎯 Meta Diária (Foco de hoje)</option>
                  <option value="semanal">📅 Meta Semanal</option>
                  <option value="mensal">🏆 Meta Mensal de Lucro</option>
                </select>
                {formMetaAlvo !== 'nenhuma' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-400">Valor a alocar:</span>
                    <input
                      type="number"
                      value={formValorMeta}
                      onChange={(e) => setFormValorMeta(e.target.value)}
                      className="w-24 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-mono">MT</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-emerald-400 block">Resumo do Rateio Imediato:</span>
                <p>• Resgate Fornecedor: <strong>+{formCustoProd} MT</strong> (intocável)</p>
                <p>• Estafeta / Delivery: <strong>+150 MT</strong></p>
                <p>• Pocket Anúncios: <strong>+150 MT</strong></p>
                <p>• Lucro Líquido Livre: <strong>+{(parseFloat(formValor) || 0) - (parseFloat(formCustoProd) || 0) - 300 - (formMetaAlvo !== 'nenhuma' ? (parseFloat(formValorMeta) || 0) : 0)} MT</strong></p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Gravar Venda no Simulador</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE REGISTO DE SAÍDA (SIMULADOR) ================= */}
      {isDespesaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1726] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-white">Registar Saída / Despesa</h3>
              </div>
              <button 
                onClick={() => setIsDespesaModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimularDespesa} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Valor da Despesa (MT)</label>
                <input
                  type="number"
                  value={despesaValor}
                  onChange={(e) => setDespesaValor(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-base focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Pagar com dinheiro de qual Pocket?</label>
                <select
                  value={despesaPocket}
                  onChange={(e: any) => setDespesaPocket(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none"
                >
                  <option value="anuncios">Anúncios (Facebook Ads / Google Ads)</option>
                  <option value="renda">Renda & Escritório</option>
                  <option value="wifi">Wifi & Comunicações</option>
                  <option value="comida">Comida & Diárias</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Carteira Debitada</label>
                  <select
                    value={despesaCarteira}
                    onChange={(e: any) => setDespesaCarteira(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={despesaDesc}
                    onChange={(e) => setDespesaDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Dedução Imediata no Simulador</span>
                <ArrowDownRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL AUTH (LOGIN / REGISTER) ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1726] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl relative">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white font-display">
                {authMode === 'login' ? 'Entrar no DroopFlow' : 'Criar Nova Conta'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'login' 
                  ? 'Acede ao teu painel financeiro e dados salvos.' 
                  : 'Cria a tua conta para começar a organizar as tuas vendas.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">O Teu Nome / Loja</label>
                  <input
                    type="text"
                    required
                    value={authNome}
                    onChange={(e) => setAuthNome(e.target.value)}
                    placeholder="Ex: Sam Outlier"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="teu-email@exemplo.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Palavra-passe</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <span>{authLoading ? 'A processar...' : authMode === 'login' ? 'Entrar na Conta' : 'Criar Conta'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold uppercase">ou</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {authMode === 'login' 
                  ? 'Ainda não tens conta? Clica para criar' 
                  : 'Já tens conta? Clica para entrar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
