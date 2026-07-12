/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { auth } from '../lib/firebase.ts';
import { 
  Settings, 
  User, 
  Percent, 
  Crown, 
  LogOut, 
  Check, 
  Sparkles, 
  Coins, 
  ShieldAlert,
  Megaphone,
  TrendingUp,
  AlertCircle,
  Database,
  Download,
  FileSpreadsheet,
  Mail,
  Shield,
  Calendar,
  Key,
  Sun,
  Moon
} from 'lucide-react';

export default function DefinicoesView() {
  const { 
    profile, 
    updateProfile, 
    triggerMockUpgrade, 
    logout,
    caixinhas,
    vendas,
    despesas,
    produtos,
    fornecedores,
    zonasEntrega
  } = useApp();

  // Profile forms
  const [nome, setNome] = useState(profile?.nome || '');
  const [pais, setPais] = useState(profile?.pais || 'Moçambique');
  const [moeda, setMoeda] = useState(profile?.moeda || 'MT');

  // Appearance (Theme state)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dropflow_theme') as 'light' | 'dark') || 'light';
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('dropflow_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Distribution sliders and inputs
  const [anunciosPercent, setAnunciosPercent] = useState<number>(profile?.anuncios_percent || 50);
  const [anunciosInput, setAnunciosInput] = useState<string>((profile?.anuncios_percent ?? 50).toString());
  const [lucroInput, setLucroInput] = useState<string>((profile?.lucro_percent ?? 50).toString());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savePercentLoading, setSavePercentLoading] = useState<boolean>(false);

  // Sync inputs with profile changes
  useEffect(() => {
    if (profile) {
      setAnunciosInput((profile.anuncios_percent ?? 50).toString());
      setLucroInput((profile.lucro_percent ?? 50).toString());
      setAnunciosPercent(profile.anuncios_percent ?? 50);
      setNome(profile.nome || '');
      setPais(profile.pais || 'Moçambique');
      setMoeda(profile.moeda || 'MT');
    }
  }, [profile]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        nome,
        pais,
        moeda
      });
      alert('Perfil comercial atualizado com sucesso!');
    } catch (e) {
      alert('Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSliderChange = (val: number) => {
    setAnunciosPercent(val);
    setAnunciosInput(val.toString());
    setLucroInput((100 - val).toString());
  };

  const handlePresetClick = (adsVal: number) => {
    setAnunciosPercent(adsVal);
    setAnunciosInput(adsVal.toString());
    setLucroInput((100 - adsVal).toString());
  };

  const handleSaveDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const ads = parseInt(anunciosInput) || 0;
    const profit = parseInt(lucroInput) || 0;

    if (ads + profit !== 100) {
      alert('A soma das percentagens deve ser exatamente 100%!');
      return;
    }

    setSavePercentLoading(true);
    try {
      await updateProfile({
        anuncios_percent: ads,
        lucro_percent: profit
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Error saving distribution percentages:', e);
      alert('Erro ao guardar a configuração de distribuição.');
    } finally {
      setSavePercentLoading(false);
    }
  };

  // Dynamic exports
  const handleExportBackupJSON = () => {
    try {
      const backupData = {
        versao_backup: '1.0',
        exportado_em: new Date().toISOString(),
        usuario: {
          uid: auth.currentUser?.uid || 'offline',
          email: auth.currentUser?.email || 'N/A',
          nome_comercial: profile?.nome || 'DropFlow User',
        },
        profile,
        caixinhas,
        produtos,
        fornecedores,
        zonasEntrega,
        vendas,
        despesas
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute(
        "download", 
        `dropflow_backup_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar backup JSON.');
    }
  };

  const handleExportVendasCSV = () => {
    try {
      const headers = ['ID Venda', 'Data Venda', 'Produto', 'Preço Unitário', 'Fornecedor', 'Zona Entrega', 'Valor Recebido', 'Forma Pagamento', 'Data Criação'];
      const rows = vendas.map(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        const prodNome = prod ? prod.nome : 'Produto Customizado';
        const prodPreco = prod ? prod.preco_venda : v.valor_recebido;
        const forn = fornecedores.find(f => f.id === v.fornecedor_id)?.nome || 'Sem Fornecedor';
        const zona = zonasEntrega.find(z => z.id === v.zona_entrega_id)?.nome_zona || 'Sem Entrega';
        return [
          v.id,
          v.data_venda,
          `"${prodNome.replace(/"/g, '""')}"`,
          prodPreco,
          `"${forn.replace(/"/g, '""')}"`,
          `"${zona.replace(/"/g, '""')}"`,
          v.valor_recebido,
          v.forma_pagamento,
          v.criado_em || ''
        ];
      });

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `dropflow_vendas_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar vendas para CSV.');
    }
  };

  const handleExportDespesasCSV = () => {
    try {
      const headers = ['ID Despesa', 'Data Despesa', 'Categoria', 'Origem Caixinha', 'Descrição', 'Valor', 'Data Criação'];
      const rows = despesas.map(d => {
        const cx = caixinhas.find(c => c.id === d.caixinha_id)?.nome || 'Despesa Geral';
        return [
          d.id,
          d.data,
          `"${d.categoria.replace(/"/g, '""')}"`,
          `"${cx.replace(/"/g, '""')}"`,
          `"${(d.descricao || '').replace(/"/g, '""')}"`,
          d.valor,
          d.criado_em || ''
        ];
      });

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `dropflow_despesas_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar despesas para CSV.');
    }
  };

  const handleExportTodasTransacoesCSV = () => {
    try {
      const headers = ['ID Transacao', 'Data', 'Tipo', 'Descricao / Detalhes', 'Valor', 'Origem / Destino', 'Data Criacao'];
      
      const rowsVendas = vendas.map(v => {
        const prod = produtos.find(p => p.id === v.produto_id);
        const prodNome = prod ? prod.nome : 'Produto Customizado';
        const forn = fornecedores.find(f => f.id === v.fornecedor_id)?.nome || 'Sem Fornecedor';
        const desc = `Venda: ${prodNome} (Fornecedor: ${forn})`;
        const pag = v.forma_pagamento || 'N/A';
        return {
          id: v.id,
          data: v.data_venda,
          tipo: 'Venda (Entrada)',
          desc: desc,
          valor: v.valor_recebido,
          origem: pag,
          criado_em: v.criado_em || ''
        };
      });

      const rowsDespesas = despesas.map(d => {
        const cx = caixinhas.find(c => c.id === d.caixinha_id)?.nome || 'Despesa Geral';
        const desc = `Despesa: [${d.categoria}] ${d.descricao || ''}`.trim();
        return {
          id: d.id,
          data: d.data,
          tipo: 'Despesa (Saida)',
          desc: desc,
          valor: -d.valor, // represented as negative outflow
          origem: cx,
          criado_em: d.criado_em || ''
        };
      });

      // Combine and sort chronologically (newest first)
      const todas = [...rowsVendas, ...rowsDespesas].sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      const csvRows = todas.map(t => [
        t.id,
        t.data,
        `"${t.tipo}"`,
        `"${t.desc.replace(/"/g, '""')}"`,
        t.valor,
        `"${t.origem.replace(/"/g, '""')}"`,
        t.criado_em
      ]);

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Excel BOM
      csvContent += [headers.join(';'), ...csvRows.map(r => r.join(';'))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute(
        "download", 
        `dropflow_todas_transacoes_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Erro ao exportar transações completas para CSV.');
    }
  };

  const adsNum = parseInt(anunciosInput) || 0;
  const profitNum = parseInt(lucroInput) || 0;
  const sum = adsNum + profitNum;
  const isSumValid = sum === 100;

  const handleProUpgrade = async () => {
    try {
      await triggerMockUpgrade();
      setShowUpgradeSuccess(true);
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    } catch (e) {
      alert('Erro no upgrade.');
    }
  };

  // Formatting utility
  const formatIsoDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="definicoes_view">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 font-display">Configurações e Conta</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Gere as tuas preferências, exporta dados e vê a tua conta</p>
      </div>

      {/* 0. Ver Conta (Account Information Panel) */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_ver_conta_panel">
        <div className="flex items-center justify-between" id="account_header">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
            <User className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> A Minha Conta
          </h3>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
            profile?.plano === 'pro' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50' 
              : 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50'
          }`}>
            Plano: {profile?.plano === 'pro' ? 'DropFlow Pro' : 'Gratuito (Teste)'}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-3" id="account_details_box">
          <div className="flex items-center space-x-3" id="account_user_intro">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-sm" id="user_avatar">
              {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : 'DF'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.nome || 'Usuário DropFlow'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {currentUser?.email || 'Acesso Local / Convidado'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 grid grid-cols-2 gap-3 text-[10px]" id="account_meta_info">
            <div className="space-y-1" id="account_meta_id">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">ID de Conta</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono block truncate" title={currentUser?.uid}>
                {currentUser?.uid || 'offline_dev'}
              </span>
            </div>
            <div className="space-y-1" id="account_meta_created">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">Membro Desde</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold block">
                {formatIsoDate(profile?.criado_em)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Profile Panel */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_perfil_panel">
        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
          <Settings className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Perfil Comercial
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3.5" id="profile_form">
          <div className="space-y-1" id="field_def_nome">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nome Comercial / Loja</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3" id="field_def_grid">
            <div className="space-y-1" id="field_def_pais">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">País</label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Moçambique">Moçambique</option>
                <option value="África do Sul">África do Sul</option>
                <option value="Portugal">Portugal</option>
                <option value="Angola">Angola</option>
                <option value="Brasil">Brasil</option>
              </select>
            </div>
            <div className="space-y-1" id="field_def_moeda">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Moeda Padrão</label>
              <select
                value={moeda}
                onChange={(e) => setMoeda(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="MT">MT (Meticais)</option>
                <option value="ZAR">ZAR (Rands)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
          </div>

          <button
            id="btn_save_profile"
            type="submit"
            disabled={savingProfile}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors border border-slate-900 dark:border-slate-100 shadow-sm cursor-pointer"
          >
            {savingProfile ? 'A guardar...' : 'Guardar Alterações do Perfil'}
          </button>
        </form>
      </div>

      {/* 1.5. Appearance/Aparência (Dark Mode) Panel */}
      <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_aparencia_panel">
        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center font-display">
          <Moon className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" /> Tema e Aparência
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Escolha a sua preferência visual. O modo escuro é ideal para utilizadores avançados que trabalham até tarde, reduzindo o cansaço visual e otimizando o consumo de bateria.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1" id="theme_selection_grid">
          {/* Light Theme Option */}
          <button
            id="btn_theme_light"
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/80 dark:text-emerald-400'
                : 'bg-slate-50/50 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Modo Claro</span>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
          </button>

          {/* Dark Theme Option */}
          <button
            id="btn_theme_dark"
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/80 dark:text-emerald-400'
                : 'bg-slate-50/50 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Modo Escuro</span>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* 2. Remainder Auto-Distribution Rules */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_distribuicao_panel">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center font-display">
            <Percent className="w-4 h-4 mr-1.5 text-sky-600" /> Distribuição de Margem Líquida
          </h3>
          <span className="text-[10px] bg-slate-50 border border-slate-200/60 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">
            Sobra das Vendas
          </span>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          Edite manualmente as percentagens de distribuição automática para cada caixinha ou use os botões rápidos. O valor de fornecedor e entrega sempre é resgatado antes da divisão.
        </p>

        <form onSubmit={handleSaveDistribution} className="space-y-4 pt-1" id="distribution_manual_form">
          <div className="grid grid-cols-2 gap-3.5" id="manual_percent_inputs_grid">
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-200/50 space-y-1.5" id="input_box_anuncios">
              <div className="flex items-center space-x-1.5">
                <Megaphone className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[10px] font-black text-slate-600">📢 Anúncios</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={anunciosInput}
                  onChange={(e) => setAnunciosInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-200/50 space-y-1.5" id="input_box_lucro">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-600">💰 Lucro</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lucroInput}
                  onChange={(e) => setLucroInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1" id="field_percent_calibrator">
            <input
              id="slider_anuncios_range"
              type="range"
              min="0"
              max="100"
              step="5"
              value={isSumValid ? adsNum : anunciosPercent}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-2" id="presets_buttons">
            <button
              id="btn_preset_50"
              type="button"
              onClick={() => handlePresetClick(50)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 50) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900'}`}
            >
              50/50
            </button>
            <button
              id="btn_preset_40"
              type="button"
              onClick={() => handlePresetClick(40)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 40) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900'}`}
            >
              40% Ads / 60% Lucro
            </button>
            <button
              id="btn_preset_70"
              type="button"
              onClick={() => handlePresetClick(70)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${(isSumValid && adsNum === 70) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:text-slate-900'}`}
            >
              70% Ads / 30% Lucro
            </button>
          </div>

          <div className="pt-1.5 space-y-3" id="validation_section">
            {!isSumValid ? (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-start space-x-2 text-[11px] text-rose-700 font-medium" id="validation_alert_invalid">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5] text-rose-600" />
                <div className="space-y-1">
                  <p>A soma atual é <strong className="font-extrabold">{sum}%</strong>. Os valores devem totalizar exatamente 100%.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const ads = Math.min(100, Math.max(0, parseInt(anunciosInput) || 0));
                      setLucroInput((100 - ads).toString());
                    }}
                    className="text-[10px] text-rose-800 font-bold underline hover:no-underline flex items-center"
                  >
                    💡 Equilibrar automaticamente
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-2xl flex items-center space-x-2 text-[10px] text-emerald-700 font-bold" id="validation_alert_valid">
                <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Soma perfeita de 100%! Prontos para salvar.</span>
              </div>
            )}

            {saveSuccess && (
              <div className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-2 animate-fade-in" id="save_percent_success_toast">
                <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Percentagens guardadas localmente!</span>
              </div>
            )}

            <button
              id="btn_save_distribution"
              type="submit"
              disabled={!isSumValid || savePercentLoading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-2 ${isSumValid ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-sm cursor-pointer' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
            >
              <span>{savePercentLoading ? 'A guardar...' : 'Guardar Percentagens'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* NEW: Exportar Dados (Backups Section) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm" id="definicoes_export_panel">
        <h3 className="font-bold text-xs text-slate-900 flex items-center font-display">
          <Database className="w-4 h-4 mr-1.5 text-emerald-600" /> Exportar Dados e Backups
        </h3>
        
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          Garante que tens o controlo total sobre os teus dados. Descarrega relatórios de fluxos separados ou do total de transações compatíveis com o Excel, ou efetua um backup de segurança completo de toda a atividade do DropFlow.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2" id="export_actions_grid">
          {/* JSON Full Backup */}
          <button
            id="btn_export_json_backup"
            type="button"
            onClick={handleExportBackupJSON}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <Download className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Backup Completo (JSON)</span>
              <span className="text-[9px] text-slate-400 block">Perfil, Produtos, Vendas e Caixinhas</span>
            </div>
          </button>

          {/* Vendas CSV */}
          <button
            id="btn_export_vendas_csv"
            type="button"
            onClick={handleExportVendasCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-200 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Vendas (CSV)</span>
              <span className="text-[9px] text-slate-400 block">Relatório completo para o Excel</span>
            </div>
          </button>

          {/* Despesas CSV */}
          <button
            id="btn_export_despesas_csv"
            type="button"
            onClick={handleExportDespesasCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Despesas (CSV)</span>
              <span className="text-[9px] text-slate-400 block">Registo de saídas e despesas</span>
            </div>
          </button>

          {/* Total Transactions CSV */}
          <button
            id="btn_export_todas_transacoes_csv"
            type="button"
            onClick={handleExportTodasTransacoesCSV}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-sky-50 border border-slate-200/60 hover:border-sky-200 rounded-2xl transition-all text-center space-y-2 group cursor-pointer"
          >
            <Coins className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Fluxo de Caixa (CSV)</span>
              <span className="text-[9px] text-slate-400 block">Todas as transações combinadas</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Subscription Management (DropFlow Pro) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-sm" id="definicoes_billing_panel">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"></div>

        <div className="flex justify-between items-center" id="billing_header">
          <h3 className="font-bold text-xs text-slate-900 flex items-center font-display">
            <Crown className="w-4 h-4 mr-1.5 text-purple-600" /> Plano DropFlow Pro
          </h3>
          <span className="text-[9px] bg-slate-50 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200/65 font-bold">
            149 MT / mês
          </span>
        </div>

        {profile?.plano === 'trial' ? (
          <div className="space-y-3.5 pt-1" id="trial_status_info">
            <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-2xl space-y-1.5" id="trial_box">
              <span className="text-[10px] font-extrabold text-purple-700 block uppercase tracking-wide">Período de Teste Ativo</span>
              <p className="text-xs text-slate-600 font-medium">Ainda te restam <strong className="text-slate-900 font-extrabold">6 dias grátis</strong> para explorar todas as funcionalidades sem compromisso.</p>
            </div>

            {showUpgradeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-700 flex items-center space-x-2 animate-bounce" id="upgrade_success_msg">
                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>Excelente! Agora és um assinante DropFlow Pro.</span>
              </div>
            ) : (
              <button
                id="btn_subscribe_pro"
                onClick={handleProUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-sm shadow-purple-600/10 transition-all flex items-center justify-center space-x-2 cursor-pointer animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>Subscrever Plano Pro — 149 MT</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-1.5" id="pro_status_info">
            <span className="text-[10px] font-extrabold text-emerald-700 block uppercase tracking-wide flex items-center">
              <Check className="w-3.5 h-3.5 mr-1" /> Assinatura Ativa
            </span>
            <p className="text-xs text-slate-600 font-medium">Estás a usufruir de lançamentos ilimitados, sincronização multi-dispositivo e relatórios completos.</p>
          </div>
        )}
      </div>

      {/* 4. Logout / Reset */}
      <div className="pt-2" id="definicoes_system_panel">
        <button
          id="btn_system_logout"
          onClick={logout}
          className="w-full bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100/60 transition-colors font-extrabold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

    </div>
  );
}
