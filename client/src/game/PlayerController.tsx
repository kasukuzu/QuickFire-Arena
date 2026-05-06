import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeaponSystem } from './WeaponSystem';
import { getMuzzleWorldPosition } from './WeaponModel';
import { MAPS } from './maps/mapDefinitions';
import { WEAPONS } from './weapons';
import { PLAYER_HITBOXES } from './hitboxes';
import type { ClientMessage, HitPart, MapId, PlayerState, RoomSnapshot, Vec3 } from './types';

type Props = {
  player: PlayerState;
  snapshot: RoomSnapshot;
  activeMapId: MapId;
  send: (message: ClientMessage) => void;
  onScoreboard: (open: boolean) => void;
  onWeaponViewChange: (state: { ads: boolean; recoil: number; firing: boolean; moving: boolean; crouching: boolean; shotPulse: number }) => void;
  onShotVisual: (
    tracer: { from: Vec3; to: Vec3 },
    impact: { position: Vec3; kind: 'world' | 'hit' }
  ) => void;
};

const keys = new Set<string>();
const PLAYER_RADIUS = 0.45;
const GROUND_Y = 0;
const STAND_CAMERA_HEIGHT = 1.6;
const CROUCH_CAMERA_HEIGHT = 1.02;
const STAND_PLAYER_HEIGHT = 1.8;
const CROUCH_PLAYER_HEIGHT = 1.22;
const CROUCH_LERP_SPEED = 10;
const CROUCH_SPEED_MULTIPLIER = 0.65;
const BASE_FOV = 75;

export default function PlayerController({ player, snapshot, activeMapId, send, onScoreboard, onWeaponViewChange, onShotVisual }: Props) {
  const { camera, gl } = useThree();
  const fpsCamera = camera as THREE.PerspectiveCamera;
  const yaw = useRef(player.rotationY);
  const pitch = useRef(player.pitch);
  const position = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
  const velocityY = useRef(0);
  const lastInputAt = useRef(0);
  const movingRef = useRef(false);
  const cameraHeight = useRef(STAND_CAMERA_HEIGHT);
  const playerHeight = useRef(STAND_PLAYER_HEIGHT);
  const weaponSystem = useWeaponSystem();
  const playerRef = useRef(player);
  const previousAlive = useRef(player.alive);
  const sendRef = useRef(send);
  const snapshotRef = useRef(snapshot);
  const weaponSystemRef = useRef(weaponSystem);
  const fireRef = useRef<() => void>(() => undefined);
  const canShootRef = useRef<() => boolean>(() => false);
  const adsMouseDown = useRef(false);
  const adsKeyDown = useRef(false);

  const weaponId = player.weaponId ?? 'ar';
  const weapon = WEAPONS[weaponId];
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  playerRef.current = player;
  snapshotRef.current = snapshot;
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
      if (event.code === 'KeyK') {
        adsKeyDown.current = true;
        updateAdsInput();
      }
      if (event.code === 'KeyR') sendRef.current({ type: 'reload' });
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
      if (event.code === 'Tab') onScoreboard(false);
      if (event.code === 'KeyK') {
        adsKeyDown.current = false;
        updateAdsInput();
      }
    };
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 2) {
        adsMouseDown.current = true;
        updateAdsInput();
      }
      if (event.button === 0) {
        if (canShootRef.current() && playerRef.current.weaponId) {
          weaponSystemRef.current.startFire(playerRef.current.weaponId, () => fireRef.current());
        }
      }
    };
    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        adsMouseDown.current = false;
        updateAdsInput();
      }
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

  function updateAdsInput() {
    if ((adsMouseDown.current || adsKeyDown.current) && canAds()) {
      weaponSystemRef.current.startAds();
    } else {
      weaponSystemRef.current.stopAds();
    }
  }

  useEffect(() => {
    if (!player.alive) {
      position.current.set(player.position.x, player.position.y, player.position.z);
    }
    if (!previousAlive.current && player.alive) {
      position.current.set(player.position.x, player.position.y, player.position.z);
      yaw.current = player.rotationY;
      pitch.current = player.pitch;
      velocityY.current = 0;
      weaponSystem.stopAds();
      weaponSystem.stopFire();
      cameraHeight.current = STAND_CAMERA_HEIGHT;
      playerHeight.current = STAND_PLAYER_HEIGHT;
    }
    previousAlive.current = player.alive;
  }, [player.alive, player.position.x, player.position.y, player.position.z, player.rotationY, player.pitch, weaponSystem]);

  useFrame((_, delta) => {
    weaponSystem.updateRecoil(delta);
    const crouchRequested = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const canStand = !hasHeadBlock(position.current, playerHeight.current, activeMapId);
    const crouching = crouchRequested || !canStand;
    const targetCameraHeight = crouching ? CROUCH_CAMERA_HEIGHT : STAND_CAMERA_HEIGHT;
    const targetPlayerHeight = crouching ? CROUCH_PLAYER_HEIGHT : STAND_PLAYER_HEIGHT;
    cameraHeight.current = THREE.MathUtils.lerp(cameraHeight.current, targetCameraHeight, Math.min(1, delta * CROUCH_LERP_SPEED));
    playerHeight.current = THREE.MathUtils.lerp(playerHeight.current, targetPlayerHeight, Math.min(1, delta * CROUCH_LERP_SPEED));

    onWeaponViewChange({
      ads: weaponSystem.ads,
      recoil: weaponSystem.recoil,
      firing: weaponSystem.firing,
      moving: movingRef.current,
      crouching,
      shotPulse: weaponSystem.shotPulse
    });

    const targetFov = weaponSystem.ads ? getAdsFov(BASE_FOV, weapon.zoomMultiplier) : BASE_FOV;
    fpsCamera.fov = THREE.MathUtils.lerp(fpsCamera.fov, targetFov, 0.18);
    fpsCamera.updateProjectionMatrix();

    if (!player.alive || snapshot.state !== 'playing') {
      weaponSystem.stopAds();
      camera.position.set(player.position.x, player.position.y + cameraHeight.current, player.position.z);
      return;
    }
    if (!canAds()) weaponSystem.stopAds();

    weaponSystem.updateAutomaticFire(weaponId, canShoot(), fire);

    const baseSpeed = player.weaponId === 'smg' ? 7.2 : 6.3;
    const speed = baseSpeed * (crouching ? CROUCH_SPEED_MULTIPLIER : 1);
    const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    direction.set(strafe, 0, -forward);
    movingRef.current = direction.lengthSq() > 0;
    const horizontalMove = new THREE.Vector3();
    if (direction.lengthSq() > 0) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      horizontalMove.copy(direction).multiplyScalar(speed * delta);
    }

    if (keys.has('Space') && isGrounded(position.current, activeMapId)) {
      velocityY.current = 6.5;
    }
    velocityY.current -= 16 * delta;
    const verticalMove = velocityY.current * delta;
    const steps = Math.max(1, Math.ceil(Math.max(horizontalMove.length(), Math.abs(verticalMove)) / 0.22));

    for (let step = 0; step < steps; step += 1) {
      const previousY = position.current.y;
      const nextHorizontal = position.current.clone().addScaledVector(horizontalMove, 1 / steps);
      position.current.copy(resolveHorizontalCollision(nextHorizontal, playerHeight.current, activeMapId));
      position.current.y += verticalMove / steps;

      if (verticalMove > 0) {
        const ceilingY = getCeilingY(position.current, previousY, playerHeight.current, activeMapId);
        if (ceilingY !== null) {
          position.current.y = ceilingY;
          velocityY.current = 0;
          break;
        }
      }

      const landingY = getLandingY(position.current, previousY, activeMapId);
      if (position.current.y <= landingY) {
        position.current.y = landingY;
        velocityY.current = 0;
        break;
      }
    }

    position.current.x = THREE.MathUtils.clamp(position.current.x, -22.5, 22.5);
    position.current.z = THREE.MathUtils.clamp(position.current.z, -22.5, 22.5);

    euler.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler);
    camera.position.set(position.current.x, position.current.y + cameraHeight.current, position.current.z);

    const now = performance.now();
    if (now - lastInputAt.current > 50) {
      lastInputAt.current = now;
      send({
        type: 'input',
        position: toVec3(position.current),
        rotationY: yaw.current,
        pitch: pitch.current,
        crouching
      });
    }
  });

  function canShoot() {
    return (
      snapshot.state === 'playing' &&
      player.alive &&
      Boolean(player.weaponId) &&
      player.ammo > 0 &&
      !player.reloadingUntil &&
      !(player.invincibleUntil && player.invincibleUntil > snapshot.serverTime)
    );
  }

  function canAds() {
    const currentPlayer = playerRef.current;
    const currentSnapshot = snapshotRef.current;
    return (
      currentSnapshot.state === 'playing' &&
      currentPlayer.alive &&
      !currentPlayer.reloadingUntil &&
      !(currentPlayer.invincibleUntil && currentPlayer.invincibleUntil > currentSnapshot.serverTime)
    );
  }

  function fire() {
    if (!canShoot()) return;
    if (!player.weaponId) return;
    const shotDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const origin = camera.position.clone();
    const visualHit = getVisualHit(origin, shotDirection, snapshot.players, player.id, weapon.range, activeMapId);
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
      hitPart: visualHit.hitPart ?? null,
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
  range: number,
  activeMapId: MapId
) {
  let nearestDistance = range;
  let point = origin.clone().addScaledVector(direction, range);
  let playerId: string | undefined;
  let hitPart: HitPart | undefined;

  for (const player of players) {
    if (player.id === localPlayerId || !player.alive) continue;
    const hit = rayPlayerHit(origin, direction, player);
    if (hit && hit.distance < nearestDistance) {
      nearestDistance = hit.distance;
      point = origin.clone().addScaledVector(direction, hit.distance);
      playerId = player.id;
      hitPart = hit.hitPart;
    }
  }

  for (const box of MAPS[activeMapId].collisionBoxes) {
    const hitDistance = rayBoxHit(origin, direction, box.position, box.size);
    if (hitDistance !== null && hitDistance < nearestDistance) {
      nearestDistance = hitDistance;
      point = origin.clone().addScaledVector(direction, hitDistance);
      playerId = undefined;
      hitPart = undefined;
    }
  }

  const floorDistance = rayPlaneYHit(origin, direction, 0);
  if (floorDistance !== null && floorDistance < nearestDistance) {
    nearestDistance = floorDistance;
    point = origin.clone().addScaledVector(direction, floorDistance);
    playerId = undefined;
    hitPart = undefined;
  }

  return { point, playerId, hitPart };
}

function rayPlayerHit(origin: THREE.Vector3, direction: THREE.Vector3, player: PlayerState) {
  const scaleY = player.crouching ? CROUCH_PLAYER_HEIGHT / STAND_PLAYER_HEIGHT : 1;
  const inverseYaw = -player.rotationY;
  const localOrigin = origin.clone().sub(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
  localOrigin.applyAxisAngle(new THREE.Vector3(0, 1, 0), inverseYaw);
  localOrigin.y /= scaleY;
  const localDirection = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), inverseYaw);
  localDirection.y /= scaleY;
  localDirection.normalize();

  let best: { distance: number; hitPart: HitPart } | null = null;
  for (const hitbox of PLAYER_HITBOXES) {
    const hitDistance = rayBoxHit(localOrigin, localDirection, hitbox.position, hitbox.size);
    if (hitDistance !== null && (!best || hitDistance < best.distance)) {
      const localPoint = localOrigin.clone().addScaledVector(localDirection, hitDistance);
      localPoint.y *= scaleY;
      const worldPoint = localPoint
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY)
        .add(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
      best = { distance: worldPoint.distanceTo(origin), hitPart: hitbox.hitPart };
    }
  }
  return best;
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
  return Math.abs(point.x) <= 23.5 && Math.abs(point.z) <= 23.5 ? distance : null;
}

function toVec3(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function getAdsFov(baseFov: number, zoomMultiplier: number) {
  return baseFov / zoomMultiplier;
}

function isGrounded(position: THREE.Vector3, activeMapId: MapId) {
  return Math.abs(position.y - getLandingY(position, position.y + 0.05, activeMapId)) < 0.06;
}

function getLandingY(position: THREE.Vector3, previousY: number, activeMapId: MapId) {
  let landingY = GROUND_Y;
  if (position.y > previousY) return landingY;

  for (const surface of [...MAPS[activeMapId].walkableSurfaces, ...MAPS[activeMapId].collisionBoxes]) {
    const top = surface.position[1] + surface.size[1] * 0.5;
    const height = surface.size[1];
    const wasAbove = previousY >= top - 0.04;
    const crossedTop = position.y <= top + 0.04;
    const isReasonableStep = height <= 3.2 || MAPS[activeMapId].walkableSurfaces.some((walkable) => walkable.id === surface.id);
    const insideX = Math.abs(position.x - surface.position[0]) <= surface.size[0] * 0.5 + PLAYER_RADIUS * 0.8;
    const insideZ = Math.abs(position.z - surface.position[2]) <= surface.size[2] * 0.5 + PLAYER_RADIUS * 0.8;
    if (isReasonableStep && wasAbove && crossedTop && insideX && insideZ && top > landingY) landingY = top;
  }

  return landingY;
}

function getCeilingY(position: THREE.Vector3, previousY: number, currentHeight: number, activeMapId: MapId) {
  const previousHeadY = previousY + currentHeight;
  const currentHeadY = position.y + currentHeight;

  for (const box of MAPS[activeMapId].collisionBoxes) {
    const bottom = box.position[1] - box.size[1] * 0.5;
    const crossedBottom = previousHeadY <= bottom + 0.03 && currentHeadY >= bottom - 0.03;
    const insideX = Math.abs(position.x - box.position[0]) <= box.size[0] * 0.5 + PLAYER_RADIUS * 0.75;
    const insideZ = Math.abs(position.z - box.position[2]) <= box.size[2] * 0.5 + PLAYER_RADIUS * 0.75;
    if (crossedBottom && insideX && insideZ) return bottom - currentHeight - 0.03;
  }

  return null;
}

function hasHeadBlock(position: THREE.Vector3, currentHeight: number, activeMapId: MapId) {
  const standTop = position.y + STAND_PLAYER_HEIGHT;
  const currentTop = position.y + currentHeight;

  for (const box of MAPS[activeMapId].collisionBoxes) {
    const halfX = box.size[0] * 0.5 + PLAYER_RADIUS;
    const halfZ = box.size[2] * 0.5 + PLAYER_RADIUS;
    const dx = Math.abs(position.x - box.position[0]);
    const dz = Math.abs(position.z - box.position[2]);
    if (dx >= halfX || dz >= halfZ) continue;

    const bottom = box.position[1] - box.size[1] * 0.5;
    const top = box.position[1] + box.size[1] * 0.5;
    if (bottom < standTop && top > currentTop + 0.05) return true;
  }

  return false;
}

function resolveHorizontalCollision(nextPosition: THREE.Vector3, currentPlayerHeight: number, activeMapId: MapId) {
  const resolved = nextPosition.clone();
  const playerBottom = resolved.y;
  const playerTop = resolved.y + currentPlayerHeight;

  for (const box of MAPS[activeMapId].collisionBoxes) {
    const bottom = box.position[1] - box.size[1] * 0.5;
    const top = box.position[1] + box.size[1] * 0.5;
    if (playerBottom >= top - 0.05 || playerTop <= bottom + 0.05) continue;

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
