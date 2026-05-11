"use client";

import React from "react";
import { Book, Code, Shield, Terminal } from "lucide-react";

export default function DocsSection() {
  const docs = [
    {
      title: "API Reference",
      desc: "Full documentation for REST and WebSocket endpoints.",
      icon: <Terminal size={20} className="text-purple-500" />,
      link: "http://localhost:3006/docs/api/http"
    },
    {
      title: "Architecture",
      desc: "Deep dive into our ultra-low latency sync engine.",
      icon: <Code size={20} className="text-blue-500" />,
      link: "http://localhost:3006/docs/architecture"
    },
    {
      title: "Contributing",
      desc: "Guidelines for setting up the monorepo and PRs.",
      icon: <Book size={20} className="text-orange-500" />,
      link: "http://localhost:3006/docs/contributing"
    },
    {
      title: "Security",
      desc: "How we keep your collaborative data safe and secure.",
      icon: <Shield size={20} className="text-green-500" />,
      link: "http://localhost:3006/docs/security"
    }
  ];

  return (
    <section id="docs" className="bento-section" style={{ background: "var(--purple-faint)" }}>
      <div className="bento-header">
        <span className="section-chip">Documentation</span>
        <h2 className="bento-title">Built for Developers</h2>
        <p className="bento-sub">
          Comprehensive guides and API references to help you build, 
          extend, and integrate with QuickDraw.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto">
        {docs.map((doc) => (
          <a 
            key={doc.title}
            href={doc.link}
            className="bcard p-8 flex flex-col gap-4 no-underline"
            style={{ minHeight: "auto" }}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-purple)] flex items-center justify-center shadow-sm">
              {doc.icon}
            </div>
            <div>
              <h3 className="bcard-label m-0">{doc.title}</h3>
              <p className="bcard-desc m-0 mt-2">{doc.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center mt-12">
        <a 
          href="http://localhost:3006" 
          className="btn-white"
          style={{ border: "1.5px solid var(--purple-mid)", color: "var(--purple-mid)", boxShadow: "none" }}
        >
          Explore Full Documentation
        </a>
      </div>
    </section>
  );
}
