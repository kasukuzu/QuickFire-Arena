import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { WeaponId } from './types';

type WeaponAmmoDisplayProps = {
  weaponId: WeaponId;
  ammo: number;
  magazineSize: number;
  isReloading: boolean;
};

type LeftWristDisplayProps = {
  hp: number;
  maxHp: number;
  remainingMs: number;
};

const WEAPON_DISPLAY_TRANSFORMS: Record<WeaponId, { position: [number, number, number]; rotation: [number, number, number]; scale: number }> = {
  ar: {
    position: [0, 0.155, -0.18],
    rotation: [THREE.MathUtils.degToRad(-22), 0, 0],
    scale: 1
  },
  smg: {
    position: [0, 0.135, -0.12],
    rotation: [THREE.MathUtils.degToRad(-22), 0, 0],
    scale: 0.88
  },
  sr: {
    position: [0.11, 0.18, -0.28],
    rotation: [THREE.MathUtils.degToRad(-18), THREE.MathUtils.degToRad(8), 0],
    scale: 0.92
  }
};

export const WRIST_DISPLAY_POSITION: [number, number, number] = [0.035, 0.07, -0.08];
export const WRIST_DISPLAY_ROTATION: [number, number, number] = [THREE.MathUtils.degToRad(-36), THREE.MathUtils.degToRad(14), THREE.MathUtils.degToRad(4)];
export const WRIST_DISPLAY_SCALE = 1;

export function VRWeaponAmmoDisplay({ weaponId, ammo, magazineSize, isReloading }: WeaponAmmoDisplayProps) {
  const transform = WEAPON_DISPLAY_TRANSFORMS[weaponId];
  const ratio = Math.max(0, Math.min(1, ammo / magazineSize));
  const empty = ammo <= 0;
  const barColor = isReloading ? '#ffb347' : empty ? '#ff4d4d' : '#ffe36e';
  const text = isReloading ? 'RELOAD' : `${ammo}/${magazineSize}`;

  return (
    <group position={transform.position} rotation={transform.rotation} scale={transform.scale} userData={{ type: 'weaponModel' }}>
      <MonitorShell width={0.34} height={0.15} depth={0.035} />
      <GlowText position={[0, 0.024, 0.023]} fontSize={0.045} color={empty ? '#ffdbdb' : '#f4fbff'} anchorX="center">
        {text}
      </GlowText>
      <HudBar position={[0, -0.045, 0.025]} width={0.24} height={0.022} ratio={isReloading ? 0.72 : ratio} color={barColor} />
    </group>
  );
}

export function VRLeftWristDisplay({ hp, maxHp, remainingMs }: LeftWristDisplayProps) {
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
  const hpColor = hp <= 20 ? '#ff4d4d' : hp <= 50 ? '#ffe066' : '#b9ff6a';
  const timeColor = remainingMs <= 30000 ? '#ff8a7a' : remainingMs <= 60000 ? '#ffe066' : '#f7fbff';
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');

  return (
    <group position={WRIST_DISPLAY_POSITION} rotation={WRIST_DISPLAY_ROTATION} scale={WRIST_DISPLAY_SCALE}>
      <MonitorShell width={0.46} height={0.3} depth={0.045} />
      <GlowText position={[0, 0.095, 0.028]} fontSize={0.045} color={timeColor} anchorX="center">
        {`${minutes}:${seconds}`}
      </GlowText>
      <GlowText position={[0, 0.01, 0.028]} fontSize={0.082} color="#f4fbff" anchorX="center" outlineWidth={0.006}>
        {hp}
      </GlowText>
      <GlowText position={[-0.17, -0.03, 0.028]} fontSize={0.022} color="#d8f3ff" anchorX="left">
        HP
      </GlowText>
      <HudBar position={[0, -0.09, 0.03]} width={0.34} height={0.03} ratio={hpRatio} color={hpColor} />
    </group>
  );
}

function MonitorShell({ width, height, depth }: { width: number; height: number; depth: number }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -depth * 0.55]}>
        <boxGeometry args={[width + 0.04, height + 0.04, depth]} />
        <meshStandardMaterial color="#11191d" roughness={0.58} metalness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#102a32" transparent opacity={0.92} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[width * 0.92, height * 0.78]} />
        <meshBasicMaterial color="#22454f" transparent opacity={0.34} depthWrite={false} />
      </mesh>
    </group>
  );
}

function HudBar({ position, width, height, ratio, color }: { position: [number, number, number]; width: number; height: number; ratio: number; color: string }) {
  const safeRatio = Math.max(0.02, Math.min(1, ratio));

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#081318" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh position={[-width * (1 - safeRatio) * 0.5, 0, 0.004]}>
        <planeGeometry args={[width * safeRatio, height]} />
        <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GlowText({
  children,
  position,
  fontSize,
  color,
  anchorX,
  outlineWidth = 0.004
}: {
  children: string | number;
  position: [number, number, number];
  fontSize: number;
  color: string;
  anchorX: 'left' | 'center' | 'right';
  outlineWidth?: number;
}) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      outlineWidth={outlineWidth}
      outlineColor="#031218"
      outlineOpacity={0.82}
    >
      {children}
    </Text>
  );
}
