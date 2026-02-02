'use client';

import React from 'react';
import { 
  XCircle, 
  RefreshCcw, 
  HelpCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030711] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 text-center relative z-10 shadow-2xl"
      >
        <div className="mb-8 flex justify-center">
           <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30 group">
              <XCircle className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform" />
           </div>
        </div>

        <div className="space-y-4">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Payment Incomplete</span>
           </div>
           
           <h1 className="text-4xl font-black">Something went wrong</h1>
           <p className="text-gray-400 font-medium">
             We couldn't process your payment. This could be due to a bank rejection, insufficient funds, or a network timeout.
           </p>
        </div>

        <div className="mt-10 space-y-4">
           <button 
            onClick={() => router.push('/pricing')}
            className="w-full py-5 rounded-2xl bg-white text-black hover:bg-gray-200 font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
           >
             <RefreshCcw className="w-5 h-5" /> Try Again
           </button>
           
           <button 
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 font-bold transition-all flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
           >
             <ArrowLeft className="w-4 h-4" /> Back to Home
           </button>
           
           <div className="pt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
              <HelpCircle className="w-4 h-4" /> Need help? Contact support@drawflow.com
           </div>
        </div>
      </motion.div>
    </div>
  );
}
