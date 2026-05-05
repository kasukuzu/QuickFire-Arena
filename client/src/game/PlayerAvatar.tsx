import CharacterModel from './CharacterModel';
import HealthBar from './HealthBar';
import ThirdPersonWeaponModel from './ThirdPersonWeaponModel';
import type { PlayerState } from './types';

type Props = {
  player: PlayerState;
  serverTime: number;
};

export default function PlayerAvatar({ player, serverTime }: Props) {
  const hpY = player.crouching ? 1.7 : 2.2;
  const invincible = Boolean(player.invincibleUntil && player.invincibleUntil > serverTime);

  return (
    <group position={[player.position.x, player.position.y, player.position.z]}>
      <group rotation={[0, player.rotationY, 0]}>
        <CharacterModel playerId={player.id} characterId={player.characterId} crouching={player.crouching} alive={player.alive} invincible={invincible} />
        {player.alive ? <ThirdPersonWeaponModel weaponId={player.weaponId} /> : null}
      </group>
      {player.alive ? <HealthBar hp={player.hp} y={hpY} /> : null}
      {invincible ? <mesh position={[0, hpY + 0.25, 0]}><sphereGeometry args={[0.12, 8, 8]} /><meshBasicMaterial color="#9be7ff" transparent opacity={0.75} /></mesh> : null}
    </group>
  );
}
