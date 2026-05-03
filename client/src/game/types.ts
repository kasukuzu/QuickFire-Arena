export type GameState = 'lobby' | 'playing' | 'result';
export type WeaponId = 'ar' | 'smg' | 'sr';
export type MapId = 'warehouse' | 'factory' | 'rooftop';
export type MapSelectionId = MapId | 'random';

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type PlayerState = {
  id: string;
  name: string;
  isHost: boolean;
  weaponId: WeaponId;
  characterId: number;
  position: Vec3;
  rotationY: number;
  pitch: number;
  hp: number;
  ammo: number;
  kills: number;
  deaths: number;
  alive: boolean;
  crouching: boolean;
  invincibleUntil: number | null;
  respawnAt: number | null;
  reloadingUntil: number | null;
};

export type HealthPickupState = {
  id: string;
  x: number;
  y: number;
  z: number;
  createdAt: number;
  expiresAt: number;
};

export type RoomSnapshot = {
  roomId: string;
  state: GameState;
  selectedMapId: MapSelectionId;
  activeMapId: MapId;
  hostId: string;
  players: PlayerState[];
  healthPickups: HealthPickupState[];
  maxPlayers: number;
  matchEndsAt: number | null;
  serverTime: number;
  winnerId: string | null;
};

export type ClientMessage =
  | { type: 'createRoom'; name: string; weaponId: WeaponId }
  | { type: 'joinRoom'; roomId: string; name: string; weaponId: WeaponId }
  | { type: 'selectWeapon'; weaponId: WeaponId }
  | { type: 'mapSelect'; mapId: MapSelectionId }
  | { type: 'startMatch' }
  | { type: 'input'; position: Vec3; rotationY: number; pitch: number; crouching?: boolean }
  | { type: 'shoot'; origin: Vec3; direction: Vec3; hitPlayerId?: string | null; impactPoint?: Vec3 }
  | { type: 'reload' };

export type ServerMessage =
  | { type: 'joined'; playerId: string; roomId: string }
  | { type: 'snapshot'; snapshot: RoomSnapshot }
  | { type: 'error'; message: string };
