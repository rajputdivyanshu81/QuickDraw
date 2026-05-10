export default function AISection() {
  return (
    <section className="ai-section" id="technology">
      <div className="ai-inner">
        <div className="ai-header">
          <div className="section-chip">AI-powered</div>
          <h2 className="ai-title">Design intelligence<br />at your fingertips</h2>
          <p className="ai-subtitle">QuickDraw&apos;s AI assistant helps you ideate, refine, and explain diagrams — right in the canvas, without leaving the flow.</p>
        </div>

        {/* Feature Row 1: AI Chat — text left, visual right */}
        <div className="ai-row">
          <div className="ai-row-text">
            <h3 className="ai-row-heading">Smart AI assistant</h3>
            <p className="ai-row-desc">Ask QuickDraw AI to clean up flowcharts, optimize layouts, or explain any diagram in plain language. Powered by Gemini 2.5.</p>
            <div className="ai-row-tags">
              <span className="ai-tag">✨ Shape cleanup</span>
              <span className="ai-tag">🗺️ Layout optimization</span>
              <span className="ai-tag">💬 Diagram explanation</span>
            </div>
          </div>
          <div className="ai-row-visual">
            <div className="ai-vis-chat">
              {/* Chat header */}
              <div className="ai-vis-chat-header">
                <div className="ai-vis-orb"></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>QuickDraw AI</div>
                  <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                    Active
                  </div>
                </div>
                <div className="ai-vis-model-badge">Gemini 2.5</div>
              </div>
              {/* Messages */}
              <div className="ai-vis-messages">
                <div className="ai-vis-msg-user">Can you clean up this flowchart and make the layout clearer?</div>
                <div className="ai-vis-msg-ai">
                  <div className="ai-vis-ai-label"><span className="ai-vis-sparkle">✦</span> QuickDraw AI</div>
                  Sure! I can see 3 overlapping nodes in the auth flow. I&apos;ll redistribute them into a left-to-right hierarchy.
                </div>
                <div className="ai-vis-action">
                  <div className="ai-vis-action-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6" }}>Layout optimized</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Redistributed 3 nodes · Aligned arrows</div>
                  </div>
                  <div className="ai-vis-check">✓</div>
                </div>
                <div className="ai-vis-msg-user">Also label the arrows between API and DB.</div>
                <div className="ai-vis-typing">
                  <div className="ai-vis-dot"></div>
                  <div className="ai-vis-dot"></div>
                  <div className="ai-vis-dot"></div>
                </div>
              </div>
              {/* Input */}
              <div className="ai-vis-input">
                <span style={{ color: "#f97316", fontSize: 14 }}>✦</span>
                <span style={{ flex: 1, fontSize: 12, color: "#9ca3af" }}>Ask AI to improve your diagram…</span>
                <div className="ai-vis-send">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="ai-vis-float ai-vis-float-1">🎯 98% accuracy</div>
            <div className="ai-vis-float ai-vis-float-2">⚡ &lt;2s response</div>
          </div>
        </div>

        {/* Feature Row 2: Voice chat — visual left, text right */}
        <div className="ai-row ai-row-reverse">
          <div className="ai-row-text">
            <h3 className="ai-row-heading">Voice chat built in</h3>
            <p className="ai-row-desc">Hop on a live audio call with everyone in the room. Discuss architecture decisions while drawing together — no third-party app needed.</p>
            <div className="ai-row-tags">
              <span className="ai-tag">🎙️ In-room voice</span>
              <span className="ai-tag">👥 Multi-user</span>
              <span className="ai-tag">🔇 Mute controls</span>
            </div>
          </div>
          <div className="ai-row-visual">
            <div className="ai-vis-voice">
              {/* Call bar */}
              <div className="ai-vis-callbar">
                <div className="ai-vis-orb" style={{ width: 28, height: 28 }}></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", flex: 1 }}>Voice Channel</div>
                <div style={{ background: "#dcfce7", borderRadius: 60, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 1.5s infinite" }}></span>
                  LIVE
                </div>
              </div>
              {/* Participants */}
              <div className="ai-vis-participants">
                {[
                  { name: "Alex", color: "#7c3aed", speaking: true },
                  { name: "Sam", color: "#f97316", speaking: false },
                  { name: "Maya", color: "#10b981", speaking: true },
                ].map((p, i) => (
                  <div className="ai-vis-participant" key={i}>
                    <div className={`ai-vis-avatar-ring ${p.speaking ? "speaking" : ""}`}>
                      <div className="ai-vis-avatar" style={{ background: p.color }}>{p.name[0]}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{p.name}</span>
                    {p.speaking && (
                      <div className="ai-vis-wave-mini">
                        {[40, 70, 50, 80, 60].map((h, j) => (
                          <div key={j} className="ai-vis-wave-bar" style={{ height: `${h}%`, animationDelay: `${j * 0.1}s` }}></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Waveform */}
              <div className="ai-vis-waveform">
                {[35, 65, 45, 85, 55, 75, 40, 90, 60, 50, 80, 45, 70, 55, 85, 40, 65, 50, 75, 60].map((h, i) => (
                  <div key={i} className="ai-vis-wf-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Row 3: Export — text left, visual right */}
        <div className="ai-row">
          <div className="ai-row-text">
            <h3 className="ai-row-heading">Export &amp; download</h3>
            <p className="ai-row-desc">Turn your canvas into a PowerPoint deck, download as PNG/JPEG, or share a live link. Your work is always presentation-ready.</p>
            <div className="ai-row-tags">
              <span className="ai-tag">📊 PPT export</span>
              <span className="ai-tag">🖼️ PNG download</span>
              <span className="ai-tag">📸 JPEG export</span>
            </div>
          </div>
          <div className="ai-row-visual">
            <div className="ai-vis-export">
              {/* Slides */}
              <div className="ai-vis-slides">
                {[
                  { accent: "linear-gradient(90deg,#7c3aed,#a855f7)", label: "Slide 1" },
                  { accent: "linear-gradient(90deg,#f97316,#fb923c)", label: "Slide 2" },
                  { accent: "linear-gradient(90deg,#10b981,#34d399)", label: "Slide 3" },
                ].map((s, i) => (
                  <div className="ai-vis-slide" key={i} style={{ transform: `rotate(${(i - 1) * 3}deg)`, zIndex: 3 - i }}>
                    <div className="ai-vis-slide-accent" style={{ background: s.accent }}></div>
                    <div className="ai-vis-slide-lines">
                      <div style={{ width: "75%", height: 4, background: "#e5e7eb", borderRadius: 2 }}></div>
                      <div style={{ width: "55%", height: 3, background: "#e5e7eb", borderRadius: 2 }}></div>
                      <div style={{ width: "65%", height: 3, background: "#e5e7eb", borderRadius: 2 }}></div>
                    </div>
                    <div className="ai-vis-slide-label">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Export buttons */}
              <div className="ai-vis-export-btns">
                {[
                  { emoji: "📊", label: "PPT", bg: "#f5f3ff", border: "#7c3aed" },
                  { emoji: "🖼️", label: "PNG", bg: "#ecfdf5", border: "#10b981" },
                  { emoji: "📸", label: "JPEG", bg: "#fff7ed", border: "#f97316" },
                ].map((b, i) => (
                  <div className="ai-vis-export-btn" key={i} style={{ background: b.bg, borderColor: `${b.border}30` }}>
                    <span style={{ fontSize: 16 }}>{b.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{b.label}</span>
                  </div>
                ))}
              </div>
              {/* Ready badge */}
              <div className="ai-vis-ready">🚀 Ready to present</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
