import type { WeaponId } from '../types';
import HoloSightOverlay from './HoloSightOverlay';
import ScopeOverlay from './ScopeOverlay';

type Props = {
  weaponId: WeaponId;
  ads: boolean;
};

export default function ADSOverlay({ weaponId, ads }: Props) {
  if (!ads) return null;
  return weaponId === 'sr' ? <ScopeOverlay /> : <HoloSightOverlay />;
}
