import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ADMIN_ROLES, getAccess, type AccessLevel, type AdminRoleId } from "./admin-roles";

type Ctx = {
  roleId: AdminRoleId;
  setRoleId: (id: AdminRoleId) => void;
  email: string;
  access: (slug: string) => AccessLevel;
  can: (slug: string, level?: AccessLevel) => boolean;
};

const AdminAuthContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "zynk.admin.role";

const ROLE_EMAIL: Record<AdminRoleId, string> = {
  super_admin: "noor@zynk.ing",
  ciso: "sara@zynk.ing",
  compliance_dpo: "fatima@zynk.ing",
  finance: "aisha@zynk.ing",
  trust_safety: "david@zynk.ing",
  support_lead: "kim@zynk.ing",
  support_t2: "ravi@zynk.ing",
  support_t1: "mei@zynk.ing",
  growth: "leo@zynk.ing",
  data_engineer: "yusuf@zynk.ing",
  auditor: "audit@deloitte.com",
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [roleId, setRoleIdState] = useState<AdminRoleId>("super_admin");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AdminRoleId | null;
      if (saved && ADMIN_ROLES[saved]) setRoleIdState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setRoleId = useCallback((id: AdminRoleId) => {
    setRoleIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    roleId,
    setRoleId,
    email: ROLE_EMAIL[roleId],
    access: (slug: string) => getAccess(roleId, slug),
    can: (slug: string, level: AccessLevel = "view") => {
      const a = getAccess(roleId, slug);
      if (level === "edit") return a === "edit";
      return a === "view" || a === "edit";
    },
  }), [roleId, setRoleId]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
