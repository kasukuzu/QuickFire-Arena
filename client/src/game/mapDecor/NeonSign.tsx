import { Text } from '@react-three/drei';
type Vec3 = [number, number, number];
type Rot3 = [number, number, number];

type Props = {
  text: string;
  position: Vec3;
  rotation?: Rot3;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
};

export default function NeonSign({
  text,
  position,
  rotation = [0, 0, 0],
  width = 2.8,
  height = 0.68,
  color = '#7dd3fc',
  fontSize = 0.26
}: Props) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width, height, 0.035]} />
        <meshStandardMaterial color="#071014" emissive={color} emissiveIntensity={0.12} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, height * 0.5 - 0.035, 0.006]}>
        <boxGeometry args={[width, 0.035, 0.018]} />
        <meshBasicMaterial color={color} transparent opacity={0.62} />
      </mesh>
      <mesh position={[0, -height * 0.5 + 0.035, 0.006]}>
        <boxGeometry args={[width, 0.035, 0.018]} />
        <meshBasicMaterial color={color} transparent opacity={0.48} />
      </mesh>
      <Text position={[0, 0, 0.03]} fontSize={fontSize} color={color} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#020405">
        {text}
      </Text>
      <pointLight position={[0, 0, 0.25]} color={color} intensity={0.18} distance={4} />
    </group>
  );
}
