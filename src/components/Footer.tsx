import React from 'react';
import { ShieldCheck, ArrowUpRight, Twitter, Linkedin, MessageSquare, Instagram, Github, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { PlatformType } from '../types';
import {
  ADIL_WHATSAPP_NUMBER,
  ADIL_WHATSAPP_DISPLAY_NUMBER,
  HUZAIFA_WHATSAPP_NUMBER,
  HUZAIFA_WHATSAPP_DISPLAY_NUMBER,
  OFFICIAL_EMAIL,
  OFFICIAL_EMAIL_MAILTO,
  getWhatsAppUrl,
  getHuzaifaWhatsAppUrl
} from '../config';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onSelectPlatform: (platform: PlatformType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection, onSelectPlatform }) => {
  return (
    <footer className="bg-[#060909] border-t border-white/[0.06] pt-16 pb-12 relative z-10" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-white/[0.06]">
          
          {/* Brand Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#141A19] border border-[#B7FF35]/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#B7FF35]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#F2F5EF]">
                  META<span className="text-[#B7FF35] ml-1">RESOLVE</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#68736D] font-mono -mt-0.5">
                  RECOVERY LABS
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A0AAA3] max-w-sm leading-relaxed">
              The premier escalation agency for disabled, restricted, and suspended enterprise social accounts, ad portfolios, and creator channels.
            </p>

            {/* Direct WhatsApp Contact Cards for Leadership */}
            <div className="p-3.5 rounded-xl bg-[#111716] border border-[#B7FF35]/30 max-w-sm space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#B7FF35] font-bold">OFFICIAL WHATSAPP LINES</span>
                <span className="text-[#A0AAA3]">ACTIVE QUEUE</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${ADIL_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Adil, I would like to discuss an account recovery case with META RESOLVE.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-2.5 rounded-lg bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#B7FF35]/15 cursor-pointer text-center"
                  id="footer-whatsapp-adil-btn"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">Adil (Founder)</span>
                </a>

                <a
                  href={`https://wa.me/${HUZAIFA_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Huzaifa, I would like to discuss an account recovery case with META RESOLVE.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-2.5 rounded-lg bg-[#182320] hover:bg-[#B7FF35] text-[#F2F5EF] hover:text-[#090D0D] border border-[#B7FF35]/30 hover:border-[#B7FF35] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer text-center"
                  id="footer-whatsapp-huzaifa-btn"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">Huzaifa (Co-Founder)</span>
                </a>
              </div>

              {/* Official Email Link in Footer */}
              <a
                href={OFFICIAL_EMAIL_MAILTO}
                className="w-full py-2 px-2.5 rounded-lg bg-[#0C1211] hover:bg-[#14201C] text-[#A0AAA3] hover:text-[#B7FF35] border border-white/[0.06] hover:border-[#B7FF35]/30 text-[11px] font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="footer-email-link"
              >
                <Mail className="w-3.5 h-3.5 text-[#B7FF35] shrink-0" />
                <span className="truncate font-semibold">{OFFICIAL_EMAIL}</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-1 text-[#68736D]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141A19] border border-white/5 text-[11px] font-mono text-[#B7FF35]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
                Casework Queue: Open
              </span>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2F5EF] mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0AAA3]">
              {[
                { name: 'Instagram Recovery', platform: 'instagram' as PlatformType },
                { name: 'Facebook / Meta Recovery', platform: 'facebook' as PlatformType },
                { name: 'TikTok Shop & Creator', platform: 'tiktok' as PlatformType },
                { name: 'Telegram Channel Recovery', platform: 'telegram' as PlatformType },
                { name: 'X (Twitter) Resolution', platform: 'x' as PlatformType },
                { name: 'WhatsApp Business Unlocks', platform: 'whatsapp' as PlatformType },
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      onSelectPlatform(item.platform);
                      onScrollToSection('contact');
                    }}
                    className="hover:text-[#B7FF35] transition-colors cursor-pointer text-left"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2F5EF] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0AAA3]">
              <li>
                <button
                  onClick={() => onScrollToSection('about')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  About META RESOLVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Recovery Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('team')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Recovery Specialists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('why-us')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Why META RESOLVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('how-it-works')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('results')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Case Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('pricing')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Transparent Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('contact')}
                  className="hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  Contact Intake
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Security */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2F5EF] mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0AAA3]">
              <li>
                <span className="hover:text-[#F2F5EF] transition-colors cursor-pointer">
                  Confidentiality Agreement
                </span>
              </li>
              <li>
                <span className="hover:text-[#F2F5EF] transition-colors cursor-pointer">
                  Privacy Policy & Data Wiping
                </span>
              </li>
              <li>
                <span className="hover:text-[#F2F5EF] transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-[#F2F5EF] transition-colors cursor-pointer">
                  Platform Disclaimers
                </span>
              </li>
              <li>
                <span className="hover:text-[#F2F5EF] transition-colors cursor-pointer">
                  Security Forensics Protocol
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="py-6 text-[11px] text-[#68736D] leading-relaxed border-b border-white/[0.04]">
          <strong>Platform Disclaimer:</strong> META RESOLVE is an independent recovery and account resolution consultancy. We are not directly affiliated, associated, authorized, endorsed by, or in any way officially connected with Meta Platforms Inc. (Instagram, Facebook, WhatsApp), ByteDance (TikTok), Telegram FZ-LLC, or X Corp. (formerly Twitter). All product and company names are trademarks or registered trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#68736D]">
          <div>
            © {new Date().getFullYear()} META RESOLVE Labs. All rights reserved. Encrypted 256-bit Case Pipeline.
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-[#B7FF35] transition-colors cursor-pointer" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </span>
            <span className="hover:text-[#B7FF35] transition-colors cursor-pointer" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </span>
            <span className="hover:text-[#B7FF35] transition-colors cursor-pointer" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
