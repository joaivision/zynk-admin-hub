import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Plus, GitBranch, AlertTriangle, FileLock2, Layers, Users, Database } from "lucide-react";

const ROLES = [
  { name: "Super Admin", users: 2, level: "Tier 0", color: "destructive", desc: "Break-glass only · CEO + CISO" },
  { name: "CISO / Security", users: 3, level: "Tier 0", color: "destructive", desc: "Security policy, audit, incident response" },
  { name: "Compliance / DPO", users: 4, level: "Tier 1", color: "default", desc: "GDPR / PDPL access requests, audits" },
  { name: "Finance Operator", users: 6, level: "Tier 1", color: "default", desc: "Refunds, payouts, invoices" },
  { name: "Trust & Safety", users: 8, level: "Tier 1", color: "default", desc: "Suspensions, content review, fraud" },
  { name: "Head of Support", users: 5, level: "Tier 2", color: "secondary", desc: "Manage support team, escalations" },
  { name: "Support Tier 2", users: 14, level: "Tier 2", color: "secondary", desc: "PII view (redacted), refunds < $500" },
  { name: "Support Tier 1", users: 32, level: "Tier 3", color: "outline", desc: "Read-only, scripted actions only" },
  { name: "Growth / Marketing", users: 9, level: "Tier 2", color: "secondary", desc: "Campaigns, promos, analytics (no PII)" },
  { name: "Data Engineer (read)", users: 7, level: "Tier 2", color: "secondary", desc: "Warehouse read, no production write" },
  { name: "DBA (JIT only)", users: 0, level: "Tier 0", color: "destructive", desc: "Production write — granted on incident only" },
  { name: "External Auditor", users: 2, level: "Tier 3", color: "outline", desc: "Read-only, watermarked, time-boxed" },
];

const RESOURCES = [
  "User accounts (PII)", "User accounts (redacted)", "Subscriptions & billing", "Refunds", "Payout ledger",
  "Mentorship sessions", "Expert payouts", "Investor deal flow", "Data room files",
  "Audit logs", "Admin accounts", "Roles & permissions", "Feature flags", "Secrets vault",
  "Promo codes", "Analytics warehouse", "Database (write)", "Storage (delete)", "Webhooks",
];

const ROLE_HEADERS = ["Super", "CISO", "DPO", "Finance", "T&S", "SupHead", "Sup-T2", "Sup-T1", "Growth", "DataR", "DBA", "Auditor"];

// Generate matrix: 0=none, 1=read, 2=read-redacted, 3=write, 4=delete/admin
const matrix: Record<string, number[]> = {
  "User accounts (PII)":            [4,1,1,2,2,2,2,0,0,0,1,1],
  "User accounts (redacted)":       [4,1,1,3,3,3,3,3,1,1,1,1],
  "Subscriptions & billing":        [4,1,1,4,1,3,2,1,1,1,1,1],
  "Refunds":                        [4,1,0,4,1,3,2,0,0,0,0,0],
  "Payout ledger":                  [4,1,1,4,0,1,0,0,0,1,0,1],
  "Mentorship sessions":            [4,1,1,1,3,3,3,1,1,1,0,0],
  "Expert payouts":                 [4,1,1,4,0,1,0,0,0,1,0,1],
  "Investor deal flow":             [4,1,1,1,1,1,0,0,1,1,0,1],
  "Data room files":                [4,1,1,0,1,0,0,0,0,0,0,1],
  "Audit logs":                     [1,4,4,1,1,1,0,0,0,1,0,1],
  "Admin accounts":                 [4,4,1,0,0,0,0,0,0,0,0,1],
  "Roles & permissions":            [4,4,0,0,0,0,0,0,0,0,0,1],
  "Feature flags":                  [4,3,0,0,1,1,0,0,3,0,0,0],
  "Secrets vault":                  [4,4,0,0,0,0,0,0,0,0,0,0],
  "Promo codes":                    [4,1,0,3,1,1,0,0,4,1,0,0],
  "Analytics warehouse":            [4,1,1,3,1,3,1,1,3,4,1,1],
  "Database (write)":                [4,1,0,0,0,0,0,0,0,0,4,0],
  "Storage (delete)":                [4,1,1,0,0,0,0,0,0,0,1,0],
  "Webhooks":                        [4,3,0,1,0,0,0,0,1,1,0,0],
};

const PERM_LABEL = ["—", "Read", "Read·redacted", "Write", "Admin"];
const PERM_COLOR = ["text-muted-foreground/40", "text-muted-foreground", "text-blue-600", "text-amber-600", "text-emerald-600"];

const SOD_VIOLATIONS = [
  { rule: "Finance Operator + DBA", reason: "Cannot approve refund AND modify ledger DB row", severity: "High" },
  { rule: "T&S + Compliance DPO", reason: "Cannot suspend user AND respond to their GDPR request", severity: "Medium" },
  { rule: "Engineer + CISO", reason: "Cannot deploy code AND approve own security review", severity: "High" },
  { rule: "Promo create + Promo approve", reason: "4-eyes required for promo codes &gt; 30% discount", severity: "Medium" },
];

export function RolesPermissions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">RBAC + ABAC model with least-privilege defaults, segregation-of-duties checks, and attribute-based scoping by region, plan tier, and data classification.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><GitBranch className="h-4 w-4" />Diff vs last quarter</Button>
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New custom role</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KPI label="Defined roles" value={ROLES.length.toString()} hint="9 system · 3 custom" />
        <KPI label="Permissions" value="184" hint={`across ${RESOURCES.length} resources × 4 actions`} />
        <KPI label="SoD violations open" value={SOD_VIOLATIONS.length.toString()} hint="Quarterly review pending" tone="warn" />
        <KPI label="Avg permissions per admin" value="11.2" hint="Down from 18.4 (least-priv. drive)" tone="ok" />
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="roles">Role Catalog</TabsTrigger>
          <TabsTrigger value="abac">Attribute Scoping (ABAC)</TabsTrigger>
          <TabsTrigger value="sod">Segregation of Duties</TabsTrigger>
          <TabsTrigger value="datacls">Data Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" />Resource × Role permission grid</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-2 py-2 text-left sticky left-0 bg-muted/40 min-w-[200px]">Resource</th>
                    {ROLE_HEADERS.map((r) => <th key={r} className="px-2 py-2 text-center min-w-[88px]">{r}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {RESOURCES.map((r) => (
                    <tr key={r} className="hover:bg-muted/30">
                      <td className="px-2 py-2 font-medium sticky left-0 bg-background">{r}</td>
                      {matrix[r].map((v, i) => (
                        <td key={i} className="px-2 py-2 text-center">
                          <span className={`font-medium ${PERM_COLOR[v]}`}>{PERM_LABEL[v]}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Legend:</span>
                {PERM_LABEL.map((l, i) => <span key={l} className={PERM_COLOR[i]}>● {l}</span>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Role catalog</CardTitle>
              <Input placeholder="Search roles…" className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ROLES.map((r) => (
                  <div key={r.name} className="rounded-md border p-3 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{r.name}</div>
                        <Badge variant={r.color as never} className="mt-1 text-[10px]">{r.level}</Badge>
                      </div>
                      <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{r.users}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
                    <div className="flex gap-1 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Clone</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abac" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Attribute-based rules</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  "user.region == admin.region (regional data residency)",
                  "user.tier <= admin.maxTier (block T1 from Enterprise data)",
                  "resource.classification <= admin.clearance",
                  "request.time IN admin.businessHours OR break_glass=true",
                  "request.ip IN admin.allowedNetworks (corp VPN / office)",
                  "request.device IN admin.managedDevices (MDM)",
                  "amount <= admin.refundLimit (T2: $500, FinOps: unlimited)",
                ].map((rule) => (
                  <div key={rule} className="rounded-md border p-2 font-mono text-xs flex justify-between items-center"><span>{rule}</span><Switch defaultChecked /></div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Scoping dimensions</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Region scope"><Select defaultValue="multi"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single region</SelectItem><SelectItem value="multi">Named regions</SelectItem><SelectItem value="global">Global</SelectItem></SelectContent></Select></Field>
                <Field label="Plan tier ceiling"><Select defaultValue="enterprise"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Free only</SelectItem><SelectItem value="paid">Free → Elite</SelectItem><SelectItem value="enterprise">All including Enterprise</SelectItem></SelectContent></Select></Field>
                <Field label="Data classification ceiling"><Select defaultValue="confidential"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="internal">Internal</SelectItem><SelectItem value="confidential">Confidential</SelectItem><SelectItem value="restricted">Restricted (PII / financial)</SelectItem><SelectItem value="secret">Secret (legal / M&amp;A)</SelectItem></SelectContent></Select></Field>
                <Field label="Action limits (refund cap, export rows, etc.)"><Input defaultValue="$500 refund · 100 rows export · 10 suspensions/day" /></Field>
                <Field label="Time-of-day restriction"><Input defaultValue="08:00–20:00 admin's local TZ · weekends require approval" /></Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sod" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Segregation-of-duties matrix</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Conflicting roles / actions</th><th className="px-3 py-2 text-left">Why</th><th className="px-3 py-2 text-left">Severity</th><th className="px-3 py-2 text-right">Action</th></tr></thead>
                <tbody className="divide-y">
                  {SOD_VIOLATIONS.map((v, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium">{v.rule}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{v.reason}</td>
                      <td className="px-3 py-2"><Badge variant={v.severity === "High" ? "destructive" : "secondary"}>{v.severity}</Badge></td>
                      <td className="px-3 py-2 text-right"><Button variant="ghost" size="sm">Configure rule</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
                <FileLock2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>SoD violations are auto-detected on every role assignment. Conflicting grants require CISO + Compliance dual approval and are documented in the SOX / ISO 27001 control evidence pack.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datacls" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" />Data classification & handling</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Class</th><th className="px-3 py-2 text-left">Examples</th><th className="px-3 py-2 text-left">Min clearance</th><th className="px-3 py-2 text-left">Default handling</th></tr></thead>
                <tbody className="divide-y">
                  {[
                    ["Public", "Marketing site, blog, public profiles", "All", "No restriction"],
                    ["Internal", "Internal docs, dashboards, KPIs", "Tier 3+", "SSO required"],
                    ["Confidential", "Customer aggregate analytics, tickets", "Tier 2+", "Audit logged, no copy"],
                    ["Restricted (PII)", "Email, phone, IBAN, government ID, KYC", "Tier 1+", "Masked by default · reveal-on-justify · DLP watermark"],
                    ["Secret", "M&A, legal hold, board minutes, source code keys", "Tier 0", "Sealed vault · 4-eyes access · session recorded"],
                  ].map((c) => (
                    <tr key={c[0]} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{c[0]}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c[1]}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{c[2]}</Badge></td>
                      <td className="px-3 py-2 text-xs">{c[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
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
