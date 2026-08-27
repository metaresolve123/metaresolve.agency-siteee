import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, ShieldCheck, Lock, Activity, Users } from 'lucide-react';

interface TrustSectionProps {
  onStartRecovery: () => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onStartRecovery }) => {
  const trustPoints = [
    {
      title: 'Platform-specific appeal playbooks',
      description: 'Custom-crafted recovery appeals tailored to policies on Instagram, Facebook, TikTok, Telegram, X, and WhatsApp.'
    },
    {
      title: 'Rapid assessment and review',
      description: 'Initial restriction audit within 30 minutes and structured appeal roadmap delivery inside 24 hours.'
    },
    {
      title: 'Cross-platform policy expertise',
      description: 'Senior caseworkers experienced in Meta Business Manager, TikTok Shop, X Enterprise, and messaging compliance.'
    },
    {
      title: 'Direct human communication',
      description: 'Dedicated case updates via WhatsApp or Telegram without generic bot responses.'
    },
    {
      title: 'Strict confidentiality & privacy',
      description: 'Full NDA protection and complete cryptographic data deletion upon case closure.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" id="why-us">
      {/* Ambient background light */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B7FF35]/[0.05] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading & Trust Points */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141A19] border border-[#B7FF35]/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B7FF35] font-mono">
                WHY BUSINESSES CHOOSE META RESOLVE
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-tight mb-8">
              Expert assistance for<br />
              <span className="text-[#B7FF35]">complex account restrictions.</span>
            </h2>

            <div className="space-y-4 sm:space-y-5">
              {trustPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className="flex items-start gap-4 p-3.5 rounded-xl bg-[#141A19]/50 border border-white/[0.05] hover:border-[#B7FF35]/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#18201E] border border-[#B7FF35]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B7FF35]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F2F5EF]">
                      {point.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A0AAA3] mt-0.5 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Circular Indicator Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            {/* Radial green lighting behind card */}
            <div className="absolute inset-0 bg-[#B7FF35]/15 rounded-3xl blur-3xl pointer-events-none" />

            <div className="relative rounded-2xl bg-[#141A19] border border-white/[0.1] p-8 sm:p-10 shadow-2xl shadow-black flex flex-col items-center text-center">
              
              {/* Circular Progress Gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-[#18201E]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-[#B7FF35]"
                    strokeWidth="10"
                    strokeDasharray="427"
                    strokeDashoffset="34" /* Approx 92% */
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-[#F2F5EF] font-mono tracking-tight">
                    92%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7FF35]">
                    FAVORABLE AUDIT
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F2F5EF] mb-2 tracking-tight">
                Ready to resolve your account issue?
              </h3>
              
              <p className="text-xs sm:text-sm text-[#A0AAA3] mb-6 max-w-xs leading-relaxed">
                Submit your case in under 2 minutes. Our platform caseworkers will audit your restriction and outline recovery steps.
              </p>

              <button
                onClick={onStartRecovery}
                className="w-full py-4 rounded-xl text-xs uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] transition-all duration-200 shadow-xl shadow-[#B7FF35]/20 hover:shadow-[#B7FF35]/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                id="trust-cta-start"
              >
                <span>Start Case Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[#68736D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B7FF35]" />
                <span>Zero upfront risk • Transparent feasibility assessment</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

