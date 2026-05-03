import { WEAPONS } from './WeaponSystem';
import { getActiveMapName } from './maps/mapDefinitions';
import type { PlayerState, RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  player: PlayerState;
  scoreboardOpen: boolean;
};

export default function HUD({ snapshot, player, scoreboardOpen }: Props) {
  const remaining = snapshot.matchEndsAt ? Math.max(0, snapshot.matchEndsAt - snapshot.serverTime) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  const weapon = WEAPONS[player.weaponId];
  const respawnMs = player.respawnAt ? Math.max(0, player.respawnAt - snapshot.serverTime) : 0;
  const invincibleMs = player.invincibleUntil ? Math.max(0, player.invincibleUntil - snapshot.serverTime) : 0;
  const ranking = [...snapshot.players].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);

  return (
    <div className="hud">
      <div className="topbar">
        <span>{minutes}:{seconds}</span>
        <span>{getActiveMapName(snapshot.activeMapId)}</span>
        <span>{player.kills} K / {player.deaths} D</span>
      </div>
      <div className="crosshair" />
      <div className="status">
        <span>HP {player.hp}</span>
        <span>{weapon.name} {player.ammo}/{weapon.magazineSize}</span>
      </div>
      {!player.alive ? (
        <div className="respawn">Respawn in {Math.ceil(respawnMs / 1000)}s</div>
      ) : null}
      {player.alive && invincibleMs > 0 ? (
        <div className="respawn invincible">無敵中 {(invincibleMs / 1000).toFixed(1)}</div>
      ) : null}
      {scoreboardOpen ? (
        <div className="scoreboard">
          <h2>Scoreboard</h2>
          {ranking.map((entry) => (
            <div className="score-row" key={entry.id}>
              <span>{entry.name}</span>
              <span>{entry.kills} / {entry.deaths}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
