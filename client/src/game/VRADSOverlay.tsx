import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { WEAPONS } from './weapons';
import type { WeaponId } from './types';

type Props = {
  weaponId: WeaponId;
  ads: boolean;
};

const BASE_FOV = 75;

export default function VRADSOverlay({ weaponId, ads }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const zoom = WEAPONS[weaponId].zoomMultiplier;

  useFrame(({ camera }) => {
    const perspective = camera as THREE.PerspectiveCamera;
    const targetFov = ads ? BASE_FOV / zoom : BASE_FOV;
    if ('fov' in perspective) {
      perspective.fov = THREE.MathUtils.lerp(perspective.fov, targetFov, 0.18);
      perspective.updateProjectionMatrix();
    }

    const group = groupRef.current;
    if (!group) return;
    const forward = new THREE.Vector3();
    const position = new THREE.Vector3();
    camera.getWorldDirection(forward);
    camera.getWorldPosition(position);
    group.position.copy(position).addScaledVector(forward, weaponId === 'sr' ? 1.35 : 1.05);
    group.quaternion.copy(camera.quaternion);
  });

  if (!ads) return null;

  return (
    <group ref={groupRef} renderOrder={20}>
      {weaponId === 'sr' ? <VRScope /> : <VRHolo />}
    </group>
  );
}

function VRHolo() {
  return (
    <group>
      <SightBar position={[-0.12, 0, 0]} size={[0.018, 0.22]} color="#050607" opacity={0.86} />
      <SightBar position={[0.12, 0, 0]} size={[0.018, 0.22]} color="#050607" opacity={0.86} />
      <SightBar position={[0, -0.1, 0]} size={[0.18, 0.018]} color="#050607" opacity={0.86} />
      <mesh position={[0, 0, 0.006]}>
        <circleGeometry args={[0.012, 20]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.95} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function VRScope() {
  return (
    <group>
      <mesh position={[0, 0, -0.008]}>
        <planeGeometry args={[1.7, 1.25]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.52} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.34, 0.018, 10, 72]} />
        <meshBasicMaterial color="#050607" transparent opacity={0.96} depthTest={false} depthWrite={false} />
      </mesh>
      <SightBar position={[0, 0, 0.008]} size={[0.62, 0.006]} color="#080808" opacity={0.9} />
      <SightBar position={[0, 0, 0.008]} size={[0.006, 0.62]} color="#080808" opacity={0.9} />
      <mesh position={[0, 0, 0.014]}>
        <circleGeometry args={[0.01, 18]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.95} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SightBar({
  position,
  size,
  color,
  opacity
}: {
  position: [number, number, number];
  size: [number, number];
  color: string;
  opacity: number;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
