import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, ShieldCheck, Clock, Mail, KeyRound, AlertTriangle, Globe, Building2, CheckCircle2, XCircle, Hourglass, Eye, Fingerprint } from "lucide-react";

const PENDING_ADMINS = [
  { name: "Aisha Rahman", email: "aisha@zynk.ing", role: "Finance Operator", scope: "MENA · Payments only", requestedBy: "noor@zynk.ing", approvers: "2 of 3 approved", risk: "Medium", expiresIn: "in 18h" },
  { name: "David Chen", email: "david@zynk.ing", role: "Trust & Safety Lead", scope: "Global · Read PII", requestedBy: "sara@zynk.ing", approvers: "1 of 3 approved", risk: "High", expiresIn: "in 22h" },
  { name: "Maria Lopez", email: "maria.l@contractor.io", role: "Support Tier 2 (contractor)", scope: "LATAM · No PII export", requestedBy: "kim@zynk.ing", approvers: "0 of 2 approved", risk: "Low", expiresIn: "in 41h" },
  { name: "Yusuf Al-Mahdi", email: "yusuf@zynk.ing", role: "Data Engineer (read-only)", scope: "Warehouse · 30-day JIT", requestedBy: "noor@zynk.ing", approvers: "3 of 3 approved · awaiting CISO", risk: "High", expiresIn: "in 6h" },
];

const ACTIVE_ADMINS = [
  { name: "Noor Al-Hashimi", role: "Super Admin", scope: "Global", lastActive: "2 min ago", region: "🇦🇪 UAE", mfa: "Hardware key", since: "Jan 2024" },
  { name: "Sara Kim", role: "CISO", scope: "Global · Break-glass", lastActive: "12 min ago", region: "🇸🇬 SG", mfa: "Hardware key + Biometric", since: "Mar 2024" },
  { name: "Kim Park", role: "Head of Support", scope: "APAC", lastActive: "1h ago", region: "🇰🇷 KR", mfa: "TOTP + Backup", since: "Jun 2024" },
  { name: "Fatima Zahra", role: "Compliance Officer", scope: "EU · GDPR DPO", lastActive: "Yesterday", region: "🇫🇷 FR", mfa: "Hardware key", since: "Nov 2024" },
  { name: "Carlos Mendes", role: "Engineer (JIT)", scope: "Production DB · Expires Tue", lastActive: "3h ago", region: "🇧🇷 BR", mfa: "Hardware key", since: "JIT Mar 2026" },
];

export function CreateAdminAccounts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-muted-foreground">Provision admin access with multi-layer approval, scoped least-privilege, and time-bound JIT grants. Modeled on LinkedIn / SOC 2 / ISO 27001 controls.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" />Pending approvals (4)</Button>
          <Button size="sm" className="gap-1"><UserPlus className="h-4 w-4" />Request new admin</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KPI label="Active admins" value="42" hint="34 employees · 8 contractors" />
        <KPI label="JIT grants live" value="6" hint="Expire within 7d" />
        <KPI label="Pending approvals" value="4" hint="2 high-risk" tone="warn" />
        <KPI label="Hardware-key coverage" value="100%" hint="Required since Jan 2025" tone="ok" />
        <KPI label="Dormant >60d" value="3" hint="Auto-disable in 4d" tone="warn" />
      </div>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">New request</TabsTrigger>
          <TabsTrigger value="pending">Pending approvals</TabsTrigger>
          <TabsTrigger value="active">Active admins</TabsTrigger>
          <TabsTrigger value="policy">Provisioning policy</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Request admin account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Full legal name"><Input placeholder="As on government ID" /></Field>
                  <Field label="Corporate email"><Input placeholder="user@zynk.ing" /></Field>
                  <Field label="Employment type">
                    <Select defaultValue="employee"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="employee">Full-time employee</SelectItem>
                      <SelectItem value="contractor">Contractor (NDA + DPA on file)</SelectItem>
                      <SelectItem value="vendor">Vendor (sub-processor)</SelectItem>
                      <SelectItem value="auditor">External auditor (read-only)</SelectItem>
                    </SelectContent></Select>
                  </Field>
                  <Field label="Reporting manager"><Input placeholder="Search directory…" /></Field>
                  <Field label="Role template">
                    <Select><SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger><SelectContent>
                      <SelectItem value="support1">Support Tier 1 (no PII export)</SelectItem>
                      <SelectItem value="support2">Support Tier 2 (PII view, redacted)</SelectItem>
                      <SelectItem value="trust">Trust & Safety</SelectItem>
                      <SelectItem value="finance">Finance Operator</SelectItem>
                      <SelectItem value="growth">Growth / Marketing</SelectItem>
                      <SelectItem value="engineer">Engineer (production read)</SelectItem>
                      <SelectItem value="dba">Database Engineer (write, JIT only)</SelectItem>
                      <SelectItem value="compliance">Compliance / DPO</SelectItem>
                      <SelectItem value="ciso">CISO / Security</SelectItem>
                      <SelectItem value="super">Super Admin (break-glass)</SelectItem>
                    </SelectContent></Select>
                  </Field>
                  <Field label="Data scope">
                    <Select defaultValue="region"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="region">Single region</SelectItem>
                      <SelectItem value="multi">Multi-region (named)</SelectItem>
                      <SelectItem value="global">Global (requires CISO approval)</SelectItem>
                    </SelectContent></Select>
                  </Field>
                  <Field label="Region(s)"><Input placeholder="UAE, SA, EG…" /></Field>
                  <Field label="Access duration">
                    <Select defaultValue="permanent"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="jit-1h">JIT — 1 hour</SelectItem>
                      <SelectItem value="jit-8h">JIT — 8 hours (shift)</SelectItem>
                      <SelectItem value="jit-7d">JIT — 7 days (sprint)</SelectItem>
                      <SelectItem value="jit-30d">JIT — 30 days (project)</SelectItem>
                      <SelectItem value="permanent">Permanent (90-day re-cert)</SelectItem>
                    </SelectContent></Select>
                  </Field>
                </div>
                <Field label="Business justification (required, audited)">
                  <Textarea placeholder="Explain WHY this access is needed, what tickets/projects it supports, and what data they will touch." rows={3} />
                </Field>
                <div className="grid gap-2 rounded-md border p-3">
                  <div className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Required controls (auto-enforced)</div>
                  <Toggle label="Hardware security key (FIDO2 / WebAuthn) before first login" on locked />
                  <Toggle label="Background check verified within last 12 months" on locked />
                  <Toggle label="NDA + Data Processing Agreement signed" on locked />
                  <Toggle label="Force PII redaction in UI by default" on />
                  <Toggle label="Block bulk export until 24h cooling period" on />
                  <Toggle label="Record all sessions (production access only)" on />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Approval chain (auto-routed)</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Step n="1" title="Manager sign-off" who="Reporting manager" status="required" />
                <Step n="2" title="Role owner review" who="Role template owner (e.g. Head of Support)" status="required" />
                <Step n="3" title="Security review" who="CISO / on-call security" status="required for High risk" />
                <Step n="4" title="Compliance review" who="DPO" status="required if PII / EU / KSA" />
                <Step n="5" title="Break-glass approval" who="2 of 3 directors (4-eyes)" status="Super Admin only" />
                <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground flex gap-2"><AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" /><span>Self-approval is blocked. Approvers cannot belong to the same reporting line as the requester (segregation of duties).</span></div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">Save draft</Button>
                  <Button size="sm" className="flex-1 gap-1"><Mail className="h-3 w-3" />Submit for approval</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Hourglass className="h-4 w-4" />Pending admin requests</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Requested user</th><th className="px-3 py-2 text-left">Role / scope</th><th className="px-3 py-2 text-left">Requested by</th><th className="px-3 py-2 text-left">Approval chain</th><th className="px-3 py-2 text-left">Risk</th><th className="px-3 py-2 text-left">SLA</th><th className="px-3 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {PENDING_ADMINS.map((a) => (
                    <tr key={a.email} className="hover:bg-muted/30">
                      <td className="px-3 py-2"><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground">{a.email}</div></td>
                      <td className="px-3 py-2"><div className="font-medium">{a.role}</div><div className="text-xs text-muted-foreground">{a.scope}</div></td>
                      <td className="px-3 py-2 text-xs">{a.requestedBy}</td>
                      <td className="px-3 py-2 text-xs">{a.approvers}</td>
                      <td className="px-3 py-2"><Badge variant={a.risk === "High" ? "destructive" : a.risk === "Medium" ? "secondary" : "outline"}>{a.risk}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">Auto-expires {a.expiresIn}</td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700"><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Active admin directory</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search admins…" className="h-8 w-48" />
                <Select defaultValue="all"><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="super">Super Admin</SelectItem><SelectItem value="contractor">Contractors</SelectItem><SelectItem value="jit">JIT only</SelectItem></SelectContent></Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Admin</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Scope</th><th className="px-3 py-2 text-left">Region</th><th className="px-3 py-2 text-left">MFA</th><th className="px-3 py-2 text-left">Last active</th><th className="px-3 py-2 text-left">Since</th><th className="px-3 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {ACTIVE_ADMINS.map((a) => (
                    <tr key={a.name} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2"><Badge variant={a.role.includes("Super") || a.role.includes("CISO") ? "default" : "outline"}>{a.role}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.scope}</td>
                      <td className="px-3 py-2">{a.region}</td>
                      <td className="px-3 py-2 text-xs"><Fingerprint className="h-3 w-3 inline mr-1 text-emerald-600" />{a.mfa}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.lastActive}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.since}</td>
                      <td className="px-3 py-2 text-right space-x-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-amber-600">Suspend</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <Toggle label="Block account creation outside business hours (override w/ approval)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Data privacy guardrails</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="EU PII accessible only by EU-based admins (data residency)" on />
                <Toggle label="KSA / UAE PII accessible only by GCC-based admins" on />
                <Toggle label="Mask PII (email, phone, IBAN) by default — reveal-on-justify" on />
                <Toggle label="Block screenshots of customer PII screens (DLP watermark)" on />
                <Toggle label="Require 4-eyes approval for any bulk PII export &gt; 100 rows" on locked />
                <Toggle label="Geo-fence admin login (block residential VPN / Tor exits)" on />
                <Toggle label="Disallow personal-device login for Super Admin / DBA roles" on locked />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" />Break-glass procedure</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Sealed credentials in vault (Hashicorp / 1Password) — paper backup in safe" on locked />
                <Toggle label="Use triggers PagerDuty incident + CEO + CISO + Board chair notification" on locked />
                <Toggle label="Maximum 4-hour grant; auto-revoke + forced session recording" on locked />
                <Toggle label="Post-incident review within 48h, RCA published to Audit Committee" on locked />
                <Toggle label="Annual break-glass drill (tabletop exercise)" on />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "warn" | "ok" }) {
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${tone === "warn" ? "text-amber-600" : tone === "ok" ? "text-emerald-600" : ""}`}>{value}</div><div className="mt-1 text-xs text-muted-foreground">{hint}</div></CardContent></Card>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Toggle({ label, on, locked }: { label: string; on?: boolean; locked?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal flex items-center gap-2">{label}{locked && <Badge variant="outline" className="text-[10px] py-0">policy-locked</Badge>}</Label><Switch defaultChecked={on} disabled={locked} /></div>;
}
function Step({ n, title, who, status }: { n: string; title: string; who: string; status: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">{n}</div>
      <div className="flex-1 -mt-0.5">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{who}</div>
        <Badge variant="outline" className="mt-1 text-[10px]">{status}</Badge>
      </div>
    </div>
  );
}
