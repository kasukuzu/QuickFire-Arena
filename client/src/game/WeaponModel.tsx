import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeaponId } from './types';
import { WEAPONS } from './weapons';

type Props = {
  weaponId: WeaponId;
  ads: boolean;
  recoil: number;
  moving: boolean;
  crouching: boolean;
  firing: boolean;
  reloading: boolean;
  shotPulse: number;
};

const BASE_OFFSET = new THREE.Vector3(0.42, -0.34, -0.82);
const HOLO_ADS_OFFSET = new THREE.Vector3(0.015, -0.155, -0.72);
const SMG_ADS_OFFSET = new THREE.Vector3(0.02, -0.16, -0.68);
const SR_ADS_OFFSET = new THREE.Vector3(0.0, -0.64, -0.92);

export function getMuzzleWorldPosition(camera: THREE.Camera, weaponId: WeaponId, ads: boolean) {
  const offset = getWeaponLocalOffset(weaponId, ads).add(getMuzzleLocalOffset(weaponId));
  return offset.applyQuaternion(camera.quaternion).add(camera.position);
}

export default function WeaponModel({ weaponId, ads, recoil, moving, crouching, firing, reloading, shotPulse }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const weapon = WEAPONS[weaponId];
  const currentOffset = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const target = getWeaponLocalOffset(weaponId, ads);
    const bob = moving ? Math.sin(state.clock.elapsedTime * 10) * 0.025 : 0;
    const visualRecoil = recoil * (ads ? 0.55 : 1);
    currentOffset.lerp(target, 0.22);
    const local = currentOffset
      .clone()
      .add(new THREE.Vector3(0, bob - visualRecoil * 0.08 + (reloading ? -0.08 : 0) + (crouching ? -0.035 : 0), visualRecoil * 0.16));
    group.position.copy(camera.position).add(local.applyQuaternion(camera.quaternion));
    group.quaternion.copy(camera.quaternion);
    group.rotateX(-visualRecoil * 0.08);
    group.rotateZ((moving && !ads ? Math.sin(state.clock.elapsedTime * 8) * 0.018 : 0) + visualRecoil * 0.025);

    if (flashRef.current) {
      const startedAt = Number(flashRef.current.userData.startedAt ?? -1);
      const age = state.clock.elapsedTime - startedAt;
      flashRef.current.visible = age < 0.055;
      const scale = Math.max(0.01, 1 - age / 0.055) * weapon.muzzleScale;
      flashRef.current.scale.setScalar(scale);
    }
  });

  useFrame((state) => {
    if (!flashRef.current) return;
    if (shotPulse !== flashRef.current.userData.shotPulse) {
      flashRef.current.userData.shotPulse = shotPulse;
      flashRef.current.userData.startedAt = state.clock.elapsedTime;
      flashRef.current.visible = firing || shotPulse > 0;
    }
  });

  return (
    <group ref={groupRef} userData={{ type: 'weaponModel' }}>
      {weaponId === 'ar' ? <ARModel /> : weaponId === 'smg' ? <SMGModel /> : <SRModel />}
      <mesh ref={flashRef} position={getMuzzleLocalOffset(weaponId).toArray()} visible={false}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={weaponId === 'sr' ? '#ffd27a' : '#fff1a6'} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function ARModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.18]} size={[0.2, 0.18, 0.62]} color="#262c2d" />
      <GunBox position={[0, -0.16, -0.08]} size={[0.12, 0.3, 0.18]} color="#1f2424" />
      <GunBox position={[0, 0.1, -0.22]} size={[0.25, 0.08, 0.38]} color="#3a4140" />
      <GunBox position={[0, 0.01, -0.62]} size={[0.08, 0.08, 0.45]} color="#151818" />
      <GunBox position={[0, -0.03, 0.22]} size={[0.22, 0.16, 0.24]} color="#303735" />
    </group>
  );
}

function SMGModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.12]} size={[0.22, 0.18, 0.44]} color="#22282a" />
      <GunBox position={[0.01, -0.18, -0.04]} size={[0.11, 0.32, 0.14]} color="#171c1e" />
      <GunBox position={[0, 0.1, -0.2]} size={[0.26, 0.07, 0.24]} color="#3b4549" />
      <GunBox position={[0, 0, -0.45]} size={[0.08, 0.08, 0.25]} color="#141719" />
    </group>
  );
}

function SRModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.22]} size={[0.18, 0.17, 0.82]} color="#222625" />
      <GunBox position={[0, -0.16, -0.02]} size={[0.1, 0.28, 0.16]} color="#151817" />
      <GunBox position={[0, 0.16, -0.18]} size={[0.22, 0.13, 0.32]} color="#111414" />
      <GunBox position={[0, 0.02, -0.82]} size={[0.06, 0.06, 0.62]} color="#101212" />
      <mesh position={[0, 0.24, -0.18]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
        <meshStandardMaterial color="#171a1a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function GunBox({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh castShadow position={position} userData={{ type: 'weaponModel' }}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.25} />
    </mesh>
  );
}

function getWeaponLocalOffset(weaponId: WeaponId, ads: boolean) {
  if (!ads) return BASE_OFFSET.clone();
  if (weaponId === 'sr') return SR_ADS_OFFSET.clone();
  if (weaponId === 'smg') return SMG_ADS_OFFSET.clone();
  return HOLO_ADS_OFFSET.clone();
}

function getMuzzleLocalOffset(weaponId: WeaponId) {
  const z = weaponId === 'sr' ? -1.16 : weaponId === 'ar' ? -0.86 : -0.62;
  return new THREE.Vector3(0, 0.02, z);
}
