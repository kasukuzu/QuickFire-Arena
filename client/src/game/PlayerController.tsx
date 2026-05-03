import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { warehouseCollisionBoxes, warehouseWalkableSurfaces } from './Map';
import { useWeaponSystem } from './WeaponSystem';
import { getMuzzleWorldPosition } from './WeaponModel';
import { WEAPONS } from './weapons';
import type { ClientMessage, PlayerState, RoomSnapshot, Vec3 } from './types';

type Props = {
  player: PlayerState;
  snapshot: RoomSnapshot;
  send: (message: ClientMessage) => void;
  onScoreboard: (open: boolean) => void;
  onWeaponViewChange: (state: { ads: boolean; recoil: number; firing: boolean; moving: boolean; shotPulse: number }) => void;
  onShotVisual: (
    tracer: { from: Vec3; to: Vec3 },
    impact: { position: Vec3; kind: 'world' | 'hit' }
  ) => void;
};

const keys = new Set<string>();
const PLAYER_RADIUS = 0.45;
const GROUND_Y = 1;

export default function PlayerController({ player, snapshot, send, onScoreboard, onWeaponViewChange, onShotVisual }: Props) {
  const { camera, gl } = useThree();
  const fpsCamera = camera as THREE.PerspectiveCamera;
  const yaw = useRef(player.rotationY);
  const pitch = useRef(player.pitch);
  const position = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
  const velocityY = useRef(0);
  const lastInputAt = useRef(0);
  const movingRef = useRef(false);
  const weaponSystem = useWeaponSystem();
  const playerRef = useRef(player);
  const sendRef = useRef(send);
  const weaponSystemRef = useRef(weaponSystem);
  const fireRef = useRef<() => void>(() => undefined);
  const canShootRef = useRef<() => boolean>(() => false);

  const weapon = WEAPONS[player.weaponId];
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  playerRef.current = player;
  sendRef.current = send;
  weaponSystemRef.current = weaponSystem;
  fireRef.current = fire;
  canShootRef.current = canShoot;

  useEffect(() => {
    const canvas = gl.domElement;
    const lock = () => canvas.requestPointerLock();
    canvas.addEventListener('click', lock);
    return () => canvas.removeEventListener('click', lock);
  }, [gl.domElement]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || !playerRef.current.alive) return;
      yaw.current -= event.movementX * 0.0022;
      pitch.current -= event.movementY * 0.0022;
      pitch.current = Math.max(-1.45, Math.min(1.45, pitch.current));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      keys.add(event.code);
      if (event.code === 'Tab') {
        event.preventDefault();
        onScoreboard(true);
      }
      if (event.code === 'KeyR') sendRef.current({ type: 'reload' });
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
      if (event.code === 'Tab') onScoreboard(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 2) weaponSystemRef.current.startAds();
      if (event.button === 0) {
        if (canShootRef.current()) {
          weaponSystemRef.current.startFire(playerRef.current.weaponId, () => fireRef.current());
        }
      }
    };
    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 2) weaponSystemRef.current.stopAds();
      if (event.button === 0) weaponSystemRef.current.stopFire();
    };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl.domElement, onScoreboard]);

  useEffect(() => {
    if (!player.alive) {
      position.current.set(player.position.x, player.position.y, player.position.z);
    }
  }, [player.alive, player.position.x, player.position.y, player.position.z]);

  useFrame((_, delta) => {
    weaponSystem.updateRecoil(delta);
    onWeaponViewChange({
      ads: weaponSystem.ads,
      recoil: weaponSystem.recoil,
      firing: weaponSystem.firing,
      moving: movingRef.current,
      shotPulse: weaponSystem.shotPulse
    });

    fpsCamera.fov = THREE.MathUtils.lerp(fpsCamera.fov, weaponSystem.ads ? weapon.adsFov : 68, 0.18);
    fpsCamera.updateProjectionMatrix();

    if (!player.alive || snapshot.state !== 'playing') {
      camera.position.set(player.position.x, player.position.y + 1.6, player.position.z);
      return;
    }

    weaponSystem.updateAutomaticFire(player.weaponId, canShoot(), fire);

    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 3.0 : player.weaponId === 'smg' ? 7.2 : 6.3;
    const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    direction.set(strafe, 0, -forward);
    movingRef.current = direction.lengthSq() > 0;
    if (direction.lengthSq() > 0) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      const nextPosition = position.current.clone().addScaledVector(direction, speed * delta);
      position.current.copy(resolveHorizontalCollision(nextPosition));
    }

    if (keys.has('Space') && isGrounded(position.current)) {
      velocityY.current = 6.5;
    }
    const previousY = position.current.y;
    velocityY.current -= 16 * delta;
    position.current.y += velocityY.current * delta;
    const landingY = getLandingY(position.current, previousY);
    if (position.current.y <= landingY) {
      position.current.y = landingY;
      velocityY.current = 0;
    }

    position.current.x = THREE.MathUtils.clamp(position.current.x, -17.5, 17.5);
    position.current.z = THREE.MathUtils.clamp(position.current.z, -17.5, 17.5);

    euler.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler);
    camera.position.set(position.current.x, position.current.y + (keys.has('ShiftLeft') ? 0.85 : 1.55), position.current.z);

    const now = performance.now();
    if (now - lastInputAt.current > 50) {
      lastInputAt.current = now;
      send({
        type: 'input',
        position: toVec3(position.current),
        rotationY: yaw.current,
        pitch: pitch.current
      });
    }
  });

  function canShoot() {
    return snapshot.state === 'playing' && player.alive && player.ammo > 0 && !player.reloadingUntil;
  }

  function fire() {
    if (!canShoot()) return;
    const shotDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const origin = camera.position.clone();
    const visualHit = getVisualHit(origin, shotDirection, snapshot.players, player.id, weapon.range);
    const muzzle = getMuzzleWorldPosition(camera, player.weaponId, weaponSystem.ads);
    onShotVisual(
      { from: toVec3(muzzle), to: toVec3(visualHit.point) },
      { position: toVec3(visualHit.point), kind: visualHit.playerId ? 'hit' : 'world' }
    );
    send({
      type: 'shoot',
      origin: toVec3(origin),
      direction: toVec3(shotDirection),
      hitPlayerId: visualHit.playerId ?? null,
      impactPoint: toVec3(visualHit.point)
    });
  }

  return null;
}

function getVisualHit(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  players: PlayerState[],
  localPlayerId: string,
  range: number
) {
  let nearestDistance = range;
  let point = origin.clone().addScaledVector(direction, range);
  let playerId: string | undefined;

  for (const player of players) {
    if (player.id === localPlayerId || !player.alive) continue;
    const hitDistance = rayPlayerHit(origin, direction, player);
    if (hitDistance !== null && hitDistance < nearestDistance) {
      nearestDistance = hitDistance;
      point = origin.clone().addScaledVector(direction, hitDistance);
      playerId = player.id;
    }
  }

  for (const box of warehouseCollisionBoxes) {
    const hitDistance = rayBoxHit(origin, direction, box.position, box.size);
    if (hitDistance !== null && hitDistance < nearestDistance) {
      nearestDistance = hitDistance;
      point = origin.clone().addScaledVector(direction, hitDistance);
      playerId = undefined;
    }
  }

  const floorDistance = rayPlaneYHit(origin, direction, 0);
  if (floorDistance !== null && floorDistance < nearestDistance) {
    nearestDistance = floorDistance;
    point = origin.clone().addScaledVector(direction, floorDistance);
    playerId = undefined;
  }

  return { point, playerId };
}

function rayPlayerHit(origin: THREE.Vector3, direction: THREE.Vector3, player: PlayerState) {
  const center = new THREE.Vector3(player.position.x, player.position.y + 0.8, player.position.z);
  const toTarget = center.clone().sub(origin);
  const projection = toTarget.dot(direction);
  if (projection < 0) return null;
  const closest = origin.clone().addScaledVector(direction, projection);
  return closest.distanceTo(center) <= 0.58 ? projection : null;
}

function rayBoxHit(origin: THREE.Vector3, direction: THREE.Vector3, position: [number, number, number], size: [number, number, number]) {
  const min = new THREE.Vector3(position[0] - size[0] * 0.5, position[1] - size[1] * 0.5, position[2] - size[2] * 0.5);
  const max = new THREE.Vector3(position[0] + size[0] * 0.5, position[1] + size[1] * 0.5, position[2] + size[2] * 0.5);
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

function rayPlaneYHit(origin: THREE.Vector3, direction: THREE.Vector3, y: number) {
  if (Math.abs(direction.y) < 0.0001) return null;
  const distance = (y - origin.y) / direction.y;
  if (distance < 0) return null;
  const point = origin.clone().addScaledVector(direction, distance);
  return Math.abs(point.x) <= 18.5 && Math.abs(point.z) <= 18.5 ? distance : null;
}

function toVec3(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function isGrounded(position: THREE.Vector3) {
  return Math.abs(position.y - getLandingY(position, position.y + 0.05)) < 0.06;
}

function getLandingY(position: THREE.Vector3, previousY: number) {
  let landingY = GROUND_Y;
  if (position.y > previousY) return landingY;

  for (const surface of warehouseWalkableSurfaces) {
    const top = surface.position[1] + surface.size[1] * 0.5 + GROUND_Y;
    const wasAbove = previousY >= top - 0.08;
    const insideX = Math.abs(position.x - surface.position[0]) <= surface.size[0] * 0.5 + PLAYER_RADIUS;
    const insideZ = Math.abs(position.z - surface.position[2]) <= surface.size[2] * 0.5 + PLAYER_RADIUS;
    if (wasAbove && insideX && insideZ && top > landingY) landingY = top;
  }

  return landingY;
}

function resolveHorizontalCollision(nextPosition: THREE.Vector3) {
  const resolved = nextPosition.clone();

  for (const box of warehouseCollisionBoxes) {
    const top = box.position[1] + box.size[1] * 0.5 + GROUND_Y;
    if (resolved.y >= top - 0.05) continue;

    const halfX = box.size[0] * 0.5 + PLAYER_RADIUS;
    const halfZ = box.size[2] * 0.5 + PLAYER_RADIUS;
    const dx = resolved.x - box.position[0];
    const dz = resolved.z - box.position[2];
    if (Math.abs(dx) >= halfX || Math.abs(dz) >= halfZ) continue;

    const pushX = halfX - Math.abs(dx);
    const pushZ = halfZ - Math.abs(dz);
    if (pushX < pushZ) {
      resolved.x += dx >= 0 ? pushX : -pushX;
    } else {
      resolved.z += dz >= 0 ? pushZ : -pushZ;
    }
  }

  return resolved;
}
