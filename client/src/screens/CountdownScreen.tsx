import { getActiveMapName } from '../game/maps/mapDefinitions';
import type { RoomSnapshot } from '../game/types';

type Props = {
  snapshot: RoomSnapshot;
};

export default function CountdownScreen({ snapshot }: Props) {
  const elapsed = snapshot.countdownStartedAt ? snapshot.serverTime - snapshot.countdownStartedAt : 0;
  const remaining = Math.max(0, 3000 - elapsed);
  const label = elapsed >= 3000 ? 'START' : Math.max(1, Math.ceil(remaining / 1000)).toString();

  return (
    <main className={`screen panel-screen countdown-screen map-selected-${snapshot.activeMapId}`}>
      <section className="panel countdown-panel">
        <p className="eyebrow">Match Starts</p>
        <div className="countdown-number">{label}</div>
        <p className="muted">{getActiveMapName(snapshot.activeMapId)}</p>
      </section>
    </main>
  );
}
