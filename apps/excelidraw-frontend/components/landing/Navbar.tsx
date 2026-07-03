"use client";

import { useState } from "react";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { SYSTEM_DESIGN_PROBLEMS } from "@/config/problems";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export default function Navbar() {
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredProblems = SYSTEM_DESIGN_PROBLEMS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleStartPractice = async (problemId: string) => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: `practice-${problemId}-${Math.floor(Math.random() * 1000)}` },
        { headers: { Authorization: token } }
      );
      setIsModalOpen(false);
      router.push(`/canvas/${res.data.roomId}?problemId=${problemId}`);
    } catch (e) {
      console.error("Failed to create practice room", e);
      const id = `practice-${problemId}-${Math.floor(Math.random() * 1000)}`;
      setIsModalOpen(false);
      router.push(`/canvas/${id}?problemId=${problemId}`);
    }
  };

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
        <a href={process.env.NEXT_PUBLIC_DOCS_URL || "/docs"}>Docs</a>
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
            onClick={() => setIsModalOpen(true)}
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
            Practice System Design
          </button>
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

      {/* System Design Problems Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          style={{ pointerEvents: "all" }}
        >
          <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-4xl rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between bg-[#161616]">
              <div className="text-left">
                <h2 className="text-xl font-bold text-white tracking-tight">System Design Problems</h2>
                <p className="text-gray-400 text-xs mt-1">Practice High-Level Design (HLD) with our interactive whiteboard and document workspace.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[#2a2a2a] rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="p-4 border-b border-[#2a2a2a] bg-[#141414] flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 flex-1">
                <Search className="w-4 h-4 text-gray-500 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-200 text-sm w-full"
                />
              </div>

              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-[#1e1e1e] border border-[#2a2a2a] text-gray-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Grid list */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121212]">
              {filteredProblems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 text-sm">
                  No problems match your search criteria.
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const badgeColor = prob.difficulty === "Easy"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : prob.difficulty === "Medium"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400";
                  
                  return (
                    <div 
                      key={prob.id} 
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-lg shadow-black/10 group text-left"
                    >
                      <div>
                        {/* Badges & Logos */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {prob.difficulty}
                          </span>
                          <div className="flex -space-x-1 overflow-hidden opacity-60 group-hover:opacity-90 transition-opacity">
                            {prob.companies.slice(0, 3).map((comp) => (
                              <div key={comp} className="w-5 h-5 rounded-full bg-[#2a2a2a] border border-[#121212] flex items-center justify-center text-[8px] font-bold text-gray-300 select-none" title={comp}>
                                {comp[0]}
                              </div>
                            ))}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                          {prob.title}
                        </h3>
                        <p className="text-gray-400 text-xs mb-6 line-clamp-2 leading-relaxed">
                          {prob.description}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleStartPractice(prob.id)}
                        className="w-full py-2.5 bg-[#242424] hover:bg-indigo-600 border border-[#2a2a2a] hover:border-indigo-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        Start Practice →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
