import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WEAPONS } from './weapons';
import type { PlayerState, RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  player: PlayerState;
};

export default function VRHud({ snapshot, player }: Props) {
  const rootRef = useRef<THREE.Group>(null);
  const remaining = snapshot.matchEndsAt ? Math.max(0, snapshot.matchEndsAt - snapshot.serverTime) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  const weapon = player.weaponId ? WEAPONS[player.weaponId] : null;
  const hpRatio = Math.max(0, Math.min(1, player.hp / 100));
  const hpColor = player.hp <= 20 ? '#ff4a3f' : player.hp <= 50 ? '#ffd34d' : '#42e184';
  const ammoRatio = weapon ? Math.max(0, Math.min(1, player.ammo / weapon.magazineSize)) : 0;
  const ammoColor = weapon && player.ammo === 0 ? '#ff4a3f' : '#ead46d';
  const reloadProgress = getReloadProgress(player, weapon, snapshot.serverTime);

  useFrame(({ camera }) => {
    const root = rootRef.current;
    if (!root) return;
    camera.getWorldPosition(root.position);
    camera.getWorldQuaternion(root.quaternion);
  });

  return (
    <group ref={rootRef}>
      <HpPanel position={[-0.82, -0.43, -1.82]} hp={player.hp} hpRatio={hpRatio} hpColor={hpColor} />
      <TimerPanel position={[0, 0.48, -1.82]} label={`${minutes}:${seconds}`} />
      <AmmoPanel
        position={[0.82, -0.43, -1.82]}
        weaponName={weapon?.name ?? '-'}
        ammo={`${player.ammo}/${weapon?.magazineSize ?? '-'}`}
        ammoRatio={ammoRatio}
        ammoColor={ammoColor}
        reloadProgress={reloadProgress}
      />
    </group>
  );
}

function HpPanel({
  position,
  hp,
  hpRatio,
  hpColor
}: {
  position: [number, number, number];
  hp: number;
  hpRatio: number;
  hpColor: string;
}) {
  return (
    <group position={position}>
      <CutPanel size={[0.62, 0.26]} cut={0.055} />
      <Text position={[-0.21, 0.045, 0.018]} fontSize={0.035} color="#111111" anchorX="left" anchorY="middle">
        HP
      </Text>
      <Text position={[0.2, 0.025, 0.018]} fontSize={0.1} color="#050505" anchorX="center" anchorY="middle">
        {hp}
      </Text>
      <HudBar position={[0, -0.085, 0.018]} width={0.46} height={0.04} ratio={hpRatio} color={hpColor} />
    </group>
  );
}

function TimerPanel({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <CutPanel size={[0.66, 0.2]} cut={0.06} variant="timer" />
      <Text position={[0, 0.012, 0.018]} fontSize={0.11} color="#050505" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function AmmoPanel({
  position,
  weaponName,
  ammo,
  ammoRatio,
  ammoColor,
  reloadProgress
}: {
  position: [number, number, number];
  weaponName: string;
  ammo: string;
  ammoRatio: number;
  ammoColor: string;
  reloadProgress: number | null;
}) {
  const reloading = reloadProgress !== null;
  return (
    <group position={position}>
      <CutPanel size={[0.66, 0.26]} cut={0.055} mirror />
      <Text position={[-0.23, 0.058, 0.018]} fontSize={0.035} color="#111111" anchorX="left" anchorY="middle">
        {reloading ? 'Reloading...' : weaponName}
      </Text>
      <Text position={[0.18, 0.02, 0.018]} fontSize={0.09} color="#050505" anchorX="center" anchorY="middle">
        {ammo}
      </Text>
      <HudBar position={[0, -0.085, 0.018]} width={0.5} height={0.04} ratio={reloading ? reloadProgress : ammoRatio} color={reloading ? '#ffb45d' : ammoColor} mirror />
    </group>
  );
}

function CutPanel({
  size,
  cut,
  variant = 'status',
  mirror = false
}: {
  size: [number, number];
  cut: number;
  variant?: 'status' | 'timer';
  mirror?: boolean;
}) {
  const shape = useCutShape(size, cut, variant, mirror);
  const backing = useCutShape([size[0] + 0.025, size[1] + 0.025], cut + 0.006, variant, mirror);
  return (
    <>
      <mesh position={[0, 0, -0.004]} renderOrder={50}>
        <shapeGeometry args={[backing]} />
        <meshBasicMaterial color="#53666a" transparent opacity={0.96} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0]} renderOrder={51}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#a9c1c6" transparent opacity={0.98} depthTest={false} depthWrite={false} />
      </mesh>
    </>
  );
}

function HudBar({
  position,
  width,
  height,
  ratio,
  color,
  mirror = false
}: {
  position: [number, number, number];
  width: number;
  height: number;
  ratio: number;
  color: string;
  mirror?: boolean;
}) {
  const backgroundShape = useBarShape(width, height, 1, mirror);
  const fillShape = useBarShape(width, height, ratio, mirror);
  const fillX = mirror ? (width * (1 - ratio)) / 2 : (-width * (1 - ratio)) / 2;

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} renderOrder={52}>
        <shapeGeometry args={[backgroundShape]} />
        <meshBasicMaterial color="#2f3839" transparent opacity={0.85} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={[fillX, 0, 0.004]} renderOrder={53}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial color={color} transparent opacity={0.98} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function useCutShape(size: [number, number], cut: number, variant: 'status' | 'timer', mirror: boolean) {
  return useMemo(() => {
    const [width, height] = size;
    const w = width / 2;
    const h = height / 2;
    const c = cut;
    const points =
      variant === 'timer'
        ? [
            [-w, h],
            [w, h],
            [w, -h + c],
            [w - c, -h],
            [-w + c, -h],
            [-w, -h + c]
          ]
        : [
            [-w + (mirror ? 0 : c), h],
            [w, h],
            [w, -h + (mirror ? c : 0)],
            [w - (mirror ? c : 0), -h],
            [-w, -h],
            [-w, h - (mirror ? 0 : c)]
          ];
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return shape;
  }, [size, cut, variant, mirror]);
}

function useBarShape(width: number, height: number, ratio: number, mirror: boolean) {
  return useMemo(() => {
    const safeRatio = Math.max(0.001, Math.min(1, ratio));
    const w = width * safeRatio;
    const h = height / 2;
    const c = Math.min(0.045, w * 0.35);
    const x0 = -w / 2;
    const x1 = w / 2;
    const points = mirror
      ? [
          [x0 + c, h],
          [x1, h],
          [x1 - c, -h],
          [x0, -h]
        ]
      : [
          [x0 + c, h],
          [x1, h],
          [x1 - c, -h],
          [x0, -h]
        ];
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return shape;
  }, [width, height, ratio, mirror]);
}

function getReloadProgress(player: PlayerState, weapon: typeof WEAPONS[keyof typeof WEAPONS] | null, serverTime: number) {
  if (!weapon || !player.reloadingUntil || player.reloadingUntil <= serverTime) return null;
  const startedAt = player.reloadingUntil - weapon.reloadMs;
  return Math.max(0, Math.min(1, (serverTime - startedAt) / weapon.reloadMs));
}
