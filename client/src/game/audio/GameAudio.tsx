import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { distanceVolume, playFootstep, playKillSound, playWeaponSound } from '../sound';
import type { PlayerState, RoomSnapshot, Vec3 } from '../types';

type Props = {
  snapshot: RoomSnapshot;
  localPlayerId: string;
};

type MotionState = {
  previous: Vec3;
  lastStepAt: number;
  grounded: boolean;
};

export default function GameAudio({ snapshot, localPlayerId }: Props) {
  const seenShots = useRef(new Set<string>());
  const seenKills = useRef(new Set<string>());
  const motion = useRef(new Map<string, MotionState>());

  useFrame(() => {
    const localPlayer = snapshot.players.find((player) => player.id === localPlayerId);
    if (!localPlayer) return;

    for (const event of snapshot.shotEvents) {
      if (seenShots.current.has(event.id)) continue;
      seenShots.current.add(event.id);
      const volume = event.shooterId === localPlayerId ? 0.9 : distanceVolume(localPlayer.position, event.position, 34) * 0.65;
      playWeaponSound(event.weaponId, volume);
    }

    for (const event of snapshot.killFeedEvents) {
      if (seenKills.current.has(event.id)) continue;
      seenKills.current.add(event.id);
      if (event.killerId === localPlayerId) playKillSound(0.75);
    }

    for (const player of snapshot.players) {
      updateFootstep(player, localPlayer, motion.current);
    }
  });

  return null;
}

function updateFootstep(player: PlayerState, localPlayer: PlayerState, states: Map<string, MotionState>) {
  const now = performance.now();
  const current = player.position;
  const state = states.get(player.id) ?? { previous: { ...current }, lastStepAt: now, grounded: true };
  const dx = current.x - state.previous.x;
  const dz = current.z - state.previous.z;
  const horizontalDistance = Math.hypot(dx, dz);
  const grounded = Math.abs(current.y - state.previous.y) < 0.04;
  const moving = player.alive && grounded && horizontalDistance > 0.015;
  const interval = player.crouching ? 560 : 390;

  if (moving && now - state.lastStepAt >= interval) {
    const baseVolume = player.id === localPlayer.id ? 0.45 : distanceVolume(localPlayer.position, player.position, 18) * 0.28;
    playFootstep(player.crouching ? baseVolume * 0.3 : baseVolume);
    state.lastStepAt = now;
  }

  state.previous = { ...current };
  state.grounded = grounded;
  states.set(player.id, state);
}
