import {
  LayoutDashboard,
  Settings,
  Users,
  ShieldCheck,
  Heart,
  CreditCard,
  UserCog,
  GraduationCap,
  Briefcase,
  Sparkles,
  Database,
  PieChart,
  Calendar,
  Building2,
  ShoppingBag,
  Gift,
  type LucideIcon,
} from "lucide-react";

export type AdminItem = { title: string; slug: string };
export type AdminGroup = {
  title: string;
  icon: LucideIcon;
  slug: string;
  items?: AdminItem[];
};

export const adminMenu: AdminGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, slug: "" },
  {
    title: "Settings",
    icon: Settings,
    slug: "settings",
    items: [
      { title: "Country Management", slug: "settings/country" },
      { title: "Currency Management", slug: "settings/currency" },
      { title: "Language Management", slug: "settings/language" },
      { title: "Timezone Management", slug: "settings/timezone" },
      { title: "Stakeholder Types", slug: "settings/stakeholder-types" },
      { title: "Industry / Sector Tags", slug: "settings/industry-tags" },
      { title: "Skill Tags", slug: "settings/skill-tags" },
      { title: "Intent / Goal Options", slug: "settings/intent-options" },
      { title: "Platform Name & Logo", slug: "settings/platform-branding" },
      { title: "Legal Documents", slug: "settings/legal" },
      { title: "Feature Flags", slug: "settings/feature-flags" },
      { title: "Email / SMS / Push Config", slug: "settings/notification-providers" },
      { title: "Payment Gateway Config", slug: "settings/payment-gateways" },
      { title: "Payment Analytics", slug: "settings/payment-analytics" },
      { title: "Third-party Integrations", slug: "settings/integrations" },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    slug: "users",
    items: [
      { title: "All Users List", slug: "users/list" },
      { title: "User Search & Filter", slug: "users/search" },
      { title: "User Detail View", slug: "users/detail" },
      { title: "Account Status", slug: "users/status" },
      { title: "Suspend / Reinstate", slug: "users/suspend" },
      { title: "Reset Password", slug: "users/reset-password" },
      { title: "Internal Notes", slug: "users/notes" },
      { title: "Export Users", slug: "users/export" },
    ],
  },
  {
    title: "Onboarding & KYC",
    icon: ShieldCheck,
    slug: "kyc",
    items: [
      { title: "Signup Flow Config", slug: "kyc/signup-flow" },
      { title: "Signup Methods", slug: "kyc/signup-methods" },
      { title: "Email Verification", slug: "kyc/email-verification" },
      { title: "Phone / OTP Verification", slug: "kyc/phone-verification" },
      { title: "KYC Queue", slug: "kyc/queue" },
      { title: "Document Upload & Review", slug: "kyc/documents" },
      { title: "Approve / Reject KYC", slug: "kyc/review" },
      { title: "KYC Status per User", slug: "kyc/status" },
      { title: "Rejection & Resubmission", slug: "kyc/rejections" },
    ],
  },
  {
    title: "Matching & Networking",
    icon: Heart,
    slug: "matching",
    items: [
      { title: "Match Engine Toggle", slug: "matching/engine" },
      { title: "Swipe Limits per Plan", slug: "matching/swipe-limits" },
      { title: "Intent Types Config", slug: "matching/intent-types" },
      { title: "Filter Options Config", slug: "matching/filters" },
      { title: "Match Analytics", slug: "matching/analytics" },
    ],
  },
  {
    title: "Subscriptions & Plans",
    icon: CreditCard,
    slug: "plans",
    items: [
      { title: "Plan Config", slug: "plans/config" },
      { title: "Feature Toggle per Plan", slug: "plans/features" },
      { title: "Pricing per Plan", slug: "plans/pricing" },
      { title: "Active Subscriptions", slug: "plans/subscriptions" },
    ],
  },
  {
    title: "Mentorship & Experts",
    icon: GraduationCap,
    slug: "mentorship",
    items: [
      { title: "Expert Directory", slug: "mentorship/experts" },
      { title: "Expert Onboarding & Verification", slug: "mentorship/onboarding" },
      { title: "Session Bookings", slug: "mentorship/bookings" },
      { title: "Pricing & Commission", slug: "mentorship/pricing" },
      { title: "Reviews & Ratings", slug: "mentorship/reviews" },
      { title: "Payouts", slug: "mentorship/payouts" },
    ],
  },
  {
    title: "Investor Module",
    icon: Briefcase,
    slug: "investors",
    items: [
      { title: "Investor Directory", slug: "investors/directory" },
      { title: "Accreditation & KYC", slug: "investors/accreditation" },
      { title: "Investor Club Membership", slug: "investors/club" },
      { title: "Deal Flow Pipeline", slug: "investors/deal-flow" },
      { title: "Syndicates & SPVs", slug: "investors/syndicates" },
      { title: "Portfolio Tracking", slug: "investors/portfolio" },
    ],
  },
  {
    title: "Fundraising Tools",
    icon: PieChart,
    slug: "fundraising",
    items: [
      { title: "AI Pitch Deck Analysis", slug: "fundraising/pitch-analysis" },
      { title: "Fundraising CRM", slug: "fundraising/crm" },
      { title: "Cap Table Management", slug: "fundraising/cap-table" },
      { title: "Term Sheet Templates", slug: "fundraising/term-sheets" },
      { title: "Valuation Tools", slug: "fundraising/valuation" },
      { title: "Investor Updates", slug: "fundraising/updates" },
    ],
  },
  {
    title: "Data Room",
    icon: Database,
    slug: "data-room",
    items: [
      { title: "Document Vault", slug: "data-room/vault" },
      { title: "Access Control", slug: "data-room/access" },
      { title: "Audit Log", slug: "data-room/audit" },
      { title: "Watermarking & DRM", slug: "data-room/drm" },
      { title: "Storage Analytics", slug: "data-room/analytics" },
    ],
  },
  {
    title: "Events",
    icon: Calendar,
    slug: "events",
    items: [
      { title: "All Events", slug: "events/list" },
      { title: "Create / Approve Events", slug: "events/approval" },
      { title: "Ticketing & Registration", slug: "events/tickets" },
      { title: "Speakers & Sponsors", slug: "events/speakers" },
      { title: "Event Analytics", slug: "events/analytics" },
    ],
  },
  {
    title: "Talent Hiring",
    icon: Building2,
    slug: "talent",
    items: [
      { title: "Job Listings", slug: "talent/jobs" },
      { title: "Applicant Tracker", slug: "talent/applicants" },
      { title: "Employer Verification", slug: "talent/employers" },
      { title: "Featured Postings", slug: "talent/featured" },
      { title: "Hiring Analytics", slug: "talent/analytics" },
    ],
  },
  {
    title: "Marketplace & RFQ",
    icon: ShoppingBag,
    slug: "marketplace",
    items: [
      { title: "Service Listings", slug: "marketplace/services" },
      { title: "RFQ Requests", slug: "marketplace/rfq" },
      { title: "Vendor Verification", slug: "marketplace/vendors" },
      { title: "Orders & Disputes", slug: "marketplace/orders" },
      { title: "Commission Settings", slug: "marketplace/commission" },
    ],
  },
  {
    title: "Service Credits & Offers",
    icon: Gift,
    slug: "credits",
    items: [
      { title: "Credit Packages", slug: "credits/packages" },
      { title: "Promo Codes", slug: "credits/promos" },
      { title: "Partner Offers", slug: "credits/offers" },
      { title: "Redemption History", slug: "credits/redemptions" },
    ],
  },
  {
    title: "AI Tools",
    icon: Sparkles,
    slug: "ai",
    items: [
      { title: "AI Match Suggestions", slug: "ai/match" },
      { title: "AI Pitch Coach", slug: "ai/pitch-coach" },
      { title: "AI Profile Enhancer", slug: "ai/profile" },
      { title: "AI Moderation Rules", slug: "ai/moderation" },
      { title: "Usage & Costs", slug: "ai/usage" },
    ],
  },
  {
    title: "Admin Management",
    icon: UserCog,
    slug: "admins",
    items: [
      { title: "Create Admin Accounts", slug: "admins/create" },
      { title: "Roles & Permissions", slug: "admins/roles" },
      { title: "2FA for Admins", slug: "admins/2fa" },
      { title: "Activity Logs", slug: "admins/logs" },
    ],
  },
];

export function findPage(slug: string) {
  for (const g of adminMenu) {
    if (g.slug === slug) return { group: g, item: null as AdminItem | null };
    const found = g.items?.find((i) => i.slug === slug);
    if (found) return { group: g, item: found };
  }
  return null;
}
