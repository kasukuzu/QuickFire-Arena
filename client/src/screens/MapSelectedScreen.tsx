import { getActiveMapName, getMapName } from '../game/maps/mapDefinitions';
import type { RoomSnapshot } from '../game/types';

type Props = {
  snapshot: RoomSnapshot;
};

export default function MapSelectedScreen({ snapshot }: Props) {
  const randomWon = snapshot.rouletteResult === 'random';

  return (
    <main className={`screen panel-screen map-selected-screen map-selected-${snapshot.activeMapId}`}>
      <section className="panel selected-map-panel">
        <p className="eyebrow">{randomWon ? 'Random Resolved' : 'Map Selected'}</p>
        <h1>{getActiveMapName(snapshot.activeMapId)}</h1>
        {randomWon ? (
          <p className="muted">{getMapName('random')} が選ばれたため、最終マップを再抽選しました。</p>
        ) : (
          <p className="muted">このマップで試合を開始します。</p>
        )}
      </section>
    </main>
  );
}
