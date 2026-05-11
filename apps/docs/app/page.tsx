"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Terminal, 
  Cpu, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Layout,
  Layers,
  Github
} from 'lucide-react';

export default function DocsHome() {
  const categories = [
    {
      title: "Architecture",
      desc: "Deep dive into our ultra-low latency sync engine and monorepo structure.",
      href: "/docs/architecture",
      icon: Cpu,
      color: "text-purple-600",
      bg: "blue-tint",
      wide: true
    },
    {
      title: "API Reference",
      desc: "Full documentation for REST and WebSocket endpoints.",
      href: "/docs/api/http",
      icon: Terminal,
      color: "text-orange-600",
      bg: "orange-tint"
    },
    {
      title: "WebSocket",
      desc: "Master the real-time synchronization protocol.",
      href: "/docs/api/ws",
      icon: Layers,
      color: "text-blue-600",
      bg: "pink-tint"
    },
    {
      title: "Contributing",
      desc: "Guidelines for setting up the monorepo and submitting PRs.",
      href: "/docs/contributing",
      icon: Users,
      color: "text-green-600",
      bg: "green-tint"
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section Style */}
      <section className="relative py-12 md:py-24 border-b border-gray-100 overflow-hidden">
        <div className="wf-grid opacity-[0.03]" />
        
        <div className="relative z-10 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-white text-orange-900 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Developer Documentation</span>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-8">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900">
                The core of<br/>
                <span className="text-purple-600">QuickDraw.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-2xl font-medium">
                Deep dive into the architecture, protocols, and APIs that power the world's fastest collaborative whiteboarding engine.
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Link 
                  href="/docs/architecture" 
                  className="nav-cta-pill flex items-center gap-3 px-10 py-5 !text-lg no-underline"
                >
                  <div className="nav-cta-orb" />
                  <span>Start Exploring</span>
                  <ArrowRight size={22} />
                </Link>
                <Link 
                  href="https://github.com/rajputdivyanshu81/QuickDraw" 
                  className="flex items-center gap-2 px-10 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <Github size={20} />
                  <span>View Source</span>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block lg:col-span-4">
              <div className="bcard corner-dots p-8 space-y-6 rotate-3 hover:rotate-0 transition-transform duration-700 bg-white/50 backdrop-blur-sm">
                <div className="wf-grid opacity-[0.05]" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">Current v1.2.0</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Stable Release</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-purple-600 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Performance</span>
                    <span className="text-purple-600">98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="space-y-12">
        <div className="space-y-2">
          <span className="section-chip inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Core Features</span>
          <h2 className="text-4xl font-black tracking-tight">Everything in one place.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.href}
              href={cat.href}
              className={`bcard corner-dots group flex flex-col ${cat.wide ? 'md:col-span-2' : ''}`}
            >
              <div className={`h-56 relative overflow-hidden flex items-center justify-center bg-gray-50/50 ${cat.bg}`}>
                <div className="wf-grid opacity-[0.05]" />
                <div className={`relative z-10 w-20 h-20 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 border border-gray-100`}>
                  <cat.icon size={36} />
                </div>
              </div>
              <div className="p-10 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{cat.title}</h3>
                  <p className="text-gray-500 text-base leading-relaxed">{cat.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 pt-4 group-hover:translate-x-2 transition-transform duration-500">
                  <span>Explore Documentation</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="relative">
        <div className="bcard corner-dots !p-12 md:!p-20 overflow-hidden text-center space-y-8">
          <div className="wf-grid opacity-[0.03]" />
          
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="section-chip bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Open Source</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Join the Community.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              QuickDraw is 100% open source. Help us build the future of collaborative design by contributing to the monorepo.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="https://github.com/rajputdivyanshu81/QuickDraw" 
                className="nav-cta-pill flex items-center gap-2.5 px-8 py-4 !text-base no-underline"
              >
                <div className="nav-cta-orb" />
                <Github size={20} />
                <span>GitHub Repository</span>
              </Link>
              <Link 
                href="/docs/contributing" 
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors"
              >
                <span>Contribution Guide</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
