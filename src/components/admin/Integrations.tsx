import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Search, Plus, Settings2, Webhook, Copy, ChevronRight, ShieldCheck, KeyRound, Link2,
  CheckCircle2, AlertTriangle, Activity, Clock, Trash2, Eye, ExternalLink,
  Mail, MessageSquare, Video, Calendar, Users, FileSignature, Briefcase, BarChart3,
  Cloud, Bot, Database, Globe, ShieldAlert, Sparkles, FileText, Languages, Mic,
  Share2, Map, CreditCard, Building2, Lock, Workflow, GitBranch, BookOpen, Rss,
  PieChart, TrendingUp, Zap, ScrollText, Megaphone, Headphones, Wallet,
} from "lucide-react";

type Category =
  | "auth" | "crm" | "calendar" | "video" | "email" | "messaging" | "ats"
  | "verify" | "esign" | "analytics" | "storage" | "productivity" | "ai"
  | "comms" | "payments" | "enrichment" | "compliance" | "captable" | "events"
  | "maps" | "translate" | "speech" | "social" | "automation" | "support"
  | "data" | "search" | "background" | "marketing";

type AuthMethod = "oauth2" | "apikey" | "saml" | "webhook" | "scim" | "basic";
type Status = "connected" | "available" | "needs_attention" | "deprecated";
type Env = "sandbox" | "production";

type Integration = {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  description: string;
  authMethod: AuthMethod;
  status: Status;
  env: Env;
  scopes: string[];
  webhooks: string[];
  rateLimit: string;
  usagePct: number;       // 0-100 of monthly quota
  events30d: number;      // events in last 30d
  errors30d: number;
  lastSync?: string;      // human label
  features: string[];     // which Zynk features it powers
  recommended?: boolean;
  tier?: "core" | "growth" | "enterprise";
  docsUrl: string;
  pricing?: string;
  region?: string[];
};

const cat: Record<Category, { label: string; icon: typeof Settings2; cls: string }> = {
  auth:        { label: "Auth & SSO",            icon: Lock,         cls: "bg-blue-500/10 text-blue-500" },
  crm:         { label: "CRM",                    icon: Briefcase,    cls: "bg-emerald-500/10 text-emerald-500" },
  calendar:    { label: "Calendar",               icon: Calendar,     cls: "bg-amber-500/10 text-amber-500" },
  video:       { label: "Video meetings",         icon: Video,        cls: "bg-violet-500/10 text-violet-500" },
  email:       { label: "Email delivery",         icon: Mail,         cls: "bg-rose-500/10 text-rose-500" },
  messaging:   { label: "Messaging & SMS",        icon: MessageSquare,cls: "bg-cyan-500/10 text-cyan-500" },
  ats:         { label: "ATS / Recruiting",       icon: Users,        cls: "bg-indigo-500/10 text-indigo-500" },
  verify:      { label: "Identity / KYC",         icon: ShieldCheck,  cls: "bg-emerald-500/10 text-emerald-500" },
  esign:       { label: "e-Signature",            icon: FileSignature,cls: "bg-fuchsia-500/10 text-fuchsia-500" },
  analytics:   { label: "Analytics",              icon: BarChart3,    cls: "bg-blue-500/10 text-blue-500" },
  storage:     { label: "Storage & files",        icon: Cloud,        cls: "bg-sky-500/10 text-sky-500" },
  productivity:{ label: "Productivity",           icon: FileText,     cls: "bg-teal-500/10 text-teal-500" },
  ai:          { label: "AI & ML",                icon: Bot,          cls: "bg-purple-500/10 text-purple-500" },
  comms:       { label: "Comms / Voice",          icon: Headphones,   cls: "bg-orange-500/10 text-orange-500" },
  payments:    { label: "Payments",               icon: CreditCard,   cls: "bg-emerald-500/10 text-emerald-500" },
  enrichment:  { label: "Data enrichment",        icon: Database,     cls: "bg-indigo-500/10 text-indigo-500" },
  compliance:  { label: "Compliance / Sanctions", icon: ShieldAlert,  cls: "bg-rose-500/10 text-rose-500" },
  captable:    { label: "Cap-table / SPV",        icon: Building2,    cls: "bg-amber-500/10 text-amber-500" },
  events:      { label: "Events & ticketing",     icon: Megaphone,    cls: "bg-pink-500/10 text-pink-500" },
  maps:        { label: "Maps & geo",             icon: Map,          cls: "bg-emerald-500/10 text-emerald-500" },
  translate:   { label: "Translation",            icon: Languages,    cls: "bg-blue-500/10 text-blue-500" },
  speech:      { label: "Speech / Transcription", icon: Mic,          cls: "bg-violet-500/10 text-violet-500" },
  social:      { label: "Social publishing",      icon: Share2,       cls: "bg-cyan-500/10 text-cyan-500" },
  automation:  { label: "Workflow & automation",  icon: Workflow,     cls: "bg-amber-500/10 text-amber-500" },
  support:     { label: "Helpdesk & support",     icon: BookOpen,     cls: "bg-teal-500/10 text-teal-500" },
  data:        { label: "Data warehouse",         icon: PieChart,     cls: "bg-blue-500/10 text-blue-500" },
  search:      { label: "Search",                 icon: Search,       cls: "bg-purple-500/10 text-purple-500" },
  background:  { label: "Background checks",      icon: ShieldCheck,  cls: "bg-rose-500/10 text-rose-500" },
  marketing:   { label: "Marketing automation",   icon: TrendingUp,   cls: "bg-pink-500/10 text-pink-500" },
};

const statusStyle: Record<Status, string> = {
  connected:        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  available:        "bg-muted text-muted-foreground border-border",
  needs_attention:  "bg-amber-500/10 text-amber-500 border-amber-500/20",
  deprecated:       "bg-rose-500/10 text-rose-500 border-rose-500/20",
};
const statusLabel: Record<Status, string> = {
  connected: "Connected", available: "Available", needs_attention: "Needs attention", deprecated: "Deprecated",
};

// ── Catalog (deep & broad — competing with LinkedIn) ──────────────────────────
const seed: Integration[] = [
  // Auth / SSO
  { id: "google_oauth", name: "Google OAuth", vendor: "Google", category: "auth", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["openid","email","profile"], webhooks: [], rateLimit: "10k/min", usagePct: 12, events30d: 184_320, errors30d: 14, lastSync: "live",
    features: ["Sign-in","Profile import","Calendar"], recommended: true, tier: "core", docsUrl: "https://developers.google.com",
    description: "Sign-in, profile import, and Google data scopes." },
  { id: "apple_oauth", name: "Sign in with Apple", vendor: "Apple", category: "auth", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["name","email"], webhooks: [], rateLimit: "—", usagePct: 4, events30d: 21_840, errors30d: 6, lastSync: "live",
    features: ["Sign-in (iOS mandatory)"], tier: "core", docsUrl: "https://developer.apple.com",
    description: "Required for iOS app store if other social logins are present." },
  { id: "linkedin_oauth", name: "LinkedIn Login", vendor: "LinkedIn", category: "auth", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["r_liteprofile","r_emailaddress","w_member_social"], webhooks: [], rateLimit: "5k/day", usagePct: 41, events30d: 12_440, errors30d: 22, lastSync: "live",
    features: ["Import work history","One-click import","Cross-post"], recommended: true, tier: "core", docsUrl: "https://learn.microsoft.com/linkedin",
    description: "Bootstrap profiles in 3s by importing LinkedIn work history — the #1 onboarding win." },
  { id: "microsoft_oauth", name: "Microsoft Entra ID", vendor: "Microsoft", category: "auth", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["openid","User.Read"], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Enterprise SSO"], tier: "enterprise", docsUrl: "https://learn.microsoft.com/azure/active-directory",
    description: "Enterprise SSO for corporate teams onboarding via work email." },
  { id: "okta_saml", name: "Okta", vendor: "Okta", category: "auth", authMethod: "saml", status: "available", env: "sandbox",
    scopes: [], webhooks: ["user.lifecycle"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["SAML SSO","SCIM provisioning"], tier: "enterprise", docsUrl: "https://developer.okta.com",
    description: "SAML + SCIM for enterprise Zynk Teams accounts." },
  { id: "auth0", name: "Auth0", vendor: "Okta", category: "auth", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["MFA","Passwordless","B2B"], tier: "enterprise", docsUrl: "https://auth0.com/docs",
    description: "Optional alternative to native auth for complex MFA flows." },

  // CRM
  { id: "hubspot", name: "HubSpot", vendor: "HubSpot", category: "crm", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["contacts","crm.objects.companies.read","timeline"], webhooks: ["contact.creation","deal.propertyChange"],
    rateLimit: "100/10s", usagePct: 38, events30d: 9_812, errors30d: 8, lastSync: "2 min ago",
    features: ["Sync Zynk leads → HubSpot","Deal stage from intent","Contact dedupe"], recommended: true, tier: "growth",
    docsUrl: "https://developers.hubspot.com",
    description: "Push warm leads from Zynk matches directly into the seller's pipeline." },
  { id: "salesforce", name: "Salesforce", vendor: "Salesforce", category: "crm", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["api","refresh_token"], webhooks: ["sObject.change"], rateLimit: "org-tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Lead sync","Account match","Einstein scoring"], tier: "enterprise", docsUrl: "https://developer.salesforce.com",
    description: "Enterprise sales CRM — required for Zynk Enterprise tier." },
  { id: "pipedrive", name: "Pipedrive", vendor: "Pipedrive", category: "crm", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["base"], webhooks: ["deal.added"], rateLimit: "100/2s", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Founder CRM","Deal pipeline"], tier: "growth", docsUrl: "https://developers.pipedrive.com",
    description: "Lightweight CRM popular with founders & SMB sales." },
  { id: "zoho_crm", name: "Zoho CRM", vendor: "Zoho", category: "crm", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["ZohoCRM.modules.ALL"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["MENA-popular CRM"], tier: "growth", docsUrl: "https://www.zoho.com/crm/developer/", description: "Strong in MENA + India SMB." },
  { id: "attio", name: "Attio", vendor: "Attio", category: "crm", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["record_permission:read-write"], webhooks: ["object.created"], rateLimit: "100/min", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Founder-friendly CRM","Investor pipeline"], tier: "growth", docsUrl: "https://developers.attio.com",
    description: "Modern CRM popular with founders & VCs — great for investor pipeline mirroring." },

  // Calendar
  { id: "gcal", name: "Google Calendar", vendor: "Google", category: "calendar", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["calendar.events"], webhooks: ["watch:events"], rateLimit: "1M/day", usagePct: 18, events30d: 41_220, errors30d: 12, lastSync: "live",
    features: ["Schedule sessions","Availability","Auto-add meeting link"], recommended: true, tier: "core", docsUrl: "https://developers.google.com/calendar",
    description: "Powers expert session booking, mentor scheduling and event RSVPs." },
  { id: "outlook_cal", name: "Outlook Calendar", vendor: "Microsoft", category: "calendar", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["Calendars.ReadWrite"], webhooks: [], rateLimit: "tier", usagePct: 6, events30d: 8_120, errors30d: 4, lastSync: "live",
    features: ["Enterprise calendar"], tier: "core", docsUrl: "https://learn.microsoft.com/graph", description: "Same as gcal but for Microsoft 365 users." },
  { id: "calendly", name: "Calendly", vendor: "Calendly", category: "calendar", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["default"], webhooks: ["invitee.created"], rateLimit: "200/min", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Booking page import","Round-robin"], tier: "growth", docsUrl: "https://developer.calendly.com",
    description: "Let mentors keep their existing Calendly booking page inside Zynk." },
  { id: "cal_com", name: "Cal.com", vendor: "Cal.com", category: "calendar", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["BOOKING_CREATED"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Open-source booking"], tier: "growth", docsUrl: "https://cal.com/docs", description: "OSS alternative to Calendly." },

  // Video
  { id: "zoom", name: "Zoom", vendor: "Zoom", category: "video", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["meeting:write","recording:read"], webhooks: ["meeting.ended","recording.completed"],
    rateLimit: "100/sec", usagePct: 22, events30d: 18_240, errors30d: 18, lastSync: "live",
    features: ["1:1 sessions","Webinars","Recording → transcript"], recommended: true, tier: "core", docsUrl: "https://marketplace.zoom.us",
    description: "Default mentor/expert session video. Auto-recording + transcript pipeline." },
  { id: "google_meet", name: "Google Meet", vendor: "Google", category: "video", authMethod: "oauth2", status: "connected", env: "production",
    scopes: ["calendar.events"], webhooks: [], rateLimit: "—", usagePct: 8, events30d: 5_410, errors30d: 2, lastSync: "live",
    features: ["Auto-link in events"], tier: "core", docsUrl: "https://developers.google.com/meet",
    description: "Created automatically when a session is booked via Google Calendar." },
  { id: "ms_teams", name: "Microsoft Teams", vendor: "Microsoft", category: "video", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["OnlineMeetings.ReadWrite"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Enterprise sessions"], tier: "enterprise", docsUrl: "https://learn.microsoft.com/graph", description: "For enterprise customers." },
  { id: "daily", name: "Daily.co", vendor: "Daily", category: "video", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["meeting.ended"], rateLimit: "10k/day", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Embedded video","Group rooms"], tier: "growth", docsUrl: "https://docs.daily.co",
    description: "Embed live video in Zynk without leaving the app — used for AMAs and group rooms." },
  { id: "livekit", name: "LiveKit", vendor: "LiveKit", category: "video", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["room_finished"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Real-time audio rooms","Spaces"], tier: "growth", docsUrl: "https://docs.livekit.io",
    description: "Alternative to Twitter Spaces — host live audio rooms inside Zynk." },

  // Email delivery
  { id: "resend", name: "Resend", vendor: "Resend", category: "email", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: ["email.delivered","email.bounced"], rateLimit: "10/sec", usagePct: 41, events30d: 392_140, errors30d: 184, lastSync: "live",
    features: ["Transactional email","React Email templates"], recommended: true, tier: "core", docsUrl: "https://resend.com/docs",
    description: "Primary transactional email — onboarding, magic links, digests." },
  { id: "sendgrid", name: "SendGrid", vendor: "Twilio", category: "email", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["event"], rateLimit: "10k/sec", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["High-volume sends","Marketing"], tier: "growth", docsUrl: "https://docs.sendgrid.com", description: "Failover ESP for >1M sends/day." },
  { id: "postmark", name: "Postmark", vendor: "Postmark", category: "email", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["bounce","spam"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Best inbox-rate transactional"], tier: "growth", docsUrl: "https://postmarkapp.com/developer", description: "Use for password reset / magic links if Resend SR drops." },
  { id: "ses", name: "Amazon SES", vendor: "AWS", category: "email", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Cheapest at scale"], tier: "enterprise", docsUrl: "https://docs.aws.amazon.com/ses", description: "Cheap fallback at very high volume." },

  // Messaging / SMS / Push
  { id: "twilio", name: "Twilio", vendor: "Twilio", category: "messaging", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: ["status_callback"], rateLimit: "tier", usagePct: 14, events30d: 24_120, errors30d: 41, lastSync: "live",
    features: ["SMS OTP","WhatsApp","Voice"], recommended: true, tier: "core", docsUrl: "https://www.twilio.com/docs",
    description: "OTP, transactional SMS, and WhatsApp Business — global coverage." },
  { id: "msg91", name: "MSG91", vendor: "MSG91", category: "messaging", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["India SMS / OTP"], tier: "growth", docsUrl: "https://docs.msg91.com", description: "Cheaper India SMS rails (DLT compliant)." },
  { id: "unifonic", name: "Unifonic", vendor: "Unifonic", category: "messaging", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["MENA SMS / WhatsApp"], tier: "growth", docsUrl: "https://docs.unifonic.com", description: "MENA-native messaging — better deliverability than Twilio in KSA/UAE." },
  { id: "fcm", name: "Firebase Cloud Messaging", vendor: "Google", category: "messaging", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 8, events30d: 1_240_000, errors30d: 320, lastSync: "live",
    features: ["Push (Android/Web)"], tier: "core", docsUrl: "https://firebase.google.com/docs/cloud-messaging", description: "Push notifications across Android and web." },
  { id: "apns", name: "Apple Push (APNs)", vendor: "Apple", category: "messaging", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 5, events30d: 480_000, errors30d: 92, lastSync: "live",
    features: ["iOS push"], tier: "core", docsUrl: "https://developer.apple.com/documentation/usernotifications", description: "iOS push." },
  { id: "onesignal", name: "OneSignal", vendor: "OneSignal", category: "messaging", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Cross-platform push","In-app","Email"], tier: "growth", docsUrl: "https://documentation.onesignal.com", description: "Single SDK across push/email/SMS." },
  { id: "knock", name: "Knock", vendor: "Knock", category: "messaging", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["message.delivered"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Notification orchestration","User preferences"], tier: "growth", docsUrl: "https://docs.knock.app",
    description: "Notification engine with user preference centre — powers digest and quiet-hours logic." },

  // ATS / Recruiting
  { id: "greenhouse", name: "Greenhouse", vendor: "Greenhouse", category: "ats", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["candidate_stage_change"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Job sync","Candidate import","Application from Zynk profile"], recommended: true, tier: "growth", docsUrl: "https://developers.greenhouse.io",
    description: "Apply with Zynk profile → push candidates straight into Greenhouse pipelines." },
  { id: "lever", name: "Lever", vendor: "Lever", category: "ats", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["postings:read","candidates:write"], webhooks: ["candidateHired"], rateLimit: "10/sec", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Job sync","Candidate webhooks"], tier: "growth", docsUrl: "https://hire.lever.co/developer", description: "Same flow as Greenhouse for Lever-using employers." },
  { id: "ashby", name: "Ashby", vendor: "Ashby", category: "ats", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Modern startup ATS"], tier: "growth", docsUrl: "https://developers.ashbyhq.com", description: "Loved by YC/seed startups — 1-click apply." },
  { id: "workable", name: "Workable", vendor: "Workable", category: "ats", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["SMB recruiting"], tier: "growth", docsUrl: "https://workable.readme.io" },
  { id: "indeed", name: "Indeed Apply", vendor: "Indeed", category: "ats", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Job aggregation","Apply on Indeed"], tier: "growth", docsUrl: "https://opensource.indeedeng.io/api-documentation",
    description: "Aggregate jobs onto Zynk; let users apply with Indeed." },

  // Identity / KYC
  { id: "persona", name: "Persona", vendor: "Persona", category: "verify", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["inquiry.completed"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["KYC for investors","Doc + selfie","Address proof"], recommended: true, tier: "growth", docsUrl: "https://docs.withpersona.com",
    description: "Verify investors, expert mentors, and high-trust badges." },
  { id: "sumsub", name: "Sumsub", vendor: "Sumsub", category: "verify", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["applicantReviewed"], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Global KYC/KYB","Sanctions screening"], tier: "growth", docsUrl: "https://developers.sumsub.com",
    description: "Strong MENA/India KYC + KYB for entities (SPVs, funds)." },
  { id: "veriff", name: "Veriff", vendor: "Veriff", category: "verify", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["KYC alternative"], tier: "growth", docsUrl: "https://developers.veriff.com" },
  { id: "uae_pass", name: "UAE Pass", vendor: "UAE Government", category: "verify", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["urn:uae:digitalid:profile"], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["UAE digital ID","Verified UAE founder badge"], tier: "growth", docsUrl: "https://docs.uaepass.ae",
    description: "Native UAE digital identity — required for verified UAE founder badge." },
  { id: "didit", name: "DIDIT", vendor: "DIDIT", category: "verify", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Free KYC tier"], tier: "growth", docsUrl: "https://docs.didit.me", description: "Free-tier KYC — useful for low-risk verifications." },

  // e-Signature
  { id: "docusign", name: "DocuSign", vendor: "DocuSign", category: "esign", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["signature","impersonation"], webhooks: ["envelope-completed"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["NDA","SAFE","Term sheet"], tier: "growth", docsUrl: "https://developers.docusign.com",
    description: "Standard for SAFEs, term sheets and SPV subscription docs." },
  { id: "dropbox_sign", name: "Dropbox Sign", vendor: "Dropbox", category: "esign", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["e-Sign alternative"], tier: "growth", docsUrl: "https://developers.hellosign.com" },
  { id: "stamped", name: "Stamped", vendor: "Stamped", category: "esign", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["MENA e-sign"], tier: "growth", docsUrl: "https://stamped.io" },

  // Analytics
  { id: "posthog", name: "PostHog", vendor: "PostHog", category: "analytics", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 24, events30d: 18_400_000, errors30d: 0, lastSync: "live",
    features: ["Product analytics","Session replay","Flags","Experiments"], recommended: true, tier: "core", docsUrl: "https://posthog.com/docs",
    description: "Primary product analytics + flags + replay — single source of truth." },
  { id: "ga4", name: "Google Analytics 4", vendor: "Google", category: "analytics", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 9, events30d: 6_400_000, errors30d: 0, lastSync: "live",
    features: ["Marketing attribution"], tier: "core", docsUrl: "https://developers.google.com/analytics" },
  { id: "amplitude", name: "Amplitude", vendor: "Amplitude", category: "analytics", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Behavioural cohorts"], tier: "growth", docsUrl: "https://www.docs.developers.amplitude.com" },
  { id: "mixpanel", name: "Mixpanel", vendor: "Mixpanel", category: "analytics", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0, features: ["Cohort analysis"], tier: "growth", docsUrl: "https://developer.mixpanel.com" },
  { id: "segment", name: "Segment", vendor: "Twilio", category: "analytics", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Event router (CDP)"], tier: "growth", docsUrl: "https://segment.com/docs", description: "Single SDK — fan-out to every analytics & marketing tool." },
  { id: "rudderstack", name: "RudderStack", vendor: "RudderStack", category: "analytics", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["OSS CDP"], tier: "growth", docsUrl: "https://rudderstack.com/docs", description: "Self-hosted Segment alternative for data sovereignty." },

  // Storage
  { id: "s3", name: "Amazon S3", vendor: "AWS", category: "storage", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: ["s3:ObjectCreated"], rateLimit: "—", usagePct: 31, events30d: 482_000, errors30d: 12, lastSync: "live",
    features: ["Avatar storage","Pitch decks","Recordings"], tier: "core", docsUrl: "https://docs.aws.amazon.com/s3" },
  { id: "cloudflare_r2", name: "Cloudflare R2", vendor: "Cloudflare", category: "storage", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Zero-egress storage"], tier: "growth", docsUrl: "https://developers.cloudflare.com/r2", description: "Egress-free large media (event videos)." },
  { id: "cloudinary", name: "Cloudinary", vendor: "Cloudinary", category: "storage", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["upload"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Image transforms","Video CDN"], tier: "growth", docsUrl: "https://cloudinary.com/documentation",
    description: "Auto-resize avatars, pitch deck thumbnails, watermarked exports." },
  { id: "mux", name: "Mux", vendor: "Mux", category: "storage", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["video.asset.ready"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Video hosting","Live streaming"], tier: "growth", docsUrl: "https://docs.mux.com",
    description: "Host pitch videos, demo days, and AMAs with adaptive bitrate streaming." },

  // Productivity
  { id: "google_drive", name: "Google Drive", vendor: "Google", category: "productivity", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["drive.file"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Attach pitch decks","Data room"], tier: "core", docsUrl: "https://developers.google.com/drive" },
  { id: "notion", name: "Notion", vendor: "Notion", category: "productivity", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["read","write"], webhooks: [], rateLimit: "3/s", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Sync investor updates","Data room"], tier: "growth", docsUrl: "https://developers.notion.com",
    description: "Push monthly investor updates to a Notion page automatically." },
  { id: "airtable", name: "Airtable", vendor: "Airtable", category: "productivity", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["data.records:read","data.records:write"], webhooks: [], rateLimit: "5/s", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Investor pipeline","Custom CRMs"], tier: "growth", docsUrl: "https://airtable.com/developers" },

  // AI
  { id: "openai", name: "OpenAI", vendor: "OpenAI", category: "ai", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 36, events30d: 4_120_000, errors30d: 84, lastSync: "live",
    features: ["GPT-4o","Embeddings","Realtime"], tier: "core", docsUrl: "https://platform.openai.com/docs",
    description: "Profile rewriter, intro generator, semantic search embeddings." },
  { id: "anthropic", name: "Anthropic Claude", vendor: "Anthropic", category: "ai", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 18, events30d: 1_240_000, errors30d: 12, lastSync: "live",
    features: ["Long-context summaries","Agent reasoning"], tier: "core", docsUrl: "https://docs.anthropic.com" },
  { id: "lovable_ai", name: "Lovable AI Gateway", vendor: "Lovable", category: "ai", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 12, events30d: 84_000, errors30d: 1, lastSync: "live",
    features: ["Multi-model gateway","Cost ceiling"], recommended: true, tier: "core", docsUrl: "https://docs.lovable.dev",
    description: "Default AI rail — automatic provider routing, fallback and cost controls." },
  { id: "elevenlabs", name: "ElevenLabs", vendor: "ElevenLabs", category: "ai", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["TTS for accessibility","Voice clones for AMAs"], tier: "growth", docsUrl: "https://elevenlabs.io/docs" },
  { id: "perplexity", name: "Perplexity", vendor: "Perplexity", category: "ai", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Live web research"], tier: "growth", docsUrl: "https://docs.perplexity.ai", description: "Used in 'Research this person/company' panel." },
  { id: "pinecone", name: "Pinecone", vendor: "Pinecone", category: "ai", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Vector search for matches"], tier: "growth", docsUrl: "https://docs.pinecone.io" },

  // Comms / Voice
  { id: "intercom", name: "Intercom", vendor: "Intercom", category: "support", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["read_users","write_conversations"], webhooks: ["conversation.created"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["In-app support","Help centre"], tier: "growth", docsUrl: "https://developers.intercom.com" },
  { id: "zendesk", name: "Zendesk", vendor: "Zendesk", category: "support", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["read","write"], webhooks: ["ticket.created"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Tickets","SLA"], tier: "enterprise", docsUrl: "https://developer.zendesk.com" },
  { id: "crisp", name: "Crisp", vendor: "Crisp", category: "support", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Affordable live chat"], tier: "growth", docsUrl: "https://docs.crisp.chat" },

  // Enrichment
  { id: "clearbit", name: "Clearbit", vendor: "HubSpot", category: "enrichment", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Auto-fill company info","Logo lookup"], tier: "growth", docsUrl: "https://clearbit.com/docs",
    description: "Auto-enrich profiles with company data from a domain." },
  { id: "apollo", name: "Apollo.io", vendor: "Apollo", category: "enrichment", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["B2B contact data","Lookalike search"], tier: "growth", docsUrl: "https://apolloio.github.io/apollo-api-docs",
    description: "Find decision-makers at companies users want to reach." },
  { id: "peopledatalabs", name: "People Data Labs", vendor: "PDL", category: "enrichment", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Person enrichment","Skills inference"], tier: "growth", docsUrl: "https://docs.peopledatalabs.com" },
  { id: "crunchbase", name: "Crunchbase", vendor: "Crunchbase", category: "enrichment", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Funding data","Company timelines"], tier: "growth", docsUrl: "https://data.crunchbase.com",
    description: "Show 'Last raised $5M Series A' badges on company pages." },
  { id: "tracxn", name: "Tracxn", vendor: "Tracxn", category: "enrichment", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["MENA / India startup data"], tier: "growth", docsUrl: "https://tracxn.com", description: "Stronger MENA + India coverage than Crunchbase." },

  // Compliance / Sanctions
  { id: "ofac_screen", name: "OFAC / UN / EU Sanctions", vendor: "ComplyAdvantage", category: "compliance", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Sanctions screening","PEP","Adverse media"], recommended: true, tier: "growth", docsUrl: "https://docs.complyadvantage.com",
    description: "Mandatory before any KYC-passing user can move money or join an SPV." },
  { id: "alloy", name: "Alloy", vendor: "Alloy", category: "compliance", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Identity decisioning"], tier: "enterprise", docsUrl: "https://alloy.com/developers" },

  // Cap-table / SPV
  { id: "carta", name: "Carta", vendor: "Carta", category: "captable", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["captable.read"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Cap-table sync","SPV admin"], recommended: true, tier: "growth", docsUrl: "https://carta.com",
    description: "Pull a startup's cap-table to verify ownership and offer SPV co-investment." },
  { id: "angellist", name: "AngelList Venture", vendor: "AngelList", category: "captable", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Roll-up vehicles","Syndicates"], tier: "growth", docsUrl: "https://angellist.com",
    description: "Power Zynk Syndicates — investors club & co-invest deals." },
  { id: "pulley", name: "Pulley", vendor: "Pulley", category: "captable", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Cap-table alternative"], tier: "growth", docsUrl: "https://pulley.com" },

  // Events & ticketing
  { id: "luma", name: "Lu.ma", vendor: "Luma", category: "events", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["event.guest.registered"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Event RSVPs","Native networking events"], recommended: true, tier: "growth", docsUrl: "https://docs.lu.ma",
    description: "Sync RSVPs to founder/investor meetups directly into Zynk profiles." },
  { id: "eventbrite", name: "Eventbrite", vendor: "Eventbrite", category: "events", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["event_management"], webhooks: ["order.placed"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Paid event ticketing"], tier: "growth", docsUrl: "https://www.eventbrite.com/platform/api" },
  { id: "hopin", name: "Hopin / RingCentral Events", vendor: "RingCentral", category: "events", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Virtual conferences"], tier: "enterprise", docsUrl: "https://hopin.com" },

  // Maps & geo
  { id: "mapbox", name: "Mapbox", vendor: "Mapbox", category: "maps", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 14, events30d: 124_000, errors30d: 0, lastSync: "live",
    features: ["City discovery","Founder map","Geocoding"], tier: "core", docsUrl: "https://docs.mapbox.com",
    description: "Powers 'founders near me', city pages, and meetup heat-maps." },
  { id: "google_maps", name: "Google Maps Platform", vendor: "Google", category: "maps", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Address autocomplete","Places"], tier: "growth", docsUrl: "https://developers.google.com/maps" },

  // Translation / Speech
  { id: "deepl", name: "DeepL", vendor: "DeepL", category: "translate", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Profile translation","Inbox auto-translate"], tier: "growth", docsUrl: "https://www.deepl.com/docs-api",
    description: "Auto-translate profiles & messages between EN / AR / HI / ES — key for cross-border matching." },
  { id: "google_translate", name: "Google Translate", vendor: "Google", category: "translate", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0, features: ["Wider language support"], tier: "growth", docsUrl: "https://cloud.google.com/translate" },
  { id: "deepgram", name: "Deepgram", vendor: "Deepgram", category: "speech", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Session transcription","Subtitles"], tier: "growth", docsUrl: "https://developers.deepgram.com",
    description: "Transcribe expert sessions for searchable knowledge & accessibility." },
  { id: "assemblyai", name: "AssemblyAI", vendor: "AssemblyAI", category: "speech", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["transcript.completed"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Auto-chapters","Sentiment"], tier: "growth", docsUrl: "https://www.assemblyai.com/docs" },

  // Social publishing
  { id: "linkedin_publish", name: "LinkedIn Cross-post", vendor: "LinkedIn", category: "social", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["w_member_social"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Auto cross-post","Backlink to Zynk"], recommended: true, tier: "growth", docsUrl: "https://learn.microsoft.com/linkedin/marketing",
    description: "Cross-post a Zynk post to LinkedIn with one click — drives viral acquisition." },
  { id: "x_publish", name: "X (Twitter)", vendor: "X", category: "social", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["tweet.write"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Auto-share","Thread import"], tier: "growth", docsUrl: "https://developer.twitter.com" },
  { id: "buffer", name: "Buffer", vendor: "Buffer", category: "social", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Schedule cross-posts"], tier: "growth", docsUrl: "https://buffer.com/developers" },

  // Workflow / automation
  { id: "zapier", name: "Zapier", vendor: "Zapier", category: "automation", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: ["any"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["No-code automations","6k+ apps"], recommended: true, tier: "growth", docsUrl: "https://platform.zapier.com",
    description: "Public Zynk Zapier app → users connect Zynk events to anything." },
  { id: "make", name: "Make (Integromat)", vendor: "Make", category: "automation", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0, features: ["Visual workflows"], tier: "growth", docsUrl: "https://www.make.com/en/help/apps" },
  { id: "n8n", name: "n8n", vendor: "n8n", category: "automation", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Self-hosted automations"], tier: "growth", docsUrl: "https://docs.n8n.io" },
  { id: "inngest", name: "Inngest", vendor: "Inngest", category: "automation", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 8, events30d: 412_000, errors30d: 18, lastSync: "live",
    features: ["Background jobs","Cron","Step functions"], tier: "core", docsUrl: "https://www.inngest.com/docs",
    description: "Powers digests, reminders, AI batch jobs, and SLA timers." },

  // Data warehouse
  { id: "snowflake", name: "Snowflake", vendor: "Snowflake", category: "data", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["BI export","Reverse-ETL"], tier: "enterprise", docsUrl: "https://docs.snowflake.com" },
  { id: "bigquery", name: "BigQuery", vendor: "Google", category: "data", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: ["bigquery"], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Analytics warehouse"], tier: "enterprise", docsUrl: "https://cloud.google.com/bigquery" },
  { id: "databricks", name: "Databricks", vendor: "Databricks", category: "data", authMethod: "oauth2", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0, features: ["Lakehouse / ML"], tier: "enterprise", docsUrl: "https://docs.databricks.com" },

  // Search
  { id: "algolia", name: "Algolia", vendor: "Algolia", category: "search", authMethod: "apikey", status: "connected", env: "production",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 27, events30d: 14_200_000, errors30d: 4, lastSync: "live",
    features: ["People search","Company search","Skill autocomplete"], recommended: true, tier: "core", docsUrl: "https://www.algolia.com/doc",
    description: "Sub-50ms search — critical for the discover surface that competes with LinkedIn search." },
  { id: "meilisearch", name: "Meilisearch", vendor: "Meili", category: "search", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["OSS search alternative"], tier: "growth", docsUrl: "https://docs.meilisearch.com" },
  { id: "typesense", name: "Typesense", vendor: "Typesense", category: "search", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "—", usagePct: 0, events30d: 0, errors30d: 0, features: ["OSS search"], tier: "growth", docsUrl: "https://typesense.org/docs" },

  // Background checks
  { id: "checkr", name: "Checkr", vendor: "Checkr", category: "background", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: ["report.completed"], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Background check for verified mentors"], tier: "growth", docsUrl: "https://docs.checkr.com",
    description: "Optional 'Background Verified' badge for paid mentors." },

  // Marketing automation
  { id: "customer_io", name: "Customer.io", vendor: "Customer.io", category: "marketing", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Lifecycle campaigns","Behavioural email"], tier: "growth", docsUrl: "https://www.customer.io/docs" },
  { id: "braze", name: "Braze", vendor: "Braze", category: "marketing", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0,
    features: ["Cross-channel orchestration"], tier: "enterprise", docsUrl: "https://www.braze.com/docs" },
  { id: "iterable", name: "Iterable", vendor: "Iterable", category: "marketing", authMethod: "apikey", status: "available", env: "sandbox",
    scopes: [], webhooks: [], rateLimit: "tier", usagePct: 0, events30d: 0, errors30d: 0, features: ["Email + push journeys"], tier: "enterprise", docsUrl: "https://api.iterable.com" },
];

// Outgoing webhook events (Zynk → external)
const webhookEvents = [
  { name: "user.created",            description: "New user signed up" },
  { name: "user.verified",           description: "KYC / email verified" },
  { name: "match.created",           description: "Two users matched" },
  { name: "match.intro_requested",   description: "User requested an intro" },
  { name: "session.booked",          description: "Expert session booked" },
  { name: "session.completed",       description: "Session ended (with rating)" },
  { name: "post.published",          description: "User published a post" },
  { name: "subscription.activated",  description: "Pro plan started" },
  { name: "subscription.cancelled",  description: "Plan cancelled" },
  { name: "investor.commit",         description: "Investor committed to SPV" },
  { name: "deal.closed",             description: "SPV closed" },
  { name: "boost.purchased",         description: "Profile/post boost bought" },
];

// Audit log entries
const auditLog = [
  { time: "2 min ago",  who: "system",         action: "Token refreshed", target: "HubSpot",   tone: "info" },
  { time: "12 min ago", who: "ada@zynk.ing",   action: "Connected",       target: "Calendly",  tone: "good" },
  { time: "1 h ago",    who: "system",         action: "Webhook delivered (2.1k events)", target: "Zapier",    tone: "info" },
  { time: "3 h ago",    who: "system",         action: "Quota at 80%",    target: "OpenAI",    tone: "warn" },
  { time: "yesterday",  who: "ada@zynk.ing",   action: "Rotated API key", target: "Resend",    tone: "good" },
  { time: "yesterday",  who: "system",         action: "OAuth expired",   target: "Salesforce", tone: "bad" },
];

const toneCls = (t: string) =>
  t === "good" ? "text-emerald-500"
  : t === "warn" ? "text-amber-500"
  : t === "bad" ? "text-rose-500"
  : "text-muted-foreground";

export function Integrations() {
  const [items, setItems] = useState<Integration[]>(seed);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAuth, setFilterAuth] = useState<string>("all");
  const [editing, setEditing] = useState<Integration | null>(null);

  const filtered = useMemo(() => items.filter((i) => {
    if (filterCat !== "all" && i.category !== filterCat) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterAuth !== "all" && i.authMethod !== filterAuth) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![i.name, i.vendor, i.description, ...i.features].some((s) => s.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [items, search, filterCat, filterStatus, filterAuth]);

  const stats = useMemo(() => {
    const connected = items.filter((i) => i.status === "connected").length;
    const attention = items.filter((i) => i.status === "needs_attention").length;
    const events = items.reduce((s, i) => s + i.events30d, 0);
    const errors = items.reduce((s, i) => s + i.errors30d, 0);
    return { connected, available: items.length, attention, events, errors };
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<Category, Integration[]>();
    filtered.forEach((i) => {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    });
    return Array.from(map.entries()).sort((a, b) => cat[a[0]].label.localeCompare(cat[b[0]].label));
  }, [filtered]);

  const toggle = (id: string, next: boolean) => {
    setItems((arr) => arr.map((i) => i.id === id
      ? { ...i, status: next ? "connected" : "available", lastSync: next ? "just now" : i.lastSync }
      : i));
    toast.success(`${items.find((i) => i.id === id)?.name} ${next ? "connected" : "disconnected"}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Third-party Integrations</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Third-party Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Every external service Zynk talks to — auth, CRM, calendar, video, AI, KYC, cap-table, payments, and the open marketplace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1"><Webhook className="h-4 w-4" />Webhook log</Button>
          <Button size="sm" variant="outline" className="gap-1"><KeyRound className="h-4 w-4" />API keys</Button>
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Request integration</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Connected",      value: stats.connected,                icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "In catalog",     value: stats.available,                icon: Globe,        tone: "text-blue-500" },
          { label: "Need attention", value: stats.attention,                icon: AlertTriangle,tone: "text-amber-500" },
          { label: "Events / 30d",   value: stats.events.toLocaleString(),  icon: Activity,     tone: "text-violet-500" },
          { label: "Errors / 30d",   value: stats.errors.toLocaleString(),  icon: ShieldAlert,  tone: "text-rose-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-muted p-2"><s.icon className={`h-4 w-4 ${s.tone}`} /></div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-base font-semibold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="connected">Connected ({stats.connected})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">Public API &amp; OAuth apps</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        {/* ── Catalog ─────────────────────────────────────── */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search vendor, feature, scope…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.entries(cat).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="needs_attention">Needs attention</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAuth} onValueChange={setFilterAuth}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All auth</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="apikey">API key</SelectItem>
                    <SelectItem value="saml">SAML</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="scim">SCIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {grouped.map(([catKey, list]) => {
                const meta = cat[catKey];
                return (
                  <section key={catKey}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${meta.cls}`}><meta.icon className="h-3.5 w-3.5" /></div>
                      <h3 className="text-sm font-semibold">{meta.label}</h3>
                      <span className="text-xs text-muted-foreground">{list.length}</span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {list.map((i) => (
                        <IntegrationCard key={i.id} item={i} onToggle={toggle} onEdit={() => setEditing(i)} />
                      ))}
                    </div>
                  </section>
                );
              })}
              {grouped.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">No integrations match your filters.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Connected ───────────────────────────────────── */}
        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live integrations</CardTitle>
              <CardDescription>Quota usage, error rate and latest sync. Click any to open settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.filter((i) => i.status === "connected" || i.status === "needs_attention").map((i) => {
                const Icon = cat[i.category].icon;
                return (
                  <div key={i.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cat[i.category].cls}`}><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{i.name}</span>
                            <Badge variant="outline" className={statusStyle[i.status]}>{statusLabel[i.status]}</Badge>
                            <Badge variant="outline" className="text-[10px]">{i.env}</Badge>
                            <Badge variant="outline" className="text-[10px]">{i.authMethod}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{i.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(i)}><Settings2 className="h-3.5 w-3.5" /></Button>
                        <Switch checked={i.status === "connected"} onCheckedChange={(v) => toggle(i.id, v)} />
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid gap-3 md:grid-cols-4">
                      <Stat label="Events / 30d" value={i.events30d.toLocaleString()} />
                      <Stat label="Errors / 30d" value={i.errors30d.toLocaleString()} good={i.errors30d === 0} bad={i.errors30d > 100} />
                      <Stat label="Last sync"    value={i.lastSync ?? "—"} />
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Quota</div>
                        <Progress value={i.usagePct} className="h-1.5" />
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{i.usagePct}% used · {i.rateLimit}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {i.features.map((f) => (<Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Webhooks ────────────────────────────────────── */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Outgoing events Zynk emits</CardTitle>
              <CardDescription>Subscribe any external system (Zapier, Make, custom) to these events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {webhookEvents.map((e) => (
                <div key={e.name} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    <code className="font-mono text-xs">{e.name}</code>
                    <span className="text-xs text-muted-foreground truncate">{e.description}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => { navigator.clipboard.writeText(e.name); toast("Event name copied"); }}>
                    <Copy className="h-3 w-3" />Copy
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook endpoints</CardTitle>
              <CardDescription>Add destination URLs and pick which events to forward.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { url: "https://hooks.zapier.com/hooks/catch/1234/abcd",     events: ["match.created","session.booked"],          status: "ok",  delivered: 12_840 },
                { url: "https://hooks.slack.com/services/T0.../B0.../xxx",   events: ["investor.commit","deal.closed"],            status: "ok",  delivered: 412 },
                { url: "https://api.acme.com/zynk/ingest",                    events: ["user.created","user.verified"],            status: "warn", delivered: 38_120 },
              ].map((w) => (
                <div key={w.url} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="truncate text-xs">{w.url}</code>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={w.status === "ok" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                        {w.status === "ok" ? "Healthy" : "Retrying"}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.events.map((e) => (<Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>))}
                    <span className="ml-auto text-[11px] text-muted-foreground">{w.delivered.toLocaleString()} delivered / 30d</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" />Add endpoint</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Public API ──────────────────────────────────── */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zynk Public API</CardTitle>
              <CardDescription>
                Let third-party builders make Zynk's data and matching available in their own apps — same model LinkedIn never opened.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <RowSwitch label="REST API"          checked={true}  hint="api.zynk.ing/v1" onChange={() => {}} />
                <RowSwitch label="GraphQL API"        checked={false} hint="api.zynk.ing/graphql"           onChange={() => {}} />
                <RowSwitch label="Realtime (WebSocket)" checked={true} hint="ws.zynk.ing"                    onChange={() => {}} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">OAuth 2.0 + PKCE — registered partner apps</Label>
                {[
                  { name: "Founders OS",     scopes: ["profile:read","matches:read"], users: 4_120, status: "live" },
                  { name: "VC Pulse",        scopes: ["profile:read","investor:read","deals:read"], users: 812, status: "live" },
                  { name: "DemoDay Builder", scopes: ["events:read","posts:write"], users: 318, status: "review" },
                ].map((a) => (
                  <div key={a.name} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{a.name}</span>
                      <Badge variant="outline" className={a.status === "live" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>{a.status}</Badge>
                      <span className="text-[11px] text-muted-foreground">{a.users.toLocaleString()} authorised users</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {a.scopes.map((s) => (<Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" />Register OAuth app</Button>
              </div>
              <Separator />
              <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
                Tip: ship a <code className="text-foreground">@zynk/sdk</code> npm package + Zapier app together to seed the developer ecosystem.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" />Embeds & SDKs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <RowSwitch label="Profile widget (embed Zynk profile on personal site)" checked={true} onChange={() => {}} />
              <RowSwitch label="Booking widget (book mentor session inline)"          checked={true} onChange={() => {}} />
              <RowSwitch label="WordPress / Webflow plugin"                            checked={false} onChange={() => {}} />
              <RowSwitch label="iOS / Android Share Extension"                         checked={true} onChange={() => {}} />
              <RowSwitch label="Browser extension (Chrome / Edge / Safari)"             checked={false} hint="Imports LinkedIn profile via in-page action" onChange={() => {}} />
              <RowSwitch label="Slack / Teams unfurl"                                   checked={true} onChange={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Audit ───────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" />Audit log</CardTitle>
              <CardDescription>Every connect, disconnect, key rotation and quota event. Exportable as CSV.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {auditLog.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md px-2 py-2 text-xs hover:bg-muted/40">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="w-24 text-muted-foreground">{e.time}</span>
                    <span className={`w-32 ${toneCls(e.tone)}`}>{e.action}</span>
                    <span className="font-medium">{e.target}</span>
                    <span className="ml-auto text-muted-foreground">{e.who}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Edit dialog ─────────────────────────────────────── */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{editing?.name}
              {editing && <Badge variant="outline" className={statusStyle[editing.status]}>{statusLabel[editing.status]}</Badge>}
            </DialogTitle>
            <DialogDescription>{editing?.description}</DialogDescription>
          </DialogHeader>
          {editing && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><Label className="text-xs">Vendor</Label><Input value={editing.vendor} readOnly className="h-8" /></div>
                  <div><Label className="text-xs">Auth method</Label><Input value={editing.authMethod} readOnly className="h-8 font-mono" /></div>
                  <div><Label className="text-xs">Environment</Label>
                    <Select value={editing.env} onValueChange={(v) => setEditing({ ...editing, env: v as Env })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="sandbox">Sandbox</SelectItem><SelectItem value="production">Production</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Rate limit</Label><Input value={editing.rateLimit} readOnly className="h-8 font-mono" /></div>
                </div>

                {(editing.authMethod === "apikey" || editing.authMethod === "basic") && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><Label className="text-xs">API Key (live)</Label><Input type="password" placeholder="••••" className="h-8 font-mono" /></div>
                    <div><Label className="text-xs">API Key (test)</Label><Input type="password" placeholder="••••" className="h-8 font-mono" /></div>
                  </div>
                )}

                {editing.scopes.length > 0 && (
                  <div>
                    <Label className="text-xs">Granted scopes</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {editing.scopes.map((s) => (<Badge key={s} variant="secondary" className="font-mono text-[10px]">{s}</Badge>))}
                    </div>
                  </div>
                )}

                {editing.webhooks.length > 0 && (
                  <div>
                    <Label className="text-xs">Webhook events received</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {editing.webhooks.map((w) => (<Badge key={w} variant="outline" className="font-mono text-[10px]">{w}</Badge>))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Powers Zynk features</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {editing.features.map((f) => (<Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>))}
                  </div>
                </div>

                <Separator />
                <div className="grid gap-3 md:grid-cols-3">
                  <Stat label="Events / 30d" value={editing.events30d.toLocaleString()} />
                  <Stat label="Errors / 30d" value={editing.errors30d.toLocaleString()} good={editing.errors30d === 0} />
                  <Stat label="Quota used"   value={`${editing.usagePct}%`} />
                </div>

                <a href={editing.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" />Open vendor docs
                </a>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Close</Button>
            <Button onClick={() => { setEditing(null); toast.success("Integration saved"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntegrationCard({ item, onToggle, onEdit }: { item: Integration; onToggle: (id: string, v: boolean) => void; onEdit: () => void }) {
  const Icon = cat[item.category].icon;
  return (
    <div className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${cat[item.category].cls}`}><Icon className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium truncate">{item.name}</span>
            {item.recommended && <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-500 text-[9px] gap-0.5"><Sparkles className="h-2.5 w-2.5" />Rec</Badge>}
            <Badge variant="outline" className={`${statusStyle[item.status]} text-[9px]`}>{statusLabel[item.status]}</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">{item.vendor} · {item.authMethod}</div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Switch checked={item.status === "connected"} onCheckedChange={(v) => onToggle(item.id, v)} />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit}><Settings2 className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${good ? "text-emerald-500" : bad ? "text-rose-500" : ""}`}>{value}</div>
    </div>
  );
}

function RowSwitch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
