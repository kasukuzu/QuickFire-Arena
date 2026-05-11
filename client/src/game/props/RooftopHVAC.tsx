type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
};

export default function RooftopHVAC({ position, rotation = [0, 0, 0], scale = 1, color = '#7d8788' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[3.8, 1.4, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.18} />
      </mesh>
      {[-1.15, 0, 1.15].map((x) => (
        <mesh key={x} position={[x, 1.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 18]} />
          <meshStandardMaterial color="#3c4546" roughness={0.68} metalness={0.25} />
        </mesh>
      ))}
      {[-0.72, 0, 0.72].map((z) => (
        <mesh key={z} position={[0, 0.75, 1.12 + z * 0.04]}>
          <boxGeometry args={[3.6, 0.08, 0.04]} />
          <meshStandardMaterial color="#4e595a" roughness={0.6} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
