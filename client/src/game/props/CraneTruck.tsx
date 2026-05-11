import { Text } from '@react-three/drei';

type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  baseColor?: string;
  label?: string;
};

export default function CraneTruck({ position, rotation = [0, 0, 0], scale = 1, baseColor = '#d6a529', label = 'MAINTENANCE' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[4.8, 1.1, 2.1]} />
        <meshStandardMaterial color={baseColor} roughness={0.58} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.7, 1.18, 0]}>
        <boxGeometry args={[2.35, 0.35, 1.75]} />
        <meshStandardMaterial color="#9b7421" roughness={0.6} metalness={0.16} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.55, 1.35, 0.15]}>
        <boxGeometry args={[1.35, 1.45, 1.55]} />
        <meshStandardMaterial color="#f0d06a" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[-1.58, 1.55, 0.94]}>
        <boxGeometry args={[0.78, 0.58, 0.035]} />
        <meshStandardMaterial color="#1a2730" roughness={0.22} metalness={0.08} transparent opacity={0.72} />
      </mesh>
      <mesh castShadow receiveShadow position={[-2.27, 1.12, 0.15]}>
        <boxGeometry args={[0.18, 0.42, 1.58]} />
        <meshStandardMaterial color="#212524" roughness={0.7} metalness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.9, 1.25, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.55]} />
        <meshStandardMaterial color="#8b2e2b" roughness={0.6} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.9, 2.15, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[4.85, 0.26, 0.32]} />
        <meshStandardMaterial color={baseColor} roughness={0.55} metalness={0.16} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.9, 2.0, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[4.15, 0.08, 0.08]} />
        <meshStandardMaterial color="#4d3d20" roughness={0.58} metalness={0.22} />
      </mesh>
      <mesh position={[3.85, 1.15, 0]}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshStandardMaterial color="#1b1d1d" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[3.85, 0.45, 0]}>
        <boxGeometry args={[0.8, 0.75, 0.8]} />
        <meshStandardMaterial color="#7b8587" roughness={0.72} metalness={0.16} />
      </mesh>
      <mesh castShadow receiveShadow position={[3.85, 0.93, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1b1d1d" roughness={0.5} metalness={0.45} />
      </mesh>
      {[[-1.85, -1.12], [0, -1.12], [1.75, -1.12], [-1.85, 1.12], [0, 1.12], [1.75, 1.12]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.32, 16]} />
          <meshStandardMaterial color="#171a1a" roughness={0.68} metalness={0.22} />
        </mesh>
      ))}
      {[[-2.85, -1.35], [2.6, -1.35], [-2.85, 1.35], [2.6, 1.35]].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0.28, z]}>
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[1.1, 0.14, 0.2]} />
            <meshStandardMaterial color="#343a38" roughness={0.64} metalness={0.32} />
          </mesh>
          <mesh castShadow receiveShadow position={[Math.sign(x) * 0.52, -0.16, 0]}>
            <boxGeometry args={[0.16, 0.32, 0.16]} />
            <meshStandardMaterial color="#252827" roughness={0.64} metalness={0.32} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.12, 0.88, 1.08]}>
        <boxGeometry args={[1.55, 0.26, 0.035]} />
        <meshStandardMaterial color="#19150d" emissive="#ffcf4d" emissiveIntensity={0.12} />
      </mesh>
      <Text position={[0.12, 0.9, 1.105]} fontSize={0.16} color="#171916" anchorX="center" anchorY="middle">
        {label}
      </Text>
      <Text position={[1.55, 0.65, 1.105]} fontSize={0.16} color="#171916" anchorX="center" anchorY="middle">
        CAUTION
      </Text>
    </group>
  );
}
