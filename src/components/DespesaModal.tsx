/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { X, ArrowDownRight, Megaphone, TrendingUp, Package, Truck, FolderOpen } from 'lucide-react';

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DespesaModal({ isOpen, onClose }: DespesaModalProps) {
  const { caixinhas, addDespesa, profile } = useApp();

  // Form states
  const [valor, setValor] = useState<string>('');
  const [caixinhaId, setCaixinhaId] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Anúncios');
  const [descricao, setDescricao] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const currency = profile?.moeda || 'MT';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || !caixinhaId || !categoria) return;

    try {
      await addDespesa({
        valor: parseFloat(valor),
        caixinha_id: caixinhaId,
        categoria: categoria,
        descricao: descricao,
        data: data
      });

      // Reset & close
      setValor('');
      setCaixinhaId('');
      setCategoria('Anúncios');
      setDescricao('');
      onClose();
    } catch (e) {
      alert('Erro ao registar despesa.');
    }
  };  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="despesa_modal">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col space-y-4" id="despesa_modal_content">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2" id="despesa_modal_header">
          <div className="flex items-center space-x-2" id="despesa_modal_title_group">
            <div className="bg-rose-50 p-2 rounded-xl text-rose-600" id="despesa_modal_icon">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-display">Registar Saída / Despesa</h3>
              <p className="text-[10px] text-slate-500">Deduzir valor de uma caixinha</p>
            </div>
          </div>
          <button id="btn_close_despesa_modal" onClick={onClose} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="despesa_modal_form">
          {/* Valor */}
          <div className="space-y-1" id="field_despesa_valor">
            <label className="text-xs font-semibold text-slate-500 flex justify-between">
              <span>Valor da Despesa</span>
              <span className="text-rose-600 font-extrabold">{currency}</span>
            </label>
            <input
              id="despesa_valor_input"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Caixinha de Origem */}
          <div className="space-y-1.5" id="field_despesa_origem">
            <label className="text-xs font-semibold text-slate-500">Pagar com dinheiro de qual Pocket?</label>
            <select
              id="despesa_caixinha_select"
              required
              value={caixinhaId}
              onChange={(e) => setCaixinhaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="">Selecionar Pocket...</option>
              {caixinhas.map(cx => (
                <option key={cx.id} value={cx.id}>
                  {cx.nome} (Saldo Atual: {cx.saldo_atual} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5" id="field_despesa_categoria">
            <label className="text-xs font-semibold text-slate-500">Categoria da Despesa</label>
            <select
              id="despesa_categoria_select"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="Anúncios">Anúncios (Facebook Ads/Google Ads)</option>
              <option value="Compra de Estoque">Compra de Estoque (Produtos)</option>
              <option value="Taxas de Entrega">Taxas de Entrega (Delivery)</option>
              <option value="Software / Apps">Software / Apps (Shopify, Dropi, etc.)</option>
              <option value="Pró-labore / Salário">Pró-labore / Salário (Pessoal)</option>
              <option value="Taxas de Gateway">Taxas de Gateway / Comissões</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-1" id="field_despesa_descricao">
            <label className="text-xs font-semibold text-slate-500">Descrição / Nota</label>
            <input
              id="despesa_descricao_input"
              type="text"
              required
              placeholder="Ex: Campanha de criativos do relógio, Apps adicionais"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Data */}
          <div className="space-y-1" id="field_despesa_data">
            <label className="text-xs font-semibold text-slate-500">Data do Pagamento</label>
            <input
              id="despesa_data_input"
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Warning Message on high expense */}
          {caixinhaId && valor && (() => {
            const selectedCx = caixinhas.find(c => c.id === caixinhaId);
            if (selectedCx && selectedCx.saldo_atual < parseFloat(valor)) {
              return (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-xl text-[10px]" id="despesa_warning">
                  Aviso: O saldo desta caixinha ({selectedCx.saldo_atual} {currency}) é menor do que o valor da despesa ({valor} {currency}). O saldo ficará negativo.
                </div>
              );
            }
            return null;
          })()}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2" id="despesa_modal_actions">
            <button
              id="btn_cancel_despesa"
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Voltar
            </button>
            <button
              id="btn_confirm_despesa"
              type="submit"
              disabled={!valor || !caixinhaId}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              Gravar Saída
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
