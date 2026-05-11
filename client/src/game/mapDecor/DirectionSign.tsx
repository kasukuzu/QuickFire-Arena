import { Text } from '@react-three/drei';
type Vec3 = [number, number, number];
type Rot3 = [number, number, number];

type Props = {
  text: string;
  arrow?: 'left' | 'right' | 'up';
  position: Vec3;
  rotation?: Rot3;
  color?: string;
};

export default function DirectionSign({ text, arrow = 'right', position, rotation = [0, 0, 0], color = '#f5d15b' }: Props) {
  const arrowText = arrow === 'left' ? '<' : arrow === 'up' ? '^' : '>';

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.1, 0.46, 0.026]} />
        <meshStandardMaterial color="#121619" roughness={0.62} metalness={0.2} />
      </mesh>
      <Text position={[-0.75, 0, 0.03]} fontSize={0.24} color={color} anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020202">
        {arrowText}
      </Text>
      <Text position={[0.2, 0, 0.03]} fontSize={0.18} color="#f4f2ea" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020202">
        {text}
      </Text>
    </group>
  );
}
