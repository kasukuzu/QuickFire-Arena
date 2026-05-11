import DirectionSign from '../mapDecor/DirectionSign';
import FloorMarking from '../mapDecor/FloorMarking';
import MapSign from '../mapDecor/MapSign';
import NeonSign from '../mapDecor/NeonSign';
import WarningStripe from '../mapDecor/WarningStripe';
import BarrelStack from '../props/BarrelStack';
import IndustrialMachine from '../props/IndustrialMachine';
import PalletStack from '../props/PalletStack';
import SafetyBarrier from '../props/SafetyBarrier';
import WarehouseCrate from '../props/WarehouseCrate';

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
        <boxGeometry args={[46, 0.1, 46]} />
        <meshStandardMaterial color="#504b45" roughness={0.92} />
      </mesh>
      <Box position={[0, 3.5, -23]} size={[46, 7, 1]} color="#3d3834" />
      <Box position={[0, 3.5, 23]} size={[46, 7, 1]} color="#3d3834" />
      <Box position={[-23, 3.5, 0]} size={[1, 7, 46]} color="#363330" />
      <Box position={[23, 3.5, 0]} size={[1, 7, 46]} color="#363330" />
      <Box position={[0, 7.1, 0]} size={[46, 0.35, 46]} color="#2b2c2b" />

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
      <Box position={[-18.5, 1.35, -2]} size={[3.8, 2.7, 5.8]} color="#6b4a34" />
      <Box position={[18.5, 1.35, 2]} size={[3.8, 2.7, 5.8]} color="#5d5147" />
      <Box position={[-3, 1.25, -18]} size={[7.5, 2.5, 1.4]} color="#6c422e" />
      <Box position={[3, 1.25, 18]} size={[7.5, 2.5, 1.4]} color="#6c422e" />
      <Box position={[-18.5, 2.9, -6.2]} size={[4, 0.35, 0.35]} color="#9a552e" />
      <Box position={[18.5, 2.9, 6.2]} size={[4, 0.35, 0.35]} color="#9a552e" />
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
      <FactoryProps />
      <FactoryDecor />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6.5, 0]} intensity={1.25} color="#ffd7a0" distance={22} />
      <pointLight position={[-12, 5.8, -10]} intensity={0.7} color="#ff8a52" distance={12} />
      <pointLight position={[12, 5.8, 10]} intensity={0.7} color="#ff8a52" distance={12} />
    </group>
  );
}

function FactoryProps() {
  return (
    <group>
      <IndustrialMachine position={[0.5, 0, -14.5]} rotation={[0, 0.05, 0]} scale={1.15} color="#554a42" />
      <IndustrialMachine position={[-17.8, 0, 9.2]} rotation={[0, Math.PI / 2, 0]} scale={0.9} color="#684733" />
      <BarrelStack position={[15.5, 0, -12.8]} colors={['#7b4d31', '#8a3230', '#394247']} />
      <BarrelStack position={[-15.6, 0, -7.8]} colors={['#394247', '#7b4d31', '#8a3230']} />
      <WarehouseCrate position={[-5.5, 0.55, 12.2]} color="#6b4a34" />
      <WarehouseCrate position={[-4.3, 0.55, 12.5]} color="#584237" />
      <WarehouseCrate position={[16.6, 0.55, 9.5]} color="#675043" />
      <PalletStack position={[3.8, 0.22, -12.7]} rotation={[0, 0.2, 0]} />
      <SafetyBarrier position={[-6.4, 0, -8.9]} rotation={[0, 0.15, 0]} />
      <SafetyBarrier position={[6.4, 0, 8.9]} rotation={[0, Math.PI + 0.15, 0]} />
      <mesh castShadow receiveShadow position={[11.8, 1.7, -12.2]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.38, 3.4, 0.38]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.7} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[13.2, 1.7, -12.2]} rotation={[0, 0, -0.26]}>
        <boxGeometry args={[0.38, 3.4, 0.38]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.7} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[12.5, 3.1, -12.2]}>
        <boxGeometry args={[2.4, 0.28, 0.28]} />
        <meshStandardMaterial color="#5f3f2d" roughness={0.7} metalness={0.35} />
      </mesh>
    </group>
  );
}

function FactoryDecor() {
  return (
    <group>
      <NeonSign text="FACTORY" position={[0, 3.1, -22.45]} rotation={[0, 0, 0]} width={3.6} color="#ff8a52" fontSize={0.34} />
      <MapSign text="MACHINE AREA" position={[-2.4, 3.55, -2.34]} rotation={[0, 0, 0]} width={3.1} color="#ffcf4d" background="#17110d" />
      <MapSign text="CONTROL ROOM" position={[22.45, 2.65, -8]} rotation={[0, -Math.PI / 2, 0]} width={3.1} color="#f4f2ea" />
      <MapSign text="PIPELINE" position={[-22.45, 2.65, 8]} rotation={[0, Math.PI / 2, 0]} width={2.6} color="#ff8a52" background="#1b1110" />
      <NeonSign text="HIGH VOLTAGE" position={[-12, 2.85, -6.72]} rotation={[0, 0, 0]} width={3} color="#ff4a3d" fontSize={0.22} />
      <MapSign text="SECTOR 01" position={[-18.5, 2.95, -4.95]} rotation={[0, 0, 0]} width={2.2} color="#d9d0bd" background="#221913" />
      <MapSign text="SECTOR 02" position={[18.5, 2.95, 4.95]} rotation={[0, Math.PI, 0]} width={2.2} color="#d9d0bd" background="#221913" />
      <DirectionSign text="CATWALK" arrow="up" position={[-9, 2.25, -22.45]} rotation={[0, 0, 0]} color="#ff8a52" />
      <DirectionSign text="SERVICE LANE" arrow="right" position={[22.45, 2.1, 6]} rotation={[0, -Math.PI / 2, 0]} color="#ffcf4d" />
      <MapSign text="DANGER" position={[0, 1.85, 22.45]} rotation={[0, Math.PI, 0]} width={2.2} color="#ff4a3d" background="#190909" />
      <FloorMarking text="MACHINE" position={[0, 0.04, -3.8]} width={5.5} depth={0.12} color="#ff8a52" opacity={0.52} />
      <FloorMarking text="PIPE 02" position={[13.8, 0.04, -9.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} width={4.3} depth={0.1} color="#d9d0bd" opacity={0.5} />
      <WarningStripe position={[-4.5, 0.06, -8.8]} width={4.2} />
      <WarningStripe position={[4.5, 0.06, 8.8]} rotation={[-Math.PI / 2, 0, Math.PI]} width={4.2} />
      <pointLight position={[0, 3.4, -21.8]} color="#ff8a52" intensity={0.32} distance={8} />
      <pointLight position={[-12, 3.1, -6.2]} color="#ff4a3d" intensity={0.28} distance={6} />
    </group>
  );
}
