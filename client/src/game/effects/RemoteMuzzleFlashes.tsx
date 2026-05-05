import * as THREE from 'three';
import { getThirdPersonMuzzlePosition } from '../ThirdPersonWeaponModel';
import type { PlayerState, ShotEvent } from '../types';

type Props = {
  events: ShotEvent[];
  players: PlayerState[];
  localPlayerId: string;
  serverTime: number;
};

export default function RemoteMuzzleFlashes({ events, players, localPlayerId, serverTime }: Props) {
  return (
    <>
      {events.map((event) => {
        if (event.shooterId === localPlayerId || serverTime - event.createdAt > 90) return null;
        const shooter = players.find((player) => player.id === event.shooterId);
        if (!shooter?.alive) return null;
        const position = getThirdPersonMuzzlePosition(shooter, event.weaponId);
        const age = Math.max(0, serverTime - event.createdAt);
        const scale = Math.max(0.05, 1 - age / 90) * (event.weaponId === 'sr' ? 1.65 : 1);
        return (
          <mesh key={event.id} position={position.toArray()} scale={new THREE.Vector3(scale, scale, scale)}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshBasicMaterial color={event.weaponId === 'sr' ? '#ffd27a' : '#fff0a5'} transparent opacity={0.86} />
          </mesh>
        );
      })}
    </>
  );
}
