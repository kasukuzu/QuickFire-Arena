import HudFrame from './HudFrame';

type Props = {
  weaponName: string;
  ammo: number;
  magazineSize: number | null;
  ratio: number;
  reloading: boolean;
  reloadProgress: number | null;
};

export default function PlayerAmmoHud({ weaponName, ammo, magazineSize, ratio, reloading, reloadProgress }: Props) {
  const empty = magazineSize !== null && ammo <= 0;

  return (
    <HudFrame className={`match-hud-status match-hud-ammo ${empty ? 'empty' : ''} ${reloading ? 'reloading' : ''}`}>
      <span className="match-hud-label">{reloading ? 'Reloading...' : weaponName}</span>
      <span className="match-hud-value">
        {ammo}/{magazineSize ?? '-'}
      </span>
      <div className="match-hud-gauge">
        <span style={{ width: `${Math.max(0, Math.min(1, reloading && reloadProgress !== null ? reloadProgress : ratio)) * 100}%` }} />
      </div>
    </HudFrame>
  );
}
