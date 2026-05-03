import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { HealthPickupState } from './types';

type Props = {
  pickup: HealthPickupState;
  serverTime: number;
};

export default function HealthPickup({ pickup, serverTime }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const age = serverTime - pickup.createdAt;
  const remaining = pickup.expiresAt - serverTime;
  const blinking = age >= 4000;
  const opacity = blinking ? (Math.sin(serverTime * 0.018) > 0 ? 0.25 : 1) : 1;
  const visible = remaining > 0;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += 0.035;
    group.position.y = pickup.y + Math.sin(clock.elapsedTime * 4 + pickup.x) * 0.16;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[pickup.x, pickup.y, pickup.z]}>
      <CrossPart size={[0.26, 0.82, 0.12]} opacity={opacity} />
      <CrossPart size={[0.82, 0.26, 0.12]} opacity={opacity} />
      <pointLight color="#48ff70" intensity={0.55 * opacity} distance={4} />
    </group>
  );
}

function CrossPart({ size, opacity }: { size: [number, number, number]; opacity: number }) {
  return (
    <mesh>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#35e65e" transparent opacity={opacity} />
    </mesh>
  );
}
