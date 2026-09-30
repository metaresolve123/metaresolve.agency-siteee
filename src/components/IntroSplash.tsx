/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onFinish: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Step progression sequence (approx 2.8s total)
    // 0: Dark screen appears (0ms)
    // 1: Glow fades in (200ms)
    // 2: "META" appears (500ms)
    // 3: "RESOLVE" slides in (900ms)
    // 4: Neon-lime accent line & taglines fade in (1400ms)
    // 5: Progress bar completes & transition trigger
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 500);
    const t3 = setTimeout(() => setStep(3), 900);
    const t4 = setTimeout(() => setStep(4), 1400);

    const startTime = Date.now();
    const duration = 2800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onFinish();
        }, 350);
      }
    }, 30);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#090D0D] text-[#F2F5EF] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background ambient lighting effects */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: step >= 1 ? 0.35 : 0, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B7FF35]/[0.08] blur-[140px] rounded-full pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 0.2 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#00E5FF]/[0.04] blur-[120px] rounded-full pointer-events-none"
      />

      {/* Grid backdrop texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #B7FF35 1px, transparent 1px), linear-gradient(to bottom, #B7FF35 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl mx-auto">
        
        {/* Brand Shield Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -10 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 relative"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#141B19] border border-[#B7FF35]/40 flex items-center justify-center shadow-[0_0_30px_rgba(183,255,53,0.18)]">
            <ShieldCheck className="w-7 h-7 text-[#B7FF35]" />
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-2xl bg-[#B7FF35]/10 blur-sm -z-10"
          />
        </motion.div>

        {/* Brand Name Typography: META RESOLVE */}
        <div className="flex items-center justify-center font-extrabold tracking-tight font-display text-4xl sm:text-5xl lg:text-6xl mb-3">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F2F5EF] mr-2.5"
          >
            META
          </motion.span>

          <motion.span
            initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
            animate={{ 
              opacity: step >= 3 ? 1 : 0, 
              x: step >= 3 ? 0 : -15, 
              filter: step >= 3 ? 'blur(0px)' : 'blur(4px)' 
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#B7FF35] drop-shadow-[0_0_20px_rgba(183,255,53,0.35)]"
          >
            RESOLVE
          </motion.span>
        </div>

        {/* Neon-lime glowing accent line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: step >= 4 ? '120px' : 0, opacity: step >= 4 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#B7FF35] to-transparent mb-5 shadow-[0_0_12px_#B7FF35]"
        />

        {/* Primary Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 10 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg font-semibold tracking-wide text-[#F2F5EF] mb-2 font-display"
        >
          “Resolve. Recover. Move Forward.”
        </motion.p>

        {/* Secondary Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 4 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xs sm:text-sm text-[#9AA49E] tracking-normal max-w-md mx-auto mb-8 font-mono"
        >
          Professional account-recovery and resolution support.
        </motion.p>

        {/* Futuristic subtle progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 4 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-48 sm:w-56 flex flex-col items-center gap-2"
        >
          <div className="w-full h-1 bg-[#141B19] rounded-full overflow-hidden border border-white/[0.08] relative">
            <motion.div
              className="h-full bg-gradient-to-r from-[#86D416] via-[#B7FF35] to-[#B7FF35] rounded-full shadow-[0_0_10px_#B7FF35]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#68736D]">
            <span>SYSTEM INITIALIZATION</span>
            <span className="text-[#B7FF35] font-bold">{progress}%</span>
          </div>
        </motion.div>

      </div>

      {/* Skip button in bottom-right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onFinish}
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141A19]/80 border border-white/10 hover:border-[#B7FF35]/50 text-xs font-mono text-[#9AA49E] hover:text-[#B7FF35] backdrop-blur-md transition-all cursor-pointer group"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </motion.button>
    </div>
  );
};
