import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { useCallback, useState } from 'react';
import GameAudio from './audio/GameAudio';
import BulletTracer, { type BulletTracerItem } from './BulletTracer';
import DamageNumbers from './effects/DamageNumbers';
import HealthPickups from './HealthPickups';
import HUD from './HUD';
import ImpactEffect, { type ImpactEffectItem } from './ImpactEffect';
import PlayerAvatar from './PlayerAvatar';
import PlayerController from './PlayerController';
import RemoteBulletTracers from './effects/RemoteBulletTracers';
import RemoteMuzzleFlashes from './effects/RemoteMuzzleFlashes';
import WeaponModel from './WeaponModel';
import GameMap from './maps/GameMap';
import type { ClientMessage, RoomSnapshot } from './types';

type Props = {
  playerId: string;
  snapshot: RoomSnapshot;
  send: (message: ClientMessage) => void;
  scoreboardOpen: boolean;
  onScoreboard: (open: boolean) => void;
};

export default function GameCanvas({ playerId, snapshot, send, scoreboardOpen, onScoreboard }: Props) {
  const me = snapshot.players.find((player) => player.id === playerId);
  const [tracers, setTracers] = useState<BulletTracerItem[]>([]);
  const [impacts, setImpacts] = useState<ImpactEffectItem[]>([]);
  const [weaponView, setWeaponView] = useState({
    ads: false,
    recoil: 0,
    firing: false,
    moving: false,
    crouching: false,
    shotPulse: 0
  });

  const addShotVisual = useCallback((tracer: Omit<BulletTracerItem, 'id' | 'createdAt'>, impact: Omit<ImpactEffectItem, 'id' | 'createdAt'>) => {
    const now = performance.now();
    const tracerItem = { ...tracer, id: now + Math.random(), createdAt: now };
    const impactItem = { ...impact, id: now + Math.random() + 1, createdAt: now };
    setTracers((current) => [...current, tracerItem]);
    setImpacts((current) => [...current, impactItem]);
    window.setTimeout(() => setTracers((current) => current.filter((item) => item.id !== tracerItem.id)), 90);
    window.setTimeout(() => setImpacts((current) => current.filter((item) => item.id !== impactItem.id)), 220);
  }, []);

  if (!me) return null;

  return (
    <main className="game-screen">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 180, position: [0, 2.5, 8] }}>
        <color attach="background" args={['#9db3bf']} />
        <ambientLight intensity={0.45} />
        <directionalLight castShadow position={[10, 18, 8]} intensity={1.5} shadow-mapSize={[2048, 2048]} />
        <Sky sunPosition={[20, 12, 10]} />
        <GameMap activeMapId={snapshot.activeMapId} />
        {snapshot.players.map((player) =>
          player.id === playerId ? null : <PlayerAvatar key={player.id} player={player} serverTime={snapshot.serverTime} />
        )}
        <HealthPickups pickups={snapshot.healthPickups} serverTime={snapshot.serverTime} />
        <DamageNumbers events={snapshot.damageEvents} players={snapshot.players} serverTime={snapshot.serverTime} />
        <RemoteBulletTracers events={snapshot.shotEvents} players={snapshot.players} localPlayerId={playerId} serverTime={snapshot.serverTime} />
        <RemoteMuzzleFlashes events={snapshot.shotEvents} players={snapshot.players} localPlayerId={playerId} serverTime={snapshot.serverTime} />
        <BulletTracer tracers={tracers} />
        <ImpactEffect impacts={impacts} />
        <WeaponModel
          weaponId={me.weaponId}
          ads={weaponView.ads}
          recoil={weaponView.recoil}
          moving={weaponView.moving}
          crouching={weaponView.crouching}
          firing={weaponView.firing}
          reloading={Boolean(me.reloadingUntil)}
          shotPulse={weaponView.shotPulse}
        />
        <PlayerController
          player={me}
          snapshot={snapshot}
          activeMapId={snapshot.activeMapId}
          send={send}
          onScoreboard={onScoreboard}
          onWeaponViewChange={setWeaponView}
          onShotVisual={addShotVisual}
        />
        <GameAudio snapshot={snapshot} localPlayerId={playerId} />
      </Canvas>
      <HUD snapshot={snapshot} player={me} scoreboardOpen={scoreboardOpen} ads={weaponView.ads} playerId={playerId} />
      <div className="lock-hint">Click viewport to lock mouse</div>
    </main>
  );
}
