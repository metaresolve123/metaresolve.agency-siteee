import { ServiceItem, TeamMember, PricingPlan, CaseStudy, Testimonial } from '../types';
import { getWhatsAppUrl, getHuzaifaWhatsAppUrl } from '../config';
import adilImg from '../assets/images/adil_profile_1787479854318.jpg';
import huzaifaImg from '../assets/images/huzaifa_profile_1787479833514.jpg';

export const PLATFORMS_LIST = [
  { id: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { id: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { id: 'tiktok', label: 'TikTok', icon: 'Video' },
  { id: 'telegram', label: 'Telegram (TG)', icon: 'Send' },
  { id: 'x', label: 'X (Twitter)', icon: 'Twitter' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
] as const;

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'instagram-recovery',
    platform: 'instagram',
    title: 'Instagram Unban & Removal',
    subtitle: 'INSTAGRAM',
    description: 'Disabled profiles, banned accounts, copyright strikes, and account removal — all covered. We assist with appeals and appropriate platform recovery processes.',
    iconName: 'Instagram',
    tags: ['Account Unban', 'Video Copyright Strike', 'Full Removal', 'Dashboard Unban'],
    features: [
      'Policy violation review & diagnostic audit',
      'Identity verification & impersonation appeals',
      'Community guideline defense documentation',
      'Followers, reels & verification badge preservation'
    ],
    avgTurnaround: '24–48 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $200'
  },
  {
    id: 'facebook-recovery',
    platform: 'facebook',
    title: 'Facebook Unban & Removal',
    subtitle: 'FACEBOOK',
    description: 'Disabled Business Managers, restricted ad accounts, locked personal profiles, and page ownership disputes resolved through proper compliance review.',
    iconName: 'Facebook',
    tags: ['Profile/Page Unban', 'Ad Account Restore', 'Full Account Recovery'],
    features: [
      'Business Manager admin & asset access recovery',
      'Restricted advertising asset appeal dossiers',
      'Identity verification & security review guidance',
      'Pixel, catalog & page asset preservation'
    ],
    avgTurnaround: '36–48 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $250'
  },
  {
    id: 'tiktok-recovery',
    platform: 'tiktok',
    title: 'TikTok Unban & Recovery',
    subtitle: 'TIKTOK',
    description: 'Creator account suspensions, shop policy strikes, live stream bans, and shadowban penalties addressed through official compliance workflows.',
    iconName: 'Video',
    tags: ['Account Suspension', 'Content Restriction', 'Account Recovery'],
    features: [
      'Merchant policy strike documentation & remediation',
      'Live broadcasting restriction appeal packages',
      'Creator monetization & wallet payout guidance',
      'Age-gating & KYC identity verification appeals'
    ],
    avgTurnaround: '24–36 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $250'
  },
  {
    id: 'telegram-recovery',
    platform: 'telegram',
    title: 'Telegram Unban & Recovery',
    subtitle: 'TELEGRAM',
    description: 'Targeted assistance for restricted public channels, spam bot false triggers, phone number lockouts, and group administrative blocks.',
    iconName: 'Send',
    tags: ['Account Restriction', 'Spam Limitation', 'Number Recovery'],
    features: [
      'Telegram Spam Info Bot restriction removal',
      'Channel copyright & DMCA strike resolution',
      'Phone number login & 2FA lockout escalation',
      'Community ownership transfer recovery'
    ],
    avgTurnaround: '12–24 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $200'
  },
  {
    id: 'x-recovery',
    platform: 'x',
    title: 'X Account Recovery',
    subtitle: 'X',
    description: 'Suspended profiles, locked accounts, Terms of Service reviews, impersonation disputes, and verification badge reinstatements.',
    iconName: 'Twitter',
    tags: ['Account Suspension', 'Locked Account', 'Appeal Assistance'],
    features: [
      'Terms of Service & hateful conduct appeal briefs',
      'Impersonation and parodied handle defense',
      'Account security & 2FA bypass resolution',
      'Blue Checkmark & Premium status restoration'
    ],
    avgTurnaround: '24–48 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $250'
  },
  {
    id: 'whatsapp-recovery',
    platform: 'whatsapp',
    title: 'WhatsApp Unban & Recovery',
    subtitle: 'WHATSAPP',
    description: 'Banned phone numbers, restricted WhatsApp Business accounts, spam-filter false positives, and Cloud API template rating restorations.',
    iconName: 'MessageCircle',
    tags: ['Account Ban', 'Business Account Recovery', 'Number Restriction'],
    features: [
      'Meta WhatsApp Business Account (WABA) review',
      'Anti-spam false positive dispute documentation',
      'Quality rating and template message restoration',
      'Account history & contact data preservation'
    ],
    avgTurnaround: '12–24 Hours',
    successRate: 'High Feasibility',
    priceEstimate: 'From $150'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'adil-afridi',
    name: 'Adil Afridi',
    role: 'FOUNDER & LEAD RECOVERY SPECIALIST',
    avatarUrl: adilImg,
    bio: 'Leads complex account recovery cases, platform appeals, and high-priority client resolutions. Focused on strategic recovery solutions and helping clients navigate difficult account restrictions.',
    serviceTags: [
      'Account Recovery',
      'Platform Appeals',
      'Business Account Recovery',
      'Meta Resolution',
      'Client Strategy',
      'Account Restrictions'
    ],
    ctaText: 'Message Adil on WhatsApp',
    isFounder: true,
    casesResolved: 820,
    status: 'Direct WhatsApp Line',
    directContactUrl: getWhatsAppUrl('Hello Adil, I would like to discuss an account recovery issue with META RESOLVE.')
  },
  {
    id: 'huzaifa',
    name: 'Huzaifa',
    role: 'CO-FOUNDER & RECOVERY SPECIALIST',
    avatarUrl: huzaifaImg,
    bio: 'Handles account recovery cases across major social and messaging platforms, with a focus on fast communication, appeals, and practical recovery support.',
    serviceTags: [
      'Instagram Recovery',
      'Facebook Recovery',
      'TikTok Recovery',
      'WhatsApp Recovery',
      'Telegram Recovery',
      'X Account Recovery'
    ],
    ctaText: 'Message Huzaifa on WhatsApp',
    isFounder: false,
    casesResolved: 640,
    status: 'Direct WhatsApp Line',
    directContactUrl: getHuzaifaWhatsAppUrl('Hello Huzaifa, I would like to discuss an account recovery case with META RESOLVE.')
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'p1',
    categoryLabel: 'INSTAGRAM',
    title: 'Simple Account Recovery',
    platform: 'instagram',
    price: '$150',
    isFlat: true,
    turnaround: '1–3 days',
    description: 'Assistance for disabled, suspended, or restricted Instagram accounts through the appropriate recovery and appeal process.',
    infoBox: 'Appeal assistance · Clear process · No hidden charges',
    ctaText: 'Get Started →'
  },
  {
    id: 'p2',
    categoryLabel: 'INSTAGRAM / FACEBOOK',
    title: 'Business / Dashboard Recovery',
    platform: 'facebook',
    price: '$350–$600',
    isPopular: true,
    turnaround: '2–5 days',
    description: 'Support for Business Manager, dashboard access, advertising restrictions, and complex business-account recovery cases.',
    infoBox: 'Priority review · Business account specialists',
    ctaText: 'Get Started →'
  },
  {
    id: 'p3',
    categoryLabel: 'FACEBOOK',
    title: 'Facebook Account Recovery',
    platform: 'facebook',
    price: '$200–$350',
    turnaround: '1–4 days',
    description: 'Assistance with restricted profiles, pages, disabled accounts, and business-account access issues.',
    infoBox: 'Profile & Page support · Business recovery assistance',
    ctaText: 'Get Started →'
  },
  {
    id: 'p4',
    categoryLabel: 'TIKTOK',
    title: 'TikTok Account Recovery',
    platform: 'tiktok',
    price: '$150–$300',
    turnaround: '1–5 days',
    description: 'Assistance with suspended, restricted, or disabled TikTok accounts and account-review processes.',
    infoBox: 'Account appeal assistance · Restriction support',
    ctaText: 'Get Started →'
  },
  {
    id: 'p5',
    categoryLabel: 'TELEGRAM',
    title: 'Telegram Account Recovery',
    platform: 'telegram',
    price: '$100–$250',
    turnaround: '1–3 days',
    description: 'Support for restricted Telegram accounts, spam limitations, and account-access issues through appropriate support channels.',
    infoBox: 'Restriction support · Account review assistance',
    ctaText: 'Get Started →'
  },
  {
    id: 'p6',
    categoryLabel: 'X / TWITTER',
    title: 'X Account Recovery',
    platform: 'x',
    price: '$150–$300',
    turnaround: '1–5 days',
    description: 'Assistance with locked, suspended, or restricted X accounts and the applicable account-recovery and appeal process.',
    infoBox: 'Suspension assistance · Appeal guidance',
    ctaText: 'Get Started →'
  },
  {
    id: 'p7',
    categoryLabel: 'WHATSAPP',
    title: 'WhatsApp Account Recovery',
    platform: 'whatsapp',
    price: '$150–$300',
    turnaround: '1–3 days',
    description: 'Support for restricted or banned WhatsApp accounts, including business-account access and recovery assistance.',
    infoBox: 'Account restriction support · Recovery assistance',
    ctaText: 'Get Started →'
  },
  {
    id: 'p8',
    categoryLabel: 'MULTI-PLATFORM',
    title: 'Complex Account Recovery',
    platform: 'other',
    price: '$400–$800+',
    turnaround: 'Case dependent',
    description: 'For difficult or multi-platform cases requiring a more detailed review and tailored recovery strategy.',
    infoBox: 'Complex cases · Custom recovery strategy',
    ctaText: 'Get a Custom Quote →'
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE #001',
    platform: 'facebook',
    title: 'Meta Business Manager & Ad Account Reinstated',
    handleOrType: 'Agency Ad Portfolio (42 Client Pixels)',
    violationReason: 'Unacceptable Business Practices (Automated Algorithmic Flag)',
    escalationPath: 'Structured Policy Compliance Dossier & Formal Review Submission',
    turnaroundHours: 41,
    date: '3 days ago',
    status: 'REINSTATED',
    quote: 'Our agency was completely paralyzed with $15k daily client ad spend halted. META RESOLVE helped navigate the complex review process and restore all 42 client assets in 41 hours without losing a single pixel event.'
  },
  {
    id: 'case-002',
    caseNumber: 'CASE #002',
    platform: 'instagram',
    title: 'Fashion Brand (240k Followers) Impersonation Flag Resolved',
    handleOrType: 'Verified Creator & E-Commerce Shop Profile',
    violationReason: 'False Impersonation & Automated Standards Trigger',
    escalationPath: 'Corporate Trademark Evidence & Identity Verification Package',
    turnaroundHours: 28,
    date: '5 days ago',
    status: 'RESTORED',
    quote: 'Competitors mass-reported our brand during Black Friday week. META RESOLVE prepared an airtight defense packet that got our main profile reviewed and restored in 28 hours.'
  },
  {
    id: 'case-003',
    caseNumber: 'CASE #003',
    platform: 'telegram',
    title: 'Crypto Community Telegram Channel (85k Members) Unblocked',
    handleOrType: 'Public Announcement Channel & Admin Bot',
    violationReason: 'Spam Filter False Trigger & Bulk Reporting',
    escalationPath: 'Telegram Official Review & SpamBot Compliance Filing',
    turnaroundHours: 19,
    date: 'Last week',
    status: 'RESTORED',
    quote: 'Our 85,000-member announcement channel was silenced unexpectedly. META RESOLVE guided our appeal through the exact channels needed, restoring full broadcast rights in 19 hours.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    authorName: 'David Kelling',
    role: 'Founder & CEO',
    company: 'Apex Digital Media',
    platform: 'facebook',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    timeframe: 'Resolved in 38 hours',
    content: 'When our primary Meta Business Manager got disabled out of nowhere, we were losing revenue every hour. META RESOLVE treated it with urgency, prepared our appeal perfectly, and got us back online in under 48 hours.',
    revenueImpact: '$140k+ monthly ad spend secured'
  },
  {
    id: 'test-2',
    authorName: 'Sarah Lin',
    role: 'Head of Growth',
    company: 'Kora Luxe Skincare',
    platform: 'instagram',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    timeframe: 'Resolved in 26 hours',
    content: 'Our Instagram account with 180,000 customers was disabled due to an automated false flag. Initial appeals yielded automated rejections. META RESOLVE structured a comprehensive verification case that had our profile restored the next day.',
    revenueImpact: 'Preserved 180k follower audience'
  },
  {
    id: 'test-3',
    authorName: 'Marcus Sterling',
    role: 'E-Commerce Operator',
    company: 'Sterling Goods Co.',
    platform: 'tiktok',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    timeframe: 'Resolved in 32 hours',
    content: 'TikTok Shop restricted our merchant portal during a major product launch. META RESOLVE helped us audit policy compliance and file a clear appeal that cleared our strikes without penalties.',
    revenueImpact: '$85k trapped escrow funds released'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'How does META RESOLVE assist with account recovery when automated appeals fail?',
    answer: 'Automated platform appeal buttons often trigger robotic filtering bots that reject cases without human inspection. META RESOLVE conducts a policy violation audit, builds formal compliance dossiers with complete verification evidence, and guides you through the proper platform-specific resolution and escalation procedures.'
  },
  {
    question: 'Which platforms do you support?',
    answer: 'We specialize in account bans, suspensions, and restrictions across six major platforms: Instagram, Facebook, TikTok, Telegram (TG), X (formerly Twitter), and WhatsApp.'
  },
  {
    question: 'Do you guarantee 100% account recovery?',
    answer: 'No legitimate service can guarantee a platform’s internal decisions. However, we evaluate every case upfront for feasibility before onboarding. By preparing structured, evidence-backed appeal dossiers aligned with platform policies, we significantly maximize your likelihood of a favorable resolution.'
  },
  {
    question: 'What is your typical turnaround time?',
    answer: 'Case review and dossier preparation typically occur within 12 to 24 hours. Platform review durations average between 24 and 48 hours depending on the platform’s queue and the complexity of the restriction.'
  },
  {
    question: 'Is my data and account access kept confidential?',
    answer: 'Absolutely. We operate under strict confidentiality agreements (NDA) and enterprise data security protocols. We do not ask for master passwords for standard policy appeals; we work using asset IDs, policy notices, and authorized documentation.'
  }
];

