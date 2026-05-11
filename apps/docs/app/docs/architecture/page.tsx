"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Database, Sparkles } from 'lucide-react';

export default function ArchitecturePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <article className="prose max-w-none pb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <span className="section-chip bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Architecture</span>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 !m-0 leading-tight">
          Ultra-low latency<br/><span className="text-purple-600">sync engine.</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-3xl">
          QuickDraw is engineered for speed. We use a hybrid architecture 
          combining RESTful management with raw WebSocket synchronization to achieve sub-50ms latency.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16 not-prose"
      >
        {[
          { title: "Frontend", icon: Cpu, desc: "Next.js + Canvas API for smooth 120fps rendering.", color: "text-purple-600", bg: "blue-tint" },
          { title: "WebSocket", icon: Zap, desc: "Node.js cluster for global stroke broadcasting.", color: "text-orange-600", bg: "orange-tint" },
          { title: "Persistence", icon: Database, desc: "PostgreSQL with Prisma for reliable room storage.", color: "text-blue-600", bg: "green-tint" },
          { title: "AI Sync", icon: Sparkles, desc: "Real-time design suggestions via Groq integration.", color: "text-green-600", bg: "pink-tint" },
        ].map((feat) => (
          <motion.div 
            key={feat.title} 
            variants={item}
            className="bcard corner-dots p-10 group"
          >
            <div className="wf-grid opacity-[0.03]" />
            <div className={`w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center ${feat.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-gray-100`}>
              <feat.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{feat.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight">Data Propagation</h2>
        <p className="text-lg text-gray-500 leading-relaxed">
          Stroke data is propagated using a &quot;broadcast-first&quot; strategy. As soon as the server 
          receives a packet, it is immediately emitted to all other connected clients before 
          being queued for database persistence.
        </p>

        <div className="not-prose my-12 bcard corner-dots !bg-gray-900 p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="wf-grid opacity-[0.1]" />
          <pre className="m-0 text-purple-300 font-mono text-base leading-relaxed overflow-x-auto relative z-10">
{`[Client A] --- stroke_data ---> [WS Server]
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
     [Broadcast to]          [Broadcast to]          [Queue for]
       Client B                Client C               Postgres`}
          </pre>
        </div>

        <div className="flex items-center gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100 italic text-gray-500">
          <Zap size={20} className="text-orange-500" />
          <p className="m-0 text-sm">
            Latency measured from Client A to Client B is typically &lt; 50ms in optimized regions.
          </p>
        </div>
      </div>
    </article>
  );
}
