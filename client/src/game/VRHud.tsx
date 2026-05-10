import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { WEAPONS } from './weapons';
import type { PlayerState, RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  player: PlayerState;
};

export default function VRHud({ snapshot, player }: Props) {
  const rootRef = useRef<THREE.Group>(null);
  const remaining = snapshot.matchEndsAt ? Math.max(0, snapshot.matchEndsAt - snapshot.serverTime) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  const weapon = player.weaponId ? WEAPONS[player.weaponId] : null;
  const hpRatio = Math.max(0, Math.min(1, player.hp / 100));
  const hpColor = player.hp <= 20 ? '#ff4a3f' : player.hp <= 50 ? '#ffd34d' : '#42e184';
  const ammoColor = weapon && player.ammo === 0 ? '#ff4a3f' : '#f4f2ea';
  const reloadProgress = getReloadProgress(player, weapon, snapshot.serverTime);

  useFrame(({ camera }) => {
    const root = rootRef.current;
    if (!root) return;
    camera.getWorldPosition(root.position);
    camera.getWorldQuaternion(root.quaternion);
  });

  return (
    <group ref={rootRef}>
      <HpPanel position={[-0.78, -0.42, -1.75]} hp={player.hp} hpRatio={hpRatio} hpColor={hpColor} />
      <TimerPanel position={[0, 0.44, -1.75]} label={`${minutes}:${seconds}`} />
      <AmmoPanel
        position={[0.78, -0.42, -1.75]}
        weaponName={weapon?.name ?? '-'}
        ammo={`${player.ammo} / ${weapon?.magazineSize ?? '-'}`}
        ammoColor={ammoColor}
        reloadProgress={reloadProgress}
      />
    </group>
  );
}

function HpPanel({
  position,
  hp,
  hpRatio,
  hpColor
}: {
  position: [number, number, number];
  hp: number;
  hpRatio: number;
  hpColor: string;
}) {
  return (
    <group position={position}>
      <PanelBackground size={[0.52, 0.2]} />
      <Text position={[-0.21, 0.045, 0.01]} fontSize={0.045} color="#f4f2ea" anchorX="left" anchorY="middle">
        HP
      </Text>
      <Text position={[0.2, 0.045, 0.01]} fontSize={0.062} color={hpColor} anchorX="right" anchorY="middle">
        {hp}
      </Text>
      <mesh position={[0, -0.045, 0.01]}>
        <planeGeometry args={[0.39, 0.032]} />
        <meshBasicMaterial color="#151817" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh position={[-0.195 + hpRatio * 0.195, -0.045, 0.014]}>
        <planeGeometry args={[0.39 * hpRatio, 0.032]} />
        <meshBasicMaterial color={hpColor} transparent opacity={0.96} depthWrite={false} />
      </mesh>
    </group>
  );
}

function TimerPanel({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <PanelBackground size={[0.38, 0.14]} />
      <Text position={[0, 0, 0.01]} fontSize={0.075} color="#ffffff" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function AmmoPanel({
  position,
  weaponName,
  ammo,
  ammoColor,
  reloadProgress
}: {
  position: [number, number, number];
  weaponName: string;
  ammo: string;
  ammoColor: string;
  reloadProgress: number | null;
}) {
  return (
    <group position={position}>
      <PanelBackground size={[0.58, 0.22]} />
      <Text position={[-0.23, 0.055, 0.01]} fontSize={0.044} color="#d4ad58" anchorX="left" anchorY="middle">
        {weaponName}
      </Text>
      <Text position={[0.23, 0.045, 0.01]} fontSize={0.068} color={ammoColor} anchorX="right" anchorY="middle">
        {ammo}
      </Text>
      {reloadProgress !== null ? (
        <>
          <Text position={[-0.23, -0.052, 0.01]} fontSize={0.035} color="#ffd34d" anchorX="left" anchorY="middle">
            Reloading...
          </Text>
          <mesh position={[0.08, -0.052, 0.01]}>
            <planeGeometry args={[0.27, 0.022]} />
            <meshBasicMaterial color="#151817" transparent opacity={0.9} depthWrite={false} />
          </mesh>
          <mesh position={[-0.055 + reloadProgress * 0.135, -0.052, 0.014]}>
            <planeGeometry args={[0.27 * reloadProgress, 0.022]} />
            <meshBasicMaterial color="#d4ad58" transparent opacity={0.96} depthWrite={false} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function PanelBackground({ size }: { size: [number, number] }) {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial color="#07090b" transparent opacity={0.68} depthWrite={false} />
    </mesh>
  );
}

function getReloadProgress(player: PlayerState, weapon: typeof WEAPONS[keyof typeof WEAPONS] | null, serverTime: number) {
  if (!weapon || !player.reloadingUntil || player.reloadingUntil <= serverTime) return null;
  const startedAt = player.reloadingUntil - weapon.reloadMs;
  return Math.max(0, Math.min(1, (serverTime - startedAt) / weapon.reloadMs));
}
