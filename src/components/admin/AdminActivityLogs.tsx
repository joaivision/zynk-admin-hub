import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Download, Search, Filter, AlertTriangle, ShieldCheck, Bell, Database, Eye, FileText, Lock } from "lucide-react";

const LOGS = [
  { ts: "2026-05-11 14:42:18 UTC", actor: "noor@zynk.ing", role: "Super Admin", action: "user.pii.reveal", target: "user_id=84A2", ip: "212.149.x.x · Dubai", device: "MacBook Pro · Jamf", risk: "Med", justification: "TICK-4128 refund verification", hash: "a1b2…f9c2" },
  { ts: "2026-05-11 14:38:02 UTC", actor: "david@zynk.ing", role: "T&S Lead", action: "user.suspend", target: "user_id=92B7", ip: "10.0.x.x · Office HK", device: "Win11 · Intune", risk: "Med", justification: "Spam network — 8 reports", hash: "9c4d…e882" },
  { ts: "2026-05-11 14:31:45 UTC", actor: "yusuf@zynk.ing", role: "Data Eng (JIT)", action: "warehouse.query", target: "fact_payments — 41,209 rows", ip: "10.0.x.x · Office DXB", device: "MacBook · Jamf", risk: "Low", justification: "Q2 revenue close", hash: "44ab…2210" },
  { ts: "2026-05-11 14:22:11 UTC", actor: "carlos@contractor.io", role: "JIT Engineer", action: "db.write", target: "production.bookings — UPDATE 12 rows", ip: "VPN · São Paulo", device: "MacBook · loaner", risk: "High", justification: "INC-2204 calendar drift fix", hash: "fe1c…7702" },
  { ts: "2026-05-11 13:58:24 UTC", actor: "sara@zynk.ing", role: "CISO", action: "role.grant", target: "yusuf@ → DataEng-JIT (30d)", ip: "212.149.x.x · SG", device: "iPad · MDM", risk: "High", justification: "Approved JIT for Q2 close", hash: "0ab9…d111" },
  { ts: "2026-05-11 13:41:09 UTC", actor: "fatima@zynk.ing", role: "DPO", action: "gdpr.export", target: "user_id=18FC (subject access)", ip: "10.0.x.x · Office Paris", device: "Win11", risk: "Med", justification: "GDPR Art. 15 request DSR-882", hash: "7712…ccaa" },
  { ts: "2026-05-11 13:22:50 UTC", actor: "kim@zynk.ing", role: "Head Support", action: "refund.issue", target: "$248.00 · invoice INV-9482", ip: "10.0.x.x · Office Seoul", device: "MacBook · Jamf", risk: "Low", justification: "Customer goodwill — TICK-4119", hash: "aabb…0099" },
  { ts: "2026-05-11 12:18:34 UTC", actor: "unknown", role: "—", action: "auth.fail", target: "noor@zynk.ing — wrong key", ip: "92.118.x.x · Bucharest", device: "Unknown · Tor exit", risk: "Critical", justification: "Auto-flagged — SOC alerted", hash: "deca…ff01" },
];

const ALERT_RULES = [
  { rule: "Login from new country for Tier 0 / 1 admin", severity: "High", channel: "PagerDuty + Slack #sec", on: true },
  { rule: "Bulk PII export &gt; 100 rows", severity: "High", channel: "PagerDuty + DPO email", on: true },
  { rule: "Refund &gt; $5,000 by single admin in 24h", severity: "High", channel: "Slack #finance + CFO", on: true },
  { rule: "Off-hours admin access (outside business hours, no break-glass)", severity: "Med", channel: "Slack #sec", on: true },
  { rule: "5+ failed MFA challenges in 10 min", severity: "Critical", channel: "PagerDuty (auto-page)", on: true },
  { rule: "Production DB write outside CAB-approved window", severity: "Critical", channel: "PagerDuty + CTO + CISO", on: true },
  { rule: "Role escalation (any grant to Tier 0)", severity: "High", channel: "Email — Board Audit Committee", on: true },
  { rule: "Audit log gap detected (hash chain break)", severity: "Critical", channel: "PagerDuty + CISO + Legal", on: true },
];

const RISK_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Low": "outline", "Med": "secondary", "High": "destructive", "Critical": "destructive",
};

export function AdminActivityLogs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Activity Logs</h1>
          <p className="text-sm text-muted-foreground">Tamper-evident, hash-chained audit trail of every admin action — what was done, by whom, from where, with what justification. Streamed to SIEM, retained 7 years, and reviewed by the Board Audit Committee.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Bell className="h-4 w-4" />Configure alerts</Button>
          <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" />Export (signed)</Button>
          <Button size="sm" className="gap-1"><FileText className="h-4 w-4" />Compliance pack</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KPI label="Events (24h)" value="14,209" hint="42 admins · 184 sessions" />
        <KPI label="High-risk events" value="9" hint="All reviewed within SLA" tone="warn" />
        <KPI label="Failed auth attempts" value="38" hint="3 IPs auto-blocked" />
        <KPI label="Hash-chain integrity" value="OK" hint="Last verified 2 min ago" tone="ok" />
        <KPI label="SIEM lag" value="< 3s" hint="Splunk · DataDog · S3 WORM" tone="ok" />
      </div>

      <Tabs defaultValue="stream">
        <TabsList>
          <TabsTrigger value="stream">Live Stream</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="retention">Retention & Integrity</TabsTrigger>
          <TabsTrigger value="review">Audit Review</TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="pt-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" />Audit log stream</CardTitle>
                <Badge variant="outline" className="gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Live</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input placeholder="Search by actor, action, target…" className="h-8 pl-8" /></div>
                <Select defaultValue="all"><SelectTrigger className="h-8 w-32"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All actions</SelectItem><SelectItem value="pii">PII access</SelectItem><SelectItem value="role">Role changes</SelectItem><SelectItem value="auth">Auth events</SelectItem><SelectItem value="finance">Financial</SelectItem><SelectItem value="db">DB writes</SelectItem></SelectContent></Select>
                <Select defaultValue="all"><SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All risk</SelectItem><SelectItem value="high">High+</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select>
                <Select defaultValue="24h"><SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1h">Last hour</SelectItem><SelectItem value="24h">Last 24h</SelectItem><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem></SelectContent></Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Timestamp</th>
                    <th className="px-3 py-2 text-left">Actor</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Target</th>
                    <th className="px-3 py-2 text-left">Origin</th>
                    <th className="px-3 py-2 text-left">Justification</th>
                    <th className="px-3 py-2 text-left">Risk</th>
                    <th className="px-3 py-2 text-left">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {LOGS.map((l, i) => (
                    <tr key={i} className={`hover:bg-muted/30 ${l.risk === "Critical" ? "bg-destructive/5" : l.risk === "High" ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`}>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{l.ts}</td>
                      <td className="px-3 py-2"><div>{l.actor}</div><div className="text-[10px] text-muted-foreground">{l.role}</div></td>
                      <td className="px-3 py-2 font-medium">{l.action}</td>
                      <td className="px-3 py-2">{l.target}</td>
                      <td className="px-3 py-2 text-muted-foreground"><div>{l.ip}</div><div className="text-[10px]">{l.device}</div></td>
                      <td className="px-3 py-2 text-muted-foreground italic max-w-[200px] truncate">{l.justification}</td>
                      <td className="px-3 py-2"><Badge variant={RISK_COLOR[l.risk]}>{l.risk}</Badge></td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground">{l.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Real-time alert rules</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Rule</th><th className="px-3 py-2 text-left">Severity</th><th className="px-3 py-2 text-left">Channel</th><th className="px-3 py-2 text-right">Enabled</th></tr></thead>
                <tbody className="divide-y">
                  {ALERT_RULES.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2"><span dangerouslySetInnerHTML={{ __html: r.rule }} /></td>
                      <td className="px-3 py-2"><Badge variant={r.severity === "Critical" ? "destructive" : r.severity === "High" ? "destructive" : "secondary"}>{r.severity}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.channel}</td>
                      <td className="px-3 py-2 text-right"><Switch defaultChecked={r.on} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomaly" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Behavioral anomalies (UEBA)</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { sig: "Volume spike — david@ accessed 4× more PII than rolling 30d baseline", risk: "High" },
                  { sig: "Off-pattern — yusuf@ queried payouts table, never accessed before", risk: "Med" },
                  { sig: "Rapid-fire suspensions — kim@ suspended 14 accounts in 8 min", risk: "Med" },
                  { sig: "Geo drift — noor@ login Dubai → Bucharest within 38 min", risk: "Critical" },
                  { sig: "Refund-clustering — same IP issued 7 refunds to overlapping users", risk: "High" },
                ].map((a, i) => (
                  <div key={i} className="rounded-md border p-2 flex items-start justify-between gap-3">
                    <div className="text-xs">{a.sig}</div>
                    <Badge variant={RISK_COLOR[a.risk]} className="shrink-0">{a.risk}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" />Detection coverage</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Volumetric (z-score &gt; 3 vs 30d baseline per admin)" on />
                <Toggle label="Sequence (rare action chain — e.g. role-grant → PII export → suspend)" on />
                <Toggle label="Peer-group deviation (admin behaves unlike same-role peers)" on />
                <Toggle label="Time-of-day (off-hours cluster scoring)" on />
                <Toggle label="Insider-risk score (resignation + access spike + after-hours)" on />
                <Toggle label="ML model — fine-tuned on 90d historical labels (re-train weekly)" on />
                <Toggle label="Honeytoken access (decoy admin / decoy customer record)" on />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Tamper-evident integrity</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Append-only hash chain (SHA-256 prev-hash linked)" on locked />
                <Toggle label="Daily Merkle root anchored to public blockchain (BTC OP_RETURN)" on />
                <Toggle label="Quorum signing — log batch signed by 3 of 5 keys" on locked />
                <Toggle label="Continuous chain verification (every 60s)" on locked />
                <Toggle label="Auto-page CISO on hash break (within 30s)" on locked />
                <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground flex gap-2"><Database className="h-3 w-3 mt-0.5" /><span>No admin can delete or edit log entries — including Super Admin. Deletion attempts are themselves logged.</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Retention & destinations</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Hot retention (queryable)"><Select defaultValue="90"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent></Select></Field>
                <Field label="Cold retention (S3 Glacier WORM)"><Select defaultValue="7y"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3y">3 years</SelectItem><SelectItem value="7y">7 years (SOX / PCI / SOC 2)</SelectItem><SelectItem value="10y">10 years (financial)</SelectItem></SelectContent></Select></Field>
                <Field label="SIEM destinations"><Input defaultValue="Splunk · DataDog · Sumo Logic · S3 WORM bucket" /></Field>
                <Field label="Legal hold capability"><Input defaultValue="Per-user / per-investigation freeze (overrides retention)" /></Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="review" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Audit cadence</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["Daily", "Security on-call reviews all High/Critical events", "SLA: every event triaged within 2h"],
                ["Weekly", "CISO reviews PII access, refund, role-change events", "Sample 5% of normal events"],
                ["Monthly", "DPO reviews GDPR/PDPL data subject access events", "Cross-check against DSR ticket queue"],
                ["Quarterly", "Internal Audit reviews access reviews + SoD violations", "Output → Board Audit Committee"],
                ["Annually", "External SOC 2 / ISO 27001 / PCI auditor reviews full year", "Sample-based + control walk-through"],
                ["Continuous", "Automated UEBA + alerting (this dashboard)", "0-second lag for Critical alerts"],
              ].map(([when, what, sla]) => (
                <div key={when as string} className="grid grid-cols-[100px_1fr_240px] gap-3 rounded-md border p-3">
                  <Badge variant="outline" className="w-fit">{when}</Badge>
                  <div>{what}</div>
                  <div className="text-xs text-muted-foreground">{sla}</div>
                </div>
              ))}
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
function Toggle({ label, on, locked }: { label: string; on?: boolean; locked?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal flex items-center gap-2">{label}{locked && <Badge variant="outline" className="text-[10px] py-0">policy-locked</Badge>}</Label><Switch defaultChecked={on} disabled={locked} /></div>;
}
