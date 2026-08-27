import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Instagram,
  Facebook,
  Video,
  Send,
  Twitter,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SERVICES_DATA } from '../data/mockData';
import { PlatformType } from '../types';

interface ServicesGridProps {
  onSelectPlatformForQuote: (platform: PlatformType) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectPlatformForQuote }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      case 'facebook':
        return <Facebook className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      case 'tiktok':
        return <Video className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      case 'telegram':
        return <Send className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      case 'x':
        return <Twitter className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      case 'whatsapp':
        return <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
      default:
        return <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#B7FF35]" />;
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All Platforms' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'x', label: 'X (Twitter)' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ];

  const filteredServices = activeFilter === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => s.platform === activeFilter);

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#090D0D]" id="services">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#B7FF35]/[0.025] blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#4C801B]/[0.03] blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 lg:mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141B19] border border-[#B7FF35]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7FF35] font-mono">
                SUPPORTED PLATFORMS & SERVICES
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-[1.12]">
              Professional resolution for{' '}
              <span className="text-[#B7FF35]">major networks.</span>
            </h2>
            
            <p className="text-sm sm:text-base text-[#A0AAA3] mt-4 leading-relaxed max-w-xl">
              We help recover and resolve banned, suspended, and restricted accounts across Instagram, Facebook, TikTok, Telegram, X, and WhatsApp. We assist clients with understanding account restrictions, preparing structured appeals, and navigating platform recovery processes.
            </p>
          </div>

          {/* Platform Filter Selector */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#121816] border border-white/[0.08] rounded-2xl self-start lg:self-auto max-w-full">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeFilter === opt.id
                    ? 'bg-[#B7FF35] text-[#090D0D] font-bold shadow-md shadow-[#B7FF35]/15'
                    : 'text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-[#18221F]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Desktop Grid for Large Luxurious Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-9">
          {filteredServices.map((service, index) => {
            const isFirstFeatured = index === 0 && activeFilter === 'all';

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                whileHover={{ y: -6 }}
                onClick={() => onSelectPlatformForQuote(service.platform)}
                className={`group relative rounded-[28px] p-8 sm:p-10 lg:p-12 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden ${
                  isFirstFeatured
                    ? 'bg-gradient-to-b from-[#16201D] to-[#101715] border border-[#B7FF35]/40 shadow-[0_0_35px_rgba(183,255,53,0.06)] hover:border-[#B7FF35] hover:shadow-[0_15px_45px_rgba(183,255,53,0.12)]'
                    : 'bg-gradient-to-b from-[#131A18] to-[#0E1413] border border-white/[0.08] hover:border-[#B7FF35]/50 hover:shadow-[0_15px_45px_rgba(183,255,53,0.09)]'
                }`}
              >
                {/* Subtle top lime edge highlight */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#B7FF35]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Ambient hover gradient inside card */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#B7FF35]/[0.03] rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top: Large Platform Icon inside rounded-square container */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1A2522] to-[#0F1614] border border-[#B7FF35]/30 group-hover:border-[#B7FF35]/70 flex items-center justify-center shadow-[0_0_24px_rgba(183,255,53,0.12)] group-hover:shadow-[0_0_32px_rgba(183,255,53,0.25)] transition-all duration-300">
                      {getPlatformIcon(service.platform)}
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#182320] border border-white/[0.06] text-[11px] font-mono text-[#8C9891]">
                        Est. {service.avgTurnaround}
                      </span>
                    </div>
                  </div>

                  {/* Platform Label in Uppercase Neon-Lime */}
                  <div className="text-xs sm:text-[13px] font-mono font-bold tracking-[0.22em] text-[#B7FF35] uppercase mb-2">
                    {service.subtitle || service.platform}
                  </div>

                  {/* Large Service Heading */}
                  <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#F2F5EF] group-hover:text-white transition-colors tracking-tight leading-[1.2] mb-3.5">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="text-sm sm:text-base text-[#A0AAA3] leading-relaxed mb-7 max-w-xl">
                    {service.description}
                  </p>

                  {/* Service Tags / Chips */}
                  <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                    {service.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3.5 py-1.5 rounded-full bg-[#16201D]/90 border border-white/[0.08] group-hover:border-[#B7FF35]/30 text-xs sm:text-[13px] font-medium text-[#D1D9D4] shadow-sm transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA: View details -> */}
                <div className="mt-auto pt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="font-bold text-sm sm:text-base text-[#B7FF35] group-hover:text-[#C7FF45] flex items-center gap-2 transition-colors">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>

                  <span className="text-xs font-mono text-[#68736D] group-hover:text-[#A0AAA3] transition-colors">
                    Formal Review Track
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};


