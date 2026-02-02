'use client';

import { Shapes, Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UnderConstructionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030711] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[20%] w-[25%] h-[25%] bg-violet-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center space-y-8 max-w-lg"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-indigo-600/20 rounded-3xl flex items-center justify-center border border-indigo-500/30">
            <Construction className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Under Construction
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We're working hard to bring this feature to life. Check back soon for updates!
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold cursor-pointer outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Footer Branding */}
        <div className="pt-12 flex items-center justify-center gap-2 text-gray-600 text-sm">
          <Shapes className="w-4 h-4" />
          <span>DrawFlow</span>
        </div>
      </motion.div>
    </div>
  );
}
