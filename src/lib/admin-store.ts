import { useEffect, useState, useCallback } from "react";
import type { AdminRoleId } from "./admin-roles";

export type ApprovalStep = {
  step: "manager" | "role_owner" | "security" | "compliance" | "break_glass";
  label: string;
  required: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  reason?: string;
};

export type AdminRequest = {
  id: string;
  name: string;
  email: string;
  employmentType: "employee" | "contractor" | "vendor" | "auditor";
  manager: string;
  role: AdminRoleId;
  scope: "single" | "multi" | "global";
  regions: string;
  duration: string;
  justification: string;
  requestedBy: string;
  requestedAt: string;
  risk: "Low" | "Medium" | "High";
  status: "pending" | "approved" | "rejected" | "expired";
  approvals: ApprovalStep[];
};

export type ActiveAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRoleId;
  scope: string;
  region: string;
  mfa: string;
  since: string;
  lastActive: string;
  status: "active" | "suspended" | "revoked";
};

export type AuditEvent = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  reason?: string;
};

const REQUESTS_KEY = "zynk.admin.requests";
const ADMINS_KEY = "zynk.admin.active";
const AUDIT_KEY = "zynk.admin.audit";

const SEED_REQUESTS: AdminRequest[] = [
  {
    id: "req_001", name: "Aisha Rahman", email: "aisha@zynk.ing",
    employmentType: "employee", manager: "noor@zynk.ing", role: "finance",
    scope: "multi", regions: "MENA", duration: "permanent",
    justification: "Lead refunds & payouts for MENA region.",
    requestedBy: "noor@zynk.ing", requestedAt: new Date(Date.now() - 86400000).toISOString(),
    risk: "Medium", status: "pending",
    approvals: [
      { step: "manager", label: "Manager sign-off", required: true, approvedBy: "noor@zynk.ing", approvedAt: new Date(Date.now() - 80000000).toISOString() },
      { step: "role_owner", label: "Role owner (Finance)", required: true, approvedBy: "cfo@zynk.ing", approvedAt: new Date(Date.now() - 70000000).toISOString() },
      { step: "security", label: "Security (CISO)", required: true },
    ],
  },
  {
    id: "req_002", name: "David Chen", email: "david@zynk.ing",
    employmentType: "employee", manager: "sara@zynk.ing", role: "trust_safety",
    scope: "global", regions: "Global", duration: "permanent",
    justification: "Lead T&S team — needs PII view + suspensions.",
    requestedBy: "sara@zynk.ing", requestedAt: new Date(Date.now() - 50000000).toISOString(),
    risk: "High", status: "pending",
    approvals: [
      { step: "manager", label: "Manager sign-off", required: true, approvedBy: "sara@zynk.ing", approvedAt: new Date(Date.now() - 40000000).toISOString() },
      { step: "role_owner", label: "Role owner (T&S)", required: true },
      { step: "security", label: "Security (CISO)", required: true },
      { step: "compliance", label: "Compliance (DPO)", required: true },
    ],
  },
];

const SEED_ADMINS: ActiveAdmin[] = [
  { id: "adm_001", name: "Noor Al-Hashimi", email: "noor@zynk.ing", role: "super_admin", scope: "Global", region: "🇦🇪 UAE", mfa: "Hardware key", since: "Jan 2024", lastActive: "2 min ago", status: "active" },
  { id: "adm_002", name: "Sara Kim", email: "sara@zynk.ing", role: "ciso", scope: "Global · Break-glass", region: "🇸🇬 SG", mfa: "Hardware key + Biometric", since: "Mar 2024", lastActive: "12 min ago", status: "active" },
  { id: "adm_003", name: "Kim Park", email: "kim@zynk.ing", role: "support_lead", scope: "APAC", region: "🇰🇷 KR", mfa: "TOTP + Backup", since: "Jun 2024", lastActive: "1h ago", status: "active" },
  { id: "adm_004", name: "Fatima Zahra", email: "fatima@zynk.ing", role: "compliance_dpo", scope: "EU · GDPR DPO", region: "🇫🇷 FR", mfa: "Hardware key", since: "Nov 2024", lastActive: "Yesterday", status: "active" },
];

function load<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  // notify listeners in same tab
  window.dispatchEvent(new CustomEvent(`zynk-store:${key}`));
}

function useStore<T>(key: string, seed: T): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => load(key, seed));
  useEffect(() => {
    const handler = () => setState(load(key, seed));
    window.addEventListener(`zynk-store:${key}`, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(`zynk-store:${key}`, handler);
      window.removeEventListener("storage", handler);
    };
  }, [key, seed]);
  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      save(key, next);
      return next;
    });
  }, [key]);
  return [state, update];
}

export function useAdminRequests() { return useStore<AdminRequest[]>(REQUESTS_KEY, SEED_REQUESTS); }
export function useActiveAdmins() { return useStore<ActiveAdmin[]>(ADMINS_KEY, SEED_ADMINS); }
export function useAuditLog() { return useStore<AuditEvent[]>(AUDIT_KEY, []); }

export function logAudit(actor: string, action: string, target: string, reason?: string) {
  const current = load<AuditEvent[]>(AUDIT_KEY, []);
  const event: AuditEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(), actor, action, target, reason,
  };
  save(AUDIT_KEY, [event, ...current].slice(0, 500));
}
