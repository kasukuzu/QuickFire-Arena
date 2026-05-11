import MatchTimerHud from './MatchTimerHud';
import PlayerAmmoHud from './PlayerAmmoHud';
import PlayerHpHud from './PlayerHpHud';

type Props = {
  time: string;
  hp: number;
  hpRatio: number;
  hpTone: 'healthy' | 'warning' | 'danger';
  weaponName: string;
  ammo: number;
  magazineSize: number | null;
  ammoRatio: number;
  reloading: boolean;
  reloadProgress: number | null;
};

export default function MatchHud({
  time,
  hp,
  hpRatio,
  hpTone,
  weaponName,
  ammo,
  magazineSize,
  ammoRatio,
  reloading,
  reloadProgress
}: Props) {
  return (
    <div className="match-hud">
      <div className="match-hud-top">
        <MatchTimerHud time={time} />
      </div>
      <div className="match-hud-left">
        <PlayerHpHud hp={hp} ratio={hpRatio} tone={hpTone} />
      </div>
      <div className="match-hud-right">
        <PlayerAmmoHud
          weaponName={weaponName}
          ammo={ammo}
          magazineSize={magazineSize}
          ratio={ammoRatio}
          reloading={reloading}
          reloadProgress={reloadProgress}
        />
      </div>
    </div>
  );
}
