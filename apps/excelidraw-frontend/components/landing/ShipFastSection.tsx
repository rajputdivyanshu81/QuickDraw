export default function ShipFastSection() {
  return (
    <section className="ship-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 56px" }}>
          <h2 className="ship-title">Sketch your architecture.<br />Ship it this week.</h2>
          <p className="bento-sub">From rough whiteboard sketch to production-ready system diagram — QuickDraw accelerates how teams think, design, and build together.</p>
        </div>

        <div className="ship-grid">
          {/* Card 1: Sketch */}
          <div className="ship-card">
            <div className="ship-card-num">01</div>
            <div className="ship-card-visual">
              <div className="wf-grid"></div>
              <svg viewBox="0 0 260 180" style={{ width: "100%", height: "100%", position: "relative", zIndex: 2 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="sg1" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M16 0L0 0 0 16" fill="none" stroke="rgba(139,92,246,.06)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="260" height="180" fill="url(#sg1)" />
                <rect x="30" y="25" width="80" height="40" rx="8" fill="rgba(124,58,237,.06)" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="70" y="49" textAnchor="middle" fontSize="9" fill="#5b21b6" fontWeight="600">Auth</text>
                <rect x="150" y="25" width="80" height="40" rx="8" fill="rgba(249,115,22,.06)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="190" y="49" textAnchor="middle" fontSize="9" fill="#c2410c" fontWeight="600">API</text>
                <rect x="90" y="95" width="80" height="40" rx="8" fill="rgba(16,185,129,.06)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="130" y="119" textAnchor="middle" fontSize="9" fill="#059669" fontWeight="600">Database</text>
                <path d="M110 55 Q130 75 130 95" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M150 55 Q130 75 130 95" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3,3" />
                <g transform="translate(185,90)">
                  <path d="M0 0 L-3 12 L3 9 Z" fill="#7c3aed" opacity=".8" />
                  <circle cx="0" cy="0" r="2" fill="#7c3aed" />
                </g>
                <path d="M30 155 Q80 140 130 150 Q180 160 230 145" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity=".5">
                  <animate attributeName="stroke-dasharray" from="0,300" to="300,0" dur="3s" repeatCount="indefinite" />
                </path>
                <rect x="20" y="135" width="72" height="22" rx="11" fill="linear-gradient(135deg,#6d28d9,#a855f7)" />
                <text x="56" y="149" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">🔍 Sketching…</text>
              </svg>
              <div className="ship-avatar-you">
                <span>You</span>
              </div>
            </div>
            <div className="ship-card-label">Sketch</div>
            <div className="ship-card-desc">Open an infinite canvas and rough out your system architecture. Boxes, arrows, annotations — no constraints.</div>
          </div>

          {/* Card 2: Collaborate */}
          <div className="ship-card">
            <div className="ship-card-num">02</div>
            <div className="ship-card-visual">
              <div className="wf-grid"></div>
              <svg viewBox="0 0 260 180" style={{ width: "100%", height: "100%", position: "relative", zIndex: 2 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="sg2" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M16 0L0 0 0 16" fill="none" stroke="rgba(249,115,22,.06)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="260" height="180" fill="url(#sg2)" />
                <rect x="20" y="20" width="70" height="35" rx="6" fill="rgba(124,58,237,.08)" stroke="#7c3aed" strokeWidth="1.2" />
                <text x="55" y="41" textAnchor="middle" fontSize="8" fill="#5b21b6" fontWeight="600">Frontend</text>
                <rect x="95" y="20" width="70" height="35" rx="6" fill="rgba(249,115,22,.08)" stroke="#f97316" strokeWidth="1.2" />
                <text x="130" y="41" textAnchor="middle" fontSize="8" fill="#c2410c" fontWeight="600">Gateway</text>
                <rect x="170" y="20" width="70" height="35" rx="6" fill="rgba(59,130,246,.08)" stroke="#3b82f6" strokeWidth="1.2" />
                <text x="205" y="41" textAnchor="middle" fontSize="8" fill="#1d4ed8" fontWeight="600">Auth</text>
                <rect x="58" y="80" width="70" height="35" rx="6" fill="rgba(16,185,129,.08)" stroke="#10b981" strokeWidth="1.2" />
                <text x="93" y="101" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="600">DB</text>
                <rect x="138" y="80" width="70" height="35" rx="6" fill="rgba(236,72,153,.08)" stroke="#ec4899" strokeWidth="1.2" />
                <text x="173" y="101" textAnchor="middle" fontSize="8" fill="#be185d" fontWeight="600">Cache</text>
                <line x1="55" y1="55" x2="93" y2="80" stroke="#9ca3af" strokeWidth="1" />
                <line x1="130" y1="55" x2="93" y2="80" stroke="#9ca3af" strokeWidth="1" />
                <line x1="130" y1="55" x2="173" y2="80" stroke="#9ca3af" strokeWidth="1" />
                <line x1="205" y1="55" x2="173" y2="80" stroke="#9ca3af" strokeWidth="1" />
                <polygon points="40,120 43,132 46,127 51,129" fill="#7c3aed" opacity=".9" />
                <rect x="52" y="125" width="24" height="11" rx="5" fill="#7c3aed" />
                <text x="64" y="133" textAnchor="middle" fontSize="6" fill="white" fontWeight="700">Alex</text>
                <polygon points="160,120 163,132 166,127 171,129" fill="#f97316" opacity=".9" />
                <rect x="172" y="125" width="22" height="11" rx="5" fill="#f97316" />
                <text x="183" y="133" textAnchor="middle" fontSize="6" fill="white" fontWeight="700">Sam</text>
                <rect x="130" y="72" width="86" height="50" rx="3" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="4,2" opacity=".6" />
                <rect x="130" y="145" width="110" height="24" rx="8" fill="#fff" stroke="rgba(0,0,0,.1)" strokeWidth="1" />
                <text x="185" y="160" textAnchor="middle" fontSize="7" fill="#6b7280">💬 Should we add Redis?</text>
              </svg>
              <div className="ship-avatars-stack">
                <div className="ship-avatar-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>A</div>
                <div className="ship-avatar-sm" style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", marginLeft: -6 }}>S</div>
                <div className="ship-avatar-sm" style={{ background: "linear-gradient(135deg,#10b981,#34d399)", marginLeft: -6 }}>M</div>
              </div>
            </div>
            <div className="ship-card-label">Collaborate</div>
            <div className="ship-card-desc">Share the link. Your team refines the diagram together in real-time — with voice chat, AI cleanup, and live cursors.</div>
          </div>

          {/* Card 3: Ship */}
          <div className="ship-card">
            <div className="ship-card-num">03</div>
            <div className="ship-card-visual">
              <div className="wf-grid"></div>
              <svg viewBox="0 0 260 180" style={{ width: "100%", height: "100%", position: "relative", zIndex: 2 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="sg3" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M16 0L0 0 0 16" fill="none" stroke="rgba(16,185,129,.06)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="260" height="180" fill="url(#sg3)" />
                <rect x="30" y="20" width="60" height="50" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <rect x="34" y="24" width="52" height="6" rx="3" fill="linear-gradient(90deg,#7c3aed,#a855f7)" />
                <rect x="34" y="34" width="40" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="34" y="40" width="48" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="34" y="46" width="35" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="34" y="55" width="52" height="10" rx="3" fill="rgba(249,115,22,.08)" stroke="#f97316" strokeWidth=".5" />
                <text x="60" y="63" textAnchor="middle" fontSize="6" fill="#f97316" fontWeight="600">Slide 1</text>
                <rect x="100" y="20" width="60" height="50" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <rect x="104" y="24" width="52" height="6" rx="3" fill="linear-gradient(90deg,#f97316,#fb923c)" />
                <rect x="104" y="34" width="45" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="104" y="40" width="38" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="104" y="46" width="48" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="104" y="55" width="52" height="10" rx="3" fill="rgba(124,58,237,.08)" stroke="#7c3aed" strokeWidth=".5" />
                <text x="130" y="63" textAnchor="middle" fontSize="6" fill="#7c3aed" fontWeight="600">Slide 2</text>
                <rect x="170" y="20" width="60" height="50" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <rect x="174" y="24" width="52" height="6" rx="3" fill="linear-gradient(90deg,#10b981,#34d399)" />
                <rect x="174" y="34" width="42" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="174" y="40" width="50" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="174" y="46" width="36" height="3" rx="1.5" fill="#e5e7eb" />
                <rect x="174" y="55" width="52" height="10" rx="3" fill="rgba(16,185,129,.08)" stroke="#10b981" strokeWidth=".5" />
                <text x="200" y="63" textAnchor="middle" fontSize="6" fill="#059669" fontWeight="600">Slide 3</text>
                <path d="M130 82 L130 100" stroke="#7c3aed" strokeWidth="1.5" markerEnd="url(#shipArr)" />
                <defs>
                  <marker id="shipArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#7c3aed" />
                  </marker>
                </defs>
                <rect x="30" y="108" width="60" height="26" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <text x="60" y="124" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="700">📊 PPT</text>
                <rect x="100" y="108" width="60" height="26" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <text x="130" y="124" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="700">🖼️ PNG</text>
                <rect x="170" y="108" width="60" height="26" rx="8" fill="#fff" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
                <text x="200" y="124" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="700">📸 JPEG</text>
                <rect x="85" y="148" width="90" height="22" rx="11" fill="#dcfce7" stroke="rgba(16,185,129,.3)" strokeWidth="1" />
                <text x="130" y="162" textAnchor="middle" fontSize="8" fill="#16a34a" fontWeight="700">🚀 Ready to present</text>
              </svg>
              <div className="ship-deploy-icons">
                <div className="ship-deploy-icon" title="Download">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                </div>
                <div className="ship-deploy-icon" title="Share">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                </div>
              </div>
            </div>
            <div className="ship-card-label">Ship</div>
            <div className="ship-card-desc">Export to PPT, download as PNG/JPEG, or share the live link. Your architecture deck is presentation-ready.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
