import type { WeaponId } from './types.js';

export type WeaponConfig = {
  id: WeaponId;
  name: string;
  damage: number;
  fireIntervalMs: number;
  magazineSize: number;
  reloadMs: number;
  range: number;
  adsFov: number;
  zoomMultiplier: number;
};

export const WEAPONS: Record<WeaponId, WeaponConfig> = {
  ar: {
    id: 'ar',
    name: 'AR',
    damage: 18,
    fireIntervalMs: 120,
    magazineSize: 30,
    reloadMs: 1800,
    range: 70,
    adsFov: 50,
    zoomMultiplier: 1.5
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    damage: 12,
    fireIntervalMs: 80,
    magazineSize: 35,
    reloadMs: 1500,
    range: 45,
    adsFov: 75,
    zoomMultiplier: 1
  },
  sr: {
    id: 'sr',
    name: 'SR',
    damage: 80,
    fireIntervalMs: 900,
    magazineSize: 5,
    reloadMs: 2400,
    range: 120,
    adsFov: 18.75,
    zoomMultiplier: 4
  }
};
