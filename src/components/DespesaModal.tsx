/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { X, ArrowDownRight, ShieldAlert, AlertTriangle } from 'lucide-react';

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DespesaModal({ isOpen, onClose }: DespesaModalProps) {
  const { caixinhas, contasBancarias, addDespesa, profile } = useApp();

  // Form states
  const [valor, setValor] = useState<string>('');
  const [caixinhaId, setCaixinhaId] = useState<string>('');
  const [contaId, setContaId] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Anúncios');
  const [descricao, setDescricao] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);

  // Emergency confirmation popup state
  const [showEmergencyPopup, setShowEmergencyPopup] = useState<boolean>(false);
  const [motivoEmergencia, setMotivoEmergencia] = useState<string>('');

  if (!isOpen) return null;

  const currency = profile?.moeda || 'MT';

  const processAddDespesa = async (motivo?: string) => {
    try {
      await addDespesa({
        valor: parseFloat(valor),
        caixinha_id: caixinhaId,
        conta_id: contaId || undefined,
        motivo_emergencia: motivo,
        categoria: categoria,
        descricao: motivo ? `${descricao ? `${descricao} ` : ''}[Motivo Emergência: ${motivo}]` : (descricao.trim() || categoria),
        data: data
      });

      // Reset & close
      setValor('');
      setCaixinhaId('');
      setContaId('');
      setCategoria('Anúncios');
      setDescricao('');
      setMotivoEmergencia('');
      setShowEmergencyPopup(false);
      onClose();
    } catch (e) {
      alert('Erro ao registar despesa.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || !caixinhaId || !categoria) return;

    // Check if selected account is tagged as 'emergencia'
    if (contaId && contaId !== 'todas') {
      const selectedAcc = contasBancarias.find(c => c.id === contaId);
      if (selectedAcc && selectedAcc.status_liberdade === 'emergencia') {
        setShowEmergencyPopup(true);
        return;
      }
    }

    await processAddDespesa();
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
              <option value="todas">✨ Geral (Todas as Caixinhas / Proporcional)</option>
              {caixinhas.map(cx => (
                <option key={cx.id} value={cx.id}>
                  {cx.nome} (Saldo Atual: {cx.saldo_atual} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Conta de Onde Saiu o Saldo Real */}
          <div className="space-y-1.5" id="field_despesa_conta">
            <label className="text-xs font-semibold text-slate-500">Conta / Carteira de Onde Saiu o Valor (Opcional)</label>
            <select
              id="despesa_conta_select"
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="">Nenhuma / Sem Dedução de Banco</option>
              <option value="todas">✨ Geral (Contas de Livre Movimentação)</option>
              {contasBancarias.map(c => {
                const isEmergencia = c.status_liberdade === 'emergencia';
                return (
                  <option key={c.id} value={c.id}>
                    {c.nome} - Saldo: {c.saldo_atual} {currency} {isEmergencia ? ' (🔴 NÃO MEXER / RESERVA)' : ''}
                  </option>
                );
              })}
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
            <label className="text-xs font-semibold text-slate-500">Descrição / Nota (Opcional)</label>
            <input
              id="despesa_descricao_input"
              type="text"
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

        {/* Emergency Account Warning Popup Modal */}
        {showEmergencyPopup && (() => {
          const acc = contasBancarias.find(c => c.id === contaId);
          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" id="emergency_popup_overlay">
              <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative" id="emergency_popup_card">
                <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Aviso de Segurança!</h4>
                    <span className="inline-block bg-rose-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full mt-0.5">
                      Conta Protegida (Não Mexer)
                    </span>
                  </div>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 text-xs text-rose-950 dark:text-rose-200 space-y-2">
                  <p className="font-medium leading-relaxed">
                    Você está prestes a retirar <strong className="text-rose-600 dark:text-rose-400 font-black">{valor} {currency}</strong> da conta{' '}
                    <strong className="underline font-bold text-slate-900 dark:text-white">{acc?.nome || 'Selecionada'}</strong> que está configurada como <strong className="font-bold">Reserva de Emergência / Não Mexer</strong>.
                  </p>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300">
                    Para prosseguir, é obrigatório registrar o motivo para que fique salvo no histórico da conta.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Motivo Obrigatório da Retirada de Emergência *
                  </label>
                  <textarea
                    id="input_motivo_emergencia"
                    required
                    rows={3}
                    placeholder="Ex: Compra urgente de estoque indisponível, Emergência médica, Alfândega..."
                    value={motivoEmergencia}
                    onChange={(e) => setMotivoEmergencia(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyPopup(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!motivoEmergencia.trim()}
                    onClick={() => processAddDespesa(motivoEmergencia)}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50"
                  >
                    Confirmar Retirada
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
