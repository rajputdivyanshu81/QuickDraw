export default function OpenSourceSection() {
  return (
    <section className="oss-section">
      <div className="oss-inner">
        {/* Left: text + badges */}
        <div className="oss-left">
          <div className="section-chip" style={{ background: "rgba(16,185,129,.1)", color: "#059669" }}>Open Source</div>
          <h2 className="oss-title">Built in the open.<br />Fork it. Ship it.</h2>
          <p className="oss-desc">
            QuickDraw is 100% open source. Explore the codebase, submit PRs, self-host on your own infrastructure, or build custom integrations — no vendor lock-in, ever.
          </p>

          <div className="oss-badges">
            <a href="https://github.com/rajputdivyanshu81/QuickDraw" target="_blank" rel="noopener noreferrer" className="oss-badge-github">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
              Star on GitHub
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
            <div className="oss-badge-license">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              MIT License
            </div>
          </div>

          {/* Tech stack pills */}
          <div className="oss-stack">
            <div className="oss-stack-label">Built with</div>
            <div className="oss-stack-pills">
              {["Next.js", "TypeScript", "WebSocket", "Prisma", "PostgreSQL", "Gemini AI"].map((t, i) => (
                <span className="oss-tech-pill" key={i}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: GitHub-style repo card */}
        <div className="oss-right">
          <div className="oss-repo-card">
            {/* Repo header */}
            <div className="oss-repo-header">
              <div className="oss-repo-dots">
                <span style={{ background: "#ef4444" }}></span>
                <span style={{ background: "#f59e0b" }}></span>
                <span style={{ background: "#10b981" }}></span>
              </div>
              <div className="oss-repo-url">github.com/rajputdivyanshu81/QuickDraw</div>
            </div>

            {/* Repo body */}
            <div className="oss-repo-body">
              <div className="oss-repo-name-row">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#7c3aed"><path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" /></svg>
                <span className="oss-repo-name">QuickDraw</span>
                <span className="oss-repo-visibility">Public</span>
              </div>
              <p className="oss-repo-desc">Real-time collaborative whiteboarding with AI assistance, voice chat, PPT export, and infinite canvas.</p>

              {/* Language bar */}
              <div className="oss-lang-bar">
                <div style={{ width: "55%", background: "#3178c6" }}></div>
                <div style={{ width: "25%", background: "#f97316" }}></div>
                <div style={{ width: "12%", background: "#7c3aed" }}></div>
                <div style={{ width: "8%", background: "#10b981" }}></div>
              </div>
              <div className="oss-lang-legend">
                <span><i style={{ background: "#3178c6" }}></i>TypeScript</span>
                <span><i style={{ background: "#f97316" }}></i>CSS</span>
                <span><i style={{ background: "#7c3aed" }}></i>Prisma</span>
                <span><i style={{ background: "#10b981" }}></i>Other</span>
              </div>

              {/* Stat row */}
              <div className="oss-repo-stats">
                <div className="oss-repo-stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#6b7280"><path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>
                  <span>Stars</span>
                </div>
                <div className="oss-repo-stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#6b7280"><path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
                  <span>Forks</span>
                </div>
                <div className="oss-repo-stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#6b7280"><path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.37.65l2.5 1.5a.75.75 0 00.77-1.28L8.5 7.96V4.75z" /></svg>
                  <span>Active</span>
                </div>
              </div>

              {/* Monorepo structure */}
              <div className="oss-tree">
                <div className="oss-tree-title">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#7c3aed"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" /></svg>
                  Monorepo structure
                </div>
                {[
                  { name: "apps/excelidraw-frontend", desc: "Canvas app + Landing", color: "#7c3aed" },
                  { name: "apps/http-backend", desc: "REST API", color: "#f97316" },
                  { name: "apps/ws-backend", desc: "WebSocket server", color: "#10b981" },
                  { name: "packages/", desc: "Shared libs (db, ui, common)", color: "#6b7280" },
                ].map((item, i) => (
                  <div className="oss-tree-item" key={i}>
                    <div className="oss-tree-dot" style={{ background: item.color }}></div>
                    <code className="oss-tree-path">{item.name}</code>
                    <span className="oss-tree-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating contribution activity */}
          <div className="oss-contrib-float">
            <div className="oss-contrib-grid">
              {Array.from({ length: 35 }).map((_, i) => {
                const levels = [0, 0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2, 3, 1, 0, 1, 2, 0, 3, 1, 2, 1, 0, 2, 1, 3, 0, 1, 2, 1];
                const colors = ["rgba(139,92,246,.08)", "rgba(139,92,246,.2)", "rgba(139,92,246,.45)", "rgba(139,92,246,.75)"];
                return <div key={i} className="oss-contrib-cell" style={{ background: colors[levels[i] || 0] }}></div>;
              })}
            </div>
            <span className="oss-contrib-label">Contribution activity</span>
          </div>
        </div>
      </div>
    </section>
  );
}
