import type { PlayerState } from '../../game/types';
import PlayerLobbyRow from './PlayerLobbyRow';

type Props = {
  players: PlayerState[];
};

export default function PlayerLobbyList({ players }: Props) {
  return (
    <div className="lobby-player-list">
      {players.map((player) => (
        <PlayerLobbyRow key={player.id} player={player} />
      ))}
    </div>
  );
}
