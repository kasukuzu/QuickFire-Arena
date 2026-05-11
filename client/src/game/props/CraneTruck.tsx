import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
};

export default function CraneTruck({ position, rotation = [0, 0, 0], scale = 1 }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[4.8, 1.1, 2.1]} />
        <meshStandardMaterial color="#d6a529" roughness={0.58} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.55, 1.35, 0.15]}>
        <boxGeometry args={[1.35, 1.45, 1.55]} />
        <meshStandardMaterial color="#f0d06a" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.9, 1.25, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.55]} />
        <meshStandardMaterial color="#8b2e2b" roughness={0.6} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.9, 2.15, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[4.6, 0.22, 0.28]} />
        <meshStandardMaterial color="#d6a529" roughness={0.55} metalness={0.16} />
      </mesh>
      <mesh position={[3.85, 1.15, 0]}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshStandardMaterial color="#1b1d1d" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[3.85, 0.45, 0]}>
        <boxGeometry args={[0.8, 0.75, 0.8]} />
        <meshStandardMaterial color="#7b8587" roughness={0.72} metalness={0.16} />
      </mesh>
      {[[-1.7, -1.12], [1.55, -1.12], [-1.7, 1.12], [1.55, 1.12]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.32, 16]} />
          <meshStandardMaterial color="#171a1a" roughness={0.68} metalness={0.22} />
        </mesh>
      ))}
      <Text position={[0.2, 1.15, 1.08]} fontSize={0.22} color="#171916" anchorX="center" anchorY="middle">
        MAINT
      </Text>
    </group>
  );
}
