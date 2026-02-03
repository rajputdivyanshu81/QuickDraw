'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { 
  Shapes, 
  Sparkles, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  MousePointer2, 
  Layout, 
  Shield,
  Layers
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  SignedIn, 
  SignedOut, 
  UserButton,
  useAuth
} from '@clerk/nextjs';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';
import { motion, useScroll, useTransform } from 'framer-motion';

// Workaround for Lucide icon type errors in React 19/Next.js 15
const ShapesIcon = Shapes as any;
const SparklesIcon = Sparkles as any;
const ZapIcon = Zap as any;
const UsersIcon = Users as any;
const ArrowRightIcon = ArrowRight as any;
const ShieldIcon = Shield as any;
const LayersIcon = Layers as any;
const NextImage = Image as any;

export default function LandingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleCreateRoom = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(`${HTTP_BACKEND}/room`, {
        name: `room-${Math.floor(Math.random() * 10000)}`
      }, {
        headers: { Authorization: token }
      });
      router.push(`/canvas/${res.data.roomId}`);
    } catch (e) {
      console.error("Failed to create room", e);
      const roomId = Math.floor(Math.random() * 10000);
      router.push(`/canvas/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030711] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-[#030711]/50 backdrop-blur-xl z-[100] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <ShapesIcon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                DrawFlow
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#integrations" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Integrations</a>
              <span onClick={() => router.push('/pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">Pricing</span>
              <div className="h-6 w-px bg-white/10" />
              <SignedIn>
                <div className="flex items-center gap-4">
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-white/10" } }} />
                </div>
              </SignedIn>
              <SignedOut>
                <button 
                  onClick={() => router.push('/signin')}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-all text-sm font-semibold shadow-xl shadow-white/5 outline-none border-none cursor-pointer"
                >
                  Join for free
                </button>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 lg:px-12">
          <motion.div 
            style={{ opacity, scale }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-4"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Collaborative drawing reimagined</span>
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight"
            >
              Where ideas find <br />
              <span className="text-indigo-500 inline-block mt-2">their flow.</span>
            </motion.h1>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl text-lg md:text-xl text-gray-400 font-medium leading-relaxed"
            >
              Bring your creative vision to life on an infinite canvas. Build, brainstorm, 
              and design in real-time with teams across the globe.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <SignedOut>
                <button 
                  onClick={() => router.push('/signup')}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-2xl shadow-indigo-500/20 transition-all transform hover:scale-105 flex items-center justify-center outline-none border-none cursor-pointer"
                >
                  Get started — it&apos;s free <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </SignedOut>
              <SignedIn>
                <button 
                  onClick={handleCreateRoom}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-2xl shadow-indigo-500/20 transition-all transform hover:scale-105 flex items-center justify-center outline-none border-none cursor-pointer"
                >
                  Open new canvas <ArrowRightIcon className="ml-2 w-5 h-5" />
                </button>
              </SignedIn>
              <button onClick={() => router.push('/pricing')} className="w-full sm:w-auto px-10 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-semibold flex items-center justify-center text-gray-300 outline-none cursor-pointer">
                Watch demo
              </button>
            </motion.div>
          </motion.div>

          {/* Canvas Preview Mockup */}
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative px-4"
          >
            <div className="relative group p-1.5 bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] shadow-[0_0_80px_-15px_rgba(79,70,229,0.3)]">
              <div className="rounded-[1.8rem] overflow-hidden bg-[#0a0a0a] border border-white/10">
                <NextImage
                  src="/hero.png"
                  alt="DrawFlow Interface"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] opacity-90"
                />

                {/* Floating UI Overlays */}
                <div className="absolute top-8 left-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                      <ShapesIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <div className="w-16 h-2 bg-white/20 rounded-full mb-1.5" />
                      <div className="w-10 h-2 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-10 right-10 flex flex-col md:flex-row gap-4 hidden lg:flex">
                   <div className="px-5 py-2.5 bg-indigo-600/90 backdrop-blur-xl rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/10">
                    <SparklesIcon className="w-3.5 h-3.5" /> High-Performance Engine
                   </div>
                   <div className="px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 shadow-2xl">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                          <UsersIcon className="w-4 h-4" />
                        </div>
                      ))}
                    </div>
                    <span className="ml-1 text-gray-300">4+ designers active</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Feature Grid */}
        <section id="features" className="py-24 bg-[#030711] relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Built for modern creators.</h2>
              <p className="text-gray-400 max-w-xl">Supercharge your workflow with tools built to handle scale and real-time collaboration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[800px]">
              {/* Feature 1: Real-time (Bento Large) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 md:row-span-1 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 flex flex-col justify-between overflow-hidden relative group transition-all"
              >
                <div className="relative z-10 max-w-md">
                   <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                     <ZapIcon className="w-6 h-6" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4">Ultra-low latency <br /> collaboration.</h3>
                   <p className="text-gray-400 font-medium leading-relaxed">Experience zero lag with our proprietary WebSocket engine. See every brush stroke and shape move as it happens.</p>
                </div>
                <div className="absolute top-10 -right-20 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform" />
                <div className="mt-12 flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-4 transition-all">
                  <span>Learn about our sync engine</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Feature 2: Dark Mode (Bento Small) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between group"
              >
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                    <SparklesIcon className="w-6 h-6 text-yellow-500" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-2">Infinite canvas</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">No boundaries to your imagination. Zoom out 100x or go deep for micro-details.</p>
                 </div>
              </motion.div>

              {/* Feature 3: Security (Bento Small) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between group"
              >
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                    <ShieldIcon className="w-6 h-6 text-green-500" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-2">Secure by design</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Enterprise-grade security. Your data is encrypted at rest and in transit.</p>
                 </div>
              </motion.div>

              {/* Feature 4: Components (Bento Large) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-8 items-center overflow-hidden group"
              >
                <div className="flex-1 space-y-4">
                   <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                     <LayersIcon className="w-6 h-6 text-cyan-400" />
                   </div>
                   <h3 className="text-2xl font-bold">Reusable Components</h3>
                   <p className="text-gray-400 font-medium">Build your own library of custom shapes and components. Drag them into any project instantly.</p>
                </div>
                <div className="w-full md:w-max flex gap-4 items-center">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform" />
                       <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 -translate-y-4" />
                       <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 translate-x-4" />
                       <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 group-hover:-translate-y-8 transition-transform" />
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="py-24 bg-[#030711] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl font-bold mb-16">Connect your favorite tools</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
               {['Github', 'Slack', 'Discord', 'Notion', 'Figma', 'Linear'].map(tool => (
                 <div key={tool} className="text-xl font-bold tracking-tighter">{tool}</div>
               ))}
            </div>
          </div>
        </section>

        {/* AI CTA Section */}
        <section className="py-20 relative px-6">
          <div className="max-w-5xl mx-auto p-12 lg:p-20 rounded-[3rem] bg-indigo-600 relative overflow-hidden text-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800" />
            <div className="absolute top-0 right-0 w-[500px] h-full bg-white/5 -skew-x-12 translate-x-32" />
            <div className="relative z-10 space-y-8">
               <h2 className="text-4xl md:text-6xl font-bold leading-tight">Push the limits of <br /> visual collaboration.</h2>
               <p className="text-indigo-100/80 max-w-xl mx-auto text-lg">Join forward-thinking teams like Vercel, Linear, and OpenSea who use DrawFlow to ship faster.</p>
               <button 
                onClick={() => router.push('/signup')}
                className="bg-white text-[#030711] px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none border-none cursor-pointer"
               >
                 Create your first canvas
               </button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 bg-[#030711] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            {/* Left: Brand */}
            <div className="space-y-4 max-w-xs">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                   <ShapesIcon className="w-5 h-5" />
                 </div>
                 <span className="text-xl font-bold">DrawFlow</span>
               </div>
               <p className="text-gray-500 text-sm leading-relaxed">
                 Open-source collaborative drawing tool.
               </p>
            </div>

            {/* Right: Links */}
            <div className="flex gap-16">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Product</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li onClick={() => router.push('/coming-soon')} className="hover:text-white transition-colors cursor-pointer">Features</li>
                  <li onClick={() => router.push('/coming-soon')} className="hover:text-white transition-colors cursor-pointer">Changelog</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Pricing</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li onClick={() => router.push('/pricing')} className="hover:text-white transition-colors cursor-pointer">Lifetime Plan</li>
                  <li onClick={() => router.push('/pricing')} className="hover:text-white transition-colors cursor-pointer">Free Plan</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© 2024 DrawFlow. All rights reserved.</p>
            <div className="flex gap-6">
               <span onClick={() => router.push('/coming-soon')} className="hover:text-white transition-colors cursor-pointer">Privacy</span>
               <span onClick={() => router.push('/coming-soon')} className="hover:text-white transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}