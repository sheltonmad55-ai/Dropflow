/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { TrendingUp, Megaphone, ShieldCheck, ArrowRight, Sparkles, Wallet } from 'lucide-react';
import dropflowLogo from '../assets/images/droopflow_logo_1783896707656.jpg';

export default function Onboarding() {
  const { login, register, loginGoogle } = useApp();
  // By default, start on slide 2 (auth screen) so it matches the screenshot immediately
  const [slide, setSlide] = useState(2); // 0: intro, 1: concept, 2: auth, 3: percentage setup (only on signup)
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [pais, setPais] = useState('Moçambique');
  const [moeda, setMoeda] = useState('MT');
  
  // Custom error
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextSlide = () => {
    setSlide(prev => prev + 1);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // If signing up, go to percentage setup first
        setSlide(3);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginGoogle();
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar sessão com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterComplete = async () => {
    setError('');
    setLoading(true);
    try {
      await register(email, password, nome, pais, moeda);
    } catch (err: any) {
      setError(err.message || 'Erro ao registar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 md:p-6" id="onboarding_container">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Top logo */}
        <div className="flex items-center justify-center mb-8 gap-3" id="onboarding_header">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200/50 shadow-md flex items-center justify-center bg-white" id="logo_icon">
            <img 
              src={dropflowLogo} 
              alt="DroopFlow Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 font-display" id="logo_text">
            DroopFlow
          </span>
        </div>

        {/* Slides */}
        <div className="w-full" id="onboarding_body">
          {slide === 0 && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 text-center space-y-6 animate-fade-in" id="slide_0">
              <div className="inline-flex bg-slate-50 p-4 rounded-full text-emerald-600 border border-slate-100" id="slide_0_badge">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
                  Sabe exatamente para onde vai cada metical.
                </h1>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                  O gestor financeiro inteligente e offline-first desenhado exclusivamente para empreendedores de dropshipping.
                </p>
              </div>
              <button
                id="btn_onboarding_next_0"
                onClick={handleNextSlide}
                className="w-full bg-[#006638] text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-[#00522c] transition-colors flex items-center justify-center text-sm"
              >
                Saber mais
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {slide === 1 && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6 animate-fade-in" id="slide_1">
              <h2 className="text-xl font-bold text-slate-900 text-center leading-snug">
                Como funciona o DroopFlow?
              </h2>
              
              <div className="space-y-4" id="concept_cards">
                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100" id="concept_1">
                  <div className="bg-sky-50 p-2.5 rounded-xl text-sky-700 mr-4 shrink-0 border border-sky-100">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">1. Regista as tuas Vendas</h4>
                    <p className="text-xs text-slate-500 mt-1">Ao vender, o sistema calcula os custos de fornecedor e entrega automaticamente.</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100" id="concept_2">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-700 mr-4 shrink-0 border border-emerald-100">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">2. Divisão em Caixinhas</h4>
                    <p className="text-xs text-slate-500 mt-1">O lucro líquido e verbas de marketing são distribuídos em caixinhas financeiras dedicadas.</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100" id="concept_3">
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-700 mr-4 shrink-0 border border-indigo-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">3. Caixa e Offline-First</h4>
                    <p className="text-xs text-slate-500 mt-1">Regista tudo offline debaixo de árvores ou sem saldo. Sincroniza logo que ligares à rede!</p>
                  </div>
                </div>
              </div>

              <button
                id="btn_onboarding_next_1"
                onClick={handleNextSlide}
                className="w-full bg-[#006638] text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-[#00522c] transition-colors flex items-center justify-center text-sm"
              >
                Continuar para Registo/Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {slide === 2 && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6 animate-fade-in" id="slide_2">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {isLogin ? 'Bem-vindo de volta' : 'Cria a tua conta'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isLogin ? 'Entra para continuares a gerir o teu dropshipping.' : 'Começa grátis com trial de 7 dias sem compromisso.'}
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs text-center font-medium" id="auth_error">
                  {error}
                </div>
              )}

              {/* Google Button */}
              <button
                id="btn_google_auth"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-2xl shadow-sm transition-colors text-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-1" id="or_divider">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm font-normal">ou</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4" id="auth_form">
                {!isLogin && (
                  <div className="space-y-1.5" id="input_nome_group">
                    <label className="text-xs font-semibold text-slate-500">Nome do Empreendedor</label>
                    <input
                      id="input_nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Shelton Mad"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006638] focus:ring-1 focus:ring-[#006638] transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1.5" id="input_email_group">
                  <label className="text-xs font-semibold text-slate-500">Email</label>
                  <input
                    id="input_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: seuemail@comercial.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006638] focus:ring-1 focus:ring-[#006638] transition-colors"
                  />
                </div>

                <div className="space-y-1.5" id="input_password_group">
                  <label className="text-xs font-semibold text-slate-500">Palavra-passe</label>
                  <input
                    id="input_password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserir palavra-passe"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006638] focus:ring-1 focus:ring-[#006638] transition-colors"
                  />
                </div>

                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3" id="signup_selectors">
                    <div className="space-y-1.5" id="input_pais_group">
                      <label className="text-xs font-semibold text-slate-500">País</label>
                      <select
                        id="input_pais"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#006638] transition-colors appearance-none"
                      >
                        <option value="Moçambique">Moçambique</option>
                        <option value="África do Sul">África do Sul</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Angola">Angola</option>
                        <option value="Brasil">Brasil</option>
                      </select>
                    </div>
                    <div className="space-y-1.5" id="input_moeda_group">
                      <label className="text-xs font-semibold text-slate-500">Moeda Padrão</label>
                      <select
                        id="input_moeda"
                        value={moeda}
                        onChange={(e) => setMoeda(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#006638] transition-colors appearance-none"
                      >
                        <option value="MT">MT (Meticais)</option>
                        <option value="ZAR">ZAR (Rands)</option>
                        <option value="USD">USD (Dólares)</option>
                        <option value="EUR">EUR (Euros)</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  id="btn_auth_submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006638] hover:bg-[#00522c] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors mt-2 text-sm disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {loading ? 'A carregar...' : isLogin ? 'Entrar' : 'Seguinte: Configurar Pockets'}
                  {!loading && !isLogin && <ArrowRight className="w-4 h-4 ml-2" />}
                </button>
              </form>

              {/* Toggle Footer */}
              <div className="text-center pt-2" id="auth_toggle_wrapper">
                <span className="text-sm text-slate-500">
                  {isLogin ? 'Ainda não tens conta? ' : 'Já tens conta? '}
                </span>
                <button
                  id="btn_auth_toggle"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-sm text-[#006638] hover:text-[#00522c] hover:underline font-bold"
                >
                  {isLogin ? 'Criar conta' : 'Fazer login'}
                </button>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6 animate-fade-in" id="slide_3">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Percentagens do Restante</h2>
                <p className="text-slate-500 text-xs">
                  Defina como dividir o valor restante de cada venda (após descontar fornecedor e entrega).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-5 border border-slate-100" id="percent_sliders">
                {/* Marketing Pockets */}
                <div className="space-y-1.5" id="slider_anuncios_group">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-1.5 inline-block"></span>
                      Caixinha Anúncios
                    </span>
                    <span className="text-slate-900">50%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Verba reservada para campanhas de Meta Ads / TikTok Ads.</p>
                </div>

                {/* Profits Pockets */}
                <div className="space-y-1.5" id="slider_lucro_group">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                      Caixinha Lucro Líquido
                    </span>
                    <span className="text-slate-900">50%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Dinheiro real que podes retirar como pró-labore ou lucro da empresa.</p>
                </div>

                {/* Explanatory preview */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 shadow-sm" id="distribution_example">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">Simulação Exemplo:</span>
                  <p>
                    Venda de <span className="text-slate-900 font-bold">1.000 {moeda}</span> de um produto que custa <span className="text-slate-900 font-bold">300 {moeda}</span> e entrega de <span className="text-slate-900 font-bold">100 {moeda}</span>:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1" id="example_distribution_values">
                    <div>🎁 Fornecedores: <span className="text-amber-700 font-bold">300 {moeda}</span></div>
                    <div>🚚 Delivery: <span className="text-indigo-700 font-bold">100 {moeda}</span></div>
                    <div>📢 Anúncios (50%): <span className="text-sky-700 font-bold">300 {moeda}</span></div>
                    <div>💰 Lucro (50%): <span className="text-emerald-700 font-bold">300 {moeda}</span></div>
                  </div>
                </div>
              </div>

              <button
                id="btn_finish_signup"
                onClick={handleRegisterComplete}
                disabled={loading}
                className="w-full bg-[#006638] hover:bg-[#00522c] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {loading ? 'A criar conta...' : 'Concluir e Abrir Dashboard'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
              
              <button
                id="btn_back_to_auth"
                type="button"
                onClick={() => setSlide(2)}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold"
              >
                Voltar atrás
              </button>
            </div>
          )}
        </div>
        
        {/* Footer info/controls for slides 0 & 1 */}
        {slide < 2 && (
          <div className="flex flex-col items-center space-y-3 mt-6" id="onboarding_footer">
            <div className="flex space-x-1.5" id="slide_dots">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${slide === 0 ? 'bg-[#006638]' : 'bg-slate-200'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${slide === 1 ? 'bg-[#006638]' : 'bg-slate-200'}`}></span>
            </div>
            <button
              id="btn_skip_onboarding"
              onClick={() => setSlide(2)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold"
            >
              Saltar introdução
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
