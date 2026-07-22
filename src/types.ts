/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string; // matches user auth id
  nome: string;
  pais: string;
  moeda: string;
  plano: 'trial' | 'pro' | 'expired';
  trial_expires_at: string; // ISO date
  criado_em: string;
  anuncios_percent: number; // e.g. 50% of remainder
  lucro_percent: number;    // e.g. 50% of remainder
  metaDiaria?: number;
  metaSemanal?: number;
  metaMensal?: number;
  periodoDiaria?: number; // number of days, default: 1
  periodoSemanal?: number; // number of weeks, default: 1
  periodoMensal?: number; // number of months, default: 1
  metaDiariaBatidaEm?: string;
  metaSemanalBatidaEm?: string;
  metaMensalBatidaEm?: string;
  suspenso?: boolean;
  ativarSons?: boolean;
  somMetas?: boolean;
  somRelatorios?: boolean;
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

export interface DespesaRecorrente {
  id: string;
  user_id: string;
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
  valor_recebido: number;
  produto_id: string;
  fornecedor_id: string;
  zona_entrega_id: string;
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
  quantidade?: number;
  preco_unitario?: number;
  desconto?: number;
  status?: 'pendente' | 'entregue';
  sync_status: 'synced' | 'pending';
  criado_em: string;
}

export interface Despesa {
  id: string;
  user_id: string;
  valor: number;
  categoria: string;
  caixinha_id: string;
  descricao: string;
  data: string; // YYYY-MM-DD
  sync_status: 'synced' | 'pending';
  criado_em: string;
}

export interface Produto {
  id: string;
  user_id: string;
  nome: string;
  categoria: string;
  fornecedor_id: string;
  preco_compra: number;
  preco_venda: number;
  margem: number; // calculated field (preco_venda - preco_compra) / preco_venda * 100
  quantidade: number;
  kits?: { qtd: number; preco: number }[];
  criado_em: string;
}

export interface Fornecedor {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  valor_pendente: number;
  criado_em: string;
}

export interface ZonaEntrega {
  id: string;
  user_id: string;
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
  type: 'profile' | 'caixinha' | 'venda' | 'despesa' | 'produto' | 'fornecedor' | 'zona' | 'campanha' | 'despesa_recorrente' | 'meta_item';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}
