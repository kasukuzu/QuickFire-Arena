import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DamageEvent, PlayerState } from '../types';

type Props = {
  event: DamageEvent;
  target: PlayerState;
  serverTime: number;
};

export default function DamageNumber({ event, target, serverTime }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => seededOffset(event.id), [event.id]);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) return;
    const age = Math.max(0, serverTime - event.createdAt) / 1000;
    camera.getWorldQuaternion(group.quaternion);
    group.position.set(
      target.position.x + offset.x,
      target.position.y + (target.crouching ? 1.95 : 2.45) + age * 0.55 + offset.y,
      target.position.z + offset.z
    );
  });

  const age = Math.max(0, serverTime - event.createdAt);
  const opacity = Math.max(0, 1 - age / 1100);
  const fontSize = event.isHeadshot ? 0.42 : 0.34;

  return (
    <group ref={groupRef}>
      <Text
        fontSize={fontSize}
        color={event.isHeadshot ? '#ff7a2f' : '#ff3333'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#120808"
        fillOpacity={opacity}
        outlineOpacity={opacity}
      >
        {event.damage}
      </Text>
    </group>
  );
}

function seededOffset(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return {
    x: ((hash % 7) - 3) * 0.08,
    y: ((hash % 5) - 2) * 0.035,
    z: (((hash >> 3) % 7) - 3) * 0.08
  };
}
