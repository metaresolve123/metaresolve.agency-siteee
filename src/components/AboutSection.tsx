import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Headphones,
  MessageSquareText,
  Layers,
  FileCheck2,
  DollarSign,
  Instagram,
  Facebook,
  Send,
  Twitter,
  MessageCircle,
  Video,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

interface AboutSectionProps {
  onContactClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const supportedPlatforms = [
    {
      name: 'Instagram',
      detail: 'Disabled profiles, copyright flags, 2FA lockouts & impersonation bans',
      icon: Instagram,
      color: 'text-[#E1306C]',
      tag: 'Meta Ecosystem'
    },
    {
      name: 'Facebook',
      detail: 'Business Manager disabled, page restrictions & ad account lockouts',
      icon: Facebook,
      color: 'text-[#1877F2]',
      tag: 'Meta Ecosystem'
    },
    {
      name: 'TikTok',
      detail: 'Community guideline violations, live stream bans & creator bans',
      icon: Video,
      color: 'text-[#00F2FE]',
      tag: 'ByteDance Platform'
    },
    {
      name: 'Telegram',
      detail: 'Phone number blocks, public channel restrictions & spam bot flags',
      icon: Send,
      color: 'text-[#24A1DE]',
      tag: 'Messaging Network'
    },
    {
      name: 'X (Twitter)',
      detail: 'Suspended handles, automation flags & compromised account recovery',
      icon: Twitter,
      color: 'text-[#F2F5EF]',
      tag: 'X Corp Platform'
    },
    {
      name: 'WhatsApp',
      detail: 'WhatsApp Business bans, spam filter false flags & registration locks',
      icon: MessageCircle,
      color: 'text-[#25D366]',
      tag: 'Meta Messaging'
    }
  ];

  const coreValues = [
    {
      icon: Headphones,
      title: 'Professional Support',
      description:
        'Every inquiry is assigned directly to specialized caseworkers who evaluate policy violations and build structured recovery strategies.'
    },
    {
      icon: MessageSquareText,
      title: 'Clear Communication',
      description:
        'Direct updates and straightforward milestone reporting via WhatsApp and email, with no automated bot responses or confusing jargon.'
    },
    {
      icon: Layers,
      title: 'Platform-Specific Expertise',
      description:
        'In-depth knowledge of internal moderation frameworks, regulatory compliance, and official appeal hierarchies across all major networks.'
    },
    {
      icon: FileCheck2,
      title: 'Case-Focused Assistance',
      description:
        'Custom evidence packages, identity verification filings, and tailored appeal briefs constructed specifically for your restriction context.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description:
        'Clear upfront quotes and flat pricing structures with no hidden retainers or surprise fees before casework begins.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-[#090D0D]" id="about">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-[#B7FF35]/[0.035] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-[#B7FF35]/[0.025] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 lg:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141A19] border border-[#B7FF35]/30 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B7FF35] font-mono">
              WHO WE ARE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-tight mb-6">
            About <span className="text-[#B7FF35]">META RESOLVE</span>
          </h2>

          <p className="text-base sm:text-lg text-[#C8D1CA] leading-relaxed font-normal">
            META RESOLVE provides professional account-recovery and resolution assistance for individuals, creators, and businesses facing account restrictions, suspensions, disabled access, and other platform-related issues. Our team focuses on structured case review, appeal assistance, and appropriate recovery channels across major social and messaging platforms.
          </p>
        </div>

        {/* Supported Platforms Matrix */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A0AAA3]">
              PLATFORM RECOVERY & APPEAL ASSISTANCE
            </h3>
            <span className="text-[11px] font-mono text-[#68736D]">
              6 Supported Ecosystems
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {supportedPlatforms.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-[#0D1312] border border-white/[0.08] hover:border-[#B7FF35]/35 hover:bg-[#121A17] transition-all group"
                  id={`about-platform-${platform.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#141C1A] border border-white/10 flex items-center justify-center group-hover:border-[#B7FF35]/40 transition-colors">
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#F2F5EF] group-hover:text-[#B7FF35] transition-colors">
                          {platform.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#68736D] uppercase">
                          {platform.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#8C9891] leading-relaxed">
                    {platform.detail}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mission & Core Values */}
        <div>
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#B7FF35] mb-2">
              <ShieldCheck className="w-4 h-4 text-[#B7FF35]" />
              <span>OUR CORE PRINCIPLES & VALUES</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] tracking-tight">
              Structured methodology built on integrity and expertise.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  className="p-6 rounded-2xl bg-[#0F1614] border border-white/[0.08] hover:border-[#B7FF35]/30 hover:bg-[#141E1A] transition-all flex flex-col justify-between group"
                  id={`about-value-${val.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#17221E] border border-[#B7FF35]/20 flex items-center justify-center text-[#B7FF35] mb-4 group-hover:border-[#B7FF35]/50 group-hover:scale-105 transition-all">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <h4 className="text-base font-bold text-[#F2F5EF] mb-2 group-hover:text-[#B7FF35] transition-colors">
                      {val.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#8C9891] leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Ethical Resolution & Feasibility Banner */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#121C18] to-[#0A110F] border border-[#B7FF35]/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#1A2822] border border-[#B7FF35]/40 flex items-center justify-center text-[#B7FF35] mb-4">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#F2F5EF] mb-2">
                  Ethical & Realistic Practice
                </h4>
                <p className="text-xs sm:text-sm text-[#A0AAA3] leading-relaxed">
                  We maintain strict honesty with every client. Account resolution feasibility is determined by platform policies and specific violation criteria. We do not make misleading guaranteed recovery claims.
                </p>
              </div>

              {onContactClick && (
                <div className="pt-4 mt-2">
                  <button
                    onClick={onContactClick}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B7FF35] hover:text-[#C7FF45] transition-colors cursor-pointer"
                  >
                    <span>Request a Case Review</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};
