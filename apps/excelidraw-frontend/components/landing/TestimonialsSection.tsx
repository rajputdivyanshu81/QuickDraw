export default function TestimonialsSection() {
  const testimonials = [
    {
      text: "\"The latency is genuinely impressive. We use QuickDraw for daily architecture reviews — the real-time sync never misses a beat with 8 people drawing simultaneously.\"",
      initials: "MK",
      name: "Michael K.",
      role: "Engineering Lead, SaaS startup",
      bg: "linear-gradient(135deg,#5b21b6,#7c3aed)",
    },
    {
      text: "\"Finally a whiteboard that doesn't feel sluggish. The AI shape correction alone saves us 20 minutes per session. Our design team switched from Miro and won't go back.\"",
      initials: "SR",
      name: "Sarah R.",
      role: "Product Designer, Fintech",
      bg: "linear-gradient(135deg,#f97316,#fb923c)",
    },
    {
      text: "\"The monorepo architecture is chef's kiss. We forked it, added our own integrations in a weekend, and deployed to private cloud. Couldn't do that with any other tool.\"",
      initials: "AL",
      name: "Alex L.",
      role: "CTO, Dev tools company",
      bg: "linear-gradient(135deg,#10b981,#34d399)",
    },
  ];

  return (
    <section className="testimonials-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <div className="section-chip">Loved by teams</div>
          <h2 className="bento-title">What people are saying.</h2>
        </div>
        <div className="t-grid">
          {testimonials.map((t, i) => (
            <div className="t-card" key={i}>
              <div className="t-stars">★★★★★</div>
              <p className="t-text">{t.text}</p>
              <div className="t-author">
                <div className="t-avatar" style={{ background: t.bg }}>{t.initials}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
