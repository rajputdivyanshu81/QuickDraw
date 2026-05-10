export default function HowSection() {
  return (
    <section className="how-section" id="teams">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
          <div className="section-chip">How it works</div>
          <h2 className="bento-title">Go live in minutes.</h2>
          <p className="bento-sub">No installs, no friction. Open a room and start drawing with your team.</p>
        </div>

        <div className="how-steps">
          {/* Step 1 */}
          <div className="how-card">
            <div className="how-num">01</div>
            <div className="how-step-visual" style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
              <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="g1" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M14 0L0 0 0 14" fill="none" stroke="rgba(139,92,246,.1)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="200" height="120" fill="url(#g1)" />
                <rect x="55" y="20" width="90" height="80" rx="10" fill="white" stroke="rgba(139,92,246,.2)" strokeWidth="1" />
                <circle cx="100" cy="52" r="18" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="1.5" />
                <text x="100" y="57" textAnchor="middle" fontSize="16">🎨</text>
                <rect x="72" y="80" width="56" height="14" rx="7" fill="#6d28d9" />
                <text x="100" y="90" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">Create Room</text>
              </svg>
            </div>
            <div className="how-title">Create a room</div>
            <div className="how-desc">Click &quot;New Room&quot; to get a unique link instantly. Your infinite canvas is ready in under a second.</div>
          </div>

          {/* Step 2 */}
          <div className="how-card">
            <div className="how-num">02</div>
            <div className="how-step-visual" style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)" }}>
              <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="g2" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M14 0L0 0 0 14" fill="none" stroke="rgba(249,115,22,.1)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="200" height="120" fill="url(#g2)" />
                <circle cx="60" cy="48" r="18" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
                <text x="60" y="53" textAnchor="middle" fontSize="16">👤</text>
                <circle cx="100" cy="48" r="18" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5" />
                <text x="100" y="53" textAnchor="middle" fontSize="16">👤</text>
                <circle cx="140" cy="48" r="18" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
                <text x="140" y="53" textAnchor="middle" fontSize="16">👤</text>
                <rect x="40" y="80" width="120" height="16" rx="8" fill="white" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <text x="100" y="91" textAnchor="middle" fontSize="8" fill="#6b7280">quickdraw.app/room/abc123</text>
              </svg>
            </div>
            <div className="how-title">Invite your team</div>
            <div className="how-desc">Share the room link. No signup needed — click and collaborate immediately.</div>
          </div>

          {/* Step 3 */}
          <div className="how-card">
            <div className="how-num">03</div>
            <div className="how-step-visual" style={{ background: "linear-gradient(135deg,#ecfeff,#cffafe)" }}>
              <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="g3" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M14 0L0 0 0 14" fill="none" stroke="rgba(14,165,233,.1)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="200" height="120" fill="url(#g3)" />
                <rect x="20" y="15" width="160" height="90" rx="8" fill="white" stroke="rgba(0,0,0,.07)" strokeWidth="1" />
                <path d="M35 75 Q65 45 95 60 Q125 75 155 45" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" from="0,300" to="300,0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M35 90 Q75 78 115 85 Q145 90 165 78" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity=".8">
                  <animate attributeName="stroke-dasharray" from="0,300" to="300,0" dur="2.5s" begin=".5s" repeatCount="indefinite" />
                </path>
                <rect x="140" y="22" width="34" height="14" rx="7" fill="#dcfce7" />
                <text x="157" y="31" textAnchor="middle" fontSize="7" fill="#16a34a" fontWeight="700">● LIVE</text>
              </svg>
            </div>
            <div className="how-title">Draw together</div>
            <div className="how-desc">See every stroke, cursor, and change as it happens — with zero perceptible lag.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
