import type { HitPart } from './types.js';

export type PlayerHitbox = {
  id: string;
  hitPart: HitPart;
  position: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
};

export const PLAYER_HITBOXES: PlayerHitbox[] = [
  { id: 'left-leg', hitPart: 'leg', position: { x: -0.18, y: 0.45, z: 0 }, size: { x: 0.28, y: 0.9, z: 0.28 } },
  { id: 'right-leg', hitPart: 'leg', position: { x: 0.18, y: 0.45, z: 0 }, size: { x: 0.28, y: 0.9, z: 0.28 } },
  { id: 'body', hitPart: 'body', position: { x: 0, y: 1.12, z: 0 }, size: { x: 0.7, y: 0.82, z: 0.35 } },
  { id: 'left-arm', hitPart: 'arm', position: { x: -0.52, y: 1.1, z: 0 }, size: { x: 0.25, y: 0.86, z: 0.25 } },
  { id: 'right-arm', hitPart: 'arm', position: { x: 0.52, y: 1.1, z: 0 }, size: { x: 0.25, y: 0.86, z: 0.25 } },
  { id: 'head', hitPart: 'head', position: { x: 0, y: 1.62, z: 0 }, size: { x: 0.6, y: 0.42, z: 0.6 } },
  { id: 'helmet', hitPart: 'head', position: { x: 0, y: 1.81, z: -0.02 }, size: { x: 0.66, y: 0.12, z: 0.66 } }
];

export const HIT_PART_DAMAGE_MULTIPLIER: Record<HitPart, number> = {
  head: 1.5,
  body: 1,
  arm: 1,
  leg: 1
};
