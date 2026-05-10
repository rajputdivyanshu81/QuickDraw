export default function StatsSection() {
  return (
    <div className="stats-section">
      <div className="stats-inner">
        <div className="stat-col">
          <div className="stat-val"><em>&lt;50</em>ms</div>
          <div className="stat-lbl">Stroke sync latency</div>
        </div>
        <div className="stat-col">
          <div className="stat-val"><em>∞</em></div>
          <div className="stat-lbl">Canvas — no limits</div>
        </div>
        <div className="stat-col">
          <div className="stat-val"><em>100</em>+</div>
          <div className="stat-lbl">Users per room</div>
        </div>
        <div className="stat-col">
          <div className="stat-val"><em>AI</em></div>
          <div className="stat-lbl">Design assistance</div>
        </div>
      </div>
    </div>
  );
}
