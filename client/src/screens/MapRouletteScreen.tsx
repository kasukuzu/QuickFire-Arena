import { getActiveMapName, getMapName } from '../game/maps/mapDefinitions';
import type { MapSelectionId, RoomSnapshot } from '../game/types';

type Props = {
  snapshot: RoomSnapshot;
};

export default function MapRouletteScreen({ snapshot }: Props) {
  const elapsed = snapshot.rouletteStartedAt ? snapshot.serverTime - snapshot.rouletteStartedAt : 0;
  const duration = snapshot.rouletteStartedAt && snapshot.rouletteEndsAt ? snapshot.rouletteEndsAt - snapshot.rouletteStartedAt : 3400;
  const progress = Math.min(1, Math.max(0, elapsed / duration));
  const candidates: MapSelectionId[] = snapshot.rouletteCandidates.length > 0 ? snapshot.rouletteCandidates : ['warehouse'];
  const randomWon = snapshot.rouletteResult === 'random';
  const rerollPhase = randomWon && progress > 0.55;
  const reelCandidates: MapSelectionId[] = rerollPhase ? ['warehouse', 'factory', 'rooftop'] : candidates;
  const reel = Array.from({ length: 18 }, (_, index) => reelCandidates[index % reelCandidates.length]);
  const offset = -progress * 62;

  return (
    <main className="screen panel-screen roulette-screen">
      <section className="panel roulette-panel">
        <p className="eyebrow">Map Roulette</p>
        <h1>マップ抽選中</h1>
        <div className="roulette-window">
          <div className="roulette-marker" />
          <div className="roulette-reel" style={{ transform: `translateX(${offset}%)` }}>
            {reel.map((mapId, index) => (
              <div className="roulette-card" key={`${mapId}-${index}`}>
                {getMapName(mapId)}
              </div>
            ))}
          </div>
        </div>
        {randomWon && !rerollPhase ? (
          <div className="roulette-result">
            <span>RANDOM SELECTED</span>
            <strong>マップを再抽選します</strong>
          </div>
        ) : rerollPhase ? (
          <div className="roulette-result">
            <span>MAP SELECTED</span>
            <strong>{getActiveMapName(snapshot.activeMapId)}</strong>
          </div>
        ) : (
          <div className="roulette-result">
            <span>当選</span>
            <strong>{snapshot.rouletteResult ? getMapName(snapshot.rouletteResult) : '抽選中'}</strong>
          </div>
        )}
        <p className="muted">最終マップ: {getActiveMapName(snapshot.activeMapId)}</p>
      </section>
    </main>
  );
}
