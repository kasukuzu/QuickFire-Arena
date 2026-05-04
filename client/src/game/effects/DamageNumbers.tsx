import type { DamageEvent, PlayerState } from '../types';
import DamageNumber from './DamageNumber';

type Props = {
  events: DamageEvent[];
  players: PlayerState[];
  serverTime: number;
};

export default function DamageNumbers({ events, players, serverTime }: Props) {
  return (
    <>
      {events.map((event) => {
        const target = players.find((player) => player.id === event.targetId);
        if (!target || !target.alive) return null;
        return <DamageNumber key={event.id} event={event} target={target} serverTime={serverTime} />;
      })}
    </>
  );
}
