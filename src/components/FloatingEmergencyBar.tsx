import React from 'react';
import { MessageSquare, Zap, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../config';

interface FloatingEmergencyBarProps {
  onOpenAssessment: () => void;
  onScrollToTop: () => void;
}

export const FloatingEmergencyBar: React.FC<FloatingEmergencyBarProps> = ({
  onOpenAssessment,
}) => {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
      {/* Floating Audit Pill */}
      <button
        onClick={onOpenAssessment}
        className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121816]/95 hover:bg-[#182320] border border-[#B7FF35]/35 text-xs font-mono font-bold text-[#F2F5EF] shadow-2xl shadow-black/80 hover:border-[#B7FF35] transition-all cursor-pointer backdrop-blur-md"
        id="floating-assessment-btn"
      >
        <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-ping" />
        <Zap className="w-3.5 h-3.5 text-[#B7FF35]" />
        <span>Audit Restriction</span>
      </button>

      {/* Floating Circular Support / WhatsApp Chat Button */}
      <div className="relative group">
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#98E61B] via-[#B7FF35] to-[#C8FF52] text-[#090D0D] border-2 border-[#090D0D] flex items-center justify-center shadow-[0_0_25px_rgba(183,255,53,0.45)] hover:shadow-[0_0_35px_rgba(183,255,53,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label={`Chat with Founder Adil on WhatsApp (${WHATSAPP_DISPLAY_NUMBER})`}
          id="floating-whatsapp-chat-btn"
        >
          <MessageCircle className="w-7 h-7 stroke-[2.3] fill-[#090D0D]/10" />
        </a>

        {/* Status / Notification pulse indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7FF35] opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B7FF35] border-2 border-[#090D0D]" />
        </span>

        {/* Floating tooltip preview */}
        <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block pointer-events-none transition-all">
          <div className="bg-[#121816]/95 backdrop-blur-md text-[#F2F5EF] text-[11px] font-mono font-medium px-3.5 py-2 rounded-xl border border-[#B7FF35]/30 shadow-2xl whitespace-nowrap flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
            <span>Chat with Founder Adil ({WHATSAPP_DISPLAY_NUMBER})</span>
          </div>
        </div>
      </div>
    </div>
  );
};


