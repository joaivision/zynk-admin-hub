import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileJson, FileSpreadsheet, FileText, ShieldCheck, Clock, Webhook, Database, Lock, Send, AlertTriangle } from "lucide-react";

const FIELD_GROUPS = [
  { g: "Identity", fields: ["uid", "email", "phone", "name", "country", "city", "language", "stakeholder_type", "joined_at"] },
  { g: "Profile", fields: ["headline", "bio", "industry", "skills", "intent", "stage", "company", "linkedin_url", "completeness"] },
  { g: "Verification", fields: ["email_verified", "phone_verified", "kyc_status", "kyc_level", "id_type", "sanctions_clean", "accredited_investor"] },
  { g: "Behaviour", fields: ["last_active", "sessions_30d", "swipes_30d", "messages_30d", "matches_total", "connections", "events_joined"] },
  { g: "Commerce", fields: ["plan", "subscription_status", "mrr", "ltv", "credits", "boosts_used", "payment_methods", "chargebacks", "refunds"] },
  { g: "Risk & Trust", fields: ["trust_score", "risk_score", "reports_against", "moderation_flags", "linked_accounts"] },
  { g: "Device & Source", fields: ["primary_platform", "app_version", "os", "ip_country", "acquisition_source", "utm_campaign", "referrer_uid"] },
  { g: "Consent (GDPR)", fields: ["marketing_opt_in", "analytics_consent", "third_party_share", "consent_updated_at"] },
];

const RECENT_JOBS = [
  { id: "exp_8421", who: "rajiv", scope: "All Pro users in UAE", rows: 12_431, format: "CSV", status: "Ready", at: "12m ago" },
  { id: "exp_8419", who: "noor", scope: "Banned users (90d)", rows: 87, format: "JSON", status: "Ready", at: "1h ago" },
  { id: "exp_8417", who: "compliance-bot", scope: "KYC-approved investors", rows: 4_812, format: "Parquet", status: "Running", at: "1h ago" },
  { id: "exp_8410", who: "rajiv", scope: "Full directory snapshot", rows: 142_811, format: "CSV (zipped)", status: "Awaiting 2FA approval", at: "3h ago" },
  { id: "exp_8401", who: "marketing", scope: "Email opt-in subscribers", rows: 88_204, format: "CSV", status: "Delivered to S3", at: "1d ago" },
];

export function ExportUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Users</h1>
        <p className="text-sm text-muted-foreground">Generate compliant exports of user data with field-level controls, PII masking, encryption, and audit trails.</p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Export</TabsTrigger>
          <TabsTrigger value="jobs">Jobs & History</TabsTrigger>
          <TabsTrigger value="schedules">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="dsr">Data Subject Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Configure export</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Audience</Label>
                  <Select defaultValue="segment">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users (full directory)</SelectItem>
                      <SelectItem value="segment">From a saved segment</SelectItem>
                      <SelectItem value="query">From a custom query</SelectItem>
                      <SelectItem value="csv">From an uploaded UID list (CSV)</SelectItem>
                      <SelectItem value="single">A single user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Saved segment</Label><Input placeholder="High-intent investors in MENA (1,842)" /></div>

                <div>
                  <Label className="mb-2 block">Fields to include</Label>
                  <div className="space-y-3 rounded-md border p-3 max-h-80 overflow-auto">
                    {FIELD_GROUPS.map((grp) => (
                      <div key={grp.g}>
                        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">{grp.g}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {grp.fields.map((f) => (
                            <div key={f} className="flex items-center gap-2">
                              <Checkbox id={f} defaultChecked={!["sanctions_clean", "linked_accounts"].includes(f)} />
                              <Label htmlFor={f} className="text-xs font-normal font-mono">{f}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Format</Label><Select defaultValue="csv"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="json">JSON (NDJSON)</SelectItem><SelectItem value="parquet">Parquet</SelectItem><SelectItem value="xlsx">Excel (XLSX)</SelectItem></SelectContent></Select></div>
                  <div><Label>Compression</Label><Select defaultValue="zip"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="zip">ZIP</SelectItem><SelectItem value="gzip">GZIP</SelectItem></SelectContent></Select></div>
                  <div><Label>Row limit</Label><Input placeholder="No limit" /></div>
                </div>

                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Mask PII (hash email/phone, redact names)" />
                  <Toggle label="Pseudonymize UIDs (rotating salt)" />
                  <Toggle label="Encrypt with PGP (recipient public key)" on />
                  <Toggle label="Password-protect ZIP" on />
                  <Toggle label="Strip rows where consent_third_party_share = false" on />
                  <Toggle label="Exclude users in self-deactivated / erased states" on />
                  <Toggle label="Require 2-admin approval for >10k rows (4-eyes)" on />
                </div>

                <div>
                  <Label>Delivery</Label>
                  <Select defaultValue="download">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="download"><Download className="inline h-3.5 w-3.5 mr-1.5" />Secure download link (24h, single-use)</SelectItem>
                      <SelectItem value="email"><Send className="inline h-3.5 w-3.5 mr-1.5" />Email link to admin</SelectItem>
                      <SelectItem value="s3"><Database className="inline h-3.5 w-3.5 mr-1.5" />Push to S3 / GCS bucket</SelectItem>
                      <SelectItem value="webhook"><Webhook className="inline h-3.5 w-3.5 mr-1.5" />POST to webhook URL</SelectItem>
                      <SelectItem value="warehouse">Sync to data warehouse (Snowflake / BigQuery)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reason / ticket reference (required for audit)</Label>
                  <Input placeholder="e.g. JIRA-4421 — quarterly investor outreach segment" />
                </div>

                <div className="flex items-center justify-between rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><span>Estimated rows: <b>1,842</b> · approx <b>4.2 MB</b> · GDPR scope: <b>EU subjects 312</b></span></div>
                  <Badge variant="outline">RoPA logged</Badge>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save as template</Button>
                  <Button className="gap-1"><Download className="h-4 w-4" />Generate export</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Compliance guard-rails</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Every export is logged to the <b className="text-foreground">RoPA</b> (Record of Processing Activities).</p>
                  <p>• <b className="text-foreground">Retention</b>: download links expire in 24h, files purged after 7 days.</p>
                  <p>• <b className="text-foreground">PII fields</b> require justification + reviewer approval.</p>
                  <p>• Cross-border transfers blocked unless adequacy / SCCs configured.</p>
                  <p>• Erased users (GDPR Art. 17) are never included.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Templates</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {["Marketing CRM sync (HubSpot)", "Investor outreach (minimal PII)", "Compliance audit (full)", "Finance MRR cohort", "Data warehouse nightly"].map((t) => (
                    <div key={t} className="flex items-center justify-between rounded-md border p-2"><span>{t}</span><Button variant="ghost" size="sm">Use</Button></div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Format hints</CardTitle></CardHeader>
                <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><FileSpreadsheet className="h-3.5 w-3.5" />CSV — universal, opens in Excel</div>
                  <div className="flex items-center gap-2"><FileJson className="h-3.5 w-3.5" />JSON / NDJSON — APIs, ETL pipelines</div>
                  <div className="flex items-center gap-2"><Database className="h-3.5 w-3.5" />Parquet — analytics, columnar, compressed</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="pt-4">
          <Card><CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                <tr><th className="px-3 py-2 text-left">Job</th><th className="px-3 py-2 text-left">By</th><th className="px-3 py-2 text-left">Scope</th><th className="px-3 py-2 text-left">Rows</th><th className="px-3 py-2 text-left">Format</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">When</th><th className="px-3 py-2 text-right">—</th></tr>
              </thead>
              <tbody className="divide-y">
                {RECENT_JOBS.map((j) => (
                  <tr key={j.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{j.id}</td>
                    <td className="px-3 py-2">@{j.who}</td>
                    <td className="px-3 py-2 text-muted-foreground">{j.scope}</td>
                    <td className="px-3 py-2">{j.rows.toLocaleString()}</td>
                    <td className="px-3 py-2">{j.format}</td>
                    <td className="px-3 py-2"><Badge variant={j.status === "Ready" || j.status === "Delivered to S3" ? "default" : j.status === "Running" ? "secondary" : "outline"}>{j.status}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground">{j.at}</td>
                    <td className="px-3 py-2 text-right"><Button variant="ghost" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" />Get</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="schedules" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            {[
              { n: "Nightly warehouse sync", c: "Daily · 02:00 UTC · → Snowflake", on: true },
              { n: "Weekly KYC audit pack", c: "Mondays · 06:00 · → Compliance S3", on: true },
              { n: "Monthly investor newsletter list", c: "1st of month · → HubSpot", on: true },
              { n: "Quarterly MRR cohort", c: "Quarterly · → Finance bucket", on: false },
            ].map((s) => (
              <div key={s.n} className="flex items-center justify-between rounded-md border p-3">
                <div><div className="font-medium text-sm">{s.n}</div><div className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.c}</div></div>
                <div className="flex items-center gap-2"><Switch defaultChecked={s.on} /><Button variant="ghost" size="sm">Edit</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dsr" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span>GDPR / DPDP / CCPA Subject Access Requests are processed here. SLA: 30 days. Auto-acknowledged on receipt.</span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Request</th><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Due</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">—</th></tr></thead>
              <tbody className="divide-y">
                {[
                  { id: "DSR-2041", u: "@maya.k", t: "Access (Art. 15)", d: "in 12d", s: "In progress" },
                  { id: "DSR-2039", u: "@old_user", t: "Erasure (Art. 17)", d: "in 4d", s: "Pending review" },
                  { id: "DSR-2037", u: "@dev_jonas", t: "Portability (Art. 20)", d: "in 18d", s: "Acknowledged" },
                  { id: "DSR-2030", u: "@noor_x", t: "Rectification (Art. 16)", d: "Done", s: "Completed" },
                ].map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30"><td className="px-3 py-2 font-mono text-xs">{d.id}</td><td className="px-3 py-2">{d.u}</td><td className="px-3 py-2">{d.t}</td><td className="px-3 py-2 text-muted-foreground">{d.d}</td><td className="px-3 py-2"><Badge variant={d.s === "Completed" ? "default" : "secondary"}>{d.s}</Badge></td><td className="px-3 py-2 text-right"><Button variant="ghost" size="sm">Open</Button></td></tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal">{label}</Label><Switch defaultChecked={on} /></div>;
}
