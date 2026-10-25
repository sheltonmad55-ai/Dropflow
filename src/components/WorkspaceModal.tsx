import React, { useState, useEffect } from 'react';
import { X, Check, Store, Globe, Laptop, ShoppingBag, Wallet, Truck, Percent, DollarSign, Layers } from 'lucide-react';
import { Workspace, TipoNegocio } from '../types.ts';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceToEdit?: Workspace | null;
  onSave: (workspaceData: {
    nome: string;
    tipo: TipoNegocio;
    moeda: string;
    custo_envio_ativo: boolean;
    taxa_venda_ativa: boolean;
    taxa_venda_tipo?: 'percentual' | 'fixo' | 'combinado';
    taxa_venda_padrao?: number;
    taxa_venda_fixa_padrao?: number;
    taxa_saque_tipo?: 'percentual' | 'fixo';
    taxa_saque_padrao?: number;
    compartilhar_caixinhas?: boolean;
    compartilhar_contas?: boolean;
    plataforma_nome?: string;
    cor?: string;
    icone?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const MOEDAS_DISPONIVEIS = [
  { id: 'USD', simbolo: '$', nome: 'Dólar Americano', bandeira: '🇺🇸' },
  { id: 'BRL', simbolo: 'R$', nome: 'Real Brasileiro', bandeira: '🇧🇷' },
  { id: 'ZAR', simbolo: 'R', nome: 'Rand Sul-Africano', bandeira: '🇿🇦' },
  { id: 'MT', simbolo: 'MT', nome: 'Metical Moçambicano', bandeira: '🇲🇿' },
  { id: 'AOA', simbolo: 'Kz', nome: 'Kwanza Angolano', bandeira: '🇦🇴' },
  { id: 'EUR', simbolo: '€', nome: 'Euro', bandeira: '🇪🇺' },
];

const CORES_PALETA = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const PLATAFORMAS_SUGESTOES = [
  'DroopCod',
  'Lojou',
  'Txapilog',
  'Zenofi',
  'Kiwify',
  'Hotmart',
  'Shopify',
  'Yampi',
  'Loja Própria',
];

export default function WorkspaceModal({
  isOpen,
  onClose,
  workspaceToEdit,
  onSave,
  onDelete,
}: WorkspaceModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoNegocio>('ecommerce_drop');
  const [moeda, setMoeda] = useState('MT');
  const [plataformaNome, setPlataformaNome] = useState('');
  const [custoEnvioAtivo, setCustoEnvioAtivo] = useState(true);
  const [taxaVendaAtiva, setTaxaVendaAtiva] = useState(false);
  const [taxaVendaTipo, setTaxaVendaTipo] = useState<'percentual' | 'fixo' | 'combinado'>('percentual');
  const [taxaVendaPadrao, setTaxaVendaPadrao] = useState('0');
  const [taxaVendaFixaPadrao, setTaxaVendaFixaPadrao] = useState('0');
  const [taxaSaqueTipo, setTaxaSaqueTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [taxaSaquePadrao, setTaxaSaquePadrao] = useState('0');
  const [compartilharCaixinhas, setCompartilharCaixinhas] = useState(false);
  const [compartilharContas, setCompartilharContas] = useState(false);
  const [cor, setCor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceToEdit) {
      setNome(workspaceToEdit.nome || '');
      setTipo(workspaceToEdit.tipo || 'ecommerce_drop');
      setMoeda(workspaceToEdit.moeda || 'MT');
      setPlataformaNome(workspaceToEdit.plataforma_nome || '');
      setCustoEnvioAtivo(workspaceToEdit.custo_envio_ativo !== false);
      setTaxaVendaAtiva(Boolean(workspaceToEdit.taxa_venda_ativa));
      setTaxaVendaTipo(workspaceToEdit.taxa_venda_tipo || 'percentual');
      setTaxaVendaPadrao(workspaceToEdit.taxa_venda_padrao ? String(workspaceToEdit.taxa_venda_padrao) : '0');
      setTaxaVendaFixaPadrao(workspaceToEdit.taxa_venda_fixa_padrao ? String(workspaceToEdit.taxa_venda_fixa_padrao) : '0');
      setTaxaSaqueTipo(workspaceToEdit.taxa_saque_tipo || 'percentual');
      setTaxaSaquePadrao(workspaceToEdit.taxa_saque_padrao ? String(workspaceToEdit.taxa_saque_padrao) : '0');
      setCompartilharCaixinhas(Boolean(workspaceToEdit.compartilhar_caixinhas));
      setCompartilharContas(Boolean(workspaceToEdit.compartilhar_contas));
      setCor(workspaceToEdit.cor || '#10B981');
    } else {
      setNome('');
      setTipo('ecommerce_drop');
      setMoeda('MT');
      setPlataformaNome('');
      setCustoEnvioAtivo(true);
      setTaxaVendaAtiva(false);
      setTaxaVendaTipo('percentual');
      setTaxaVendaPadrao('0');
      setTaxaVendaFixaPadrao('0');
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('0');
      setCompartilharCaixinhas(false);
      setCompartilharContas(false);
      setCor('#10B981');
    }
  }, [workspaceToEdit, isOpen]);

  // Adjust defaults when changing business type
  const handleSelectTipo = (novoTipo: TipoNegocio) => {
    setTipo(novoTipo);
    if (novoTipo === 'plr_infoproduto') {
      setCustoEnvioAtivo(false);
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('percentual');
      setTaxaVendaPadrao('10');
      setTaxaVendaFixaPadrao('0');
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('5');
    } else if (novoTipo === 'plataforma') {
      setCustoEnvioAtivo(false);
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('combinado');
      setTaxaVendaPadrao('5');
      setTaxaVendaFixaPadrao('10');
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('5');
    } else if (novoTipo === 'ecommerce_drop') {
      setCustoEnvioAtivo(true);
      setTaxaVendaAtiva(false);
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('0');
    } else if (novoTipo === 'servicos') {
      setCustoEnvioAtivo(false);
      setTaxaVendaAtiva(false);
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('0');
    }
  };

  const handleSelectPlataforma = (plat: string) => {
    setPlataformaNome(plat);
    if (plat === 'Lojou' || plat === 'Lojoo') {
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('combinado');
      setTaxaVendaPadrao('5');
      setTaxaVendaFixaPadrao('10');
      setTaxaSaqueTipo('fixo');
      setTaxaSaquePadrao('50');
      setMoeda('MT');
    } else if (plat === 'Txapilog' || plat === 'ChatPilog') {
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('combinado');
      setTaxaVendaPadrao('5');
      setTaxaVendaFixaPadrao('10');
      setTaxaSaqueTipo('fixo');
      setTaxaSaquePadrao('50');
      setMoeda('MT');
      setCustoEnvioAtivo(true);
    } else if (plat === 'Kiwify') {
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('combinado');
      setTaxaVendaPadrao('8.99');
      setTaxaVendaFixaPadrao('2.49');
      setTaxaSaqueTipo('fixo');
      setTaxaSaquePadrao('3.67');
      setMoeda('BRL');
    } else if (plat === 'DroopCod') {
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('percentual');
      setTaxaVendaPadrao('5');
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('5');
      setMoeda('MT');
    } else if (plat === 'Zenofi') {
      setTaxaVendaAtiva(true);
      setTaxaVendaTipo('percentual');
      setTaxaVendaPadrao('10');
      setTaxaSaqueTipo('percentual');
      setTaxaSaquePadrao('5');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        nome: nome.trim() || (plataformaNome ? `${plataformaNome}` : 'Meu Negócio'),
        tipo,
        moeda,
        custo_envio_ativo: custoEnvioAtivo,
        taxa_venda_ativa: taxaVendaAtiva,
        taxa_venda_tipo: taxaVendaTipo,
        taxa_venda_padrao: parseFloat(taxaVendaPadrao) || 0,
        taxa_venda_fixa_padrao: parseFloat(taxaVendaFixaPadrao) || 0,
        taxa_saque_tipo: taxaSaqueTipo,
        taxa_saque_padrao: parseFloat(taxaSaquePadrao) || 0,
        compartilhar_caixinhas: compartilharCaixinhas,
        compartilhar_contas: compartilharContas,
        plataforma_nome: plataformaNome.trim() || undefined,
        cor,
        icone: tipo === 'plr_infoproduto' ? 'Laptop' : tipo === 'ecommerce_drop' ? 'Store' : 'ShoppingBag'
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar workspace:', err);
      alert('Erro ao salvar workspace. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        id="modal_workspace"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: cor }}
            >
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-display">
                {workspaceToEdit ? 'Editar Negócio / Workspace' : 'Novo Negócio / Workspace'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure moedas, taxas de plataforma e custos específicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Nome do Negócio (Opcional / Personalizável) */}
          <div className="space-y-1.5" id="field_ws_nome">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nome do Negócio / Operação
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
            </div>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: DroopCod, Zenofi PLR, Loja de Cabelos, Droop África"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Se deixar em branco, usaremos o nome da plataforma ou "Meu Negócio".
            </p>
          </div>

          {/* Selecionador de Moeda Principal */}
          <div className="space-y-2" id="field_ws_moeda">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Moeda de Venda / Operação</span>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                Selecionada: {moeda}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOEDAS_DISPONIVEIS.map((m) => {
                const isSelected = moeda === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoeda(m.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{m.bandeira}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">{m.id}</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">({m.simbolo})</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate">{m.nome}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipo / Modelo de Negócio */}
          <div className="space-y-2" id="field_ws_tipo">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tipo de Negócio / Nicho
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'ecommerce_drop' as TipoNegocio,
                  icon: Store,
                  label: 'E-commerce & Drop Físico',
                  desc: 'Com produtos, entregas/envios e custos de estoque'
                },
                {
                  id: 'plr_infoproduto' as TipoNegocio,
                  icon: Laptop,
                  label: 'PLR & Infoprodutos',
                  desc: 'Digital: sem frete, foco em taxa de gateway & tráfego'
                },
                {
                  id: 'plataforma' as TipoNegocio,
                  icon: Globe,
                  label: 'Vendas via Plataforma / Afiliados',
                  desc: 'A plataforma gerencia a logística, taxas por venda e saque'
                },
                {
                  id: 'servicos' as TipoNegocio,
                  icon: ShoppingBag,
                  label: 'Comércio Próprio / Serviços',
                  desc: 'Cabelos, artesanato, alimentação, comércio local'
                }
              ].map((t) => {
                const isSelected = tipo === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTipo(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100">{t.label}</div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plataforma Nome (Sugestões rápidas) */}
          <div className="space-y-1.5" id="field_ws_plataforma">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Plataforma ou Canal de Vendas (Opcional)
            </label>
            <input
              type="text"
              value={plataformaNome}
              onChange={(e) => setPlataformaNome(e.target.value)}
              placeholder="Ex: DroopCod, Lojou, Txapilog, Zenofi, Kiwify, Shopify"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PLATAFORMAS_SUGESTOES.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => handleSelectPlataforma(plat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                    plataformaNome === plat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Configuração de Custos de Entrega / Envio */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2" id="field_ws_entrega_toggle">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${custoEnvioAtivo ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Custos de Entrega / Logística
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {custoEnvioAtivo 
                      ? 'Ativo: Exige/sugere zonas de entrega e custo de frete na venda'
                      : 'Desativado: Para infoprodutos ou quando a plataforma gerencia o envio'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={custoEnvioAtivo}
                onChange={(e) => setCustoEnvioAtivo(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Compartilhar Caixinhas / Pockets com outros Negócios */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2" id="field_ws_compartilhar_caixinhas">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${compartilharCaixinhas ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Compartilhar Caixinhas / Pockets
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {compartilharCaixinhas
                      ? 'Compartilhado: Usa as mesmas caixinhas e saldos dos outros negócios'
                      : 'Isolado (Recomendado): Este negócio terá caixinhas e saldos 100% próprios e independentes'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={compartilharCaixinhas}
                onChange={(e) => setCompartilharCaixinhas(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Compartilhar Contas Bancárias & Carteiras Móveis */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2" id="field_ws_compartilhar_contas">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${compartilharContas ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Contas Bancárias & Carteiras Móveis
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {compartilharContas
                      ? 'Juntar Tudo: As receitas e despesas entram nas mesmas contas e carteiras globais'
                      : 'Separar Carteiras (Recomendado): Cada negócio tem suas próprias contas e carteiras (M-Pesa, Bancos ou Gateways independentes)'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={compartilharContas}
                onChange={(e) => setCompartilharContas(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Taxa de Gateway / Plataforma por Venda */}
          <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl space-y-3" id="field_ws_taxa_venda">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-xl">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Taxa da Plataforma / Gateway por Venda
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Desconta taxa por transação (ex: 5% + 10 MT Lojou, 8.99% + 2.49 Kiwify)
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={taxaVendaAtiva}
                onChange={(e) => setTaxaVendaAtiva(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {taxaVendaAtiva && (
              <div className="space-y-2.5 pt-1 border-t border-purple-100 dark:border-purple-900/30">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Modelo de Cobrança da Taxa
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-purple-100/60 dark:bg-purple-900/40 p-1">
                    <button
                      type="button"
                      onClick={() => setTaxaVendaTipo('percentual')}
                      className={`py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer text-center ${
                        taxaVendaTipo === 'percentual' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      % Percentual
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxaVendaTipo('fixo')}
                      className={`py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer text-center ${
                        taxaVendaTipo === 'fixo' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {moeda} Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxaVendaTipo('combinado')}
                      className={`py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer text-center ${
                        taxaVendaTipo === 'combinado' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      % + {moeda} (Lojou)
                    </button>
                  </div>
                </div>

                {taxaVendaTipo === 'combinado' ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Percentual (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={taxaVendaPadrao}
                            onChange={(e) => setTaxaVendaPadrao(e.target.value)}
                            placeholder="Ex: 5"
                            className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs font-bold text-purple-600">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          + Valor Fixo ({moeda})
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={taxaVendaFixaPadrao}
                            onChange={(e) => setTaxaVendaFixaPadrao(e.target.value)}
                            placeholder="Ex: 10"
                            className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs font-bold text-purple-600">{moeda}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium pt-0.5">
                      💡 Cobra <strong>{taxaVendaPadrao || '0'}%</strong> do pedido + <strong>{taxaVendaFixaPadrao || '0'} {moeda}</strong> fixos por venda.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Taxa Padrão
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={taxaVendaPadrao}
                        onChange={(e) => setTaxaVendaPadrao(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs font-bold text-purple-600">
                        {taxaVendaTipo === 'percentual' ? '%' : moeda}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Taxa de Saque / Payout da Plataforma */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2.5" id="field_ws_taxa_saque">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Taxa de Saque / Payout da Plataforma
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {taxaSaqueTipo === 'percentual' 
                      ? 'Desconto percentual na retirada (ex: 5%)'
                      : `Taxa fixa deduzida por saque (ex: 50 ${moeda} Lojou)`}
                  </p>
                </div>
              </div>
              <div className="flex rounded-lg bg-amber-100/60 dark:bg-amber-900/40 p-0.5 border border-amber-200/60 dark:border-amber-800/40">
                <button
                  type="button"
                  onClick={() => setTaxaSaqueTipo('percentual')}
                  className={`px-2 py-0.5 text-[9px] font-black rounded-md transition-colors cursor-pointer ${
                    taxaSaqueTipo === 'percentual' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setTaxaSaqueTipo('fixo')}
                  className={`px-2 py-0.5 text-[9px] font-black rounded-md transition-colors cursor-pointer ${
                    taxaSaqueTipo === 'fixo' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {moeda} (Fixo)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200/40 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500">
                {taxaSaqueTipo === 'percentual' ? 'Percentual por saque:' : `Valor fixo por saque (${moeda}):`}
              </span>
              <div className="w-28 relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={taxaSaquePadrao}
                  onChange={(e) => setTaxaSaquePadrao(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none text-right pr-7"
                />
                <span className="absolute right-2 top-1.5 text-xs font-bold text-amber-600">
                  {taxaSaqueTipo === 'percentual' ? '%' : moeda}
                </span>
              </div>
            </div>
          </div>

          {/* Seletor de Cor do Workspace */}
          <div className="space-y-1.5" id="field_ws_cor">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Cor Temática do Negócio
            </label>
            <div className="flex items-center space-x-2">
              {CORES_PALETA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-7 h-7 rounded-xl transition-transform cursor-pointer flex items-center justify-center ${
                    cor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {cor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center space-x-2">
            {workspaceToEdit && onDelete && !workspaceToEdit.is_primary && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Tem certeza que deseja apagar este workspace?')) {
                    await onDelete(workspaceToEdit.id);
                    onClose();
                  }
                }}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'A salvar...' : workspaceToEdit ? 'Atualizar Negócio' : 'Criar Negócio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
