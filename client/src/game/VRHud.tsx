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
  const groupRef = useRef<THREE.Group>(null);
  const remaining = snapshot.matchEndsAt ? Math.max(0, snapshot.matchEndsAt - snapshot.serverTime) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  const weapon = player.weaponId ? WEAPONS[player.weaponId] : null;
  const hpPercent = Math.max(0, Math.min(1, player.hp / 100));
  const hpColor = player.hp <= 20 ? '#ff4a3f' : player.hp <= 50 ? '#ffd34d' : '#42e184';
  const ammoColor = weapon && player.ammo === 0 ? '#ff4a3f' : '#f4f2ea';
  const reloadProgress = getReloadProgress(player, weapon, snapshot.serverTime);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) return;
    const forward = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    camera.getWorldDirection(forward);
    camera.getWorldPosition(cameraPosition);
    group.position
      .copy(cameraPosition)
      .addScaledVector(forward, 1.55)
      .add(new THREE.Vector3(0, -0.42, 0));
    group.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.1, 0.34]} />
        <meshBasicMaterial color="#07090b" transparent opacity={0.62} depthWrite={false} />
      </mesh>
      <Text position={[-0.44, 0.1, 0]} fontSize={0.052} color="#f4f2ea" anchorX="left" anchorY="middle">
        HP
      </Text>
      <Text position={[-0.27, 0.1, 0]} fontSize={0.07} color={hpColor} anchorX="left" anchorY="middle">
        {player.hp}
      </Text>
      <mesh position={[0.12, 0.1, 0]}>
        <planeGeometry args={[0.38, 0.035]} />
        <meshBasicMaterial color="#151817" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh position={[-0.07 + hpPercent * 0.19, 0.1, 0.004]}>
        <planeGeometry args={[0.38 * hpPercent, 0.035]} />
        <meshBasicMaterial color={hpColor} transparent opacity={0.95} depthWrite={false} />
      </mesh>

      <Text position={[-0.44, -0.02, 0]} fontSize={0.052} color="#d4ad58" anchorX="left" anchorY="middle">
        {weapon?.name ?? '-'}
      </Text>
      <Text position={[-0.18, -0.02, 0]} fontSize={0.07} color={ammoColor} anchorX="left" anchorY="middle">
        {player.ammo} / {weapon?.magazineSize ?? '-'}
      </Text>
      <Text position={[0.44, -0.02, 0]} fontSize={0.06} color="#ffffff" anchorX="right" anchorY="middle">
        {minutes}:{seconds}
      </Text>

      {reloadProgress !== null ? (
        <>
          <Text position={[-0.44, -0.13, 0]} fontSize={0.044} color="#ffd34d" anchorX="left" anchorY="middle">
            Reloading...
          </Text>
          <mesh position={[0.12, -0.13, 0]}>
            <planeGeometry args={[0.46, 0.026]} />
            <meshBasicMaterial color="#151817" transparent opacity={0.9} depthWrite={false} />
          </mesh>
          <mesh position={[-0.11 + reloadProgress * 0.23, -0.13, 0.004]}>
            <planeGeometry args={[0.46 * reloadProgress, 0.026]} />
            <meshBasicMaterial color="#d4ad58" transparent opacity={0.95} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <Text position={[-0.44, -0.13, 0]} fontSize={0.044} color="#cfd7d3" anchorX="left" anchorY="middle">
          K {player.kills} / D {player.deaths}
        </Text>
      )}
    </group>
  );
}

function getReloadProgress(player: PlayerState, weapon: typeof WEAPONS[keyof typeof WEAPONS] | null, serverTime: number) {
  if (!weapon || !player.reloadingUntil || player.reloadingUntil <= serverTime) return null;
  const startedAt = player.reloadingUntil - weapon.reloadMs;
  return Math.max(0, Math.min(1, (serverTime - startedAt) / weapon.reloadMs));
}
