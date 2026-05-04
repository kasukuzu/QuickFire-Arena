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
  zoomMultiplier: number;
  automatic: boolean;
  recoil: number;
  muzzleScale: number;
  image: string;
  description: string;
  rangeLabel: string;
  fireRateLabel: string;
  easeLabel: string;
  statsBarValues: {
    damage: number;
    range: number;
    fireRate: number;
    magazine: number;
    reload: number;
    handling: number;
  };
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
    adsFov: 50,
    zoomMultiplier: 1.5,
    automatic: true,
    recoil: 0.22,
    muzzleScale: 1,
    image: '/weapons/ar.png',
    description: '中距離で安定した継戦能力を持つ標準武器。',
    rangeLabel: '中〜長',
    fireRateLabel: '中',
    easeLabel: '高',
    statsBarValues: {
      damage: 42,
      range: 70,
      fireRate: 60,
      magazine: 72,
      reload: 65,
      handling: 78
    }
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
    adsFov: 75,
    zoomMultiplier: 1,
    automatic: true,
    recoil: 0.16,
    muzzleScale: 0.9,
    image: '/weapons/smg.png',
    description: '近距離の押し引きと移動撃ちに向いた高レート武器。',
    rangeLabel: '短〜中',
    fireRateLabel: '高',
    easeLabel: '中',
    statsBarValues: {
      damage: 30,
      range: 48,
      fireRate: 86,
      magazine: 82,
      reload: 76,
      handling: 88
    }
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
    adsFov: 18.75,
    zoomMultiplier: 4,
    automatic: false,
    recoil: 0.58,
    muzzleScale: 1.45,
    image: '/weapons/sr.png',
    description: '長い射線で高ダメージを狙う単発式ライフル。',
    rangeLabel: '長',
    fireRateLabel: '低',
    easeLabel: '低',
    statsBarValues: {
      damage: 92,
      range: 95,
      fireRate: 18,
      magazine: 24,
      reload: 42,
      handling: 44
    }
  }
};

export const weaponList = Object.values(WEAPONS);
