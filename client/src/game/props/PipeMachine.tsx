import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  baseColor?: string;
  label?: string;
};

export default function PipeMachine({ position, rotation = [0, 0, 0], scale = 1, baseColor = '#684733', label = 'PIPELINE' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[3.2, 1.5, 1.15]} />
        <meshStandardMaterial color={baseColor} roughness={0.78} metalness={0.24} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 2.2, 14]} />
          <meshStandardMaterial color="#8c5530" roughness={0.6} metalness={0.36} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 1.98, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 3.45, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.58} metalness={0.38} />
      </mesh>
      {[-1.42, 1.42].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 1.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.045, 8, 18]} />
          <meshStandardMaterial color="#2a2d2c" roughness={0.55} metalness={0.4} />
        </mesh>
      ))}
      {[[-1.45, 0.2], [1.45, 0.2], [-1.45, -0.2], [1.45, -0.2]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.18, z]}>
          <boxGeometry args={[0.22, 0.36, 0.22]} />
          <meshStandardMaterial color="#262b2a" roughness={0.62} metalness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 0.65, -0.6]}>
        <boxGeometry args={[1.25, 0.28, 0.035]} />
        <meshStandardMaterial color="#1b1110" emissive="#ff4a3d" emissiveIntensity={0.14} />
      </mesh>
      <Text position={[0, 0.66, -0.635]} fontSize={0.13} color="#ffcf4d" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}
