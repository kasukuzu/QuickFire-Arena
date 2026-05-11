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

export default function RooftopHVAC({ position, rotation = [0, 0, 0], scale = 1, color, baseColor, label = 'AC UNIT' }: Props) {
  const bodyColor = baseColor ?? color ?? '#7d8788';

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[3.8, 1.4, 2.2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.72} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[4.0, 0.18, 2.35]} />
        <meshStandardMaterial color="#5f696a" roughness={0.68} metalness={0.22} />
      </mesh>
      {[-1.15, 0, 1.15].map((x) => (
        <group key={x} position={[x, 1.62, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.09, 22]} />
            <meshStandardMaterial color="#2f3839" roughness={0.68} metalness={0.25} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.025, 8, 20]} />
            <meshStandardMaterial color="#111819" roughness={0.5} metalness={0.35} />
          </mesh>
          {[0, Math.PI / 3, -Math.PI / 3].map((angle) => (
            <mesh key={angle} rotation={[0, 0, angle]}>
              <boxGeometry args={[0.08, 0.75, 0.035]} />
              <meshStandardMaterial color="#111819" roughness={0.5} metalness={0.35} />
            </mesh>
          ))}
        </group>
      ))}
      {[-0.72, -0.36, 0, 0.36, 0.72].map((y) => (
        <mesh key={y} position={[0, 0.75 + y * 0.18, 1.13]}>
          <boxGeometry args={[3.55, 0.055, 0.055]} />
          <meshStandardMaterial color="#3f4a4b" roughness={0.6} metalness={0.25} />
        </mesh>
      ))}
      {[-1.65, 1.65].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.72, -1.18]}>
          <boxGeometry args={[0.08, 1.05, 0.16]} />
          <meshStandardMaterial color="#3f4a4b" roughness={0.6} metalness={0.25} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[2.24, 0.78, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 1.65, 14]} />
        <meshStandardMaterial color="#546062" roughness={0.58} metalness={0.36} />
      </mesh>
      <mesh castShadow receiveShadow position={[2.88, 0.78, -0.1]}>
        <boxGeometry args={[1.1, 0.48, 0.5]} />
        <meshStandardMaterial color="#657173" roughness={0.68} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.35, 0.08, -0.72]}>
        <boxGeometry args={[0.22, 0.16, 0.22]} />
        <meshStandardMaterial color="#3f4a4b" roughness={0.58} metalness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.35, 0.08, -0.72]}>
        <boxGeometry args={[0.22, 0.16, 0.22]} />
        <meshStandardMaterial color="#3f4a4b" roughness={0.58} metalness={0.28} />
      </mesh>
      <Text position={[-0.55, 0.28, 1.17]} fontSize={0.18} color="#dbefff" anchorX="center" anchorY="middle" outlineWidth={0.006} outlineColor="#102025">
        {label}
      </Text>
    </group>
  );
}
