export default function Map() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[38, 0.1, 38]} />
        <meshStandardMaterial color="#59615a" />
      </mesh>

      <Wall position={[0, 2, -19]} size={[38, 4, 1]} />
      <Wall position={[0, 2, 19]} size={[38, 4, 1]} />
      <Wall position={[-19, 2, 0]} size={[1, 4, 38]} />
      <Wall position={[19, 2, 0]} size={[1, 4, 38]} />

      <Cover position={[0, 1.25, 0]} size={[4, 2.5, 4]} color="#747a6c" />
      <Cover position={[0, 1, -7]} size={[8, 2, 1.4]} color="#697270" />
      <Cover position={[0, 1, 7]} size={[8, 2, 1.4]} color="#697270" />
      <Cover position={[-7, 1, 0]} size={[1.4, 2, 8]} color="#697270" />
      <Cover position={[7, 1, 0]} size={[1.4, 2, 8]} color="#697270" />

      <Cover position={[-11, 0.75, 0]} size={[6, 1.5, 9]} color="#626f7c" />
      <Cover position={[11, 0.75, 0]} size={[6, 1.5, 9]} color="#626f7c" />
      <Cover position={[-11, 2.1, -3.8]} size={[5, 1.2, 1]} color="#53606c" />
      <Cover position={[11, 2.1, 3.8]} size={[5, 1.2, 1]} color="#53606c" />
    </group>
  );
}

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return <Cover position={position} size={size} color="#4b4f4c" />;
}

function Cover({
  position,
  size,
  color
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
