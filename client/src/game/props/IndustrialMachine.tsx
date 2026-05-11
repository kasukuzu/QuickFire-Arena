type Vec3 = [number, number, number];

type Props = {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
};

export default function IndustrialMachine({ position, rotation = [0, 0, 0], scale = 1, color = '#5a524b' }: Props) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[3.4, 2.3, 2.6]} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.1, 2.55, -0.25]}>
        <boxGeometry args={[2.8, 0.5, 2.0]} />
        <meshStandardMaterial color="#3d3d3a" roughness={0.75} metalness={0.4} />
      </mesh>
      <mesh position={[1.72, 1.25, 0.15]}>
        <boxGeometry args={[0.08, 1.4, 1.2]} />
        <meshStandardMaterial color="#1a2020" emissive="#ff4a3d" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[-1.2, 0.55, 1.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 2.8, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[1.2, 0.55, -1.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 2.8, 14]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.62} metalness={0.35} />
      </mesh>
    </group>
  );
}
