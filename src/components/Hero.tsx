import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  Play,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  Clock,
  Instagram,
  Facebook,
  Video,
  Send,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { PLATFORMS_LIST } from '../data/mockData';
import { PlatformType } from '../types';
import { getWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../config';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
  onSelectPlatform: (platform: PlatformType) => void;
  onOpenAssessment: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToSection,
  onSelectPlatform,
  onOpenAssessment,
}) => {
  const [activePill, setActivePill] = useState<PlatformType>('instagram');

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5" />;
      case 'tiktok':
        return <Video className="w-3.5 h-3.5" />;
      case 'telegram':
        return <Send className="w-3.5 h-3.5" />;
      case 'x':
        return <Twitter className="w-3.5 h-3.5" />;
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section className="relative pt-32 pb-16 lg:pt-36 lg:pb-20 overflow-hidden" id="hero-section">
      {/* High Density ambient dot matrix & glow orbs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-dot-matrix" />
      <div className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] bg-[#B7FF35] blur-[160px] opacity-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[320px] h-[320px] bg-[#B7FF35] blur-[120px] opacity-5 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col gap-5"
          >
            {/* High Density Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse" />
              <span className="text-[#B7FF35] text-xs font-bold tracking-[0.2em] uppercase font-mono">
                ACCOUNT RECOVERY & APPEALS RESOLUTION
              </span>
            </div>

            {/* High Density Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] sm:leading-[1.02] tracking-tighter text-[#F2F5EF]">
              We help recover and resolve{' '}
              <span className="text-[#B7FF35]">banned, suspended, and restricted</span> accounts.
            </h1>

            {/* Explanatory Paragraph emphasizing the 6 platforms & professional resolution */}
            <p className="text-[#A0AAA3] text-base sm:text-lg max-w-xl leading-relaxed">
              We help recover and resolve banned, suspended, and restricted accounts across <strong className="text-[#F2F5EF]">Instagram</strong>, <strong className="text-[#F2F5EF]">Facebook</strong>, <strong className="text-[#F2F5EF]">TikTok</strong>, <strong className="text-[#F2F5EF]">Telegram</strong>, <strong className="text-[#F2F5EF]">X</strong>, and <strong className="text-[#F2F5EF]">WhatsApp</strong>. We assist with understanding restrictions, preparing structured appeals, and navigating platform recovery processes.
            </p>

            {/* High Density Platform Selector Pills for the 6 Platforms */}
            <div className="pt-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#68736D] font-mono mb-2.5">
                Supported Platforms:
              </div>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS_LIST.map((platform) => {
                  const isSelected = activePill === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setActivePill(platform.id as PlatformType);
                        onSelectPlatform(platform.id as PlatformType);
                      }}
                      className={`px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#B7FF35] text-[#090D0D] shadow-[0_0_15px_rgba(183,255,53,0.25)]'
                          : 'bg-[#141A19] text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-[#18201E] border border-white/10'
                      }`}
                    >
                      {getPlatformIcon(platform.id)}
                      <span>{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onScrollToSection('contact')}
                className="bg-[#B7FF35] text-[#090D0D] px-7 py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all shadow-[0_0_20px_rgba(183,255,53,0.3)] hover:bg-[#C7FF45] active:scale-[0.98] cursor-pointer"
                id="hero-primary-cta"
              >
                <span>Request Case Review</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-4 rounded-xl font-bold bg-[#141B19] hover:bg-[#182320] border border-[#B7FF35]/40 hover:border-[#B7FF35] text-[#F2F5EF] hover:text-[#B7FF35] transition-all flex items-center justify-center gap-2.5 shadow-lg group cursor-pointer"
                id="hero-whatsapp-cta"
              >
                <MessageCircle className="w-4 h-4 text-[#B7FF35]" />
                <span>Chat with Adil</span>
                <span className="text-xs font-mono text-[#8C9891] hidden md:inline">({WHATSAPP_DISPLAY_NUMBER})</span>
              </a>

              <button
                onClick={() => onScrollToSection('services')}
                className="px-6 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 text-[#A0AAA3] hover:text-[#F2F5EF] transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="hero-secondary-cta"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#B7FF35]" />
                <span>Services</span>
              </button>
            </div>

            {/* Micro reassurance badges */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#68736D] font-mono pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF35]" />
                <span>No password required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF35]" />
                <span>Strict NDA & Confidentiality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF35]" />
                <span>Transparent Case Assessment</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Diagnostic & Escalation Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Outer Border Shell Container */}
            <div className="w-full bg-[#141A19] rounded-[24px] border border-white/10 p-1.5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B7FF35]/5 to-transparent pointer-events-none" />
              
              {/* Inner Dark Terminal Window */}
              <div className="bg-[#0D1313] rounded-[20px] p-6 sm:p-7 flex flex-col gap-5 relative">
                {/* Header Window Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#A0AAA3]">
                    Appeal Docket v4.5
                  </div>
                </div>

                {/* Central Reinstatement Graphic */}
                <div className="flex flex-col items-center justify-center text-center gap-3.5 py-3">
                  <div className="w-24 h-24 rounded-full border-4 border-[#B7FF35]/20 flex items-center justify-center relative shadow-lg shadow-[#B7FF35]/10">
                    <div className="absolute inset-0 rounded-full border-4 border-[#B7FF35] border-t-transparent animate-spin" style={{ animationDuration: '8s' }} />
                    <ShieldCheck className="w-10 h-10 text-[#B7FF35]" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[#B7FF35] font-extrabold text-lg sm:text-xl uppercase tracking-widest font-mono">
                      Appeal In Review
                    </div>
                    <div className="text-[#68736D] text-xs font-mono">
                      Case Dossier: #META-9281-X
                    </div>
                  </div>

                  {/* 2-Column Info Grid */}
                  <div className="w-full grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-[#18201E] p-3.5 rounded-xl border border-white/5 text-left">
                      <div className="text-[#68736D] text-[10px] uppercase font-bold tracking-wider font-mono mb-1">
                        Active Network
                      </div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-2 text-[#F2F5EF]">
                        {getPlatformIcon(activePill)}
                        <span className="capitalize">{activePill === 'x' ? 'X (Twitter)' : activePill}</span>
                      </div>
                    </div>

                    <div className="bg-[#18201E] p-3.5 rounded-xl border border-white/5 text-left">
                      <div className="text-[#68736D] text-[10px] uppercase font-bold tracking-wider font-mono mb-1">
                        Protocol Status
                      </div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-2 text-[#F2F5EF]">
                        <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-ping" />
                        <span>Evidence Filed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Status Card Overlay */}
              <div className="hidden sm:block absolute -bottom-3 -left-3 w-48 bg-[#18201E] border border-white/10 rounded-2xl p-4 shadow-2xl">
                <div className="text-[#68736D] text-[10px] uppercase font-bold font-mono mb-2">
                  Evaluation Audit
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-[#B7FF35] w-[94%]" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-xl font-black text-[#F2F5EF] font-mono">6 NETWORKS</div>
                  <div className="text-[#B7FF35] text-[10px] font-bold font-mono">SUPPORTED</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

