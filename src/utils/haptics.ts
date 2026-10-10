/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ProfitTrack Tactile Haptics & Physical Feedback Engine
// Provides native hardware vibration (navigator.vibrate)
// + Web Audio API synthesized mechanical micro-clicks for all devices

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'toggle';

export interface HapticConfig {
  vibration: boolean;
  sound: boolean;
  volume: number; // 0.0 to 1.0
}

const STORAGE_KEY = 'profittrack_haptic_config';

const DEFAULT_CONFIG: HapticConfig = {
  vibration: true,
  sound: true,
  volume: 0.65,
};

let activeConfig: HapticConfig = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_CONFIG;
})();

export const getHapticConfig = (): HapticConfig => ({ ...activeConfig });

export const setHapticConfig = (newConfig: Partial<HapticConfig>): HapticConfig => {
  activeConfig = { ...activeConfig, ...newConfig };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
  } catch {
    // ignore
  }
  return { ...activeConfig };
};

// Web Audio API singleton for synthesized tactile click transients
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        audioCtx = null;
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes a subtle, tactile mechanical click impulse resembling
 * an iPhone Taptic Engine / Apple Watch digital crown / trackpad force click.
 */
function playTactileClick(type: HapticType, volumeMultiplier: number = 1.0) {
  if (!activeConfig.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const finalVolume = Math.min(1.0, Math.max(0.0, activeConfig.volume * volumeMultiplier * 0.4));
    masterGain.gain.setValueAtTime(finalVolume, now);
    masterGain.connect(ctx.destination);

    // Profile settings per haptic type
    let startFreq = 1100;
    let endFreq = 160;
    let duration = 0.016;

    switch (type) {
      case 'light':
      case 'selection':
        startFreq = 1400;
        endFreq = 300;
        duration = 0.012;
        break;
      case 'medium':
      case 'toggle':
        startFreq = 1000;
        endFreq = 180;
        duration = 0.018;
        break;
      case 'heavy':
        startFreq = 650;
        endFreq = 90;
        duration = 0.026;
        break;
      case 'success':
        // Two quick pleasant micro-ticks
        startFreq = 880;
        endFreq = 1320;
        duration = 0.022;
        break;
      case 'warning':
      case 'error':
        startFreq = 400;
        endFreq = 180;
        duration = 0.035;
        break;
    }

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = type === 'success' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);

    // Sharp percussive transient envelope
    oscGain.gain.setValueAtTime(1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.005);

    // For 'success', schedule a second brighter tick 35ms later
    if (type === 'success') {
      const osc2 = ctx.createOscillator();
      const oscGain2 = ctx.createGain();
      const t2 = now + 0.04;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, t2);
      osc2.frequency.exponentialRampToValueAtTime(1760, t2 + 0.025);

      oscGain2.gain.setValueAtTime(0.9, t2);
      oscGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.025);

      osc2.connect(oscGain2);
      oscGain2.connect(masterGain);

      osc2.start(t2);
      osc2.stop(t2 + 0.03);
    }
  } catch {
    // Ignore audio error
  }
}

/**
 * Executes hardware vibration if available
 */
function playHardwareVibrate(type: HapticType) {
  if (!activeConfig.vibration) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'selection':
        navigator.vibrate(8);
        break;
      case 'light':
        navigator.vibrate(14);
        break;
      case 'medium':
      case 'toggle':
        navigator.vibrate(24);
        break;
      case 'heavy':
        navigator.vibrate(48);
        break;
      case 'success':
        navigator.vibrate([15, 35, 25]);
        break;
      case 'warning':
      case 'error':
        navigator.vibrate([35, 45, 35]);
        break;
    }
  } catch {
    // Ignore vibration failure
  }
}

/**
 * Universal Haptic Trigger
 */
export function triggerHaptic(type: HapticType = 'light') {
  playHardwareVibrate(type);
  playTactileClick(type);
}

// Convenience shorthands
export const hapticTap = () => triggerHaptic('light');
export const hapticPress = () => triggerHaptic('medium');
export const hapticHeavy = () => triggerHaptic('heavy');
export const hapticSelect = () => triggerHaptic('selection');
export const hapticSuccess = () => triggerHaptic('success');
export const hapticWarning = () => triggerHaptic('warning');
export const hapticError = () => triggerHaptic('error');
export const hapticToggle = () => triggerHaptic('toggle');
