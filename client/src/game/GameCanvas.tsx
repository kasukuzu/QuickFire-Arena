import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useCallback, useState } from 'react';
import BulletTracer, { type BulletTracerItem } from './BulletTracer';
import HUD from './HUD';
import ImpactEffect, { type ImpactEffectItem } from './ImpactEffect';
import Map from './Map';
import PlayerController from './PlayerController';
import WeaponModel from './WeaponModel';
import type { ClientMessage, PlayerState, RoomSnapshot } from './types';

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
  const [weaponView, setWeaponView] = useState({ ads: false, recoil: 0, firing: false, moving: false, shotPulse: 0 });

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
      <Canvas shadows camera={{ fov: 68, near: 0.1, far: 180, position: [0, 2.5, 8] }}>
        <color attach="background" args={['#9db3bf']} />
        <ambientLight intensity={0.45} />
        <directionalLight castShadow position={[10, 18, 8]} intensity={1.5} shadow-mapSize={[2048, 2048]} />
        <Sky sunPosition={[20, 12, 10]} />
        <Map />
        {snapshot.players.map((player) =>
          player.id === playerId ? null : <RemotePlayer key={player.id} player={player} />
        )}
        <BulletTracer tracers={tracers} />
        <ImpactEffect impacts={impacts} />
        <WeaponModel
          weaponId={me.weaponId}
          ads={weaponView.ads}
          recoil={weaponView.recoil}
          moving={weaponView.moving}
          firing={weaponView.firing}
          reloading={Boolean(me.reloadingUntil)}
          shotPulse={weaponView.shotPulse}
        />
        <PlayerController
          player={me}
          snapshot={snapshot}
          send={send}
          onScoreboard={onScoreboard}
          onWeaponViewChange={setWeaponView}
          onShotVisual={addShotVisual}
        />
      </Canvas>
      <HUD snapshot={snapshot} player={me} scoreboardOpen={scoreboardOpen} />
      <div className="lock-hint">Click viewport to lock mouse</div>
    </main>
  );
}

function RemotePlayer({ player }: { player: PlayerState }) {
  const color = player.alive ? '#c9554c' : '#2f3434';
  return (
    <group position={[player.position.x, player.position.y, player.position.z]} rotation={[0, player.rotationY, 0]}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.42, 0.9, 6, 12]} />
        <meshStandardMaterial color={color} transparent opacity={player.alive ? 1 : 0.35} />
      </mesh>
      <mesh castShadow position={[0, 1.55, -0.2]}>
        <boxGeometry args={[0.28, 0.18, 0.7]} />
        <meshStandardMaterial color="#242827" />
      </mesh>
      <BillboardText text={`${player.name} ${player.hp}`} position={[0, 2.1, 0]} />
    </group>
  );
}

function BillboardText({ text, position }: { text: string; position: [number, number, number] }) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'rgba(0,0,0,0.6)';
  context.fillRect(0, 0, 256, 64);
  context.fillStyle = '#ffffff';
  context.font = '24px sans-serif';
  context.textAlign = 'center';
  context.fillText(text, 128, 40);
  const texture = new THREE.CanvasTexture(canvas);
  return (
    <sprite position={position} scale={[2.3, 0.58, 1]}>
      <spriteMaterial map={texture} />
    </sprite>
  );
}
