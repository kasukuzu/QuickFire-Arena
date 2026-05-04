import type WebSocket from 'ws';
import { HIT_PART_DAMAGE_MULTIPLIER, PLAYER_HITBOXES } from '../hitboxes.js';
import { getSpawns, isMapSelectionId, resolveActiveMapId } from '../maps.js';
import { WEAPONS } from '../weapons.js';
import type { ClientMessage, DamageEvent, HealthPickupState, HitPart, KillFeedEvent, MapId, MapSelectionId, PlayerState, RoomSnapshot, ServerMessage, ShotEvent, Vec3, WeaponId } from '../types.js';

const MATCH_MS = 5 * 60 * 1000;
const MAX_PLAYERS = 8;
const RESPAWN_MS = 5000;
const INVINCIBLE_MS = 2000;
const HEALTH_PICKUP_MS = 7000;
const DAMAGE_EVENT_MS = 1200;
const SHOT_EVENT_MS = 1000;
const KILL_FEED_MS = 5000;
const HEALTH_PICKUP_RADIUS = 1.2;
const MAP_SELECTED_MS = 2000;
const COUNTDOWN_MS = 3500;
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
  rouletteCandidates: MapSelectionId[] = [];
  rouletteResult: MapSelectionId | null = null;
  rouletteStartedAt: number | null = null;
  rouletteEndsAt: number | null = null;
  mapSelectedAt: number | null = null;
  countdownStartedAt: number | null = null;
  matchStartedAt: number | null = null;
  hostId = '';
  matchEndsAt: number | null = null;
  winnerId: string | null = null;
  private players = new Map<string, PlayerState>();
  private clients = new Map<string, Client>();
  private healthPickups = new Map<string, HealthPickupState>();
  private damageEvents: DamageEvent[] = [];
  private shotEvents: ShotEvent[] = [];
  private killFeedEvents: KillFeedEvent[] = [];
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
      mapVote: null,
      isReady: false,
      characterId: 0,
      position: toVec3(spawn),
      rotationY: spawn.rotationY,
      pitch: 0,
      hp: 100,
      ammo: weapon.magazineSize,
      kills: 0,
      deaths: 0,
      totalDamage: 0,
      killStreak: 0,
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

    if ((message.type === 'selectWeapon' || message.type === 'weaponSelect') && this.state === 'lobby') {
      player.weaponId = message.weaponId;
      player.ammo = WEAPONS[message.weaponId].magazineSize;
      player.isReady = false;
      this.broadcast();
      return;
    }

    if ((message.type === 'mapSelect' || message.type === 'mapVoteSelect') && this.state === 'lobby') {
      if (!isMapSelectionId(message.mapId)) return;
      player.mapVote = message.mapId;
      player.isReady = false;
      this.broadcast();
      return;
    }

    if (message.type === 'readyToggle' && this.state === 'lobby') {
      if (!player.weaponId || !player.mapVote) return;
      player.isReady = !player.isReady;
      this.broadcast();
      return;
    }

    if (message.type === 'startMatch' || message.type === 'startGame') {
      if (playerId !== this.hostId || !this.canStart()) return;
      this.startRoulette();
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
      this.shoot(playerId, message.origin, normalize(message.direction), message.hitPlayerId, message.hitPart);
    }
  }

  snapshot(): RoomSnapshot {
    return {
      roomId: this.id,
      state: this.state,
      selectedMapId: this.selectedMapId,
      activeMapId: this.activeMapId,
      rouletteCandidates: this.rouletteCandidates,
      rouletteResult: this.rouletteResult,
      rouletteStartedAt: this.rouletteStartedAt,
      rouletteEndsAt: this.rouletteEndsAt,
      mapSelectedAt: this.mapSelectedAt,
      countdownStartedAt: this.countdownStartedAt,
      matchStartedAt: this.matchStartedAt,
      hostId: this.hostId,
      players: [...this.players.values()],
      healthPickups: [...this.healthPickups.values()],
      damageEvents: this.damageEvents,
      shotEvents: this.shotEvents,
      killFeedEvents: this.killFeedEvents,
      maxPlayers: MAX_PLAYERS,
      matchEndsAt: this.matchEndsAt,
      serverTime: Date.now(),
      winnerId: this.winnerId
    };
  }

  private canStart() {
    return this.state === 'lobby' && this.players.size >= 2 && [...this.players.values()].every((player) => player.isReady && player.mapVote);
  }

  private startRoulette() {
    const now = Date.now();
    const candidates = [...this.players.values()].map((player) => player.mapVote).filter((mapId): mapId is MapSelectionId => Boolean(mapId));
    const result = candidates[Math.floor(Math.random() * candidates.length)] ?? 'warehouse';

    this.state = 'roulette';
    this.rouletteCandidates = candidates.length > 0 ? candidates : ['warehouse'];
    this.rouletteResult = result;
    this.selectedMapId = result;
    this.activeMapId = result === 'random' ? resolveActiveMapId('random') : result;
    this.rouletteStartedAt = now;
    this.rouletteEndsAt = now + (result === 'random' ? 4400 : 3400);
    this.mapSelectedAt = null;
    this.countdownStartedAt = null;
    this.matchStartedAt = null;
    this.winnerId = null;
    this.broadcast();

    setTimeout(() => {
      if (this.state !== 'roulette') return;
      this.showMapSelected();
    }, this.rouletteEndsAt - now);
  }

  private showMapSelected() {
    this.state = 'map_selected';
    this.mapSelectedAt = Date.now();
    this.broadcast();
    setTimeout(() => {
      if (this.state !== 'map_selected') return;
      this.startCountdown();
    }, MAP_SELECTED_MS);
  }

  private startCountdown() {
    this.state = 'countdown';
    this.countdownStartedAt = Date.now();
    this.winnerId = null;
    this.healthPickups.clear();
    this.rouletteStartedAt = null;
    this.rouletteEndsAt = null;
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
        totalDamage: 0,
        killStreak: 0,
        alive: true,
        crouching: false,
        isReady: false,
        invincibleUntil: null,
        respawnAt: null,
        reloadingUntil: null
      });
    }
    this.broadcast();
    setTimeout(() => {
      if (this.state !== 'countdown') return;
      this.startPlaying();
    }, COUNTDOWN_MS);
  }

  private startPlaying() {
    const now = Date.now();
    this.state = 'playing';
    this.matchStartedAt = now;
    this.matchEndsAt = now + MATCH_MS;
    this.broadcast();
  }

  private tick() {
    const now = Date.now();
    this.damageEvents = this.damageEvents.filter((event) => now - event.createdAt <= DAMAGE_EVENT_MS);
    this.shotEvents = this.shotEvents.filter((event) => now - event.createdAt <= SHOT_EVENT_MS);
    this.killFeedEvents = this.killFeedEvents.filter((event) => now - event.createdAt <= KILL_FEED_MS);
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

  private shoot(playerId: string, origin: Vec3, direction: Vec3, claimedHitPlayerId?: string | null, claimedHitPart?: HitPart | null) {
    const shooter = this.players.get(playerId);
    const client = this.clients.get(playerId);
    const now = Date.now();
    if (!shooter || !client || !shooter.alive || shooter.reloadingUntil || isInvincible(shooter, now)) return;
    const weapon = WEAPONS[shooter.weaponId];
    if (now - client.lastShotAt < weapon.fireIntervalMs || shooter.ammo <= 0) return;
    client.lastShotAt = now;
    shooter.ammo -= 1;
    this.shotEvents.push({
      id: crypto.randomUUID(),
      shooterId: playerId,
      weaponId: shooter.weaponId,
      position: { ...shooter.position },
      createdAt: now
    });

    let bestTarget: PlayerState | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestHitPart: HitPart | null = null;
    for (const target of this.players.values()) {
      if (target.id === playerId || !target.alive) continue;
      const hit = rayPlayerHitboxesHit(
        origin,
        direction,
        target
      );
      if (hit !== null && hit.distance < bestDistance && hit.distance <= weapon.range) {
        bestTarget = target;
        bestDistance = hit.distance;
        bestHitPart = hit.hitPart;
      }
    }

    if (!bestTarget || claimedHitPlayerId === null || isInvincible(bestTarget, now)) return;
    if (claimedHitPlayerId && bestTarget.id !== claimedHitPlayerId) return;
    const multiplier = bestHitPart ? HIT_PART_DAMAGE_MULTIPLIER[bestHitPart] : 1;
    const damage = Math.round(weapon.damage * multiplier);
    const previousHp = bestTarget.hp;
    bestTarget.hp = Math.max(0, bestTarget.hp - damage);
    const actualDamage = previousHp - bestTarget.hp;
    if (actualDamage > 0 && bestHitPart) {
      shooter.totalDamage += actualDamage;
      this.damageEvents.push({
        id: crypto.randomUUID(),
        targetId: bestTarget.id,
        attackerId: playerId,
        damage: actualDamage,
        hitPart: bestHitPart,
        isHeadshot: bestHitPart === 'head',
        createdAt: now
      });
    }
    if (bestTarget.hp <= 0) {
      bestTarget.alive = false;
      bestTarget.deaths += 1;
      bestTarget.killStreak = 0;
      bestTarget.respawnAt = now + RESPAWN_MS;
      bestTarget.invincibleUntil = null;
      bestTarget.reloadingUntil = null;
      shooter.kills += 1;
      shooter.killStreak += 1;
      this.killFeedEvents.push({
        id: crypto.randomUUID(),
        killerId: shooter.id,
        killerName: shooter.name,
        victimId: bestTarget.id,
        victimName: bestTarget.name,
        weaponId: shooter.weaponId,
        isHeadshot: bestHitPart === 'head',
        killStreak: shooter.killStreak,
        createdAt: now
      });
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
    this.winnerId = [...this.players.values()].sort(comparePlayersByResult)[0]?.id ?? null;
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

function comparePlayersByResult(a: PlayerState, b: PlayerState) {
  const kdDiff = getKdSortValue(b) - getKdSortValue(a);
  if (kdDiff !== 0) return kdDiff;
  return b.totalDamage - a.totalDamage;
}

function getKdSortValue(player: PlayerState) {
  if (player.deaths === 0) return player.kills === 0 ? 0 : player.kills + 1;
  return player.kills / player.deaths;
}

function clampArena(position: Vec3): Vec3 {
  return {
    x: Math.max(-22.5, Math.min(22.5, position.x)),
    y: Math.max(0, Math.min(7.5, position.y)),
    z: Math.max(-22.5, Math.min(22.5, position.z))
  };
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function rayPlayerHitboxesHit(origin: Vec3, direction: Vec3, target: PlayerState) {
  const scaleY = target.crouching ? PLAYER_CROUCH_HEIGHT / PLAYER_STAND_HEIGHT : 1;
  const localOrigin = rotateY(
    {
      x: origin.x - target.position.x,
      y: (origin.y - target.position.y) / scaleY,
      z: origin.z - target.position.z
    },
    -target.rotationY
  );
  const localDirection = normalize(
    rotateY(
      {
        x: direction.x,
        y: direction.y / scaleY,
        z: direction.z
      },
      -target.rotationY
    )
  );

  let best: { distance: number; hitPart: HitPart } | null = null;
  for (const hitbox of PLAYER_HITBOXES) {
    const hitDistance = rayBoxHit(localOrigin, localDirection, hitbox.position, hitbox.size);
    if (hitDistance === null) continue;
    const localPoint = {
      x: localOrigin.x + localDirection.x * hitDistance,
      y: (localOrigin.y + localDirection.y * hitDistance) * scaleY,
      z: localOrigin.z + localDirection.z * hitDistance
    };
    const rotatedPoint = rotateY(localPoint, target.rotationY);
    const worldPoint = {
      x: rotatedPoint.x + target.position.x,
      y: rotatedPoint.y + target.position.y,
      z: rotatedPoint.z + target.position.z
    };
    const worldDistance = Math.hypot(worldPoint.x - origin.x, worldPoint.y - origin.y, worldPoint.z - origin.z);
    if (!best || worldDistance < best.distance) best = { distance: worldDistance, hitPart: hitbox.hitPart };
  }
  return best;
}

function rayBoxHit(origin: Vec3, direction: Vec3, position: Vec3, size: Vec3) {
  const min = { x: position.x - size.x * 0.5, y: position.y - size.y * 0.5, z: position.z - size.z * 0.5 };
  const max = { x: position.x + size.x * 0.5, y: position.y + size.y * 0.5, z: position.z + size.z * 0.5 };
  let tMin = 0;
  let tMax = Number.POSITIVE_INFINITY;

  for (const axis of ['x', 'y', 'z'] as const) {
    if (Math.abs(direction[axis]) < 0.0001) {
      if (origin[axis] < min[axis] || origin[axis] > max[axis]) return null;
      continue;
    }
    const inv = 1 / direction[axis];
    let t1 = (min[axis] - origin[axis]) * inv;
    let t2 = (max[axis] - origin[axis]) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  return tMin >= 0 ? tMin : null;
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.z * sin,
    y: v.y,
    z: v.x * sin + v.z * cos
  };
}
