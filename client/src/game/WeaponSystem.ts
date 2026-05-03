import type { WeaponId } from './types';

export type WeaponConfig = {
  id: WeaponId;
  name: string;
  role: string;
  damage: number;
  fireIntervalMs: number;
  magazineSize: number;
  reloadMs: number;
  adsFov: number;
};

export const WEAPONS: Record<WeaponId, WeaponConfig> = {
  ar: {
    id: 'ar',
    name: 'AR',
    role: '中距離向け',
    damage: 18,
    fireIntervalMs: 120,
    magazineSize: 30,
    reloadMs: 1800,
    adsFov: 52
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    role: '近距離向け',
    damage: 12,
    fireIntervalMs: 80,
    magazineSize: 35,
    reloadMs: 1500,
    adsFov: 55
  },
  sr: {
    id: 'sr',
    name: 'SR',
    role: '遠距離向け',
    damage: 80,
    fireIntervalMs: 900,
    magazineSize: 5,
    reloadMs: 2400,
    adsFov: 28
  }
};

export const weaponList = Object.values(WEAPONS);
