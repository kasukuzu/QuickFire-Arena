import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  baseColor?: string;
  label?: string;
};

export default function ControlPanelUnit({ position, rotation = [0, 0, 0], scale = 1, baseColor = '#374141', label = 'CONTROL' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[1.25, 1.6, 0.55]} />
        <meshStandardMaterial color={baseColor} roughness={0.68} metalness={0.32} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.72, -0.12]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[1.15, 0.42, 0.18]} />
        <meshStandardMaterial color="#222928" roughness={0.62} metalness={0.36} />
      </mesh>
      <mesh position={[0, 1.75, -0.225]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.82, 0.24, 0.035]} />
        <meshStandardMaterial color="#0a1718" emissive="#60d6ff" emissiveIntensity={0.32} />
      </mesh>
      {[-0.36, -0.12, 0.12, 0.36].map((x, index) => (
        <mesh key={x} position={[x, 1.24, -0.305]}>
          <cylinderGeometry args={[0.055, 0.055, 0.025, 12]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#ff4a3d' : '#f5d15b'} emissive={index % 2 === 0 ? '#ff4a3d' : '#f5d15b'} emissiveIntensity={0.25} />
        </mesh>
      ))}
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.52, -0.31]}>
          <boxGeometry args={[0.18, 0.52, 0.035]} />
          <meshStandardMaterial color="#202827" roughness={0.55} metalness={0.36} />
        </mesh>
      ))}
      <Text position={[0, 0.98, -0.32]} fontSize={0.13} color="#f5d15b" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}
