/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Offline-first Web Audio API sound synthesizer and Audio file player
// Attempts to play real audio files if available, otherwise falls back to beautiful browser-synthesized sounds.

export function playCashRegister(enabled: boolean = true) {
  if (!enabled) return;
  
  // Try playing a real audio file first (e.g. meta celebration)
  const audioPaths = [
    '/sounds/metas_batidas.mp3',
    '/meta.mp3',
    '/sounds/metas_batidas.wav',
    '/meta.wav'
  ];

  let played = false;

  const tryPlayFile = (index: number) => {
    if (index >= audioPaths.length) {
      if (!played) {
        // Fallback to synthesiser
        playSyntheticCashRegister();
      }
      return;
    }

    const audio = new Audio(audioPaths[index]);
    audio.play()
      .then(() => {
        played = true;
      })
      .catch((err) => {
        // If it fails (e.g. 404 or blocked), try the next path
        tryPlayFile(index + 1);
      });
  };

  tryPlayFile(0);
}

export function playNotificationPing(enabled: boolean = true) {
  if (!enabled) return;

  // Try playing a real audio file first (e.g. report notifications)
  const audioPaths = [
    '/sounds/relatorios.mp3',
    '/relatorio.mp3',
    '/sounds/relatorios.wav',
    '/relatorio.wav'
  ];

  let played = false;

  const tryPlayFile = (index: number) => {
    if (index >= audioPaths.length) {
      if (!played) {
        // Fallback to synthesiser
        playSyntheticNotificationPing();
      }
      return;
    }

    const audio = new Audio(audioPaths[index]);
    audio.play()
      .then(() => {
        played = true;
      })
      .catch((err) => {
        // If it fails (e.g. 404 or blocked), try the next path
        tryPlayFile(index + 1);
      });
  };

  tryPlayFile(0);
}

// --- Synthesizer Fallbacks ---

function playSyntheticCashRegister() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // 1. First quick "clink" of coins
    const now = ctx.currentTime;
    
    // Create multiple tiny high-frequency sine beeps mimicking coins rattling
    const coins = [1200, 1500, 1800, 2200];
    coins.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.03);
      
      gain.gain.setValueAtTime(0.08, now + index * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.03 + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.03);
      osc.stop(now + index * 0.03 + 0.1);
    });

    // 2. The grand resonant bell ring ("ching!")
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1400, now + 0.12);
    // Add a subtle second harmonic to make it richer
    bellOsc.frequency.exponentialRampToValueAtTime(1380, now + 1.2);
    
    bellGain.gain.setValueAtTime(0, now);
    bellGain.gain.linearRampToValueAtTime(0.25, now + 0.14); // Fast fade in
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Long smooth decay
    
    // Add a second oscillator for harmony
    const harmOsc = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harmOsc.type = 'sine';
    harmOsc.frequency.setValueAtTime(1750, now + 0.12); // Major third/fifth style interval
    harmGain.gain.setValueAtTime(0, now);
    harmGain.gain.linearRampToValueAtTime(0.12, now + 0.14);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    
    harmOsc.connect(harmGain);
    harmGain.connect(ctx.destination);

    bellOsc.start(now + 0.12);
    bellOsc.stop(now + 1.6);
    
    harmOsc.start(now + 0.12);
    harmOsc.stop(now + 1.3);

  } catch (e) {
    console.warn("Web Audio API fallback failed:", e);
  }
}

function playSyntheticNotificationPing() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now); // Sweet high notification frequency
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.15); // Subtle pitch slide up

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Sweet short decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.warn("Web Audio API fallback failed:", e);
  }
}

