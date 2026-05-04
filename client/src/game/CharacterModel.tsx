import { getCharacter } from './characters';
import { PLAYER_HITBOXES } from './hitboxes';
import type { HitPart } from './types';

type Props = {
  characterId: number;
  playerId?: string;
  crouching?: boolean;
  alive?: boolean;
  invincible?: boolean;
  debugHitboxes?: boolean;
};

export default function CharacterModel({ characterId, playerId, crouching = false, alive = true, invincible = false, debugHitboxes = false }: Props) {
  const character = getCharacter(characterId);
  const opacity = alive ? (invincible ? 0.52 : 1) : 0.35;
  const scaleY = crouching ? 0.72 : 1;

  return (
    <group scale={[1, scaleY, 1]}>
      <Part hitPart="leg" playerId={playerId} position={[-0.18, 0.45, 0]} size={[0.28, 0.9, 0.28]} color={character.legs} opacity={opacity} />
      <Part hitPart="leg" playerId={playerId} position={[0.18, 0.45, 0]} size={[0.28, 0.9, 0.28]} color={character.legs} opacity={opacity} />
      <Part hitPart="body" playerId={playerId} position={[0, 1.12, 0]} size={[0.7, 0.82, 0.35]} color={character.torso} opacity={opacity} />
      <Part position={[0, 1.18, -0.19]} size={[0.74, 0.14, 0.06]} color={character.accent} opacity={opacity} />
      <Part hitPart="arm" playerId={playerId} position={[-0.52, 1.1, 0]} size={[0.25, 0.86, 0.25]} color={character.arms} opacity={opacity} />
      <Part hitPart="arm" playerId={playerId} position={[0.52, 1.1, 0]} size={[0.25, 0.86, 0.25]} color={character.arms} opacity={opacity} />
      <Part hitPart="head" playerId={playerId} position={[0, 1.62, 0]} size={[0.6, 0.42, 0.6]} color={character.skin} opacity={opacity} />
      <Part hitPart="head" playerId={playerId} position={[0, 1.81, -0.02]} size={[0.66, 0.12, 0.66]} color={character.helmet} opacity={opacity} />
      <Part position={[0, 0.78, -0.2]} size={[0.78, 0.12, 0.08]} color={character.accent} opacity={opacity} />
      {debugHitboxes ? <DebugHitboxes playerId={playerId} /> : null}
    </group>
  );
}

function Part({
  position,
  size,
  color,
  opacity,
  playerId,
  hitPart
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity: number;
  playerId?: string;
  hitPart?: HitPart;
}) {
  const userData = hitPart && playerId ? { type: 'playerHitbox', playerId, hitPart } : undefined;

  return (
    <mesh castShadow receiveShadow position={position} userData={userData}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} transparent opacity={opacity} />
    </mesh>
  );
}

function DebugHitboxes({ playerId }: { playerId?: string }) {
  return (
    <>
      {PLAYER_HITBOXES.map((hitbox) => (
        <mesh
          key={hitbox.id}
          position={hitbox.position}
          userData={playerId ? { type: 'playerHitbox', playerId, hitPart: hitbox.hitPart } : undefined}
        >
          <boxGeometry args={hitbox.size} />
          <meshBasicMaterial color={hitbox.hitPart === 'head' ? '#ff5a5f' : '#51c7ff'} transparent opacity={0.22} wireframe />
        </mesh>
      ))}
    </>
  );
}
