import { WEAPONS } from '../../game/weapons';
import type { WeaponId } from '../../game/types';
import WeaponPreview from './WeaponPreview';

type Props = {
  weaponId: WeaponId;
};

export default function WeaponStatsPanel({ weaponId }: Props) {
  const weapon = WEAPONS[weaponId];
  const bars = [
    ['Damage', weapon.statsBarValues.damage, weapon.damage.toString()],
    ['Range', weapon.statsBarValues.range, weapon.rangeLabel],
    ['Fire Rate', weapon.statsBarValues.fireRate, weapon.fireRateLabel],
    ['Magazine', weapon.statsBarValues.magazine, weapon.magazineSize.toString()],
    ['Reload', weapon.statsBarValues.reload, `${(weapon.reloadMs / 1000).toFixed(1)}s`],
    ['Handling', weapon.statsBarValues.handling, weapon.easeLabel]
  ] as const;

  return (
    <aside className="weapon-detail-panel">
      <WeaponPreview weaponId={weapon.id} />
      <div className="weapon-detail-copy">
        <p className="eyebrow">Selected Weapon</p>
        <h3>{weapon.name}</h3>
        <p>{weapon.description}</p>
      </div>
      <div className="stat-list">
        {bars.map(([label, value, display]) => (
          <div className="stat-row" key={label}>
            <span>{label}</span>
            <div className="stat-track">
              <span style={{ width: `${value}%` }} />
            </div>
            <strong>{display}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
