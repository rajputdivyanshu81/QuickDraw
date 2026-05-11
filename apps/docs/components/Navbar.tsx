import React from 'react';
import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="fixed top-[18px] left-0 right-0 z-[200] flex items-center justify-between px-10 gap-3 pointer-events-none">
      {/* Logo Pill */}
      <Link href="/" className="nav-pill nav-logo-pill px-5 py-2.5 flex items-center gap-2.5 pointer-events-auto no-underline text-gray-900 font-bold text-[15px]">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="7" fill="#0f0520" />
          <path d="M7 18 Q13 6 19 13 Q13 19 7 13" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="9" r="2.5" fill="#f97316" />
        </svg>
        <div className="flex flex-col leading-tight">
          <span>QuickDraw</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-purple-600 font-black">Docs</span>
        </div>
      </Link>

      {/* Links Pill */}
      <nav className="nav-pill px-2.5 py-2 flex items-center gap-0.5 pointer-events-auto hidden md:flex">
        <Link href="/docs/architecture" className="px-4 py-1.5 rounded-[40px] text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all">
          Architecture
        </Link>
        <Link href="/docs/api/http" className="px-4 py-1.5 rounded-[40px] text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all">
          API
        </Link>
        <Link href="/docs/contributing" className="px-4 py-1.5 rounded-[40px] text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all">
          Contributing
        </Link>
      </nav>

      {/* CTA Pill */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link 
          href="https://github.com/rajputdivyanshu81/QuickDraw" 
          className="nav-pill p-2.5 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <Github size={20} />
        </Link>
        <Link 
          href="https://quick-draw-excelidraw-frontend.vercel.app" 
          className="nav-cta-pill flex items-center gap-2.5 no-underline"
        >
          <div className="nav-cta-orb" />
          <span className="text-sm font-bold">Go Live</span>
          <ExternalLink size={14} />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
