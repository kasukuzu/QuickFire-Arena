import HudFrame from './HudFrame';

type Props = {
  time: string;
};

export default function MatchTimerHud({ time }: Props) {
  return (
    <HudFrame className="match-hud-timer">
      <span className="match-hud-value">{time}</span>
    </HudFrame>
  );
}
