import { useRef, useState } from 'react';
import type { WeaponId } from './types';
import { WEAPONS } from './weapons';

type FireContext = {
  weaponId: WeaponId;
  recoil: number;
};

export type WeaponRuntime = {
  ads: boolean;
  firing: boolean;
  recoil: number;
  shotPulse: number;
  startAds: () => void;
  stopAds: () => void;
  startFire: (weaponId: WeaponId, fire: (context: FireContext) => void) => void;
  stopFire: () => void;
  updateAutomaticFire: (weaponId: WeaponId, canFire: boolean, fire: (context: FireContext) => void) => void;
  updateRecoil: (delta: number) => void;
};

export { WEAPONS, weaponList } from './weapons';

export function useWeaponSystem(): WeaponRuntime {
  const [ads, setAds] = useState(false);
  const [firing, setFiring] = useState(false);
  const [recoil, setRecoil] = useState(0);
  const [shotPulse, setShotPulse] = useState(0);
  const lastShotAt = useRef(0);
  const firingRef = useRef(false);

  function triggerShot(weaponId: WeaponId, fire: (context: FireContext) => void) {
    const weapon = WEAPONS[weaponId];
    const now = performance.now();
    if (now - lastShotAt.current < weapon.fireIntervalMs) return;
    lastShotAt.current = now;
    setRecoil((current) => Math.min(1.2, current + weapon.recoil));
    setShotPulse((current) => current + 1);
    fire({ weaponId, recoil: weapon.recoil });
  }

  return {
    ads,
    firing,
    recoil,
    shotPulse,
    startAds: () => setAds(true),
    stopAds: () => setAds(false),
    startFire: (weaponId, fire) => {
      firingRef.current = true;
      setFiring(true);
      if (!WEAPONS[weaponId].automatic) triggerShot(weaponId, fire);
    },
    stopFire: () => {
      firingRef.current = false;
      setFiring(false);
    },
    updateAutomaticFire: (weaponId, canFire, fire) => {
      if (!firingRef.current || !canFire || !WEAPONS[weaponId].automatic) return;
      triggerShot(weaponId, fire);
    },
    updateRecoil: (delta) => {
      setRecoil((current) => Math.max(0, current - delta * 4.8));
    }
  };
}
