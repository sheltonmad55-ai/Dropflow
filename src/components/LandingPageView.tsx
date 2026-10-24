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
  Eye
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

  // ================= SIMULATOR STATE =================
  const [simTab, setSimTab] = useState<'painel' | 'roi' | 'pockets' | 'vendas'>('painel');
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initial simulated sales
  const [simVendas, setSimVendas] = useState([
    {
      id: 'v101',
      data: '2026-07-16',
      produto: 'Compressor de Ar Digital Portátil',
      metodo: 'M-Pesa',
      zona: 'Maputo Cidade',
      valor: 1850,
      custoProduto: 450,
      frete: 150,
      taxaMpesa: 46,
      lucroLiquido: 602,
      anuncios: 602,
      status: 'Entregue'
    },
    {
      id: 'v102',
      data: '2026-07-16',
      produto: 'Organizador Giratório 360°',
      metodo: 'e-Mola',
      zona: 'Matola',
      valor: 1200,
      custoProduto: 300,
      frete: 250,
      taxaMpesa: 30,
      lucroLiquido: 310,
      anuncios: 310,
      status: 'Entregue'
    },
    {
      id: 'v103',
      data: '2026-07-15',
      produto: 'Kit Ferramentas Automotivo 46 Peças',
      metodo: 'M-Pesa',
      zona: 'Beira / Sofala',
      valor: 2450,
      custoProduto: 700,
      frete: 350,
      taxaMpesa: 61,
      lucroLiquido: 669.5,
      anuncios: 669.5,
      status: 'Entregue'
    }
  ]);

  // Simulator Form States
  const [formProd, setFormProd] = useState('Compressor de Ar Digital Portátil');
  const [formValor, setFormValor] = useState('1850');
  const [formMetodo, setFormMetodo] = useState<'M-Pesa' | 'e-Mola' | 'Dinheiro'>('M-Pesa');
  const [formZona, setFormZona] = useState('Maputo Cidade');

  // Simulator Despesa Form States
  const [despesaDesc, setDespesaDesc] = useState('');
  const [despesaValor, setDespesaValor] = useState('500');
  const [despesaPocket, setDespesaPocket] = useState('anuncios');

  // Simulated Pockets (Caixinhas)
  const initialLucro = simVendas.reduce((acc, v) => acc + v.lucroLiquido, 0);
  const initialAds = simVendas.reduce((acc, v) => acc + v.anuncios, 0);
  const initialFornecedor = simVendas.reduce((acc, v) => acc + v.custoProduto, 0);
  const initialFrete = simVendas.reduce((acc, v) => acc + v.frete, 0);

  const [pockets, setPockets] = useState({
    lucro: initialLucro,
    anuncios: initialAds,
    fornecedor: initialFornecedor,
    entregas: initialFrete,
    reserva: 1250
  });

  // Calculate totals
  const totalFaturado = simVendas.reduce((acc, v) => acc + v.valor, 0);
  const totalLucro = pockets.lucro;
  const totalVendas = simVendas.length;
  const ticketMedio = totalVendas > 0 ? Math.round(totalFaturado / totalVendas) : 0;

  // Add simulated sale
  const handleSimularVenda = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formValor) || 1850;
    const custoProd = Math.round(val * 0.25);
    const taxa = Math.round(val * 0.025);
    let frete = 150;
    if (formZona === 'Matola') frete = 250;
    if (formZona === 'Beira / Sofala') frete = 350;
    if (formZona === 'Nampula') frete = 400;

    const sobra = Math.max(0, val - custoProd - frete - taxa);
    const metadeLucro = Math.round((sobra / 2) * 100) / 100;
    const metadeAds = Math.round((sobra / 2) * 100) / 100;

    const novaVenda = {
      id: `v${Date.now().toString().slice(-4)}`,
      data: new Date().toISOString().split('T')[0],
      produto: formProd,
      metodo: formMetodo,
      zona: formZona,
      valor: val,
      custoProduto: custoProd,
      frete,
      taxaMpesa: taxa,
      lucroLiquido: metadeLucro,
      anuncios: metadeAds,
      status: 'Entregue'
    };

    setSimVendas(prev => [novaVenda, ...prev]);
    setPockets(prev => ({
      ...prev,
      lucro: prev.lucro + metadeLucro,
      anuncios: prev.anuncios + metadeAds,
      fornecedor: prev.fornecedor + custoProd,
      entregas: prev.entregas + frete
    }));

    setIsVendaModalOpen(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  // Add simulated expense
  const handleSimularDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(despesaValor) || 0;
    if (val <= 0) return;

    setPockets(prev => ({
      ...prev,
      [despesaPocket]: Math.max(0, (prev as any)[despesaPocket] - val)
    }));

    setIsDespesaModalOpen(false);
  };

  // Handle Auth
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register(authEmail, authPassword, authNome, 'Moçambique', 'MT');
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao processar autenticação.');
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
      setAuthError(err.message || 'Erro ao autenticar com o Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-600/15 via-teal-900/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[500px] bg-emerald-950/20 blur-[160px] pointer-events-none -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-lg shadow-emerald-500/10 bg-slate-900 flex items-center justify-center p-0.5">
              <img src={dropflowLogo} alt="DroopFlow" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <span className="font-display font-black text-xl text-white tracking-tight uppercase flex items-center gap-1">
                Droop<span className="text-emerald-400">Flow</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-500/80 uppercase block">Gestão Moçambique</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollTo('demo')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Demonstração Interativa
            </button>
            <button onClick={() => scrollTo('diferenciais')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Plano & Preço
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Perguntas Frequentes
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {paywallUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="truncate max-w-[140px]">{paywallUser.nome || 'Lojista'}</span>
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
              <>
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all cursor-pointer hidden xs:inline-flex"
                >
                  Criar Conta
                </button>
              </>
            )}
            <a 
              href={`https://checkout.escalepay.com/9729350${paywallUser?.email ? `?email=${encodeURIComponent(paywallUser.email)}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>Assinar Pro (297 MT)</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </nav>

      {/* Paywall Banner for authenticated users needing subscription */}
      {paywallUser && (
        <div className="bg-gradient-to-r from-emerald-950/95 via-slate-900 to-amber-950/85 border-b border-emerald-500/30 p-4 sticky top-20 z-40 backdrop-blur-xl shadow-2xl">
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
                  A tua conta está conectada ({paywallUser.email}). Para liberar o painel do DroopFlow, conclui o pagamento do plano Pro no EscalePay.
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
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-emerald-400 tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXCLUSIVO PARA QUEM VENDE NA SHOPIFY, NO WHATSAPP OU DROP NACIONAL</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05] uppercase">
            Podes faturar maning, mas no final paras, olhas e <br className="hidden sm:inline" />
            <span className="text-emerald-400 italic">não vês onde foi o dinheiro?</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-400 font-normal leading-relaxed max-w-3xl mx-auto">
            Fazer tudo de cabeça e só controlar faturamento é o caminho mais rápido para quebrar. Se vendes na{' '}
            <strong className="text-white">Shopify</strong>, tens operação de{' '}
            <strong className="text-white">drop nacional</strong> ou fechas encomendas diretamente{' '}
            <strong className="text-white">no WhatsApp</strong>, para de vacilar! Sem planilhas ou sistemas reais, tu confundes faturamento bruto com lucro, gastas o que não deves, e acabas apenas{' '}
            <span className="text-emerald-400 font-semibold">devolvendo o teu dinheiro para o tio Zuck</span> sem meter nenhum lucro de verdade no bolso.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
          <a
            href="https://checkout.escalepay.com/9729350"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base sm:text-lg px-8 sm:px-10 py-4.5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
          >
            <span>Começar a Lucrar de Verdade</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </a>
          <button
            onClick={() => scrollTo('demo')}
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-4.5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-emerald-400" />
            <span>Ver Demonstração Interativa</span>
          </button>
        </div>

        {/* Alternative account creation notice */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <span>Prefere criar a sua conta antes do pagamento?</span>
          <button
            onClick={() => {
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Criar Conta Manualmente</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-12 text-slate-400 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>INTEGRAÇÃO EXPRESS SHOPIFY</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CÁLCULO AUTOMÁTICO DE ROI POR CAMPANHA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RATEIO EM POCKETS (CAIXINHAS PROTEGIDAS)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CONEXÃO SEGURA M-PESA & E-MOLA</span>
          </div>
        </div>
      </section>

      {/* ================= GAMIFIED INTERACTIVE DEMO ================= */}
      <section id="demo" className="py-16 bg-white/[0.015] border-t border-b border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              EXPERIMENTAÇÃO EM TEMPO REAL
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
              Toque no painel e veja o DroopFlow em ação
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Diferente de capturas estáticas, abaixo você tem o nosso <b>aplicativo simulado de ponta a ponta</b>. Clique nas guias (Painel Geral, ROI, Pockets, Vendas), teste o <b>simulador de venda real</b> e o <b>simulador de saída</b>, e veja os cofres e cálculos atualizarem instantaneamente!
            </p>

            {/* Warning Banner */}
            <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl text-amber-400 text-xs text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <b>Nota:</b> Esta é uma simulação interativa. Na aplicação completa do DroopFlow você tem armazenamento em nuvem, funcionamento 100% offline com sincronização automática, multi-contas bancárias (M-Pesa, e-Mola, BIM) e exportação em Excel/PDF.
              </span>
            </div>
          </div>

          {/* SIMULATOR CONTAINER */}
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Simulator Header Bar */}
            <div className="bg-[#0b0e14] border-b border-white/5 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-slate-950 font-bold" />
                </div>
                <div>
                  <span className="font-display font-bold text-base text-white tracking-tight uppercase">
                    Droop<span className="text-emerald-400">Flow</span>
                  </span>
                  <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20 font-bold">
                    DEMO INTERATIVA
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-slate-300">Moeda: MT (Metical)</span>
                </div>

                {/* Quick Add Buttons */}
                <button
                  onClick={() => setIsVendaModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Adicionar Venda</span>
                </button>
                <button
                  onClick={() => setIsDespesaModalOpen(true)}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Registar Saída</span>
                </button>
              </div>
            </div>

            {/* Simulator Body */}
            <div className="flex flex-col lg:flex-row min-h-[580px]">
              
              {/* Simulator Sidebar */}
              <div className="w-full lg:w-60 bg-[#090b10] border-r border-white/5 p-4 flex flex-col justify-between gap-6 shrink-0">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2">Painel de Demonstração</span>
                  <nav className="space-y-1">
                    {[
                      { id: 'painel', label: 'Painel Geral', icon: TrendingUp },
                      { id: 'roi', label: 'Retorno Real & ROI', icon: BarChart2 },
                      { id: 'pockets', label: 'Pockets & Caixinhas', icon: Layers },
                      { id: 'vendas', label: 'Lista de Vendas', icon: DollarSign }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const active = simTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSimTab(tab.id as any)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                            active 
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Call to action at bottom of sidebar */}
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-3.5 text-center space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Gostou da Demonstração?</span>
                  <p className="text-[11px] text-slate-300">Desbloqueie o sistema completo com todas as tuas contas reais.</p>
                  <a
                    href="https://checkout.escalepay.com/9729350"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 rounded-xl transition-colors text-center"
                  >
                    Ativar por 297 MT
                  </a>
                </div>
              </div>

              {/* Simulator Content Area */}
              <div className="flex-1 bg-[#07090e] p-5 sm:p-7 overflow-y-auto space-y-6">
                
                {/* 1. PAINEL GERAL */}
                {simTab === 'painel' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Faturamento Total</span>
                        <span className="text-xl font-black text-white block">{totalFaturado.toLocaleString()} MT</span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {totalVendas} vendas
                        </span>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Lucro Líquido Real</span>
                        <span className="text-xl font-black text-emerald-400 block">{totalLucro.toLocaleString()} MT</span>
                        <span className="text-[10px] text-slate-400 font-medium">Livre para saque pessoal</span>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Caixa de Anúncios</span>
                        <span className="text-xl font-black text-sky-400 block">{pockets.anuncios.toLocaleString()} MT</span>
                        <span className="text-[10px] text-slate-400 font-medium">Tráfego reservado</span>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Ticket Médio</span>
                        <span className="text-xl font-black text-amber-400 block">{ticketMedio.toLocaleString()} MT</span>
                        <span className="text-[10px] text-slate-400 font-medium">Por pedido entregue</span>
                      </div>
                    </div>

                    {/* Pockets Overview Bar */}
                    <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Rateio Automático em Pockets (Cofres)</h3>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          100% Protegido
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                            <span>💰</span> Lucro Pessoal
                          </div>
                          <span className="text-base font-extrabold text-white block">{pockets.lucro.toLocaleString()} MT</span>
                          <span className="text-[9px] text-slate-400">50% da margem limpa</span>
                        </div>

                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
                            <span>📢</span> Anúncios (Ads)
                          </div>
                          <span className="text-base font-extrabold text-white block">{pockets.anuncios.toLocaleString()} MT</span>
                          <span className="text-[9px] text-slate-400">50% da margem limpa</span>
                        </div>

                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                            <span>📦</span> Fornecedores
                          </div>
                          <span className="text-base font-extrabold text-white block">{pockets.fornecedor.toLocaleString()} MT</span>
                          <span className="text-[9px] text-slate-400">Reposição de estoque</span>
                        </div>

                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                            <span>🚚</span> Frete & Entregas
                          </div>
                          <span className="text-base font-extrabold text-white block">{pockets.entregas.toLocaleString()} MT</span>
                          <span className="text-[9px] text-slate-400">Estafetas e envio</span>
                        </div>

                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                            <span>🛡️</span> Reserva Emergência
                          </div>
                          <span className="text-base font-extrabold text-white block">{pockets.reserva.toLocaleString()} MT</span>
                          <span className="text-[9px] text-slate-400">Não mexer</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Sales in Dashboard */}
                    <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Últimas Vendas Simuladas</h3>
                        <button onClick={() => setSimTab('vendas')} className="text-[10px] text-emerald-400 hover:underline font-bold">
                          Ver todas
                        </button>
                      </div>

                      <div className="divide-y divide-white/5">
                        {simVendas.map(v => (
                          <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white block">{v.produto}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{v.metodo} • {v.zona}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-emerald-400 block">+{v.valor.toLocaleString()} MT</span>
                              <span className="text-[10px] text-slate-400">Lucro: +{v.lucroLiquido.toLocaleString()} MT</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. ROI & RETORNO REAL */}
                {simTab === 'roi' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Análise de Lucro Real por Pedido</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No DroopFlow, você não se ilude com faturamento bruto. Veja como cada metical é descontado antes de você gastar:
                      </p>

                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[10px] font-mono uppercase text-slate-500 border-b border-white/5">
                            <tr>
                              <th className="pb-2">Produto</th>
                              <th className="pb-2">Preço Venda</th>
                              <th className="pb-2">Custo Fornec.</th>
                              <th className="pb-2">Frete Local</th>
                              <th className="pb-2">Taxa Carteira</th>
                              <th className="pb-2 text-right">Margem Líquida</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {simVendas.map(v => (
                              <tr key={v.id} className="py-2">
                                <td className="py-2.5 font-bold text-white">{v.produto}</td>
                                <td className="py-2.5 text-slate-300">{v.valor} MT</td>
                                <td className="py-2.5 text-amber-400">-{v.custoProduto} MT</td>
                                <td className="py-2.5 text-purple-400">-{v.frete} MT</td>
                                <td className="py-2.5 text-slate-400">-{v.taxaMpesa} MT</td>
                                <td className="py-2.5 text-right font-black text-emerald-400">
                                  +{(v.lucroLiquido + v.anuncios).toFixed(1)} MT
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. POCKETS DETAIL */}
                {simTab === 'pockets' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Cofre de Lucro Limpo</span>
                          <span className="text-xl font-black text-emerald-400">{pockets.lucro.toLocaleString()} MT</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Este valor é 100% seu. Pode retirar para sua conta bancária sem prejudicar a operação.</p>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Cofre de Anúncios</span>
                          <span className="text-xl font-black text-sky-400">{pockets.anuncios.toLocaleString()} MT</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Orçamento protegido para abastecer o Facebook Ads ou campanhas de WhatsApp.</p>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Reposição a Fornecedor</span>
                          <span className="text-xl font-black text-amber-400">{pockets.fornecedor.toLocaleString()} MT</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Dinheiro sagrado para comprar o próximo lote e nunca ficar sem estoque.</p>
                      </div>

                      <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Custos de Envio & Frete</span>
                          <span className="text-xl font-black text-purple-400">{pockets.entregas.toLocaleString()} MT</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Valor separado para pagar os motoboys e transportadoras locais.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. VENDAS DETAIL */}
                {simTab === 'vendas' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Histórico de Pedidos da Simulação</h3>
                      <button
                        onClick={() => setIsVendaModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        + Nova Venda
                      </button>
                    </div>

                    <div className="bg-[#0e121a] border border-white/5 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] font-mono uppercase text-slate-500 bg-black/20 border-b border-white/5">
                          <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Produto</th>
                            <th className="p-3">Zona</th>
                            <th className="p-3">Pagamento</th>
                            <th className="p-3 text-right">Faturado</th>
                            <th className="p-3 text-right">Lucro Limpo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {simVendas.map(v => (
                            <tr key={v.id} className="hover:bg-white/[0.02]">
                              <td className="p-3 text-slate-400 font-mono">{v.data}</td>
                              <td className="p-3 font-bold text-white">{v.produto}</td>
                              <td className="p-3 text-slate-300">{v.zona}</td>
                              <td className="p-3 font-mono text-emerald-400">{v.metodo}</td>
                              <td className="p-3 text-right font-black text-white">{v.valor} MT</td>
                              <td className="p-3 text-right font-black text-emerald-400">+{v.lucroLiquido} MT</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Confetti Animation Overlay */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-50 animate-fade-in">
                <div className="bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl font-black text-base shadow-2xl flex items-center gap-2 animate-bounce">
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>Venda Registada! Cofres e Lucro Atualizados! 🚀</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ================= MODAL SIMULAR VENDA ================= */}
      {isVendaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Simular Nova Venda</span>
              </h3>
              <button onClick={() => setIsVendaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimularVenda} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formProd}
                  onChange={e => setFormProd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Valor da Venda (MT)</label>
                  <input
                    type="number"
                    required
                    value={formValor}
                    onChange={e => setFormValor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Forma de Pagamento</label>
                  <select
                    value={formMetodo}
                    onChange={(e: any) => setFormMetodo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                    <option value="Dinheiro">Dinheiro Físico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Zona de Entrega</label>
                <select
                  value={formZona}
                  onChange={e => setFormZona(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="Maputo Cidade">Maputo Cidade (Frete: 150 MT)</option>
                  <option value="Matola">Matola / Província (Frete: 250 MT)</option>
                  <option value="Beira / Sofala">Beira / Sofala (Frete: 350 MT)</option>
                  <option value="Nampula">Nampula (Frete: 400 MT)</option>
                </select>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-emerald-400 space-y-1">
                <span className="font-bold block">Rateio Instantâneo Estimado:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                  <span>• Fornecedor: ~{Math.round((parseFloat(formValor) || 0) * 0.25)} MT</span>
                  <span>• Frete: Automático da zona</span>
                  <span>• 50% Lucro Limpo</span>
                  <span>• 50% Anúncios</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVendaModalOpen(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Confirmar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL REGISTAR SAÍDA ================= */}
      {isDespesaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Simular Saída / Despesa</span>
              </h3>
              <button onClick={() => setIsDespesaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimularDespesa} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Descrição da Despesa</label>
                <input
                  type="text"
                  placeholder="Ex: Anúncios Facebook, Recarga Wi-Fi, Retirada"
                  value={despesaDesc}
                  onChange={e => setDespesaDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Descontar de qual Caixinha (Pocket)?</label>
                <select
                  value={despesaPocket}
                  onChange={e => setDespesaPocket(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="anuncios">📢 Anúncios (Disponível: {pockets.anuncios} MT)</option>
                  <option value="lucro">💰 Lucro Pessoal (Disponível: {pockets.lucro} MT)</option>
                  <option value="fornecedor">📦 Fornecedores (Disponível: {pockets.fornecedor} MT)</option>
                  <option value="entregas">🚚 Frete & Entregas (Disponível: {pockets.entregas} MT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Valor da Saída (MT)</label>
                <input
                  type="number"
                  required
                  value={despesaValor}
                  onChange={e => setDespesaValor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDespesaModalOpen(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Registar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DIFERENCIAIS SECTION ================= */}
      <section id="diferenciais" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">ENGENHARIA FINANCEIRA MODERNA</span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
            Desenvolvido especificamente para quem vende em Moçambique
          </h2>
          <p className="text-slate-400 text-xs sm:text-base leading-relaxed">
            Esqueça planilhas complicadas que quebram a cada clique ou softwares estrangeiros que não conhecem a realidade do M-Pesa, e-Mola e das taxas locais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">ROI Proporcional Verdadeiro</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pare de olhar apenas para o faturamento bruto ou ROAS fantasioso do Facebook Ads. O DroopFlow calcula o lucro líquido verdadeiro, descontando na hora taxas do M-Pesa, frete regional e fornecedor.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Sistema de Caixinhas (Pockets)</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Distribua automaticamente todo o faturamento recebido em cofres financeiros protegidos. Separe na hora a Margem de Segurança, Capital de Giro e orçamento de novos anúncios. Nunca mais queime dinheiro de tráfego!
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Custos de Entrega sob Medida</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O drop nacional exige cálculos precisos de entrega. Defina taxas fixas por zona (Maputo, Matola, Beira, Nampula) e o sistema desconta automaticamente cada frete conforme o local de destino.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Design Mobile-First Ultra-Rápido</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Como você passa a maior parte do tempo gerindo a operação na rua ou pelo WhatsApp, o DroopFlow foi feito para ser leve e extremamente amigável no celular. Registre vendas onde estiver.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Multi-Contas & Carteiras Móveis</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Controle separado dos saldos do M-Pesa, e-Mola, contas bancárias (BIM, BCI, Standard Bank) e caixa físico. Veja o saldo total consolidado e transfira valores entre contas num toque.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">100% Offline-First</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Mesmo quando a internet falha ou você está em trânsito, a aplicação continua funcionando normalmente. Todos os dados são salvos no seu aparelho e sincronizados assim que a conexão retornar.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Gestão de Saídas & Estorno Total</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Lançamento e controle de despesas operacionais com estorno automático. Se você apagar uma saída ou venda, o dinheiro volta imediatamente para o cofre e carteira bancária de origem.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Metas Pessoais de Faturamento</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Defina metas reais (comprar moto, capital de giro, reserva) e configure uma porcentagem fixa de cada venda para ir diretamente para a sua meta financeira até bater o objetivo.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">Modo Foco & Privacidade</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Oculte saldos, faturamentos e lucros com 1 clique para usar a aplicação em público, balcão da loja ou perto de terceiros com total discrição e tranquilidade.
            </p>
          </div>

        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent border-t border-b border-white/5 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">PLANO PRO OFICIAL</span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
              O investimento que se paga na tua primeira venda
            </h2>
            <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto">
              Sem contratos, sem taxas ocultas. Podes criar a tua conta primeiro ou assinar diretamente pelo checkout do EscalePay.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#0c0f17] border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative max-w-lg mx-auto text-left space-y-8">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">Assinatura Mensal</span>
                <h3 className="font-display font-black text-2xl text-white mt-1">DroopFlow Pro</h3>
              </div>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Mais Popular
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-5xl text-white">297</span>
              <span className="text-emerald-400 font-extrabold text-xl">MT</span>
              <span className="text-slate-400 text-xs">/ mês</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              {[
                'Caixinhas (Pockets) Ilimitadas com Rateio Automático',
                'Gestão Completa de Carteiras Móveis (M-Pesa & e-Mola)',
                'Cálculo Preciso de Lucro Líquido Real & Custos Locais',
                'Zonas de Entrega Personalizadas por Província',
                'Controle de Fornecedores e Reposição de Estoque',
                'Gestão e Exclusão Segura de Saídas & Vendas com Estorno',
                'Metas Financeiras Pessoais com Alocação Direta',
                'Modo Foco e Privacidade com 1 Clique',
                'Sincronização Nuvem + Funcionamento 100% Offline',
                'Suporte Prioritário no WhatsApp'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://checkout.escalepay.com/9729350"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-center py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
              >
                Garantir Acesso Pro Instantâneo 🚀
              </a>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="block w-full bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-center py-3.5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all text-xs cursor-pointer"
              >
                Criar Minha Conta Manualmente Primeiro
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pagamento 100% Seguro via EscalePay • Ativação Imediata</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="text-center space-y-4 mb-14">
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">DÚVIDAS FREQUENTES</span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
            Tudo o que precisas de saber
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Devo criar a conta antes ou depois de fazer o pagamento?',
              a: 'Você pode escolher o que for mais prático! Pode criar a sua conta manualmente agora mesmo para começar o teste grátis ou pode pagar direto no EscalePay. Ao usar o mesmo e-mail na compra, a sua conta é vinculada e ativada automaticamente com o plano Pro!'
            },
            {
              q: 'Como funciona o pagamento com M-Pesa e e-Mola?',
              a: 'O checkout da EscalePay aceita pagamentos via M-Pesa, e-Mola e cartões de crédito/débito. Assim que concluíres o pagamento, o nosso webhook ativa a tua conta Pro instantaneamente.'
            },
            {
              q: 'Preciso de um computador para usar o DroopFlow?',
              a: 'Não! O DroopFlow foi desenhado com arquitetura mobile-first. Funciona perfeitamente em qualquer smartphone Android ou iPhone diretamente pelo navegador ou instalado como aplicativo (PWA).'
            },
            {
              q: 'O que acontece se a internet falhar na minha loja?',
              a: 'O DroopFlow é 100% offline-first. Podes continuar a registar vendas, consultar caixinhas e lançar saídas mesmo sem rede. Quando a internet voltar, tudo é sincronizado automaticamente.'
            },
            {
              q: 'Já paguei pelo link da EscalePay, como acedo?',
              a: 'Basta clicares em "Entrar" no topo da página e aceder com o mesmo e-mail que usaste na compra da EscalePay. O sistema reconhecerá o teu pagamento e libertará o acesso Pro na hora!'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 py-12 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg overflow-hidden border border-emerald-500/30">
            <img src={dropflowLogo} alt="DroopFlow" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-black text-sm text-white uppercase tracking-tight">
            Droop<span className="text-emerald-400">Flow</span>
          </span>
        </div>
        <p className="max-w-md mx-auto text-[11px] text-slate-400">
          O primeiro gestor financeiro desenhado exclusivamente para o e-commerce, WhatsApp e dropshipping nacional em Moçambique.
        </p>
        <p className="text-[10px] text-slate-600">
          © {new Date().getFullYear()} DroopFlow. Todos os direitos reservados.
        </p>
      </footer>

      {/* ================= AUTH MODAL (LOGIN / REGISTER) ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-fade-in">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 mx-auto mb-2 flex items-center justify-center bg-slate-950">
                <img src={dropflowLogo} alt="DroopFlow" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                {authMode === 'login' ? 'Entrar no DroopFlow' : 'Criar Nova Conta'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authMode === 'login' ? 'Acede aos teus cofres e vendas em tempo real' : 'Preenche os teus dados para começar'}
              </p>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl text-xs text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmitAuth} className="space-y-3">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nome da Tua Loja</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha Loja Drop"
                    value={authNome}
                    onChange={e => setAuthNome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="teuemail@exemplo.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Palavra-passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                {authLoading ? 'A processar...' : authMode === 'login' ? 'Entrar' : 'Concluir Registo'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-mono">ou</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div className="text-center text-[11px] text-slate-400">
              {authMode === 'login' ? (
                <span>
                  Ainda não tens conta?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Criar conta
                  </button>
                </span>
              ) : (
                <span>
                  Já tens conta?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Fazer login
                  </button>
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
