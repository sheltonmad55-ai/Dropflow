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
  DollarSign
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
    updateProfile
  } = useApp();

  const totalBalance = caixinhas.reduce((acc, curr) => acc + curr.saldo_atual, 0);
  const totalFaturamento = (vendas || []).reduce((acc, curr) => acc + curr.valor_recebido, 0);

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

  // Editing state
  const [editingCx, setEditingCx] = useState<any>(null);
  const [editCxNome, setEditCxNome] = useState('');
  const [editCxIcon, setEditCxIcon] = useState('Layers');
  const [editCxCor, setEditCxCor] = useState('bg-purple-500');
  const [editCxPercent, setEditCxPercent] = useState<number>(50);

  const [editingZone, setEditingZone] = useState<any>(null);
  const [editZoneNome, setEditZoneNome] = useState('');
  const [editZoneCusto, setEditZoneCusto] = useState('');

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

  const handleEditCaixinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCx || !editCxNome) return;
    try {
      await editCaixinha(editingCx.id, {
        nome: editCxNome,
        icone: editCxIcon,
        cor: editCxCor
      });

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

  // Helper icons
  const getIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-sky-600" />;
      case 'Package': return <Package className="w-5 h-5 text-amber-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default: return <Layers className="w-5 h-5 text-slate-500" />;
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
    'bg-teal-500'
  ];

  const availableIcons = [
    'Layers',
    'TrendingUp',
    'Megaphone',
    'Package',
    'Truck'
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
              const lightColor = cx.cor.replace('bg-', 'bg-');
              return (
                <div key={cx.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`cx_view_card_${cx.id}`}>
                  <div className="flex items-center space-x-3" id="cx_view_info">
                    <div className={`${lightColor} bg-opacity-10 p-2.5 rounded-xl`} id="cx_view_badge" style={{ backgroundColor: `rgba(${lightColor === 'bg-emerald-500' ? '16, 185, 129, 0.1' : lightColor === 'bg-sky-500' ? '14, 165, 233, 0.1' : lightColor === 'bg-amber-500' ? '245, 158, 11, 0.1' : lightColor === 'bg-indigo-500' ? '99, 102, 241, 0.1' : '139, 92, 246, 0.1'})` }}>
                      {getIcon(cx.icone)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{cx.nome}</span>
                      <span className="text-[9px] text-slate-500 uppercase block font-medium">
                        {cx.tipo === 'personalizado' ? 'Pocket Adicional' : cx.tipo === 'lucro' ? `Lucro: ${profile?.lucro_percent}%` : cx.tipo === 'anuncios' ? `Anúncios: ${profile?.anuncios_percent}%` : `Fórmula: auto-distribuição`}
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
                <div className="flex gap-2 pt-1" id="edit_cx_icons_grid">
                  {availableIcons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditCxIcon(ic)}
                      className={`p-2.5 rounded-xl border ${editCxIcon === ic ? 'bg-slate-100 text-emerald-600 border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'} transition-all`}
                    >
                      {getIcon(ic)}
                    </button>
                  ))}
                </div>
              </div>

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
