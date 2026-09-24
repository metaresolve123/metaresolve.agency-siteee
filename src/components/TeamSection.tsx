/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, MessageCircle, Shield, Award, Sparkles, Lock, ExternalLink, Camera, UploadCloud } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';
import { TeamMember } from '../types';
import { WHATSAPP_DISPLAY_NUMBER, HUZAIFA_WHATSAPP_DISPLAY_NUMBER, getWhatsAppUrl } from '../config';
import { getSiteConfig } from '../utils/adminStorage';

interface TeamSectionProps {
  onContactSpecialist?: (specialistName: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onContactSpecialist }) => {
  const [siteConfig, setSiteConfig] = useState(getSiteConfig());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleConfigUpdated = (e: any) => {
      if (e?.detail) {
        setSiteConfig(e.detail);
      } else {
        setSiteConfig(getSiteConfig());
      }
    };

    window.addEventListener('metaresolve_config_updated', handleConfigUpdated);
    return () => {
      window.removeEventListener('metaresolve_config_updated', handleConfigUpdated);
    };
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'founder' | 'huzaifa') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const photoUrl = event.target.result as string;
          const currentConfig = getSiteConfig();
          const key = target === 'founder' ? 'founderAvatarUrl' : 'huzaifaAvatarUrl';
          const endpoint = target === 'founder' ? '/api/founder-photo' : '/api/huzaifa-photo';
          const updated = { ...currentConfig, [key]: photoUrl };
          localStorage.setItem('metaresolve_site_config', JSON.stringify(updated));
          setSiteConfig(updated);
          window.dispatchEvent(new CustomEvent('metaresolve_config_updated', { detail: updated }));

          try {
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photoDataUrl: photoUrl })
            });
          } catch (err) {
            console.error(`Failed to sync ${target} photo:`, err);
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMessageClick = (member: TeamMember) => {
    if (member.directContactUrl) {
      window.open(member.directContactUrl, '_blank', 'noopener,noreferrer');
    } else if (onContactSpecialist) {
      onContactSpecialist(member.name);
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#090D0D] border-y border-white/[0.05]" id="team">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[650px] h-[450px] bg-[#B7FF35]/[0.03] blur-[170px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[550px] h-[400px] bg-[#00E5FF]/[0.02] blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141B19] border border-[#B7FF35]/30 mb-4 shadow-[0_0_15px_rgba(183,255,53,0.08)]">
            <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7FF35] font-mono">
              LEADERSHIP & RECOVERY SPECIALISTS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F2F5EF] tracking-tight leading-[1.12] font-display">
            Meet Our <span className="text-[#B7FF35]">Team</span>
          </h2>

          <p className="text-sm sm:text-base text-[#A0AAA3] mt-4 leading-relaxed max-w-2xl mx-auto">
            Direct access to senior case managers and platform escalation specialists. Real people, authentic expertise, and strategic casework across Meta, TikTok, Telegram, X, and WhatsApp.
          </p>
        </div>

        {/* 2 Profile Cards Side-by-Side on Desktop, Single Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {TEAM_MEMBERS.map((member, index) => {
            const isFounder = member.isFounder;
            const isHuzaifa = member.id === 'huzaifa';
            const directNumber = isFounder ? WHATSAPP_DISPLAY_NUMBER : HUZAIFA_WHATSAPP_DISPLAY_NUMBER;
            const displayName = isFounder && siteConfig.founderName ? siteConfig.founderName : member.name;
            const displayRole = member.role;
            const displayAvatar = isFounder 
              ? ((siteConfig as any).founderAvatarUrl || member.avatarUrl)
              : ((siteConfig as any).huzaifaAvatarUrl || member.avatarUrl);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
                className={`group relative rounded-[28px] p-7 sm:p-9 lg:p-10 transition-all duration-300 flex flex-col justify-between items-center text-center overflow-hidden backdrop-blur-sm ${
                  isFounder
                    ? 'bg-gradient-to-b from-[#131D1A] via-[#0F1715] to-[#0A0F0E] border border-[#B7FF35]/40 shadow-[0_0_35px_rgba(183,255,53,0.08)] hover:border-[#B7FF35] hover:shadow-[0_15px_50px_rgba(183,255,53,0.18)]'
                    : 'bg-gradient-to-b from-[#121917] via-[#0E1413] to-[#0A0F0E] border border-white/[0.09] hover:border-[#B7FF35]/50 hover:shadow-[0_15px_45px_rgba(183,255,53,0.12)]'
                }`}
              >
                {/* Subtle top edge highlight line on hover */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#B7FF35]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Ambient glow behind avatar */}
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 ${
                  isFounder ? 'bg-[#B7FF35]/[0.09]' : 'bg-[#B7FF35]/[0.05]'
                }`} />

                <div className="w-full flex flex-col items-center relative z-10">
                  
                  {/* Verified & Role Badge over card header */}
                  <div className="w-full flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16221E] border border-[#B7FF35]/30 text-[10px] font-mono font-bold text-[#B7FF35] uppercase">
                      <Shield className="w-3 h-3 text-[#B7FF35]" />
                      <span>{isFounder ? 'Founder' : 'Co-Founder'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#8C9891]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-ping inline-block" />
                      <span>Active Casework</span>
                    </div>
                  </div>

                  {/* Profile Photo with Refined Glow Ring & Verified Badge */}
                  <div className="relative mb-5 group-hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-tr from-[#86D416] via-[#B7FF35] to-[#467320] shadow-[0_0_25px_rgba(183,255,53,0.22)] group-hover:shadow-[0_0_35px_rgba(183,255,53,0.4)] transition-all duration-300 relative">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0F0E] flex items-center justify-center">
                        {isFounder && !siteConfig.founderAvatarUrl ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121A17] to-[#0A0F0E] text-[#B7FF35]">
                            <span className="text-3xl font-extrabold font-display tracking-widest text-[#F2F5EF]">
                              AA
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B7FF35] mt-1">
                              Founder
                            </span>
                          </div>
                        ) : isHuzaifa && !siteConfig.huzaifaAvatarUrl ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121A17] to-[#0A0F0E] text-[#B7FF35]">
                            <span className="text-3xl font-extrabold font-display tracking-widest text-[#F2F5EF]">
                              HZ
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B7FF35] mt-1">
                              Co-Founder
                            </span>
                          </div>
                        ) : (
                          <img
                            src={displayAvatar}
                            alt={`${displayName} - ${displayRole}`}
                            className={`w-full h-full object-cover ${isFounder ? 'object-[center_15%]' : 'object-center'}`}
                            style={{ borderRadius: '50%' }}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* Photo upload camera icon on hover for founder & co-founder */}
                      <label
                        className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#111A17] border border-[#B7FF35]/50 hover:bg-[#B7FF35] hover:text-[#090D0D] text-[#B7FF35] flex items-center justify-center cursor-pointer transition-all shadow-lg z-20"
                        title={isFounder ? "Upload Founder photo (Screenshot_20260327-120047~2)" : "Upload Co-Founder photo (WhatsApp Image 2026-08-23 at 3.03.52 AM)"}
                      >
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, isFounder ? 'founder' : 'huzaifa')}
                        />
                      </label>
                    </div>

                    {/* Official Verified check badge */}
                    <div
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#B7FF35] text-[#090D0D] flex items-center justify-center shadow-lg border-2 border-[#090D0D]"
                      title="Verified META RESOLVE Specialist"
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.8]" />
                    </div>
                  </div>

                  {/* Member Name (Displayed directly above role) */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] tracking-tight mb-1 group-hover:text-white transition-colors font-display">
                    {displayName}
                  </h3>

                  {/* Role Title in Neon-Lime Monospace (Displayed below name) */}
                  <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.18em] text-[#B7FF35] uppercase mb-4">
                    {displayRole}
                  </div>

                  {/* Quick Photo Upload Trigger if photo not yet attached */}
                  {((isFounder && !siteConfig.founderAvatarUrl) || (isHuzaifa && !siteConfig.huzaifaAvatarUrl)) && (
                    <label
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#B7FF35]/15 hover:bg-[#B7FF35]/25 border border-[#B7FF35]/40 text-[#B7FF35] text-[11px] font-mono cursor-pointer transition-all mb-4"
                      title={isFounder ? "Upload photo (Screenshot_20260327)" : "Upload photo (WhatsApp Image 2026-08-23 at 3.03.52 AM)"}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isFounder ? 'Attach Photo (Screenshot_20260327)' : 'Attach Photo (WhatsApp Image)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, isFounder ? 'founder' : 'huzaifa')}
                      />
                    </label>
                  )}

                  {/* Bio Narrative */}
                  <p className="text-xs sm:text-sm text-[#A0AAA3] leading-relaxed max-w-md mx-auto mb-6">
                    “{member.bio}”
                  </p>

                  {/* Area of Expertise / Service Tags */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8 w-full max-w-md">
                    {member.serviceTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1 rounded-lg bg-[#141E1B] border border-white/[0.08] group-hover:border-[#B7FF35]/30 text-[11px] font-medium text-[#D1D9D4] shadow-sm transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: WhatsApp Action & Direct Number */}
                <div className="w-full pt-6 border-t border-white/[0.06] flex flex-col items-center gap-2.5 relative z-10">
                  <a
                    href={member.directContactUrl || (isFounder ? getWhatsAppUrl() : 'https://wa.me/447898154326?text=' + encodeURIComponent('Hello Huzaifa, I would like to discuss an account recovery case with META RESOLVE.'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${
                      isFounder
                        ? 'bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] shadow-[0_0_25px_rgba(183,255,53,0.3)] hover:shadow-[0_0_35px_rgba(183,255,53,0.5)]'
                        : 'bg-[#182320] hover:bg-[#B7FF35] text-[#F2F5EF] hover:text-[#090D0D] border border-[#B7FF35]/40 hover:border-[#B7FF35] shadow-[0_0_20px_rgba(183,255,53,0.15)] hover:shadow-[0_0_30px_rgba(183,255,53,0.35)]'
                    }`}
                    id={`team-cta-${member.id}`}
                  >
                    {isFounder && <MessageCircle className="w-4 h-4 fill-current stroke-[2.5]" />}
                    <span>{member.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
                  </a>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8C9891] pt-0.5">
                    <span>Direct Line:</span>
                    <strong className="text-[#D1DDD6] font-semibold">{directNumber}</strong>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Assurances Pill Footer beneath the Team Section */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-[#0E1513] border border-white/[0.07] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14201C] border border-[#B7FF35]/30 flex items-center justify-center shrink-0 text-[#B7FF35]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Direct Handling by Founding Leadership
              </div>
              <div className="text-[11px] text-[#8C9891]">
                No outsourced junior contractors. Your case strategy is handled directly by Adil & Huzaifa.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF35] shrink-0 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strict Confidentiality NDA</span>
          </div>
        </div>

      </div>
    </section>
  );
};
