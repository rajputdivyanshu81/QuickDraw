"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export default function HeroSection() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const { getToken } = useAuth();

  const handleCreateRoom = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: `room-${Math.floor(Math.random() * 10000)}` },
        { headers: { Authorization: token } }
      );
      router.push(`/canvas/${res.data.roomId}`);
    } catch (e) {
      console.error("Failed to create room", e);
      const id = Math.floor(Math.random() * 10000);
      router.push(`/canvas/${id}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero-badge">
        <div className="hero-badge-icon">⚡</div>
        Real-time collaboration · Free forever - Built with the support of the Yogi Ji&apos;s Scholarship
      </div>

      <div className="hero-body">
        <div>
          <h1 className="hero-h1">
            Collaborative<br />whiteboards,<br />built for speed
          </h1>
        </div>
        <div className="hero-right">
          <p className="hero-desc">
            Draw, design, and brainstorm together with ultra-low latency stroke sync, AI-powered assistance, and room-based collaboration — all in your browser.
          </p>

          <SignedIn>
            <div className="hero-input-row">
              <span className="hero-input-flag">🎨</span>
              <input
                type="text"
                placeholder="Paste a room link or create one…"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomId) {
                    router.push(`/canvas/${roomId}`);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (roomId) {
                    router.push(`/canvas/${roomId}`);
                  } else {
                    handleCreateRoom();
                  }
                }}
                className="hero-input-btn"
                style={{ border: "none", fontFamily: "inherit", cursor: "pointer" }}
              >
                <div className="hero-input-orb"></div>
                Start Drawing
              </button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="hero-input-row">
              <span className="hero-input-flag">🎨</span>
              <input
                type="text"
                placeholder="Sign up to start drawing…"
                readOnly
                onClick={() => router.push("/signup")}
                style={{ cursor: "pointer" }}
              />
              <button
                onClick={() => router.push("/signup")}
                className="hero-input-btn"
                style={{ border: "none", fontFamily: "inherit", cursor: "pointer" }}
              >
                <div className="hero-input-orb"></div>
                Get Started Free
              </button>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* DNA Helix Animation */}
      <div className="helix-wrap">
        <svg className="helix-svg" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="h1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0" />
              <stop offset="20%" stopColor="#7c3aed" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#6d28d9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="h2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0" />
              <stop offset="20%" stopColor="#a78bfa" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="h3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ede9fe" stopOpacity="0" />
              <stop offset="20%" stopColor="#c4b5fd" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#a78bfa" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ede9fe" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-100,200 C100,240 200,80 400,180 C600,280 700,60 900,160 C1100,260 1200,80 1400,160 C1500,200 1550,220 1600,200" fill="none" stroke="url(#h1)" strokeWidth="22" strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0,0;-30,0;0,0" dur="8s" repeatCount="indefinite" />
          </path>
          <path d="M-100,160 C100,80 200,240 400,140 C600,40 700,220 900,120 C1100,20 1200,200 1400,100 C1500,60 1550,80 1600,100" fill="none" stroke="url(#h2)" strokeWidth="18" strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0,0;30,0;0,0" dur="10s" repeatCount="indefinite" />
          </path>
          <path d="M-100,230 C100,270 200,120 400,220 C600,320 700,100 900,200 C1100,300 1200,100 1400,190 C1500,230 1550,250 1600,230" fill="none" stroke="url(#h3)" strokeWidth="14" strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0,0;-20,0;0,0" dur="12s" repeatCount="indefinite" />
          </path>
          <circle r="5" fill="rgba(249,115,22,0.9)">
            <animateMotion dur="8s" repeatCount="indefinite" path="M-100,200 C100,240 200,80 400,180 C600,280 700,60 900,160 C1100,260 1200,80 1400,160" />
          </circle>
          <circle r="3.5" fill="rgba(196,181,253,0.8)">
            <animateMotion dur="10s" begin="-3s" repeatCount="indefinite" path="M-100,160 C100,80 200,240 400,140 C600,40 700,220 900,120 C1100,20 1200,200 1400,100" />
          </circle>
          <circle r="4" fill="rgba(249,115,22,0.7)">
            <animateMotion dur="9s" begin="-6s" repeatCount="indefinite" path="M-100,200 C100,240 200,80 400,180 C600,280 700,60 900,160 C1100,260 1200,80 1400,160" />
          </circle>
        </svg>
      </div>
    </section>
  );
}
