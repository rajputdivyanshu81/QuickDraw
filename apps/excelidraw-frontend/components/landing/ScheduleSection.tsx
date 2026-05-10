export default function ScheduleSection() {
  return (
    <section className="schedule-section">
      <div className="schedule-inner">
        <div className="schedule-left">
          <div className="section-chip">Get in touch</div>
          <h2 className="schedule-title">Want to know more<br />about QuickDraw?</h2>
          <p className="schedule-desc">
            Whether you&apos;re exploring QuickDraw for your team, need a walkthrough of features like voice calls, PPT export, or AI assistance — let&apos;s chat.
          </p>
          <div className="schedule-features">
            {[
              { icon: "🎙️", text: "Voice calls in every room" },
              { icon: "📊", text: "Create PPT from canvas selections" },
              { icon: "🎨", text: "Custom canvas backgrounds" },
              { icon: "📥", text: "Download as PNG or JPEG" },
            ].map((f, i) => (
              <div className="schedule-feature-pill" key={i}>
                <span className="schedule-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-right">
          <div className="schedule-card">
            <div className="schedule-card-header">
              <div className="schedule-card-orb"></div>
              <div>
                <div className="schedule-card-title">Schedule a Call</div>
                <div className="schedule-card-sub">30-min intro · Free · No commitment</div>
              </div>
            </div>

            <div className="schedule-card-body">
              <div className="schedule-card-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>30 minutes</span>
              </div>
              <div className="schedule-card-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Google Meet / Zoom</span>
              </div>
              <div className="schedule-card-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Pick any time that works</span>
              </div>
            </div>

            <a
              href="https://calendly.com/divyanshurajput552/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-card-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule a Call Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
