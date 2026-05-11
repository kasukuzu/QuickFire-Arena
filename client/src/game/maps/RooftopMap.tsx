import DirectionSign from '../mapDecor/DirectionSign';
import FloorMarking from '../mapDecor/FloorMarking';
import MapSign from '../mapDecor/MapSign';
import NeonSign from '../mapDecor/NeonSign';
import WarningStripe from '../mapDecor/WarningStripe';

function Box({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} />
    </mesh>
  );
}

export default function RooftopMap() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[46, 0.1, 46]} />
        <meshStandardMaterial color="#777d7d" roughness={0.88} />
      </mesh>
      <Box position={[0, 1.7, -23]} size={[46, 3.4, 1]} color="#596162" />
      <Box position={[0, 1.7, 23]} size={[46, 3.4, 1]} color="#596162" />
      <Box position={[-23, 1.7, 0]} size={[1, 3.4, 46]} color="#535b5c" />
      <Box position={[23, 1.7, 0]} size={[1, 3.4, 46]} color="#535b5c" />

      <Box position={[0, 1.45, 0]} size={[5.8, 2.9, 4.2]} color="#6f7778" />
      <Box position={[-6.2, 0.95, -3.2]} size={[4.8, 1.9, 2.3]} color="#687172" />
      <Box position={[6.4, 0.95, 3.2]} size={[4.8, 1.9, 2.3]} color="#687172" />
      <Box position={[10, 1.55, -8]} size={[3.4, 3.1, 3.4]} color="#6e7d83" />
      <Box position={[-10, 1.25, 8]} size={[3.6, 2.5, 3.6]} color="#5f676b" />
      <Box position={[-8.2, 0.75, -8]} size={[3.6, 1.5, 2]} color="#737f81" />
      <Box position={[8.2, 0.75, 8]} size={[3.6, 1.5, 2]} color="#737f81" />
      <Box position={[0, 0.65, -9.8]} size={[10, 1.3, 0.8]} color="#656c6b" />
      <Box position={[0, 0.65, 9.8]} size={[10, 1.3, 0.8]} color="#656c6b" />
      <Box position={[-14, 0.85, 0]} size={[1.5, 1.7, 7.5]} color="#7b8587" />
      <Box position={[14, 0.85, 0]} size={[1.5, 1.7, 7.5]} color="#7b8587" />
      <Box position={[-13.5, 1.05, -12.5]} size={[3, 2.1, 1.5]} color="#727b7c" />
      <Box position={[13.5, 1.05, -12.5]} size={[3, 2.1, 1.5]} color="#727b7c" />
      <Box position={[-13.5, 1.05, 12.5]} size={[3, 2.1, 1.5]} color="#727b7c" />
      <Box position={[13.5, 1.05, 12.5]} size={[3, 2.1, 1.5]} color="#727b7c" />
      <Box position={[-5, 1, -14.5]} size={[4.4, 2, 1.5]} color="#7d8788" />
      <Box position={[5, 1, 14.5]} size={[4.4, 2, 1.5]} color="#7d8788" />
      <Box position={[-15.4, 1.2, -4]} size={[1.3, 2.4, 4]} color="#6a7374" />
      <Box position={[15.4, 1.2, 4]} size={[1.3, 2.4, 4]} color="#6a7374" />

      <Box position={[-10, 3.0, 8]} size={[0.18, 3.8, 0.18]} color="#333a3b" />
      <Box position={[-10, 4.9, 8]} size={[2.5, 0.1, 0.1]} color="#333a3b" />
      <Box position={[6, 0.45, -12]} size={[4.5, 0.9, 0.6]} color="#879092" />
      <Box position={[-6, 0.45, 12]} size={[4.5, 0.9, 0.6]} color="#879092" />
      <Box position={[-3.6, 1.85, 0]} size={[0.22, 0.22, 8]} color="#546062" />
      <Box position={[3.8, 1.75, 0]} size={[0.22, 0.22, 8]} color="#546062" />
      <Box position={[0, 2.95, -2.4]} size={[5.8, 0.3, 0.35]} color="#50595a" />
      <Box position={[0, 2.95, 2.4]} size={[5.8, 0.3, 0.35]} color="#50595a" />
      <Box position={[-12, 1.25, -18]} size={[6, 2.5, 2.5]} color="#6d7677" />
      <Box position={[12, 1.25, 18]} size={[6, 2.5, 2.5]} color="#6d7677" />
      <Box position={[-19, 1.4, 8]} size={[3.2, 2.8, 6]} color="#637074" />
      <Box position={[19, 1.05, -8]} size={[3.2, 2.1, 6]} color="#7c8788" />
      <Box position={[0, 0.75, -18]} size={[6, 1.5, 1.2]} color="#879092" />
      <Box position={[0, 0.75, 18]} size={[6, 1.5, 1.2]} color="#879092" />
      <RooftopDecor />

      <ambientLight intensity={0.78} />
      <directionalLight position={[8, 14, 5]} intensity={1.65} color="#fff4d7" />
      <pointLight position={[0, 5, 0]} intensity={0.45} color="#dbefff" distance={24} />
    </group>
  );
}

function RooftopDecor() {
  return (
    <group>
      <NeonSign text="ROOFTOP" position={[0, 2.55, -22.45]} rotation={[0, 0, 0]} width={3.5} color="#dbefff" fontSize={0.34} />
      <MapSign text="AIR UNIT" position={[0, 3.05, -2.15]} rotation={[0, 0, 0]} width={2.2} color="#dbefff" background="#172025" />
      <MapSign text="MAINTENANCE" position={[22.45, 2.05, 8]} rotation={[0, -Math.PI / 2, 0]} width={3.1} color="#7dd3fc" background="#101820" />
      <MapSign text="ANTENNA" position={[-10, 4.25, 8]} rotation={[0, Math.PI / 2, 0]} width={2.2} color="#dbefff" background="#11191c" />
      <NeonSign text="ZONE R" position={[-22.45, 2.25, -7]} rotation={[0, Math.PI / 2, 0]} width={2.2} color="#7dd3fc" fontSize={0.25} />
      <MapSign text="NO ENTRY" position={[0, 2.05, 22.45]} rotation={[0, Math.PI, 0]} width={2.4} color="#ff6b4a" background="#190d0d" />
      <DirectionSign text="EAST DECK" arrow="right" position={[8, 1.85, -22.45]} rotation={[0, 0, 0]} color="#dbefff" />
      <DirectionSign text="SERVICE" arrow="left" position={[-8, 1.85, 22.45]} rotation={[0, Math.PI, 0]} color="#7dd3fc" />
      <MapSign text="AC-04" position={[-6.2, 1.98, -4.38]} rotation={[0, 0, 0]} width={1.25} height={0.38} color="#f4f8f8" fontSize={0.18} />
      <MapSign text="AC-09" position={[6.4, 1.98, 4.38]} rotation={[0, Math.PI, 0]} width={1.25} height={0.38} color="#f4f8f8" fontSize={0.18} />
      <FloorMarking text="H" position={[0, 0.04, 0]} width={3.8} depth={0.12} color="#f4f8f8" opacity={0.58} />
      <FloorMarking position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} width={3.8} depth={0.12} color="#f4f8f8" opacity={0.58} />
      <FloorMarking text="ZONE R" position={[0, 0.04, -15.6]} width={5.5} depth={0.1} color="#7dd3fc" opacity={0.5} />
      <WarningStripe position={[18.5, 0.06, -12]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} width={4} />
      <WarningStripe position={[-18.5, 0.06, 12]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} width={4} />
      <pointLight position={[0, 2.8, -21.8]} color="#dbefff" intensity={0.3} distance={8} />
      <pointLight position={[-21.8, 2.5, -7]} color="#7dd3fc" intensity={0.25} distance={6} />
    </group>
  );
}
