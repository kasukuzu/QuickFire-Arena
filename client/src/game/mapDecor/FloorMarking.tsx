import { Text } from '@react-three/drei';
type Vec3 = [number, number, number];
type Rot3 = [number, number, number];

type Props = {
  text?: string;
  position: Vec3;
  rotation?: Rot3;
  width?: number;
  depth?: number;
  color?: string;
  opacity?: number;
};

export default function FloorMarking({
  text,
  position,
  rotation = [-Math.PI / 2, 0, 0],
  width = 4,
  depth = 0.12,
  color = '#f5d15b',
  opacity = 0.72
}: Props) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {text ? (
        <Text position={[0, 0.28, 0.002]} fontSize={0.32} color={color} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#101010">
          {text}
        </Text>
      ) : null}
    </group>
  );
}
