/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Phone,
  AlertCircle,
  Edit,
  Check,
  X,
  ArrowDownRight,
  Layers,
  Wallet,
  Sparkles,
  Laptop,
  Package
} from 'lucide-react';

export default function VendasView() {
  const { 
    vendas, 
    despesas,
    deleteDespesa,
    caixinhas,
    contasBancarias,
    produtos, 
    fornecedores, 
    profile, 
    activeWorkspace,
    addProduto, 
    addFornecedor,
    editProduto,
    editFornecedor,
    editVenda,
    deleteVenda,
    modoFoco,
    formatMoney
  } = useApp();

  const [subTab, setSubTab] = useState<'historico' | 'saidas' | 'produtos' | 'fornecedores'>('historico');
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deletingVenda, setDeletingVenda] = useState<any>(null);
  const [deletingDespesa, setDeletingDespesa] = useState<any>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<'tudo' | 'hoje' | '7dias' | '30dias'>('tudo');
  
  // Selection state for bulk operations
  const [selectedVendaIds, setSelectedVendaIds] = useState<string[]>([]);

  // Modals inside VendasView
  const [showAddProd, setShowAddProd] = useState(false);
  const [showAddSupp, setShowAddSupp] = useState(false);

  // New product form
  const isPlrWorkspace = activeWorkspace?.tipo === 'plr_infoproduto';
  const [prodTipo, setProdTipo] = useState<'fisico' | 'digital_plr'>(isPlrWorkspace ? 'digital_plr' : 'fisico');
  const [prodNome, setProdNome] = useState('');
  const [prodCat, setProdCat] = useState('Infoprodutos');
  const [prodSuppId, setProdSuppId] = useState('');
  const [prodCompra, setProdCompra] = useState('');
  const [prodVenda, setProdVenda] = useState('');
  const [prodQty, setProdQty] = useState('100');
  const [prodLote, setProdLote] = useState('100');
  const [createProdKits, setCreateProdKits] = useState<{ qtd: number; preco: number }[]>([]);
  const [prodTemOrderBump, setProdTemOrderBump] = useState(false);
  const [prodOrderBumps, setProdOrderBumps] = useState<{ id: string; nome: string; preco: number }[]>([]);
  const [newOrderBumpNome, setNewOrderBumpNome] = useState('');
  const [newOrderBumpPreco, setNewOrderBumpPreco] = useState('');
  const [prodTemUpsell, setProdTemUpsell] = useState(false);
  const [prodUpsells, setProdUpsells] = useState<{ id: string; nome: string; preco: number }[]>([]);
  const [newUpsellNome, setNewUpsellNome] = useState('');
  const [newUpsellPreco, setNewUpsellPreco] = useState('');

  // New supplier form
  const [suppNome, setSuppNome] = useState('');
  const [suppFone, setSuppFone] = useState('');
  const [suppPendente, setSuppPendente] = useState('');
  const [suppTipoOrigem, setSuppTipoOrigem] = useState<'importado' | 'local'>('importado');

  // Product editing
  const [editingProd, setEditingProd] = useState<any>(null);
  const [editProdTipo, setEditProdTipo] = useState<'fisico' | 'digital_plr'>('fisico');
  const [editProdNome, setEditProdNome] = useState('');
  const [editProdCat, setEditProdCat] = useState('Infoprodutos');
  const [editProdSuppId, setEditProdSuppId] = useState('');
  const [editProdCompra, setEditProdCompra] = useState('');
  const [editProdVenda, setEditProdVenda] = useState('');
  const [editProdQty, setEditProdQty] = useState('');
  const [editProdLote, setEditProdLote] = useState('100');
  const [editProdKits, setEditProdKits] = useState<{ qtd: number; preco: number }[]>([]);
  const [editProdTemOrderBump, setEditProdTemOrderBump] = useState(false);
  const [editProdOrderBumps, setEditProdOrderBumps] = useState<{ id: string; nome: string; preco: number }[]>([]);
  const [editNewOrderBumpNome, setEditNewOrderBumpNome] = useState('');
  const [editNewOrderBumpPreco, setEditNewOrderBumpPreco] = useState('');
  const [editProdTemUpsell, setEditProdTemUpsell] = useState(false);
  const [editProdUpsells, setEditProdUpsells] = useState<{ id: string; nome: string; preco: number }[]>([]);
  const [editNewUpsellNome, setEditNewUpsellNome] = useState('');
  const [editNewUpsellPreco, setEditNewUpsellPreco] = useState('');

  // Supplier editing
  const [editingSupp, setEditingSupp] = useState<any>(null);
  const [editSuppNome, setEditSuppNome] = useState('');
  const [editSuppFone, setEditSuppFone] = useState('');
  const [editSuppPendente, setEditSuppPendente] = useState('');
  const [editSuppTipoOrigem, setEditSuppTipoOrigem] = useState<'importado' | 'local'>('importado');

  // Kit temporary inputs for form
  const [newKitQty, setNewKitQty] = useState('');
  const [newKitPreco, setNewKitPreco] = useState('');

  const currency = profile?.moeda || 'MT';

  // Filters
  const getLocalDateStr = (date: Date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const filteredVendas = vendas.filter(v => {
    const prod = produtos.find(p => p.id === v.produto_id);
    const prodName = prod ? prod.nome : 'Produto Desconhecido';
    const matchesSearch = prodName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (v.observacao && v.observacao.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (dateFilter === 'tudo') return true;

    const todayStr = getLocalDateStr(new Date());
    if (dateFilter === 'hoje') {
      return v.data_venda === todayStr;
    }

    if (dateFilter === '7dias') {
      const limit = new Date();
      limit.setDate(limit.getDate() - 7);
      return v.data_venda >= getLocalDateStr(limit);
    }

    if (dateFilter === '30dias') {
      const limit = new Date();
      limit.setDate(limit.getDate() - 30);
      return v.data_venda >= getLocalDateStr(limit);
    }

    return true;
  });

  const filteredDespesas = despesas.filter(d => {
    const cx = caixinhas.find(c => c.id === d.caixinha_id);
    const cxName = cx ? cx.nome : 'Despesa Geral';
    const matchesSearch = (d.descricao && d.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.categoria && d.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cxName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === 'tudo') return true;

    const todayStr = getLocalDateStr(new Date());
    if (dateFilter === 'hoje') {
      return d.data === todayStr;
    }

    if (dateFilter === '7dias') {
      const limit = new Date();
      limit.setDate(limit.getDate() - 7);
      return d.data >= getLocalDateStr(limit);
    }

    if (dateFilter === '30dias') {
      const limit = new Date();
      limit.setDate(limit.getDate() - 30);
      return d.data >= getLocalDateStr(limit);
    }

    return true;
  });

  const filteredProdutos = produtos.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFornecedores = fornecedores.filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectAll = () => {
    if (selectedVendaIds.length === filteredVendas.length) {
      setSelectedVendaIds([]);
    } else {
      setSelectedVendaIds(filteredVendas.map(v => v.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedVendaIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedVendaIds.length > 0) {
      setIsBulkDeleteOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selectedVendaIds) {
        await deleteVenda(id);
      }
      setSelectedVendaIds([]);
      setIsBulkDeleteOpen(false);
    } catch (err) {
      alert("Erro ao excluir vendas em massa.");
    }
  };

  const handleBulkMarkFulfilled = async () => {
    try {
      for (const id of selectedVendaIds) {
        await editVenda(id, { status: 'entregue' });
      }
      setSelectedVendaIds([]);
    } catch (err) {
      alert("Erro ao marcar vendas como entregues.");
    }
  };

  // Product save handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNome || !prodVenda) return;
    if (prodTipo === 'fisico' && !prodCompra) return;
    try {
      await addProduto({
        tipo: prodTipo,
        nome: prodNome,
        categoria: prodCat,
        fornecedor_id: prodTipo === 'digital_plr' ? undefined : prodSuppId,
        preco_compra: prodTipo === 'digital_plr' ? 0 : parseFloat(prodCompra) || 0,
        preco_venda: parseFloat(prodVenda),
        quantidade: prodTipo === 'digital_plr' ? 999999 : (parseInt(prodQty) || 0),
        lote_reposicao: prodTipo === 'digital_plr' ? 0 : (parseInt(prodLote) || 100),
        kits: prodTipo === 'digital_plr' ? [] : createProdKits,
        tem_order_bump: prodTemOrderBump,
        order_bumps: prodTemOrderBump ? prodOrderBumps : [],
        tem_upsell: prodTemUpsell,
        upsells: prodTemUpsell ? prodUpsells : []
      });
      setProdNome('');
      setProdCompra('');
      setProdVenda('');
      setProdQty('100');
      setProdLote('100');
      setCreateProdKits([]);
      setProdTemOrderBump(false);
      setProdOrderBumps([]);
      setProdTemUpsell(false);
      setProdUpsells([]);
      setShowAddProd(false);
    } catch (e) {
      alert('Erro ao criar produto.');
    }
  };

  // Supplier save handler
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppNome) return;
    try {
      await addFornecedor({
        nome: suppNome,
        telefone: suppFone,
        valor_pendente: suppPendente ? parseFloat(suppPendente) || 0 : 0,
        tipo_origem: suppTipoOrigem
      });
      setSuppNome('');
      setSuppFone('');
      setSuppPendente('');
      setSuppTipoOrigem('importado');
      setShowAddSupp(false);
    } catch (e) {
      alert('Erro ao criar fornecedor.');
    }
  };

  // Product edit handler
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd || !editProdNome || !editProdVenda) return;
    if (editProdTipo === 'fisico' && !editProdCompra) return;
    try {
      await editProduto(editingProd.id, {
        tipo: editProdTipo,
        nome: editProdNome,
        categoria: editProdCat,
        fornecedor_id: editProdTipo === 'digital_plr' ? undefined : editProdSuppId,
        preco_compra: editProdTipo === 'digital_plr' ? 0 : parseFloat(editProdCompra) || 0,
        preco_venda: parseFloat(editProdVenda),
        quantidade: editProdTipo === 'digital_plr' ? 999999 : (parseInt(editProdQty) || 0),
        lote_reposicao: editProdTipo === 'digital_plr' ? 0 : (parseInt(editProdLote) || 100),
        kits: editProdTipo === 'digital_plr' ? [] : editProdKits,
        tem_order_bump: editProdTemOrderBump,
        order_bumps: editProdTemOrderBump ? editProdOrderBumps : [],
        tem_upsell: editProdTemUpsell,
        upsells: editProdTemUpsell ? editProdUpsells : []
      });
      setEditingProd(null);
    } catch (e) {
      alert('Erro ao editar produto.');
    }
  };

  // Supplier edit handler
  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupp || !editSuppNome) return;
    try {
      await editFornecedor(editingSupp.id, {
        nome: editSuppNome,
        telefone: editSuppFone,
        valor_pendente: parseFloat(editSuppPendente) || 0,
        tipo_origem: editSuppTipoOrigem
      });
      setEditingSupp(null);
    } catch (e) {
      alert('Erro ao editar fornecedor.');
    }
  };

  return (
    <div className="space-y-4" id="vendas_view">
      
      {/* Sub tabs navigation */}
      <div className="bg-slate-100 p-1.5 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1" id="vendas_subtabs">
        <button
          id="tab_venda_historico"
          onClick={() => { setSubTab('historico'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'historico' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vendas</span>
        </button>
        <button
          id="tab_venda_saidas"
          onClick={() => { setSubTab('saidas'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'saidas' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          <span>Saídas</span>
        </button>
        <button
          id="tab_venda_produtos"
          onClick={() => { setSubTab('produtos'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'produtos' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
          <span>Produtos</span>
        </button>
        <button
          id="tab_venda_fornecedores"
          onClick={() => { setSubTab('fornecedores'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'fornecedores' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span>Fornecedores</span>
        </button>
      </div>

      {/* Search / Actions Bar */}
      <div className="space-y-2.5" id="vendas_filter_and_search_group">
        <div className="flex space-x-2" id="vendas_actions_bar">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center space-x-2 flex-1 shadow-sm" id="search_input_wrapper">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              id="vendas_search_input"
              type="text"
              placeholder={
                subTab === 'historico' ? 'Pesquisar vendas...' :
                subTab === 'saidas' ? 'Pesquisar saídas / despesas...' :
                subTab === 'produtos' ? 'Pesquisar produtos...' : 'Pesquisar fornecedores...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          {subTab === 'produtos' && (
            <button
              id="btn_open_add_product"
              onClick={() => setShowAddProd(true)}
              className="bg-emerald-600 text-white font-extrabold px-3.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center text-xs space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Criar</span>
            </button>
          )}

          {subTab === 'fornecedores' && (
            <button
              id="btn_open_add_supplier"
              onClick={() => setShowAddSupp(true)}
              className="bg-emerald-600 text-white font-extrabold px-3.5 rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center text-xs space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Criar</span>
            </button>
          )}
        </div>

        {(subTab === 'historico' || subTab === 'saidas') && (
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 border border-slate-200/60 rounded-xl max-w-fit shadow-sm" id="vendas_date_filters">
            {[
              { id: 'tudo', label: 'Tudo' },
              { id: 'hoje', label: 'Hoje' },
              { id: '7dias', label: 'Últimos 7 dias' },
              { id: '30dias', label: 'Últimos 30 dias' }
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                id={`btn_filter_date_${filter.id}`}
                onClick={() => setDateFilter(filter.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  dateFilter === filter.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= 1. SALES HISTORY PANEL ================= */}
      {subTab === 'historico' && (
        <div className="space-y-4" id="vendas_historico_panel">
          {/* Bulk Operations Sticky/Floating Action Bar */}
          {selectedVendaIds.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200" id="bulk_actions_bar">
              <div className="flex items-center space-x-2.5">
                <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-black">{selectedVendaIds.length} {selectedVendaIds.length === 1 ? 'venda selecionada' : 'vendas selecionadas'}</p>
                  <p className="text-[10px] text-slate-400">Ações em massa para os itens marcados</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn_bulk_mark_fulfilled"
                  onClick={handleBulkMarkFulfilled}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Marcar Entregue</span>
                </button>
                <button
                  type="button"
                  id="btn_bulk_delete"
                  onClick={handleBulkDelete}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
                <button
                  type="button"
                  id="btn_bulk_clear"
                  onClick={() => setSelectedVendaIds([])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {filteredVendas.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_sales">
              <p className="text-xs font-bold text-slate-700">Nenhuma venda registada.</p>
              <p className="text-[10px] text-slate-500">Toca no botão "+" flutuante no fundo para registar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm" id="vendas_table_wrapper">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs" id="vendas_table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredVendas.length > 0 && selectedVendaIds.length === filteredVendas.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        id="checkbox_select_all_vendas"
                      />
                    </th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Forma Pag.</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Margem</th>
                    <th className="p-4">Distribuição (Breakdown)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVendas.map(v => {
                    const prod = produtos.find(p => p.id === v.produto_id);
                    const prodName = prod ? prod.nome : 'Produto Desconhecido';
                    const sCost = prod ? prod.preco_compra : 0;
                    const qty = v.quantidade || 1;
                    const purchaseCost = sCost * qty;
                    const margin = v.valor_recebido - purchaseCost;
                    const isSelected = selectedVendaIds.includes(v.id);

                    return (
                      <tr 
                        key={v.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}
                        id={`venda_row_${v.id}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(v.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            id={`checkbox_select_venda_${v.id}`}
                          />
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-500">
                          {v.data_venda}
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{prodName}</div>
                          {v.quantidade && v.quantidade > 1 && (
                            <span className="text-[10px] text-slate-500">Qtd: {v.quantidade}x</span>
                          )}
                          {v.observacao && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[150px]" title={v.observacao}>
                              📝 {v.observacao}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-medium text-slate-600">
                          {v.forma_pagamento}
                        </td>
                        <td className="p-4 font-black text-slate-900 dark:text-slate-100">
                          {formatMoney(v.valor_recebido, currency)}
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${margin > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {margin} {currency}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                              Luc: {v.distribuicao[caixasId('lucro')] || 0}
                            </span>
                            <span className="text-[9px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold">
                              Ads: {v.distribuicao[caixasId('anuncios')] || 0}
                            </span>
                            {Boolean(v.distribuicao[caixasId('fornecedores')]) && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                                For: {v.distribuicao[caixasId('fornecedores')] || 0}
                              </span>
                            )}
                            {Boolean(v.distribuicao[caixasId('delivery')]) && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                Del: {v.distribuicao[caixasId('delivery')] || 0}
                              </span>
                            )}
                            {Boolean(v.taxa_venda_total) && (
                              <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                Taxa: {v.taxa_venda_total}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {v.status === 'entregue' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 mr-0.5 stroke-[3]" />
                              Entregue
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {v.status !== 'entregue' && (
                              <button
                                type="button"
                                onClick={() => editVenda(v.id, { status: 'entregue' })}
                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Marcar como entregue"
                                id={`btn_deliver_venda_${v.id}`}
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingVenda(v);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Excluir venda"
                              id={`btn_delete_venda_${v.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= SAÍDAS / DESPESAS PANEL ================= */}
      {subTab === 'saidas' && (
        <div className="space-y-4" id="vendas_saidas_panel">
          {/* Saídas Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total de Saídas</span>
              <span className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400">
                -{formatMoney(filteredDespesas.reduce((acc, d) => acc + (d.valor || 0), 0))} {currency}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registros</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {filteredDespesas.length}
              </span>
            </div>
            <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Período</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {dateFilter === 'tudo' ? 'Todo o Histórico' : dateFilter === 'hoje' ? 'Hoje' : dateFilter === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
              </span>
            </div>
          </div>

          {filteredDespesas.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_saidas">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhuma saída ou despesa registrada.</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Use o botão de registrar despesa no topo para registrar custos operacionais, anúncios ou retiradas.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="table_saidas_list">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-3 pl-4">Data</th>
                      <th className="p-3">Descrição & Categoria</th>
                      <th className="p-3">Caixinha (Pocket)</th>
                      <th className="p-3">Conta / Carteira</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3 text-right pr-4">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDespesas.map(d => {
                      const cx = caixinhas.find(c => c.id === d.caixinha_id);
                      const conta = contasBancarias.find(c => c.id === d.conta_id);

                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors" id={`row_despesa_${d.id}`}>
                          <td className="p-3 pl-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                            {d.data}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{d.descricao || 'Despesa sem descrição'}</div>
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {d.categoria || 'Geral'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {cx?.nome || 'Geral'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {conta ? conta.nome : <span className="text-slate-400 italic">Automática</span>}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                              -{formatMoney(d.valor)} {currency}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 whitespace-nowrap">
                            <button
                              onClick={() => setDeletingDespesa(d)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Excluir saída e estornar valores"
                              id={`btn_delete_despesa_${d.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. PRODUCTS PANEL ================= */}
      {subTab === 'produtos' && (
        <div className="space-y-3" id="vendas_produtos_panel">
          {filteredProdutos.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_products">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum produto cadastrado.</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Adicione produtos para habilitar a distribuição rápida de vendas.</p>
            </div>
          ) : (
            filteredProdutos.map(p => {
              const supp = fornecedores.find(f => f.id === p.fornecedor_id);
              const loteSize = p.lote_reposicao || 100;
              const reinvestVal = (p.preco_compra || 0) * loteSize;

              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3" id={`product_card_${p.id}`}>
                  <div className="flex justify-between items-start" id="product_top_info">
                    <div className="space-y-1" id="product_details">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{p.nome}</span>
                        {p.tipo === 'digital_plr' ? (
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                            <Laptop className="w-2.5 h-2.5" />
                            <span>PLR / Digital</span>
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">
                            Físico
                          </span>
                        )}
                      </div>

                      {p.tipo === 'digital_plr' ? (
                        <div className="flex items-center space-x-2 text-[9px] text-slate-500 dark:text-slate-400 font-medium" id="product_costs">
                          <span>Ticket / Venda: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{p.preco_venda} {currency}</strong></span>
                          <span>•</span>
                          <span className="text-purple-600 dark:text-purple-400 font-bold">Sem Custo de Compra</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-[9px] text-slate-500 dark:text-slate-400 font-medium" id="product_costs">
                          <span>Compra: <strong className="text-amber-700 dark:text-amber-400 font-bold">{p.preco_compra} {currency}</strong></span>
                          <span>•</span>
                          <span>Venda: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{p.preco_venda} {currency}</strong></span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {p.tipo === 'digital_plr' ? (
                          <>
                            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold inline-block">
                              Estoque Infinito (Digital)
                            </span>
                            {p.order_bumps && p.order_bumps.length > 0 && (
                              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold inline-block">
                                Order Bumps ({p.order_bumps.length})
                              </span>
                            )}
                            {p.upsells && p.upsells.length > 0 && (
                              <span className="text-[9px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold inline-block">
                                Upsells ({p.upsells.length})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold inline-block ${
                              p.quantidade === 0 
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                                : p.quantidade <= 5 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`} id="product_stock">
                              Qtd: {p.quantidade} em estoque
                            </span>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold inline-block">
                              Lote Reposição: {loteSize} un.
                            </span>
                            {supp && (
                              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold inline-block" id="product_supplier_badge">
                                Fornecedor: {supp.nome}
                              </span>
                            )}
                            {p.kits && p.kits.length > 0 && (
                              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold inline-block" id="product_kits_badge">
                                Kits ({p.kits.length})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5" id="product_actions">
                      <div className="text-right" id="product_margin_badge">
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-wide block font-black">Margem Bruta</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block flex items-center justify-end">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                          {p.margem}%
                        </span>
                      </div>
                      <button
                        id={`btn_edit_product_${p.id}`}
                        onClick={() => {
                          setEditingProd(p);
                          setEditProdTipo(p.tipo || 'fisico');
                          setEditProdNome(p.nome);
                          setEditProdCat(p.categoria);
                          setEditProdSuppId(p.fornecedor_id || '');
                          setEditProdCompra((p.preco_compra || 0).toString());
                          setEditProdVenda(p.preco_venda.toString());
                          setEditProdQty((p.quantidade || 0).toString());
                          setEditProdLote((p.lote_reposicao || 100).toString());
                          setEditProdKits(p.kits || []);
                          setEditProdTemOrderBump(Boolean(p.tem_order_bump));
                          setEditProdOrderBumps(p.order_bumps || []);
                          setEditProdTemUpsell(Boolean(p.tem_upsell));
                          setEditProdUpsells(p.upsells || []);
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Editar produto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock zero / low alerts with exact reinvestment cost calculation - Only for Physical Products */}
                  {p.tipo !== 'digital_plr' && (p.quantidade === 0 ? (
                    <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2" id={`prod_zero_alert_${p.id}`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1 text-rose-700 dark:text-rose-400 font-extrabold text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>ESTOQUE ZERADO / A REPOR</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">
                          Para repor este estoque, você precisa re-investir <strong className="text-rose-700 dark:text-rose-400 font-black">{reinvestVal.toLocaleString()} {currency}</strong> (Custo: {p.preco_compra} {currency} × Lote de {loteSize} un.).
                        </p>
                      </div>
                      <button
                        type="button"
                        id={`btn_repor_lote_${p.id}`}
                        onClick={() => {
                          editProduto(p.id, { quantidade: loteSize });
                        }}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <span>⚡ Repor Lote (+{loteSize} un.)</span>
                      </button>
                    </div>
                  ) : p.quantidade <= 5 ? (
                    <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2" id={`prod_low_alert_${p.id}`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1 text-amber-800 dark:text-amber-400 font-extrabold text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>ESTOQUE FINALIZANDO ({p.quantidade} un. restantes)</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">
                          Valor de re-investimento para reposição do lote ({loteSize} un.): <strong className="text-amber-800 dark:text-amber-300 font-black">{reinvestVal.toLocaleString()} {currency}</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        id={`btn_repor_low_${p.id}`}
                        onClick={() => {
                          editProduto(p.id, { quantidade: p.quantidade + loteSize });
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <span>+ Adicionar Lote (+{loteSize} un.)</span>
                      </button>
                    </div>
                  ) : null)}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= 3. SUPPLIERS PANEL ================= */}
      {subTab === 'fornecedores' && (
        <div className="space-y-2.5" id="vendas_fornecedores_panel">
          {filteredFornecedores.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_suppliers">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum fornecedor cadastrado.</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Crie fornecedores e produtos para acompanhar o estoque e compras.</p>
            </div>
          ) : (
            filteredFornecedores.map(f => {
              const isImportado = f.tipo_origem === 'importado';
              const suppProds = produtos.filter(p => p.fornecedor_id === f.id);
              const totalStockQty = suppProds.reduce((acc, p) => acc + (p.quantidade || 0), 0);
              const totalStockVal = suppProds.reduce((acc, p) => acc + ((p.preco_compra || 0) * (p.quantidade || 0)), 0);

              const zeroStockProds = suppProds.filter(p => p.quantidade === 0);
              const totalZeroReinvest = zeroStockProds.reduce((acc, p) => acc + ((p.preco_compra || 0) * (p.lote_reposicao || 100)), 0);

              return (
                <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow" id={`supplier_card_${f.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1" id="supplier_details">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">{f.nome}</span>
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isImportado 
                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900' 
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        }`}>
                          {isImportado ? '✈️ Importador Próprio (Eu / Loja)' : '🇲🇿 Local (Compra Imediata na Hora)'}
                        </span>
                      </div>
                      {f.telefone && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center font-medium" id="supplier_phone">
                          <Phone className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
                          {f.telefone}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium">Criado em: {new Date(f.criado_em).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2" id="supplier_actions">
                      <button
                        id={`btn_edit_supplier_${f.id}`}
                        onClick={() => {
                          setEditingSupp(f);
                          setEditSuppNome(f.nome);
                          setEditSuppFone(f.telefone || '');
                          setEditSuppPendente('0');
                          setEditSuppTipoOrigem(f.tipo_origem || 'importado');
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Editar fornecedor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Zero stock alert banner for suppliers */}
                  {zeroStockProds.length > 0 && (
                    <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2" id={`supplier_zerostock_box_${f.id}`}>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider block flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          ⚠️ {zeroStockProds.length} produto(s) com Estoque Zerado
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">
                          Produtos esgotados: {zeroStockProds.map(p => p.nome).join(', ')}.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-700 dark:text-rose-400 block">
                          {totalZeroReinvest.toLocaleString()} {currency}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold">
                          (Capital para Repor Lote)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock Investment Calculation Box - ONLY for Importador Próprio */}
                  {isImportado && (
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2" id={`supplier_investment_box_${f.id}`}>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 tracking-wider block">
                          💡 Investimento Total em Stock Importado ({totalStockQty} un.)
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {totalStockQty > 0 
                            ? `Total necessário para re-investir e repor as mesmas unidades de stock importado.`
                            : `Sem unidades em stock no momento. Adicione estoque nos produtos para calcular o valor de reposição.`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 block">
                          {totalStockVal.toLocaleString()} {currency}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-semibold">
                          (Soma de Custo x Qtd)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Supplier Products List and Quick Add Button */}
                  <div className="pt-2 border-t border-slate-100/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2" id="supplier_products_section">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Produtos ({suppProds.length}):</span>
                      {suppProds.length === 0 ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Nenhum produto associado ainda</span>
                      ) : (
                        suppProds.map(sp => (
                          <span key={sp.id} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg font-bold flex items-center space-x-1">
                            <span>{sp.nome}</span>
                            {isImportado && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">({sp.quantidade} un. • {sp.preco_compra * sp.quantidade} {currency})</span>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      id={`btn_add_product_for_supp_${f.id}`}
                      onClick={() => {
                        setProdSuppId(f.id);
                        setShowAddProd(true);
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] px-2.5 py-1 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Adicionar Produto</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= CREATE PRODUCT MODAL ================= */}
      {showAddProd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_product_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto" id="add_product_content">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">
                {prodTipo === 'digital_plr' ? 'Novo Infoproduto / PLR' : 'Novo Produto Físico (Drop)'}
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setProdTipo('digital_plr')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    prodTipo === 'digital_plr' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  PLR / Digital
                </button>
                <button
                  type="button"
                  onClick={() => setProdTipo('fisico')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    prodTipo === 'fisico' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Físico (Drop)
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4" id="add_product_form">
              <div className="space-y-1" id="prod_nome_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  {prodTipo === 'digital_plr' ? 'Nome do Infoproduto / E-book / Curso' : 'Nome do Produto'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={prodTipo === 'digital_plr' ? 'Ex: Método Vendas Rápidas PLR' : 'Ex: Relógio Inteligente S9'}
                  value={prodNome}
                  onChange={(e) => setProdNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
                />
              </div>

              {prodTipo === 'digital_plr' ? (
                /* PLR / DIGITAL SPECIFIC FIELDS */
                <div className="space-y-4" id="plr_specific_fields">
                  <div className="space-y-1" id="prod_venda_group_plr">
                    <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      Preço de Venda (Ticket Principal) ({currency})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={prodVenda}
                      onChange={(e) => setProdVenda(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Order Bumps Section */}
                  <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-2xl space-y-3" id="plr_order_bumps_section">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="check_add_order_bump"
                          checked={prodTemOrderBump}
                          onChange={(e) => setProdTemOrderBump(e.target.checked)}
                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="check_add_order_bump" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                          Possui Order Bump (Oferta no Checkout)?
                        </label>
                      </div>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        {prodOrderBumps.length} configurado(s)
                      </span>
                    </div>

                    {prodTemOrderBump && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Order Bump (Ex: Áudio-book VIP)"
                            value={newOrderBumpNome}
                            onChange={(e) => setNewOrderBumpNome(e.target.value)}
                            className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                          />
                          <input
                            type="number"
                            placeholder={`Preço (${currency})`}
                            value={newOrderBumpPreco}
                            onChange={(e) => setNewOrderBumpPreco(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const p = parseFloat(newOrderBumpPreco);
                              if (newOrderBumpNome.trim() && p > 0) {
                                setProdOrderBumps(prev => [...prev, { id: `bump_${Date.now()}`, nome: newOrderBumpNome.trim(), preco: p }]);
                                setNewOrderBumpNome('');
                                setNewOrderBumpPreco('');
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                          >
                            + Add
                          </button>
                        </div>

                        {prodOrderBumps.length > 0 && (
                          <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {prodOrderBumps.map((b) => (
                              <div key={b.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{b.nome}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-purple-600 dark:text-purple-400">+{b.preco} {currency}</span>
                                  <button
                                    type="button"
                                    onClick={() => setProdOrderBumps(prev => prev.filter(x => x.id !== b.id))}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold ml-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upsells Section */}
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl space-y-3" id="plr_upsells_section">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="check_add_upsell"
                          checked={prodTemUpsell}
                          onChange={(e) => setProdTemUpsell(e.target.checked)}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="check_add_upsell" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                          Possui Upsell (Oferta de 1 clique pós-compra)?
                        </label>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        {prodUpsells.length} configurado(s)
                      </span>
                    </div>

                    {prodTemUpsell && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Upsell (Ex: Mentoria / Acesso VIP)"
                            value={newUpsellNome}
                            onChange={(e) => setNewUpsellNome(e.target.value)}
                            className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                          <input
                            type="number"
                            placeholder={`Preço (${currency})`}
                            value={newUpsellPreco}
                            onChange={(e) => setNewUpsellPreco(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const p = parseFloat(newUpsellPreco);
                              if (newUpsellNome.trim() && p > 0) {
                                setProdUpsells(prev => [...prev, { id: `upsell_${Date.now()}`, nome: newUpsellNome.trim(), preco: p }]);
                                setNewUpsellNome('');
                                setNewUpsellPreco('');
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                          >
                            + Add
                          </button>
                        </div>

                        {prodUpsells.length > 0 && (
                          <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {prodUpsells.map((u) => (
                              <div key={u.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{u.nome}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">+{u.preco} {currency}</span>
                                  <button
                                    type="button"
                                    onClick={() => setProdUpsells(prev => prev.filter(x => x.id !== u.id))}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold ml-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    💡 <strong>Modelo PLR / Infoproduto:</strong> Estoque ilimitado e 100% de margem bruta. Não há custo de fornecedor físico nem controle de reposição.
                  </div>
                </div>
              ) : (
                /* PHYSICAL PRODUCT SPECIFIC FIELDS */
                <div className="space-y-3.5" id="fisico_specific_fields">
                  <div className="grid grid-cols-2 gap-3" id="prod_prices_group">
                    <div className="space-y-1" id="prod_compra_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Preço Compra ({currency})</label>
                      <input
                        type="number"
                        required={prodTipo === 'fisico'}
                        placeholder="0.00"
                        value={prodCompra}
                        onChange={(e) => setProdCompra(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="prod_venda_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Preço Venda ({currency})</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={prodVenda}
                        onChange={(e) => setProdVenda(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2" id="prod_qty_supp_group">
                    <div className="space-y-1" id="prod_qty_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Qtd Atual</label>
                      <input
                        type="number"
                        required={prodTipo === 'fisico'}
                        value={prodQty}
                        onChange={(e) => setProdQty(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="prod_lote_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Lote Reposição</label>
                      <input
                        type="number"
                        required={prodTipo === 'fisico'}
                        placeholder="100"
                        value={prodLote}
                        onChange={(e) => setProdLote(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="prod_supp_group">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Fornecedor</label>
                      </div>
                      <select
                        value={prodSuppId}
                        onChange={(e) => setProdSuppId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="">Nenhum...</option>
                        {fornecedores.map(f => (
                          <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kits configuration */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3" id="prod_kits_config">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Kits de Desconto (Preço Unitário Especial)</label>
                    <div className="flex space-x-2" id="prod_kits_inputs">
                      <input
                        type="number"
                        placeholder="Qtd mínima"
                        value={newKitQty}
                        onChange={(e) => setNewKitQty(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                      <input
                        type="number"
                        placeholder={`Unitário (${currency})`}
                        value={newKitPreco}
                        onChange={(e) => setNewKitPreco(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const q = parseInt(newKitQty);
                          const p = parseFloat(newKitPreco);
                          if (q > 0 && p > 0) {
                            setCreateProdKits(prev => [...prev, { qtd: q, preco: p }].sort((a,b) => a.qtd - b.qtd));
                            setNewKitQty('');
                            setNewKitPreco('');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                    {createProdKits.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 space-y-1.5 max-h-24 overflow-y-auto" id="prod_kits_list">
                        {createProdKits.map((k, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-300">
                            <span>A partir de <strong className="text-slate-800 dark:text-slate-100">{k.qtd} unid.</strong>: <strong className="text-emerald-600 dark:text-emerald-400">{k.preco} {currency}</strong> cada</span>
                            <button
                              type="button"
                              onClick={() => setCreateProdKits(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2" id="prod_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddProd(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    prodTipo === 'digital_plr' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Confirmar {prodTipo === 'digital_plr' ? 'Infoproduto' : 'Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_product_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[92vh]" id="edit_product_content">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">
                Editar {editProdTipo === 'digital_plr' ? 'Infoproduto / PLR' : 'Produto de Drop'}
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setEditProdTipo('digital_plr')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    editProdTipo === 'digital_plr' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  PLR / Digital
                </button>
                <button
                  type="button"
                  onClick={() => setEditProdTipo('fisico')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    editProdTipo === 'fisico' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Físico (Drop)
                </button>
              </div>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4" id="edit_product_form">
              <div className="space-y-1" id="edit_prod_nome_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  {editProdTipo === 'digital_plr' ? 'Nome do Infoproduto / PLR' : 'Nome do Produto'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do produto"
                  value={editProdNome}
                  onChange={(e) => setEditProdNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                />
              </div>

              {editProdTipo === 'digital_plr' ? (
                /* EDIT PLR / DIGITAL SPECIFIC FIELDS */
                <div className="space-y-4" id="edit_plr_specific_fields">
                  <div className="space-y-1" id="edit_prod_venda_group_plr">
                    <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      Preço de Venda (Ticket Principal) ({currency})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={editProdVenda}
                      onChange={(e) => setEditProdVenda(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Order Bumps Section */}
                  <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-2xl space-y-3" id="edit_plr_order_bumps_section">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="check_edit_order_bump"
                          checked={editProdTemOrderBump}
                          onChange={(e) => setEditProdTemOrderBump(e.target.checked)}
                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="check_edit_order_bump" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                          Possui Order Bump (Oferta no Checkout)?
                        </label>
                      </div>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        {editProdOrderBumps.length} configurado(s)
                      </span>
                    </div>

                    {editProdTemOrderBump && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Order Bump"
                            value={editNewOrderBumpNome}
                            onChange={(e) => setEditNewOrderBumpNome(e.target.value)}
                            className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                          />
                          <input
                            type="number"
                            placeholder={`Preço (${currency})`}
                            value={editNewOrderBumpPreco}
                            onChange={(e) => setEditNewOrderBumpPreco(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const p = parseFloat(editNewOrderBumpPreco);
                              if (editNewOrderBumpNome.trim() && p > 0) {
                                setEditProdOrderBumps(prev => [...prev, { id: `bump_${Date.now()}`, nome: editNewOrderBumpNome.trim(), preco: p }]);
                                setEditNewOrderBumpNome('');
                                setEditNewOrderBumpPreco('');
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                          >
                            + Add
                          </button>
                        </div>

                        {editProdOrderBumps.length > 0 && (
                          <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {editProdOrderBumps.map((b) => (
                              <div key={b.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{b.nome}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-purple-600 dark:text-purple-400">+{b.preco} {currency}</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditProdOrderBumps(prev => prev.filter(x => x.id !== b.id))}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold ml-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upsells Section */}
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl space-y-3" id="edit_plr_upsells_section">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="check_edit_upsell"
                          checked={editProdTemUpsell}
                          onChange={(e) => setEditProdTemUpsell(e.target.checked)}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="check_edit_upsell" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                          Possui Upsell (Oferta de 1 clique pós-compra)?
                        </label>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        {editProdUpsells.length} configurado(s)
                      </span>
                    </div>

                    {editProdTemUpsell && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Upsell"
                            value={editNewUpsellNome}
                            onChange={(e) => setEditNewUpsellNome(e.target.value)}
                            className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                          <input
                            type="number"
                            placeholder={`Preço (${currency})`}
                            value={editNewUpsellPreco}
                            onChange={(e) => setEditNewUpsellPreco(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const p = parseFloat(editNewUpsellPreco);
                              if (editNewUpsellNome.trim() && p > 0) {
                                setEditProdUpsells(prev => [...prev, { id: `upsell_${Date.now()}`, nome: editNewUpsellNome.trim(), preco: p }]);
                                setEditNewUpsellNome('');
                                setEditNewUpsellPreco('');
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                          >
                            + Add
                          </button>
                        </div>

                        {editProdUpsells.length > 0 && (
                          <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {editProdUpsells.map((u) => (
                              <div key={u.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{u.nome}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">+{u.preco} {currency}</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditProdUpsells(prev => prev.filter(x => x.id !== u.id))}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold ml-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    💡 <strong>Modelo PLR / Infoproduto:</strong> Sem custos com fornecedores físicos ou reposição de estoque.
                  </div>
                </div>
              ) : (
                /* EDIT PHYSICAL PRODUCT SPECIFIC FIELDS */
                <div className="space-y-3.5" id="edit_fisico_specific_fields">
                  <div className="grid grid-cols-2 gap-3" id="edit_prod_prices_group">
                    <div className="space-y-1" id="edit_prod_compra_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Preço Compra ({currency})</label>
                      <input
                        type="number"
                        required={editProdTipo === 'fisico'}
                        placeholder="0.00"
                        value={editProdCompra}
                        onChange={(e) => setEditProdCompra(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="edit_prod_venda_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Preço Venda ({currency})</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={editProdVenda}
                        onChange={(e) => setEditProdVenda(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2" id="edit_prod_qty_supp_group">
                    <div className="space-y-1" id="edit_prod_qty_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Qtd Atual</label>
                      <input
                        type="number"
                        required={editProdTipo === 'fisico'}
                        value={editProdQty}
                        onChange={(e) => setEditProdQty(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="edit_prod_lote_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Lote Reposição</label>
                      <input
                        type="number"
                        required={editProdTipo === 'fisico'}
                        placeholder="100"
                        value={editProdLote}
                        onChange={(e) => setEditProdLote(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1" id="edit_prod_supp_group">
                      <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Fornecedor</label>
                      <select
                        value={editProdSuppId}
                        onChange={(e) => setEditProdSuppId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 appearance-none"
                      >
                        <option value="">Nenhum...</option>
                        {fornecedores.map(f => (
                          <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kits Configuration */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3" id="edit_prod_kits_config">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Kits de Desconto (Preço Unitário Especial)</label>
                    <div className="flex space-x-2" id="edit_prod_kits_inputs">
                      <input
                        type="number"
                        placeholder="Qtd mínima"
                        value={newKitQty}
                        onChange={(e) => setNewKitQty(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder={`Unitário (${currency})`}
                        value={newKitPreco}
                        onChange={(e) => setNewKitPreco(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const q = parseInt(newKitQty);
                          const p = parseFloat(newKitPreco);
                          if (q > 0 && p > 0) {
                            setEditProdKits(prev => [...prev, { qtd: q, preco: p }].sort((a,b) => a.qtd - b.qtd));
                            setNewKitQty('');
                            setNewKitPreco('');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                    {editProdKits.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 space-y-1.5 max-h-24 overflow-y-auto" id="edit_prod_kits_list">
                        {editProdKits.map((k, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-300">
                            <span>A partir de <strong className="text-slate-800 dark:text-slate-100">{k.qtd} unid.</strong>: <strong className="text-emerald-600 dark:text-emerald-400">{k.preco} {currency}</strong> cada</span>
                            <button
                              type="button"
                              onClick={() => setEditProdKits(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2" id="edit_prod_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingProd(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    editProdTipo === 'digital_plr' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT SUPPLIER MODAL ================= */}
      {editingSupp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_supplier_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="edit_supplier_content">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Editar Fornecedor</h3>
            <form onSubmit={handleEditSupplier} className="space-y-3.5" id="edit_supplier_form">
              <div className="space-y-1" id="edit_supp_nome_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder=" Shenzhen Factory"
                  value={editSuppNome}
                  onChange={(e) => setEditSuppNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="edit_supp_fone_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: +86 189 2234 ..."
                  value={editSuppFone}
                  onChange={(e) => setEditSuppFone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="edit_supp_tipo_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Tipo do Fornecedor / Origem</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditSuppTipoOrigem('importado')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      editSuppTipoOrigem === 'importado'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">✈️ Importador Próprio</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Produtos importados mantidos em estoque da loja.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSuppTipoOrigem('local')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      editSuppTipoOrigem === 'local'
                        ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">🇲🇿 Fornecedor Local</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Compra imediata na entrega (sem conta/estoque).</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2" id="edit_supp_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingSupp(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CREATE SUPPLIER MODAL ================= */}
      {showAddSupp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_supplier_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="add_supplier_content">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-display">Novo Fornecedor / Origem</h3>
            <form onSubmit={handleAddSupplier} className="space-y-3.5" id="add_supplier_form">
              <div className="space-y-1" id="add_supp_nome_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Nome do Fornecedor / Importador</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eu (Importador Próprio) / Donna Lar"
                  value={suppNome}
                  onChange={(e) => setSuppNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="add_supp_fone_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Telefone / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: +258 84 123 4567 ou +86 189 2234 ..."
                  value={suppFone}
                  onChange={(e) => setSuppFone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="add_supp_tipo_group">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Tipo do Fornecedor</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSuppTipoOrigem('importado')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      suppTipoOrigem === 'importado'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">✈️ Importador Próprio</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Eu / Proprietário (Calcula investimento de reposição).</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuppTipoOrigem('local')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      suppTipoOrigem === 'local'
                        ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">🇲🇿 Fornecedor Local</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Compra imediata na hora (Sem conta/estoque mantido).</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2" id="add_supp_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddSupp(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Confirmar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Single Sale Deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingVenda}
        title="Eliminar Registo de Venda"
        description="Tem certeza que deseja eliminar esta venda? Isso irá estornar a distribuição pelas caixinhas e atualizar o estoque dos produtos."
        onConfirm={async () => {
          if (deletingVenda) {
            await deleteVenda(deletingVenda.id);
            setDeletingVenda(null);
          }
        }}
        onClose={() => setDeletingVenda(null)}
      />

      {/* Confirmation Modal for Bulk Sales Deletion */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title="Eliminar Vendas Selecionadas"
        description={`Tem certeza que deseja eliminar as ${selectedVendaIds.length} vendas selecionadas? Esta ação irá estornar a distribuição de caixinhas e reajustar os estoques.`}
        confirmText={`Eliminar ${selectedVendaIds.length} Vendas`}
        onConfirm={confirmBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />

      {/* Confirmation Modal for Saída / Despesa Deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingDespesa}
        title="Eliminar Saída (Despesa)"
        itemName={deletingDespesa ? `${deletingDespesa.descricao || 'Despesa'} (-${deletingDespesa.valor} ${currency})` : undefined}
        description="Tem certeza que deseja eliminar esta saída? O valor gasto será devolvido e estornado para os cofres (caixinhas) e contas bancárias de origem."
        confirmText="Eliminar Saída"
        onConfirm={async () => {
          if (deletingDespesa) {
            await deleteDespesa(deletingDespesa.id);
            setDeletingDespesa(null);
          }
        }}
        onClose={() => setDeletingDespesa(null)}
      />

    </div>
  );

  // Helper to extract specific standard pocket ID to match distribution layout safely
  function caixasId(tipo: string) {
    const cx = useApp().caixinhas.find(c => c.tipo === tipo);
    return cx ? cx.id : '';
  }
}
