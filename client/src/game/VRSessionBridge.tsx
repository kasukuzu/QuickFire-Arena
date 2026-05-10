import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { MAPS } from './maps/mapDefinitions';
import { useWeaponSystem } from './WeaponSystem';
import { PLAYER_HITBOXES } from './hitboxes';
import { WEAPONS } from './weapons';
import type { ClientMessage, HitPart, MapId, PlayerState, RoomSnapshot, Vec3 } from './types';

type Props = {
  player: PlayerState;
  snapshot: RoomSnapshot;
  activeMapId: MapId;
  send: (message: ClientMessage) => void;
  onShotVisual: (
    tracer: { from: Vec3; to: Vec3 },
    impact: { position: Vec3; kind: 'world' | 'hit' }
  ) => void;
  onDebugInput?: (debug: VRDebugState) => void;
};

export type VRDebugState = {
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  leftTrigger: number;
  rightTrigger: number;
  leftGrip: boolean;
  rightGrip: boolean;
  aPressed: boolean;
  bPressed: boolean;
  isVRMode: boolean;
};

const PLAYER_RADIUS = 0.45;
const GROUND_Y = 0;
const STAND_PLAYER_HEIGHT = 1.8;
const CROUCH_PLAYER_HEIGHT = 1.22;
const VR_MOVE_SPEED = 5.0;
const CROUCH_SPEED_MULTIPLIER = 0.65;
const SNAP_TURN_RAD = THREE.MathUtils.degToRad(30);
const SNAP_TURN_THRESHOLD = 0.7;

export default function VRSessionBridge({ player, snapshot, activeMapId, send, onShotVisual, onDebugInput }: Props) {
  const { camera, gl } = useThree();
  const rigRef = useRef<THREE.Group>(null);
  const leftController = useMemo(() => gl.xr.getController(0), [gl]);
  const rightController = useMemo(() => gl.xr.getController(1), [gl]);
  const leftGrip = useMemo(() => gl.xr.getControllerGrip(0), [gl]);
  const rightGrip = useMemo(() => gl.xr.getControllerGrip(1), [gl]);
  const position = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
  const velocityY = useRef(0);
  const yawOffset = useRef(player.rotationY);
  const lastInputAt = useRef(0);
  const snapReady = useRef(true);
  const previousA = useRef(false);
  const previousB = useRef(false);
  const previousRightTrigger = useRef(false);
  const weaponSystem = useWeaponSystem();
  const playerRef = useRef(player);
  const snapshotRef = useRef(snapshot);
  const sendRef = useRef(send);
  const weaponSystemRef = useRef(weaponSystem);
  const flashStartedAt = useRef(-1);
  const lastShotPulse = useRef(0);
  const muzzleRef = useRef<THREE.Group>(null);
  const [flashVisible, setFlashVisible] = useState(false);

  playerRef.current = player;
  snapshotRef.current = snapshot;
  sendRef.current = send;
  weaponSystemRef.current = weaponSystem;

  const weaponId = player.weaponId ?? 'ar';
  const weapon = WEAPONS[weaponId];

  useEffect(() => {
    gl.xr.enabled = true;
    const button = VRButton.createButton(gl);
    button.classList.add('quickfire-vr-button');
    document.body.appendChild(button);
    const rig = rigRef.current;
    if (rig) rig.add(camera);

    return () => {
      button.remove();
      if (camera.parent === rig) camera.removeFromParent();
      gl.xr.enabled = false;
    };
  }, [camera, gl]);

  useEffect(() => {
    const serverPosition = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
    if (!player.alive || position.current.distanceTo(serverPosition) > 4) {
      position.current.set(player.position.x, player.position.y, player.position.z);
    }
  }, [player.alive, player.position.x, player.position.y, player.position.z]);

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;
    const input = readQuestInput(gl);
    onDebugInput?.(input);

    weaponSystem.updateRecoil(delta);
    updateFlash();

    const canMove = snapshot.state === 'playing' && player.alive;
    const crouching = canMove && input.leftGrip;
    const height = crouching ? CROUCH_PLAYER_HEIGHT : STAND_PLAYER_HEIGHT;
    const speed = VR_MOVE_SPEED * (crouching ? CROUCH_SPEED_MULTIPLIER : 1);

    if (canMove) {
      applySnapTurn(input.rightStickX);
      movePlayer(input.leftStickX, input.leftStickY, speed, height, delta);
      handleJump(input.aPressed);
      handleReload(input.bPressed);
      handleAds(input.leftTrigger > 0.55);
      handleFire(input.rightTrigger > 0.55);
    } else {
      weaponSystem.stopAds();
      weaponSystem.stopFire();
    }

    rig.position.set(position.current.x, position.current.y, position.current.z);
    rig.rotation.y = yawOffset.current;

    const now = performance.now();
    if (now - lastInputAt.current > 50) {
      lastInputAt.current = now;
      send({
        type: 'input',
        position: toVec3(position.current),
        rotationY: getHeadYaw(),
        pitch: 0,
        crouching
      });
    }
  });

  function applySnapTurn(rightStickX: number) {
    if (Math.abs(rightStickX) < 0.35) {
      snapReady.current = true;
      return;
    }
    if (!snapReady.current || Math.abs(rightStickX) < SNAP_TURN_THRESHOLD) return;
    yawOffset.current += rightStickX > 0 ? -SNAP_TURN_RAD : SNAP_TURN_RAD;
    snapReady.current = false;
  }

  function movePlayer(stickX: number, stickY: number, speed: number, height: number, delta: number) {
    const forward = getHeadForward();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const horizontal = new THREE.Vector3()
      .addScaledVector(forward, -stickY)
      .addScaledVector(right, stickX);
    const previousY = position.current.y;

    if (horizontal.lengthSq() > 0.01) {
      horizontal.normalize();
      horizontal.multiplyScalar(speed * delta);
      const next = position.current.clone().add(horizontal);
      position.current.copy(resolveHorizontalCollision(next, height, activeMapId));
    }

    velocityY.current -= 16 * delta;
    position.current.y += velocityY.current * delta;
    const landingY = getLandingY(position.current, previousY, activeMapId);
    if (position.current.y <= landingY) {
      position.current.y = landingY;
      velocityY.current = 0;
    }
    position.current.x = THREE.MathUtils.clamp(position.current.x, -22.5, 22.5);
    position.current.z = THREE.MathUtils.clamp(position.current.z, -22.5, 22.5);
  }

  function handleJump(aPressed: boolean) {
    if (aPressed && !previousA.current && isGrounded(position.current, activeMapId)) {
      velocityY.current = 6.1;
    }
    previousA.current = aPressed;
  }

  function handleReload(bPressed: boolean) {
    if (bPressed && !previousB.current) sendRef.current({ type: 'reload' });
    previousB.current = bPressed;
  }

  function handleAds(adsPressed: boolean) {
    if (adsPressed && canAds()) weaponSystem.startAds();
    else weaponSystem.stopAds();
  }

  function handleFire(triggerPressed: boolean) {
    if (triggerPressed && canShoot()) {
      if (!previousRightTrigger.current) {
        weaponSystem.startFire(weaponId, fire);
      } else {
        weaponSystem.updateAutomaticFire(weaponId, true, fire);
      }
    } else {
      weaponSystem.stopFire();
    }
    previousRightTrigger.current = triggerPressed;
  }

  function fire() {
    if (!canShoot()) return;
    const muzzlePose = getMuzzleWorldPose(muzzleRef);
    if (!muzzlePose) return;
    const { origin, direction } = muzzlePose;
    const visualHit = getVisualHit(origin, direction, snapshot.players, player.id, weapon.range, activeMapId);
    flashStartedAt.current = performance.now();
    setFlashVisible(true);
    onShotVisual(
      { from: toVec3(origin), to: toVec3(visualHit.point) },
      { position: toVec3(visualHit.point), kind: visualHit.playerId ? 'hit' : 'world' }
    );
    sendRef.current({
      type: 'shoot',
      origin: toVec3(origin),
      direction: toVec3(direction),
      hitPlayerId: visualHit.playerId ?? null,
      hitPart: visualHit.hitPart ?? null,
      impactPoint: toVec3(visualHit.point)
    });
  }

  function canShoot() {
    const currentPlayer = playerRef.current;
    const currentSnapshot = snapshotRef.current;
    return (
      currentSnapshot.state === 'playing' &&
      currentPlayer.alive &&
      Boolean(currentPlayer.weaponId) &&
      currentPlayer.ammo > 0 &&
      !currentPlayer.reloadingUntil &&
      !(currentPlayer.invincibleUntil && currentPlayer.invincibleUntil > currentSnapshot.serverTime)
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

  function getHeadYaw() {
    const direction = getHeadForward();
    return Math.atan2(direction.x, -direction.z);
  }

  function getHeadForward() {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    if (direction.lengthSq() < 0.0001) direction.set(0, 0, -1);
    return direction.normalize();
  }

  function updateFlash() {
    if (lastShotPulse.current !== weaponSystem.shotPulse) {
      lastShotPulse.current = weaponSystem.shotPulse;
      flashStartedAt.current = performance.now();
      setFlashVisible(true);
    }
    if (flashVisible && performance.now() - flashStartedAt.current > 70) setFlashVisible(false);
  }

  return (
    <group ref={rigRef}>
      <primitive object={leftController} />
      <primitive object={rightController} />
      <primitive object={leftGrip} />
      <primitive object={rightGrip}>
        <VRWeaponModel weaponId={weaponId} ads={weaponSystem.ads} recoil={weaponSystem.recoil} flashVisible={flashVisible} muzzleRef={muzzleRef} />
      </primitive>
    </group>
  );
}

function VRWeaponModel({
  weaponId,
  ads,
  recoil,
  flashVisible,
  muzzleRef
}: {
  weaponId: keyof typeof WEAPONS;
  ads: boolean;
  recoil: number;
  flashVisible: boolean;
  muzzleRef: RefObject<THREE.Group | null>;
}) {
  const weapon = WEAPONS[weaponId];
  const scale = weaponId === 'sr' ? 1.15 : weaponId === 'smg' ? 0.82 : 1;
  const zRecoil = recoil * 0.04;
  const muzzleZ = getVRMuzzleZ(weaponId);
  return (
    <group position={[0.06, -0.04, -0.16 + zRecoil]} rotation={[THREE.MathUtils.degToRad(-10), 0, 0]} scale={scale} userData={{ type: 'weaponModel' }}>
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.12, weaponId === 'sr' ? 0.8 : weaponId === 'ar' ? 0.58 : 0.42]} />
        <meshStandardMaterial color="#252c2e" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.12, -0.12]}>
        <boxGeometry args={[0.08, 0.24, 0.12]} />
        <meshStandardMaterial color="#161b1d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.08, -0.22]}>
        <boxGeometry args={[0.16, 0.05, 0.22]} />
        <meshStandardMaterial color={ads ? '#d4ad58' : '#3d4748'} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, weaponId === 'sr' ? -0.74 : weaponId === 'ar' ? -0.55 : -0.42]}>
        <boxGeometry args={[0.045, 0.045, weaponId === 'sr' ? 0.52 : 0.3]} />
        <meshStandardMaterial color="#101414" roughness={0.55} metalness={0.35} />
      </mesh>
      {weaponId === 'sr' ? (
        <mesh position={[0, 0.16, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.26, 12]} />
          <meshStandardMaterial color="#111414" roughness={0.7} />
        </mesh>
      ) : null}
      <group ref={muzzleRef} position={[0, 0, muzzleZ]}>
        <mesh visible={flashVisible} scale={weapon.muzzleScale}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={weaponId === 'sr' ? '#ffd27a' : '#fff1a6'} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function readQuestInput(gl: THREE.WebGLRenderer): VRDebugState {
  const sources = [...(gl.xr.getSession()?.inputSources ?? [])];
  const left = sources.find((source) => source.handedness === 'left')?.gamepad;
  const right = sources.find((source) => source.handedness === 'right')?.gamepad;
  const leftAxes = getStick(left);
  const rightAxes = getStick(right);
  return {
    leftStickX: leftAxes.x,
    leftStickY: leftAxes.y,
    rightStickX: rightAxes.x,
    rightStickY: rightAxes.y,
    leftTrigger: getButtonValue(left, 0),
    rightTrigger: getButtonValue(right, 0),
    leftGrip: getButtonPressed(left, 1),
    rightGrip: getButtonPressed(right, 1),
    aPressed: getButtonPressed(right, 4),
    bPressed: getButtonPressed(right, 5),
    isVRMode: gl.xr.isPresenting
  };
}

function getStick(gamepad?: Gamepad) {
  if (!gamepad) return { x: 0, y: 0 };
  const x = gamepad.axes.length >= 4 ? gamepad.axes[2] : gamepad.axes[0] ?? 0;
  const y = gamepad.axes.length >= 4 ? gamepad.axes[3] : gamepad.axes[1] ?? 0;
  return { x: applyDeadzone(x), y: applyDeadzone(y) };
}

function getButtonValue(gamepad: Gamepad | undefined, index: number) {
  return gamepad?.buttons[index]?.value ?? 0;
}

function getButtonPressed(gamepad: Gamepad | undefined, index: number) {
  const button = gamepad?.buttons[index];
  return Boolean(button?.pressed || (button?.value ?? 0) > 0.55);
}

function applyDeadzone(value: number) {
  return Math.abs(value) < 0.16 ? 0 : value;
}

function getVRMuzzleZ(weaponId: keyof typeof WEAPONS) {
  return weaponId === 'sr' ? -0.92 : weaponId === 'ar' ? -0.7 : -0.54;
}

function getMuzzleWorldPose(muzzleRef: RefObject<THREE.Group | null>) {
  const muzzle = muzzleRef.current;
  if (!muzzle) return null;
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3(0, 0, -1);
  const quaternion = new THREE.Quaternion();
  muzzle.getWorldPosition(origin);
  muzzle.getWorldQuaternion(quaternion);
  direction.applyQuaternion(quaternion).normalize();
  return { origin, direction };
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

function toVec3(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}
