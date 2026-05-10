"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="cta-section">
      <div className="cta-card">
        <h2 className="cta-h2">Draw something great,<br />together.</h2>
        <p className="cta-p">Open an infinite canvas right now — no install, no friction. Free forever.</p>
        <div className="cta-btns">
          <SignedIn>
            <button
              onClick={() => router.push("/canvas/quickdraw-" + Math.floor(Math.random() * 10000))}
              className="btn-white"
              style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              🎨 Open Canvas
            </button>
          </SignedIn>
          <SignedOut>
            <button
              onClick={() => router.push("/signup")}
              className="btn-white"
              style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              🎨 Get Started Free
            </button>
          </SignedOut>
          <a href="#features" className="btn-ghost">Explore features</a>
        </div>
      </div>
    </section>
  );
}
