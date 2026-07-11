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
  Sparkles
} from 'lucide-react';

const getColorRGB = (colorClass: string) => {
  switch (colorClass) {
    case 'bg-emerald-500': return '16, 185, 129';
    case 'bg-sky-500': return '14, 165, 233';
    case 'bg-amber-500': return '245, 158, 11';
    case 'bg-indigo-500': return '99, 102, 241';
    case 'bg-purple-500': return '139, 92, 246';
    case 'bg-rose-500': return '244, 63, 94';
    case 'bg-fuchsia-500': return '217, 70, 239';
    case 'bg-teal-500': return '20, 184, 166';
    case 'bg-orange-500': return '249, 115, 22';
    case 'bg-lime-500': return '132, 204, 22';
    case 'bg-pink-500': return '236, 72, 153';
    case 'bg-cyan-500': return '6, 182, 212';
    case 'bg-violet-500': return '139, 92, 246';
    case 'bg-red-500': return '239, 68, 68';
    case 'bg-slate-700': return '71, 85, 105';
    default: return '100, 116, 139';
  }
};

const suggestedPockets = [
  {
    nome: 'Estornos e Reembolsos',
    icone: '💸',
    cor: 'bg-rose-500',
    desc: 'Verba reservada para estornos e devoluções de clientes.'
  },
  {
    nome: 'Reserva para Impostos',
    icone: '🏦',
    cor: 'bg-amber-500',
    desc: 'Guarde a verba necessária para impostos fiscais.'
  },
  {
    nome: 'Fundo de Emergência',
    icone: '🛑',
    cor: 'bg-red-500',
    desc: 'Segurança contra bloqueios de gateway de pagamentos.'
  },
  {
    nome: 'Ferramentas e Apps',
    icone: '💎',
    cor: 'bg-indigo-500',
    desc: 'Mensalidades da Shopify, Dropi, Dsers e automação.'
  },
  {
    nome: 'Marketing de Influenciadores',
    icone: '🚀',
    cor: 'bg-fuchsia-500',
    desc: 'Verba para parcerias com criadores de conteúdo.'
  },
  {
    nome: 'Bónus e Mimos da Equipa',
    icone: '🎁',
    cor: 'bg-pink-500',
    desc: 'Comemorações e gratificações para o vosso suporte.'
  }
];

export default function CaixinhasView() {
  const { 
    caixinhas, 
    zonasEntrega, 
    profile, 
    addCaixinha, 
    deleteCaixinha, 
    addZonaEntrega, 
    editZonaEntrega 
  } = useApp();

  const [subTab, setSubTab] = useState<'caixas' | 'delivery'>('caixas');

  // Modals
  const [showAddCx, setShowAddCx] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);

  // New caixinha form
  const [cxNome, setCxNome] = useState('');
  const [cxIcon, setCxIcon] = useState('Layers');
  const [cxCor, setCxCor] = useState('bg-purple-500');

  // New zone form
  const [zoneNome, setZoneNome] = useState('');
  const [zoneCusto, setZoneCusto] = useState('');

  const currency = profile?.moeda || 'MT';

  const handleCreateCaixinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxNome) return;
    try {
      await addCaixinha(cxNome, cxIcon, cxCor);
      setCxNome('');
      setCxIcon('Layers');
      setCxCor('bg-purple-500');
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

  // Helper icons
  const getIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-sky-600" />;
      case 'Package': return <Package className="w-5 h-5 text-amber-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-slate-500" />;
      default: 
        if (name && name.length <= 4) {
          return <span className="text-xl flex items-center justify-center w-5 h-5 select-none">{name}</span>;
        }
        return <Layers className="w-5 h-5 text-slate-500" />;
    }
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
    'bg-orange-500',
    'bg-lime-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-red-500',
    'bg-slate-700'
  ];

  const availableIcons = [
    'Layers',
    'TrendingUp',
    'Megaphone',
    'Package',
    'Truck',
    '💰',
    '🏦',
    '💸',
    '📈',
    '🎯',
    '🚀',
    '🎁',
    '🛍️',
    '☕',
    '🛑',
    '💎'
  ];

  return (
    <div className="space-y-4" id="caixinhas_view">
      
      {/* Sub tabs navigation */}
      <div className="bg-slate-100 p-1.5 rounded-xl grid grid-cols-2 gap-1" id="caixinhas_subtabs">
        <button
          id="tab_cx_pockets"
          onClick={() => setSubTab('caixas')}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'caixas' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Caixinhas</span>
        </button>
        <button
          id="tab_cx_delivery"
          onClick={() => setSubTab('delivery')}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'delivery' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Zonas Delivery</span>
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
            {caixinhas.map(cx => {
              const lightColor = cx.cor.replace('bg-', 'bg-');
              return (
                <div key={cx.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`cx_view_card_${cx.id}`}>
                  <div className="flex items-center space-x-3" id="cx_view_info">
                    <div className={`${lightColor} bg-opacity-10 p-2.5 rounded-xl`} id="cx_view_badge" style={{ backgroundColor: `rgba(${getColorRGB(cx.cor)}, 0.12)` }}>
                      {getIcon(cx.icone)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{cx.nome}</span>
                      <span className="text-[9px] text-slate-500 uppercase block font-medium">
                        {cx.tipo === 'personalizado' ? 'Pocket Adicional' : `Fórmula: auto-distribuição`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" id="cx_view_right">
                    <div className="text-right" id="cx_view_balance">
                      <span className="text-sm font-black text-slate-900 block">
                        {cx.saldo_atual.toLocaleString()} {currency}
                      </span>
                    </div>
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

          {/* Suggested/Recommended Pockets */}
          <div className="space-y-4 pt-6 mt-6 border-t border-slate-200/50" id="suggested_pockets_section">
            <div id="suggested_pockets_header">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Pockets Recomendados para Dropshipping</span>
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Adicione caixinhas sugeridas estrategicamente com apenas 1 clique para melhorar a saúde financeira do vosso negócio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="suggested_pockets_grid">
              {suggestedPockets.map((p, index) => {
                const isAdded = caixinhas.some(c => c.nome.toLowerCase() === p.nome.toLowerCase());
                return (
                  <div key={index} className="bg-slate-50/50 border border-slate-200/30 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-md hover:border-slate-300/40 transition-all" id={`suggested_cx_card_${index}`}>
                    <div className="flex items-start space-x-3" id={`suggested_info_${index}`}>
                      <div className={`${p.cor} bg-opacity-10 p-2.5 rounded-xl text-slate-950 font-black flex items-center justify-center`} style={{ backgroundColor: `rgba(${getColorRGB(p.cor)}, 0.15)` }} id={`suggested_badge_${index}`}>
                        {getIcon(p.icone)}
                      </div>
                      <div className="min-w-0" id={`suggested_text_${index}`}>
                        <span className="text-xs font-bold text-slate-900 block truncate">{p.nome}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug font-medium">{p.desc}</p>
                      </div>
                    </div>

                    <div className="pt-1" id={`suggested_action_${index}`}>
                      {isAdded ? (
                        <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 py-2 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1" id={`suggested_added_badge_${index}`}>
                          <span className="text-emerald-500 font-extrabold text-xs">✓</span>
                          <span>Ativado no Vosso Negócio</span>
                        </div>
                      ) : (
                        <button
                          id={`btn_add_suggested_${index}`}
                          type="button"
                          onClick={async () => {
                            try {
                              await addCaixinha(p.nome, p.icone, p.cor);
                            } catch (err) {
                              alert('Erro ao adicionar pocket sugerido.');
                            }
                          }}
                          className="w-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200/80 hover:border-slate-300 font-extrabold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center space-x-1 transition-all shadow-sm cursor-pointer"
                        >
                          <span>＋ Adicionar com 1 Clique</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

                  <div className="text-right" id="zone_fee">
                    <span className="text-[8px] text-indigo-600 uppercase tracking-wide block font-black">Custo Fixo</span>
                    <span className="text-sm font-black text-slate-900">
                      {z.custo} {currency}
                    </span>
                  </div>
                </div>
              ))
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
                <div className="flex gap-2 pt-1" id="cx_icons_grid">
                  {availableIcons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCxIcon(ic)}
                      className={`p-2.5 rounded-xl border ${cxIcon === ic ? 'bg-slate-100 text-emerald-600 border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'} transition-all`}
                    >
                      {getIcon(ic)}
                    </button>
                  ))}
                </div>
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

    </div>
  );
}
