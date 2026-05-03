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
    adsFov: 52
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    damage: 12,
    fireIntervalMs: 80,
    magazineSize: 35,
    reloadMs: 1500,
    range: 45,
    adsFov: 55
  },
  sr: {
    id: 'sr',
    name: 'SR',
    damage: 80,
    fireIntervalMs: 900,
    magazineSize: 5,
    reloadMs: 2400,
    range: 120,
    adsFov: 28
  }
};
