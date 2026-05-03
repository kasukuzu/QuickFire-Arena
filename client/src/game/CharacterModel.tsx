import { getCharacter } from './characters';

type Props = {
  characterId: number;
  crouching?: boolean;
  alive?: boolean;
  invincible?: boolean;
};

export default function CharacterModel({ characterId, crouching = false, alive = true, invincible = false }: Props) {
  const character = getCharacter(characterId);
  const opacity = alive ? (invincible ? 0.52 : 1) : 0.35;
  const scaleY = crouching ? 0.72 : 1;

  return (
    <group scale={[1, scaleY, 1]}>
      <Part position={[0, 1.5, 0]} size={[0.6, 0.6, 0.6]} color={character.skin} opacity={opacity} />
      <Part position={[0, 1.72, -0.02]} size={[0.66, 0.24, 0.66]} color={character.helmet} opacity={opacity} />
      <Part position={[0, 0.95, 0]} size={[0.7, 1.0, 0.35]} color={character.torso} opacity={opacity} />
      <Part position={[0, 1.12, -0.19]} size={[0.74, 0.16, 0.06]} color={character.accent} opacity={opacity} />
      <Part position={[-0.52, 0.98, 0]} size={[0.25, 0.9, 0.25]} color={character.arms} opacity={opacity} />
      <Part position={[0.52, 0.98, 0]} size={[0.25, 0.9, 0.25]} color={character.arms} opacity={opacity} />
      <Part position={[-0.18, 0.35, 0]} size={[0.28, 0.7, 0.28]} color={character.legs} opacity={opacity} />
      <Part position={[0.18, 0.35, 0]} size={[0.28, 0.7, 0.28]} color={character.legs} opacity={opacity} />
      <Part position={[0, 0.72, -0.2]} size={[0.78, 0.12, 0.08]} color={character.accent} opacity={opacity} />
    </group>
  );
}

function Part({
  position,
  size,
  color,
  opacity
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity: number;
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} transparent opacity={opacity} />
    </mesh>
  );
}
