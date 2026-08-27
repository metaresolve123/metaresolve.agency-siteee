import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote, TrendingUp } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export const SocialProof: React.FC = () => {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const currentTestimonial = TESTIMONIALS[activeTestimonialIdx];

  const statMetrics = [
    { value: '980+', label: 'Accounts Reinstated', sub: 'Across 6 major networks', progress: 95 },
    { value: '48h', label: 'Average Resolution', sub: 'Fast-track partner appeals', progress: 88 },
    { value: '$10m+', label: 'Ad Revenue Protected', sub: 'Prevented campaign freezes', progress: 98 },
    { value: '100%', label: 'Confidentiality SLA', sub: 'Cryptographic data disposal', progress: 100 },
  ];

  return (
    <section className="py-20 lg:py-28 relative bg-[#0D1313]/60 border-y border-white/[0.05]" id="results">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141A19] border border-[#B7FF35]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B7FF35] font-mono">
              REAL RESULTS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-tight">
            Numbers that speak for<br />
            <span className="text-[#B7FF35]">themselves</span>
          </h2>

          <p className="text-sm sm:text-base text-[#A0AAA3] mt-4 leading-relaxed">
            Real metrics from high-growth e-commerce brands, performance marketing agencies, and verified creators.
          </p>
        </div>

        {/* 4 Statistic Cards with Progress Accent Lines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 lg:mb-16">
          {statMetrics.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-[#141A19] border border-white/[0.08] hover:border-[#B7FF35]/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#F2F5EF] font-mono tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#F2F5EF] mb-0.5">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#68736D] font-mono mb-4">
                {stat.sub}
              </div>

              {/* Tiny Horizontal Progress / Accent Line */}
              <div className="w-full h-1 bg-[#090D0D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B7FF35] rounded-full"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto rounded-2xl bg-[#141A19] border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative"
        >
          <Quote className="absolute top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 text-[#B7FF35]/10 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Star Rating & Verified Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B7FF35] text-[#B7FF35]" />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D1313] border border-[#B7FF35]/30 text-[11px] font-mono text-[#B7FF35]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentTestimonial.timeframe}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-base sm:text-lg text-[#F2F5EF] leading-relaxed italic font-normal">
                "{currentTestimonial.content}"
              </p>

              {/* Author Row & Impact Metric */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentTestimonial.avatarUrl}
                    alt={currentTestimonial.authorName}
                    className="w-12 h-12 rounded-full object-cover border border-[#B7FF35]/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#F2F5EF]">
                      {currentTestimonial.authorName}
                    </h4>
                    <p className="text-xs text-[#A0AAA3]">
                      {currentTestimonial.role}, <span className="text-[#B7FF35]">{currentTestimonial.company}</span>
                    </p>
                  </div>
                </div>

                {currentTestimonial.revenueImpact && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18201E] border border-white/5 text-xs font-mono text-[#A0AAA3]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#B7FF35]" />
                    <span>{currentTestimonial.revenueImpact}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Switchers */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/[0.04]">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonialIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeTestimonialIdx === idx ? 'w-8 bg-[#B7FF35]' : 'w-2 bg-[#18201E] hover:bg-white/20'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
