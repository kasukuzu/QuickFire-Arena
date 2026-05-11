type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
};

export default function SafetyBarrier({ position, rotation = [0, 0, 0], scale = 1 }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.2, 0.2, 0.16]} />
        <meshStandardMaterial color="#e5b638" roughness={0.55} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.2, 0.16, 0.14]} />
        <meshStandardMaterial color="#161616" roughness={0.6} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.16, 0.9, 0.16]} />
          <meshStandardMaterial color="#d8a632" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
