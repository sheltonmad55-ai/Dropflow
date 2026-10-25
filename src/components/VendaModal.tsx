/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { X, Sparkles, AlertTriangle, Plus } from 'lucide-react';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VendaModal({ isOpen, onClose }: VendaModalProps) {
  const { produtos, fornecedores, zonasEntrega, addVenda, profile, activeWorkspace, addProduto, addZonaEntrega, addFornecedor, metaItems, contasBancarias } = useApp();
  
  // Form fields
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [produtoId, setProdutoId] = useState<string>('');
  const [fornecedorId, setFornecedorId] = useState<string>('');
  const [zonaEntregaId, setZonaEntregaId] = useState<string>('');
  const [contaId, setContaId] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('M-Pesa');
  const [observacao, setObservacao] = useState<string>('');
  const [dataVenda, setDataVenda] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Niche and Shipping/Fee configurations
  const currentTipo = activeWorkspace?.tipo || profile?.tipo_negocio || 'ecommerce_drop';
  const isShippingActive = (activeWorkspace?.custo_envio_ativo ?? profile?.custo_envio_ativo) !== false && currentTipo !== 'plr_infoproduto';
  const isPlr = currentTipo === 'plr_infoproduto';
  const [taxaVendaTipo, setTaxaVendaTipo] = useState<'percentual' | 'fixo' | 'combinado'>('percentual');
  const [taxaVendaValor, setTaxaVendaValor] = useState<string>('');
  const [taxaVendaFixa, setTaxaVendaFixa] = useState<string>('');
  const [showTaxaOptional, setShowTaxaOptional] = useState<boolean>(false);

  // Custom Ads state (Percentual %, Meticais MT, Dólares USD)
  const [isCustomAds, setIsCustomAds] = useState<boolean>(false);
  const [customAdsTipo, setCustomAdsTipo] = useState<'percentual' | 'mt' | 'usd'>('percentual');
  const [customAdsPercent, setCustomAdsPercent] = useState<number>(40);
  const [customAdsValor, setCustomAdsValor] = useState<string>('');
  const [taxaCambioUsd, setTaxaCambioUsd] = useState<string>('64'); // Default MT/USD exchange rate

  // Custom Goal (Meta de Sonho/Objetivo) Allocation state
  const [selectedMetaId, setSelectedMetaId] = useState<string>('');
  const [metaAllocType, setMetaAllocType] = useState<'mt' | 'percent'>('mt');
  const [metaAllocVal, setMetaAllocVal] = useState<string>('');

  const [quantidade, setQuantidade] = useState<string>('1');
  const [precoUnitario, setPrecoUnitario] = useState<string>('');
  const [desconto, setDesconto] = useState<string>('0');

  // Update unit price and total when product or quantity changes
  useEffect(() => {
    if (!produtoId) return;
    const prod = produtos.find(p => p.id === produtoId);
    if (!prod) return;

    const qtyNum = parseInt(quantidade) || 1;
    let unitPrice = prod.preco_venda;

    if (prod.kits && prod.kits.length > 0) {
      const sortedKits = [...prod.kits].sort((a, b) => b.qtd - a.qtd);
      const matchingKit = sortedKits.find(k => qtyNum >= k.qtd);
      if (matchingKit) {
        unitPrice = matchingKit.preco;
      }
    }

    setPrecoUnitario(unitPrice.toString());
    
    const descNum = parseFloat(desconto) || 0;
    const totalRec = (unitPrice * qtyNum) - descNum;
    setValorRecebido(totalRec > 0 ? totalRec.toString() : '0');
  }, [produtoId, quantidade, produtos]);

  const handlePrecoUnitarioChange = (val: string) => {
    setPrecoUnitario(val);
    const pNum = parseFloat(val) || 0;
    const qtyNum = parseInt(quantidade) || 1;
    const descNum = parseFloat(desconto) || 0;
    const totalRec = (pNum * qtyNum) - descNum;
    setValorRecebido(totalRec > 0 ? totalRec.toString() : '0');
  };

  const handleDescontoChange = (val: string) => {
    setDesconto(val);
    const descNum = parseFloat(val) || 0;
    const pNum = parseFloat(precoUnitario) || 0;
    const qtyNum = parseInt(quantidade) || 1;
    const totalRec = (pNum * qtyNum) - descNum;
    setValorRecebido(totalRec > 0 ? totalRec.toString() : '0');
  };

  const handleValorRecebidoChange = (val: string) => {
    setValorRecebido(val);
    const valNum = parseFloat(val) || 0;
    const pNum = parseFloat(precoUnitario) || 0;
    const qtyNum = parseInt(quantidade) || 1;
    const expected = pNum * qtyNum;
    const implicitDesc = expected - valNum;
    setDesconto(implicitDesc > 0 ? implicitDesc.toString() : '0');
  };

  // Sync default percentage and fee when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setCustomAdsPercent(profile.anuncios_percent);
      setIsCustomAds(false);
      setCustomAdsTipo('percentual');
      setCustomAdsValor('');
      setSelectedMetaId('');
      setMetaAllocVal('');
      setQuantidade('1');
      setPrecoUnitario('');
      setDesconto('0');
      
      setTaxaVendaTipo(activeWorkspace?.taxa_venda_tipo || profile.taxa_venda_tipo || 'percentual');
      const defaultTaxa = activeWorkspace?.taxa_venda_padrao ?? profile.taxa_venda_padrao ?? (currentTipo === 'plr_infoproduto' ? 10 : 0);
      setTaxaVendaValor(defaultTaxa > 0 ? defaultTaxa.toString() : '');
      const defaultFixa = activeWorkspace?.taxa_venda_fixa_padrao ?? profile.taxa_venda_fixa_padrao ?? 0;
      setTaxaVendaFixa(defaultFixa > 0 ? defaultFixa.toString() : '');
      setShowTaxaOptional(Boolean(activeWorkspace?.taxa_venda_ativa ?? profile.taxa_venda_ativa));
    }
  }, [isOpen, profile, activeWorkspace]);

  // Fast inline creation toggles
  const [showFastProduct, setShowFastProduct] = useState(false);
  const [fastProdNome, setFastProdNome] = useState('');
  const [fastProdCompra, setFastProdCompra] = useState('');
  const [fastProdVenda, setFastProdVenda] = useState('');

  const [showFastZone, setShowFastZone] = useState(false);
  const [fastZoneNome, setFastZoneNome] = useState('');
  const [fastZoneCusto, setFastZoneCusto] = useState('');

  // Live calculation results
  const [preview, setPreview] = useState({
    supplierCost: 0,
    shippingCost: 0,
    taxaVendaDeduction: 0,
    remainder: 0,
    adsAmount: 0,
    profitAmount: 0,
    metaAllocatedAmount: 0,
    isNegative: false
  });

  const currency = activeWorkspace?.moeda || profile?.moeda || 'MT';

  // Watch inputs and update live distribution preview
  useEffect(() => {
    const val = parseFloat(valorRecebido) || 0;
    const qtyNum = parseInt(quantidade) || 1;
    
    // Find active product costs scaled by quantity
    const prod = produtos.find(p => p.id === produtoId);
    const sCost = (prod ? prod.preco_compra : 0) * qtyNum;
    
    // Find active zone shipping costs (if shipping is active)
    let dCost = 0;
    if (isShippingActive && zonaEntregaId && zonaEntregaId !== 'sem_entrega') {
      const zone = zonasEntrega.find(z => z.id === zonaEntregaId);
      dCost = zone ? zone.custo : 0;
    }

    // Calculate platform / gateway fee per sale (if PLR, or if fee is active or filled)
    let taxaDeduction = 0;
    const taxaNum = parseFloat(taxaVendaValor) || 0;
    const taxaFixaNum = parseFloat(taxaVendaFixa) || 0;
    if ((isPlr || profile?.taxa_venda_ativa || showTaxaOptional || !isShippingActive) && (taxaNum > 0 || taxaFixaNum > 0)) {
      if (taxaVendaTipo === 'percentual') {
        taxaDeduction = Math.round(val * (taxaNum / 100) * 100) / 100;
      } else if (taxaVendaTipo === 'combinado') {
        const pctPart = Math.round(val * (taxaNum / 100) * 100) / 100;
        taxaDeduction = pctPart + taxaFixaNum;
      } else {
        taxaDeduction = taxaNum;
      }
    }

    const rem = val - sCost - dCost - taxaDeduction;
    const isNeg = rem < 0;

    let ads = 0;

    if (isCustomAds) {
      if (customAdsTipo === 'percentual') {
        ads = Math.round(rem * (customAdsPercent / 100) * 100) / 100;
      } else if (customAdsTipo === 'mt') {
        ads = parseFloat(customAdsValor) || 0;
      } else if (customAdsTipo === 'usd') {
        const valUsd = parseFloat(customAdsValor) || 0;
        const rate = parseFloat(taxaCambioUsd) || 64;
        ads = Math.round(valUsd * rate * 100) / 100;
      }
    } else if (rem > 0 && profile) {
      ads = Math.round(rem * (profile.anuncios_percent / 100) * 100) / 100;
    }

    let prof = Math.max(0, Math.round((rem - ads) * 100) / 100);

    // Calculate goal allocation if selected
    let metaVal = 0;
    if (selectedMetaId && val > 0) {
      const numInput = parseFloat(metaAllocVal) || 0;
      if (metaAllocType === 'mt') {
        metaVal = numInput;
      } else {
        metaVal = Math.round((val * (numInput / 100)) * 100) / 100;
      }
    }

    setPreview({
      supplierCost: sCost,
      shippingCost: dCost,
      taxaVendaDeduction: taxaDeduction,
      remainder: Math.round(rem * 100) / 100,
      adsAmount: ads,
      profitAmount: prof,
      metaAllocatedAmount: metaVal,
      isNegative: isNeg
    });

    // Auto select supplier of selected product if it has one
    if (prod && prod.fornecedor_id && !fornecedorId) {
      setFornecedorId(prod.fornecedor_id);
    }
  }, [
    valorRecebido, 
    quantidade, 
    produtoId, 
    zonaEntregaId, 
    isShippingActive,
    isPlr,
    taxaVendaTipo,
    taxaVendaValor,
    showTaxaOptional,
    produtos, 
    zonasEntrega, 
    profile, 
    fornecedorId, 
    isCustomAds, 
    customAdsPercent, 
    customAdsTipo, 
    customAdsValor, 
    taxaCambioUsd, 
    selectedMetaId, 
    metaAllocType, 
    metaAllocVal
  ]);

  if (!isOpen) return null;

  // Handle saving the sale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorRecebido || !produtoId) {
      alert('Por favor preencha o valor recebido e o produto.');
      return;
    }

    if (isShippingActive && !zonaEntregaId) {
      alert('Por favor selecione a zona de entrega ou a opção "Sem Custo de Envio".');
      return;
    }

    const taxaNum = parseFloat(taxaVendaValor) || 0;
    const taxaFixaNum = parseFloat(taxaVendaFixa) || 0;
    const taxaDeduction = preview.taxaVendaDeduction;

    try {
      await addVenda({
        valor_recebido: parseFloat(valorRecebido),
        workspace_id: activeWorkspace?.id,
        produto_id: produtoId,
        fornecedor_id: fornecedorId,
        zona_entrega_id: (zonaEntregaId === 'sem_entrega' || !isShippingActive) ? '' : zonaEntregaId,
        taxa_venda_tipo: (taxaNum > 0 || taxaFixaNum > 0) ? taxaVendaTipo : undefined,
        taxa_venda_valor: taxaNum > 0 ? taxaNum : undefined,
        taxa_venda_fixa: (taxaVendaTipo === 'combinado' && taxaFixaNum > 0) ? taxaFixaNum : undefined,
        taxa_venda_total: taxaDeduction > 0 ? taxaDeduction : undefined,
        conta_id: contaId || undefined,
        forma_pagamento: formaPagamento,
        observacao: observacao,
        data_venda: dataVenda,
        custom_anuncios_percent: isCustomAds && customAdsTipo === 'percentual' ? customAdsPercent : undefined,
        custom_anuncios_tipo: isCustomAds ? customAdsTipo : undefined,
        custom_anuncios_valor: isCustomAds && customAdsTipo !== 'percentual' ? (parseFloat(customAdsValor) || 0) : undefined,
        custom_anuncios_taxa_cambio: isCustomAds && customAdsTipo === 'usd' ? (parseFloat(taxaCambioUsd) || 64) : undefined,
        meta_id: selectedMetaId || undefined,
        meta_valor_alocado: selectedMetaId ? preview.metaAllocatedAmount : undefined,
        quantidade: parseInt(quantidade) || 1,
        preco_unitario: parseFloat(precoUnitario) || 0,
        desconto: parseFloat(desconto) || 0
      });
      
      // Reset form and close
      setValorRecebido('');
      setProdutoId('');
      setFornecedorId('');
      setZonaEntregaId('');
      setContaId('');
      setObservacao('');
      setQuantidade('1');
      setPrecoUnitario('');
      setDesconto('0');
      setSelectedMetaId('');
      setMetaAllocVal('');
      onClose();
    } catch (err) {
      alert('Erro ao registar venda.');
    }
  };

  // Inline product insertion helper
  const handleFastProductSave = async () => {
    if (!fastProdNome || !fastProdCompra || !fastProdVenda) return;
    try {
      // Find or create default fast supplier if none exists
      let supplierId = '';
      if (fornecedores.length > 0) {
        supplierId = fornecedores[0].id;
      } else {
        // Create a generic supplier
        const fastSuppId = crypto.randomUUID();
        await addFornecedor({
          nome: 'Fornecedor Geral',
          telefone: '',
          valor_pendente: 0
        });
        // We reload supplier id from context afterward or use empty
      }

      await addProduto({
        nome: fastProdNome,
        categoria: 'Geral',
        fornecedor_id: supplierId,
        preco_compra: parseFloat(fastProdCompra),
        preco_venda: parseFloat(fastProdVenda),
        quantidade: 100
      });

      // Clear fast states
      setFastProdNome('');
      setFastProdCompra('');
      setFastProdVenda('');
      setShowFastProduct(false);
    } catch (e) {
      alert('Erro ao criar produto.');
    }
  };

  // Inline zone insertion helper
  const handleFastZoneSave = async () => {
    if (!fastZoneNome || !fastZoneCusto) return;
    try {
      await addZonaEntrega({
        nome_zona: fastZoneNome,
        custo: parseFloat(fastZoneCusto)
      });
      setFastZoneNome('');
      setFastZoneCusto('');
      setShowFastZone(false);
    } catch (e) {
      alert('Erro ao criar zona.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="venda_modal">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col space-y-4" id="venda_modal_content">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2" id="venda_modal_header">
          <div className="flex items-center space-x-2" id="venda_modal_title_group">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600" id="venda_modal_icon">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-display">Registar Nova Venda</h3>
              <p className="text-[10px] text-slate-500">Distribuição automática de fundos</p>
            </div>
          </div>
          <button id="btn_close_venda_modal" onClick={onClose} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="venda_modal_form">
          {/* Valor Recebido */}
          <div className="space-y-1" id="field_venda_valor">
            <label className="text-xs font-semibold text-slate-500 flex justify-between">
              <span>Valor Recebido (Total Pago)</span>
              <span className="text-emerald-600 font-extrabold">{currency}</span>
            </label>
            <input
              id="venda_valor_input"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={valorRecebido}
              onChange={(e) => handleValorRecebidoChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Produto Select */}
          <div className="space-y-1.5" id="field_venda_produto">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500">Produto Vendido</label>
              <button
                id="btn_fast_product_toggle"
                type="button"
                onClick={() => setShowFastProduct(!showFastProduct)}
                className="text-[10px] text-emerald-600 hover:underline flex items-center font-bold"
              >
                <Plus className="w-3 h-3 mr-0.5" /> Criar Produto Rápido
              </button>
            </div>

            {showFastProduct ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2.5" id="fast_product_form">
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={fastProdNome}
                  onChange={(e) => setFastProdNome(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={`Custo de compra (${currency})`}
                    value={fastProdCompra}
                    onChange={(e) => setFastProdCompra(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder={`Preço de venda (${currency})`}
                    value={fastProdVenda}
                    onChange={(e) => setFastProdVenda(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFastProduct(false)}
                    className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleFastProductSave}
                    className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white transition-colors"
                  >
                    Gravar
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="venda_produto_select"
                required
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">Selecionar Produto...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Custo: {p.preco_compra} {currency} | Venda: {p.preco_venda} {currency})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantidade, Preço Unitário e Desconto */}
          {produtoId && (
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 animate-fade-in" id="field_venda_pricing_grid">
              <div className="space-y-1" id="pricing_qty">
                <label className="text-[10px] font-bold text-slate-600 block">Qtd.</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1" id="pricing_unit">
                <label className="text-[10px] font-bold text-slate-600 block">Preço Unit.</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={precoUnitario}
                  onChange={(e) => handlePrecoUnitarioChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1" id="pricing_discount">
                <label className="text-[10px] font-bold text-slate-600 block">Desconto ({currency})</label>
                <input
                  type="number"
                  step="any"
                  value={desconto}
                  onChange={(e) => handleDescontoChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Show Kit information feedback if a kit is active! */}
              {(() => {
                const prod = produtos.find(p => p.id === produtoId);
                if (prod && prod.kits && prod.kits.length > 0) {
                  const qtyNum = parseInt(quantidade) || 1;
                  const sortedKits = [...prod.kits].sort((a, b) => b.qtd - a.qtd);
                  const matchingKit = sortedKits.find(k => qtyNum >= k.qtd);
                  if (matchingKit) {
                    return (
                      <div className="col-span-3 text-[10px] text-emerald-600 font-bold bg-white p-1.5 rounded border border-emerald-100 flex items-center mt-1" id="kit_applied_feedback">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Desconto de Kit Atacado Aplicado! Preço de tabela reduzido para {matchingKit.preco} {currency} cada.
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          {/* Custo de Entrega / Envio (Para Ecommerce & Drop) */}
          {isShippingActive && (
            <div className="space-y-1.5" id="field_venda_zona">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500">Zona de Entrega / Envio</label>
                <button
                  id="btn_fast_zone_toggle"
                  type="button"
                  onClick={() => setShowFastZone(!showFastZone)}
                  className="text-[10px] text-emerald-600 hover:underline flex items-center font-bold"
                >
                  <Plus className="w-3 h-3 mr-0.5" /> Nova Zona Rápida
                </button>
              </div>

              {showFastZone ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2.5" id="fast_zone_form">
                  <input
                    type="text"
                    placeholder="Nome da zona (ex: Maputo Cidade, Matola)"
                    value={fastZoneNome}
                    onChange={(e) => setFastZoneNome(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder={`Custo de envio (${currency})`}
                    value={fastZoneCusto}
                    onChange={(e) => setFastZoneCusto(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                  />
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFastZone(false)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleFastZoneSave}
                      className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white transition-colors"
                    >
                      Gravar
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  id="venda_zona_select"
                  required
                  value={zonaEntregaId}
                  onChange={(e) => setZonaEntregaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Selecionar Zona de Entrega...</option>
                  <option value="sem_entrega">Sem Custo de Envio (0 {currency})</option>
                  {zonasEntrega.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.nome_zona} (Taxa: {z.custo} {currency})
                    </option>
                  ))}
                </select>
              )}

              {/* Taxa de Gateway Opcional para E-commerce / Drop */}
              <div className="pt-1">
                {!showTaxaOptional ? (
                  <button
                    type="button"
                    onClick={() => setShowTaxaOptional(true)}
                    className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adicionar taxa de gateway / plataforma (% ou fixa)
                  </button>
                ) : (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-purple-900">Taxa Gateway por Venda</label>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-white rounded-md p-0.5 border border-purple-200">
                          <button
                            type="button"
                            onClick={() => setTaxaVendaTipo('percentual')}
                            className={`px-1.5 py-0.5 text-[9px] font-black rounded ${taxaVendaTipo === 'percentual' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxaVendaTipo('fixo')}
                            className={`px-1.5 py-0.5 text-[9px] font-black rounded ${taxaVendaTipo === 'fixo' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                          >
                            {currency}
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxaVendaTipo('combinado')}
                            className={`px-1.5 py-0.5 text-[9px] font-black rounded ${taxaVendaTipo === 'combinado' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                          >
                            % + {currency}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaxaOptional(false);
                            setTaxaVendaValor('');
                            setTaxaVendaFixa('');
                          }}
                          className="text-slate-400 hover:text-rose-500 text-[10px] font-bold ml-1 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    {taxaVendaTipo === 'combinado' ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 5"
                            value={taxaVendaValor}
                            onChange={(e) => setTaxaVendaValor(e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400">%</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 10"
                            value={taxaVendaFixa}
                            onChange={(e) => setTaxaVendaFixa(e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400">{currency}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          placeholder={taxaVendaTipo === 'percentual' ? 'Ex: 5%' : `Ex: 50 ${currency}`}
                          value={taxaVendaValor}
                          onChange={(e) => setTaxaVendaValor(e.target.value)}
                          className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                        />
                        <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">
                          {taxaVendaTipo === 'percentual' ? '%' : currency}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Taxa por Venda (Para PLR / Infoprodutos ou quando envio está desativado) */}
          {!isShippingActive && (
            <div className="space-y-2 bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5" id="field_venda_taxa_plr">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>💳 Taxa por Venda</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black">
                      Gateway / Plataforma
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">Sem frete de entrega (PLR / Infoproduto)</span>
                </div>
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-purple-200 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTaxaVendaTipo('percentual')}
                    className={`px-2 py-1 text-[9px] sm:text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                      taxaVendaTipo === 'percentual' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxaVendaTipo('fixo')}
                    className={`px-2 py-1 text-[9px] sm:text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                      taxaVendaTipo === 'fixo' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {currency}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxaVendaTipo('combinado')}
                    className={`px-2 py-1 text-[9px] sm:text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                      taxaVendaTipo === 'combinado' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    % + {currency} (Lojoo)
                  </button>
                </div>
              </div>

              {taxaVendaTipo === 'combinado' ? (
                <div className="space-y-1 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Percentual (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="Ex: 5%"
                          value={taxaVendaValor}
                          onChange={(e) => setTaxaVendaValor(e.target.value)}
                          className="w-full bg-white border border-purple-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-black text-purple-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">+ Fixo ({currency})</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="Ex: 10"
                          value={taxaVendaFixa}
                          onChange={(e) => setTaxaVendaFixa(e.target.value)}
                          className="w-full bg-white border border-purple-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-black text-purple-500">{currency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Dedução desta venda:</span>
                    <span className="font-bold text-purple-700">
                      -{preview.taxaVendaDeduction} {currency} {taxaVendaValor ? `(${taxaVendaValor}% + ${taxaVendaFixa || 0} ${currency})` : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={taxaVendaTipo === 'percentual' ? 'Ex: 10% (Kiwify, Hotmart, EscalePay)' : `Ex: 50 ${currency}`}
                      value={taxaVendaValor}
                      onChange={(e) => setTaxaVendaValor(e.target.value)}
                      className="w-full bg-white border border-purple-200/80 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-black text-purple-500">
                      {taxaVendaTipo === 'percentual' ? '%' : currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Dedução desta venda:</span>
                    <span className="font-bold text-purple-700">
                      -{preview.taxaVendaDeduction} {currency} {taxaVendaTipo === 'percentual' && taxaVendaValor ? `(${taxaVendaValor}%)` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conta de Destino e Forma de Pagamento */}
          <div className="space-y-1.5" id="field_venda_conta">
            <label className="text-xs font-semibold text-slate-500">Conta / Carteira onde o valor foi depositado</label>
            <select
              id="venda_conta_select"
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Selecionar Conta (ou Geral)...</option>
              {contasBancarias.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} - Saldo: {c.saldo_atual} {currency} {c.banco ? `(${c.banco})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Outros Detalhes (Forma Pagamento e Data) */}
          <div className="grid grid-cols-2 gap-3" id="venda_metadata_grid">
            <div className="space-y-1" id="field_venda_pagamento">
              <label className="text-xs font-semibold text-slate-500">Pagamento</label>
              <select
                id="venda_pagamento_select"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="e-Mola">e-Mola</option>
                <option value="M-Kesh">M-Kesh</option>
                <option value="A Prazo / Prestações">A Prazo / Prestações</option>
                <option value="Cash/Dinheiro">Cash/Dinheiro</option>
                <option value="Transferência">Transferência</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-1" id="field_venda_data">
              <label className="text-xs font-semibold text-slate-500">Data da Venda</label>
              <input
                id="venda_data_input"
                type="date"
                required
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {formaPagamento === 'A Prazo / Prestações' && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 space-y-1" id="venda_aprazo_info">
              <p className="font-extrabold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Venda Registada A Prazo (Em Prestações)
              </p>
              <p className="text-[10px] text-amber-800 leading-tight">
                Esta venda será contabilizada nas estatísticas de faturamento. Pode indicar os detalhes das parcelas ou vencimento no campo de observações abaixo.
              </p>
            </div>
          )}

          {/* Observação */}
          <div className="space-y-1" id="field_venda_obs">
            <label className="text-xs font-semibold text-slate-500">Notas / Observação (Opcional)</label>
            <input
              id="venda_obs_input"
              type="text"
              placeholder="Ex: Cliente pediu entrega à tarde"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Custom Ads Control (%, MT, USD) */}
          {!preview.isNegative && parseFloat(valorRecebido) > 0 && (
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 animate-fade-in" id="field_venda_custom_ads">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCustomAds}
                    onChange={(e) => setIsCustomAds(e.target.checked)}
                    className="mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  Customizar Custo de Anúncios
                </label>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                  {isCustomAds ? 'Personalizado' : `Padrão (${profile?.anuncios_percent}%)`}
                </span>
              </div>

              {isCustomAds && (
                <div className="space-y-3 pt-1 border-t border-slate-200/60" id="custom_ads_expanded">
                  <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200" id="ads_unit_selector">
                    <button
                      type="button"
                      onClick={() => setCustomAdsTipo('percentual')}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-colors ${
                        customAdsTipo === 'percentual' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      % Percentual
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAdsTipo('mt')}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-colors ${
                        customAdsTipo === 'mt' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      MT Meticais
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAdsTipo('usd')}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-colors ${
                        customAdsTipo === 'usd' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      $ USD Dólares
                    </button>
                  </div>

                  {customAdsTipo === 'percentual' && (
                    <div className="space-y-2" id="custom_ads_slider_container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customAdsPercent}
                        onChange={(e) => setCustomAdsPercent(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-sky-600">📢 Anúncios: {customAdsPercent}%</span>
                        <span className="text-emerald-600">💰 Lucro: {100 - customAdsPercent}%</span>
                      </div>
                    </div>
                  )}

                  {customAdsTipo === 'mt' && (
                    <div className="space-y-1" id="custom_ads_mt_input">
                      <label className="text-[10px] font-bold text-slate-500">Valor em Meticais (MT)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: 350 MT"
                        value={customAdsValor}
                        onChange={(e) => setCustomAdsValor(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {customAdsTipo === 'usd' && (
                    <div className="grid grid-cols-2 gap-2" id="custom_ads_usd_inputs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Valor em Dólares ($ USD)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="Ex: 5.50 $"
                          value={customAdsValor}
                          onChange={(e) => setCustomAdsValor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Câmbio (1 USD = ? MT)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="64 MT"
                          value={taxaCambioUsd}
                          onChange={(e) => setTaxaCambioUsd(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transfer Funds to Personal Goal / Meta (Optionally) */}
          {metaItems && metaItems.length > 0 && (
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/60 space-y-2.5 animate-fade-in" id="field_venda_meta_transfer">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center">
                  🎯 Alocar para Meta / Objetivo
                </label>
                <span className="text-[10px] font-bold text-amber-700">Opcional</span>
              </div>

              <select
                value={selectedMetaId}
                onChange={(e) => setSelectedMetaId(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="">Não transferir para nenhuma meta</option>
                {metaItems.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.valor_atual.toLocaleString()} / {m.valor_alvo.toLocaleString()} MT)
                  </option>
                ))}
              </select>

              {selectedMetaId && (
                <div className="space-y-2 pt-1 border-t border-amber-200/60" id="meta_transfer_inputs">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-white rounded-lg p-0.5 border border-amber-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMetaAllocType('mt')}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded ${
                          metaAllocType === 'mt' ? 'bg-amber-500 text-white' : 'text-slate-500'
                        }`}
                      >
                        Valor MT
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetaAllocType('percent')}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded ${
                          metaAllocType === 'percent' ? 'bg-amber-500 text-white' : 'text-slate-500'
                        }`}
                      >
                        % da Venda
                      </button>
                    </div>

                    <input
                      type="number"
                      step="any"
                      placeholder={metaAllocType === 'mt' ? 'Ex: 250 MT' : 'Ex: 10%'}
                      value={metaAllocVal}
                      onChange={(e) => setMetaAllocVal(e.target.value)}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {preview.metaAllocatedAmount > 0 && (
                    <p className="text-[10px] text-amber-800 font-bold flex items-center">
                      ✨ Serão guardados +{preview.metaAllocatedAmount.toLocaleString()} MT diretamente nesta meta!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LIVE Automatic Distribution Preview */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3.5" id="venda_preview_panel">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2" id="preview_header">
              <span className="text-[10px] font-black tracking-wider text-emerald-700 uppercase">Resumo da Distribuição</span>
              <span className="text-[10px] text-slate-500 font-bold">Pockets de destino</span>
            </div>

            <div className="space-y-2 text-xs" id="preview_breakdown">
              <div className="flex justify-between font-semibold" id="preview_row_fornecedor">
                <span className="text-slate-500">📦 Resgate Fornecedor / Custo:</span>
                <span className="font-extrabold text-amber-600">+{preview.supplierCost} {currency}</span>
              </div>
              {preview.shippingCost > 0 && (
                <div className="flex justify-between font-semibold" id="preview_row_delivery">
                  <span className="text-slate-500">🚚 Resgate Delivery (Entrega):</span>
                  <span className="font-extrabold text-indigo-600">+{preview.shippingCost} {currency}</span>
                </div>
              )}
              {preview.taxaVendaDeduction > 0 && (
                <div className="flex justify-between font-semibold" id="preview_row_taxa">
                  <span className="text-slate-500">💳 Taxa Gateway / Plataforma:</span>
                  <span className="font-extrabold text-purple-600">+{preview.taxaVendaDeduction} {currency}</span>
                </div>
              )}
              
              <div className="border-t border-dashed border-slate-200 my-1 pt-1 flex justify-between font-semibold" id="preview_row_remainder">
                <span className="text-slate-700 font-bold">Margem Líquida Restante:</span>
                <span className={`font-black ${preview.isNegative ? 'text-rose-600' : 'text-slate-800'}`}>
                  {preview.remainder} {currency}
                </span>
              </div>

              {preview.isNegative && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-[10px] flex items-start space-x-1.5" id="preview_negative_warning">
                  <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>Atenção: Margem negativa! O valor recebido não cobre o custo do produto, taxa ou envio.</span>
                </div>
              )}

              {!preview.isNegative && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200" id="preview_remaining_split">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60" id="preview_split_anuncios">
                    <span className="text-[9px] font-bold text-sky-600 block mb-0.5">📢 Anúncios ({isCustomAds ? customAdsPercent : (profile?.anuncios_percent || 40)}%)</span>
                    <span className="font-black text-sky-700 text-sm">+{preview.adsAmount} {currency}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60" id="preview_split_lucro">
                    <span className="text-[9px] font-bold text-emerald-600 block mb-0.5">💰 Lucro ({100 - (isCustomAds ? customAdsPercent : (profile?.anuncios_percent || 40))}%)</span>
                    <span className="font-black text-emerald-700 text-sm">+{preview.profitAmount} {currency}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2" id="venda_modal_actions">
            <button
              id="btn_cancel_venda"
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Voltar
            </button>
            <button
              id="btn_confirm_venda"
              type="submit"
              disabled={!valorRecebido || !produtoId || !zonaEntregaId}
              className="flex-1 bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              Gravar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
