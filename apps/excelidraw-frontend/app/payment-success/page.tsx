'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  PartyPopper,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [txnId, setTxnId] = useState<string | null>(null);

  useEffect(() => {
    // PayU sends data in POST, but NextJS might need to handle it 
    // Usually, you should verify status via backend API here as well
    const params = new URLSearchParams(window.location.search);
    setTxnId(params.get('txnid'));
  }, []);

  return (
    <div className="min-h-screen bg-[#030711] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 text-center relative z-10 shadow-2xl"
      >
        <div className="mb-8 flex justify-center">
           <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] relative">
              <CheckCircle2 className="w-12 h-12 text-white" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full"
              />
           </div>
        </div>

        <div className="space-y-4">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Payment Successful</span>
           </div>
           
           <h1 className="text-4xl font-black">You're in!</h1>
           <p className="text-gray-400 font-medium">
             Welcome to the elite club. Your **Lifetime Subscription** has been activated successfully.
           </p>
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3 text-left">
           <div className="flex justify-between text-xs">
              <span className="text-gray-500 uppercase tracking-widest font-bold">Plan</span>
              <span className="text-indigo-400 font-black">LIFETIME ACCESS</span>
           </div>
           <div className="flex justify-between text-xs">
              <span className="text-gray-500 uppercase tracking-widest font-bold">Status</span>
              <span className="text-green-400 font-black">ACTIVATED</span>
           </div>
           {txnId && (
             <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-gray-500 uppercase tracking-widest font-bold">Transaction ID</span>
                <span className="text-gray-300 font-mono truncate ml-4">{txnId}</span>
             </div>
           )}
        </div>

        <div className="mt-10 space-y-4">
           <button 
            onClick={() => router.push('/')}
            className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
           >
             Start Creating <ArrowRight className="w-5 h-5" />
           </button>
           
           <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Secure & Verified Payment
           </div>
        </div>

        {/* Floating Sparkles */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-10 -right-10 text-yellow-500/30"
        >
          <Sparkles size={60} />
        </motion.div>
      </motion.div>
    </div>
  );
}
