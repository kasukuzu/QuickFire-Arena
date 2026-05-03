import type WebSocket from 'ws';
import { WEAPONS } from '../weapons.js';
import type { ClientMessage, PlayerState, RoomSnapshot, ServerMessage, Vec3, WeaponId } from '../types.js';

const MATCH_MS = 5 * 60 * 1000;
const MAX_PLAYERS = 8;
const RESPAWN_MS = 5000;
const PLAYER_RADIUS = 0.55;
const PLAYER_HEIGHT = 1.8;

const SPAWNS: Vec3[] = [
  { x: -13, y: 1, z: -13 },
  { x: 13, y: 1, z: -13 },
  { x: -13, y: 1, z: 13 },
  { x: 13, y: 1, z: 13 },
  { x: 0, y: 1, z: -15 },
  { x: 0, y: 1, z: 15 },
  { x: -15, y: 1, z: 0 },
  { x: 15, y: 1, z: 0 }
];

type Client = {
  id: string;
  socket: WebSocket;
  lastShotAt: number;
};

export class GameRoom {
  readonly id: string;
  readonly createdAt = Date.now();
  state: RoomSnapshot['state'] = 'lobby';
  hostId = '';
  matchEndsAt: number | null = null;
  winnerId: string | null = null;
  private players = new Map<string, PlayerState>();
  private clients = new Map<string, Client>();
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
    const spawn = SPAWNS[this.players.size % SPAWNS.length];
    const player: PlayerState = {
      id,
      name: name.trim().slice(0, 18) || `Player ${this.players.size + 1}`,
      isHost,
      weaponId: weapon.id,
      position: { ...spawn },
      rotationY: 0,
      pitch: 0,
      hp: 100,
      ammo: weapon.magazineSize,
      kills: 0,
      deaths: 0,
      alive: true,
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
      return;
    }

    if (message.type === 'reload') {
      this.reload(player);
      return;
    }

    if (message.type === 'shoot') {
      this.shoot(playerId, message.origin, normalize(message.direction));
    }
  }

  snapshot(): RoomSnapshot {
    return {
      roomId: this.id,
      state: this.state,
      hostId: this.hostId,
      players: [...this.players.values()],
      maxPlayers: MAX_PLAYERS,
      matchEndsAt: this.matchEndsAt,
      serverTime: Date.now(),
      winnerId: this.winnerId
    };
  }

  private start() {
    this.state = 'playing';
    this.matchEndsAt = Date.now() + MATCH_MS;
    this.winnerId = null;
    let index = 0;
    for (const player of this.players.values()) {
      const weapon = WEAPONS[player.weaponId];
      Object.assign(player, {
        position: { ...SPAWNS[index++ % SPAWNS.length] },
        hp: 100,
        ammo: weapon.magazineSize,
        kills: 0,
        deaths: 0,
        alive: true,
        respawnAt: null,
        reloadingUntil: null
      });
    }
    this.broadcast();
  }

  private tick() {
    const now = Date.now();
    for (const player of this.players.values()) {
      if (!player.alive && player.respawnAt && now >= player.respawnAt && this.state === 'playing') {
        this.respawn(player);
      }
      if (player.reloadingUntil && now >= player.reloadingUntil) {
        player.ammo = WEAPONS[player.weaponId].magazineSize;
        player.reloadingUntil = null;
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

  private shoot(playerId: string, origin: Vec3, direction: Vec3) {
    const shooter = this.players.get(playerId);
    const client = this.clients.get(playerId);
    if (!shooter || !client || !shooter.alive || shooter.reloadingUntil) return;

    const now = Date.now();
    const weapon = WEAPONS[shooter.weaponId];
    if (now - client.lastShotAt < weapon.fireIntervalMs || shooter.ammo <= 0) return;
    client.lastShotAt = now;
    shooter.ammo -= 1;

    let bestTarget: PlayerState | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const target of this.players.values()) {
      if (target.id === playerId || !target.alive) continue;
      const hit = rayCapsuleHit(origin, direction, target.position);
      if (hit !== null && hit < bestDistance && hit <= weapon.range) {
        bestTarget = target;
        bestDistance = hit;
      }
    }

    if (!bestTarget) return;
    bestTarget.hp = Math.max(0, bestTarget.hp - weapon.damage);
    if (bestTarget.hp <= 0) {
      bestTarget.alive = false;
      bestTarget.deaths += 1;
      bestTarget.respawnAt = now + RESPAWN_MS;
      bestTarget.reloadingUntil = null;
      shooter.kills += 1;
    }
  }

  private respawn(player: PlayerState) {
    const weapon = WEAPONS[player.weaponId];
    const spawn = SPAWNS[Math.floor(Math.random() * SPAWNS.length)];
    player.position = { ...spawn };
    player.hp = 100;
    player.ammo = weapon.magazineSize;
    player.alive = true;
    player.respawnAt = null;
    player.reloadingUntil = null;
  }

  private finish() {
    this.state = 'result';
    this.matchEndsAt = null;
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

function clampArena(position: Vec3): Vec3 {
  return {
    x: Math.max(-17.5, Math.min(17.5, position.x)),
    y: Math.max(1, Math.min(5, position.y)),
    z: Math.max(-17.5, Math.min(17.5, position.z))
  };
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function rayCapsuleHit(origin: Vec3, direction: Vec3, targetPosition: Vec3) {
  const center = { x: targetPosition.x, y: targetPosition.y + PLAYER_HEIGHT * 0.45, z: targetPosition.z };
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
