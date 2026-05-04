import { WEAPONS } from '../weapons';
import type { KillFeedEvent } from '../types';

type Props = {
  events: KillFeedEvent[];
  localPlayerId: string;
  serverTime: number;
};

export default function KillFeed({ events, localPlayerId, serverTime }: Props) {
  const visible = events
    .filter((event) => serverTime - event.createdAt <= 5000)
    .slice(-5)
    .reverse();

  return (
    <div className="kill-feed">
      {visible.map((event) => (
        <div
          className={event.killerId === localPlayerId || event.victimId === localPlayerId ? 'kill-feed-row involved' : 'kill-feed-row'}
          key={event.id}
        >
          <strong>{event.killerName}</strong>
          <span>[{WEAPONS[event.weaponId].name}{event.isHeadshot ? ' HS' : ''}]</span>
          <em>{event.victimName}</em>
        </div>
      ))}
    </div>
  );
}
