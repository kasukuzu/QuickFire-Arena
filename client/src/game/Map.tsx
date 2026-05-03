type Vec3Tuple = [number, number, number];

type BoxItem = {
  id: string;
  position: Vec3Tuple;
  size: Vec3Tuple;
  color: string;
};

type LightItem = {
  id: string;
  position: Vec3Tuple;
  color: string;
  intensity: number;
};

export type CollisionBox = Pick<BoxItem, 'id' | 'position' | 'size'>;

export const warehouseRespawns: Vec3Tuple[] = [
  [-15, 1, -14],
  [15, 1, -14],
  [-15, 1, 14],
  [15, 1, 14],
  [-4, 1, -16],
  [4, 1, 16],
  [-17, 1, 3],
  [17, 1, -3]
];

const walls: BoxItem[] = [
  { id: 'north-wall', position: [0, 2.6, -19], size: [38, 5.2, 1], color: '#3d4240' },
  { id: 'south-wall', position: [0, 2.6, 19], size: [38, 5.2, 1], color: '#3d4240' },
  { id: 'west-wall', position: [-19, 2.6, 0], size: [1, 5.2, 38], color: '#393f3e' },
  { id: 'east-wall', position: [19, 2.6, 0], size: [1, 5.2, 38], color: '#393f3e' },
  { id: 'north-inner-office', position: [-9, 1.8, -11.5], size: [8, 3.6, 0.55], color: '#464b49' },
  { id: 'south-inner-office', position: [9, 1.8, 11.5], size: [8, 3.6, 0.55], color: '#464b49' }
];

const containers: BoxItem[] = [
  { id: 'blue-container-left', position: [-7.2, 1.35, -1.4], size: [5.8, 2.7, 2.4], color: '#46535b' },
  { id: 'yellow-container-right', position: [7.4, 1.35, 1.2], size: [5.8, 2.7, 2.4], color: '#706633' },
  { id: 'short-container-north', position: [1, 1.15, -8.4], size: [6.6, 2.3, 1.8], color: '#555e63' },
  { id: 'short-container-south', position: [-1, 1.15, 8.4], size: [6.6, 2.3, 1.8], color: '#59605c' }
];

const crates: BoxItem[] = [
  { id: 'center-crate-a', position: [-1.6, 0.65, -1.6], size: [1.6, 1.3, 1.6], color: '#7b6040' },
  { id: 'center-crate-b', position: [1.8, 0.55, 1.7], size: [1.4, 1.1, 1.4], color: '#8a6b43' },
  { id: 'center-crate-c', position: [0.2, 0.8, 3.8], size: [2.1, 1.6, 1.2], color: '#755a38' },
  { id: 'spawn-cover-nw', position: [-13.8, 0.85, -12.2], size: [2.3, 1.7, 1.5], color: '#806341' },
  { id: 'spawn-cover-ne', position: [13.9, 0.85, -12.4], size: [2.3, 1.7, 1.5], color: '#806341' },
  { id: 'spawn-cover-sw', position: [-13.6, 0.85, 12.4], size: [2.3, 1.7, 1.5], color: '#806341' },
  { id: 'spawn-cover-se', position: [13.8, 0.85, 12.1], size: [2.3, 1.7, 1.5], color: '#806341' },
  { id: 'north-spawn-cover', position: [-4, 0.7, -13.7], size: [3, 1.4, 1], color: '#755a38' },
  { id: 'south-spawn-cover', position: [4, 0.7, 13.7], size: [3, 1.4, 1], color: '#755a38' }
];

const shelves: BoxItem[] = [
  { id: 'west-rack-a', position: [-15.2, 1.45, -5], size: [0.7, 2.9, 5.2], color: '#596165' },
  { id: 'west-rack-b', position: [-15.2, 1.45, 6.2], size: [0.7, 2.9, 5.2], color: '#596165' },
  { id: 'east-rack-a', position: [15.2, 1.45, 5], size: [0.7, 2.9, 5.2], color: '#596165' },
  { id: 'east-rack-b', position: [15.2, 1.45, -6.2], size: [0.7, 2.9, 5.2], color: '#596165' },
  { id: 'north-rack', position: [8.5, 1.45, -14.6], size: [5.6, 2.9, 0.7], color: '#596165' },
  { id: 'south-rack', position: [-8.5, 1.45, 14.6], size: [5.6, 2.9, 0.7], color: '#596165' }
];

const drums: BoxItem[] = [
  { id: 'drum-a', position: [-3.8, 0.55, 5.8], size: [0.8, 1.1, 0.8], color: '#8a3230' },
  { id: 'drum-b', position: [-4.8, 0.55, 6.7], size: [0.8, 1.1, 0.8], color: '#394247' },
  { id: 'drum-c', position: [4.8, 0.55, -6.4], size: [0.8, 1.1, 0.8], color: '#8a3230' },
  { id: 'drum-d', position: [12.4, 0.55, -8.8], size: [0.8, 1.1, 0.8], color: '#394247' },
  { id: 'drum-e', position: [-12.4, 0.55, 8.8], size: [0.8, 1.1, 0.8], color: '#8a3230' }
];

const pallets: BoxItem[] = [
  { id: 'pallet-a', position: [-9.8, 0.14, -7.8], size: [2.8, 0.28, 1.8], color: '#7b6847' },
  { id: 'pallet-b', position: [9.8, 0.14, 7.8], size: [2.8, 0.28, 1.8], color: '#7b6847' },
  { id: 'pallet-c', position: [0, 0.14, -12.7], size: [3.2, 0.28, 1.8], color: '#7b6847' },
  { id: 'pallet-d', position: [0, 0.14, 12.7], size: [3.2, 0.28, 1.8], color: '#7b6847' }
];

const fences: BoxItem[] = [
  { id: 'fence-west-lane', position: [-10.8, 1.25, 0], size: [0.18, 2.5, 7.2], color: '#707a7a' },
  { id: 'fence-east-lane', position: [10.8, 1.25, 0], size: [0.18, 2.5, 7.2], color: '#707a7a' },
  { id: 'fence-north-long-sight-break', position: [6, 1.2, -11.6], size: [4.4, 2.4, 0.16], color: '#707a7a' },
  { id: 'fence-south-long-sight-break', position: [-6, 1.2, 11.6], size: [4.4, 2.4, 0.16], color: '#707a7a' }
];

const platforms: BoxItem[] = [
  { id: 'left-loading-platform', position: [-11.6, 0.6, -1], size: [4.8, 1.2, 6], color: '#535b5b' },
  { id: 'right-loading-platform', position: [11.6, 0.6, 1], size: [4.8, 1.2, 6], color: '#535b5b' },
  { id: 'left-platform-rail', position: [-11.6, 1.55, -4.2], size: [4.8, 0.5, 0.22], color: '#d1a83e' },
  { id: 'right-platform-rail', position: [11.6, 1.55, 4.2], size: [4.8, 0.5, 0.22], color: '#d1a83e' }
];

export const warehouseCollisionBoxes: CollisionBox[] = [
  ...walls,
  ...containers,
  ...crates,
  ...shelves,
  ...drums,
  ...fences,
  ...platforms.filter((item) => !item.id.includes('rail'))
].map(({ id, position, size }) => ({ id, position, size }));

export const warehouseWalkableSurfaces: CollisionBox[] = [
  ...platforms.filter((item) => item.id.includes('platform') && !item.id.includes('rail')),
  ...containers
].map(({ id, position, size }) => ({ id, position, size }));

const floorLines: BoxItem[] = [
  { id: 'center-yellow-line-a', position: [0, 0.012, -4.8], size: [18, 0.025, 0.16], color: '#d0a735' },
  { id: 'center-yellow-line-b', position: [0, 0.012, 4.8], size: [18, 0.025, 0.16], color: '#d0a735' },
  { id: 'loading-white-line-north', position: [0, 0.014, -13.2], size: [14, 0.025, 0.12], color: '#c9c9bd' },
  { id: 'loading-white-line-south', position: [0, 0.014, 13.2], size: [14, 0.025, 0.12], color: '#c9c9bd' },
  { id: 'west-lane-line', position: [-13.2, 0.014, 0], size: [0.12, 0.025, 18], color: '#c9c9bd' },
  { id: 'east-lane-line', position: [13.2, 0.014, 0], size: [0.12, 0.025, 18], color: '#c9c9bd' }
];

const warningStripes: BoxItem[] = [
  { id: 'stripe-a', position: [-7, 0.03, -5.2], size: [2.8, 0.04, 0.24], color: '#d0a735' },
  { id: 'stripe-b', position: [-7, 0.035, -4.78], size: [2.8, 0.04, 0.24], color: '#151515' },
  { id: 'stripe-c', position: [7, 0.03, 5.2], size: [2.8, 0.04, 0.24], color: '#d0a735' },
  { id: 'stripe-d', position: [7, 0.035, 4.78], size: [2.8, 0.04, 0.24], color: '#151515' },
  { id: 'stripe-e', position: [0, 0.03, 0], size: [4, 0.04, 0.22], color: '#d0a735' },
  { id: 'stripe-f', position: [0, 0.035, 0.42], size: [4, 0.04, 0.22], color: '#151515' }
];

const overheadLights: LightItem[] = [
  { id: 'light-center', position: [0, 4.55, 0], color: '#dbe6df', intensity: 1.45 },
  { id: 'light-north', position: [0, 4.55, -10.5], color: '#dbe6df', intensity: 1.2 },
  { id: 'light-south', position: [0, 4.55, 10.5], color: '#dbe6df', intensity: 1.2 },
  { id: 'light-west', position: [-12.5, 4.4, 0], color: '#cfd9d4', intensity: 0.85 },
  { id: 'light-east', position: [12.5, 4.4, 0], color: '#cfd9d4', intensity: 0.85 }
];

const emergencyLights: LightItem[] = [
  { id: 'red-nw', position: [-18.2, 3.2, -15.6], color: '#ff3b32', intensity: 0.8 },
  { id: 'red-se', position: [18.2, 3.2, 15.6], color: '#ff3b32', intensity: 0.8 },
  { id: 'red-loading', position: [0, 3.1, -18.3], color: '#ff4a3d', intensity: 0.55 }
];

export default function Map() {
  return (
    <group>
      <Floor />
      <Ceiling />
      <PipesAndDucts />
      <BoxGroup items={walls} />
      <BoxGroup items={platforms} />
      <BoxGroup items={containers} />
      <BoxGroup items={crates} />
      <Shelves />
      <Drums />
      <BoxGroup items={pallets} />
      <Fences />
      <BoxGroup items={floorLines} />
      <BoxGroup items={warningStripes} />
      <Lights />
      <RespawnMarkers />
    </group>
  );
}

function Floor() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[38, 0.1, 38]} />
        <meshStandardMaterial color="#4f5552" roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[-7, 0.002, 7]}>
        <boxGeometry args={[8, 0.02, 5]} />
        <meshStandardMaterial color="#474d4a" />
      </mesh>
      <mesh receiveShadow position={[8, 0.002, -8]}>
        <boxGeometry args={[7, 0.02, 4]} />
        <meshStandardMaterial color="#5a5f5b" />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh receiveShadow position={[0, 5.25, 0]}>
      <boxGeometry args={[38, 0.35, 38]} />
      <meshStandardMaterial color="#303635" roughness={0.88} />
    </mesh>
  );
}

function PipesAndDucts() {
  return (
    <group>
      <Box id="main-duct" position={[0, 4.75, -4.2]} size={[21, 0.38, 0.72]} color="#596163" />
      <Box id="side-duct" position={[-8.5, 4.65, 5.5]} size={[0.58, 0.4, 17]} color="#596163" />
      <Box id="pipe-a" position={[6.5, 4.82, 8]} size={[0.28, 0.28, 18]} color="#6d7472" />
      <Box id="pipe-b" position={[8, 4.82, 8]} size={[0.22, 0.22, 18]} color="#707773" />
      <Box id="pipe-c" position={[-13.5, 4.65, 0]} size={[0.22, 0.22, 28]} color="#707773" />
    </group>
  );
}

function Shelves() {
  return (
    <group>
      {shelves.map((shelf) => (
        <group key={shelf.id}>
          <Box {...shelf} />
          <Box id={`${shelf.id}-mid`} position={[shelf.position[0], 1.45, shelf.position[2]]} size={[shelf.size[0] + 0.1, 0.12, shelf.size[2] + 0.1]} color="#323838" />
          <Box id={`${shelf.id}-top`} position={[shelf.position[0], 2.35, shelf.position[2]]} size={[shelf.size[0] + 0.1, 0.12, shelf.size[2] + 0.1]} color="#323838" />
        </group>
      ))}
    </group>
  );
}

function Drums() {
  return (
    <group>
      {drums.map((drum) => (
        <mesh key={drum.id} castShadow receiveShadow position={drum.position}>
          <cylinderGeometry args={[drum.size[0] * 0.5, drum.size[0] * 0.5, drum.size[1], 12]} />
          <meshStandardMaterial color={drum.color} roughness={0.55} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Fences() {
  return (
    <group>
      {fences.map((fence) => (
        <group key={fence.id}>
          <Box {...fence} />
          <Box id={`${fence.id}-top`} position={[fence.position[0], fence.position[1] + 1.1, fence.position[2]]} size={[fence.size[0] + 0.08, 0.12, fence.size[2] + 0.08]} color="#8a9390" />
          <Box id={`${fence.id}-bottom`} position={[fence.position[0], fence.position[1] - 1.1, fence.position[2]]} size={[fence.size[0] + 0.08, 0.12, fence.size[2] + 0.08]} color="#8a9390" />
        </group>
      ))}
    </group>
  );
}

function Lights() {
  return (
    <group>
      {overheadLights.map((light) => (
        <group key={light.id}>
          <pointLight position={light.position} color={light.color} intensity={light.intensity} distance={18} decay={1.3} />
          <mesh position={light.position}>
            <boxGeometry args={[3.2, 0.08, 0.28]} />
            <meshStandardMaterial color="#edf5ed" emissive="#dbe6df" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
      {emergencyLights.map((light) => (
        <group key={light.id}>
          <pointLight position={light.position} color={light.color} intensity={light.intensity} distance={8} decay={1.5} />
          <mesh position={light.position}>
            <boxGeometry args={[0.32, 0.32, 0.18]} />
            <meshStandardMaterial color="#5d1715" emissive={light.color} emissiveIntensity={1.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RespawnMarkers() {
  return (
    <group>
      {warehouseRespawns.map((position, index) => (
        <mesh key={`respawn-${index}`} position={[position[0], 0.018, position[2]]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.1, 0.035, 1.1]} />
          <meshStandardMaterial color="#6d7f7a" emissive="#23312d" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function BoxGroup({ items }: { items: BoxItem[] }) {
  return (
    <group>
      {items.map((item) => (
        <Box key={item.id} {...item} />
      ))}
    </group>
  );
}

function Box({ position, size, color }: BoxItem) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.78} metalness={0.08} />
    </mesh>
  );
}
