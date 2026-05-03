export type GameState = 'lobby' | 'playing' | 'result';
export type WeaponId = 'ar' | 'smg' | 'sr';

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
  position: Vec3;
  rotationY: number;
  pitch: number;
  hp: number;
  ammo: number;
  kills: number;
  deaths: number;
  alive: boolean;
  respawnAt: number | null;
  reloadingUntil: number | null;
};

export type RoomSnapshot = {
  roomId: string;
  state: GameState;
  hostId: string;
  players: PlayerState[];
  maxPlayers: number;
  matchEndsAt: number | null;
  serverTime: number;
  winnerId: string | null;
};

export type ClientMessage =
  | { type: 'createRoom'; name: string; weaponId: WeaponId }
  | { type: 'joinRoom'; roomId: string; name: string; weaponId: WeaponId }
  | { type: 'selectWeapon'; weaponId: WeaponId }
  | { type: 'startMatch' }
  | { type: 'input'; position: Vec3; rotationY: number; pitch: number }
  | { type: 'shoot'; origin: Vec3; direction: Vec3; hitPlayerId?: string | null; impactPoint?: Vec3 }
  | { type: 'reload' };

export type ServerMessage =
  | { type: 'joined'; playerId: string; roomId: string }
  | { type: 'snapshot'; snapshot: RoomSnapshot }
  | { type: 'error'; message: string };
