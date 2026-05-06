import { weaponList } from '../../game/weapons';
import type { WeaponId } from '../../game/types';

type Props = {
  selectedWeapon: WeaponId | null;
  onSelect: (weaponId: WeaponId) => void;
};

export default function WeaponSelector({ selectedWeapon, onSelect }: Props) {
  return (
    <div className="weapon-list">
      {weaponList.map((weapon) => (
        <button
          className={selectedWeapon === weapon.id ? 'weapon-card active' : 'weapon-card'}
          key={weapon.id}
          onClick={() => onSelect(weapon.id)}
        >
          <strong>{weapon.name}</strong>
          <span>{weapon.role}</span>
          <small>DMG {weapon.damage} / MAG {weapon.magazineSize} / {(weapon.reloadMs / 1000).toFixed(1)}s</small>
        </button>
      ))}
    </div>
  );
}
