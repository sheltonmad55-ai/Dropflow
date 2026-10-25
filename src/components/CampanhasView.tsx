/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Papa from 'papaparse';
import { useApp } from '../lib/appContext.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { Campanha, MetricaDiaria } from '../types.ts';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  MousePointerClick, 
  Eye, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  X,
  AlertTriangle,
  Sparkles,
  Info,
  Upload,
  Download,
  Package,
  Tag,
  CheckCircle2
} from 'lucide-react';

export default function CampanhasView() {
  const { campanhas, addCampanha, editCampanha, deleteCampanha, profile, produtos } = useApp();
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);
  const [filterPlataforma, setFilterPlataforma] = useState<string>('todas');
  
  // Delete modal state
  const [deletingCampanhaId, setDeletingCampanhaId] = useState<string | null>(null);
  const [deletingMetricaId, setDeletingMetricaId] = useState<string | null>(null);
  
  // Form State
  const [nome, setNome] = useState('');
  const [plataforma, setPlataforma] = useState('Facebook Ads');
  const [orcamento, setOrcamento] = useState('');
  const [gasto, setGasto] = useState('');
  const [cliques, setCliques] = useState('');
  const [impressoes, setImpressoes] = useState('');
  const [conversoes, setConversoes] = useState('');
  const [valorVendas, setValorVendas] = useState('');
  const [dataCampanha, setDataCampanha] = useState(new Date().toISOString().split('T')[0]);
  
  // Product Association State
  const [produtoId, setProdutoId] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  
  // New States for Maximum Budget & Currency
  const [orcamentoMaximo, setOrcamentoMaximo] = useState('');
  const [orcamentoUsd, setOrcamentoUsd] = useState(false);

  // Campaign Objective & Dynamic Metrics states
  const [objetivo, setObjetivo] = useState<'mensagens' | 'vendas' | 'trafego' | 'reconhecimento'>('mensagens');
  const [conversasIniciadas, setConversasIniciadas] = useState('');
  const [custoPorConversa, setCustoPorConversa] = useState('');
  const [alcance, setAlcance] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [cpm, setCpm] = useState('');
  const [compras, setCompras] = useState('');
  const [custoPorCompra, setCustoPorCompra] = useState('');
  const [cliquesNaLigacao, setCliquesNaLigacao] = useState('');
  const [ctr, setCtr] = useState('');
  const [cpc, setCpc] = useState('');
  const [visualizacoesPaginaDestino, setVisualizacoesPaginaDestino] = useState('');
  const [cliquesTodos, setCliquesTodos] = useState('');
  const [ctrTudo, setCtrTudo] = useState('');
  const [cpcTudo, setCpcTudo] = useState('');

  // CSV Import states
  const [csvCampaignsList, setCsvCampaignsList] = useState<Array<Record<string, string>>>([]);
  const [showCsvSelection, setShowCsvSelection] = useState(false);
  const [exchangeRate, setExchangeRate] = useState('64.0');

  // Daily Metrics Modal States
  const [selectedCampanhaForMetrics, setSelectedCampanhaForMetrics] = useState<Campanha | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  
  // Daily Metric Form State
  const [mData, setMData] = useState(new Date().toISOString().split('T')[0]);
  const [mGasto, setMGasto] = useState('');
  const [mCliques, setMCliques] = useState('');
  const [mImpressoes, setMImpressoes] = useState('');
  const [mConversoes, setMConversoes] = useState('');
  const [mValorVendas, setMValorVendas] = useState('');
  const [mObservacao, setMObservacao] = useState('');

  // Register Daily Metric Handler
  const handleRegisterMetricaDiaria = async () => {
    if (!selectedCampanhaForMetrics) return;

    const newMetrica: MetricaDiaria = {
      id: crypto.randomUUID(),
      data: mData,
      gasto: Number(mGasto) || 0,
      cliques: Number(mCliques) || 0,
      impressoes: Number(mImpressoes) || 0,
      conversoes: Number(mConversoes) || 0,
      valor_vendas: Number(mValorVendas) || 0,
      observacao: mObservacao || ''
    };

    const currentMetrics = selectedCampanhaForMetrics.metricas_diarias || [];
    const updatedMetrics = [newMetrica, ...currentMetrics].sort((a, b) => b.data.localeCompare(a.data));

    // Recalculate campaign totals
    const totalG = updatedMetrics.reduce((sum, m) => sum + m.gasto, 0);
    const totalCli = updatedMetrics.reduce((sum, m) => sum + m.cliques, 0);
    const totalImp = updatedMetrics.reduce((sum, m) => sum + m.impressoes, 0);
    const totalConv = updatedMetrics.reduce((sum, m) => sum + m.conversoes, 0);
    const totalV = updatedMetrics.reduce((sum, m) => sum + m.valor_vendas, 0);

    const updatedCampanha: Campanha = {
      ...selectedCampanhaForMetrics,
      gasto: totalG,
      cliques: totalCli,
      impressoes: totalImp,
      conversoes: totalConv,
      valor_vendas: totalV,
      metricas_diarias: updatedMetrics
    };

    await editCampanha(selectedCampanhaForMetrics.id, updatedCampanha);
    setSelectedCampanhaForMetrics(updatedCampanha);

    // Reset metric form
    setMGasto('');
    setMCliques('');
    setMImpressoes('');
    setMConversoes('');
    setMValorVendas('');
    setMObservacao('');
  };

  // Delete Daily Metric Handler
  const handleDeleteMetricaDiaria = (metricaId: string) => {
    if (!selectedCampanhaForMetrics) return;
    setDeletingMetricaId(metricaId);
  };

  const confirmDeleteMetricaDiaria = async () => {
    if (!selectedCampanhaForMetrics || !deletingMetricaId) return;

    const currentMetrics = selectedCampanhaForMetrics.metricas_diarias || [];
    const updatedMetrics = currentMetrics.filter(m => m.id !== deletingMetricaId);

    // Recalculate campaign totals
    const totalG = updatedMetrics.reduce((sum, m) => sum + m.gasto, 0);
    const totalCli = updatedMetrics.reduce((sum, m) => sum + m.cliques, 0);
    const totalImp = updatedMetrics.reduce((sum, m) => sum + m.impressoes, 0);
    const totalConv = updatedMetrics.reduce((sum, m) => sum + m.conversoes, 0);
    const totalV = updatedMetrics.reduce((sum, m) => sum + m.valor_vendas, 0);

    const updatedCampanha: Campanha = {
      ...selectedCampanhaForMetrics,
      gasto: totalG,
      cliques: totalCli,
      impressoes: totalImp,
      conversoes: totalConv,
      valor_vendas: totalV,
      metricas_diarias: updatedMetrics
    };

    await editCampanha(selectedCampanhaForMetrics.id, updatedCampanha);
    setSelectedCampanhaForMetrics(updatedCampanha);
    setDeletingMetricaId(null);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingCampanha(null);
    setNome('');
    setPlataforma('Facebook Ads');
    setOrcamento('');
    setGasto('');
    setCliques('');
    setImpressoes('');
    setConversoes('');
    setValorVendas('');
    setDataCampanha(new Date().toISOString().split('T')[0]);
    setOrcamentoMaximo('');
    setOrcamentoUsd(false);
    setProdutoId('');
    setProdutoNome('');

    setObjetivo('mensagens');
    setConversasIniciadas('');
    setCustoPorConversa('');
    setAlcance('');
    setFrequencia('');
    setCpm('');
    setCompras('');
    setCustoPorCompra('');
    setCliquesNaLigacao('');
    setCtr('');
    setCpc('');
    setVisualizacoesPaginaDestino('');
    setCliquesTodos('');
    setCtrTudo('');
    setCpcTudo('');

    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (campanha: Campanha) => {
    setEditingCampanha(campanha);
    setNome(campanha.nome);
    setPlataforma(campanha.plataforma);
    setOrcamento(campanha.orcamento.toString());
    setGasto(campanha.gasto.toString());
    setCliques(campanha.cliques.toString());
    setImpressoes(campanha.impressoes.toString());
    setConversoes(campanha.conversoes.toString());
    setValorVendas(campanha.valor_vendas.toString());
    setDataCampanha(campanha.data);
    setOrcamentoMaximo(campanha.orcamento_maximo?.toString() || '');
    setOrcamentoUsd(!!campanha.orcamento_usd);
    setProdutoId(campanha.produto_id || '');
    setProdutoNome(campanha.produto_nome || '');

    setObjetivo(campanha.objetivo || 'mensagens');
    setConversasIniciadas(campanha.conversas_iniciadas?.toString() || '');
    setCustoPorConversa(campanha.custo_por_conversa?.toString() || '');
    setAlcance(campanha.alcance?.toString() || '');
    setFrequencia(campanha.frequencia?.toString() || '');
    setCpm(campanha.cpm?.toString() || '');
    setCompras(campanha.compras?.toString() || '');
    setCustoPorCompra(campanha.custo_por_compra?.toString() || '');
    setCliquesNaLigacao(campanha.cliques_na_ligacao?.toString() || '');
    setCtr(campanha.ctr?.toString() || '');
    setCpc(campanha.cpc?.toString() || '');
    setVisualizacoesPaginaDestino(campanha.visualizacoes_pagina_destino?.toString() || '');
    setCliquesTodos(campanha.cliques_todos?.toString() || '');
    setCtrTudo(campanha.ctr_tudo?.toString() || '');
    setCpcTudo(campanha.cpc_tudo?.toString() || '');

    setIsModalOpen(true);
  };

  // CSV Import handlers
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Array<Record<string, string>>;
        if (rows.length === 0) {
          alert("O ficheiro CSV está vazio.");
          return;
        }
        
        // Filter out totals rows or rows without campaign names
        const campaignRows = rows.filter(row => {
          const name = row['Nome da campanha'] || row['Campaign name'] || '';
          return name && !name.toLowerCase().includes('total');
        });

        if (campaignRows.length === 0) {
          alert("Nenhuma campanha válida encontrada no ficheiro CSV.");
          return;
        }

        if (campaignRows.length === 1) {
          importCsvRow(campaignRows[0]);
        } else {
          setCsvCampaignsList(campaignRows);
          setShowCsvSelection(true);
        }
      },
      error: (err) => {
        alert("Erro ao ler o ficheiro CSV: " + err.message);
      }
    });
  };

  const importCsvRow = (row: Record<string, string>) => {
    const campaignName = row['Nome da campanha'] || row['Campaign name'] || '';
    if (campaignName) {
      setNome(campaignName);
    }

    // Auto-detect product by matching campaign name with catalog
    let matchedProduct: typeof produtos[0] | undefined;
    if (produtos && produtos.length > 0 && campaignName) {
      const normName = campaignName.toLowerCase();
      matchedProduct = produtos.find(p => {
        const pName = p.nome.toLowerCase().trim();
        return normName.includes(pName) || (pName.length >= 4 && normName.includes(pName.slice(0, 4)));
      });
      if (matchedProduct) {
        setProdutoId(matchedProduct.id);
        setProdutoNome(matchedProduct.nome);
      }
    }

    const rate = Number(exchangeRate) || 1;

    const parseCsvNumber = (val: string | undefined): number => {
      if (!val) return 0;
      let cleaned = val.replace(/[^\d.,-]/g, '').trim();
      if (cleaned.includes(',') && cleaned.includes('.')) {
        if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      } else if (cleaned.includes(',')) {
        const parts = cleaned.split(',');
        if (parts[1] && parts[1].length === 3) {
          cleaned = cleaned.replace(/,/g, '');
        } else {
          cleaned = cleaned.replace(',', '.');
        }
      }
      return Number(cleaned) || 0;
    };

    const convertValueIfNeeded = (usdValue: number) => {
      if (orcamentoUsd) {
        return usdValue;
      } else {
        return usdValue * rate;
      }
    };

    // 0. Orçamento (se vier no CSV)
    const orcamentoKey = Object.keys(row).find(k => k.toLowerCase().includes('orçamento') || k.toLowerCase().includes('orcamento') || k.toLowerCase().includes('budget'));
    if (orcamentoKey) {
      const rawOrc = parseCsvNumber(row[orcamentoKey]);
      const isHeaderUsd = orcamentoKey.toUpperCase().includes('USD');
      if (rawOrc > 0) {
        setOrcamento((isHeaderUsd ? convertValueIfNeeded(rawOrc) : rawOrc).toFixed(2));
      }
    }

    // 1. Gasto
    const gastoUsdKey = Object.keys(row).find(k => k.toLowerCase().includes('gasto') || k.toLowerCase().includes('spent'));
    let parsedGastoVal = 0;
    if (gastoUsdKey) {
      const rawGasto = parseCsvNumber(row[gastoUsdKey]);
      const isHeaderUsd = gastoUsdKey.toUpperCase().includes('USD');
      parsedGastoVal = isHeaderUsd ? convertValueIfNeeded(rawGasto) : rawGasto;
      setGasto(parsedGastoVal.toFixed(2));
      if (!orcamento) {
        setOrcamento(parsedGastoVal.toFixed(2));
      }
    }

    // 2. Resultados + Indicador
    const resultadosKey = Object.keys(row).find(k => k === 'Resultados' || k === 'Results');
    const resultadosVal = resultadosKey ? parseCsvNumber(row[resultadosKey]) : 0;

    if (resultadosKey) {
      if (objetivo === 'mensagens') {
        setConversasIniciadas(resultadosVal.toString());
      } else if (objetivo === 'vendas') {
        setCompras(resultadosVal.toString());
        setConversoes(resultadosVal.toString());
        if (matchedProduct && resultadosVal > 0) {
          setValorVendas((resultadosVal * matchedProduct.preco_venda).toFixed(2));
        }
      } else if (objetivo === 'trafego') {
        setCliquesTodos(resultadosVal.toString());
        setCliques(resultadosVal.toString());
      }
    }

    // 3. Custo por resultados
    const custoResultadosKey = Object.keys(row).find(k => k.toLowerCase().includes('custo por resultado') || k.toLowerCase().includes('cost per result'));
    if (custoResultadosKey) {
      const rawCustoResult = parseCsvNumber(row[custoResultadosKey]);
      const isHeaderUsd = custoResultadosKey.toUpperCase().includes('USD');
      const val = isHeaderUsd ? convertValueIfNeeded(rawCustoResult) : rawCustoResult;
      if (objetivo === 'mensagens') {
        setCustoPorConversa(val.toFixed(2));
      } else if (objetivo === 'vendas') {
        setCustoPorCompra(val.toFixed(2));
      }
    }

    // 4. Impressões
    const impressoesKey = Object.keys(row).find(k => k === 'Impressões' || k === 'Impressions' || k.toLowerCase().includes('impressoes'));
    if (impressoesKey) {
      setImpressoes(parseCsvNumber(row[impressoesKey]).toString());
    }

    // 5. Alcance
    const alcanceKey = Object.keys(row).find(k => k === 'Alcance' || k === 'Reach');
    if (alcanceKey) {
      setAlcance(parseCsvNumber(row[alcanceKey]).toString());
    }

    // 6. Frequência
    const frequenciaKey = Object.keys(row).find(k => k === 'Frequência' || k === 'Frequency' || k.toLowerCase().includes('frequencia'));
    if (frequenciaKey) {
      setFrequencia(parseCsvNumber(row[frequenciaKey]).toFixed(2));
    }

    // 7. CPM
    const cpmKey = Object.keys(row).find(k => k.toUpperCase().startsWith('CPM'));
    if (cpmKey) {
      const rawCpm = parseCsvNumber(row[cpmKey]);
      const isHeaderUsd = cpmKey.toUpperCase().includes('USD');
      const val = isHeaderUsd ? convertValueIfNeeded(rawCpm) : rawCpm;
      setCpm(val.toFixed(2));
    }

    // 8. Cliques na ligação
    const cliquesLigacaoKey = Object.keys(row).find(k => k.toLowerCase().includes('cliques na ligação') || k.toLowerCase().includes('cliques na ligacao') || k.toLowerCase().includes('link clicks'));
    if (cliquesLigacaoKey) {
      const cl = parseCsvNumber(row[cliquesLigacaoKey]);
      setCliquesNaLigacao(cl.toString());
      setCliques(cl.toString());
    }

    // 9. CTR
    const ctrKey = Object.keys(row).find(k => k.toLowerCase().includes('ctr (taxa de cliques na ligação') || k.toLowerCase().includes('ctr (taxa de cliques na ligacao') || k.toLowerCase().includes('outbound ctr'));
    if (ctrKey) {
      setCtr(parseCsvNumber(row[ctrKey]).toFixed(2));
    }

    // 10. CPC
    const cpcKey = Object.keys(row).find(k => k.toLowerCase().includes('cpc (custo por clique na ligação') || k.toLowerCase().includes('cpc (custo por clique na ligacao') || k.toLowerCase().includes('cost per outbound click'));
    if (cpcKey) {
      const rawCpc = parseCsvNumber(row[cpcKey]);
      const isHeaderUsd = cpcKey.toUpperCase().includes('USD');
      setCpc((isHeaderUsd ? convertValueIfNeeded(rawCpc) : rawCpc).toFixed(2));
    }

    // 11. Cliques (Todos)
    const cliquesTodosKey = Object.keys(row).find(k => k === 'Cliques (Todos)' || k === 'Clicks (All)' || k.toLowerCase().includes('cliques (todos)'));
    if (cliquesTodosKey) {
      const clT = parseCsvNumber(row[cliquesTodosKey]);
      setCliquesTodos(clT.toString());
      if (objetivo === 'trafego') {
        setCliques(clT.toString());
      }
    }

    // 12. CTR (tudo)
    const ctrTudoKey = Object.keys(row).find(k => k.toLowerCase().includes('ctr (tudo)') || k.toLowerCase().includes('ctr (all)'));
    if (ctrTudoKey) {
      setCtrTudo(parseCsvNumber(row[ctrTudoKey]).toFixed(2));
    }

    // 13. CPC (tudo)
    const cpcTudoKey = Object.keys(row).find(k => k.toLowerCase().includes('cpc (tudo)') || k.toLowerCase().includes('cpc (all)'));
    if (cpcTudoKey) {
      const rawCpcTudo = parseCsvNumber(row[cpcTudoKey]);
      const isHeaderUsd = cpcTudoKey.toUpperCase().includes('USD');
      setCpcTudo((isHeaderUsd ? convertValueIfNeeded(rawCpcTudo) : rawCpcTudo).toFixed(2));
    }

    // 14. Compras
    const comprasKey = Object.keys(row).find(k => k === 'Compras' || k === 'Purchases' || k.toLowerCase().includes('compras'));
    if (comprasKey) {
      const comp = parseCsvNumber(row[comprasKey]);
      setCompras(comp.toString());
      setConversoes(comp.toString());
      if (matchedProduct && comp > 0) {
        setValorVendas((comp * matchedProduct.preco_venda).toFixed(2));
      }
    }

    // 15. Custo por compra
    const custoCompraKey = Object.keys(row).find(k => k.toLowerCase().includes('custo por compra') || k.toLowerCase().includes('cost per purchase'));
    if (custoCompraKey) {
      const rawCustoCompra = parseCsvNumber(row[custoCompraKey]);
      const isHeaderUsd = custoCompraKey.toUpperCase().includes('USD');
      setCustoPorCompra((isHeaderUsd ? convertValueIfNeeded(rawCustoCompra) : rawCustoCompra).toFixed(2));
    }

    // 16. Visualizações da página de destino
    const viewsKey = Object.keys(row).find(k => k.toLowerCase().includes('visualizações da página de destino') || k.toLowerCase().includes('visualizacoes da pagina de destino') || k.toLowerCase().includes('landing page views'));
    if (viewsKey) {
      setVisualizacoesPaginaDestino(parseCsvNumber(row[viewsKey]).toString());
    }

    setIsModalOpen(true);
    setShowCsvSelection(false);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !orcamento) return;

    const hasDailyMetrics = editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0;

    const dataPayload: Partial<Campanha> = {
      nome,
      plataforma,
      orcamento: Number(orcamento) || 0,
      orcamento_maximo: Number(orcamentoMaximo) || 0,
      orcamento_usd: orcamentoUsd,
      data: dataCampanha,
      produto_id: produtoId || undefined,
      produto_nome: produtoNome || (produtoId ? produtos.find(p => p.id === produtoId)?.nome : undefined),
      objetivo,
      conversas_iniciadas: Number(conversasIniciadas) || 0,
      custo_por_conversa: Number(custoPorConversa) || 0,
      alcance: Number(alcance) || 0,
      frequencia: Number(frequencia) || 0,
      cpm: Number(cpm) || 0,
      compras: Number(compras) || 0,
      custo_por_compra: Number(custoPorCompra) || 0,
      cliques_na_ligacao: Number(cliquesNaLigacao) || 0,
      ctr: Number(ctr) || 0,
      cpc: Number(cpc) || 0,
      visualizacoes_pagina_destino: Number(visualizacoesPaginaDestino) || 0,
      cliques_todos: Number(cliquesTodos) || 0,
      ctr_tudo: Number(ctrTudo) || 0,
      cpc_tudo: Number(cpcTudo) || 0,
    };

    if (hasDailyMetrics) {
      dataPayload.metricas_diarias = editingCampanha.metricas_diarias;
      dataPayload.gasto = editingCampanha.gasto;
      dataPayload.cliques = editingCampanha.cliques;
      dataPayload.impressoes = editingCampanha.impressoes;
      dataPayload.conversoes = editingCampanha.conversoes;
      dataPayload.valor_vendas = editingCampanha.valor_vendas;
    } else {
      dataPayload.gasto = Number(gasto) || 0;
      dataPayload.cliques = Number(cliques) || 0;
      dataPayload.impressoes = Number(impressoes) || 0;
      dataPayload.conversoes = Number(conversoes) || 0;
      dataPayload.valor_vendas = Number(valorVendas) || 0;
      dataPayload.metricas_diarias = [];
    }

    if (editingCampanha) {
      await editCampanha(editingCampanha.id, dataPayload);
    } else {
      await addCampanha(dataPayload as Omit<Campanha, 'id' | 'user_id' | 'criado_em'>);
    }

    setIsModalOpen(false);
  };

  // Export all campaigns to CSV with product and unit cost breakdown
  const handleExportCsv = () => {
    if (campanhas.length === 0) {
      alert("Não existem campanhas registradas para exportar.");
      return;
    }

    const exportData = campanhas.map(c => {
      const prod = produtos.find(p => p.id === c.produto_id);
      const roas = c.gasto > 0 ? (c.valor_vendas / c.gasto).toFixed(2) : '0.00';
      const cpa = c.conversoes > 0 ? (c.gasto / c.conversoes).toFixed(2) : '0.00';
      const cpc = c.cliques > 0 ? (c.gasto / c.cliques).toFixed(2) : '0.00';
      const convRate = c.cliques > 0 ? ((c.conversoes / c.cliques) * 100).toFixed(2) : '0.00';
      const custoUnitarioProd = prod?.preco_compra || 0;
      const precoVendaProd = prod?.preco_venda || 0;
      const custoTotalProdutos = c.conversoes * custoUnitarioProd;
      const lucroLiquidoReal = c.valor_vendas - c.gasto - custoTotalProdutos;
      const margemLiquidaUnit = prod ? (precoVendaProd - custoUnitarioProd - Number(cpa)).toFixed(2) : 'N/A';

      return {
        'Nome da Campanha': c.nome,
        'Data': c.data,
        'Plataforma': c.plataforma,
        'Objetivo': c.objetivo || 'mensagens',
        'Produto Vinculado': c.produto_nome || prod?.nome || 'Nenhum',
        'Preço Venda Unitário': precoVendaProd,
        'Custo Unitário Produto': custoUnitarioProd,
        'Moeda': c.orcamento_usd ? 'USD' : moedaSymbol,
        'Orçamento': c.orcamento,
        'Orçamento Máximo': c.orcamento_maximo || 'Sem limite',
        'Valor Gasto': c.gasto,
        'Retorno Vendas': c.valor_vendas,
        'Custo Total Produtos Vendidos': custoTotalProdutos,
        'Lucro Líquido Real': lucroLiquidoReal,
        'Margem Líquida por Venda': margemLiquidaUnit,
        'Conversões/Compras': c.conversoes,
        'CPA (Custo por Aquisição)': cpa,
        'Cliques': c.cliques,
        'Taxa de Conversão (%)': `${convRate}%`,
        'CTR (%)': c.ctr || 0,
        'CPC': cpc,
        'ROAS': roas,
        'Impressões': c.impressoes,
        'Alcance': c.alcance || 0,
        'CPM': c.cpm || 0
      };
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dropflow_campanhas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    setDeletingCampanhaId(id);
  };

  // Platform Filter options
  const plataformasUnicas = Array.from(new Set(campanhas.map(c => c.plataforma)));

  // Filtered campanhas
  const filteredCampanhas = filterPlataforma === 'todas'
    ? campanhas
    : campanhas.filter(c => c.plataforma === filterPlataforma);

  // Totals calculations
  const totalOrcamentoLocal = filteredCampanhas.filter(c => !c.orcamento_usd).reduce((sum, c) => sum + c.orcamento, 0);
  const totalOrcamentoUsd = filteredCampanhas.filter(c => c.orcamento_usd).reduce((sum, c) => sum + c.orcamento, 0);

  const totalGastoLocal = filteredCampanhas.filter(c => !c.orcamento_usd).reduce((sum, c) => sum + c.gasto, 0);
  const totalGastoUsd = filteredCampanhas.filter(c => c.orcamento_usd).reduce((sum, c) => sum + c.gasto, 0);

  const totalVendasLocal = filteredCampanhas.filter(c => !c.orcamento_usd).reduce((sum, c) => sum + c.valor_vendas, 0);
  const totalVendasUsd = filteredCampanhas.filter(c => c.orcamento_usd).reduce((sum, c) => sum + c.valor_vendas, 0);

  const totalCliques = filteredCampanhas.reduce((sum, c) => sum + c.cliques, 0);
  const totalConversoes = filteredCampanhas.reduce((sum, c) => sum + c.conversoes, 0);
  
  const moedaSymbol = profile?.moeda || 'MT';

  // Average ROI/ROAS
  // Combined standard values for percentage calculation
  const overallGastoTotal = totalGastoLocal + (totalGastoUsd * 60); // approximate or direct relative ROAS
  const overallVendasTotal = totalVendasLocal + (totalVendasUsd * 60);
  const overallRoas = overallGastoTotal > 0 ? (overallVendasTotal / overallGastoTotal) : 0;
  
  const overallCpa = totalConversoes > 0 ? (totalGastoLocal / totalConversoes) : 0;
  const overallCpc = totalCliques > 0 ? (totalGastoLocal / totalCliques) : 0;

  // Render performance badge helper
  const getPerformanceBadge = (c: Campanha) => {
    const prod = produtos.find(p => p.id === c.produto_id);
    const custoProdutos = prod ? (c.conversoes * (prod.preco_compra || 0)) : 0;
    const res = c.valor_vendas - c.gasto - custoProdutos;
    const roas = c.gasto > 0 ? (c.valor_vendas / c.gasto) : 0;
    const unit = c.orcamento_usd ? '$' : moedaSymbol;
    const cpa = c.conversoes > 0 ? (c.gasto / c.conversoes) : 0;

    if (c.gasto === 0 && c.valor_vendas === 0) {
      return (
        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          Inativa
        </span>
      );
    }

    const threshold = c.gasto * 0.01;
    const isEmpatado = Math.abs(res) <= (c.gasto === 0 ? 0 : threshold);

    if (isEmpatado) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Empatado</span>
          </span>
          <span className="text-[9px] text-slate-400">ROAS: {roas.toFixed(2)}x</span>
        </div>
      );
    } else if (res > 0) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-black rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{prod ? 'Lucro Líq:' : 'Lucro:'} +{res.toLocaleString()} {unit}</span>
          </span>
          <span className="text-[9px] text-slate-400">
            ROAS: {roas.toFixed(2)}x {cpa > 0 ? `| CPA: ${cpa.toFixed(1)}${unit}` : ''}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Prejuízo: {Math.abs(res).toLocaleString()} {unit}</span>
          </span>
          <span className="text-[9px] text-slate-400">
            ROAS: {roas.toFixed(2)}x {cpa > 0 ? `| CPA: ${cpa.toFixed(1)}${unit}` : ''}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="campanhas_view_wrapper">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="campanhas_header">
        <div id="campanhas_header_text">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Campanhas de Anúncios</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Importa relatórios do Meta Ads em CSV, associa produtos e calcula o lucro real por campanha.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Header CSV upload input */}
          <input
            type="file"
            accept=".csv"
            id="header_csv_file_input"
            onChange={(e) => {
              handleCsvUpload(e);
              e.target.value = '';
            }}
            className="hidden"
          />
          <label
            htmlFor="header_csv_file_input"
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Importar ficheiro .csv exportado do Gestor de Anúncios do Meta/Facebook"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Importar CSV Meta</span>
          </label>

          <button
            onClick={handleExportCsv}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Exportar todas as campanhas e métricas para CSV"
          >
            <Download className="w-4 h-4 text-sky-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-black py-2.5 px-4 rounded-2xl shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            id="btn_add_campanha"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* CARDS OVERVIEW PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="campanhas_stats_grid">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2 relative overflow-hidden" id="card_orcamento">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Orçamento Total</span>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900 dark:text-slate-50">{totalOrcamentoLocal.toLocaleString()}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">{moedaSymbol}</span>
            </div>
            {totalOrcamentoUsd > 0 && (
              <div className="flex items-baseline space-x-1 text-sky-600 dark:text-sky-400">
                <span className="text-xs font-black">${totalOrcamentoUsd.toLocaleString()}</span>
                <span className="text-[9px] font-extrabold uppercase">USD</span>
              </div>
            )}
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 text-slate-900 dark:text-slate-50">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2 relative overflow-hidden" id="card_gasto">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Gasto Realizado</span>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900 dark:text-slate-50">{totalGastoLocal.toLocaleString()}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">{moedaSymbol}</span>
            </div>
            {totalGastoUsd > 0 && (
              <div className="flex items-baseline space-x-1 text-sky-600 dark:text-sky-400">
                <span className="text-xs font-black">${totalGastoUsd.toLocaleString()}</span>
                <span className="text-[9px] font-extrabold uppercase">USD</span>
              </div>
            )}
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 text-slate-900 dark:text-slate-50">
            <TrendingDown className="w-10 h-10 text-rose-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2 relative overflow-hidden" id="card_vendas">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">Retorno Vendas</span>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{totalVendasLocal.toLocaleString()}</span>
              <span className="text-[10px] font-extrabold text-emerald-500 uppercase">{moedaSymbol}</span>
            </div>
            {totalVendasUsd > 0 && (
              <div className="flex items-baseline space-x-1 text-sky-600 dark:text-sky-400">
                <span className="text-xs font-black">+${totalVendasUsd.toLocaleString()}</span>
                <span className="text-[9px] font-extrabold uppercase">USD</span>
              </div>
            )}
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 text-slate-900 dark:text-slate-50">
            <TrendingUp className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2 relative overflow-hidden" id="card_roas">
          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block">ROAS Geral</span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-lg font-black ${overallRoas >= 2.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-50'}`}>
              {overallRoas.toFixed(2)}x
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">
            CPA Médio: {overallCpa.toFixed(1)} {moedaSymbol}
            {totalGastoUsd > 0 && ` | $${(totalConversoes > 0 ? totalGastoUsd / totalConversoes : 0).toFixed(1)} USD`}
          </p>
          <div className="absolute right-3 bottom-3 opacity-10 text-slate-900 dark:text-slate-50">
            <Percent className="w-10 h-10 text-sky-500" />
          </div>
        </div>
      </div>

      {/* FILTER & INSTRUCTION ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800" id="filter_panel">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400" id="filter_left">
          <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
          <span className="text-xs">Usa estas métricas para otimizar os canais de tráfego pago no fim do dia!</span>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto" id="filter_right">
          <span className="text-xs text-slate-400 shrink-0">Plataforma:</span>
          <select
            value={filterPlataforma}
            onChange={(e) => setFilterPlataforma(e.target.value)}
            className="w-full sm:w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value="todas">Todas</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Instagram Ads">Instagram Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* CAMPAIGNS LIST / TABLE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden" id="campanhas_list_card">
        {filteredCampanhas.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3" id="empty_campanhas">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <Megaphone className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhuma campanha registada</p>
              <p className="text-xs text-slate-400">Regista a tua primeira campanha de marketing para começar a medir a performance de retorno.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors px-4 py-2 rounded-xl text-xs font-bold"
            >
              Criar Campanha
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto" id="campanhas_table_scroll">
            <table className="w-full min-w-[800px] text-left border-collapse" id="campanhas_table">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Campanha & Produto</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Plataforma</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Orçamento / Gasto</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Retorno Vendas & Custos</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Cliques / Conversões</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Performance Líquida</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCampanhas.map((campanha) => {
                  const prod = produtos.find(p => p.id === campanha.produto_id);
                  const roas = campanha.gasto > 0 ? (campanha.valor_vendas / campanha.gasto) : 0;
                  const cpc = campanha.cliques > 0 ? (campanha.gasto / campanha.cliques) : 0;
                  const cpa = campanha.conversoes > 0 ? (campanha.gasto / campanha.conversoes) : 0;
                  const convRate = campanha.cliques > 0 ? (campanha.conversoes / campanha.cliques * 100) : 0;
                  const custoTotalProd = prod ? (campanha.conversoes * (prod.preco_compra || 0)) : 0;

                  return (
                    <tr key={campanha.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Name & Date & Product */}
                      <td className="p-4">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-50">{campanha.nome}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-700/50">
                            {campanha.objetivo === 'vendas' ? '🛒 Vendas' :
                             campanha.objetivo === 'trafego' ? '🚦 Tráfego' :
                             campanha.objetivo === 'reconhecimento' ? '📢 Reconhecimento' :
                             '💬 Mensagens'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{campanha.data}</span>
                          </span>
                        </div>

                        {campanha.produto_nome && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-black text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                              <Package className="w-3 h-3 text-emerald-600" />
                              <span>{campanha.produto_nome}</span>
                            </span>
                            {prod && (
                              <span className="text-[9px] text-slate-400">
                                Custo: {prod.preco_compra} {moedaSymbol} | Venda: {prod.preco_venda} {moedaSymbol}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      
                      {/* Platform */}
                      <td className="p-4 text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {campanha.plataforma}
                        </span>
                      </td>

                      {/* Budget vs Spent */}
                      <td className="p-4 text-right">
                        <div className="font-black text-xs text-slate-900 dark:text-slate-50">
                          {campanha.gasto.toLocaleString()} {campanha.orcamento_usd ? '$' : moedaSymbol}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Orc: {campanha.orcamento.toLocaleString()} {campanha.orcamento_usd ? '$' : moedaSymbol}
                        </div>
                        {campanha.orcamento_maximo ? (
                          <div className="w-full mt-2" id={`progress_container_${campanha.id}`}>
                            <div className="flex justify-between items-center text-[8px] mb-0.5">
                              <span className="text-slate-400">Limite:</span>
                              <span className={`font-black ${campanha.gasto >= campanha.orcamento_maximo ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                                {((campanha.gasto / campanha.orcamento_maximo) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  campanha.gasto >= campanha.orcamento_maximo 
                                    ? 'bg-rose-500' 
                                    : (campanha.gasto >= campanha.orcamento_maximo * 0.9) 
                                      ? 'bg-amber-500' 
                                      : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (campanha.gasto / campanha.orcamento_maximo) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : null}
                      </td>
 
                      {/* Retorno Vendas & Custo de Produto */}
                      <td className="p-4 text-right">
                        <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                          +{campanha.valor_vendas.toLocaleString()} {campanha.orcamento_usd ? '$' : moedaSymbol}
                        </div>
                        {prod && custoTotalProd > 0 && (
                          <div className="text-[9px] text-rose-500 font-bold mt-0.5" title="Custo total dos produtos vendidos">
                            Custo Prod: -{custoTotalProd.toLocaleString()} {moedaSymbol}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ROAS: <span className="font-bold text-slate-600 dark:text-slate-300">{roas.toFixed(2)}x</span>
                        </div>
                      </td>
 
                      {/* Cliques & Conversoes */}
                      <td className="p-4 text-center">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {campanha.cliques} Cliques
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {campanha.conversoes} Conversões ({convRate.toFixed(1)}%)
                        </div>
                        {prod && cpa > 0 && (
                          <div className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                            CPA: {cpa.toFixed(1)} {moedaSymbol}
                          </div>
                        )}
                      </td>
 
                      {/* Performance Status */}
                      <td className="p-4 text-center">
                        {getPerformanceBadge(campanha)}
                      </td>
 
                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCampanhaForMetrics(campanha);
                              setIsMetricsModalOpen(true);
                              setMData(new Date().toISOString().split('T')[0]);
                              setMGasto('');
                              setMCliques('');
                              setMImpressoes('');
                              setMConversoes('');
                              setMValorVendas('');
                              setMObservacao('');
                            }}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Métricas Diárias"
                            id={`btn_metrics_${campanha.id}`}
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(campanha)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(campanha.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* PERFORMANCE INSIGHTS FOR END OF THE DAY */}
      {filteredCampanhas.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-500/5 to-sky-500/5 dark:from-emerald-950/20 dark:to-sky-950/20 border border-emerald-100/40 dark:border-emerald-900/40 p-5 rounded-3xl space-y-4" id="insights_panel">
          <div className="flex items-center space-x-2 text-slate-950 dark:text-slate-50 font-display font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Resumo de Performance para o Fim do Dia</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="insights_grid">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Custo Por Clique (CPC)</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {overallCpc.toFixed(2)} {moedaSymbol}
              </span>
              <span className="text-[9px] text-slate-400">Total de cliques pagos: {totalCliques}</span>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Custo Por Aquisição (CPA)</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {overallCpa.toFixed(2)} {moedaSymbol}
              </span>
              <span className="text-[9px] text-slate-400">Conversões registadas: {totalConversoes}</span>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Eficiência das Campanhas</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {totalCliques > 0 ? ((totalConversoes / totalCliques) * 100).toFixed(1) : '0.0'}% de taxa
              </span>
              <span className="text-[9px] text-slate-400">Conversões a partir de cliques</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="campanha_modal_container">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto" id="campanha_modal">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
              id="btn_close_campanha_modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-4" id="modal_title">
              {editingCampanha ? 'Editar Campanha' : 'Criar Nova Campanha'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4" id="campanha_form">
              {/* Nome */}
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Brincos Ouro - Verão"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Objetivo da Campanha */}
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Objetivo da Campanha</label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="mensagens">💬 Mensagens (WhatsApp)</option>
                  <option value="vendas">🛒 Vendas/Conversões</option>
                  <option value="trafego">🚦 Tráfego</option>
                  <option value="reconhecimento">📢 Reconhecimento/Alcance</option>
                </select>
              </div>

              {/* Produto Associado */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                    <span>Produto Promovido (Custo & Margem)</span>
                  </label>
                  {produtoId && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Vinculado</span>
                    </span>
                  )}
                </div>

                <select
                  value={produtoId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setProdutoId(selectedId);
                    const prod = produtos.find(p => p.id === selectedId);
                    setProdutoNome(prod ? prod.nome : '');
                    // Auto-fill sales revenue if conversions exist and sales value is empty
                    const convNum = Number(conversoes) || Number(compras) || 0;
                    if (prod && convNum > 0 && (!valorVendas || Number(valorVendas) === 0)) {
                      setValorVendas((convNum * prod.preco_venda).toString());
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Selecione o produto promovido nesta campanha...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — Venda: {p.preco_venda.toLocaleString()} {moedaSymbol} | Custo: {p.preco_compra.toLocaleString()} {moedaSymbol} (Margem: {p.margem.toLocaleString()} {moedaSymbol})
                    </option>
                  ))}
                </select>

                {produtoId && (() => {
                  const prod = produtos.find(p => p.id === produtoId);
                  if (!prod) return null;
                  const precoVenda = prod.preco_venda;
                  const custoProduto = prod.preco_compra || 0;
                  const margemBruta = precoVenda - custoProduto;
                  const gastoNum = Number(gasto) || 0;
                  const convNum = Number(conversoes) || Number(compras) || 0;
                  const cpaCalculado = convNum > 0 ? (gastoNum / convNum) : 0;
                  const margemLiquidaUnit = margemBruta - cpaCalculado;

                  return (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2 text-[11px]">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 uppercase block font-semibold">Venda</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{precoVenda.toLocaleString()} {moedaSymbol}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 uppercase block font-semibold">Custo Prod.</span>
                          <span className="font-bold text-rose-500">{custoProduto.toLocaleString()} {moedaSymbol}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 uppercase block font-semibold">Margem Bruta</span>
                          <span className="font-bold text-emerald-600">+{margemBruta.toLocaleString()} {moedaSymbol}</span>
                        </div>
                      </div>

                      {convNum > 0 && gastoNum > 0 && (
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          margemLiquidaUnit > 0 
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                        }`}>
                          <div>
                            <span className="font-bold block">CPA: {cpaCalculado.toFixed(1)} {moedaSymbol}</span>
                            <span className="text-[9px] opacity-80">Teto viável: {margemBruta.toLocaleString()} {moedaSymbol}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs block">
                              {margemLiquidaUnit > 0 ? `+${margemLiquidaUnit.toFixed(1)}` : margemLiquidaUnit.toFixed(1)} {moedaSymbol}
                            </span>
                            <span className="text-[9px] block">
                              {margemLiquidaUnit > 0 ? 'Lucro Líq / Venda' : 'Prejuízo / Venda'}
                            </span>
                          </div>
                        </div>
                      )}

                      {convNum > 0 && (!valorVendas || Number(valorVendas) === 0) && (
                        <button
                          type="button"
                          onClick={() => setValorVendas((convNum * precoVenda).toString())}
                          className="w-full text-center py-1.5 px-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Calcular Faturamento ({convNum} vendas × {precoVenda.toLocaleString()} {moedaSymbol} = {(convNum * precoVenda).toLocaleString()} {moedaSymbol})
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* CSV Import Area */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Importar CSV Meta Ads</label>
                  <span className="text-[9px] text-slate-400">Leitura automática de métricas</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv_file_input"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="csv_file_input"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2 px-3 rounded-xl shadow-sm text-center cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Selecionar Ficheiro .csv</span>
                  </label>
                  
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Taxa (USD->MT)"
                      title="Taxa de câmbio para converter USD para a moeda local"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-[10px] font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Plataforma */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Plataforma</label>
                  <select
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Instagram Ads">Instagram Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={dataCampanha}
                    onChange={(e) => setDataCampanha(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Currency Configuration */}
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="orcamento_usd_checkbox"
                  checked={orcamentoUsd}
                  onChange={(e) => setOrcamentoUsd(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-white border-slate-300"
                />
                <label htmlFor="orcamento_usd_checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-sky-500" />
                  <span>Definir orçamento em Dólar (USD $)</span>
                </label>
              </div>

              {/* Orcamento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Orçamento ({orcamentoUsd ? '$' : moedaSymbol})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    min="0"
                    step="any"
                    value={orcamento}
                    onChange={(e) => setOrcamento(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Orçamento Máximo ({orcamentoUsd ? '$' : moedaSymbol})</label>
                  <input
                    type="number"
                    placeholder="Sem limite"
                    min="0"
                    step="any"
                    value={orcamentoMaximo}
                    onChange={(e) => setOrcamentoMaximo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Warning if has daily metrics */}
              {editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl text-[10px] text-amber-800 dark:text-amber-300">
                  <p className="font-extrabold uppercase">Métricas Diárias Ativas</p>
                  <p className="mt-0.5">Os campos de Valor Gasto, Cliques, Conversões e Vendas foram bloqueados pois são calculados automaticamente a partir do histórico diário da campanha.</p>
                </div>
              ) : null}

              {/* Gasto */}
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Valor Gasto ({orcamentoUsd ? '$' : moedaSymbol})</label>
                <input
                  type="number"
                  required={!(editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0)}
                  disabled={editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0}
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={gasto}
                  onChange={(e) => setGasto(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${(editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Dynamic Metrics Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Métricas por Objetivo ({objetivo.toUpperCase()})</span>
              </div>

              {objetivo === 'mensagens' && (
                <div className="grid grid-cols-2 gap-3" id="mensagens_metrics_group">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Conversas Iniciadas</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={conversasIniciadas}
                      onChange={(e) => setConversasIniciadas(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Custo por Conversa ({orcamentoUsd ? '$' : moedaSymbol})</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={custoPorConversa}
                      onChange={(e) => setCustoPorConversa(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Alcance</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={alcance}
                      onChange={(e) => setAlcance(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Impressões</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={impressoes}
                      onChange={(e) => setImpressoes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CPM</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={cpm}
                      onChange={(e) => setCpm(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Frequência</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={frequencia}
                      onChange={(e) => setFrequencia(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {objetivo === 'vendas' && (
                <div className="grid grid-cols-2 gap-3" id="vendas_metrics_group">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Compras</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={compras}
                      onChange={(e) => setCompras(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Custo por Compra ({orcamentoUsd ? '$' : moedaSymbol})</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={custoPorCompra}
                      onChange={(e) => setCustoPorCompra(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Cliques na Ligação</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={cliquesNaLigacao}
                      onChange={(e) => setCliquesNaLigacao(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CTR (%)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={ctr}
                      onChange={(e) => setCtr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CPC ({orcamentoUsd ? '$' : moedaSymbol})</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={cpc}
                      onChange={(e) => setCpc(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Views Pág. Destino</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={visualizacoesPaginaDestino}
                      onChange={(e) => setVisualizacoesPaginaDestino(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {objetivo === 'trafego' && (
                <div className="grid grid-cols-2 gap-3" id="trafego_metrics_group">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Cliques (Todos)</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={cliquesTodos}
                      onChange={(e) => setCliquesTodos(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CTR Tudo (%)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={ctrTudo}
                      onChange={(e) => setCtrTudo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CPC Tudo ({orcamentoUsd ? '$' : moedaSymbol})</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={cpcTudo}
                      onChange={(e) => setCpcTudo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Views Pág. Destino</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={visualizacoesPaginaDestino}
                      onChange={(e) => setVisualizacoesPaginaDestino(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {objetivo === 'reconhecimento' && (
                <div className="grid grid-cols-2 gap-3" id="reconhecimento_metrics_group">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Alcance</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={alcance}
                      onChange={(e) => setAlcance(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Impressões</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={impressoes}
                      onChange={(e) => setImpressoes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">CPM</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={cpm}
                      onChange={(e) => setCpm(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Frequência</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={frequencia}
                      onChange={(e) => setFrequencia(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Valor Vendas */}
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Valor Total de Vendas Gerado ({orcamentoUsd ? '$' : moedaSymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  disabled={editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0}
                  placeholder="0.00"
                  value={valorVendas}
                  onChange={(e) => setValorVendas(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${(editingCampanha && editingCampanha.metricas_diarias && editingCampanha.metricas_diarias.length > 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <p className="text-[9px] text-slate-400 mt-1">Gasto vs Valor de Vendas calculará automaticamente o ROAS no final do dia.</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-xs font-extrabold transition-colors shadow-md shadow-emerald-600/15 cursor-pointer"
                >
                  {editingCampanha ? 'Salvar Alterações' : 'Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DAILY METRICS MODAL */}
      {isMetricsModalOpen && selectedCampanhaForMetrics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="metrics_modal_container">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" id="metrics_modal">
            <button
              onClick={() => {
                setIsMetricsModalOpen(false);
                setSelectedCampanhaForMetrics(null);
              }}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
              id="btn_close_metrics_modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <span>Métricas Diárias: {selectedCampanhaForMetrics.nome}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Moeda da campanha: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedCampanhaForMetrics.orcamento_usd ? 'USD ($)' : moedaSymbol}</span>
                {selectedCampanhaForMetrics.orcamento_maximo ? (
                  <span> | Limite de Orçamento Máximo: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedCampanhaForMetrics.orcamento_maximo.toLocaleString()} {selectedCampanhaForMetrics.orcamento_usd ? 'USD' : moedaSymbol}</span></span>
                ) : (
                  <span> | Sem Limite de Orçamento Máximo</span>
                )}
              </p>
            </div>

            {/* Warning if over budget */}
            {selectedCampanhaForMetrics.orcamento_maximo && selectedCampanhaForMetrics.gasto >= selectedCampanhaForMetrics.orcamento_maximo && (
              <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-start space-x-3 text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Aviso: Orçamento Esgotado!</p>
                  <p className="text-[11px] mt-0.5">O gasto total desta campanha ({selectedCampanhaForMetrics.gasto.toLocaleString()} {selectedCampanhaForMetrics.orcamento_usd ? 'USD' : moedaSymbol}) atingiu ou superou o orçamento máximo definido ({selectedCampanhaForMetrics.orcamento_maximo.toLocaleString()} {selectedCampanhaForMetrics.orcamento_usd ? 'USD' : moedaSymbol}). Recomenda-se pausar os anúncios na plataforma.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Middle: Metrics List */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Histórico de Registros</h4>
                
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {!selectedCampanhaForMetrics.metricas_diarias || selectedCampanhaForMetrics.metricas_diarias.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Nenhum registro diário encontrado. Adicione o primeiro registro usando o formulário ao lado.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400">
                            <th className="p-3">Data</th>
                            <th className="p-3 text-right">Gasto</th>
                            <th className="p-3 text-center">Cliques/Conv.</th>
                            <th className="p-3 text-right">Vendas</th>
                            <th className="p-3 text-center">ROAS</th>
                            <th className="p-3 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedCampanhaForMetrics.metricas_diarias.map((metric) => {
                            const mRoas = metric.gasto > 0 ? metric.valor_vendas / metric.gasto : 0;
                            return (
                              <tr key={metric.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20">
                                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                  {metric.data}
                                  {metric.observacao && (
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{metric.observacao}</div>
                                  )}
                                </td>
                                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-50">
                                  {metric.gasto.toLocaleString()} {selectedCampanhaForMetrics.orcamento_usd ? 'USD' : moedaSymbol}
                                </td>
                                <td className="p-3 text-center">
                                  <div>{metric.cliques} clq</div>
                                  <div className="text-[10px] text-slate-400">{metric.conversoes} conv</div>
                                </td>
                                <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                  {metric.valor_vendas.toLocaleString()} {selectedCampanhaForMetrics.orcamento_usd ? 'USD' : moedaSymbol}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    mRoas >= 2.0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 
                                    mRoas >= 1.0 ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                                  }`}>
                                    {mRoas.toFixed(2)}x
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteMetricaDiaria(metric.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                    title="Excluir Métrica"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Add Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-display">Registrar Nova Métrica</h4>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegisterMetricaDiaria();
                  }}
                  className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={mData}
                      onChange={(e) => setMData(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Gasto ({selectedCampanhaForMetrics.orcamento_usd ? '$' : moedaSymbol})</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={mGasto}
                        onChange={(e) => setMGasto(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Vendas ({selectedCampanhaForMetrics.orcamento_usd ? '$' : moedaSymbol})</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={mValorVendas}
                        onChange={(e) => setMValorVendas(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Cliques</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={mCliques}
                        onChange={(e) => setMCliques(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Imp.</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={mImpressoes}
                        onChange={(e) => setMImpressoes(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Conv.</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={mConversoes}
                        onChange={(e) => setMConversoes(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Observações</label>
                    <input
                      type="text"
                      placeholder="Ex: Novo criativo, escala, etc"
                      value={mObservacao}
                      onChange={(e) => setMObservacao(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Registrar Registro Diário
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsMetricsModalOpen(false);
                  setSelectedCampanhaForMetrics(null);
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLE CAMPAIGNS CSV SELECTION OVERLAY */}
      {showCsvSelection && csvCampaignsList.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fade-in" id="csv_selector_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-3">
              Múltiplas campanhas encontradas no CSV
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Selecione qual a campanha que deseja importar para este formulário:
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {csvCampaignsList.map((row, idx) => {
                const name = row['Nome da campanha'] || row['Campaign name'] || `Linha ${idx + 1}`;
                const spend = row['Montante gasto (USD)'] || row['Valor gasto (USD)'] || row['Montante gasto'] || '0';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => importCsvRow(row)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[250px]">{name}</span>
                    <span className="text-[10px] font-mono text-emerald-600 shrink-0">Gasto: {spend}</span>
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => {
                setShowCsvSelection(false);
                setCsvCampaignsList([]);
              }}
              className="mt-4 w-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Campaign Deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingCampanhaId}
        title="Eliminar Campanha de Anúncios"
        description="Tem certeza que deseja eliminar esta campanha de anúncios e todas as suas métricas registradas?"
        onConfirm={async () => {
          if (deletingCampanhaId) {
            await deleteCampanha(deletingCampanhaId);
            setDeletingCampanhaId(null);
          }
        }}
        onClose={() => setDeletingCampanhaId(null)}
      />

      {/* Confirmation Modal for Daily Metric Deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingMetricaId}
        title="Eliminar Registro Diário de Métrica"
        description="Tem certeza que deseja excluir este registro diário de métrica?"
        onConfirm={confirmDeleteMetricaDiaria}
        onClose={() => setDeletingMetricaId(null)}
      />

    </div>
  );
}
