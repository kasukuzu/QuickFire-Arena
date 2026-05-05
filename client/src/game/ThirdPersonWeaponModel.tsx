import * as THREE from 'three';
import type { WeaponId } from './types';

type Props = {
  weaponId: WeaponId;
};

export default function ThirdPersonWeaponModel({ weaponId }: Props) {
  return (
    <group position={[0.48, 1.12, -0.34]} rotation={[0.08, 0, 0]} userData={{ type: 'weaponModel' }}>
      {weaponId === 'ar' ? <ARModel /> : weaponId === 'smg' ? <SMGModel /> : <SRModel />}
    </group>
  );
}

export function getThirdPersonMuzzlePosition(player: { position: { x: number; y: number; z: number }; rotationY: number }, weaponId: WeaponId) {
  const local = new THREE.Vector3(0.48, 1.12, -0.34).add(getMuzzleOffset(weaponId));
  local.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY);
  return local.add(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
}

function ARModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.18]} size={[0.16, 0.14, 0.62]} color="#252d2d" />
      <GunBox position={[0, -0.12, -0.06]} size={[0.1, 0.24, 0.16]} color="#1a2020" />
      <GunBox position={[0, 0.08, -0.44]} size={[0.07, 0.07, 0.42]} color="#111515" />
      <GunBox position={[0, 0.05, 0.16]} size={[0.18, 0.13, 0.22]} color="#374040" />
    </group>
  );
}

function SMGModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.1]} size={[0.18, 0.14, 0.42]} color="#222a2b" />
      <GunBox position={[0, -0.13, -0.02]} size={[0.09, 0.24, 0.12]} color="#171c1d" />
      <GunBox position={[0, 0.04, -0.36]} size={[0.07, 0.07, 0.22]} color="#111515" />
    </group>
  );
}

function SRModel() {
  return (
    <group>
      <GunBox position={[0, 0, -0.3]} size={[0.14, 0.13, 0.86]} color="#202625" />
      <GunBox position={[0, -0.12, -0.02]} size={[0.08, 0.22, 0.14]} color="#121717" />
      <GunBox position={[0, 0.04, -0.86]} size={[0.05, 0.05, 0.58]} color="#0f1212" />
      <mesh position={[0, 0.2, -0.22]} rotation={[0, 0, Math.PI / 2]} userData={{ type: 'weaponModel' }}>
        <cylinderGeometry args={[0.06, 0.06, 0.28, 10]} />
        <meshStandardMaterial color="#111414" roughness={0.65} metalness={0.28} />
      </mesh>
    </group>
  );
}

function GunBox({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh castShadow position={position} userData={{ type: 'weaponModel' }}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.68} metalness={0.25} />
    </mesh>
  );
}

function getMuzzleOffset(weaponId: WeaponId) {
  return new THREE.Vector3(0, 0.04, weaponId === 'sr' ? -1.15 : weaponId === 'ar' ? -0.72 : -0.5);
}
