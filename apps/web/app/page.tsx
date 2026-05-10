"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Optionally redirect to main frontend
    // window.location.href = "https://quick-draw-excelidraw-frontend.vercel.app";
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <h1>QuickDraw Backend/Web App</h1>
      <p style={{ marginLeft: "1rem" }}>Landing page moved to excelidraw-frontend.</p>
    </div>
  );
}