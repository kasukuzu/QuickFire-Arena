import type { Vec3, WeaponId } from './types';

const SOUND_PATHS: Record<string, string> = {
  footstep: '/sounds/footstep.mp3',
  ar: '/sounds/ar_shot.mp3',
  smg: '/sounds/smg_shot.mp3',
  sr: '/sounds/sr_shot.mp3',
  kill: '/sounds/kill.mp3'
};

let audioContext: AudioContext | null = null;

export function playWeaponSound(weaponId: WeaponId, volume = 1) {
  playSound(weaponId, volume, weaponId === 'sr' ? 95 : weaponId === 'smg' ? 210 : 150);
}

export function playFootstep(volume = 1) {
  playSound('footstep', volume, 520);
}

export function playKillSound(volume = 1) {
  playSound('kill', volume, 720);
}

export function distanceVolume(from: Vec3, to: Vec3, maxDistance = 26) {
  const distance = Math.hypot(from.x - to.x, from.y - to.y, from.z - to.z);
  return Math.max(0, Math.min(1, 1 - distance / maxDistance));
}

function playSound(kind: string, volume: number, fallbackFrequency: number) {
  const clippedVolume = Math.max(0, Math.min(1, volume));
  if (clippedVolume <= 0.01) return;

  const audio = new Audio(SOUND_PATHS[kind]);
  audio.volume = clippedVolume;
  audio.currentTime = 0;
  audio.play().catch(() => playFallbackTone(fallbackFrequency, clippedVolume));
}

function playFallbackTone(frequency: number, volume: number) {
  audioContext ??= new AudioContext();
  const context = audioContext;
  if (context.state === 'suspended') void context.resume();

  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = frequency < 120 ? 'sawtooth' : 'square';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume * 0.12, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
  osc.connect(gain).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.09);
}
