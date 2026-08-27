import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProofOfWorkProps {
  onViewPortfolio?: () => void;
}

interface CaseCardData {
  id: string;
  platform: string;
  description: string;
  isFeatured?: boolean;
}

const CASES_DATA: CaseCardData[] = [
  {
    id: 'instagram-case',
    platform: 'INSTAGRAM',
    description: 'Disabled creator account — access restored through the official appeal process.',
    isFeatured: true,
  },
  {
    id: 'facebook-case',
    platform: 'FACEBOOK',
    description: 'Restricted business page and advertising access — support-assisted resolution completed.',
  },
  {
    id: 'whatsapp-case',
    platform: 'WHATSAPP',
    description: 'Business messaging restriction — account access restored through the appropriate support channel.',
  },
];

export const ProofOfWork: React.FC<ProofOfWorkProps> = ({ onViewPortfolio }) => {
  const handlePortfolioClick = () => {
    if (onViewPortfolio) {
      onViewPortfolio();
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#090D0D] border-t border-white/[0.05]" id="results">
      {/* Background soft ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#B7FF35]/[0.025] blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141B19] border border-[#B7FF35]/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7FF35] font-mono">
              VERIFIED OUTCOMES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-[1.12]">
            Proof of Work
          </h2>

          <p className="text-sm sm:text-base text-[#A0AAA3] mt-4 leading-relaxed max-w-2xl mx-auto">
            A selection of recent account-resolution cases handled through official platform support and appeal channels.
          </p>
        </div>

        {/* 3-Column Responsive Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-14 lg:mb-16">
          {CASES_DATA.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                item.isFeatured
                  ? 'bg-[#101614] border border-[#B7FF35]/40 shadow-[0_0_35px_rgba(183,255,53,0.08)] hover:border-[#B7FF35] hover:shadow-[0_10px_40px_rgba(183,255,53,0.14)]'
                  : 'bg-[#101514] border border-white/[0.08] hover:border-[#B7FF35]/50 hover:shadow-[0_10px_35px_rgba(183,255,53,0.08)]'
              }`}
            >
              {/* Subtle top edge highlight */}
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#B7FF35]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Top Verification Area (~half of card height) */}
              <div className="relative p-6 sm:p-7 bg-gradient-to-b from-[#0B100F] to-[#0D1312] min-h-[210px] sm:min-h-[230px] flex flex-col justify-between items-center overflow-hidden">
                {/* Ambient glow behind the checkmark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-[#B7FF35]/[0.08] blur-2xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Top-left status badge */}
                <div className="w-full flex items-center justify-start z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141C19] border border-[#B7FF35]/30 shadow-sm">
                    <Check className="w-3.5 h-3.5 text-[#B7FF35] stroke-[3]" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B7FF35]">
                      RESOLVED
                    </span>
                  </div>
                </div>

                {/* Center Large Circular Checkmark & Decorative Bars */}
                <div className="flex flex-col items-center justify-center my-auto py-2 z-10">
                  <motion.div
                    initial={{ scale: 0.88, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.1 }}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#B7FF35] bg-[#0E1513] flex items-center justify-center shadow-[0_0_24px_rgba(183,255,53,0.25)] group-hover:shadow-[0_0_32px_rgba(183,255,53,0.45)] group-hover:border-[#C7FF45] transition-all duration-300"
                  >
                    <Check className="w-9 h-9 sm:w-10 sm:h-10 text-[#B7FF35] stroke-[3]" />
                  </motion.div>

                  {/* Two subtle horizontal decorative bars beneath the icon */}
                  <div className="flex flex-col items-center gap-1 mt-4">
                    <div className="w-14 h-[3px] rounded-full bg-white/15 group-hover:bg-[#B7FF35]/40 transition-colors" />
                    <div className="w-8 h-[2.5px] rounded-full bg-white/10 group-hover:bg-[#B7FF35]/30 transition-colors" />
                  </div>
                </div>

                <div className="w-full" />
              </div>

              {/* Bottom Information Area */}
              <div className="p-6 sm:p-7 border-t border-white/[0.08] bg-[#101514] flex-1 flex flex-col justify-center">
                {/* Platform Label */}
                <div className="text-xs sm:text-[13px] font-mono font-bold tracking-[0.2em] text-[#B7FF35] uppercase mb-2">
                  {item.platform}
                </div>

                {/* Concise Case Description */}
                <p className="text-xs sm:text-sm text-[#D1D9D4] leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centered Portfolio CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePortfolioClick}
            className="group px-7 py-3.5 rounded-full bg-[#111715] hover:bg-[#16201D] border border-white/15 hover:border-[#B7FF35] text-xs sm:text-sm font-semibold text-[#F2F5EF] hover:text-[#B7FF35] shadow-lg shadow-black/40 transition-all duration-200 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            id="view-portfolio-btn"
          >
            <span>View Full Portfolio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#A0AAA3] group-hover:text-[#B7FF35]" />
          </button>
        </div>

      </div>
    </section>
  );
};
