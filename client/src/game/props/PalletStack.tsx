type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
};

export default function PalletStack({ position, rotation = [0, 0, 0], scale = 1 }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[0, 0.18, 0.36].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.08, 1.35]} />
            <meshStandardMaterial color="#7b6847" roughness={0.82} />
          </mesh>
          {[-0.7, 0, 0.7].map((x) => (
            <mesh key={x} position={[x, -0.08, 0]}>
              <boxGeometry args={[0.18, 0.12, 1.35]} />
              <meshStandardMaterial color="#5d4b31" roughness={0.86} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
