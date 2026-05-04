import type WebSocket from 'ws';
import { getSpawns, isMapSelectionId, resolveActiveMapId } from '../maps.js';
import { WEAPONS } from '../weapons.js';
import type { ClientMessage, HealthPickupState, MapId, MapSelectionId, PlayerState, RoomSnapshot, ServerMessage, Vec3, WeaponId } from '../types.js';

const MATCH_MS = 5 * 60 * 1000;
const MAX_PLAYERS = 8;
const RESPAWN_MS = 5000;
const INVINCIBLE_MS = 2000;
const HEALTH_PICKUP_MS = 7000;
const HEALTH_PICKUP_RADIUS = 1.2;
const PLAYER_RADIUS = 0.55;
const PLAYER_STAND_HEIGHT = 1.8;
const PLAYER_CROUCH_HEIGHT = 1.22;

type Client = {
  id: string;
  socket: WebSocket;
  lastShotAt: number;
};

export class GameRoom {
  readonly id: string;
  readonly createdAt = Date.now();
  state: RoomSnapshot['state'] = 'lobby';
  selectedMapId: MapSelectionId = 'warehouse';
  activeMapId: MapId = 'warehouse';
  hostId = '';
  matchEndsAt: number | null = null;
  winnerId: string | null = null;
  private players = new Map<string, PlayerState>();
  private clients = new Map<string, Client>();
  private healthPickups = new Map<string, HealthPickupState>();
  private tickHandle: NodeJS.Timeout;

  constructor(id: string) {
    this.id = id;
    this.tickHandle = setInterval(() => this.tick(), 50);
  }

  get size() {
    return this.players.size;
  }

  addClient(socket: WebSocket, name: string, weaponId: WeaponId) {
    if (this.players.size >= MAX_PLAYERS) {
      this.send(socket, { type: 'error', message: 'Room is full.' });
      return null;
    }
    if (this.state !== 'lobby') {
      this.send(socket, { type: 'error', message: 'Match already started.' });
      return null;
    }

    const id = crypto.randomUUID();
    const isHost = this.players.size === 0;
    if (isHost) this.hostId = id;

    const weapon = WEAPONS[weaponId] ?? WEAPONS.ar;
    const spawns = getSpawns(this.activeMapId);
    const spawn = spawns[this.players.size % spawns.length];
    const player: PlayerState = {
      id,
      name: name.trim().slice(0, 18) || `Player ${this.players.size + 1}`,
      isHost,
      weaponId: weapon.id,
      characterId: 0,
      position: toVec3(spawn),
      rotationY: spawn.rotationY,
      pitch: 0,
      hp: 100,
      ammo: weapon.magazineSize,
      kills: 0,
      deaths: 0,
      alive: true,
      crouching: false,
      invincibleUntil: null,
      respawnAt: null,
      reloadingUntil: null
    };

    this.players.set(id, player);
    this.clients.set(id, { id, socket, lastShotAt: 0 });
    this.send(socket, { type: 'joined', playerId: id, roomId: this.id });
    this.broadcast();
    return id;
  }

  removeClient(playerId: string) {
    this.players.delete(playerId);
    this.clients.delete(playerId);

    if (playerId === this.hostId) {
      const nextHost = this.players.values().next().value as PlayerState | undefined;
      this.hostId = nextHost?.id ?? '';
      if (nextHost) nextHost.isHost = true;
    }

    if (this.players.size === 0) {
      clearInterval(this.tickHandle);
      return;
    }
    this.broadcast();
  }

  handle(playerId: string, message: ClientMessage) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (message.type === 'selectWeapon' && this.state === 'lobby') {
      player.weaponId = message.weaponId;
      player.ammo = WEAPONS[message.weaponId].magazineSize;
      this.broadcast();
      return;
    }

    if (message.type === 'mapSelect' && this.state === 'lobby') {
      if (playerId !== this.hostId || !isMapSelectionId(message.mapId)) return;
      this.selectedMapId = message.mapId;
      this.broadcast();
      return;
    }

    if (message.type === 'startMatch') {
      if (playerId !== this.hostId || this.players.size < 2 || this.state !== 'lobby') return;
      this.start();
      return;
    }

    if (this.state !== 'playing') return;

    if (message.type === 'input' && player.alive) {
      player.position = clampArena(message.position);
      player.rotationY = message.rotationY;
      player.pitch = Math.max(-1.45, Math.min(1.45, message.pitch));
      player.crouching = Boolean(message.crouching);
      return;
    }

    if (message.type === 'reload') {
      this.reload(player);
      return;
    }

    if (message.type === 'shoot') {
      this.shoot(playerId, message.origin, normalize(message.direction), message.hitPlayerId);
    }
  }

  snapshot(): RoomSnapshot {
    return {
      roomId: this.id,
      state: this.state,
      selectedMapId: this.selectedMapId,
      activeMapId: this.activeMapId,
      hostId: this.hostId,
      players: [...this.players.values()],
      healthPickups: [...this.healthPickups.values()],
      maxPlayers: MAX_PLAYERS,
      matchEndsAt: this.matchEndsAt,
      serverTime: Date.now(),
      winnerId: this.winnerId
    };
  }

  private start() {
    this.state = 'playing';
    this.activeMapId = resolveActiveMapId(this.selectedMapId);
    this.matchEndsAt = Date.now() + MATCH_MS;
    this.winnerId = null;
    this.healthPickups.clear();
    let index = 0;
    const characterIds = shuffle([0, 1, 2, 3, 4, 5, 6, 7]);
    const spawns = getSpawns(this.activeMapId);
    for (const player of this.players.values()) {
      const weapon = WEAPONS[player.weaponId];
      Object.assign(player, {
        position: toVec3(spawns[index % spawns.length]),
        rotationY: spawns[index % spawns.length].rotationY,
        pitch: 0,
        characterId: characterIds[index++] ?? 0,
        hp: 100,
        ammo: weapon.magazineSize,
        kills: 0,
        deaths: 0,
        alive: true,
        crouching: false,
        invincibleUntil: null,
        respawnAt: null,
        reloadingUntil: null
      });
    }
    this.broadcast();
  }

  private tick() {
    const now = Date.now();
    for (const [id, pickup] of this.healthPickups) {
      if (now >= pickup.expiresAt) this.healthPickups.delete(id);
    }

    for (const player of this.players.values()) {
      if (!player.alive && player.respawnAt && now >= player.respawnAt && this.state === 'playing') {
        this.respawn(player);
      }
      if (player.reloadingUntil && now >= player.reloadingUntil) {
        player.ammo = WEAPONS[player.weaponId].magazineSize;
        player.reloadingUntil = null;
      }
      if (player.alive && this.state === 'playing') {
        this.collectHealthPickups(player);
      }
    }

    if (this.state === 'playing' && this.matchEndsAt && now >= this.matchEndsAt) {
      this.finish();
    }

    this.broadcast();
  }

  private reload(player: PlayerState) {
    if (!player.alive || player.reloadingUntil) return;
    const weapon = WEAPONS[player.weaponId];
    if (player.ammo >= weapon.magazineSize) return;
    player.reloadingUntil = Date.now() + weapon.reloadMs;
  }

  private shoot(playerId: string, origin: Vec3, direction: Vec3, claimedHitPlayerId?: string | null) {
    const shooter = this.players.get(playerId);
    const client = this.clients.get(playerId);
    const now = Date.now();
    if (!shooter || !client || !shooter.alive || shooter.reloadingUntil || isInvincible(shooter, now)) return;
    const weapon = WEAPONS[shooter.weaponId];
    if (now - client.lastShotAt < weapon.fireIntervalMs || shooter.ammo <= 0) return;
    client.lastShotAt = now;
    shooter.ammo -= 1;

    let bestTarget: PlayerState | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const target of this.players.values()) {
      if (target.id === playerId || !target.alive) continue;
      const hit = rayCapsuleHit(
        origin,
        direction,
        target.position,
        target.crouching ? PLAYER_CROUCH_HEIGHT : PLAYER_STAND_HEIGHT
      );
      if (hit !== null && hit < bestDistance && hit <= weapon.range) {
        bestTarget = target;
        bestDistance = hit;
      }
    }

    if (!bestTarget || claimedHitPlayerId === null || isInvincible(bestTarget, now)) return;
    if (claimedHitPlayerId && bestTarget.id !== claimedHitPlayerId) return;
    bestTarget.hp = Math.max(0, bestTarget.hp - weapon.damage);
    if (bestTarget.hp <= 0) {
      bestTarget.alive = false;
      bestTarget.deaths += 1;
      bestTarget.respawnAt = now + RESPAWN_MS;
      bestTarget.invincibleUntil = null;
      bestTarget.reloadingUntil = null;
      shooter.kills += 1;
      this.dropHealthPickup(bestTarget.position, now);
    }
  }

  private dropHealthPickup(position: Vec3, now: number) {
    const pickup: HealthPickupState = {
      id: crypto.randomUUID(),
      x: position.x,
      y: Math.max(0.55, position.y + 0.55),
      z: position.z,
      createdAt: now,
      expiresAt: now + HEALTH_PICKUP_MS
    };
    this.healthPickups.set(pickup.id, pickup);
  }

  private collectHealthPickups(player: PlayerState) {
    for (const [id, pickup] of this.healthPickups) {
      const distance = Math.hypot(player.position.x - pickup.x, player.position.y - pickup.y, player.position.z - pickup.z);
      if (distance <= HEALTH_PICKUP_RADIUS) {
        player.hp = 100;
        this.healthPickups.delete(id);
      }
    }
  }

  private respawn(player: PlayerState) {
    const weapon = WEAPONS[player.weaponId];
    const now = Date.now();
    const spawn = this.pickSafeSpawn(player.id);
    player.position = toVec3(spawn);
    player.rotationY = spawn.rotationY;
    player.pitch = 0;
    player.hp = 100;
    player.ammo = weapon.magazineSize;
    player.alive = true;
    player.crouching = false;
    player.invincibleUntil = now + INVINCIBLE_MS;
    player.respawnAt = null;
    player.reloadingUntil = null;
  }

  private pickSafeSpawn(playerId: string) {
    const spawns = getSpawns(this.activeMapId);
    const enemies = [...this.players.values()].filter((player) => player.id !== playerId && player.alive);
    if (enemies.length === 0) return spawns[Math.floor(Math.random() * spawns.length)];

    let bestSpawn = spawns[0];
    let bestDistance = -1;
    const safeSpawns = spawns.filter((spawn) => {
      const nearest = nearestEnemyDistance(spawn, enemies);
      if (nearest > bestDistance) {
        bestDistance = nearest;
        bestSpawn = spawn;
      }
      return nearest >= 10;
    });

    return safeSpawns.length > 0 ? safeSpawns[Math.floor(Math.random() * safeSpawns.length)] : bestSpawn;
  }

  private finish() {
    this.state = 'result';
    this.matchEndsAt = null;
    this.healthPickups.clear();
    this.winnerId = [...this.players.values()].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)[0]?.id ?? null;
    this.broadcast();
  }

  private broadcast() {
    const message = JSON.stringify({ type: 'snapshot', snapshot: this.snapshot() } satisfies ServerMessage);
    for (const client of this.clients.values()) {
      if (client.socket.readyState === client.socket.OPEN) client.socket.send(message);
    }
  }

  private send(socket: WebSocket, message: ServerMessage) {
    socket.send(JSON.stringify(message));
  }
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toVec3(position: Vec3): Vec3 {
  return { x: position.x, y: position.y, z: position.z };
}

function isInvincible(player: PlayerState, now: number) {
  return Boolean(player.invincibleUntil && player.invincibleUntil > now);
}

function nearestEnemyDistance(spawn: Vec3, enemies: PlayerState[]) {
  return Math.min(...enemies.map((enemy) => Math.hypot(spawn.x - enemy.position.x, spawn.z - enemy.position.z)));
}

function clampArena(position: Vec3): Vec3 {
  return {
    x: Math.max(-17.5, Math.min(17.5, position.x)),
    y: Math.max(0, Math.min(7.5, position.y)),
    z: Math.max(-17.5, Math.min(17.5, position.z))
  };
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function rayCapsuleHit(origin: Vec3, direction: Vec3, targetPosition: Vec3, targetHeight = PLAYER_STAND_HEIGHT) {
  const center = { x: targetPosition.x, y: targetPosition.y + targetHeight * 0.45, z: targetPosition.z };
  const toTarget = { x: center.x - origin.x, y: center.y - origin.y, z: center.z - origin.z };
  const projection = toTarget.x * direction.x + toTarget.y * direction.y + toTarget.z * direction.z;
  if (projection < 0) return null;

  const closest = {
    x: origin.x + direction.x * projection,
    y: origin.y + direction.y * projection,
    z: origin.z + direction.z * projection
  };
  const distance = Math.hypot(closest.x - center.x, closest.y - center.y, closest.z - center.z);
  return distance <= PLAYER_RADIUS ? projection : null;
}
