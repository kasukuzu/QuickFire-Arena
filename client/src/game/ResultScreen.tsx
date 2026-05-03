import { getActiveMapName } from './maps/mapDefinitions';
import type { RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  onLeave: () => void;
};

export default function ResultScreen({ snapshot, onLeave }: Props) {
  const ranking = [...snapshot.players].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  const winner = ranking.find((player) => player.id === snapshot.winnerId) ?? ranking[0];

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
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.kills}</td>
                <td>{player.deaths}</td>
                <td>{player.deaths === 0 ? player.kills.toFixed(1) : (player.kills / player.deaths).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="primary" onClick={onLeave}>Back to Title</button>
      </section>
    </main>
  );
}
