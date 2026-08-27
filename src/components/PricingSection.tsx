/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, Info, MessageCircle, ChevronDown, User, X } from 'lucide-react';
import { PRICING_PLANS } from '../data/mockData';
import { PricingPlan } from '../types';
import {
  ADIL_WHATSAPP_NUMBER,
  ADIL_WHATSAPP_DISPLAY_NUMBER,
  HUZAIFA_WHATSAPP_NUMBER,
  HUZAIFA_WHATSAPP_DISPLAY_NUMBER,
  getActiveWhatsAppNumber
} from '../config';

interface PricingSectionProps {
  onSelectPlan?: (plan: PricingPlan) => void;
  onCustomQuote?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, onCustomQuote }) => {
  const [activeModalPlan, setActiveModalPlan] = useState<PricingPlan | null>(null);

  const openWhatsApp = (recipient: 'adil' | 'huzaifa', plan: PricingPlan) => {
    let number = ADIL_WHATSAPP_NUMBER;
    let name = 'Adil';

    if (recipient === 'huzaifa') {
      number = HUZAIFA_WHATSAPP_NUMBER;
      name = 'Huzaifa';
    }

    const msg = `Hello ${name}, I’m interested in ${plan.title} from META RESOLVE. I’d like to discuss my case and pricing.`;
    const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setActiveModalPlan(null);

    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  const handlePlanClick = (plan: PricingPlan) => {
    // Show specialist choice modal for clear contact option to Adil or Huzaifa
    setActiveModalPlan(plan);
  };

  const handleQuickAdilContact = (plan: PricingPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    openWhatsApp('adil', plan);
  };

  const handleQuickHuzaifaContact = (plan: PricingPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    openWhatsApp('huzaifa', plan);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#090D0D] relative overflow-hidden" id="pricing">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-[#B7FF35]/[0.03] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#00E5FF]/[0.02] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141A19] border border-[#B7FF35]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B7FF35] font-mono">
              TRANSPARENT PRICING
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-tight font-display">
            No guesswork. Know what<br />
            <span className="text-[#B7FF35]">you pay.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#8C9891] mt-4 leading-relaxed">
            Professional casework and strategic resolution with clear pricing per recovery scope. No surprise fees, no subscriptions.
          </p>
        </div>

        {/* 3-Column Responsive Grid on Desktop / 1-Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6 mb-8">
          {PRICING_PLANS.map((plan, idx) => {
            const isPopular = plan.isPopular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-[16px] flex flex-col justify-between transition-all duration-300 group p-6 ${
                  isPopular
                    ? 'bg-[#101917] border border-[#B7FF35]/70 shadow-[0_0_30px_rgba(183,255,53,0.15)] hover:border-[#B7FF35] hover:shadow-[0_0_40px_rgba(183,255,53,0.25)]'
                    : 'bg-[#0E1514] border border-white/[0.08] hover:border-[#B7FF35]/40 hover:shadow-2xl hover:shadow-black/60'
                }`}
              >
                {/* ⚡ MOST POPULAR Badge for Card 2 */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B7FF35] text-[#090D0D] font-mono text-[11px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(183,255,53,0.4)] flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <div>
                  {/* 1. Platform / Category Label */}
                  <div className="text-[11px] font-mono font-bold tracking-wider text-[#B7FF35] uppercase mb-2">
                    {plan.categoryLabel || plan.platform.toUpperCase()}
                  </div>

                  {/* 2. Service Name */}
                  <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-white transition-colors">
                    {plan.title}
                  </h3>

                  {/* 3. Price & Flat indicator */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#B7FF35] font-mono tracking-tight">
                      {plan.price}
                    </span>
                    {plan.isFlat && (
                      <span className="text-xs font-mono text-[#8C9891] lowercase">
                        flat
                      </span>
                    )}
                  </div>

                  {/* 4. Turnaround Time */}
                  <div className="flex items-center gap-1.5 text-xs text-[#8C9891] font-mono mb-4">
                    <Clock className="w-3.5 h-3.5 text-[#B7FF35] shrink-0" />
                    <span>Estimated time: <strong className="text-[#D1DDD6] font-semibold">{plan.turnaround}</strong></span>
                  </div>

                  {/* 5. Service Description */}
                  <p className="text-xs sm:text-sm text-[#8C9891] leading-relaxed mb-5 min-h-[44px]">
                    {plan.description}
                  </p>

                  {/* 6. Highlighted Information Box */}
                  {plan.infoBox && (
                    <div className="bg-[#121B19] border border-white/[0.06] rounded-xl px-3.5 py-2.5 mb-5 text-[11px] text-[#A6B5AD] leading-snug font-medium">
                      {plan.infoBox}
                    </div>
                  )}
                </div>

                {/* 7. Action Area: Primary CTA with Quick Specialist Split Options */}
                <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#A3F226] via-[#B7FF35] to-[#C8FF52] hover:from-[#B7FF35] hover:to-[#D5FF6E] text-[#090D0D] shadow-[0_0_20px_rgba(183,255,53,0.3)] hover:shadow-[0_0_30px_rgba(183,255,53,0.45)]'
                        : 'bg-[#14201C] hover:bg-[#1A2A25] text-white hover:text-[#B7FF35] border border-white/10 hover:border-[#B7FF35]/40 hover:shadow-[0_0_15px_rgba(183,255,53,0.12)]'
                    }`}
                  >
                    <span>{plan.ctaText || 'Get Started →'}</span>
                  </button>

                  {/* Specialist direct options */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={(e) => handleQuickAdilContact(plan, e)}
                      className="py-1.5 px-2 rounded-lg bg-black/40 hover:bg-[#B7FF35]/15 border border-white/[0.06] hover:border-[#B7FF35]/30 text-[11px] font-mono text-[#A0AAA3] hover:text-[#B7FF35] flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Direct message Founder Adil"
                    >
                      <MessageCircle className="w-3 h-3 text-[#B7FF35]" />
                      <span>Message Adil</span>
                    </button>

                    <button
                      onClick={(e) => handleQuickHuzaifaContact(plan, e)}
                      className="py-1.5 px-2 rounded-lg bg-black/40 hover:bg-[#B7FF35]/15 border border-white/[0.06] hover:border-[#B7FF35]/30 text-[11px] font-mono text-[#A0AAA3] hover:text-[#B7FF35] flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Direct message Co-Founder Huzaifa"
                    >
                      <MessageCircle className="w-3 h-3 text-[#B7FF35]" />
                      <span>Message Huzaifa</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Disclaimer */}
        <div className="text-center max-w-3xl mx-auto mt-6 mb-4 px-4">
          <p className="text-xs text-[#738279] leading-relaxed flex items-center justify-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#8C9891] shrink-0 hidden sm:inline" />
            <span>
              Prices are indicative and may vary depending on the platform, account type, case complexity, and required recovery process. Final pricing will be confirmed after case review.
            </span>
          </p>
        </div>

      </div>

      {/* Specialist Selection Modal when clicking main 'Get Started' button */}
      <AnimatePresence>
        {activeModalPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0E1514] border border-[#B7FF35]/40 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModalPlan(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C9891] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-xs font-mono text-[#B7FF35] uppercase font-bold tracking-wider mb-1">
                {activeModalPlan.categoryLabel || activeModalPlan.platform}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {activeModalPlan.title} ({activeModalPlan.price})
              </h3>
              <p className="text-xs text-[#8C9891] leading-relaxed mb-6">
                Choose a META RESOLVE recovery specialist to initiate your case review directly on WhatsApp:
              </p>

              <div className="space-y-3">
                {/* Option 1: Adil Afridi */}
                <button
                  onClick={() => openWhatsApp('adil', activeModalPlan)}
                  className="w-full p-3.5 rounded-xl bg-[#14201C] hover:bg-[#1A2A25] border border-[#B7FF35]/30 hover:border-[#B7FF35] transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#090D0D] border border-[#B7FF35]/40 flex items-center justify-center text-[#B7FF35]">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#B7FF35] transition-colors flex items-center gap-2">
                        <span>Adil Afridi</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B7FF35]/15 text-[#B7FF35] font-mono">Founder</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#8C9891]">
                        {ADIL_WHATSAPP_DISPLAY_NUMBER}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#B7FF35] font-mono group-hover:translate-x-1 transition-transform">
                    Chat →
                  </span>
                </button>

                {/* Option 2: Huzaifa */}
                <button
                  onClick={() => openWhatsApp('huzaifa', activeModalPlan)}
                  className="w-full p-3.5 rounded-xl bg-[#14201C] hover:bg-[#1A2A25] border border-[#B7FF35]/30 hover:border-[#B7FF35] transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#090D0D] border border-[#B7FF35]/40 flex items-center justify-center text-[#B7FF35]">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#B7FF35] transition-colors flex items-center gap-2">
                        <span>Huzaifa</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B7FF35]/15 text-[#B7FF35] font-mono">Co-Founder</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#8C9891]">
                        {HUZAIFA_WHATSAPP_DISPLAY_NUMBER}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#B7FF35] font-mono group-hover:translate-x-1 transition-transform">
                    Chat →
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
