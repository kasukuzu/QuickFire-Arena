import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
  label?: string;
};

export default function ShippingContainer({ position, rotation = [0, 0, 0], scale = 1, color = '#2f5f9f', label = 'QF-2048' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5.8, 2.45, 2.25]} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.18} />
      </mesh>
      {[-2.55, -1.75, -0.95, -0.15, 0.65, 1.45, 2.25].map((x) => (
        <mesh key={x} position={[x, 0.02, 1.14]}>
          <boxGeometry args={[0.08, 2.25, 0.045]} />
          <meshStandardMaterial color="#182024" roughness={0.75} metalness={0.2} />
        </mesh>
      ))}
      {[-0.82, 0.82].map((z) => (
        <mesh key={z} position={[0, 1.27, z]}>
          <boxGeometry args={[5.85, 0.08, 0.08]} />
          <meshStandardMaterial color="#111619" roughness={0.7} metalness={0.25} />
        </mesh>
      ))}
      <Text position={[0.8, 0.55, 1.18]} fontSize={0.34} color="#eef2e8" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#111">
        {label}
      </Text>
      <Text position={[-1.95, -0.72, 1.18]} fontSize={0.18} color="#f5d15b" anchorX="center" anchorY="middle">
        CAUTION
      </Text>
    </group>
  );
}
