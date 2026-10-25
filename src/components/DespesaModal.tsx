/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { X, ArrowDownRight, ShieldAlert, Landmark, ArrowRightLeft, Sparkles } from 'lucide-react';

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DespesaModal({ isOpen, onClose }: DespesaModalProps) {
  const { 
    caixinhas, 
    contasBancarias, 
    addDespesa, 
    profile, 
    activeWorkspace, 
    transferirEntreContas, 
    retirarDaConta, 
    triggerToast 
  } = useApp();

  const isPlr = activeWorkspace?.tipo === 'plr_infoproduto';
  const currency = activeWorkspace?.moeda || profile?.moeda || 'MT';

  // Mode: Saque da Plataforma vs Despesa Operacional
  const [modalMode, setModalMode] = useState<'saque_plr' | 'despesa'>(isPlr ? 'saque_plr' : 'despesa');

  // Form states - Despesa
  const [valor, setValor] = useState<string>('');
  const [caixinhaId, setCaixinhaId] = useState<string>('');
  const [contaId, setContaId] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Anúncios');
  const [descricao, setDescricao] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states - Saque da Plataforma (PLR)
  const [saqueOrigemId, setSaqueOrigemId] = useState<string>('');
  const [saqueDestinoId, setSaqueDestinoId] = useState<string>('');
  const [saqueValor, setSaqueValor] = useState<string>('');
  const [saqueTaxa, setSaqueTaxa] = useState<string>('0');
  const [saqueCaixinhaId, setSaqueCaixinhaId] = useState<string>('');
  const [saqueObs, setSaqueObs] = useState<string>('');

  // Emergency confirmation popup state
  const [showEmergencyPopup, setShowEmergencyPopup] = useState<boolean>(false);
  const [motivoEmergencia, setMotivoEmergencia] = useState<string>('');

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      setModalMode(isPlr ? 'saque_plr' : 'despesa');
      
      // Auto-pick gateway account as origin if available
      const gatewayAccount = contasBancarias.find(c => 
        c.tipo === 'gateway' || 
        c.nome.toLowerCase().includes('lojou') || 
        c.nome.toLowerCase().includes('kiwify') ||
        c.nome.toLowerCase().includes('hotmart')
      );
      if (gatewayAccount) {
        setSaqueOrigemId(gatewayAccount.id);
      } else if (contasBancarias.length > 0) {
        setSaqueOrigemId(contasBancarias[0].id);
      }

      // Auto-pick non-gateway account as destination
      const destAccount = contasBancarias.find(c => 
        c.id !== gatewayAccount?.id && 
        (c.tipo === 'banco' || c.tipo === 'carteira_movel' || c.nome.toLowerCase().includes('mpesa') || c.nome.toLowerCase().includes('m-pesa') || c.nome.toLowerCase().includes('emola'))
      );
      if (destAccount) {
        setSaqueDestinoId(destAccount.id);
      } else if (contasBancarias.length > 1) {
        setSaqueDestinoId(contasBancarias[1].id);
      }

      // Auto-pick Lucro Líquido caixinha
      const lucroCx = caixinhas.find(c => c.nome.toLowerCase().includes('lucro'));
      if (lucroCx) {
        setSaqueCaixinhaId(lucroCx.id);
      }
    }
  }, [isOpen, isPlr, contasBancarias, caixinhas]);

  if (!isOpen) return null;

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

  const handleDespesaSubmit = async (e: React.FormEvent) => {
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
  };

  const handleSaqueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valBruto = parseFloat(saqueValor);
    if (!valBruto || valBruto <= 0) {
      alert('Por favor insira um valor de saque válido.');
      return;
    }
    if (!saqueOrigemId || !saqueDestinoId) {
      alert('Selecione a conta/gateway de origem e a conta/carteira de destino.');
      return;
    }
    if (saqueOrigemId === saqueDestinoId) {
      alert('A conta de origem e a conta de destino devem ser diferentes.');
      return;
    }

    const valTaxa = parseFloat(saqueTaxa) || 0;
    const valLiquido = Math.round((valBruto - valTaxa) * 100) / 100;

    if (valLiquido <= 0) {
      alert('O valor líquido do saque após taxas deve ser maior que zero.');
      return;
    }

    const origemAcc = contasBancarias.find(c => c.id === saqueOrigemId);
    const destinoAcc = contasBancarias.find(c => c.id === saqueDestinoId);

    try {
      // 1. Transfer gross amount or liquid to destination
      await transferirEntreContas(saqueOrigemId, saqueDestinoId, valLiquido);

      // 2. If fee exists, deduct from origin account
      if (valTaxa > 0) {
        await retirarDaConta(saqueOrigemId, valTaxa, `Taxa de Saque Plataforma (${origemAcc?.nome || 'Gateway'})`);
      }

      // 3. If a caixinha was selected to debit profit/payout, record the expense
      if (saqueCaixinhaId) {
        await addDespesa({
          valor: valBruto,
          caixinha_id: saqueCaixinhaId,
          conta_id: saqueOrigemId,
          categoria: 'Pró-labore / Salário',
          descricao: `Saque ${origemAcc?.nome || 'Gateway'} -> ${destinoAcc?.nome || 'Conta'} ${saqueObs ? `(${saqueObs})` : ''}`,
          data: data
        });
      }

      triggerToast(
        'Saque Efetuado com Sucesso! 💸',
        `Transferido ${valLiquido.toLocaleString()} ${currency} de ${origemAcc?.nome || 'Gateway'} para ${destinoAcc?.nome || 'Carteira'}.`,
        'success'
      );

      // Reset & close
      setSaqueValor('');
      setSaqueTaxa('0');
      setSaqueObs('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao efetuar saque da plataforma.');
    }
  };

  const valBrutoNum = parseFloat(saqueValor) || 0;
  const valTaxaNum = parseFloat(saqueTaxa) || 0;
  const valLiquidoNum = Math.max(0, Math.round((valBrutoNum - valTaxaNum) * 100) / 100);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="despesa_modal">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col space-y-4 text-slate-900 dark:text-slate-100" id="despesa_modal_content">
        
        {/* Header & Mode Switcher */}
        <div className="flex flex-col gap-3 pb-2 border-b border-slate-100 dark:border-slate-800" id="despesa_modal_header">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2.5" id="despesa_modal_title_group">
              <div className={`p-2.5 rounded-xl ${
                modalMode === 'saque_plr' 
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' 
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`} id="despesa_modal_icon">
                {modalMode === 'saque_plr' ? <Landmark className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg font-display">
                  {modalMode === 'saque_plr' ? 'Efetuar Saque da Plataforma' : 'Registar Saída / Despesa'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {modalMode === 'saque_plr' 
                    ? 'Transferir faturamento do Gateway (Lojou, Kiwify) para seu banco/carteira' 
                    : 'Deduzir valor de uma caixinha ou pagar despesa'}
                </p>
              </div>
            </div>
            <button id="btn_close_despesa_modal" onClick={onClose} className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold" id="despesa_mode_switcher">
            <button
              type="button"
              onClick={() => setModalMode('saque_plr')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === 'saque_plr'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Efetuar Saque da Plataforma
            </button>
            <button
              type="button"
              onClick={() => setModalMode('despesa')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === 'despesa'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Registar Despesa / Saída
            </button>
          </div>
        </div>

        {/* ================= 1. SAQUE DA PLATAFORMA FORM ================= */}
        {modalMode === 'saque_plr' ? (
          <form onSubmit={handleSaqueSubmit} className="space-y-4" id="saque_plr_form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="saque_contas_group">
              <div className="space-y-1.5" id="saque_origem_group">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  De onde está sacando? (Gateway / Origem)
                </label>
                <select
                  required
                  value={saqueOrigemId}
                  onChange={(e) => setSaqueOrigemId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                >
                  <option value="">Selecionar Gateway...</option>
                  {contasBancarias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} (Saldo: {c.saldo_atual.toLocaleString()} {currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5" id="saque_destino_group">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Para onde vai o dinheiro? (Destino)
                </label>
                <select
                  required
                  value={saqueDestinoId}
                  onChange={(e) => setSaqueDestinoId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                >
                  <option value="">Selecionar Carteira / Banco...</option>
                  {contasBancarias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} (Saldo: {c.saldo_atual.toLocaleString()} {currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valor do Saque e Taxa */}
            <div className="grid grid-cols-2 gap-3" id="saque_valores_group">
              <div className="space-y-1" id="saque_valor_bruto_group">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Valor Bruto do Saque</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">{currency}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={saqueValor}
                  onChange={(e) => setSaqueValor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-base font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1" id="saque_taxa_group">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Taxa Cobrada pelo Gateway</span>
                  <span className="text-slate-400 font-bold">{currency}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={saqueTaxa}
                  onChange={(e) => setSaqueTaxa(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-base font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Resumo do Saque em Destaque */}
            {valBrutoNum > 0 && (
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 space-y-1.5 animate-fade-in" id="saque_preview_card">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Valor Bruto Solicitado:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{valBrutoNum.toLocaleString()} {currency}</span>
                </div>
                {valTaxaNum > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Taxa de Saque Retida:</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">-{valTaxaNum.toLocaleString()} {currency}</span>
                  </div>
                )}
                <div className="border-t border-purple-200 dark:border-purple-800/80 pt-1.5 flex justify-between items-center text-sm font-black">
                  <span className="text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Valor Líquido a Receber na Carteira:
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-display text-base">
                    +{valLiquidoNum.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            )}

            {/* Caixinha a Abater (Opcional) */}
            <div className="space-y-1.5" id="saque_caixinha_group">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex justify-between">
                <span>Abater de qual Caixinha / Pocket? (Opcional)</span>
                <span className="text-[10px] text-purple-600 font-bold">Pró-labore / Retirada</span>
              </label>
              <select
                value={saqueCaixinhaId}
                onChange={(e) => setSaqueCaixinhaId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
              >
                <option value="">Não abater de nenhuma caixinha (Apenas mover saldo de contas)</option>
                {caixinhas.map(cx => (
                  <option key={cx.id} value={cx.id}>
                    {cx.nome} (Saldo Atual: {cx.saldo_atual.toLocaleString()} {currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Data e Notas */}
            <div className="grid grid-cols-2 gap-3" id="saque_meta_group">
              <div className="space-y-1" id="saque_data_group">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data do Saque</label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1" id="saque_obs_group">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nota / Identificador</label>
                <input
                  type="text"
                  placeholder="Ex: Saque semanal Lojou"
                  value={saqueObs}
                  onChange={(e) => setSaqueObs(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2" id="saque_modal_actions">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!saqueValor || !saqueOrigemId || !saqueDestinoId}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Confirmar Saque
              </button>
            </div>
          </form>
        ) : (
          /* ================= 2. DESPESA / SAÍDA OPERACIONAL FORM ================= */
          <form onSubmit={handleDespesaSubmit} className="space-y-4" id="despesa_modal_form">
            {/* Valor */}
            <div className="space-y-1" id="field_despesa_valor">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex justify-between">
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Caixinha de Origem */}
            <div className="space-y-1.5" id="field_despesa_origem">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pagar com dinheiro de qual Pocket?</label>
              <select
                id="despesa_caixinha_select"
                required
                value={caixinhaId}
                onChange={(e) => setCaixinhaId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Conta / Carteira de Onde Saiu o Valor (Opcional)</label>
              <select
                id="despesa_conta_select"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Categoria da Despesa</label>
              <select
                id="despesa_categoria_select"
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Descrição / Nota (Opcional)</label>
              <input
                id="despesa_descricao_input"
                type="text"
                placeholder="Ex: Campanha de criativos do produto, Ferramentas de tráfego"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Data */}
            <div className="space-y-1" id="field_despesa_data">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data do Pagamento</label>
              <input
                id="despesa_data_input"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Warning Message on high expense */}
            {caixinhaId && valor && (() => {
              const selectedCx = caixinhas.find(c => c.id === caixinhaId);
              if (selectedCx && selectedCx.saldo_atual < parseFloat(valor)) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 p-3 rounded-xl text-[10px]" id="despesa_warning">
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
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                id="btn_confirm_despesa"
                type="submit"
                disabled={!valor || !caixinhaId}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Gravar Saída
              </button>
            </div>
          </form>
        )}

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
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!motivoEmergencia.trim()}
                    onClick={() => processAddDespesa(motivoEmergencia)}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
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
