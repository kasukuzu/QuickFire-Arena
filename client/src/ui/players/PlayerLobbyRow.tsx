import { WEAPONS } from '../../game/weapons';
import { getMapName } from '../../game/maps/mapDefinitions';
import type { PlayerState } from '../../game/types';

type Props = {
  player: PlayerState;
};

export default function PlayerLobbyRow({ player }: Props) {
  return (
    <div className={player.isReady ? 'lobby-player-card ready' : 'lobby-player-card'}>
      <div className="lobby-player-name">
        <strong>{player.name}</strong>
        {player.isHost ? <span className="tag host-tag">HOST</span> : null}
      </div>
      <span className="tag">{WEAPONS[player.weaponId].name}</span>
      <span className="tag">{player.mapVote ? getMapName(player.mapVote) : 'Map未選択'}</span>
      <span className={player.isReady ? 'tag ready-tag' : 'tag pending-tag'}>{player.isReady ? 'READY' : '未準備'}</span>
    </div>
  );
}
