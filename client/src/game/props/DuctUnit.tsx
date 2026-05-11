import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  baseColor?: string;
  label?: string;
};

export default function DuctUnit({ position, rotation = [0, 0, 0], scale = 1, baseColor = '#6f7a7b', label = 'DUCT 02' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[3.6, 1.3, 1.05]} />
        <meshStandardMaterial color={baseColor} roughness={0.72} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[-2.15, 0.65, 0]}>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial color="#596566" roughness={0.72} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[2.15, 0.65, 0]}>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial color="#596566" roughness={0.72} metalness={0.24} />
      </mesh>
      {[-1.25, -0.62, 0, 0.62, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.66, -0.55]}>
          <boxGeometry args={[0.08, 0.95, 0.045]} />
          <meshStandardMaterial color="#3f4a4b" roughness={0.6} metalness={0.28} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[2.6, 0.22, 0.82]} />
        <meshStandardMaterial color="#50595a" roughness={0.68} metalness={0.26} />
      </mesh>
      <Text position={[0, 0.18, -0.58]} fontSize={0.14} color="#dbefff" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}
