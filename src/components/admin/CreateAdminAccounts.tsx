import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserPlus, ShieldCheck, Clock, Mail, KeyRound, AlertTriangle, Globe,
  CheckCircle2, XCircle, Hourglass, Eye, Fingerprint, CheckCheck, RotateCcw, Ban,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { ADMIN_ROLES, type AdminRoleId } from "@/lib/admin-roles";
import { useAdminRequests, useActiveAdmins, useAuditLog, logAudit, type AdminRequest, type ApprovalStep } from "@/lib/admin-store";

const APPROVER_ROLE: Record<ApprovalStep["step"], AdminRoleId[]> = {
  manager: ["super_admin", "support_lead", "ciso"],
  role_owner: ["super_admin", "ciso", "finance", "trust_safety", "compliance_dpo"],
  security: ["super_admin", "ciso"],
  compliance: ["super_admin", "compliance_dpo"],
  break_glass: ["super_admin"],
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function CreateAdminAccounts() {
  const { roleId, email } = useAdminAuth();
  const [requests, setRequests] = useAdminRequests();
  const [admins, setAdmins] = useActiveAdmins();
  const [audit] = useAuditLog();
  const [tab, setTab] = useState("request");

  // form state
  const [form, setForm] = useState({
    name: "", email: "", employmentType: "employee" as AdminRequest["employmentType"],
    manager: "", role: "support_t2" as AdminRoleId, scope: "single" as AdminRequest["scope"],
    regions: "", duration: "permanent", justification: "",
  });

  const pending = useMemo(() => requests.filter(r => r.status === "pending"), [requests]);

  function resetForm() {
    setForm({ name: "", email: "", employmentType: "employee", manager: "", role: "support_t2", scope: "single", regions: "", duration: "permanent", justification: "" });
  }

  function submitRequest() {
    if (!form.name || !form.email || !form.justification) {
      toast.error("Name, email, and justification are required");
      return;
    }
    if (form.justification.length < 20) {
      toast.error("Justification must be at least 20 characters (audited)");
      return;
    }
    const role = ADMIN_ROLES[form.role];
    const risk: AdminRequest["risk"] =
      role.tier === "Tier 0" ? "High" : role.tier === "Tier 1" || form.scope === "global" ? "Medium" : "Low";

    const approvals: ApprovalStep[] = [
      { step: "manager", label: "Manager sign-off", required: true },
      { step: "role_owner", label: `Role owner (${role.name})`, required: true },
    ];
    if (risk === "High" || form.scope === "global") {
      approvals.push({ step: "security", label: "Security (CISO)", required: true });
    }
    if (form.role === "compliance_dpo" || /eu|fr|de|sa|ksa/i.test(form.regions)) {
      approvals.push({ step: "compliance", label: "Compliance (DPO)", required: true });
    }
    if (form.role === "super_admin") {
      approvals.push({ step: "break_glass", label: "Break-glass (2 of 3 directors)", required: true });
    }

    const newReq: AdminRequest = {
      id: `req_${Date.now().toString(36)}`,
      ...form,
      requestedBy: email,
      requestedAt: new Date().toISOString(),
      risk,
      status: "pending",
      approvals,
    };
    setRequests((prev) => [newReq, ...prev]);
    logAudit(email, "admin.request.created", `${form.email} as ${role.name}`, form.justification);
    toast.success(`Request submitted — ${approvals.length} approvals required`);
    resetForm();
    setTab("pending");
  }

  function actOnStep(reqId: string, stepIdx: number, action: "approve" | "reject", reason?: string) {
    setRequests((prev) => prev.map((r) => {
      if (r.id !== reqId) return r;
      const approvals = r.approvals.map((s, i) => {
        if (i !== stepIdx) return s;
        if (action === "approve") return { ...s, approvedBy: email, approvedAt: new Date().toISOString(), rejectedBy: undefined, rejectedAt: undefined, reason };
        return { ...s, rejectedBy: email, rejectedAt: new Date().toISOString(), reason, approvedBy: undefined, approvedAt: undefined };
      });
      let status: AdminRequest["status"] = r.status;
      if (action === "reject") status = "rejected";
      else if (approvals.every((s) => !s.required || s.approvedBy)) status = "approved";
      return { ...r, approvals, status };
    }));

    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    const step = req.approvals[stepIdx];
    logAudit(email, `admin.request.${action}.${step.step}`, `${req.email}`, reason);

    // if just approved → check if request fully approved → provision admin
    if (action === "approve") {
      const updated = requests.map((r) => r.id === reqId ? {
        ...r, approvals: r.approvals.map((s, i) => i === stepIdx ? { ...s, approvedBy: email, approvedAt: new Date().toISOString() } : s),
      } : r).find(r => r.id === reqId)!;
      const fullyApproved = updated.approvals.every((s) => !s.required || s.approvedBy);
      if (fullyApproved) {
        provisionAdmin(updated);
        toast.success(`${updated.name} provisioned with role ${ADMIN_ROLES[updated.role].name}`);
      } else {
        toast.success(`Approved as ${step.label}`);
      }
    } else {
      toast.error(`Rejected at ${step.label}`);
    }
  }

  function provisionAdmin(req: AdminRequest) {
    setAdmins((prev) => [...prev, {
      id: `adm_${Date.now().toString(36)}`,
      name: req.name, email: req.email, role: req.role,
      scope: `${req.scope === "global" ? "Global" : req.regions || req.scope}`,
      region: req.regions || "—", mfa: "Hardware key (pending enrollment)",
      since: new Date().toLocaleDateString("en", { month: "short", year: "numeric" }),
      lastActive: "Never", status: "active",
    }]);
    logAudit(email, "admin.provisioned", `${req.email} → ${ADMIN_ROLES[req.role].name}`);
  }

  function suspendAdmin(id: string) {
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, status: a.status === "suspended" ? "active" : "suspended" } : a));
    const a = admins.find(x => x.id === id);
    if (a) logAudit(email, a.status === "suspended" ? "admin.reinstated" : "admin.suspended", a.email);
    toast.success("Status updated");
  }

  function revokeAdmin(id: string) {
    const a = admins.find(x => x.id === id);
    setAdmins((prev) => prev.filter((x) => x.id !== id));
    if (a) logAudit(email, "admin.revoked", a.email);
    toast.success("Admin access revoked");
  }

  const canApprove = (step: ApprovalStep["step"]) => APPROVER_ROLE[step].includes(roleId);
  const isSelf = (req: AdminRequest) => req.requestedBy === email || req.email === email;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-muted-foreground">Multi-layer approval, scoped least-privilege, time-bound JIT grants. Modeled on SOC 2 / ISO 27001 controls.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setTab("pending")}>
            <Eye className="h-4 w-4" />Pending approvals ({pending.length})
          </Button>
          <Button size="sm" className="gap-1" onClick={() => setTab("request")}>
            <UserPlus className="h-4 w-4" />Request new admin
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KPI label="Active admins" value={admins.filter(a => a.status === "active").length.toString()} hint={`${admins.filter(a => a.status === "suspended").length} suspended`} />
        <KPI label="Pending approvals" value={pending.length.toString()} hint={`${pending.filter(p => p.risk === "High").length} high-risk`} tone={pending.length ? "warn" : undefined} />
        <KPI label="Hardware-key coverage" value="100%" hint="Required since Jan 2025" tone="ok" />
        <KPI label="Audit events (recent)" value={audit.length.toString()} hint="Tamper-evident chain" />
        <KPI label="Your role" value={ADMIN_ROLES[roleId].tier} hint={ADMIN_ROLES[roleId].name} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="request">New request</TabsTrigger>
          <TabsTrigger value="pending">Pending approvals {pending.length > 0 && <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">{pending.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="active">Active admins</TabsTrigger>
          <TabsTrigger value="audit">Audit trail</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Request admin account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Full legal name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="As on government ID" /></Field>
                  <Field label="Corporate email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@zynk.ing" /></Field>
                  <Field label="Employment type">
                    <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v as AdminRequest["employmentType"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Full-time employee</SelectItem>
                        <SelectItem value="contractor">Contractor (NDA + DPA on file)</SelectItem>
                        <SelectItem value="vendor">Vendor (sub-processor)</SelectItem>
                        <SelectItem value="auditor">External auditor (read-only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Reporting manager"><Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="manager@zynk.ing" /></Field>
                  <Field label="Role template">
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRoleId })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.values(ADMIN_ROLES).map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name} <span className="text-muted-foreground ml-1">· {r.tier}</span></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Data scope">
                    <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v as AdminRequest["scope"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single region</SelectItem>
                        <SelectItem value="multi">Multi-region (named)</SelectItem>
                        <SelectItem value="global">Global (requires CISO approval)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Region(s)"><Input value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} placeholder="UAE, SA, EG…" /></Field>
                  <Field label="Access duration">
                    <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jit-1h">JIT — 1 hour</SelectItem>
                        <SelectItem value="jit-8h">JIT — 8 hours (shift)</SelectItem>
                        <SelectItem value="jit-7d">JIT — 7 days (sprint)</SelectItem>
                        <SelectItem value="jit-30d">JIT — 30 days (project)</SelectItem>
                        <SelectItem value="permanent">Permanent (90-day re-cert)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={`Business justification (required, audited) — ${form.justification.length}/20+`}>
                  <Textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} placeholder="Explain WHY this access is needed, what tickets/projects it supports, and what data they will touch." rows={3} />
                </Field>
                <div className="grid gap-2 rounded-md border p-3">
                  <div className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Required controls (auto-enforced)</div>
                  <Toggle label="Hardware security key (FIDO2 / WebAuthn) before first login" on locked />
                  <Toggle label="Background check verified within last 12 months" on locked />
                  <Toggle label="NDA + Data Processing Agreement signed" on locked />
                  <Toggle label="Force PII redaction in UI by default" on />
                  <Toggle label="Block bulk export until 24h cooling period" on />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm}>Reset</Button>
                  <Button className="gap-1" onClick={submitRequest}><Mail className="h-4 w-4" />Submit for approval</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Approval chain (auto-routed)</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Step n="1" title="Manager sign-off" who="Reporting manager" status="required" />
                <Step n="2" title="Role owner review" who={`Role template owner (${ADMIN_ROLES[form.role].name})`} status="required" />
                <Step n="3" title="Security review" who="CISO / on-call security" status={form.scope === "global" || ADMIN_ROLES[form.role].tier === "Tier 0" ? "required (High risk)" : "optional"} />
                <Step n="4" title="Compliance review" who="DPO" status={form.role === "compliance_dpo" || /eu|fr|de|sa|ksa/i.test(form.regions) ? "required (PII / regulated region)" : "skipped"} />
                <Step n="5" title="Break-glass approval" who="2 of 3 directors (4-eyes)" status={form.role === "super_admin" ? "required" : "skipped"} />
                <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground flex gap-2"><AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" /><span>Self-approval is blocked. You ({email}) cannot approve a request you submitted.</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="pt-4 space-y-4">
          {pending.length === 0 && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No pending requests. Submit one from the New request tab.</CardContent></Card>
          )}
          {pending.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{req.name} <span className="text-muted-foreground font-normal">· {req.email}</span></CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ADMIN_ROLES[req.role].name} · {req.scope === "global" ? "Global" : req.regions} · {req.duration} · requested by {req.requestedBy} {relTime(req.requestedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={req.risk === "High" ? "destructive" : req.risk === "Medium" ? "secondary" : "outline"}>{req.risk} risk</Badge>
                    <Badge variant="outline">{req.approvals.filter(s => s.approvedBy).length} / {req.approvals.length} approved</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-muted/30 p-3 text-xs">
                  <div className="font-medium mb-1">Justification</div>
                  <div className="text-muted-foreground">{req.justification}</div>
                </div>
                <ol className="space-y-2">
                  {req.approvals.map((s, i) => {
                    const isApproved = !!s.approvedBy;
                    const isRejected = !!s.rejectedBy;
                    const allowed = canApprove(s.step) && !isSelf(req);
                    return (
                      <li key={i} className="flex items-center gap-3 rounded-md border p-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${isApproved ? "bg-emerald-500/15 text-emerald-700" : isRejected ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>
                          {isApproved ? <CheckCheck className="h-4 w-4" /> : isRejected ? <XCircle className="h-4 w-4" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{s.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {isApproved && `Approved by ${s.approvedBy} ${relTime(s.approvedAt!)}`}
                            {isRejected && `Rejected by ${s.rejectedBy} — ${s.reason}`}
                            {!isApproved && !isRejected && (allowed ? "Awaiting your decision" : `Awaiting ${APPROVER_ROLE[s.step].map(r => ADMIN_ROLES[r].name).join(" or ")}`)}
                          </div>
                        </div>
                        {!isApproved && !isRejected && allowed && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-emerald-600" onClick={() => actOnStep(req.id, i, "approve")}>
                              <CheckCircle2 className="h-3 w-3" />Approve
                            </Button>
                            <RejectDialog onSubmit={(reason) => actOnStep(req.id, i, "reject", reason)} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Active admin directory ({admins.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Admin</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Scope</th><th className="px-3 py-2 text-left">Region</th><th className="px-3 py-2 text-left">MFA</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Since</th><th className="px-3 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {admins.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2"><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground">{a.email}</div></td>
                      <td className="px-3 py-2"><Badge variant={ADMIN_ROLES[a.role].tier === "Tier 0" ? "default" : "outline"}>{ADMIN_ROLES[a.role].name}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.scope}</td>
                      <td className="px-3 py-2">{a.region}</td>
                      <td className="px-3 py-2 text-xs"><Fingerprint className="h-3 w-3 inline mr-1 text-emerald-600" />{a.mfa}</td>
                      <td className="px-3 py-2">
                        <Badge variant={a.status === "active" ? "outline" : a.status === "suspended" ? "secondary" : "destructive"}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.since}</td>
                      <td className="px-3 py-2 text-right space-x-1">
                        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => suspendAdmin(a.id)}>
                          {a.status === "suspended" ? <><RotateCcw className="h-3 w-3" />Reinstate</> : <><Ban className="h-3 w-3" />Suspend</>}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => revokeAdmin(a.id)}>Revoke</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Hourglass className="h-4 w-4" />Recent admin lifecycle events</CardTitle></CardHeader>
            <CardContent>
              {audit.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No events yet. Submit a request or approve one to populate the audit trail.</p>
              ) : (
                <ol className="space-y-2">
                  {audit.slice(0, 50).map((e) => (
                    <li key={e.id} className="text-xs flex items-start gap-2 border-l-2 border-primary/30 pl-3 py-1">
                      <span className="text-muted-foreground tabular-nums w-32 shrink-0">{new Date(e.ts).toLocaleString()}</span>
                      <span className="font-mono text-[11px] bg-muted px-1.5 rounded">{e.action}</span>
                      <span className="font-medium">{e.actor}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{e.target}</span>
                      {e.reason && <span className="text-muted-foreground italic">"{e.reason}"</span>}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Lifecycle automation</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Auto-disable account after 60 days of inactivity" on />
                <Toggle label="Quarterly access re-certification by manager" on />
                <Toggle label="Annual full access review by CISO" on />
                <Toggle label="Auto-revoke on HRIS termination event" on locked />
                <Toggle label="Auto-revoke contractor accounts at contract end" on />
                <Toggle label="Force password + key rotation every 180 days" on />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Data privacy guardrails</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="EU PII accessible only by EU-based admins (data residency)" on />
                <Toggle label="KSA / UAE PII accessible only by GCC-based admins" on />
                <Toggle label="Mask PII (email, phone, IBAN) by default — reveal-on-justify" on />
                <Toggle label="Require 4-eyes approval for any bulk PII export &gt; 100 rows" on locked />
                <Toggle label="Geo-fence admin login (block residential VPN / Tor exits)" on />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" />Break-glass procedure</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Sealed credentials in vault — paper backup in safe" on locked />
                <Toggle label="Use triggers PagerDuty + CEO + CISO + Board chair notification" on locked />
                <Toggle label="Maximum 4-hour grant; auto-revoke + forced session recording" on locked />
                <Toggle label="Post-incident review within 48h, RCA published to Audit Committee" on locked />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RejectDialog({ onSubmit }: { onSubmit: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive"><XCircle className="h-3 w-3" />Reject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this approval step</DialogTitle>
          <DialogDescription>Reason will be recorded in the audit trail and shown to the requester.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Insufficient justification, scope too broad, conflicting role…" rows={3} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" disabled={reason.length < 5} onClick={() => { onSubmit(reason); setOpen(false); setReason(""); }}>Reject request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KPI({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "warn" | "ok" }) {
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${tone === "warn" ? "text-amber-600" : tone === "ok" ? "text-emerald-600" : ""}`}>{value}</div><div className="mt-1 text-xs text-muted-foreground">{hint}</div></CardContent></Card>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Toggle({ label, on, locked }: { label: string; on?: boolean; locked?: boolean }) {
  return <div className="flex items-center justify-between text-xs"><span className={locked ? "text-muted-foreground" : ""}>{label}{locked && <Badge variant="outline" className="ml-2 text-[9px]">locked</Badge>}</span><Switch defaultChecked={on} disabled={locked} /></div>;
}
function Step({ n, title, who, status }: { n: string; title: string; who: string; status: string }) {
  return <div className="flex items-start gap-2"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{n}</div><div className="flex-1"><div className="text-xs font-medium">{title}</div><div className="text-[11px] text-muted-foreground">{who} — <span className="italic">{status}</span></div></div></div>;
}
