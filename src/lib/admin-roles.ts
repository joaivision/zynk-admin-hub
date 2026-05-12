import { adminMenu } from "./admin-menu";

export type AccessLevel = "edit" | "view" | "none";

export type AdminRoleId =
  | "super_admin"
  | "ciso"
  | "compliance_dpo"
  | "finance"
  | "trust_safety"
  | "support_lead"
  | "support_t2"
  | "support_t1"
  | "growth"
  | "data_engineer"
  | "auditor";

export type AdminRole = {
  id: AdminRoleId;
  name: string;
  tier: "Tier 0" | "Tier 1" | "Tier 2" | "Tier 3";
  description: string;
  /** Permission map keyed by menu slug (group slug OR item slug). Group-level perm cascades to children unless overridden. */
  perms: Partial<Record<string, AccessLevel>>;
};

const allEditGroups = (): Partial<Record<string, AccessLevel>> => {
  const out: Partial<Record<string, AccessLevel>> = { "": "edit" };
  for (const g of adminMenu) out[g.slug] = "edit";
  return out;
};

export const ADMIN_ROLES: Record<AdminRoleId, AdminRole> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    tier: "Tier 0",
    description: "Break-glass — full edit on every module. CEO + CISO only.",
    perms: allEditGroups(),
  },
  ciso: {
    id: "ciso",
    name: "CISO / Security",
    tier: "Tier 0",
    description: "Security policy, audit, incident response.",
    perms: {
      "": "edit",
      admins: "edit",
      "settings/feature-flags": "edit",
      "settings/abuse-rules": "edit",
      "settings/audit-config": "edit",
      "settings/secrets": "view",
      "settings/integrations": "view",
      "settings/partner-apps": "view",
      "settings/maintenance": "edit",
      "users/list": "view",
      "users/detail": "view",
      kyc: "view",
      "data-room/audit": "view",
      "data-room/access": "edit",
      "data-room/drm": "edit",
    },
  },
  compliance_dpo: {
    id: "compliance_dpo",
    name: "Compliance / DPO",
    tier: "Tier 1",
    description: "GDPR / PDPL, KYC oversight, data subject requests.",
    perms: {
      "": "view",
      kyc: "edit",
      users: "view",
      "users/notes": "edit",
      "settings/legal": "edit",
      "settings/consent": "edit",
      "admins/logs": "view",
      "data-room/audit": "view",
    },
  },
  finance: {
    id: "finance",
    name: "Finance Operator",
    tier: "Tier 1",
    description: "Refunds, payouts, invoices, plan pricing.",
    perms: {
      "": "view",
      plans: "edit",
      "settings/payment-gateways": "edit",
      "settings/payment-analytics": "view",
      "mentorship/payouts": "edit",
      "mentorship/pricing": "edit",
      credits: "edit",
      "marketplace/commission": "edit",
      users: "view",
    },
  },
  trust_safety: {
    id: "trust_safety",
    name: "Trust & Safety",
    tier: "Tier 1",
    description: "Suspensions, content review, fraud, abuse rules.",
    perms: {
      "": "view",
      users: "edit",
      kyc: "edit",
      "settings/abuse-rules": "edit",
      "mentorship/reviews": "edit",
      "marketplace/orders": "edit",
      matching: "view",
      "ai/moderation": "edit",
    },
  },
  support_lead: {
    id: "support_lead",
    name: "Head of Support",
    tier: "Tier 2",
    description: "Manage support team, escalations, refunds < $5k.",
    perms: {
      "": "view",
      users: "edit",
      kyc: "view",
      plans: "view",
      "plans/subscriptions": "edit",
      mentorship: "view",
      "mentorship/bookings": "edit",
      events: "view",
    },
  },
  support_t2: {
    id: "support_t2",
    name: "Support Tier 2",
    tier: "Tier 2",
    description: "PII view (redacted), refunds < $500.",
    perms: {
      "": "view",
      "users/list": "view",
      "users/search": "view",
      "users/detail": "view",
      "users/status": "edit",
      "users/suspend": "edit",
      "users/reset-password": "edit",
      "users/notes": "edit",
      "kyc/queue": "view",
      "plans/subscriptions": "view",
      "mentorship/bookings": "edit",
    },
  },
  support_t1: {
    id: "support_t1",
    name: "Support Tier 1",
    tier: "Tier 3",
    description: "Read-only, scripted actions only.",
    perms: {
      "": "view",
      "users/list": "view",
      "users/search": "view",
      "users/detail": "view",
      "kyc/queue": "view",
      "plans/subscriptions": "view",
    },
  },
  growth: {
    id: "growth",
    name: "Growth / Marketing",
    tier: "Tier 2",
    description: "Campaigns, promos, SEO, analytics (no PII).",
    perms: {
      "": "view",
      "settings/seo": "edit",
      "settings/sitemap": "edit",
      "settings/platform-branding": "edit",
      credits: "edit",
      "plans/promo-analytics": "view",
      "plans/promos": "edit",
      "matching/analytics": "view",
      "events/analytics": "view",
      events: "edit",
    },
  },
  data_engineer: {
    id: "data_engineer",
    name: "Data Engineer (read)",
    tier: "Tier 2",
    description: "Warehouse read, analytics — no production write.",
    perms: {
      "": "view",
      "settings/payment-analytics": "view",
      "matching/analytics": "view",
      "events/analytics": "view",
      "talent/analytics": "view",
      "data-room/analytics": "view",
      "ai/usage": "view",
      "plans/promo-analytics": "view",
    },
  },
  auditor: {
    id: "auditor",
    name: "External Auditor",
    tier: "Tier 3",
    description: "Read-only, watermarked, time-boxed.",
    perms: {
      "": "view",
      "admins/logs": "view",
      "data-room/audit": "view",
      "settings/audit-config": "view",
      "settings/legal": "view",
    },
  },
};

/** Resolve effective access for a slug under a given role. */
export function getAccess(roleId: AdminRoleId, slug: string): AccessLevel {
  const role = ADMIN_ROLES[roleId];
  if (!role) return "none";
  // exact match
  if (role.perms[slug]) return role.perms[slug]!;
  // group-level cascade (e.g. slug "users/list" → group "users")
  const groupSlug = slug.includes("/") ? slug.split("/")[0] : slug;
  if (role.perms[groupSlug]) return role.perms[groupSlug]!;
  return "none";
}

/** Filter the admin menu to only items the role can at least view. */
export function filterMenuForRole(roleId: AdminRoleId) {
  return adminMenu
    .map((g) => {
      const groupAccess = getAccess(roleId, g.slug);
      if (!g.items) {
        return groupAccess !== "none" ? g : null;
      }
      const items = g.items.filter((i) => getAccess(roleId, i.slug) !== "none");
      if (items.length === 0 && groupAccess === "none") return null;
      return { ...g, items };
    })
    .filter(Boolean) as typeof adminMenu;
}
