/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/appContext.tsx';
import { Users, Megaphone, Shield, Search, Settings, AlertTriangle, Play, CheckCircle2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db as fDb } from '../lib/firebase.ts';

export default function AdminView() {
  const { allProfiles, broadcasts, addBroadcast, updateUserProfileByAdmin, vendas } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'todos' | 'trial_expira_2d'>('todos');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementImage, setAnnouncementImage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'aviso' | 'novidade'>('novidade');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPlan, setNewPlan] = useState<'trial' | 'pro' | 'free'>('trial');
  const [isSuspended, setIsSuspended] = useState(false);
  const [trialExpiresDays, setTrialExpiresDays] = useState('7');
  
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isSendingAnnounce, setIsSendingAnnounce] = useState(false);
  const [announceSuccess, setAnnounceSuccess] = useState('');

  // Fetch admin logs real-time
  useEffect(() => {
    try {
      const q = query(collection(fDb, 'admin_logs'), orderBy('timestamp', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminLogs(logs);
      }, (err) => {
        console.error("Error reading admin logs:", err);
      });
      return unsubscribe;
    } catch (e) {
      console.error("Admin logs query failed:", e);
    }
  }, []);

  // Filter users based on search
  const filteredUsers = allProfiles.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.nome || '').toLowerCase().includes(term) ||
      (user.pais || '').toLowerCase().includes(term) ||
      (user.id || '').toLowerCase().includes(term)
    );
  });

  // Global metrics calculations
  const totalUsers = allProfiles.length;
  const proUsersCount = allProfiles.filter(u => u.plano === 'pro').length;
  const trialUsersCount = allProfiles.filter(u => u.plano === 'trial').length;
  const suspendedCount = allProfiles.filter(u => u.suspenso === true).length;

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setIsSendingAnnounce(true);
    setAnnounceSuccess('');
    try {
      await addBroadcast(
        announcementText, 
        announcementTarget,
        announcementTitle.trim() || undefined,
        announcementLink.trim() || undefined,
        announcementImage.trim() || undefined,
        announcementType
      );
      setAnnouncementText('');
      setAnnouncementTitle('');
      setAnnouncementLink('');
      setAnnouncementImage('');
      setAnnouncementType('novidade');
      setAnnounceSuccess('Banner / Comunicado de novidade transmitido com sucesso!');
      setTimeout(() => setAnnounceSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingAnnounce(false);
    }
  };

  const handleOpenUserConfig = (user: any) => {
    setSelectedUser(user);
    setNewPlan(user.plano || 'trial');
    setIsSuspended(!!user.suspenso);
    
    if (user.trial_expires_at) {
      const diff = new Date(user.trial_expires_at).getTime() - Date.now();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setTrialExpiresDays(days.toString());
    } else {
      setTrialExpiresDays('7');
    }
  };

  const handleSaveUserConfig = async () => {
    if (!selectedUser) return;
    try {
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + parseInt(trialExpiresDays || '7'));

      await updateUserProfileByAdmin(selectedUser.id, {
        plano: newPlan,
        suspenso: isSuspended,
        trial_expires_at: trialExpiry.toISOString()
      });
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin_dashboard">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Painel Administrativo</span>
          </h2>
          <p className="text-[10px] text-slate-500">Gestão global do ecossistema DroopFlow</p>
        </div>
        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
          Acesso Total
        </span>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="admin_stats_grid">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Utilizadores</span>
          <span className="text-2xl font-black text-slate-900 block">{totalUsers}</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Assinantes PRO</span>
          <span className="text-2xl font-black text-emerald-600 block">{proUsersCount}</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Em Trial</span>
          <span className="text-2xl font-black text-indigo-600 block">{trialUsersCount}</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Suspensos</span>
          <span className="text-2xl font-black text-rose-600 block">{suspendedCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="admin_modules_grid">
        
        {/* Users Management List (Col-span 2) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 md:col-span-2" id="user_management_panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Gerir Subscritores</span>
            </h3>

            {/* Search Input */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-56 bg-slate-50 border border-slate-200/60 pl-8 pr-3 py-1.5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[9px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">Nenhum utilizador encontrado.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className="text-slate-900 block truncate max-w-[150px]">{user.nome}</span>
                        <span className="text-[9px] text-slate-400 font-medium block truncate max-w-[150px]">{user.id}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{user.pais || '---'} ({user.moeda || 'MT'})</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-black ${user.plano === 'pro' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {user.plano}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.suspenso ? (
                          <span className="text-rose-600 text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Suspenso
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-[10px] flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Ativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenUserConfig(user)}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-[9px] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Settings className="w-3 h-3" /> Ajustar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Warning Broadcast Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="warning_broadcast_panel">
          <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <span>Transmitir Novidade ou Banner</span>
          </h3>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            Adicione uma novidade, aviso ou promoção. É possível enviar em formato de banner completo contendo imagens, links de ação e títulos destacados para chamar a atenção dos utilizadores.
          </p>

          <form onSubmit={handleBroadcastSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Tipo de Banner</label>
              <select
                value={announcementType}
                onChange={e => setAnnouncementType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              >
                <option value="novidade">🎉 Novidade (Destaque em Banner)</option>
                <option value="aviso">⚠️ Aviso Importante (Simples)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Título do Banner (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Nova Funcionalidade Liberada!"
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Texto / Mensagem</label>
              <textarea
                rows={2}
                placeholder="Escreva a mensagem do comunicado ou descrição da novidade..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Link da Novidade / Ação (Opcional)</label>
              <input
                type="url"
                placeholder="Ex: https://droopflow.com/novas-metas"
                value={announcementLink}
                onChange={e => setAnnouncementLink(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">URL da Imagem / Mídia (Opcional)</label>
              <input
                type="url"
                placeholder="Ex: https://images.unsplash.com/... ou link de imagem"
                value={announcementImage}
                onChange={e => setAnnouncementImage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Público Alvo</label>
              <select
                value={announcementTarget}
                onChange={e => setAnnouncementTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
              >
                <option value="todos">Todos os Utilizadores</option>
                <option value="trial_expira_2d">Trial Expira em 2 dias ou menos</option>
              </select>
            </div>

            {announceSuccess && (
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl text-center">
                {announceSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSendingAnnounce}
              className="w-full bg-indigo-600 text-white font-extrabold text-xs py-3 px-4 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/15"
            >
              <Megaphone className="w-4 h-4" />
              <span>{isSendingAnnounce ? 'A transmitir...' : 'Emitir Aviso 📢'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Footer Audit Logs & User Config Modal overlay */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3" id="admin_audit_logs">
        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 font-display">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Registo de Ações Administrativas</span>
        </h4>
        
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2" id="audit_logs_list">
          {adminLogs.length === 0 ? (
            <p className="text-[10px] text-slate-400 py-4 text-center">Sem registos recentes.</p>
          ) : (
            adminLogs.map(log => (
              <div key={log.id} className="flex justify-between items-start text-[10px] p-2 bg-slate-50 rounded-xl border border-slate-200/30" id={`log_${log.id}`}>
                <div className="space-y-0.5">
                  <span className="font-black text-indigo-600">{log.adminEmail}</span>
                  <span className="text-slate-700 block font-bold">{log.acao}</span>
                  <span className="text-slate-400 text-[8px] font-medium block">Alvo: {log.utilizadorAfetado}</span>
                </div>
                <span className="text-slate-400 text-[8px] font-medium shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User configuration popup modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-100 shadow-2xl animate-scale-in">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-black text-slate-900 text-sm">Ajustar Utilizador</h4>
              <p className="text-[10px] text-slate-500 truncate">{selectedUser.nome}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase block">Plano de Subscrição</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                >
                  <option value="trial">Trial (Teste Grátis)</option>
                  <option value="pro">Pro (Premium)</option>
                  <option value="free">Free (Gratuito)</option>
                </select>
              </div>

              {newPlan === 'trial' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Dias Restantes de Trial</label>
                  <input
                    type="number"
                    value={trialExpiresDays}
                    onChange={e => setTrialExpiresDays(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Suspender Conta</span>
                  <span className="text-[8px] text-slate-400 block">Impedir acesso imediato à plataforma</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuspended(!isSuspended)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isSuspended ? 'bg-rose-500 flex justify-end' : 'bg-slate-300 flex justify-start'}`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUserConfig}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
