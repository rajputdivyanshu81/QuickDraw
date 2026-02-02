'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  Shield, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Lock
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const firstName = user.firstName || user.username || "User";
      const email = user.emailAddresses[0].emailAddress;

      const res = await axios.post(`${HTTP_BACKEND}/api/create-payment`, {
        amount: "11.00",
        productInfo: "DrawFlow Lifetime Subscription",
        firstName: firstName,
        email: email
      }, {
        headers: { Authorization: token }
      });

      const paymentData = res.data;

      // Create a hidden form to submit to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      // Use sandbox or production URL based on your environment
      // Sandbox: https://test.payu.in/_payment
      // Production: https://secure.payu.in/_payment
      form.action = 'https://test.payu.in/_payment'; 

      const params: any = {
        key: paymentData.key,
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        productinfo: paymentData.productinfo,
        firstname: paymentData.firstname,
        email: paymentData.email,
        phone: paymentData.phone,
        hash: paymentData.hash,
        surl: paymentData.surl,
        furl: paymentData.furl,
        service_provider: 'payu_paisa'
      };

      for (const key in params) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("Payment initiation failed", e);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030711] text-white selection:bg-indigo-500/30 font-sans">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px]" />
      </div>

      <div className="relative pt-32 pb-20 container mx-auto px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limited Time Offer</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Simple, transparent <br />
            <span className="text-indigo-500">pricing.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Choose the plan that's right for you. Get started for free or unlock
            unlimited possibilities with our lifetime plan.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col justify-between group hover:bg-white/[0.07] transition-all"
          >
             <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Free Plan</h3>
                  <p className="text-gray-500 text-sm">Perfect for beginners and hobbyists.</p>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-4xl font-black">₹0</span>
                  <span className="text-gray-500 ml-2">/ month</span>
                </div>

                <div className="space-y-4 pt-6">
                  {[
                    "Up to 3 active rooms",
                    "Basic shapes and tools",
                    "Real-time collaboration",
                    "Community support"
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center space-x-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                        <Check className="w-3 h-3 text-gray-400" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
             </div>

             <button 
              onClick={() => router.push('/signup')}
              className="mt-10 w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all outline-none border-none cursor-pointer"
             >
               Get Started
             </button>
          </motion.div>

          {/* Lifetime Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-1 px-1 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 rounded-[2.6rem] relative group shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
          >
            <div className="absolute -top-4 -right-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl animate-bounce">
              Best Value
            </div>

            <div className="h-full p-8 rounded-[2.5rem] bg-[#030711] flex flex-col justify-between relative overflow-hidden">
               {/* Shine effect */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
               
               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Lifetime Plan</h3>
                    <p className="text-indigo-400/80 text-sm font-medium">One-time payment. Forever yours.</p>
                  </div>
                  
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white">₹11</span>
                    <span className="text-indigo-400/60 ml-3 text-sm font-bold">One-Time Payment</span>
                  </div>

                  <div className="space-y-4 pt-6">
                    {[
                      "Unlimited active rooms",
                      "Exclusive premium shapes",
                      "AI-Powered suggestions",
                      "Priority real-time engine",
                      "Lifetime updates & support",
                      "No recurring charges"
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center space-x-3 text-sm text-gray-100">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <Check className="w-3 h-3 text-indigo-400" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <button 
                onClick={handlePayment}
                disabled={loading}
                className="mt-10 w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-2 outline-none border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? (
                   <Loader2 className="w-6 h-6 animate-spin" />
                 ) : (
                   <>
                    Pay ₹11 <ArrowRight className="w-5 h-5" />
                   </>
                 )}
               </button>
               
               <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <Lock className="w-3 h-3" /> Secure checkout with PayU
               </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-32 max-w-2xl mx-auto space-y-8 text-center">
           <h2 className="text-2xl font-bold">Have questions?</h2>
           <div className="grid gap-6 text-left">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                 <h4 className="font-bold mb-2">How does the lifetime plan work?</h4>
                 <p className="text-sm text-gray-500">Pay once and your account will be upgraded to Lifetime Subscriber status forever. You'll get all future updates and premium features at no extra cost.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                 <h4 className="font-bold mb-2">Is the ₹11 price real?</h4>
                 <p className="text-sm text-gray-500">Yes, it's our special introductory offer to build our community. It will eventually increase, but if you buy now, you're locked in forever.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
