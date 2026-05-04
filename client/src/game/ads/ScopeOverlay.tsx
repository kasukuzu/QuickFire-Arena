export default function ScopeOverlay() {
  return (
    <div className="ads-scope" aria-hidden="true">
      <div className="scope-mask" />
      <div className="scope-ring">
        <span className="scope-line horizontal" />
        <span className="scope-line vertical" />
        <span className="scope-tick tick-left" />
        <span className="scope-tick tick-right" />
        <span className="scope-tick tick-top" />
        <span className="scope-tick tick-bottom" />
        <span className="scope-dot" />
      </div>
    </div>
  );
}
