/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
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
  X
} from 'lucide-react';

export default function VendasView() {
  const { 
    vendas, 
    produtos, 
    fornecedores, 
    profile, 
    addProduto, 
    addFornecedor,
    editProduto,
    editFornecedor,
    editVenda,
    deleteVenda
  } = useApp();

  const [subTab, setSubTab] = useState<'historico' | 'produtos' | 'fornecedores'>('historico');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'tudo' | 'hoje' | '7dias' | '30dias'>('tudo');
  
  // Selection state for bulk operations
  const [selectedVendaIds, setSelectedVendaIds] = useState<string[]>([]);

  // Modals inside VendasView
  const [showAddProd, setShowAddProd] = useState(false);
  const [showAddSupp, setShowAddSupp] = useState(false);

  // New product form
  const [prodNome, setProdNome] = useState('');
  const [prodCat, setProdCat] = useState('Eletrônicos');
  const [prodSuppId, setProdSuppId] = useState('');
  const [prodCompra, setProdCompra] = useState('');
  const [prodVenda, setProdVenda] = useState('');
  const [prodQty, setProdQty] = useState('100');
  const [createProdKits, setCreateProdKits] = useState<{ qtd: number; preco: number }[]>([]);

  // New supplier form
  const [suppNome, setSuppNome] = useState('');
  const [suppFone, setSuppFone] = useState('');

  // Product editing
  const [editingProd, setEditingProd] = useState<any>(null);
  const [editProdNome, setEditProdNome] = useState('');
  const [editProdCat, setEditProdCat] = useState('Eletrônicos');
  const [editProdSuppId, setEditProdSuppId] = useState('');
  const [editProdCompra, setEditProdCompra] = useState('');
  const [editProdVenda, setEditProdVenda] = useState('');
  const [editProdQty, setEditProdQty] = useState('');
  const [editProdKits, setEditProdKits] = useState<{ qtd: number; preco: number }[]>([]);

  // Supplier editing
  const [editingSupp, setEditingSupp] = useState<any>(null);
  const [editSuppNome, setEditSuppNome] = useState('');
  const [editSuppFone, setEditSuppFone] = useState('');

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

  const handleBulkDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir as ${selectedVendaIds.length} vendas selecionadas? Isso irá estornar a distribuição de caixinhas e atualizar o estoque dos produtos.`)) {
      try {
        for (const id of selectedVendaIds) {
          await deleteVenda(id);
        }
        setSelectedVendaIds([]);
      } catch (err) {
        alert("Erro ao excluir vendas em massa.");
      }
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
    if (!prodNome || !prodCompra || !prodVenda) return;
    try {
      await addProduto({
        nome: prodNome,
        categoria: prodCat,
        fornecedor_id: prodSuppId,
        preco_compra: parseFloat(prodCompra),
        preco_venda: parseFloat(prodVenda),
        quantidade: parseInt(prodQty) || 0,
        kits: createProdKits
      });
      setProdNome('');
      setProdCompra('');
      setProdVenda('');
      setProdQty('100');
      setCreateProdKits([]);
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
        valor_pendente: 0
      });
      setSuppNome('');
      setSuppFone('');
      setShowAddSupp(false);
    } catch (e) {
      alert('Erro ao criar fornecedor.');
    }
  };

  // Product edit handler
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd || !editProdNome || !editProdCompra || !editProdVenda) return;
    try {
      await editProduto(editingProd.id, {
        nome: editProdNome,
        categoria: editProdCat,
        fornecedor_id: editProdSuppId,
        preco_compra: parseFloat(editProdCompra),
        preco_venda: parseFloat(editProdVenda),
        quantidade: parseInt(editProdQty) || 0,
        kits: editProdKits
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
        telefone: editSuppFone
      });
      setEditingSupp(null);
    } catch (e) {
      alert('Erro ao editar fornecedor.');
    }
  };

  return (
    <div className="space-y-4" id="vendas_view">
      
      {/* Sub tabs navigation */}
      <div className="bg-slate-100 p-1.5 rounded-xl grid grid-cols-3 gap-1" id="vendas_subtabs">
        <button
          id="tab_venda_historico"
          onClick={() => { setSubTab('historico'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'historico' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Vendas</span>
        </button>
        <button
          id="tab_venda_produtos"
          onClick={() => { setSubTab('produtos'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'produtos' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Produtos</span>
        </button>
        <button
          id="tab_venda_fornecedores"
          onClick={() => { setSubTab('fornecedores'); setSearchTerm(''); setDateFilter('tudo'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'fornecedores' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="w-3.5 h-3.5" />
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

        {subTab === 'historico' && (
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
                        <td className="p-4 font-black text-slate-900">
                          {v.valor_recebido} {currency}
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
                            <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                              For: {v.distribuicao[caixasId('fornecedores')] || 0}
                            </span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                              Del: {v.distribuicao[caixasId('delivery')] || 0}
                            </span>
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
                                if (confirm("Tem certeza que deseja excluir esta venda? Isso irá estornar a distribuição de caixinhas e atualizar o estoque dos produtos.")) {
                                  deleteVenda(v.id);
                                }
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

      {/* ================= 2. PRODUCTS PANEL ================= */}
      {subTab === 'produtos' && (
        <div className="space-y-2.5" id="vendas_produtos_panel">
          {filteredProdutos.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_products">
              <p className="text-xs font-bold text-slate-700">Nenhum produto cadastrado.</p>
              <p className="text-[10px] text-slate-500">Adicione produtos para habilitar a distribuição rápida de vendas.</p>
            </div>
          ) : (
            filteredProdutos.map(p => (
              <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`product_card_${p.id}`}>
                <div className="space-y-1" id="product_details">
                  <span className="text-xs font-bold text-slate-900 block">{p.nome}</span>
                  <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-medium" id="product_costs">
                    <span>Compra: <strong className="text-amber-700 font-bold">{p.preco_compra} {currency}</strong></span>
                    <span>•</span>
                    <span>Venda: <strong className="text-emerald-700 font-bold">{p.preco_venda} {currency}</strong></span>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold inline-block mr-2" id="product_stock">
                    Qtd: {p.quantidade} em estoque
                  </span>
                  {p.kits && p.kits.length > 0 && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold inline-block" id="product_kits_badge">
                      Kits Configurados ({p.kits.length})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3.5" id="product_actions">
                  <div className="text-right" id="product_margin_badge">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wide block font-black">Margem Bruta</span>
                    <span className="text-xs font-black text-emerald-600 block flex items-center justify-end">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      {p.margem}%
                    </span>
                  </div>
                  <button
                    id={`btn_edit_product_${p.id}`}
                    onClick={() => {
                      setEditingProd(p);
                      setEditProdNome(p.nome);
                      setEditProdCat(p.categoria);
                      setEditProdSuppId(p.fornecedor_id);
                      setEditProdCompra(p.preco_compra.toString());
                      setEditProdVenda(p.preco_venda.toString());
                      setEditProdQty(p.quantidade.toString());
                      setEditProdKits(p.kits || []);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Editar produto"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= 3. SUPPLIERS PANEL ================= */}
      {subTab === 'fornecedores' && (
        <div className="space-y-2.5" id="vendas_fornecedores_panel">
          {filteredFornecedores.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_suppliers">
              <p className="text-xs font-bold text-slate-700">Nenhum fornecedor cadastrado.</p>
              <p className="text-[10px] text-slate-500">Crie fornecedores para controlar as faturas pendentes de estoque.</p>
            </div>
          ) : (
            filteredFornecedores.map(f => (
              <div key={f.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow" id={`supplier_card_${f.id}`}>
                <div className="space-y-1" id="supplier_details">
                  <span className="text-xs font-bold text-slate-900 block">{f.nome}</span>
                  {f.telefone && (
                    <span className="text-[9px] text-slate-500 flex items-center font-medium" id="supplier_phone">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {f.telefone}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 block font-medium">Criado em: {new Date(f.criado_em).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3.5" id="supplier_actions">
                  <div className="text-right" id="supplier_pending_badge">
                    <span className="text-[8px] text-rose-600 uppercase block font-black">Fatura Pendente</span>
                    <span className="text-xs font-extrabold text-rose-600 block">
                      {f.valor_pendente} {currency}
                    </span>
                  </div>
                  <button
                    id={`btn_edit_supplier_${f.id}`}
                    onClick={() => {
                      setEditingSupp(f);
                      setEditSuppNome(f.nome);
                      setEditSuppFone(f.telefone || '');
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Editar fornecedor"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= CREATE PRODUCT MODAL ================= */}
      {showAddProd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add_product_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="add_product_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Novo Produto de Drop</h3>
            <form onSubmit={handleAddProduct} className="space-y-3.5" id="add_product_form">
              <div className="space-y-1" id="prod_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Relógio Inteligente S9"
                  value={prodNome}
                  onChange={(e) => setProdNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3" id="prod_prices_group">
                <div className="space-y-1" id="prod_compra_group">
                  <label className="text-xs text-slate-600 font-semibold">Preço Compra ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={prodCompra}
                    onChange={(e) => setProdCompra(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1" id="prod_venda_group">
                  <label className="text-xs text-slate-600 font-semibold">Preço Venda ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={prodVenda}
                    onChange={(e) => setProdVenda(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3" id="prod_qty_supp_group">
                <div className="space-y-1" id="prod_qty_group">
                  <label className="text-xs text-slate-600 font-semibold">Qtd Estoque</label>
                  <input
                    type="number"
                    required
                    value={prodQty}
                    onChange={(e) => setProdQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1" id="prod_supp_group">
                  <label className="text-xs text-slate-600 font-semibold">Fornecedor</label>
                  <select
                    value={prodSuppId}
                    onChange={(e) => setProdSuppId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 appearance-none"
                  >
                    <option value="">Nenhum...</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kits configuration */}
              <div className="space-y-2 border-t border-slate-100 pt-3" id="prod_kits_config">
                <label className="text-xs font-bold text-slate-700 block">Kits de Desconto (Preço Unitário Especial)</label>
                <div className="flex space-x-2" id="prod_kits_inputs">
                  <input
                    type="number"
                    placeholder="Qtd mínima"
                    value={newKitQty}
                    onChange={(e) => setNewKitQty(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <input
                    type="number"
                    placeholder={`Unitário (${currency})`}
                    value={newKitPreco}
                    onChange={(e) => setNewKitPreco(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs"
                  >
                    + Add
                  </button>
                </div>
                {createProdKits.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 max-h-24 overflow-y-auto" id="prod_kits_list">
                    {createProdKits.map((k, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600">
                        <span>A partir de <strong className="text-slate-800">{k.qtd} unid.</strong>: <strong className="text-emerald-600">{k.preco} {currency}</strong> cada</span>
                        <button
                          type="button"
                          onClick={() => setCreateProdKits(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2" id="prod_modal_actions">
                <button
                  type="button"
                  onClick={() => setShowAddProd(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Confirmar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_product_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]" id="edit_product_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Editar Produto</h3>
            <form onSubmit={handleEditProduct} className="space-y-3.5" id="edit_product_form">
              <div className="space-y-1" id="edit_prod_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do produto"
                  value={editProdNome}
                  onChange={(e) => setEditProdNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3" id="edit_prod_prices_group">
                <div className="space-y-1" id="edit_prod_compra_group">
                  <label className="text-xs text-slate-600 font-semibold">Preço Compra ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={editProdCompra}
                    onChange={(e) => setEditProdCompra(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1" id="edit_prod_venda_group">
                  <label className="text-xs text-slate-600 font-semibold">Preço Venda ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={editProdVenda}
                    onChange={(e) => setEditProdVenda(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3" id="edit_prod_qty_supp_group">
                <div className="space-y-1" id="edit_prod_qty_group">
                  <label className="text-xs text-slate-600 font-semibold">Qtd Estoque</label>
                  <input
                    type="number"
                    required
                    value={editProdQty}
                    onChange={(e) => setEditProdQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1" id="edit_prod_supp_group">
                  <label className="text-xs text-slate-600 font-semibold">Fornecedor</label>
                  <select
                    value={editProdSuppId}
                    onChange={(e) => setEditProdSuppId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 appearance-none"
                  >
                    <option value="">Nenhum...</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kits Configuration */}
              <div className="space-y-2 border-t border-slate-100 pt-3" id="edit_prod_kits_config">
                <label className="text-xs font-bold text-slate-700 block">Kits de Desconto (Preço Unitário Especial)</label>
                <div className="flex space-x-2" id="edit_prod_kits_inputs">
                  <input
                    type="number"
                    placeholder="Qtd mínima"
                    value={newKitQty}
                    onChange={(e) => setNewKitQty(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder={`Unitário (${currency})`}
                    value={newKitPreco}
                    onChange={(e) => setNewKitPreco(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none"
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs"
                  >
                    + Add
                  </button>
                </div>
                {editProdKits.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 max-h-24 overflow-y-auto" id="edit_prod_kits_list">
                    {editProdKits.map((k, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600">
                        <span>A partir de <strong className="text-slate-800">{k.qtd} unid.</strong>: <strong className="text-emerald-600">{k.preco} {currency}</strong> cada</span>
                        <button
                          type="button"
                          onClick={() => setEditProdKits(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2" id="edit_prod_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingProd(null)}
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

      {/* ================= EDIT SUPPLIER MODAL ================= */}
      {editingSupp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="edit_supplier_modal">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl" id="edit_supplier_content">
            <h3 className="font-extrabold text-slate-900 text-base font-display">Editar Fornecedor</h3>
            <form onSubmit={handleEditSupplier} className="space-y-3.5" id="edit_supplier_form">
              <div className="space-y-1" id="edit_supp_nome_group">
                <label className="text-xs text-slate-600 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder=" Shenzhen Factory"
                  value={editSuppNome}
                  onChange={(e) => setEditSuppNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1" id="edit_supp_fone_group">
                <label className="text-xs text-slate-600 font-semibold">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: +86 189 2234 ..."
                  value={editSuppFone}
                  onChange={(e) => setEditSuppFone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2" id="edit_supp_modal_actions">
                <button
                  type="button"
                  onClick={() => setEditingSupp(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Helper to extract specific standard pocket ID to match distribution layout safely
  function caixasId(tipo: string) {
    const cx = useApp().caixinhas.find(c => c.tipo === tipo);
    return cx ? cx.id : '';
  }
}
