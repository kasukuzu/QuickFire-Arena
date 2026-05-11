type Vec3 = [number, number, number];
type Rot3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Rot3;
  width?: number;
  count?: number;
};

export default function WarningStripe({ position, rotation = [-Math.PI / 2, 0, 0], width = 3.2, count = 7 }: Props) {
  const segmentWidth = width / count;
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[-width * 0.5 + segmentWidth * (index + 0.5), 0, 0]} rotation={[0, 0, index % 2 === 0 ? 0.55 : -0.55]}>
          <planeGeometry args={[segmentWidth * 0.9, 0.22]} />
          <meshBasicMaterial color={index % 2 === 0 ? '#d4ad32' : '#111111'} transparent opacity={0.86} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
