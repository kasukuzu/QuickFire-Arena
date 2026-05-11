type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
};

export default function WarehouseCrate({ position, rotation = [0, 0, 0], scale = 1, color = '#8a6b43' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.05, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[1.28, 0.08, 1.28]} />
        <meshStandardMaterial color="#5b4228" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <boxGeometry args={[1.28, 0.09, 0.08]} />
        <meshStandardMaterial color="#5b4228" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, -0.62]}>
        <boxGeometry args={[1.28, 0.09, 0.08]} />
        <meshStandardMaterial color="#5b4228" roughness={0.8} />
      </mesh>
    </group>
  );
}
