export default function Footer() {
  return (
    <footer>
      <div className="footer-bg">
        <svg className="footer-hills" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,180 C200,120 400,200 600,150 C800,100 1000,180 1200,140 C1350,110 1400,160 1440,150 L1440,200 L0,200 Z" fill="rgba(91,33,182,0.4)" />
          <path d="M0,200 C150,160 350,200 550,175 C750,150 950,200 1150,170 C1300,145 1400,175 1440,165 L1440,200 L0,200 Z" fill="rgba(55,11,99,0.6)" />
        </svg>

        <div className="footer-card">
          <div>
            <a href="/" className="footer-logo-pill">
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <rect width="26" height="26" rx="7" fill="#0f0520" />
                <path d="M7 18 Q13 6 19 13 Q13 19 7 13" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx="19" cy="9" r="2.5" fill="#f97316" />
              </svg>
              QuickDraw
            </a>
            <div className="footer-preview">
              <svg viewBox="0 0 220 60" style={{ width: "100%", height: "100%" }}>
                <defs>
                  <pattern id="fg" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M12 0L0 0 0 12" fill="none" stroke="rgba(139,92,246,.08)" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="220" height="60" fill="url(#fg)" />
                <rect x="8" y="8" width="50" height="32" rx="5" fill="none" stroke="rgba(109,40,217,.3)" strokeWidth="1" />
                <rect x="80" y="8" width="50" height="32" rx="5" fill="none" stroke="rgba(249,115,22,.3)" strokeWidth="1" />
                <rect x="152" y="8" width="60" height="32" rx="5" fill="none" stroke="rgba(59,130,246,.3)" strokeWidth="1" />
                <path d="M58 24 L80 24" stroke="#9ca3af" strokeWidth=".8" strokeDasharray="2,2" />
                <path d="M130 24 L152 24" stroke="#9ca3af" strokeWidth=".8" strokeDasharray="2,2" />
                <path d="M20 45 Q60 38 100 43 Q140 48 180 40" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" opacity=".7">
                  <animate attributeName="stroke-dasharray" from="0,300" to="300,0" dur="3s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
          </div>

          <div>
            <p className="footer-tagline">Strokes that<br />sync instantly.</p>
            <div className="footer-socials">
              <a href="https://github.com/rajputdivyanshu81/QuickDraw" className="footer-social-btn" title="GitHub">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#374151"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
              </a>
              <a href="https://x.com/quickdrawopen" className="footer-social-btn" title="X">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#374151"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-col-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#technology">Technology</a></li>
              <li><a href="#teams">For Teams</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="#">Changelog</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>All rights reserved © 2026 QuickDraw</span>
        <span>Built with ⚡, WebSockets, and late nights</span>
      </div>
    </footer>
  );
}
