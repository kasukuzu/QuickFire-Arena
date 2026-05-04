import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Props = {
  hp: number;
  y?: number;
};

export default function HealthBar({ hp, y = 2.2 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ratio = Math.max(0, Math.min(1, hp / 100));
  const color = ratio <= 0.2 ? '#e14436' : ratio <= 0.5 ? '#d6bc36' : '#42c45a';

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
    const distance = groupRef.current.getWorldPosition(new THREE.Vector3()).distanceTo(camera.position);
    const scale = THREE.MathUtils.clamp(distance / 14, 0.85, 1.35);
    groupRef.current.scale.setScalar(scale);
  });

  if (hp <= 0) return null;

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.05, 0.12, 0.035]} />
        <meshBasicMaterial color="#111514" transparent opacity={0.82} />
      </mesh>
      <mesh position={[-(1.0 - ratio) * 0.5, 0, 0.022]}>
        <boxGeometry args={[ratio, 0.075, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
