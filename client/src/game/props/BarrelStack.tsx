type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  colors?: string[];
};

export default function BarrelStack({ position, rotation = [0, 0, 0], colors = ['#8a3230', '#394247', '#725c34'] }: Props) {
  const barrels: Vec3[] = [
    [-0.48, 0.55, 0],
    [0.48, 0.55, 0],
    [0, 1.55, 0]
  ];
  return (
    <group position={position} rotation={rotation}>
      {barrels.map((barrel, index) => (
        <mesh key={index} castShadow receiveShadow position={barrel}>
          <cylinderGeometry args={[0.36, 0.36, 1.05, 14]} />
          <meshStandardMaterial color={colors[index % colors.length]} roughness={0.55} metalness={0.22} />
        </mesh>
      ))}
    </group>
  );
}
