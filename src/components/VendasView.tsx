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
    editFornecedor
  } = useApp();

  const [subTab, setSubTab] = useState<'historico' | 'produtos' | 'fornecedores'>('historico');
  const [searchTerm, setSearchTerm] = useState('');

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
  const filteredVendas = vendas.filter(v => {
    const prod = produtos.find(p => p.id === v.produto_id);
    const prodName = prod ? prod.nome : 'Produto Desconhecido';
    return prodName.toLowerCase().includes(searchTerm.toLowerCase()) || v.observacao.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredProdutos = produtos.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFornecedores = fornecedores.filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));

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
          onClick={() => { setSubTab('historico'); setSearchTerm(''); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'historico' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Vendas</span>
        </button>
        <button
          id="tab_venda_produtos"
          onClick={() => { setSubTab('produtos'); setSearchTerm(''); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'produtos' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Produtos</span>
        </button>
        <button
          id="tab_venda_fornecedores"
          onClick={() => { setSubTab('fornecedores'); setSearchTerm(''); }}
          className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${subTab === 'fornecedores' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Fornecedores</span>
        </button>
      </div>

      {/* Search / Actions Bar */}
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

      {/* ================= 1. SALES HISTORY PANEL ================= */}
      {subTab === 'historico' && (
        <div className="space-y-2.5" id="vendas_historico_panel">
          {filteredVendas.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 space-y-1" id="empty_sales">
              <p className="text-xs font-bold text-slate-700">Nenhuma venda registada.</p>
              <p className="text-[10px] text-slate-500">Toca no botão "+" flutuante no fundo para registar.</p>
            </div>
          ) : (
            filteredVendas.map(v => {
              const prod = produtos.find(p => p.id === v.produto_id);
              const prodName = prod ? prod.nome : 'Produto Desconhecido';
              const sCost = prod ? prod.preco_compra : 0;
              const margin = v.valor_recebido - sCost;
              return (
                <div key={v.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow" id={`sale_card_${v.id}`}>
                  <div className="flex justify-between items-start" id="sale_card_header">
                    <div className="space-y-0.5" id="sale_card_title">
                      <span className="text-xs font-extrabold text-slate-900 block">{prodName}</span>
                      <span className="text-[9px] text-slate-500 block font-medium">Forma Pag: {v.forma_pagamento} | Data: {v.data_venda}</span>
                    </div>
                    <div className="text-right" id="sale_card_price">
                      <span className="text-sm font-black text-emerald-600 block">+{v.valor_recebido} {currency}</span>
                      <span className={`text-[9px] block font-semibold ${margin > 0 ? 'text-slate-500' : 'text-rose-600'}`}>
                        Margem: {margin} {currency}
                      </span>
                    </div>
                  </div>

                  {v.observacao && (
                    <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-600 border border-slate-100" id="sale_card_note">
                      📝 {v.observacao}
                    </div>
                  )}

                  {/* Distribution breakdown */}
                  <div className="bg-slate-50/50 p-2.5 rounded-xl grid grid-cols-4 gap-1 border border-slate-100 text-center" id="sale_card_distribution">
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Lucro</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold">{v.distribuicao[caixasId('lucro')] || 0} {currency}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Ads</span>
                      <span className="text-[10px] text-sky-700 font-extrabold">{v.distribuicao[caixasId('anuncios')] || 0} {currency}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Fornec.</span>
                      <span className="text-[10px] text-amber-700 font-extrabold">{v.distribuicao[caixasId('fornecedores')] || 0} {currency}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Deliv.</span>
                      <span className="text-[10px] text-indigo-700 font-extrabold">{v.distribuicao[caixasId('delivery')] || 0} {currency}</span>
                    </div>
                  </div>
                </div>
              );
            })
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
