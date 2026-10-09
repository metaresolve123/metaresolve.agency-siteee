import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Menu,
  X,
  ArrowUpRight,
  Zap,
  MessageCircle,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { getWhatsAppUrl } from '../config';
import { AuthUser } from '../types';

interface NavbarProps {
  onOpenAssessment: () => void;
  onScrollToSection: (sectionId: string) => void;
  currentUser?: AuthUser | null;
  onOpenAccountModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAssessment,
  onScrollToSection,
  currentUser,
  onOpenAccountModal,
  onLogout
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'About', target: 'about' },
    { label: 'Services', target: 'services' },
    { label: 'Specialists', target: 'team' },
    { label: 'Why Us', target: 'why-us' },
    { label: 'Results', target: 'results' },
    { label: 'Pricing', target: 'pricing' },
  ];

  const userInitial = currentUser?.name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090D0D]/90 backdrop-blur-md border-b border-white/[0.08] shadow-2xl shadow-black/80 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
              id="brand-logo"
            >
              <div className="w-9 h-9 rounded-lg bg-[#141A19] border border-[#B7FF35]/30 flex items-center justify-center group-hover:border-[#B7FF35] transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-[#B7FF35]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ShieldCheck className="w-5 h-5 text-[#B7FF35]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-[#F2F5EF] flex items-center">
                  META<span className="text-[#B7FF35] ml-1">RESOLVE</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#68736D] font-mono -mt-0.5">
                  RECOVERY LABS
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8" id="desktop-navigation">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => onScrollToSection(link.target)}
                  className="text-sm font-medium text-[#A0AAA3] hover:text-[#F2F5EF] transition-colors tracking-wide relative group py-1 cursor-pointer"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#B7FF35] transition-all duration-200 group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Right Action CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={onOpenAssessment}
                className="px-3.5 py-2 text-xs font-semibold tracking-wide text-[#A0AAA3] hover:text-[#F2F5EF] bg-[#141A19] hover:bg-[#18201E] border border-white/10 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                id="btn-assessment-nav"
              >
                <Zap className="w-3.5 h-3.5 text-[#B7FF35]" />
                Free Ban Audit
              </button>

              <button
                onClick={() => onScrollToSection('contact')}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] rounded-full transition-all duration-200 shadow-lg shadow-[#B7FF35]/15 hover:shadow-[#B7FF35]/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                id="btn-get-help-nav"
              >
                Get help
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Authenticated User Profile Dropdown */}
              {currentUser && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#141A19] border border-white/10 hover:border-[#B7FF35]/40 transition-all cursor-pointer group"
                    id="user-nav-dropdown-trigger"
                    title={currentUser.name}
                  >
                    <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#86D416] via-[#B7FF35] to-[#467320]">
                      <div className="w-full h-full rounded-full bg-[#0A0F0E] flex items-center justify-center font-bold text-[11px] text-[#B7FF35]">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#F2F5EF] max-w-[100px] truncate group-hover:text-white transition-colors">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C9891] group-hover:text-[#B7FF35] transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-[#141B19] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                      >
                        {/* User Identity Header */}
                        <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                          <p className="text-xs font-bold text-[#F2F5EF] truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[10px] text-[#8C9891] font-mono truncate">
                            {currentUser.email}
                          </p>
                        </div>

                        {/* Menu Options */}
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAccountModal?.();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs text-[#D1DDD6] hover:text-[#B7FF35] hover:bg-[#1A2421] transition-colors flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#B7FF35]" />
                          <span>My Account</span>
                        </button>

                        <div className="h-px bg-white/[0.06] my-1" />

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout?.();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-400" />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#141A19] border border-white/10 text-[#A0AAA3] hover:text-[#F2F5EF] focus:outline-none"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-[#0D1313]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 md:hidden shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#68736D]">
                <span>STATUS: OPERATIONAL</span>
                <span className="text-[#B7FF35] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
                  Avg Turnaround 48h
                </span>
              </div>

              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => {
                    onScrollToSection(link.target);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-base font-semibold text-[#F2F5EF] hover:text-[#B7FF35] py-2 border-b border-white/5 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-2 flex flex-col gap-3">
                {currentUser && (
                  <div className="p-3 rounded-xl bg-[#141A19] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#17221E] border border-[#B7FF35]/40 flex items-center justify-center text-xs font-bold text-[#B7FF35]">
                        {userInitial}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F2F5EF]">{currentUser.name}</div>
                        <div className="text-[10px] text-[#8C9891] font-mono">{currentUser.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAccountModal?.();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#1B211F] border border-white/10 text-[11px] font-mono text-[#B7FF35]"
                    >
                      Account
                    </button>
                  </div>
                )}

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#B7FF35]/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Message Adil on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    onOpenAssessment();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-[#F2F5EF] bg-[#18201E] border border-[#B7FF35]/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#B7FF35]" />
                  Free 30-Sec Ban Assessment
                </button>

                <button
                  onClick={() => {
                    onScrollToSection('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-xs font-semibold text-[#A0AAA3] hover:text-[#F2F5EF] bg-[#141A19] border border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  Submit Intake Ticket
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full py-2.5 text-xs font-mono text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
