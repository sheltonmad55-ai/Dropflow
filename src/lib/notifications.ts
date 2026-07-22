/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, Campanha, Venda } from '../types.ts';

/**
 * Solicita permissão para notificações do navegador e ServiceWorker.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Este navegador não suporta notificações de desktop/telemóvel.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    
    // Register ServiceWorker if not already registered
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (swErr) {
        console.warn('Erro ao registar ServiceWorker para notificações:', swErr);
      }
    }

    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return 'default';
  }
}

/**
 * Envia uma notificação de forma altamente compatível com telemóveis (Android / iOS / PWA) e PC Chrome.
 */
export async function sendNotification(title: string, body: string, options?: NotificationOptions) {
  if (typeof window === 'undefined') return;

  // Trigger haptic vibration if supported on mobile
  if (navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (_) {}
  }

  // 1. Try ServiceWorker Registration showNotification (Works reliably on Chrome Mobile & PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await (registration as unknown as { showNotification: (t: string, o?: object) => Promise<void> }).showNotification(title, {
          body,
          icon: '/public/manifest.json',
          vibrate: [200, 100, 200],
          renotify: true,
          tag: 'dropflow-alert-' + Date.now(),
          ...options
        });
        return;
      }
    } catch (swError) {
      console.warn('ServiceWorker showNotification falhou, tentando fallback local:', swError);
    }
  }

  // 2. Fallback to standard Notification API (PC Chrome / Desktop)
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, ...options });
    } catch (e) {
      console.warn('Erro ao disparar notificação local:', e);
    }
  }
}

/**
 * Verifica se o orçamento de uma campanha está próximo do esgotamento ou esgotado,
 * disparando notificações do navegador de forma correspondente.
 */
export function checkCampaignBudget(campaign: Campanha, oldSpent: number, currencySymbol: string) {
  const limit = campaign.orcamento_maximo;
  if (!limit || limit <= 0) return;

  const currentSpent = campaign.gasto;
  const threshold90 = limit * 0.9;

  // Se passou de menos de 90% para igual ou mais de 90%, mas ainda menor que o limite
  if (oldSpent < threshold90 && currentSpent >= threshold90 && currentSpent < limit) {
    sendNotification(
      'Orçamento Próximo do Limite! ⚠️',
      `A campanha "${campaign.nome}" gastou ${currentSpent.toLocaleString()} de ${limit.toLocaleString()} ${currencySymbol} (${((currentSpent / limit) * 100).toFixed(0)}%).`
    );
  }

  // Se passou do limite de 100%
  if (oldSpent < limit && currentSpent >= limit) {
    sendNotification(
      'Orçamento Esgotado! 🛑',
      `A campanha "${campaign.nome}" atingiu ou superou o orçamento máximo de ${limit.toLocaleString()} ${currencySymbol} (Gasto atual: ${currentSpent.toLocaleString()}).`
    );
  }
}

/**
 * Verifica o faturamento diário atual em relação à meta diária e agenda
 * ou dispara um lembrete automático se o usuário não atingiu o objetivo.
 */
export function checkAndTriggerDailyGoalReminder(vendas: Venda[], profile: Profile) {
  if (!profile || !profile.metaDiaria || profile.metaDiaria <= 0) return;

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Evitar disparar múltiplos lembretes no mesmo dia
  const lastReminderDate = localStorage.getItem('dropflow_last_goal_reminder_date');
  if (lastReminderDate === todayStr) {
    return;
  }

  // Somar vendas de hoje
  const salesToday = vendas
    .filter(v => v.data_venda === todayStr)
    .reduce((acc, v) => acc + v.valor_recebido, 0);

  const meta = profile.metaDiaria;
  if (salesToday < meta) {
    const currencySymbol = profile.moeda || 'MT';
    const percent = Math.round((salesToday / meta) * 100);
    
    sendNotification(
      'DroopFlow - Lembrete de Meta Diária 🚀',
      `Você faturou ${salesToday.toLocaleString()} ${currencySymbol} hoje (${percent}% da sua meta de ${meta.toLocaleString()} ${currencySymbol}). Ainda restam ${(meta - salesToday).toLocaleString()} ${currencySymbol}! Bora vender!`
    );

    // Salvar data para evitar spam de lembretes no mesmo dia
    localStorage.setItem('dropflow_last_goal_reminder_date', todayStr);
  }
}

/**
 * Inicia o agendador de lembretes locais automáticos.
 * Roda imediatamente e depois a cada período determinado.
 */
export function startNotificationScheduler(getVendas: () => Venda[], getProfile: () => Profile | null) {
  if (typeof window === 'undefined') return () => {};

  const runCheck = () => {
    const profile = getProfile();
    if (profile) {
      checkAndTriggerDailyGoalReminder(getVendas(), profile);
    }
  };

  // Executa uma vez com um leve delay de 10 segundos para dar tempo do app carregar
  const initialTimeout = setTimeout(runCheck, 10000);

  // Roda uma verificação a cada 2 horas
  const intervalId = setInterval(runCheck, 2 * 60 * 60 * 1000);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(intervalId);
  };
}
