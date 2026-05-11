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
  background?: string;
  fontSize?: number;
};

export default function MapSign({
  text,
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  height = 0.62,
  color = '#f4f2ea',
  background = '#101416',
  fontSize = 0.24
}: Props) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[width + 0.14, height + 0.14, 0.035]} />
        <meshStandardMaterial color="#303636" roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh>
        <boxGeometry args={[width, height, 0.025]} />
        <meshStandardMaterial color={background} roughness={0.7} metalness={0.15} />
      </mesh>
      <Text position={[0, 0, 0.026]} fontSize={fontSize} color={color} anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#050607">
        {text}
      </Text>
    </group>
  );
}
