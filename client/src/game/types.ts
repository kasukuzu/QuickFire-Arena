export type GameState = 'lobby' | 'roulette' | 'map_selected' | 'countdown' | 'playing' | 'result';
export type WeaponId = 'ar' | 'smg' | 'sr';
export type MapId = 'warehouse' | 'factory' | 'rooftop';
export type MapSelectionId = MapId | 'random';
export type HitPart = 'head' | 'body' | 'arm' | 'leg';

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type PlayerState = {
  id: string;
  name: string;
  isHost: boolean;
  weaponId: WeaponId | null;
  mapVote: MapSelectionId | null;
  isReady: boolean;
  characterId: number;
  position: Vec3;
  rotationY: number;
  pitch: number;
  hp: number;
  ammo: number;
  kills: number;
  deaths: number;
  totalDamage: number;
  killStreak: number;
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

export type DamageEvent = {
  id: string;
  targetId: string;
  attackerId: string;
  damage: number;
  hitPart: HitPart;
  isHeadshot: boolean;
  createdAt: number;
};

export type ShotEvent = {
  id: string;
  shooterId: string;
  weaponId: WeaponId;
  position: Vec3;
  origin: Vec3;
  direction: Vec3;
  endPoint: Vec3;
  isHit: boolean;
  createdAt: number;
};

export type KillFeedEvent = {
  id: string;
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  weaponId: WeaponId;
  isHeadshot: boolean;
  killStreak: number;
  createdAt: number;
};

export type RoomSnapshot = {
  roomId: string;
  state: GameState;
  selectedMapId: MapSelectionId;
  activeMapId: MapId;
  rouletteCandidates: MapSelectionId[];
  rouletteResult: MapSelectionId | null;
  rouletteStartedAt: number | null;
  rouletteEndsAt: number | null;
  mapSelectedAt: number | null;
  countdownStartedAt: number | null;
  matchStartedAt: number | null;
  hostId: string;
  players: PlayerState[];
  healthPickups: HealthPickupState[];
  damageEvents: DamageEvent[];
  shotEvents: ShotEvent[];
  killFeedEvents: KillFeedEvent[];
  maxPlayers: number;
  matchEndsAt: number | null;
  serverTime: number;
  winnerId: string | null;
};

export type ClientMessage =
  | { type: 'createRoom'; name: string }
  | { type: 'joinRoom'; roomId: string; name: string }
  | { type: 'selectWeapon'; weaponId: WeaponId }
  | { type: 'weaponSelect'; weaponId: WeaponId }
  | { type: 'mapSelect'; mapId: MapSelectionId }
  | { type: 'mapVoteSelect'; mapId: MapSelectionId }
  | { type: 'readyToggle' }
  | { type: 'startMatch' }
  | { type: 'startGame' }
  | { type: 'input'; position: Vec3; rotationY: number; pitch: number; crouching?: boolean }
  | { type: 'shoot'; origin: Vec3; direction: Vec3; hitPlayerId?: string | null; hitPart?: HitPart | null; impactPoint?: Vec3 }
  | { type: 'reload' };

export type ServerMessage =
  | { type: 'joined'; playerId: string; roomId: string }
  | { type: 'snapshot'; snapshot: RoomSnapshot }
  | { type: 'error'; message: string };
