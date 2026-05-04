import type { KillFeedEvent } from '../types';

type Props = {
  events: KillFeedEvent[];
  localPlayerId: string;
  serverTime: number;
};

export default function KillStreakMessage({ events, localPlayerId, serverTime }: Props) {
  const latest = [...events].reverse().find((event) => event.killerId === localPlayerId && serverTime - event.createdAt <= 1600);
  if (!latest) return null;

  return (
    <div className="kill-streak-message">
      {latest.killStreak <= 1 ? '1キル' : `連続${latest.killStreak}キル`}
    </div>
  );
}
