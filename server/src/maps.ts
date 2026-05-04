export type MapId = 'warehouse' | 'factory' | 'rooftop';
export type MapSelectionId = MapId | 'random';
export type SpawnPoint = {
  x: number;
  y: number;
  z: number;
  rotationY: number;
};

export type ServerMapDefinition = {
  id: MapId;
  name: string;
  spawns: SpawnPoint[];
};

export const PLAYABLE_MAP_IDS: MapId[] = ['warehouse', 'factory', 'rooftop'];

export const MAPS: Record<MapId, ServerMapDefinition> = {
  warehouse: {
    id: 'warehouse',
    name: '地下倉庫',
    spawns: [
      { x: -20, y: 0, z: -17, rotationY: Math.PI * 0.25 },
      { x: 20, y: 0, z: -17, rotationY: -Math.PI * 0.25 },
      { x: -20, y: 0, z: 17, rotationY: Math.PI * 0.75 },
      { x: 20, y: 0, z: 17, rotationY: -Math.PI * 0.75 },
      { x: -8, y: 0, z: -20, rotationY: Math.PI * 0.08 },
      { x: 8, y: 0, z: 20, rotationY: -Math.PI * 0.92 },
      { x: -21, y: 0, z: 7, rotationY: Math.PI * 0.55 },
      { x: 21, y: 0, z: -7, rotationY: -Math.PI * 0.45 }
    ]
  },
  factory: {
    id: 'factory',
    name: '廃工場',
    spawns: [
      { x: -20, y: 0, z: -16, rotationY: Math.PI * 0.2 },
      { x: 20, y: 0, z: -16, rotationY: -Math.PI * 0.2 },
      { x: -20, y: 0, z: 16, rotationY: Math.PI * 0.8 },
      { x: 20, y: 0, z: 16, rotationY: -Math.PI * 0.8 },
      { x: -8, y: 0, z: -20, rotationY: Math.PI * 0.05 },
      { x: 8, y: 0, z: 20, rotationY: -Math.PI * 0.95 },
      { x: -21, y: 0, z: 6, rotationY: Math.PI * 0.55 },
      { x: 21, y: 0, z: -6, rotationY: -Math.PI * 0.45 }
    ]
  },
  rooftop: {
    id: 'rooftop',
    name: '屋上施設',
    spawns: [
      { x: -20, y: 0, z: -17, rotationY: Math.PI * 0.2 },
      { x: 20, y: 0, z: -17, rotationY: -Math.PI * 0.2 },
      { x: -20, y: 0, z: 17, rotationY: Math.PI * 0.8 },
      { x: 20, y: 0, z: 17, rotationY: -Math.PI * 0.8 },
      { x: -6, y: 0, z: -21, rotationY: Math.PI * 0.05 },
      { x: 6, y: 0, z: 21, rotationY: -Math.PI * 0.95 },
      { x: -21, y: 0, z: -5, rotationY: Math.PI * 0.35 },
      { x: 21, y: 0, z: 5, rotationY: -Math.PI * 0.65 }
    ]
  }
};

export function isMapSelectionId(value: string): value is MapSelectionId {
  return value === 'random' || value === 'warehouse' || value === 'factory' || value === 'rooftop';
}

export function resolveActiveMapId(selection: MapSelectionId): MapId {
  if (selection !== 'random') return selection;
  return PLAYABLE_MAP_IDS[Math.floor(Math.random() * PLAYABLE_MAP_IDS.length)];
}

export function getSpawns(mapId: MapId) {
  return MAPS[mapId].spawns;
}
