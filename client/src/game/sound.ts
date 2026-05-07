import type { Vec3, WeaponId } from './types';

const SOUND_PATHS: Record<string, string> = {
  footstep: '/sounds/footstep.mp3',
  ar: '/sounds/ar_shot.mp3',
  smg: '/sounds/smg_shot.mp3',
  sr: '/sounds/sr_shot.mp3',
  kill: '/sounds/kill.mp3',
  reload: '/sounds/reload.mp3',
  reloadDone: '/sounds/reload_done.mp3',
  hit: '/sounds/hit.mp3',
  headshot: '/sounds/headshot.mp3',
  hurt: '/sounds/hurt.mp3'
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

export function playReloadSound(volume = 1) {
  playSound('reload', volume, 340);
}

export function playReloadDoneSound(volume = 1) {
  playSound('reloadDone', volume, 880);
}

export function playHitSound(headshot: boolean, volume = 1) {
  playSound(headshot ? 'headshot' : 'hit', volume, headshot ? 980 : 620);
}

export function playHurtSound(volume = 1) {
  playSound('hurt', volume, 180);
}

export function distanceVolume(from: Vec3, to: Vec3, maxDistance = 26) {
  const distance = Math.hypot(from.x - to.x, from.y - to.y, from.z - to.z);
  return Math.max(0, Math.min(1, 1 - distance / maxDistance));
}

function playSound(kind: string, volume: number, fallbackFrequency: number) {
  const clippedVolume = Math.max(0, Math.min(1, volume));
  if (clippedVolume <= 0.01) return;

  const audio = new Audio(SOUND_PATHS[kind]);
  let fallbackPlayed = false;
  const fallback = () => {
    if (fallbackPlayed) return;
    fallbackPlayed = true;
    playFallbackTone(fallbackFrequency, clippedVolume);
  };
  audio.addEventListener('error', fallback, { once: true });
  audio.volume = clippedVolume;
  audio.currentTime = 0;
  audio.play().catch(fallback);
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
