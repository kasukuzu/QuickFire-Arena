import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  baseColor?: string;
  label?: string;
};

export default function MaintenanceRack({ position, rotation = [0, 0, 0], scale = 1, baseColor = '#596162', label = 'TOOLS' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.95, 0]}>
          <boxGeometry args={[0.12, 1.9, 0.12]} />
          <meshStandardMaterial color="#2d3333" roughness={0.58} metalness={0.36} />
        </mesh>
      ))}
      {[0.35, 0.95, 1.55].map((y) => (
        <mesh key={y} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[2.45, 0.12, 0.75]} />
          <meshStandardMaterial color={baseColor} roughness={0.68} metalness={0.24} />
        </mesh>
      ))}
      {[-0.72, 0, 0.72].map((x, index) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.62 + index * 0.28, -0.02]}>
          <boxGeometry args={[0.52, 0.34, 0.62]} />
          <meshStandardMaterial color={index === 1 ? '#8a3d35' : '#6d7677'} roughness={0.72} metalness={0.12} />
        </mesh>
      ))}
      <mesh position={[0, 1.78, -0.42]}>
        <boxGeometry args={[1.15, 0.28, 0.035]} />
        <meshStandardMaterial color="#101820" emissive="#7dd3fc" emissiveIntensity={0.18} />
      </mesh>
      <Text position={[0, 1.79, -0.45]} fontSize={0.13} color="#dbefff" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}
