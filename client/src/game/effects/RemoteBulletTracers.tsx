import { useMemo } from 'react';
import * as THREE from 'three';
import { getThirdPersonMuzzlePosition } from '../ThirdPersonWeaponModel';
import type { PlayerState, ShotEvent } from '../types';

type Props = {
  events: ShotEvent[];
  players: PlayerState[];
  localPlayerId: string;
  serverTime: number;
};

export default function RemoteBulletTracers({ events, players, localPlayerId, serverTime }: Props) {
  return (
    <>
      {events.map((event) => {
        if (event.shooterId === localPlayerId || serverTime - event.createdAt > 150) return null;
        const shooter = players.find((player) => player.id === event.shooterId);
        if (!shooter?.alive) return null;
        return <RemoteTracer key={event.id} event={event} shooter={shooter} serverTime={serverTime} />;
      })}
    </>
  );
}

function RemoteTracer({ event, shooter, serverTime }: { event: ShotEvent; shooter: PlayerState; serverTime: number }) {
  const age = Math.max(0, serverTime - event.createdAt);
  const opacity = Math.max(0, 1 - age / 150);
  const line = useMemo(() => {
    const from = getThirdPersonMuzzlePosition(shooter, event.weaponId);
    const to = new THREE.Vector3(event.endPoint.x, event.endPoint.y, event.endPoint.z);
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const material = new THREE.LineBasicMaterial({
      color: event.weaponId === 'sr' ? '#fff4c2' : '#ffe097',
      transparent: true,
      opacity,
      linewidth: event.weaponId === 'sr' ? 2 : 1
    });
    return new THREE.Line(geometry, material);
  }, [event, opacity, shooter]);

  return <primitive object={line} />;
}
