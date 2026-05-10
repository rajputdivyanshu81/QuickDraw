"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className="nav-wrap">
      <Link href="/" className="nav-pill nav-logo-pill" style={{ display: "flex" }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="7" fill="#0f0520" />
          <path d="M7 18 Q13 6 19 13 Q13 19 7 13" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="9" r="2.5" fill="#f97316" />
        </svg>
        QuickDraw
      </Link>

      <div className="nav-pill nav-links-pill">
        <a href="#features">Why QuickDraw</a>
        <a href="#technology">Technology</a>
        <a href="#teams">For Teams</a>
      </div>

      <SignedOut>
        <div style={{ display: "flex", gap: 8, pointerEvents: "all" }}>
          <button
            onClick={() => router.push("/signin")}
            className="nav-pill"
            style={{
              padding: "10px 20px",
              border: "1px solid rgba(0,0,0,.08)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)",
            }}
          >
            Login
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="nav-pill nav-cta-pill"
            style={{ display: "flex", border: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            <div className="nav-cta-orb"></div>
            Sign Up
          </button>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "all" }}>
          <button
            onClick={() => router.push("/canvas/quickdraw-" + Math.floor(Math.random() * 10000))}
            className="nav-pill nav-cta-pill"
            style={{ display: "flex", border: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            <div className="nav-cta-orb"></div>
            Open Canvas
          </button>
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-9 h-9 border border-white/10" },
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}
