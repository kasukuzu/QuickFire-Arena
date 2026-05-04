import { warehouseCollisionBoxes, warehouseWalkableSurfaces, warehouseRespawns } from '../Map';
import type { CollisionBox } from '../Map';

export type MapId = 'warehouse' | 'factory' | 'rooftop';
export type MapSelectionId = MapId | 'random';

export type GameMapDefinition = {
  id: MapId;
  name: string;
  description: string;
  spawns: [number, number, number][];
  collisionBoxes: CollisionBox[];
  walkableSurfaces: CollisionBox[];
};

export const MAPS: Record<MapId, GameMapDefinition> = {
  warehouse: {
    id: 'warehouse',
    name: '地下倉庫',
    description: '遮蔽物が多い中距離中心の地下倉庫マップ',
    spawns: warehouseRespawns,
    collisionBoxes: warehouseCollisionBoxes,
    walkableSurfaces: warehouseWalkableSurfaces
  },
  factory: {
    id: 'factory',
    name: '廃工場',
    description: '高台と通路がある工業系マップ',
    spawns: [
      [-20, 0, -16],
      [20, 0, -16],
      [-20, 0, 16],
      [20, 0, 16],
      [-8, 0, -20],
      [8, 0, 20],
      [-21, 0, 6],
      [21, 0, -6]
    ],
    collisionBoxes: makeFactoryCollisions(),
    walkableSurfaces: makeFactoryWalkables()
  },
  rooftop: {
    id: 'rooftop',
    name: '屋上施設',
    description: '明るめで外周ルートのある屋上マップ',
    spawns: [
      [-20, 0, -17],
      [20, 0, -17],
      [-20, 0, 17],
      [20, 0, 17],
      [-6, 0, -21],
      [6, 0, 21],
      [-21, 0, -5],
      [21, 0, 5]
    ],
    collisionBoxes: makeRooftopCollisions(),
    walkableSurfaces: makeRooftopWalkables()
  }
};

export const MAP_SELECTIONS: { id: MapSelectionId; name: string; description: string }[] = [
  MAPS.warehouse,
  MAPS.factory,
  MAPS.rooftop,
  { id: 'random', name: 'ランダム', description: '試合開始時にサーバー側でランダム選択' }
];

export const playableMapIds: MapId[] = ['warehouse', 'factory', 'rooftop'];

export function getMapName(mapId: MapSelectionId) {
  return mapId === 'random' ? 'ランダム' : MAPS[mapId].name;
}

export function getActiveMapName(mapId: MapId) {
  return MAPS[mapId].name;
}

function makeFactoryCollisions(): CollisionBox[] {
  return [
    box('factory-north-wall', [0, 3.5, -23], [46, 7, 1]),
    box('factory-south-wall', [0, 3.5, 23], [46, 7, 1]),
    box('factory-west-wall', [-23, 3.5, 0], [1, 7, 46]),
    box('factory-east-wall', [23, 3.5, 0], [1, 7, 46]),
    box('central-machine-a', [-2.4, 1.65, 0], [5.2, 3.3, 4.6]),
    box('central-machine-b', [3.7, 1.45, -2.1], [3.8, 2.9, 3.2]),
    box('central-tank', [2.7, 1.55, 3.8], [2.6, 3.1, 2.6]),
    box('central-control-bank', [-3.8, 0.7, 5.2], [3.4, 1.4, 1.2]),
    box('conveyor-north', [0, 0.65, -8.5], [11, 1.3, 1.4]),
    box('conveyor-south', [0, 0.65, 8.5], [11, 1.3, 1.4]),
    box('left-platform', [-12, 0.8, -3.5], [5.8, 1.6, 6.6]),
    box('right-platform', [12, 0.8, 3.5], [5.8, 1.6, 6.6]),
    box('left-platform-screen', [-12, 2.05, -6.4], [4.8, 1.1, 0.35]),
    box('right-platform-screen', [12, 2.05, 6.4], [4.8, 1.1, 0.35]),
    box('left-lane-pipes', [-15.2, 1.45, 5.5], [1.2, 2.9, 8]),
    box('right-lane-pipes', [15.2, 1.45, -5.5], [1.2, 2.9, 8]),
    box('rust-crate-nw', [-13.5, 1.05, -12], [2.7, 2.1, 2.2]),
    box('rust-crate-ne', [13.5, 1.05, -12], [2.7, 2.1, 2.2]),
    box('rust-crate-sw', [-13.5, 1.05, 12], [2.7, 2.1, 2.2]),
    box('rust-crate-se', [13.5, 1.05, 12], [2.7, 2.1, 2.2]),
    box('spawn-baffle-north-west', [-7, 1.4, -13.6], [4.2, 2.8, 0.6]),
    box('spawn-baffle-south-east', [7, 1.4, 13.6], [4.2, 2.8, 0.6]),
    box('spawn-baffle-west', [-15.5, 1.35, 5], [0.6, 2.7, 3.8]),
    box('spawn-baffle-east', [15.5, 1.35, -5], [0.6, 2.7, 3.8]),
    box('factory-mid-cover-west', [-7.5, 0.95, 2.8], [2.4, 1.9, 1.4]),
    box('factory-mid-cover-east', [7.5, 0.95, -2.8], [2.4, 1.9, 1.4]),
    box('factory-short-corner-a', [-9.5, 0.55, -10], [2.4, 1.1, 1.2]),
    box('factory-short-corner-b', [9.5, 0.55, 10], [2.4, 1.1, 1.2]),
    box('factory-west-annex-machine', [-18.5, 1.35, -2], [3.8, 2.7, 5.8]),
    box('factory-east-annex-machine', [18.5, 1.35, 2], [3.8, 2.7, 5.8]),
    box('factory-north-pipe-stack', [-3, 1.25, -18], [7.5, 2.5, 1.4]),
    box('factory-south-pipe-stack', [3, 1.25, 18], [7.5, 2.5, 1.4])
  ];
}

function makeFactoryWalkables(): CollisionBox[] {
  return [
    box('left-platform', [-12, 0.8, -3.5], [5.8, 1.6, 6.6]),
    box('right-platform', [12, 0.8, 3.5], [5.8, 1.6, 6.6]),
    box('conveyor-north', [0, 0.65, -8.5], [11, 1.3, 1.4]),
    box('conveyor-south', [0, 0.65, 8.5], [11, 1.3, 1.4]),
    box('factory-short-corner-a', [-9.5, 0.55, -10], [2.4, 1.1, 1.2]),
    box('factory-short-corner-b', [9.5, 0.55, 10], [2.4, 1.1, 1.2])
  ];
}

function makeRooftopCollisions(): CollisionBox[] {
  return [
    box('roof-north-wall', [0, 1.7, -23], [46, 3.4, 1]),
    box('roof-south-wall', [0, 1.7, 23], [46, 3.4, 1]),
    box('roof-west-wall', [-23, 1.7, 0], [1, 3.4, 46]),
    box('roof-east-wall', [23, 1.7, 0], [1, 3.4, 46]),
    box('equipment-shed', [0, 1.45, 0], [5.8, 2.9, 4.2]),
    box('hvac-center-a', [-6.2, 0.95, -3.2], [4.8, 1.9, 2.3]),
    box('hvac-center-b', [6.4, 0.95, 3.2], [4.8, 1.9, 2.3]),
    box('water-tank', [10, 1.55, -8], [3.4, 3.1, 3.4]),
    box('antenna-base', [-10, 1.25, 8], [3.6, 2.5, 3.6]),
    box('generator-west', [-8.2, 0.75, -8], [3.6, 1.5, 2]),
    box('generator-east', [8.2, 0.75, 8], [3.6, 1.5, 2]),
    box('low-wall-north', [0, 0.65, -9.8], [10, 1.3, 0.8]),
    box('low-wall-south', [0, 0.65, 9.8], [10, 1.3, 0.8]),
    box('duct-west-lane', [-14, 0.85, 0], [1.5, 1.7, 7.5]),
    box('duct-east-lane', [14, 0.85, 0], [1.5, 1.7, 7.5]),
    box('spawn-cover-nw', [-13.5, 1.05, -12.5], [3, 2.1, 1.5]),
    box('spawn-cover-ne', [13.5, 1.05, -12.5], [3, 2.1, 1.5]),
    box('spawn-cover-sw', [-13.5, 1.05, 12.5], [3, 2.1, 1.5]),
    box('spawn-cover-se', [13.5, 1.05, 12.5], [3, 2.1, 1.5]),
    box('spawn-hvac-north', [-5, 1, -14.5], [4.4, 2, 1.5]),
    box('spawn-hvac-south', [5, 1, 14.5], [4.4, 2, 1.5]),
    box('spawn-screen-west', [-15.4, 1.2, -4], [1.3, 2.4, 4]),
    box('spawn-screen-east', [15.4, 1.2, 4], [1.3, 2.4, 4]),
    box('roof-north-service-hut', [-12, 1.25, -18], [6, 2.5, 2.5]),
    box('roof-south-service-hut', [12, 1.25, 18], [6, 2.5, 2.5]),
    box('roof-west-water-bank', [-19, 1.4, 8], [3.2, 2.8, 6]),
    box('roof-east-hvac-bank', [19, 1.05, -8], [3.2, 2.1, 6]),
    box('roof-north-low-cover', [0, 0.75, -18], [6, 1.5, 1.2]),
    box('roof-south-low-cover', [0, 0.75, 18], [6, 1.5, 1.2])
  ];
}

function makeRooftopWalkables(): CollisionBox[] {
  return [
    box('low-wall-north', [0, 0.65, -9.8], [10, 1.3, 0.8]),
    box('low-wall-south', [0, 0.65, 9.8], [10, 1.3, 0.8]),
    box('generator-west', [-8.2, 0.75, -8], [3.6, 1.5, 2]),
    box('generator-east', [8.2, 0.75, 8], [3.6, 1.5, 2])
  ];
}

function box(id: string, position: [number, number, number], size: [number, number, number]): CollisionBox {
  return { id, position, size };
}
