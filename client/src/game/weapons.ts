import type { WeaponId } from './types';

export type WeaponConfig = {
  id: WeaponId;
  name: string;
  role: string;
  damage: number;
  fireIntervalMs: number;
  magazineSize: number;
  reloadMs: number;
  range: number;
  adsFov: number;
  automatic: boolean;
  recoil: number;
  muzzleScale: number;
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
    range: 70,
    adsFov: 52,
    automatic: true,
    recoil: 0.22,
    muzzleScale: 1
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    role: '近距離向け',
    damage: 12,
    fireIntervalMs: 80,
    magazineSize: 35,
    reloadMs: 1500,
    range: 45,
    adsFov: 55,
    automatic: true,
    recoil: 0.16,
    muzzleScale: 0.9
  },
  sr: {
    id: 'sr',
    name: 'SR',
    role: '遠距離向け',
    damage: 80,
    fireIntervalMs: 900,
    magazineSize: 5,
    reloadMs: 2400,
    range: 120,
    adsFov: 28,
    automatic: false,
    recoil: 0.58,
    muzzleScale: 1.45
  }
};

export const weaponList = Object.values(WEAPONS);
