export default function BentoSection() {
  return (
    <section className="bento-section" id="features">
      <div className="bento-header">
        <div className="section-chip">Features</div>
        <h2 className="bento-title">Everything you need<br />to draw together.</h2>
        <p className="bento-sub">QuickDraw combines real-time infrastructure with an intuitive canvas so your team can focus on ideas, not tools.</p>
      </div>

      <div className="bento-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Card 1: Real-time sync (tall) */}
        <div className="bcard bcard-tall">
          <div className="bcard-visual pink-tint" style={{ position: "relative", flexDirection: "column", gap: 16 }}>
            <div className="wf-grid"></div>
            <div className="wf-crosshair" style={{ top: 18, left: 18 }}></div>
            <div className="wf-crosshair" style={{ top: 18, right: 18 }}></div>
            <div className="wf-crosshair" style={{ bottom: 18, left: 18 }}></div>
            <div className="wf-crosshair" style={{ bottom: 18, right: 18 }}></div>

            <div style={{ background: "#fff", borderRadius: 14, padding: 16, width: "78%", boxShadow: "0 8px 32px rgba(109,40,217,0.1)", border: "1px solid rgba(0,0,0,.07)", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }}></div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }}></div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }}></div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>quickdraw.canvas</div>
              </div>
              <svg viewBox="0 0 260 160" style={{ width: "100%", borderRadius: 8, background: "#f9fafb" }}>
                <defs>
                  <pattern id="cg" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M16 0L0 0 0 16" fill="none" stroke="rgba(139,92,246,.07)" strokeWidth=".5" />
                  </pattern>
                  <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                    <path d="M0,0 L0,5 L5,2.5 z" fill="#9ca3af" />
                  </marker>
                </defs>
                <rect width="260" height="160" fill="url(#cg)" />
                <rect x="15" y="15" width="70" height="45" rx="6" fill="rgba(109,40,217,.06)" stroke="#7c3aed" strokeWidth="1.2" />
                <text x="50" y="42" textAnchor="middle" fontSize="8" fill="#5b21b6" fontWeight="600">Frontend</text>
                <rect x="100" y="15" width="70" height="45" rx="6" fill="rgba(249,115,22,.06)" stroke="#f97316" strokeWidth="1.2" />
                <text x="135" y="42" textAnchor="middle" fontSize="8" fill="#c2410c" fontWeight="600">Backend</text>
                <rect x="185" y="15" width="60" height="45" rx="6" fill="rgba(59,130,246,.06)" stroke="#3b82f6" strokeWidth="1.2" />
                <text x="215" y="42" textAnchor="middle" fontSize="8" fill="#1d4ed8" fontWeight="600">DB</text>
                <path d="M85 37 L100 37" stroke="#9ca3af" strokeWidth="1" markerEnd="url(#arr)" />
                <path d="M170 37 L185 37" stroke="#9ca3af" strokeWidth="1" markerEnd="url(#arr)" />
                <path d="M20 100 Q60 75 100 95 Q140 115 180 85 Q210 65 240 80" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" from="0,500" to="500,0" dur="2.5s" repeatCount="indefinite" />
                </path>
                <path d="M20 130 Q70 115 120 125 Q170 135 220 115" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity=".8">
                  <animate attributeName="stroke-dasharray" from="0,500" to="500,0" dur="3s" begin="1s" repeatCount="indefinite" />
                </path>
                <polygon points="60,95 63,107 66,102 71,104" fill="#7c3aed" opacity=".9" />
                <rect x="72" y="100" width="28" height="13" rx="6" fill="#7c3aed" />
                <text x="86" y="109" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">Alex</text>
                <polygon points="160,85 163,97 166,92 171,94" fill="#f97316" opacity=".9" />
                <rect x="172" y="89" width="26" height="13" rx="6" fill="#f97316" />
                <text x="185" y="98" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">Sam</text>
              </svg>
            </div>

            <div style={{ position: "absolute", top: 28, right: 20, zIndex: 3, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="cursor-chip" style={{ background: "#7c3aed" }}>
                <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="0,0 3,9 5,6 8,8" fill="white" /></svg>
                Alex
              </div>
              <div className="cursor-chip" style={{ background: "#f97316" }}>
                <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="0,0 3,9 5,6 8,8" fill="white" /></svg>
                Sam
              </div>
              <div className="cursor-chip" style={{ background: "#10b981" }}>
                <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="0,0 3,9 5,6 8,8" fill="white" /></svg>
                Maya
              </div>
            </div>

            <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 3, background: "#dcfce7", borderRadius: 60, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "blink 1.5s infinite" }}></div>
              LIVE
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">Real-time stroke sync</div>
            <div className="bcard-desc">Every stroke broadcast to all collaborators with sub-50ms latency via WebSocket event pipeline. Draw and see — instantly.</div>
          </div>
        </div>

        {/* Card 2: AI assist (wide) */}
        <div className="bcard bcard-wide">
          <div className="bcard-visual blue-tint">
            <div className="wf-grid"></div>
            <div className="wf-crosshair" style={{ top: 18, left: 18 }}></div>
            <div className="wf-crosshair" style={{ top: 18, right: 18 }}></div>
            <div className="ui-card" style={{ width: "75%", position: "relative", zIndex: 2 }}>
              <div style={{ paddingBottom: 10, borderBottom: "1px solid rgba(0,0,0,.07)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "conic-gradient(from 0deg,#f97316,#a855f7,#f97316)", animation: "spin 4s linear infinite", flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>QuickDraw AI</div>
                  <div style={{ fontSize: 10, color: "#10b981" }}>● Active</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="chat-bubble user">Clean up this flowchart layout?</div>
                <div className="chat-bubble ai">Redistributing 3 nodes into left-to-right hierarchy and adding labels…</div>
                <div style={{ display: "flex", gap: 3, padding: "8px 10px", background: "rgba(249,115,22,.08)", borderRadius: 10, width: "fit-content" }}>
                  <div className="dot" style={{ background: "rgba(249,115,22,.6)" }}></div>
                  <div className="dot" style={{ background: "rgba(249,115,22,.6)", animationDelay: ".2s" }}></div>
                  <div className="dot" style={{ background: "rgba(249,115,22,.6)", animationDelay: ".4s" }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">AI design assistance</div>
            <div className="bcard-desc">Ask AI to refine shapes, optimize layouts, generate diagrams, or explain your sketches in natural language.</div>
          </div>
        </div>

        {/* Card 3: Room sessions */}
        <div className="bcard">
          <div className="bcard-visual green-tint">
            <div className="wf-grid"></div>
            <div style={{ position: "relative", zIndex: 2, width: "78%", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 6px 24px rgba(0,0,0,.08)", border: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Room Link</div>
                <div style={{ background: "#f5f3ff", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#5b21b6", fontWeight: 600, fontFamily: "monospace" }}>quickdraw.app/room/abc-xyz</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex" }}>
                  {[{ bg: "linear-gradient(135deg,#7c3aed,#a855f7)", letter: "A", ml: 0 }, { bg: "linear-gradient(135deg,#f97316,#fb923c)", letter: "S", ml: -8 }, { bg: "linear-gradient(135deg,#10b981,#34d399)", letter: "M", ml: -8 }].map((a, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: a.bg, border: "2px solid #fff", marginLeft: a.ml, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{a.letter}</div>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>3 people drawing now</span>
                <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "blink 1.5s infinite" }}></div>
              </div>
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">Room-based sessions</div>
            <div className="bcard-desc">Create a room, share the link, collaborate instantly. No signup required to join — just click and draw.</div>
          </div>
        </div>

        {/* Card 4: Voice calls */}
        <div className="bcard">
          <div className="bcard-visual" style={{ background: "linear-gradient(135deg,#fdf4ff,#f5f3ff)" }}>
            <div className="wf-grid"></div>
            <div style={{ position: "relative", zIndex: 2, width: "80%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ background: "linear-gradient(135deg,#4c1d95,#7c3aed)", borderRadius: 60, padding: "12px 24px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 28px rgba(109,40,217,.4)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.1 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Join Voice</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex" }}>
                    {[{ bg: "linear-gradient(135deg,#7c3aed,#a855f7)", l: "A" }, { bg: "linear-gradient(135deg,#f97316,#fb923c)", l: "S" }, { bg: "linear-gradient(135deg,#10b981,#34d399)", l: "M" }].map((a, i) => (
                      <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: a.bg, border: "2px solid #fff", marginLeft: i > 0 ? -6 : 0, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{a.l}</div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>3 on call now</span>
                  <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "blink 1.5s infinite" }}></div>
                </div>
                <div className="waveform">
                  {[40, 80, 55, 100, 65, 85, 50, 90, 70, 45, 75, 60, 95, 55, 80, 40, 70, 55].map((h, i) => (
                    <div key={i} className="waveform-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">Voice calls in-room</div>
            <div className="bcard-desc">Hit &quot;Join Voice&quot; to hop on a live audio call with everyone in the room — no third-party app needed.</div>
          </div>
        </div>

        {/* Card 5: PPT export */}
        <div className="bcard">
          <div className="bcard-visual" style={{ background: "linear-gradient(135deg,#fef9f0,#fff7ed)", height: 200 }}>
            <div className="wf-grid"></div>
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 140, height: 90 }}>
                <div style={{ position: "absolute", top: 10, left: 10, width: 130, height: 78, borderRadius: 6, background: "#fff", border: "1px solid rgba(0,0,0,.1)", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                  <div style={{ height: 6, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "6px 6px 0 0", marginBottom: 6 }}></div>
                  <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, width: "80%" }}></div>
                    <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, width: "60%" }}></div>
                    <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, width: "70%" }}></div>
                  </div>
                </div>
                <div style={{ position: "absolute", top: 0, left: 0, width: 130, height: 78, borderRadius: 6, background: "#fff", border: "1px solid rgba(249,115,22,.2)", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}>
                  <div style={{ height: 6, background: "linear-gradient(90deg,#f97316,#fb923c)", borderRadius: "6px 6px 0 0", marginBottom: 6 }}></div>
                  <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ height: 4, background: "#fed7aa", borderRadius: 2, width: "75%" }}></div>
                    <div style={{ height: 3, background: "#fed7aa", borderRadius: 2, width: "55%" }}></div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#fff", border: "1.5px solid rgba(249,115,22,.3)", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#f97316", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Export as PPT
              </div>
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">One-click PPT export</div>
            <div className="bcard-desc">Turn your canvas directly into a PowerPoint presentation — each frame becomes a slide, instantly.</div>
          </div>
        </div>

        {/* Card 6: Download formats */}
        <div className="bcard">
          <div className="bcard-visual blue-tint" style={{ height: 200 }}>
            <div className="wf-grid"></div>
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 8, width: "75%" }}>
              {[
                { emoji: "🖼️", label: "PNG", desc: "Transparent bg support", bg: "#dbeafe" },
                { emoji: "📸", label: "JPEG", desc: "Compressed, web-ready", bg: "#fef3c7" },
                { emoji: "📊", label: "PPT", desc: "Slide-ready export", bg: "#f0fdf4" },
              ].map((f, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 3px 12px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.emoji}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{f.label}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>{f.desc}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">Export in any format</div>
            <div className="bcard-desc">Download your canvas as PNG, JPEG, or PPT with one click — full resolution, no watermarks.</div>
          </div>
        </div>

        {/* Card 7: Background color + chat */}
        <div className="bcard">
          <div className="bcard-visual green-tint" style={{ height: 200 }}>
            <div className="wf-grid"></div>
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 10, width: "80%" }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", boxShadow: "0 4px 16px rgba(0,0,0,.08)", border: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Canvas Background</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["#ffffff", "#f3f4f6", "#1f2937", "#111827", "#ede9fe", "#fef3c7", "#d1fae5"].map((c, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "2px solid #e5e7eb" }}></div>
                  ))}
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#7c3aed)", border: "2px solid rgba(0,0,0,.1)" }}></div>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>S</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>Sam</div>
                  <div style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Can we try a dark background?</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bcard-body">
            <div className="bcard-label">Custom background & chat</div>
            <div className="bcard-desc">Pick any canvas background color and chat with teammates in real-time — all without leaving the board.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
