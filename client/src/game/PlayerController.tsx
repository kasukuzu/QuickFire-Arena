import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WEAPONS } from './WeaponSystem';
import type { ClientMessage, PlayerState, RoomSnapshot, Vec3 } from './types';

type Props = {
  player: PlayerState;
  snapshot: RoomSnapshot;
  send: (message: ClientMessage) => void;
  onScoreboard: (open: boolean) => void;
};

const keys = new Set<string>();

export default function PlayerController({ player, snapshot, send, onScoreboard }: Props) {
  const { camera, gl } = useThree();
  const fpsCamera = camera as THREE.PerspectiveCamera;
  const yaw = useRef(player.rotationY);
  const pitch = useRef(player.pitch);
  const position = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
  const velocityY = useRef(0);
  const lastInputAt = useRef(0);
  const lastShotAt = useRef(0);
  const firing = useRef(false);
  const [ads, setAds] = useState(false);

  const weapon = WEAPONS[player.weaponId];
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const direction = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const lock = () => canvas.requestPointerLock();
    canvas.addEventListener('click', lock);
    return () => canvas.removeEventListener('click', lock);
  }, [gl.domElement]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || !player.alive) return;
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
      if (event.code === 'KeyR') send({ type: 'reload' });
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
      if (event.code === 'Tab') onScoreboard(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 2) setAds(true);
      if (event.button === 0) {
        firing.current = true;
        if (player.weaponId === 'sr') fire();
      }
    };
    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 2) setAds(false);
      if (event.button === 0) firing.current = false;
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
  });

  useEffect(() => {
    if (!player.alive) {
      position.current.set(player.position.x, player.position.y, player.position.z);
    }
  }, [player.alive, player.position.x, player.position.y, player.position.z]);

  useFrame((_, delta) => {
    fpsCamera.fov = THREE.MathUtils.lerp(fpsCamera.fov, ads ? weapon.adsFov : 68, 0.18);
    fpsCamera.updateProjectionMatrix();

    if (!player.alive || snapshot.state !== 'playing') {
      camera.position.set(player.position.x, player.position.y + 1.6, player.position.z);
      return;
    }

    if (firing.current && player.weaponId !== 'sr') {
      fire();
    }

    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 3.0 : player.weaponId === 'smg' ? 7.2 : 6.3;
    const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    direction.set(strafe, 0, -forward);
    if (direction.lengthSq() > 0) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      position.current.addScaledVector(direction, speed * delta);
    }

    if (keys.has('Space') && position.current.y <= 1.01) {
      velocityY.current = 6.5;
    }
    velocityY.current -= 16 * delta;
    position.current.y = Math.max(1, position.current.y + velocityY.current * delta);
    if (position.current.y === 1) velocityY.current = 0;

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

  function fire() {
    if (!player.alive || player.ammo <= 0 || player.reloadingUntil) return;
    const now = performance.now();
    if (now - lastShotAt.current < weapon.fireIntervalMs) return;
    lastShotAt.current = now;
    const shotDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    send({
      type: 'shoot',
      origin: toVec3(camera.position),
      direction: toVec3(shotDirection)
    });
  }

  return null;
}

function toVec3(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}
