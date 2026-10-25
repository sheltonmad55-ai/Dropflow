/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoricoMeta {
  id: string;
  user_id?: string;
  tipo: 'diaria' | 'semanal' | 'mensal' | 'personalizada';
  titulo: string;
  data_inicio: string; // YYYY-MM-DD
  data_fim: string;    // YYYY-MM-DD
  valor_alvo: number;
  valor_atingido: number;
  status: 'batida' | 'nao_atingida';
  porcentagem: number;
  criado_em: string;
}

export type TipoNegocio = 'ecommerce_drop' | 'plr_infoproduto' | 'plataforma' | 'servicos' | 'pessoal' | 'hibrido';

export interface Workspace {
  id: string;
  user_id: string;
  nome: string; // Ex: "DroopCod", "Zenofi PLR", "Loja de Cabelos", "Pessoal & Investimentos"
  tipo: TipoNegocio;
  moeda: string; // 'MT' | 'AOA' | 'USD' | 'BRL' | 'ZAR' | 'EUR'
  custo_envio_ativo: boolean; // se tem custos de entrega/envio
  taxa_venda_ativa: boolean;  // se tem taxa percentual ou fixa por venda (gateway/plataforma)
  taxa_venda_tipo?: 'percentual' | 'fixo' | 'combinado';
  taxa_venda_padrao?: number; // taxa por venda (ex: 5% ou 10%)
  taxa_venda_fixa_padrao?: number; // taxa fixa complementar quando combinado (ex: +10 MT na Lojou)
  taxa_saque_tipo?: 'percentual' | 'fixo'; // '%' ou fixo
  taxa_saque_padrao?: number; // taxa por saque/retirada (ex: 5% ou 50 MT)
  compartilhar_caixinhas?: boolean; // se true, compartilha caixinhas/saldo global; se false, caixinhas 100% isoladas deste negócio
  plataforma_nome?: string;   // ex: "DroopCod", "Lojou", "Txapilog", "Zenofi", "Kiwify", "Shopify"
  cor?: string;
  icone?: string;
  is_primary?: boolean; // Negócio principal original (herda registros históricos sem workspace_id)
  criado_em: string;
}

export interface Profile {
  id: string; // matches user auth id
  email?: string;
  nome: string;
  pais: string;
  moeda: string;
  plano: 'trial' | 'pro' | 'expired';
  trial_expires_at: string; // ISO date
  trial_used?: boolean; // Flag to ensure each account only gets 1 free 15-day trial
  trial_activated_at?: string; // ISO date when 15-day trial was activated
  plano_expira_em?: string; // ISO date for subscription expiration
  plano_atualizado_em?: string;
  criado_em: string;
  tipo_negocio?: TipoNegocio; // 'ecommerce_drop' | 'plr_infoproduto' | 'plataforma' | 'servicos' | 'pessoal' | 'hibrido'
  custo_envio_ativo?: boolean; // Se custos de entrega/envio estão ativos (padrão true para drop, false para plr)
  taxa_venda_ativa?: boolean;  // Se taxa percentual/fixa por venda (gateway/plataforma) está ativa
  taxa_venda_tipo?: 'percentual' | 'fixo' | 'combinado'; // '%' ou 'fixo' ou 'combinado'
  taxa_venda_padrao?: number;  // Valor padrão da taxa (ex: 10% ou 50 MT)
  taxa_venda_fixa_padrao?: number; // Valor fixo adicional quando combinado (ex: 10 MT)
  taxa_saque_tipo?: 'percentual' | 'fixo'; // '%' ou 'fixo'
  taxa_saque_padrao?: number;  // Valor padrão da taxa de saque (ex: 5% ou 50 MT)
  workspaces?: Workspace[];    // Lista de workspaces / negócios cadastrados
  active_workspace_id?: string; // ID do workspace ativo atualmente
  primary_workspace_id?: string; // ID do workspace principal original
  anuncios_percent: number; // e.g. 50% of remainder
  lucro_percent: number;    // e.g. 50% of remainder
  metaDiaria?: number;
  metaSemanal?: number;
  metaMensal?: number;
  periodoDiaria?: number; // number of days, default: 1
  periodoSemanal?: number; // number of weeks, default: 1
  periodoMensal?: number; // number of months, default: 1
  metaDiariaInicio?: string;  // YYYY-MM-DD
  metaDiariaFim?: string;     // YYYY-MM-DD
  metaSemanalInicio?: string; // YYYY-MM-DD
  metaSemanalFim?: string;    // YYYY-MM-DD
  metaMensalInicio?: string;  // YYYY-MM-DD
  metaMensalFim?: string;     // YYYY-MM-DD
  historicoMetas?: HistoricoMeta[];
  metaDiariaBatidaEm?: string;
  metaSemanalBatidaEm?: string;
  metaMensalBatidaEm?: string;
  suspenso?: boolean;
  ativarSons?: boolean;
  somMetas?: boolean;
  somRelatorios?: boolean;
  contas_seeded?: boolean;
}

export interface Broadcast {
  id: string;
  texto: string;
  publico_alvo: 'todos' | 'trial_expira_2d';
  criado_em: string;
  titulo?: string;
  link?: string;
  imagem_url?: string;
  tipo?: 'aviso' | 'novidade';
}

export interface Relatorio {
  id: string;
  user_id: string;
  tipo: 'diario' | 'semanal' | 'mensal';
  data_geracao: string;
  total_vendido: number;
  total_gasto: number;
  balanco: number;
  progresso_metas: string;
  metas_atingidas: string[];
  lido?: boolean;
}

export type CaixinhaTipo = 'lucro' | 'anuncios' | 'fornecedores' | 'delivery' | 'personalizado';

export interface Caixinha {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome: string;
  icone: string; // lucide icon name
  cor: string;  // tailwind color class
  tipo: CaixinhaTipo;
  percentual_padrao?: number; // percent of remainder, if personalized and has distribution
  saldo_atual: number;
  criado_em: string;
  auto_distribuir?: boolean; // se vai receber de forma automatica quando houver vendas
  distribuicao_modo?: 'percentual' | 'fixo'; // 'percentual' ou 'fixo'
  valor_distribuicao?: number; // valor fixo ou percentual dependendo do modo
}

export type ContaTipo = 'carteira_movel' | 'banco' | 'caixa_fisico' | 'caixa' | 'outros';

export interface RetiradaHistoricoItem {
  id: string;
  data: string; // ISO date string
  valor: number;
  motivo: string;
  taxa_saque_tipo?: 'percentual' | 'fixo';
  taxa_saque_valor?: number; // taxa retida na retirada/saque (ex: 5% ou valor fixo da plataforma)
  valor_liquido?: number;    // valor líquido recebido
  despesa_descricao?: string;
  despesa_id?: string;
}

export interface ContaBancaria {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome: string;          // ex: "EMPRESA", "e-Mola", "M-Pesa", "BIM", "BCI", "M-Pesa de Sócio"
  tipo: ContaTipo;
  saldo_atual: number;
  cor?: string;
  banco?: string;
  tipo_conta?: string;
  editavel?: boolean;    // mantido para compatibilidade
  status_liberdade?: 'livre' | 'emergencia'; // 'livre' (uso geral nas saídas) ou 'emergencia' (não mexer / reserva)
  historico_retiradas?: RetiradaHistoricoItem[];
  criado_em: string;
}

export interface DespesaRecorrente {
  id: string;
  user_id: string;
  workspace_id?: string;
  descricao: string;
  valor: number;
  caixinha_id: string;
  categoria: string;
  frequencia: 'mensal' | 'semanal';
  dia_vencimento: number; // dia 1-31 para mensal, ou 0-6 para semanal
  ultimo_processado?: string; // YYYY-MM-DD
  ativa: boolean;
  criado_em: string;
}

export interface MetaItem {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome: string;          // ex: "Comprar Celular"
  valor_alvo: number;    // ex: 25000 MT
  valor_atual: number;   // ex: 5000 MT
  data_limite?: string;  // YYYY-MM-DD
  categoria?: string;    // "Pessoal", "Equipamento", "Sonho", "Negócio"
  icone?: string;        // "smartphone", "car", "laptop", "home", "gift"
  sync_status?: 'synced' | 'pending';
  criado_em: string;
}

export interface Venda {
  id: string;
  user_id: string;
  workspace_id?: string;
  valor_recebido: number;
  produto_id: string;
  fornecedor_id: string;
  zona_entrega_id?: string; // opcional para infoprodutos / quando custo de envio está desligado
  taxa_venda_tipo?: 'percentual' | 'fixo' | 'combinado'; // tipo de taxa da plataforma/gateway (% ou valor fixo ou combinado)
  taxa_venda_valor?: number; // porcentagem ou valor fixo configurado na venda
  taxa_venda_fixa?: number;  // valor fixo adicional quando combinado (ex: +10 MT na Lojou)
  taxa_venda_total?: number; // valor final deduzido na moeda local (MT)
  forma_pagamento: string;
  observacao: string;
  data_venda: string; // YYYY-MM-DD
  distribuicao: {
    [caixinhaId: string]: number; // snapshot of distributed values
  };
  custom_anuncios_percent?: number;
  custom_anuncios_tipo?: 'percentual' | 'mt' | 'usd';
  custom_anuncios_valor?: number;
  custom_anuncios_taxa_cambio?: number; // ex: 64 MT por 1 USD
  meta_id?: string;             // ID da Meta (Sonho/Objetivo) para alocação direta
  meta_valor_alocado?: number;  // Valor em MT alocado para a meta
  conta_id?: string;            // ID da Conta Bancária / Carteira onde o valor foi depositado
  quantidade?: number;
  custo_compra_total?: number;
  preco_unitario?: number;
  desconto?: number;
  order_bumps_selecionados?: string[]; // IDs ou nomes dos order bumps incluídos nesta venda
  upsells_selecionados?: string[];     // IDs ou nomes dos upsells incluídos nesta venda
  status?: 'pendente' | 'entregue';
  sync_status: 'synced' | 'pending';
  criado_em: string;
}

export interface Despesa {
  id: string;
  user_id: string;
  workspace_id?: string;
  valor: number;
  categoria: string;
  caixinha_id: string;
  conta_id?: string;           // ID da Conta Bancária / Carteira de onde saiu o valor
  motivo_emergencia?: string;  // Motivo caso tenha retirado de conta com status 'emergencia'
  descricao: string;
  data: string; // YYYY-MM-DD
  distribuicao_caixinhas?: { [caixinhaId: string]: number };
  distribuicao_contas?: { [contaId: string]: number };
  fornecedor_id_pagamento?: string;
  fornecedor_valor_pago?: number;
  sync_status: 'synced' | 'pending';
  criado_em: string;
}

export interface OrderBumpItem {
  id: string;
  nome: string;
  preco: number;
}

export interface UpsellItem {
  id: string;
  nome: string;
  preco: number;
}

export interface Produto {
  id: string;
  user_id: string;
  workspace_id?: string;
  tipo?: 'fisico' | 'digital_plr'; // 'fisico' (ecommerce/drop) ou 'digital_plr' (infoproduto/ebook/curso)
  nome: string;
  categoria: string;
  fornecedor_id?: string; // opcional para infoprodutos / PLR
  preco_compra?: number;   // opcional para infoprodutos / PLR (custo de compra 0)
  preco_venda: number;
  margem: number; // calculated field (preco_venda - preco_compra) / preco_venda * 100
  quantidade?: number;     // opcional para infoprodutos / PLR
  lote_reposicao?: number; // default batch size for restocking (e.g. 100 units)
  kits?: { qtd: number; preco: number }[];
  tem_order_bump?: boolean;
  order_bumps?: OrderBumpItem[];
  tem_upsell?: boolean;
  upsells?: UpsellItem[];
  criado_em: string;
}

export interface Fornecedor {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome: string;
  telefone: string;
  valor_pendente: number;
  tipo_origem?: 'importado' | 'local'; // 'importado' (acumula no caixa de fornecedor/estoque) ou 'local' (compra local em Maputo, retorno direto ao caixa principal)
  criado_em: string;
}

export interface ZonaEntrega {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome_zona: string;
  custo: number;
  criado_em: string;
}

export interface MetricaDiaria {
  id: string;
  data: string; // YYYY-MM-DD
  gasto: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  valor_vendas: number;
  observacao?: string;
  // Dynamic metrics
  objetivo?: 'mensagens' | 'vendas' | 'trafego' | 'reconhecimento';
  conversas_iniciadas?: number;
  custo_por_conversa?: number;
  alcance?: number;
  frequencia?: number;
  cpm?: number;
  compras?: number;
  custo_por_compra?: number;
  cliques_na_ligacao?: number;
  ctr?: number;
  cpc?: number;
  visualizacoes_pagina_destino?: number;
  cliques_todos?: number;
  ctr_tudo?: number;
  cpc_tudo?: number;
}

export interface Campanha {
  id: string;
  user_id: string;
  workspace_id?: string;
  nome: string;
  plataforma: string;
  orcamento: number;
  gasto: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  valor_vendas: number;
  data: string; // YYYY-MM-DD
  criado_em: string;
  orcamento_maximo?: number;
  orcamento_usd?: boolean;
  metricas_diarias?: MetricaDiaria[];
  // Dynamic metrics
  objetivo?: 'mensagens' | 'vendas' | 'trafego' | 'reconhecimento';
  conversas_iniciadas?: number;
  custo_por_conversa?: number;
  alcance?: number;
  frequencia?: number;
  cpm?: number;
  compras?: number;
  custo_por_compra?: number;
  cliques_na_ligacao?: number;
  ctr?: number;
  cpc?: number;
  visualizacoes_pagina_destino?: number;
  cliques_todos?: number;
  ctr_tudo?: number;
  cpc_tudo?: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'profile' | 'caixinha' | 'venda' | 'despesa' | 'produto' | 'fornecedor' | 'zona' | 'campanha' | 'despesa_recorrente' | 'meta_item' | 'conta_bancaria' | 'workspace';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}
