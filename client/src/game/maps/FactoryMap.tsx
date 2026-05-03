function Box({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.82} metalness={0.18} />
    </mesh>
  );
}

export default function FactoryMap() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[38, 0.1, 38]} />
        <meshStandardMaterial color="#504b45" roughness={0.92} />
      </mesh>
      <Box position={[0, 3.5, -19]} size={[38, 7, 1]} color="#3d3834" />
      <Box position={[0, 3.5, 19]} size={[38, 7, 1]} color="#3d3834" />
      <Box position={[-19, 3.5, 0]} size={[1, 7, 38]} color="#363330" />
      <Box position={[19, 3.5, 0]} size={[1, 7, 38]} color="#363330" />
      <Box position={[0, 7.1, 0]} size={[38, 0.35, 38]} color="#2b2c2b" />

      <Box position={[-2.4, 1.65, 0]} size={[5.2, 3.3, 4.6]} color="#5a524b" />
      <Box position={[3.7, 1.45, -2.1]} size={[3.8, 2.9, 3.2]} color="#6d4b37" />
      <Box position={[2.7, 1.55, 3.8]} size={[2.6, 3.1, 2.6]} color="#763f2d" />
      <Box position={[-3.8, 0.7, 5.2]} size={[3.4, 1.4, 1.2]} color="#4b4d49" />
      <Box position={[0, 0.65, -8.5]} size={[11, 1.3, 1.4]} color="#4c4d4a" />
      <Box position={[0, 0.65, 8.5]} size={[11, 1.3, 1.4]} color="#4c4d4a" />
      <Box position={[-12, 0.8, -3.5]} size={[5.8, 1.6, 6.6]} color="#584237" />
      <Box position={[12, 0.8, 3.5]} size={[5.8, 1.6, 6.6]} color="#584237" />
      <Box position={[-12, 1.95, -6.9]} size={[5.8, 0.9, 0.25]} color="#9a552e" />
      <Box position={[12, 1.95, 6.9]} size={[5.8, 0.9, 0.25]} color="#9a552e" />
      <Box position={[-12, 2.05, -6.4]} size={[4.8, 1.1, 0.35]} color="#5a3c2b" />
      <Box position={[12, 2.05, 6.4]} size={[4.8, 1.1, 0.35]} color="#5a3c2b" />

      {[-13.5, 13.5].map((x) =>
        [-12, 12].map((z) => <Box key={`${x}-${z}`} position={[x, 1.05, z]} size={[2.7, 2.1, 2.2]} color="#7a4a2c" />)
      )}
      <Box position={[-7, 1.4, -13.6]} size={[4.2, 2.8, 0.6]} color="#5b4030" />
      <Box position={[7, 1.4, 13.6]} size={[4.2, 2.8, 0.6]} color="#5b4030" />
      <Box position={[-15.5, 1.35, 5]} size={[0.6, 2.7, 3.8]} color="#604433" />
      <Box position={[15.5, 1.35, -5]} size={[0.6, 2.7, 3.8]} color="#604433" />
      <Box position={[-15.2, 1.45, 5.5]} size={[1.2, 2.9, 8]} color="#67442e" />
      <Box position={[15.2, 1.45, -5.5]} size={[1.2, 2.9, 8]} color="#67442e" />
      <Box position={[-7.5, 0.95, 2.8]} size={[2.4, 1.9, 1.4]} color="#675043" />
      <Box position={[7.5, 0.95, -2.8]} size={[2.4, 1.9, 1.4]} color="#675043" />
      <Box position={[-9.5, 0.55, -10]} size={[2.4, 1.1, 1.2]} color="#7b4d31" />
      <Box position={[9.5, 0.55, 10]} size={[2.4, 1.1, 1.2]} color="#7b4d31" />
      <Box position={[0, 6.2, -5]} size={[34, 0.45, 0.45]} color="#423d39" />
      <Box position={[0, 6.2, 5]} size={[34, 0.45, 0.45]} color="#423d39" />
      <Box position={[-7, 6.35, 0]} size={[0.38, 0.38, 32]} color="#5f3f2d" />
      <Box position={[7, 6.35, 0]} size={[0.38, 0.38, 32]} color="#5f3f2d" />
      <Box position={[-5.8, 2.2, 0]} size={[0.32, 0.32, 8]} color="#7a4a2c" />
      <Box position={[6.2, 2.35, -2]} size={[0.32, 0.32, 8]} color="#7a4a2c" />
      <Box position={[0, 0.03, -11.8]} size={[12, 0.04, 0.2]} color="#c7922f" />
      <Box position={[0, 0.035, -11.35]} size={[12, 0.04, 0.2]} color="#1b1a18" />
      <Box position={[0, 0.03, 11.8]} size={[12, 0.04, 0.2]} color="#c7922f" />
      <Box position={[0, 0.035, 11.35]} size={[12, 0.04, 0.2]} color="#1b1a18" />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6.5, 0]} intensity={1.25} color="#ffd7a0" distance={22} />
      <pointLight position={[-12, 5.8, -10]} intensity={0.7} color="#ff8a52" distance={12} />
      <pointLight position={[12, 5.8, 10]} intensity={0.7} color="#ff8a52" distance={12} />
    </group>
  );
}
