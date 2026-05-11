import HudFrame from './HudFrame';

type Props = {
  hp: number;
  ratio: number;
  tone: 'healthy' | 'warning' | 'danger';
};

export default function PlayerHpHud({ hp, ratio, tone }: Props) {
  return (
    <HudFrame className={`match-hud-status match-hud-hp ${tone}`}>
      <span className="match-hud-label">HP</span>
      <span className="match-hud-value">{hp}</span>
      <div className="match-hud-gauge">
        <span style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }} />
      </div>
    </HudFrame>
  );
}
