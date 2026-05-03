import { WEAPONS, weaponList } from './WeaponSystem';
import type { RoomSnapshot, WeaponId } from './types';

type Props = {
  snapshot: RoomSnapshot;
  playerId: string;
  onSelectWeapon: (weaponId: WeaponId) => void;
  onStart: () => void;
};

export default function LobbyScreen({ snapshot, playerId, onSelectWeapon, onStart }: Props) {
  const me = snapshot.players.find((player) => player.id === playerId);
  const canStart = me?.isHost && snapshot.players.length >= 2;

  return (
    <main className="screen panel-screen">
      <section className="panel lobby-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Room</p>
            <h1>{snapshot.roomId}</h1>
          </div>
          <span className="capacity">{snapshot.players.length}/{snapshot.maxPlayers}</span>
        </div>

        <div className="lobby-grid">
          <section>
            <h2>Players</h2>
            <div className="player-list">
              {snapshot.players.map((player) => (
                <div className="player-row" key={player.id}>
                  <span>{player.name}</span>
                  <span>{player.isHost ? 'Host' : WEAPONS[player.weaponId].name}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Weapon</h2>
            <div className="weapon-list">
              {weaponList.map((weapon) => (
                <button
                  className={me?.weaponId === weapon.id ? 'weapon-card active' : 'weapon-card'}
                  key={weapon.id}
                  onClick={() => onSelectWeapon(weapon.id)}
                >
                  <strong>{weapon.name}</strong>
                  <span>{weapon.role}</span>
                  <small>DMG {weapon.damage} / MAG {weapon.magazineSize}</small>
                </button>
              ))}
            </div>
          </section>
        </div>

        {me?.isHost ? (
          <button className="primary" disabled={!canStart} onClick={onStart}>
            Start Match
          </button>
        ) : (
          <p className="muted">ホストの開始を待っています。</p>
        )}
        {me?.isHost && snapshot.players.length < 2 ? <p className="muted">2人以上で開始できます。</p> : null}
      </section>
    </main>
  );
}
