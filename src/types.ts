/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string; // matches user auth id
  nome: string;
  pais: string;
  moeda: string;
  plano: 'trial' | 'pro';
  trial_expires_at: string; // ISO date
  criado_em: string;
  anuncios_percent: number; // e.g. 50% of remainder
  lucro_percent: number;    // e.g. 50% of remainder
  fcm_token?: string;
  fcm_enabled?: boolean;
  daily_summary_time?: string;
  alert_meta_batida?: boolean;
  meta_lucro_diario?: number;
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

export interface SyncQueueItem {
  id: string;
  type: 'profile' | 'caixinha' | 'venda' | 'despesa' | 'produto' | 'fornecedor' | 'zona';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}
