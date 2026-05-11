import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
  baseColor?: string;
  label?: string;
};

export default function IndustrialMachine({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  baseColor,
  label = 'MACHINE 02'
}: Props) {
  const bodyColor = baseColor ?? color ?? '#5a524b';

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[3.4, 2.3, 2.6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.78} metalness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.1, 2.55, -0.25]}>
        <boxGeometry args={[2.8, 0.5, 2.0]} />
        <meshStandardMaterial color="#3d3d3a" roughness={0.75} metalness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.58, 1.2, 0]}>
        <boxGeometry args={[0.16, 1.85, 2.75]} />
        <meshStandardMaterial color="#2a2d2c" roughness={0.62} metalness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.58, 1.2, 0]}>
        <boxGeometry args={[0.16, 1.85, 2.75]} />
        <meshStandardMaterial color="#2a2d2c" roughness={0.62} metalness={0.45} />
      </mesh>
      {[-0.8, 0, 0.8].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 1.18, 1.34]}>
          <boxGeometry args={[0.08, 1.65, 0.08]} />
          <meshStandardMaterial color="#2b302f" roughness={0.65} metalness={0.45} />
        </mesh>
      ))}
      {[-0.52, 0, 0.52].map((y) => (
        <mesh key={y} castShadow receiveShadow position={[0, 1.22 + y, 1.38]}>
          <boxGeometry args={[3.0, 0.08, 0.08]} />
          <meshStandardMaterial color="#202524" roughness={0.65} metalness={0.45} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[1.88, 1.25, 0.15]}>
        <boxGeometry args={[0.42, 1.55, 1.25]} />
        <meshStandardMaterial color="#1a2020" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[2.095, 1.48, 0.15]}>
        <boxGeometry args={[0.035, 0.72, 0.82]} />
        <meshStandardMaterial color="#0c1414" emissive="#ff4a3d" emissiveIntensity={0.28} />
      </mesh>
      {[0.45, 0.15, -0.15].map((z, index) => (
        <mesh key={z} position={[2.12, 1.6 - index * 0.24, z]}>
          <boxGeometry args={[0.04, 0.08, 0.08]} />
          <meshStandardMaterial color={index === 0 ? '#4cff8f' : '#ffd15a'} emissive={index === 0 ? '#4cff8f' : '#ffb22e'} emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[-1.2, 0.55, 1.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 2.8, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[1.2, 0.55, -1.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 2.8, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.75, 2.98, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 2.1, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.6} metalness={0.38} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.9, 2.95, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 12]} />
        <meshStandardMaterial color="#9a552e" roughness={0.58} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.1, 0.18, -0.9]}>
        <boxGeometry args={[0.42, 0.36, 0.42]} />
        <meshStandardMaterial color="#242827" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.1, 0.18, -0.9]}>
        <boxGeometry args={[0.42, 0.36, 0.42]} />
        <meshStandardMaterial color="#242827" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 1.43]}>
        <boxGeometry args={[1.55, 0.22, 0.035]} />
        <meshStandardMaterial color="#17110d" emissive="#ffcf4d" emissiveIntensity={0.16} />
      </mesh>
      <Text position={[0, 1.88, 1.43]} fontSize={0.18} color="#f5d15b" anchorX="center" anchorY="middle" outlineWidth={0.006} outlineColor="#120907">
        {label}
      </Text>
      <Text position={[0, 0.55, 1.47]} fontSize={0.12} color="#17110d" anchorX="center" anchorY="middle">
        DANGER
      </Text>
    </group>
  );
}
