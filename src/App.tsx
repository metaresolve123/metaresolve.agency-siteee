/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { AboutSection } from './components/AboutSection';
import { ServicesGrid } from './components/ServicesGrid';
import { TeamSection } from './components/TeamSection';
import { PricingSection } from './components/PricingSection';
import { TrustSection } from './components/TrustSection';
import { SocialProof } from './components/SocialProof';
import { ProofOfWork } from './components/ProofOfWork';
import { ContactForm } from './components/ContactForm';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BanAssessmentModal } from './components/BanAssessmentModal';
import { FloatingEmergencyBar } from './components/FloatingEmergencyBar';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { PlatformType, PricingPlan, SiteConfig } from './types';
import { getSiteConfig } from './utils/adminStorage';
import { Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      return hash === '#admin' || hash === '#/admin' || search.includes('admin');
    }
    return false;
  });

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('instagram');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());

  // URL Hash / Route listener for #admin
  useEffect(() => {
    const handleLocationCheck = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#/admin' || search.includes('admin')) {
        setIsAdminView(true);
      } else if (isAdminView && hash === '') {
        setIsAdminView(false);
      }
    };

    const handleConfigUpdated = (e: any) => {
      if (e?.detail) {
        setSiteConfig(e.detail);
      } else {
        setSiteConfig(getSiteConfig());
      }
    };

    window.addEventListener('hashchange', handleLocationCheck);
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('metaresolve_config_updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('hashchange', handleLocationCheck);
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('metaresolve_config_updated', handleConfigUpdated);
    };
  }, [isAdminView]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleExitAdmin = () => {
    window.location.hash = '';
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlatformForQuote = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    scrollToSection('contact');
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlatform(plan.platform);
    scrollToSection('contact');
  };

  const handleCustomQuote = () => {
    setSelectedPlatform('other');
    scrollToSection('contact');
  };

  const handleProceedFromAssessment = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    scrollToSection('contact');
  };

  // If in Admin route, render full Admin Panel
  if (isAdminView) {
    return <AdminDashboard onExitAdmin={handleExitAdmin} />;
  }

  return (
    <div className="min-h-screen bg-[#090D0D] text-[#F2F5EF] relative selection:bg-[#B7FF35] selection:text-[#090D0D]">
      
      {/* Dynamic Announcement Banner if enabled by Admin */}
      {siteConfig.bannerEnabled && siteConfig.bannerAnnouncement && (
        <div className="bg-[#111A17] border-b border-[#B7FF35]/25 text-[#F2F5EF] text-[11px] sm:text-xs py-2 px-4 text-center font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse shrink-0" />
          <span className="font-bold text-[#B7FF35] uppercase tracking-wider hidden sm:inline">NOTICE:</span>
          <span>{siteConfig.bannerAnnouncement}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        onOpenAssessment={() => setIsAssessmentOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Main Page Landmark */}
      <main id="main-content">
        {/* Hero Section */}
        <Hero
          onScrollToSection={scrollToSection}
          onSelectPlatform={setSelectedPlatform}
          onOpenAssessment={() => setIsAssessmentOpen(true)}
        />

        {/* 4-Stat Credibility Bar */}
        <StatsBar />

        {/* Section 1: About META RESOLVE */}
        <AboutSection onContactClick={() => scrollToSection('contact')} />

        {/* Section 2: Services Grid (Every platform. Every ban type. Handled.) */}
        <ServicesGrid onSelectPlatformForQuote={handleSelectPlatformForQuote} />

        {/* Section 3: The Team */}
        <TeamSection onContactSpecialist={() => scrollToSection('contact')} />

        {/* Section 4: Transparent Pricing */}
        <PricingSection
          onSelectPlan={handleSelectPlan}
          onCustomQuote={handleCustomQuote}
        />

        {/* Section 5: Trust & Agency Owners */}
        <TrustSection onStartRecovery={() => scrollToSection('contact')} />

        {/* Section 6: Social Proof & Testimonial */}
        <SocialProof />

        {/* Section 7: Proof of Work Cases & Protocol */}
        <ProofOfWork />

        {/* Section 8: Lead Intake Form */}
        <ContactForm initialPlatform={selectedPlatform} />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Global Footer */}
      <Footer
        onScrollToSection={scrollToSection}
        onSelectPlatform={handleSelectPlatformForQuote}
      />

      {/* Floating Emergency & Feasibility Assessment Bar */}
      <FloatingEmergencyBar
        onOpenAssessment={() => setIsAssessmentOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Interactive 30-Second Ban Assessment Modal */}
      <BanAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onProceedToForm={handleProceedFromAssessment}
      />

    </div>
  );
}
