import { getActiveMapName } from './maps/mapDefinitions';
import { WEAPONS } from './weapons';
import type { PlayerState, RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  playerId: string;
  onReturnToLobby: () => void;
  onLeave: () => void;
};

export default function ResultScreen({ snapshot, playerId, onReturnToLobby, onLeave }: Props) {
  const ranking = [...snapshot.players].sort(comparePlayersByResult);
  const winner = ranking.find((player) => player.id === snapshot.winnerId) ?? ranking[0];
  const me = snapshot.players.find((player) => player.id === playerId);
  const canReturnToLobby = Boolean(me?.isHost);

  return (
    <main className="screen panel-screen">
      <section className="panel result-panel">
        <p className="eyebrow">Result</p>
        <h1>Winner: {winner?.name ?? 'No contest'}</h1>
        <p className="muted">Map: {getActiveMapName(snapshot.activeMapId)}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>K</th>
              <th>D</th>
              <th>K/D</th>
              <th>Damage</th>
              <th>Weapon</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, index) => (
              <tr key={player.id}>
                <td>{getRank(ranking, index)}</td>
                <td>{player.name}</td>
                <td>{player.kills}</td>
                <td>{player.deaths}</td>
                <td>{getKdDisplay(player)}</td>
                <td>{player.totalDamage}</td>
                <td>{player.weaponId ? WEAPONS[player.weaponId].name : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="result-actions">
          <button className="primary" disabled={!canReturnToLobby} onClick={onReturnToLobby}>
            ロビーに戻る
          </button>
          <button onClick={onLeave}>タイトルへ戻る</button>
        </div>
        {canReturnToLobby ? (
          <p className="muted">同じルームと参加者のまま、次のマッチ準備に戻れます。</p>
        ) : (
          <p className="muted">ホストがロビーに戻すのを待っています。</p>
        )}
      </section>
    </main>
  );
}

function comparePlayersByResult(a: PlayerState, b: PlayerState) {
  const kdDiff = getKdSortValue(b) - getKdSortValue(a);
  if (kdDiff !== 0) return kdDiff;
  return b.totalDamage - a.totalDamage;
}

function getKdSortValue(player: PlayerState) {
  if (player.deaths === 0) return player.kills === 0 ? 0 : player.kills + 1;
  return player.kills / player.deaths;
}

function getKdDisplay(player: PlayerState) {
  return player.deaths === 0 ? player.kills.toFixed(2) : (player.kills / player.deaths).toFixed(2);
}

function getRank(ranking: PlayerState[], index: number): number {
  if (index === 0) return 1;
  const current = ranking[index];
  const previous = ranking[index - 1];
  return getKdSortValue(current) === getKdSortValue(previous) && current.totalDamage === previous.totalDamage
    ? getRank(ranking, index - 1)
    : index + 1;
}
