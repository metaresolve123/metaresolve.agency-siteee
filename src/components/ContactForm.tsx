/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Mail,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PlatformType } from '../types';
import {
  ADIL_WHATSAPP_NUMBER,
  ADIL_WHATSAPP_DISPLAY_NUMBER,
  HUZAIFA_WHATSAPP_NUMBER,
  HUZAIFA_WHATSAPP_DISPLAY_NUMBER,
  getActiveWhatsAppNumber,
  getActiveWhatsAppDisplayNumber,
  getActiveOfficialEmail,
  OFFICIAL_EMAIL
} from '../config';
import { saveLead } from '../utils/adminStorage';

interface ContactFormProps {
  initialPlatform?: PlatformType | string;
}

const SERVICE_OPTIONS = [
  'Instagram Account Recovery',
  'Facebook Account Recovery',
  'TikTok Account Recovery',
  'Telegram Account Recovery',
  'X Account Recovery',
  'WhatsApp Account Recovery',
  'Other'
];

const OFFICIAL_LOCATION = 'Pakistan';

const getInitialService = (plat?: PlatformType | string): string => {
  switch (plat) {
    case 'instagram':
      return 'Instagram Account Recovery';
    case 'facebook':
      return 'Facebook Account Recovery';
    case 'tiktok':
      return 'TikTok Account Recovery';
    case 'telegram':
      return 'Telegram Account Recovery';
    case 'x':
    case 'twitter':
      return 'X Account Recovery';
    case 'whatsapp':
      return 'WhatsApp Account Recovery';
    default:
      return 'Instagram Account Recovery';
  }
};

export const ContactForm: React.FC<ContactFormProps> = ({ initialPlatform = 'instagram' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: getInitialService(initialPlatform),
    details: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Synchronize when initialPlatform prop updates from other CTA clicks
  useEffect(() => {
    if (initialPlatform) {
      setFormData(prev => ({
        ...prev,
        service: getInitialService(initialPlatform)
      }));
    }
  }, [initialPlatform]);

  const activeWhatsAppNumber = getActiveWhatsAppNumber() || ADIL_WHATSAPP_NUMBER;
  const activeWhatsAppDisplay = getActiveWhatsAppDisplayNumber();
  const activeOfficialEmail = getActiveOfficialEmail() || OFFICIAL_EMAIL;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone / WhatsApp is required';
    } else if (formData.phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.service) {
      errs.service = 'Please select a service';
    }

    if (!formData.details.trim()) {
      errs.details = 'Please describe your case details';
    } else if (formData.details.trim().length < 10) {
      errs.details = 'Please provide a bit more detail (at least 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Map service string to platform type for admin storage
    let mappedPlatform: PlatformType = 'other';
    if (formData.service.includes('Instagram')) mappedPlatform = 'instagram';
    else if (formData.service.includes('Facebook')) mappedPlatform = 'facebook';
    else if (formData.service.includes('TikTok')) mappedPlatform = 'tiktok';
    else if (formData.service.includes('WhatsApp')) mappedPlatform = 'whatsapp';

    // Generate unique Case Ticket ID
    const caseId = `META-${Math.floor(100000 + Math.random() * 900000)}`;

    // Save lead into Admin Portal LocalStorage
    saveLead(
      {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        platform: mappedPlatform,
        accountType: formData.service,
        banReason: 'Account Restriction / Suspension',
        accountHandle: formData.fullName,
        details: formData.details,
        urgency: 'critical'
      },
      caseId
    );

    // Construct structured WhatsApp pre-filled message
    const waMessage = `Hello Adil, I need help with an account recovery issue.

Name: ${formData.fullName.trim()}
Phone/WhatsApp: ${formData.phone.trim()}
Email: ${formData.email.trim()}
Service: ${formData.service}
Case Details: ${formData.details.trim()}

I would like to discuss my case with META RESOLVE.`;

    const waUrl = `https://wa.me/${activeWhatsAppNumber}?text=${encodeURIComponent(waMessage)}`;

    // Show temporary opening animation then trigger WhatsApp redirection
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Open WhatsApp chat in a new tab
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Reset success state after 4 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
    }, 700);
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#090D0D] relative overflow-hidden"
    >
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#B7FF35]/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#00E5FF]/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Card Container with 20-24px rounded corners and subtle border */}
        <div className="bg-[#0E1514] border border-white/[0.08] rounded-[22px] sm:rounded-[26px] p-6 sm:p-10 lg:p-14 shadow-2xl relative backdrop-blur-sm">
          
          {/* Subtle top edge glow highlight */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#B7FF35]/30 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* LEFT COLUMN: Heading, Intro Copy & Contact Info */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Main Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-[1.15] tracking-tight font-display">
                  Tell us what got banned.{' '}
                  <span className="block text-white">We’ll get it back.</span>
                </h2>

                {/* Subtitle / Intro Copy */}
                <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#8C9891] leading-relaxed">
                  Fill in the form and we’ll reach out within a few hours — or message us directly on WhatsApp for the fastest response.
                </p>

                {/* Contact Information Rows */}
                <div className="mt-8 sm:mt-10 space-y-3.5 sm:space-y-4">
                  
                  {/* Adil Afridi — Founder WhatsApp Row */}
                  <a
                    href={`https://wa.me/${ADIL_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Adil, I would like to discuss an account recovery case with META RESOLVE.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3.5 -mx-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group cursor-pointer border border-transparent hover:border-white/[0.06]"
                    id="contact-info-whatsapp-adil"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#14201C] border border-[#B7FF35]/30 flex items-center justify-center shrink-0 group-hover:border-[#B7FF35] group-hover:shadow-[0_0_15px_rgba(183,255,53,0.25)] transition-all">
                      <MessageCircle className="w-5 h-5 text-[#B7FF35]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C9891] flex items-center gap-2">
                        <span>Adil Afridi — Founder</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B7FF35]/15 text-[#B7FF35] font-bold">WHATSAPP</span>
                      </div>
                      <div className="text-base font-semibold text-white group-hover:text-[#B7FF35] transition-colors font-mono">
                        {ADIL_WHATSAPP_DISPLAY_NUMBER}
                      </div>
                    </div>
                  </a>

                  {/* Huzaifa — Co-Founder WhatsApp Row */}
                  <a
                    href={`https://wa.me/${HUZAIFA_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Huzaifa, I would like to discuss an account recovery case with META RESOLVE.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3.5 -mx-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group cursor-pointer border border-transparent hover:border-white/[0.06]"
                    id="contact-info-whatsapp-huzaifa"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#14201C] border border-[#B7FF35]/30 flex items-center justify-center shrink-0 group-hover:border-[#B7FF35] group-hover:shadow-[0_0_15px_rgba(183,255,53,0.25)] transition-all">
                      <MessageCircle className="w-5 h-5 text-[#B7FF35]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C9891] flex items-center gap-2">
                        <span>Huzaifa — Co-Founder</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B7FF35]/15 text-[#B7FF35] font-bold">WHATSAPP</span>
                      </div>
                      <div className="text-base font-semibold text-white group-hover:text-[#B7FF35] transition-colors font-mono">
                        {HUZAIFA_WHATSAPP_DISPLAY_NUMBER}
                      </div>
                    </div>
                  </a>

                  {/* Email Row */}
                  <a
                    href={`mailto:${activeOfficialEmail}`}
                    className="flex items-center gap-4 p-3.5 -mx-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group cursor-pointer"
                    id="contact-info-email"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#14201C] border border-[#B7FF35]/25 flex items-center justify-center shrink-0 group-hover:border-[#B7FF35]/50 group-hover:shadow-[0_0_15px_rgba(183,255,53,0.2)] transition-all">
                      <Mail className="w-5 h-5 text-[#B7FF35]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C9891]">
                        Email
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-white group-hover:text-[#B7FF35] transition-colors font-mono">
                        {activeOfficialEmail}
                      </div>
                    </div>
                  </a>

                  {/* Location Row */}
                  <div
                    className="flex items-center gap-4 p-3.5 -mx-3.5 rounded-xl"
                    id="contact-info-location"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#14201C] border border-[#B7FF35]/25 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#B7FF35]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C9891]">
                        Location
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-white">
                        {OFFICIAL_LOCATION}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Security & Direct Assurance note */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] hidden lg:flex items-center gap-3 text-xs text-[#8C9891]">
                <div className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse shrink-0" />
                <span>Encrypted direct dispatch to senior Meta policy caseworkers</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Account Recovery Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                
                {/* Row 1: Full Name & Phone / WhatsApp (Side-by-side on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  
                  {/* Field 1: Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs sm:text-sm font-medium text-[#D1DDD6] mb-1.5"
                    >
                      Full Name <span className="text-[#B7FF35]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`w-full bg-[#121B19] border ${
                        errors.fullName
                          ? 'border-red-500/80 focus:border-red-500'
                          : 'border-white/[0.1] focus:border-[#B7FF35]'
                      } rounded-xl px-4 py-3 sm:py-3.5 text-white text-sm sm:text-base placeholder:text-[#52635B] focus:outline-none focus:ring-1 ${
                        errors.fullName ? 'focus:ring-red-500/30' : 'focus:ring-[#B7FF35]/40'
                      } transition-all duration-200`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Field 2: Phone / WhatsApp */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs sm:text-sm font-medium text-[#D1DDD6] mb-1.5"
                    >
                      Phone / WhatsApp <span className="text-[#B7FF35]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 ..."
                      className={`w-full bg-[#121B19] border ${
                        errors.phone
                          ? 'border-red-500/80 focus:border-red-500'
                          : 'border-white/[0.1] focus:border-[#B7FF35]'
                      } rounded-xl px-4 py-3 sm:py-3.5 text-white text-sm sm:text-base placeholder:text-[#52635B] focus:outline-none focus:ring-1 ${
                        errors.phone ? 'focus:ring-red-500/30' : 'focus:ring-[#B7FF35]/40'
                      } transition-all duration-200`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                </div>

                {/* Field 3: Email (Full width) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-[#D1DDD6] mb-1.5"
                  >
                    Email <span className="text-[#B7FF35]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full bg-[#121B19] border ${
                      errors.email
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-white/[0.1] focus:border-[#B7FF35]'
                    } rounded-xl px-4 py-3 sm:py-3.5 text-white text-sm sm:text-base placeholder:text-[#52635B] focus:outline-none focus:ring-1 ${
                      errors.email ? 'focus:ring-red-500/30' : 'focus:ring-[#B7FF35]/40'
                    } transition-all duration-200`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Field 4: Service You Need (Dropdown) */}
                <div>
                  <label
                    htmlFor="service"
                    className="block text-xs sm:text-sm font-medium text-[#D1DDD6] mb-1.5"
                  >
                    Service You Need <span className="text-[#B7FF35]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full bg-[#121B19] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl px-4 py-3 sm:py-3.5 text-white text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all duration-200 cursor-pointer appearance-none pr-10"
                    >
                      {SERVICE_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-[#0E1514] text-white py-2">
                          {opt}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron indicator */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#8C9891]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {errors.service && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.service}
                    </p>
                  )}
                </div>

                {/* Field 5: Describe Your Case (Textarea) */}
                <div>
                  <label
                    htmlFor="details"
                    className="block text-xs sm:text-sm font-medium text-[#D1DDD6] mb-1.5"
                  >
                    Describe your case <span className="text-[#B7FF35]">*</span>
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    rows={4}
                    value={formData.details}
                    onChange={handleChange}
                    placeholder="Which platform, what happened, how long it’s been restricted, and any relevant details…"
                    className={`w-full bg-[#121B19] border ${
                      errors.details
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-white/[0.1] focus:border-[#B7FF35]'
                    } rounded-xl px-4 py-3 sm:py-3.5 text-white text-sm sm:text-base placeholder:text-[#52635B] focus:outline-none focus:ring-1 ${
                      errors.details ? 'focus:ring-red-500/30' : 'focus:ring-[#B7FF35]/40'
                    } transition-all duration-200 resize-none`}
                  />
                  {errors.details && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.details}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#A3F226] via-[#B7FF35] to-[#C8FF52] hover:from-[#B7FF35] hover:to-[#D5FF6E] text-[#090D0D] font-bold text-base sm:text-lg py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(183,255,53,0.32)] hover:shadow-[0_0_35px_rgba(183,255,53,0.48)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80 active:scale-[0.99]"
                    id="contact-form-submit-whatsapp"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Preparing Case...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#090D0D]" />
                        <span>Opening WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <span>Send via WhatsApp</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Disclaimer below button */}
                  <p className="text-xs text-center text-[#738279] mt-3.5 font-normal">
                    By submitting, you agree to be contacted by META RESOLVE regarding your case.
                  </p>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
