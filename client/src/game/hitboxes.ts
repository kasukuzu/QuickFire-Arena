import type { HitPart } from './types';

export type PlayerHitbox = {
  id: string;
  hitPart: HitPart;
  position: [number, number, number];
  size: [number, number, number];
};

export const PLAYER_HITBOXES: PlayerHitbox[] = [
  { id: 'left-leg', hitPart: 'leg', position: [-0.18, 0.45, 0], size: [0.28, 0.9, 0.28] },
  { id: 'right-leg', hitPart: 'leg', position: [0.18, 0.45, 0], size: [0.28, 0.9, 0.28] },
  { id: 'body', hitPart: 'body', position: [0, 1.12, 0], size: [0.7, 0.82, 0.35] },
  { id: 'left-arm', hitPart: 'arm', position: [-0.52, 1.1, 0], size: [0.25, 0.86, 0.25] },
  { id: 'right-arm', hitPart: 'arm', position: [0.52, 1.1, 0], size: [0.25, 0.86, 0.25] },
  { id: 'head', hitPart: 'head', position: [0, 1.62, 0], size: [0.6, 0.42, 0.6] },
  { id: 'helmet', hitPart: 'head', position: [0, 1.81, -0.02], size: [0.66, 0.12, 0.66] }
];

export const HIT_PART_DAMAGE_MULTIPLIER: Record<HitPart, number> = {
  head: 1.5,
  body: 1,
  arm: 1,
  leg: 1
};
