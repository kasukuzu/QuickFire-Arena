import PlayerLobbyList from '../ui/players/PlayerLobbyList';
import MapVoteSelector from '../ui/maps/MapVoteSelector';
import WeaponSelector from '../ui/weapons/WeaponSelector';
import WeaponStatsPanel from '../ui/weapons/WeaponStatsPanel';
import type { MapSelectionId, RoomSnapshot, WeaponId } from '../game/types';

type Props = {
  snapshot: RoomSnapshot;
  playerId: string;
  onSelectWeapon: (weaponId: WeaponId) => void;
  onSelectMap: (mapId: MapSelectionId) => void;
  onToggleReady: () => void;
  onStart: () => void;
};

export default function LobbyScreen({ snapshot, playerId, onSelectWeapon, onSelectMap, onToggleReady, onStart }: Props) {
  const me = snapshot.players.find((player) => player.id === playerId);
  const allReady = snapshot.players.length >= 2 && snapshot.players.every((player) => player.isReady);
  const canStart = Boolean(me?.isHost && allReady);
  const canReady = Boolean(me?.weaponId && me.mapVote);

  if (!me) return null;

  return (
    <main className="screen panel-screen lobby-screen">
      <section className="panel lobby-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Room</p>
            <h1>{snapshot.roomId}</h1>
          </div>
          <span className="capacity">{snapshot.players.length}/{snapshot.maxPlayers}</span>
        </div>

        <div className="lobby-layout">
          <section className="lobby-section players-section">
            <h2>Players</h2>
            <PlayerLobbyList players={snapshot.players} />
          </section>

          <section className="lobby-section weapon-section">
            <h2>Weapon</h2>
            <div className="weapon-select-layout">
              <WeaponSelector selectedWeapon={me.weaponId} onSelect={onSelectWeapon} />
              <WeaponStatsPanel weaponId={me.weaponId} />
            </div>
          </section>

          <section className="lobby-section map-section">
            <h2>Map Vote</h2>
            <MapVoteSelector selectedMap={me.mapVote} onSelect={onSelectMap} />
          </section>
        </div>

        <div className="lobby-actions">
          <button className={me.isReady ? 'danger' : 'primary'} disabled={!canReady && !me.isReady} onClick={onToggleReady}>
            {me.isReady ? 'Cancel Ready' : '準備OK'}
          </button>
          {me.isHost ? (
            <button className="primary" disabled={!canStart} onClick={onStart}>
              Start Match
            </button>
          ) : (
            <p className="muted">ホストの開始を待っています。</p>
          )}
        </div>
        {!canReady ? <p className="muted">武器とマップを選択すると準備OKにできます。</p> : null}
        {me.isHost && !allReady ? <p className="muted">2人以上参加し、全員の準備完了後に開始できます。</p> : null}
      </section>
    </main>
  );
}
