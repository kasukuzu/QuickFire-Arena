type Props = {
  onResume: () => void;
  onLeave: () => void;
};

export default function PauseMenu({ onResume, onLeave }: Props) {
  return (
    <div className="pause-overlay">
      <section className="pause-card">
        <p className="eyebrow">Paused</p>
        <h2>メニュー</h2>
        <div className="pause-actions">
          <button className="primary" onClick={onResume}>
            続ける
          </button>
          <button className="danger" onClick={onLeave}>
            止める
          </button>
        </div>
      </section>
    </div>
  );
}
