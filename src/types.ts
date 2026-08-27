export type PlatformType = 'instagram' | 'facebook' | 'tiktok' | 'telegram' | 'x' | 'whatsapp' | 'other';

export interface ServiceItem {
  id: string;
  platform: PlatformType;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  tags: string[];
  features: string[];
  avgTurnaround: string;
  successRate: string;
  priceEstimate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  serviceTags: string[];
  ctaText: string;
  isFounder?: boolean;
  casesResolved?: number;
  status?: string;
  directContactUrl?: string;
}

export interface PricingPlan {
  id: string;
  title: string;
  categoryLabel?: string;
  platform: PlatformType;
  price: string;
  isFlat?: boolean;
  priceSubtitle?: string;
  isPopular?: boolean;
  description: string;
  infoBox?: string;
  features?: string[];
  turnaround: string;
  ctaText: string;
}

export interface CaseStudy {
  id: string;
  caseNumber: string;
  platform: PlatformType;
  title: string;
  handleOrType: string;
  violationReason: string;
  escalationPath: string;
  turnaroundHours: number;
  date: string;
  status: 'REINSTATED' | 'RESTORED' | 'STRIKE REMOVED';
  quote: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  company: string;
  platform: PlatformType;
  avatarUrl: string;
  rating: number;
  verified: boolean;
  timeframe: string;
  content: string;
  revenueImpact?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  platform?: PlatformType;
  accountType?: string;
  banReason?: string;
  accountHandle?: string;
  details: string;
  urgency?: 'standard' | 'critical';
}

export type LeadStatus = 'new' | 'reviewing' | 'appealing' | 'resolved' | 'declined';

export interface LeadRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  platform: PlatformType;
  accountType: string;
  banReason: string;
  accountHandle: string;
  details: string;
  urgency: 'standard' | 'critical';
  status: LeadStatus;
  adminNotes?: string;
}

export interface SiteConfig {
  officialEmail?: string;
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  founderName: string;
  caseworkStatus: 'Open' | 'High Priority Only' | 'Limited Intake';
  bannerAnnouncement: string;
  bannerEnabled: boolean;
}

export interface AdminCredentials {
  adminId: string;
  password: string;
  lastUpdated?: string;
}
