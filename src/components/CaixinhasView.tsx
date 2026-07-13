/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { 
  Layers, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Megaphone, 
  Package, 
  Truck, 
  Trash2, 
  Edit,
  X,
  AlertTriangle,
  DollarSign,
  PiggyBank,
  CreditCard,
  Percent,
  ShoppingBag,
  Store,
  ShieldCheck,
  Heart,
  Briefcase,
  Coffee,
  Gift,
  Home,
  Key,
  Lock,
  Compass,
  Award,
  RefreshCw
} from 'lucide-react';

export default function CaixinhasView() {
  const { 
    caixinhas, 
    vendas,
    zonasEntrega, 
    profile, 
    addCaixinha, 
    deleteCaixinha, 
    addZonaEntrega, 
    editZonaEntrega,
    editCaixinha,
    updateProfile,
    despesasRecorrentes,
    addDespesaRecorrente,
    editDespesaRecorrente,
    deleteDespesaRecorrente,
    processarDespesaRecorrente
  } = useApp();

  const totalBalance = caixinhas.reduce((acc, curr) => acc + curr.saldo_atual, 0);
  const totalFaturamento = (vendas || []).reduce((acc, curr) => acc + curr.valor_recebido, 0);

  const [subTab, setSubTab] = useState<'caixas' | 'delivery' | 'recorrentes'>('caixas');

  // Modals
  const [showAddCx, setShowAddCx] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddDR, setShowAddDR] = useState(false);

  // New despesa recorrente form
  const [drDescricao, setDrDescricao] = useState('');
  const [drValor, setDrValor] = useState('');
  const [drCaixinhaId, setDrCaixinhaId] = useState('');
  const [drCategoria, setDrCategoria] = useState('Outros');
  const [drFrequencia, setDrFrequencia] = useState<'mensal' | 'semanal'>('mensal');
  const [drDiaVencimento, setDrDiaVencimento] = useState<number>(1);

  // New caixinha form
  const [cxNome, setCxNome] = useState('');
  const [cxIcon, setCxIcon] = useState('Layers');
  const [cxCor, setCxCor] = useState('bg-purple-500');
  const [cxAutoDistribuir, setCxAutoDistribuir] = useState(false);
  const [cxPercentual, setCxPercentual] = useState<number>(0);

  // New zone form
  const [zoneNome, setZoneNome] = useState('');
  const [zoneCusto, setZoneCusto] = useState('');

  // Editing state
  const [editingCx, setEditingCx] = useState<any>(null);
  const [editCxNome, setEditCxNome] = useState('');
  const [editCxIcon, setEditCxIcon] = useState('Layers');
  const [editCxCor, setEditCxCor] = useState('bg-purple-500');
  const [editCxPercent, setEditCxPercent] = useState<number>(50);
  const [editCxAutoDistribuir, setEditCxAutoDistribuir] = useState(false);
  const [editCxPercentualPersonalizado, setEditCxPercentualPersonalizado] = useState<number>(0);

  const [editingZone, setEditingZone] = useState<any>(null);
  const [editZoneNome, setEditZoneNome] = useState('');
  const [editZoneCusto, setEditZoneCusto] = useState('');

  const currency = profile?.moeda || 'MT';

  const handleCreateCaixinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxNome) return;
    try {
      await addCaixinha(cxNome, cxIcon, cxCor, cxPercentual, cxAutoDistribuir);
      setCxNome('');
      setCxIcon('Layers');
      setCxCor('bg-purple-500');
      setCxAutoDistribuir(false);
      setCxPercentual(0);
      setShowAddCx(false);
    } catch (e) {
      alert('Erro ao criar pocket.');
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneNome || !zoneCusto) return;
    try {
      await addZonaEntrega({
        nome_zona: zoneNome,
        custo: parseFloat(zoneCusto)
      });
      setZoneNome('');
      setZoneCusto('');
      setShowAddZone(false);
    } catch (e) {
      alert('Erro ao criar zona.');
    }
  };

  const handleEditCaixinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCx || !editCxNome) return;
    try {
      const updates: any = {
        nome: editCxNome,
        icone: editCxIcon,
        cor: editCxCor
      };

      if (editingCx.tipo === 'personalizado') {
        updates.auto_distribuir = editCxAutoDistribuir;
        updates.percentual_padrao = editCxPercentualPersonalizado;
      }

      await editCaixinha(editingCx.id, updates);

      if (editingCx.tipo === 'lucro') {
        await updateProfile({
          lucro_percent: editCxPercent,
          anuncios_percent: 100 - editCxPercent
        });
      } else if (editingCx.tipo === 'anuncios') {
        await updateProfile({
          anuncios_percent: editCxPercent,
          lucro_percent: 100 - editCxPercent
        });
      }

      setEditingCx(null);
    } catch (e) {
      alert('Erro ao editar caixinha.');
    }
  };

  const handleEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !editZoneNome || !editZoneCusto) return;
    try {
      await editZonaEntrega(editingZone.id, {
        nome_zona: editZoneNome,
        custo: parseFloat(editZoneCusto)
      });
      setEditingZone(null);
    } catch (e) {
      alert('Erro ao editar zona.');
    }
  };

  const handleCreateDespesaRecorrente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drDescricao || !drValor || !drCaixinhaId) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    try {
      await addDespesaRecorrente({
        descricao: drDescricao,
        valor: parseFloat(drValor),
        caixinha_id: drCaixinhaId,
        categoria: drCategoria,
        frequencia: drFrequencia,
        dia_vencimento: drDiaVencimento,
        ativa: true
      });
      setDrDescricao('');
      setDrValor('');
      setDrCaixinhaId('');
      setDrCategoria('Outros');
      setDrFrequencia('mensal');
      setDrDiaVencimento(1);
      setShowAddDR(false);
    } catch (e) {
      alert('Erro ao criar saída recorrente.');
    }
  };

  // Helper icons mapping
  const getIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-sky-600" />;
      case 'Package': return <Package className="w-5 h-5 text-amber-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'PiggyBank': return <PiggyBank className="w-5 h-5 text-pink-500" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'Percent': return <Percent className="w-5 h-5 text-amber-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'Store': return <Store className="w-5 h-5 text-purple-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-700" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-800" />;
      case 'Gift': return <Gift className="w-5 h-5 text-red-500" />;
      case 'Home': return <Home className="w-5 h-5 text-blue-600" />;
      case 'Key': return <Key className="w-5 h-5 text-yellow-600" />;
      case 'Lock': return <Lock className="w-5 h-5 text-slate-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-600" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-500" />;
      default: return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  // Helper color backgrounds
  const getLightBgColor = (bgClass: string) => {
    const colorMap: Record<string, string> = {
      'bg-emerald-500': 'rgba(16, 185, 129, 0.1)',
      'bg-sky-500': 'rgba(14, 165, 233, 0.1)',
      'bg-amber-500': 'rgba(245, 158, 11, 0.1)',
      'bg-indigo-500': 'rgba(99, 102, 241, 0.1)',
      'bg-purple-500': 'rgba(139, 92, 246, 0.1)',
      'bg-rose-500': 'rgba(244, 63, 94, 0.1)',
      'bg-fuchsia-500': 'rgba(217, 70, 239, 0.1)',
      'bg-teal-500': 'rgba(20, 184, 166, 0.1)',
      'bg-cyan-500': 'rgba(6, 182, 212, 0.1)',
      'bg-pink-500': 'rgba(236, 72, 153, 0.1)',
      'bg-blue-500': 'rgba(59, 130, 246, 0.1)',
      'bg-red-500': 'rgba(239, 68, 68, 0.1)',
      'bg-orange-500': 'rgba(249, 115, 22, 0.1)',
      'bg-lime-500': 'rgba(132, 204, 22, 0.1)',
      'bg-violet-500': 'rgba(109, 40, 217, 0.1)',
      'bg-zinc-500': 'rgba(113, 113, 122, 0.1)'
    };
    return colorMap[bgClass] || 'rgba(100, 116, 139, 0.1)';
  };

  const availableColors = [
    'bg-emerald-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-fuchsia-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-lime-500',
    'bg-violet-500',
    'bg-zinc-500'
  ];

  const availableIcons = [
    'Layers',
    'TrendingUp',
    'Megaphone',
    'Package',
    'Truck',
    'DollarSign',
    'PiggyBank',
    'CreditCard',
    'Percent',
    'ShoppingBag',
    'Store',
    'ShieldCheck',
    'Heart',
    'Briefcase',
    'Coffee',
    'Gift',
    'Home',
    'Key',
    'Lock',
    'Compass',
    'Award'
  ];

  return (
    <div className="space-y-4" id="caixinhas_view">
      
      {/* Sub tabs navigation */}
      <div className="bg-slate-100 p-1.5 rounded-xl grid grid-cols-3 gap-1" id="caixinhas_subtabs">
        <button
          id="tab_cx_pockets"
          onClick={() => setSubTab('caixas')}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${subTab === 'caixas' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Caixinhas</span>
        </button>
        <button
          id="tab_cx_delivery"
          onClick={() => setSubTab('delivery')}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${subTab === 'delivery' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Zonas Delivery</span>
        </button>
        <button
          id="tab_cx_recorrentes"
          onClick={() => setSubTab('recorrentes')}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${subTab === 'recorrentes' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Saídas Recorrentes</span>
        </button>
      </div>

      {/* ================= 1. POCKETS LIST PANEL ================= */}
      {subTab === 'caixas' && (
        <div className="space-y-4" id="caixas_panel">
          
          <div className="flex justify-between items-center" id="caixas_header">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Caixinhas Financeiras</h3>
              <p className="text-[10px] text-slate-500">Divisão do caixa do negócio</p>
            </div>
            <button
              id="btn_open_add_cx"
              onClick={() => setShowAddCx(true)}
              className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center text-xs space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Personalizar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3" id="caixas_list_cards">
            {/* 1st Premium Card: Faturamento & Saldo Total */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 text-white rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-emerald-700/15 border-none" id="cx_view_card_faturamento">
              <div className="flex items-center space-x-3.5" id="cx_view_info_faturamento">
                <div className="bg-white/15 p-3 rounded-xl border border-white/10" id="cx_view_badge_faturamento">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block tracking-wide">Faturamento (Saldo Total)</span>
                  <span className="text-[10px] text-emerald-200/90 block font-medium">
                    Faturamento Acumulado: <span className="font-bold text-white">{totalFaturamento.toLocaleString()} {currency}</span>
                  </span>
                </div>
              </div>

              <div className="text-right" id="cx_view_balance_faturamento">
                <span className="text-[9px] text-emerald-200/90 uppercase tracking-wider block font-bold">Saldo Total</span>
                <span className="text-lg font-black text-white block leading-tight">
                  {totalBalance.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {caixinhas.map(cx => {
              const lightColorBg = getLightBgColor(cx.cor);
              return (
                <div key={cx.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`cx_view_card_${cx.id}`}>
                  <div className="flex items-center space-x-3" id="cx_view_info">
                    <div className="p-2.5 rounded-xl flex items-center justify-center shrink-0" id="cx_view_badge" style={{ backgroundColor: lightColorBg }}>
                      {getIcon(cx.icone)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{cx.nome}</span>
                      <span className="text-[9px] text-slate-500 uppercase block font-medium">
                        {cx.tipo === 'personalizado' 
                          ? (cx.auto_distribuir ? `Auto-Distribuir: ${cx.percentual_padrao}%` : 'Pocket Adicional (Manual)') 
                          : cx.tipo === 'lucro' ? `Lucro: ${profile?.lucro_percent}%` 
                          : cx.tipo === 'anuncios' ? `Anúncios: ${profile?.anuncios_percent}%` 
                          : `Fórmula: auto-distribuição`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3" id="cx_view_right">
                    <div className="text-right" id="cx_view_balance">
                      <span className="text-sm font-black text-slate-900 block">
                        {cx.saldo_atual.toLocaleString()} {currency}
                      </span>
                    </div>
                    <button
                      id={`btn_edit_cx_${cx.id}`}
                      onClick={() => {
                        setEditingCx(cx);
                        setEditCxNome(cx.nome);
                        setEditCxIcon(cx.icone);
                        setEditCxCor(cx.cor);
                        setEditCxAutoDistribuir(cx.auto_distribuir || false);
                        setEditCxPercentualPersonalizado(cx.percentual_padrao || 0);
                        if (cx.tipo === 'lucro') {
                          setEditCxPercent(profile?.lucro_percent || 50);
                        } else if (cx.tipo === 'anuncios') {
                          setEditCxPercent(profile?.anuncios_percent || 50);
                        } else {
                          setEditCxPercent(0);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Editar caixinha"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {cx.tipo === 'personalizado' && (
                      <button
                        id={`btn_delete_cx_${cx.id}`}
                        onClick={() => deleteCaixinha(cx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar caixinha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 2. DELIVERY ZONES PANEL ================= */}
      {subTab === 'delivery' && (
        <div className="space-y-4" id="delivery_panel">
          
          <div className="flex justify-between items-center" id="delivery_header">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Custos de Entrega / Envio</h3>
              <p className="text-[10px] text-slate-500">Filtro utilizado ao vender</p>
            </div>
            <button
              id="btn_open_add_zone"
              onClick={() => setShowAddZone(true)}
              className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center text-xs space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nova Zona</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3" id="delivery_list_cards">
            {zonasEntrega.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_delivery">
                <p className="text-xs font-bold text-slate-700">Nenhuma zona de entrega configurada.</p>
                <p className="text-[10px] text-slate-500">Crie taxas personalizadas para cobrir custos de motoboys ou correios.</p>
              </div>
            ) : (
              zonasEntrega.map(z => (
                <div key={z.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`zone_card_${z.id}`}>
                  <div className="flex items-center space-x-3" id="zone_info">
                    <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-700" id="zone_badge">
                      <MapPin className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{z.nome_zona}</span>
                      <span className="text-[9px] text-slate-500 block">Dedução garantida para caixinha Delivery</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3" id="zone_fee_and_actions">
                    <div className="text-right" id="zone_fee">
                      <span className="text-[8px] text-indigo-600 uppercase tracking-wide block font-black">Custo Fixo</span>
                      <span className="text-sm font-black text-slate-900">
                        {z.custo} {currency}
                      </span>
                    </div>
                    <button
                      id={`btn_edit_zone_${z.id}`}
                      onClick={() => {
                        setEditingZone(z);
                        setEditZoneNome(z.nome_zona);
                        setEditZoneCusto(z.custo.toString());
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Editar zona"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= 3. SAÍDAS RECORRENTES PANEL ================= */}
      {subTab === 'recorrentes' && (
        <div className="space-y-4" id="recorrentes_panel">
          
          <div className="flex justify-between items-center" id="recorrentes_header">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Saídas e Custos Recorrentes</h3>
              <p className="text-[10px] text-slate-500">Despesas cíclicas associadas aos seus pockets</p>
            </div>
            <button
              id="btn_open_add_dr"
              onClick={() => setShowAddDR(true)}
              className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center text-xs space-x-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Programar Saída</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="recorrentes_list_cards">
            {(despesasRecorrentes || []).length === 0 ? (
              <div className="col-span-full bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_recorrentes">
                <p className="text-xs font-bold text-slate-700">Nenhuma despesa recorrente programada.</p>
                <p className="text-[10px] text-slate-500">Programe despesas como aluguer, internet ou licenças para descontar direto das suas caixinhas de forma manual ou automática.</p>
              </div>
            ) : (
              (despesasRecorrentes || []).map(dr => {
                const targetCx = caixinhas.find(c => c.id === dr.caixinha_id);
                const vencimentoTexto = dr.frequencia === 'mensal' 
                  ? `Dia ${dr.dia_vencimento} de cada mês` 
                  : `Toda ${dr.dia_vencimento === 0 ? 'Segunda' : dr.dia_vencimento === 1 ? 'Terça' : dr.dia_vencimento === 2 ? 'Quarta' : dr.dia_vencimento === 3 ? 'Quinta' : dr.dia_vencimento === 4 ? 'Sexta' : dr.dia_vencimento === 5 ? 'Sábado' : 'Domingo'}-feira`;

                return (
                  <div key={dr.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-md transition-shadow" id={`dr_card_${dr.id}`}>
                    <div className="flex justify-between items-start" id="dr_header_inner">
                      <div className="flex items-center space-x-2.5" id="dr_title_block">
                        <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-600 shrink-0" id="dr_icon_badge">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block leading-tight">{dr.descricao}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5">{dr.categoria}</span>
                        </div>
                      </div>

                      <div className="text-right" id="dr_value_block">
                        <span className="text-xs font-black text-rose-600 block">
                          - {dr.valor.toLocaleString()} {currency}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-medium">{vencimentoTexto}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[10px]" id="dr_pocket_association">
                      <div className="flex items-center space-x-1.5" id="dr_cx_info">
                        <span className="text-slate-400 font-semibold">Descontar de:</span>
                        {targetCx ? (
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getLightBgColor(targetCx.cor).replace('rgba', 'rgb').replace(', 0.1)', ')') }} />
                            <span className="font-bold text-slate-700">{targetCx.nome}</span>
                          </div>
                        ) : (
                          <span className="text-amber-500 font-bold">Sem Pocket Vinculado</span>
                        )}
                      </div>

                      {dr.ultimo_processado && (
                        <div className="text-slate-400" id="dr_last_paid">
                          Pago em: <span className="font-semibold text-slate-600">{dr.ultimo_processado}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-1" id="dr_actions_block">
                      {/* Execute Payment direct trigger */}
                      <button
                        type="button"
                        id={`btn_dr_pay_${dr.id}`}
                        onClick={async () => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          try {
                            await processarDespesaRecorrente(dr.id, todayStr);
                            alert(`Despesa "${dr.descricao}" de ${dr.valor} ${currency} processada com sucesso no pocket de origem!`);
                          } catch (e) {
                            alert('Erro ao processar despesa.');
                          }
                        }}
                        className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 font-extrabold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        title="Pagar despesa programada e deduzir do saldo da caixinha"
                      >
                        <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Pagar / Descontar Agora</span>
                      </button>

                      <button
                        type="button"
                        id={`btn_dr_toggle_active_${dr.id}`}
                        onClick={async () => {
                          try {
                            await editDespesaRecorrente(dr.id, { ativa: !dr.ativa });
                          } catch (e) {
                            alert('Erro ao alterar status.');
                          }
                        }}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${dr.ativa ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}`}
                        title={dr.ativa ? 'Pausar Despesa' : 'Ativar Despesa'}
                      >
                        {dr.ativa ? 'Ativa' : 'Pausada'}
                      </button>

                      <button
                        type="button"
                        id={`btn_dr_delete_${dr.id}`}
                        onClick={async () => {
                          if (confirm('Tem certeza que deseja apagar esta saída recorrente?')) {
                            try {
                              await deleteDespesaRecorrente(dr.id);
                            } catch (e) {
                              alert('Erro ao apagar despesa.');
                            }
                          }
                        }}
                        className="p-2 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                        title="Eliminar programação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= CREATE POCKET MODAL ================= */}
      {showAddCx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_cx_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="add_cx_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Criar Caixinha Customizada</h3>
            <form onSubmit={handleCreateCaixinha} className="space-y-4" id="add_cx_form">
              <div className="space-y-1" id="cx_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome da Caixinha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva para Impostos"
                  value={cxNome}
                  onChange={(e) => setCxNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Color selectors */}
              <div className="space-y-1.5" id="cx_colors_group">
                <label className="text-xs text-slate-600 font-semibold block">Cor Visual</label>
                <div className="flex flex-wrap gap-2 pt-1" id="cx_colors_palette">
                  {availableColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCxCor(c)}
                      className={`w-6 h-6 rounded-full ${c} border-2 ${cxCor === c ? 'border-slate-800 scale-110 shadow-lg' : 'border-white hover:scale-105'} transition-transform`}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Icon selectors */}
              <div className="space-y-1.5" id="cx_icons_group">
                <label className="text-xs text-slate-600 font-semibold block">Ícone</label>
                <div className="grid grid-cols-6 gap-2 pt-1 max-h-36 overflow-y-auto pr-1" id="cx_icons_grid">
                  {availableIcons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCxIcon(ic)}
                      className={`p-2 rounded-xl border flex items-center justify-center ${cxIcon === ic ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'} transition-all`}
                    >
                      {getIcon(ic)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Autodistribuir selector */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3" id="cx_auto_distribute_group">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs text-slate-800 font-extrabold block">Distribuição Automática</label>
                    <span className="text-[10px] text-slate-500 block leading-tight">Deseja deduzir automaticamente de todas as novas vendas?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCxAutoDistribuir(!cxAutoDistribuir);
                      if (!cxAutoDistribuir) setCxPercentual(0);
                      else setCxPercentual(5);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${cxAutoDistribuir ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow ${cxAutoDistribuir ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {cxAutoDistribuir && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-700 font-semibold">Percentual do Valor Recebido</label>
                      <span className="text-xs font-black text-emerald-600">{cxPercentual}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={cxPercentual}
                      onChange={(e) => setCxPercentual(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block leading-tight">Exemplo: Em uma venda de 1.000 {currency}, {Math.round(1000 * (cxPercentual / 100))} {currency} irá automaticamente para esta caixinha.</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2" id="cx_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddCx(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Gravar Caixinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CREATE ZONE MODAL ================= */}
      {showAddZone && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_zone_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="add_zone_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Nova Zona e Custo de Envio</h3>
            <form onSubmit={handleCreateZone} className="space-y-4" id="add_zone_form">
              <div className="space-y-1" id="zone_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome da Zona / Província</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beira Cidade, Nampula"
                  value={zoneNome}
                  onChange={(e) => setZoneNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="zone_custo_group">
                <label className="text-xs text-slate-600 font-semibold">Custo de Frete / Delivery</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={zoneCusto}
                  onChange={(e) => setZoneCusto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2" id="zone_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddZone(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Gravar Zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CREATE RECORRENTE MODAL ================= */}
      {showAddDR && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_dr_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="add_dr_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Programar Saída Recorrente</h3>
            <form onSubmit={handleCreateDespesaRecorrente} className="space-y-4" id="add_dr_form">
              
              <div className="space-y-1" id="dr_descricao_group">
                <label className="text-xs text-slate-600 font-semibold">Descrição da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assinatura Shopify, Aluguel"
                  value={drDescricao}
                  onChange={(e) => setDrDescricao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3" id="dr_valor_categoria_row">
                <div className="space-y-1" id="dr_valor_group">
                  <label className="text-xs text-slate-600 font-semibold">Valor ({currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="0.00"
                    value={drValor}
                    onChange={(e) => setDrValor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1" id="dr_categoria_group">
                  <label className="text-xs text-slate-600 font-semibold">Categoria</label>
                  <select
                    value={drCategoria}
                    onChange={(e) => setDrCategoria(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Marketing">Marketing / Tráfego</option>
                    <option value="Aluguer">Aluguer / Escritório</option>
                    <option value="Salários">Salários / Serviços</option>
                    <option value="Subscrições">Subscrições / Software</option>
                    <option value="Impostos">Impostos / Taxas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1" id="dr_caixinha_group">
                <label className="text-xs text-slate-600 font-semibold">Descontar de qual Caixinha?</label>
                <select
                  required
                  value={drCaixinhaId}
                  onChange={(e) => setDrCaixinhaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Selecione uma caixinha...</option>
                  {caixinhas.map(cx => (
                    <option key={cx.id} value={cx.id}>{cx.nome} (Saldo: {cx.saldo_atual.toLocaleString()} {currency})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3" id="dr_freq_venc_row">
                <div className="space-y-1" id="dr_frequencia_group">
                  <label className="text-xs text-slate-600 font-semibold">Frequência</label>
                  <select
                    value={drFrequencia}
                    onChange={(e) => {
                      setDrFrequencia(e.target.value as any);
                      setDrDiaVencimento(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>

                <div className="space-y-1" id="dr_vencimento_group">
                  <label className="text-xs text-slate-600 font-semibold">Dia de Vencimento</label>
                  {drFrequencia === 'mensal' ? (
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      placeholder="Dia (1-31)"
                      value={drDiaVencimento}
                      onChange={(e) => setDrDiaVencimento(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  ) : (
                    <select
                      value={drDiaVencimento}
                      onChange={(e) => setDrDiaVencimento(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value={0}>Segunda-feira</option>
                      <option value={1}>Terça-feira</option>
                      <option value={2}>Quarta-feira</option>
                      <option value={3}>Quinta-feira</option>
                      <option value={4}>Sexta-feira</option>
                      <option value={5}>Sábado</option>
                      <option value={6}>Domingo</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2" id="dr_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddDR(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Programar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT POCKET MODAL ================= */}
      {editingCx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_cx_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="edit_cx_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Editar Caixinha / Pocket</h3>
            <form onSubmit={handleEditCaixinha} className="space-y-4" id="edit_cx_form">
              <div className="space-y-1" id="edit_cx_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome da Caixinha</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do pocket"
                  value={editCxNome}
                  onChange={(e) => setEditCxNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Porcentagem slider if it is lucro or anuncios */}
              {(editingCx.tipo === 'lucro' || editingCx.tipo === 'anuncios') && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5" id="edit_cx_percent_group">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Percentual de Auto-Distribuição</span>
                    <span className="text-emerald-600 font-bold">{editCxPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editCxPercent}
                    onChange={(e) => setEditCxPercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    {editingCx.tipo === 'lucro' 
                      ? `Ao definir lucro em ${editCxPercent}%, a caixinha de Anúncios será automaticamente ajustada para ${100 - editCxPercent}%.`
                      : `Ao definir anúncios em ${editCxPercent}%, a caixinha de Lucro será automaticamente ajustada para ${100 - editCxPercent}%.`
                    }
                  </p>
                </div>
              )}

              {/* Color selectors */}
              <div className="space-y-1.5" id="edit_cx_colors_group">
                <label className="text-xs text-slate-600 font-semibold block">Cor Visual</label>
                <div className="flex flex-wrap gap-2 pt-1" id="edit_cx_colors_palette">
                  {availableColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCxCor(c)}
                      className={`w-6 h-6 rounded-full ${c} border-2 ${editCxCor === c ? 'border-slate-800 scale-110 shadow-lg' : 'border-white hover:scale-105'} transition-transform`}
                    ></button>
                  ))}
                </div>
              </div>

               {/* Icon selectors */}
              <div className="space-y-1.5" id="edit_cx_icons_group">
                <label className="text-xs text-slate-600 font-semibold block">Ícone</label>
                <div className="grid grid-cols-6 gap-2 pt-1 max-h-36 overflow-y-auto pr-1" id="edit_cx_icons_grid">
                  {availableIcons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditCxIcon(ic)}
                      className={`p-2 rounded-xl border flex items-center justify-center ${editCxIcon === ic ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'} transition-all`}
                    >
                      {getIcon(ic)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Autodistribuir selector for Custom Pockets */}
              {editingCx.tipo === 'personalizado' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3" id="edit_cx_auto_distribute_group">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs text-slate-800 font-extrabold block">Distribuição Automática</label>
                      <span className="text-[10px] text-slate-500 block leading-tight">Deseja deduzir automaticamente de todas as novas vendas?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditCxAutoDistribuir(!editCxAutoDistribuir);
                        if (!editCxAutoDistribuir) setEditCxPercentualPersonalizado(0);
                        else setEditCxPercentualPersonalizado(5);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${editCxAutoDistribuir ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow ${editCxAutoDistribuir ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {editCxAutoDistribuir && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-700 font-semibold">Percentual do Valor Recebido</label>
                        <span className="text-xs font-black text-emerald-600">{editCxPercentualPersonalizado}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={editCxPercentualPersonalizado}
                        onChange={(e) => setEditCxPercentualPersonalizado(parseInt(e.target.value))}
                        className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">Exemplo: Em uma venda de 1.000 {currency}, {Math.round(1000 * (editCxPercentualPersonalizado / 100))} {currency} irá automaticamente para esta caixinha.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 pt-2" id="edit_cx_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingCx(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT ZONE MODAL ================= */}
      {editingZone && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_zone_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="edit_zone_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Editar Zona de Envio</h3>
            <form onSubmit={handleEditZone} className="space-y-4" id="edit_zone_form">
              <div className="space-y-1" id="edit_zone_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome da Zona / Província</label>
                <input
                  type="text"
                  required
                  placeholder="Nome da zona"
                  value={editZoneNome}
                  onChange={(e) => setEditZoneNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="edit_zone_custo_group">
                <label className="text-xs text-slate-600 font-semibold">Custo de Frete / Delivery</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={editZoneCusto}
                  onChange={(e) => setEditZoneCusto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2" id="edit_zone_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Salvar Zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
