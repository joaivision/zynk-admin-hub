import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tag, Globe, Users, TrendingUp, Download, Filter, AlertTriangle, Sparkles, Calendar, Target, Percent, DollarSign } from "lucide-react";

const CODES = [
  { code: "LAUNCH50", discount: "50% × 3 mo", redemptions: 8412, eligible: 14209, conv: 59.2, gmv: 248_310, revLift: 92_340, refundRate: 3.1, churnD30: 11.2, status: "Active" },
  { code: "FOUNDER100", discount: "100% × 1 mo", redemptions: 412, eligible: 487, conv: 84.6, gmv: 0, revLift: 41_200, refundRate: 0.7, churnD30: 6.4, status: "Active" },
  { code: "UAE15", discount: "15% yearly", redemptions: 1204, eligible: 4180, conv: 28.8, gmv: 312_770, revLift: 188_410, refundRate: 1.4, churnD30: 4.9, status: "Active" },
  { code: "INVITE-NOOR", discount: "30% lifetime", redemptions: 87, eligible: 110, conv: 79.1, gmv: 18_240, revLift: 12_770, refundRate: 0, churnD30: 2.3, status: "Active" },
  { code: "BLACKFRI", discount: "40% × 12 mo", redemptions: 0, eligible: 0, conv: 0, gmv: 0, revLift: 0, refundRate: 0, churnD30: 0, status: "Scheduled" },
  { code: "RECLAIM", discount: "20% × 6 mo", redemptions: 1847, eligible: 9412, conv: 19.6, gmv: 84_920, revLift: 61_440, refundRate: 5.8, churnD30: 22.1, status: "Active" },
  { code: "STUDENT50", discount: "50% Pro (.edu)", redemptions: 3104, eligible: 6280, conv: 49.4, gmv: 22_180, revLift: 18_910, refundRate: 1.1, churnD30: 14.8, status: "Active" },
  { code: "YC-FAST", discount: "6 mo free Pro", redemptions: 218, eligible: 240, conv: 90.8, gmv: 0, revLift: 33_700, refundRate: 0, churnD30: 1.8, status: "Active" },
];

const REGIONS = [
  { region: "🌐 Global default (USD)", redemptions: 5210, gmv: 198_410, conv: 41.2, topCode: "LAUNCH50" },
  { region: "🇦🇪 United Arab Emirates", redemptions: 2104, gmv: 312_770, conv: 38.9, topCode: "UAE15" },
  { region: "🇸🇦 Saudi Arabia", redemptions: 1487, gmv: 184_220, conv: 34.1, topCode: "LAUNCH50" },
  { region: "🇮🇳 India", redemptions: 4128, gmv: 88_440, conv: 52.4, topCode: "STUDENT50" },
  { region: "🇪🇺 European Union", redemptions: 1402, gmv: 64_120, conv: 28.7, topCode: "FOUNDER100" },
  { region: "🇬🇧 United Kingdom", redemptions: 612, gmv: 41_980, conv: 31.4, topCode: "LAUNCH50" },
  { region: "🇸🇬 Singapore", redemptions: 348, gmv: 27_410, conv: 36.8, topCode: "YC-FAST" },
];

const PLANS = [
  { plan: "Starter", redemptions: 4280, conv: 48.1, avgDiscount: "$4.20", revLift: 41_200, ltvUplift: "+8%" },
  { plan: "Pro", redemptions: 7140, conv: 39.6, avgDiscount: "$11.40", revLift: 184_310, ltvUplift: "+14%" },
  { plan: "Elite", redemptions: 2810, conv: 31.2, avgDiscount: "$38.90", revLift: 198_770, ltvUplift: "+19%" },
  { plan: "Founder Club", redemptions: 612, conv: 84.7, avgDiscount: "$95.00", revLift: 88_440, ltvUplift: "+27%" },
  { plan: "Investor Club", redemptions: 218, conv: 71.4, avgDiscount: "$120.00", revLift: 41_900, ltvUplift: "+22%" },
];

const COHORTS = [
  { cohort: "New users (no prior account)", redemptions: 6420, conv: 44.8, paidActiveD30: 71.2, paidActiveD90: 58.4, ltv: "$184" },
  { cohort: "Trial-to-paid converters", redemptions: 2810, conv: 62.1, paidActiveD30: 88.4, paidActiveD90: 76.9, ltv: "$312" },
  { cohort: "Win-back (cancelled 30–90d)", redemptions: 1847, conv: 19.6, paidActiveD30: 54.1, paidActiveD90: 31.8, ltv: "$94" },
  { cohort: "Referral / invite", redemptions: 1204, conv: 56.3, paidActiveD30: 81.2, paidActiveD90: 69.4, ltv: "$248" },
  { cohort: "Verified founders", redemptions: 612, conv: 84.7, paidActiveD30: 92.1, paidActiveD90: 86.3, ltv: "$498" },
  { cohort: "Students (.edu)", redemptions: 3104, conv: 49.4, paidActiveD30: 64.8, paidActiveD90: 41.2, ltv: "$72" },
  { cohort: "Accelerator alumni (YC/Antler/TS)", redemptions: 218, conv: 90.8, paidActiveD30: 96.4, paidActiveD90: 92.7, ltv: "$612" },
];

const ABUSE = [
  { signal: "Multi-account same payment fingerprint", code: "LAUNCH50", events: 142, action: "Auto-blocked + refund clawback" },
  { signal: "Stacked with referral discount (>60% total)", code: "INVITE-NOOR + LAUNCH50", events: 38, action: "Capped at 50% combined" },
  { signal: ".edu email domain unverifiable (free-mail proxy)", code: "STUDENT50", events: 84, action: "Manual review queue" },
  { signal: "VPN region-shifting to claim UAE15", code: "UAE15", events: 27, action: "Geo + payment country mismatch flag" },
  { signal: "Win-back code on never-cancelled accounts", code: "RECLAIM", events: 12, action: "Eligibility hard-gate added" },
];

export function PromoCodeAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promo Code Analytics</h1>
          <p className="text-sm text-muted-foreground">Redemption, conversion, retention impact and abuse detection across all active and historical campaigns.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="90d"><SelectTrigger className="h-9 w-32"><Calendar className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem><SelectItem value="ytd">Year-to-date</SelectItem><SelectItem value="all">All time</SelectItem></SelectContent></Select>
          <Select defaultValue="all"><SelectTrigger className="h-9 w-36"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All campaigns</SelectItem><SelectItem value="active">Active only</SelectItem><SelectItem value="winback">Win-back</SelectItem><SelectItem value="acquisition">Acquisition</SelectItem></SelectContent></Select>
          <Button variant="outline" size="sm" className="gap-1"><Sparkles className="h-4 w-4" />AI insights</Button>
          <Button size="sm" className="gap-1"><Download className="h-4 w-4" />Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KPI label="Redemptions" value="15,491" hint="+22% vs prior 90d" />
        <KPI label="Conversion rate" value="38.4%" hint="Redeemed → paid (30d)" />
        <KPI label="Net revenue lift" value="$649K" hint="Incremental vs control" />
        <KPI label="Avg discount given" value="$18.40" hint="Per redeemed code" />
        <KPI label="Discount-attributed churn" value="8.6%" hint="D30 vs 5.2% organic" tone="warn" />
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes">By Code</TabsTrigger>
          <TabsTrigger value="region">By Region</TabsTrigger>
          <TabsTrigger value="plan">By Plan</TabsTrigger>
          <TabsTrigger value="cohort">By Cohort</TabsTrigger>
          <TabsTrigger value="impact">Conversion Impact</TabsTrigger>
          <TabsTrigger value="abuse">Abuse & Eligibility</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" />Per-code performance</CardTitle>
              <div className="relative w-64"><Input placeholder="Search code…" className="h-8 pl-3 text-xs" /></div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left">Code</th>
                    <th className="px-3 py-2 text-left">Discount</th>
                    <th className="px-3 py-2 text-right">Eligible</th>
                    <th className="px-3 py-2 text-right">Redeemed</th>
                    <th className="px-3 py-2 text-right">Conv %</th>
                    <th className="px-3 py-2 text-right">GMV ($)</th>
                    <th className="px-3 py-2 text-right">Net rev lift</th>
                    <th className="px-3 py-2 text-right">Refund %</th>
                    <th className="px-3 py-2 text-right">Churn D30</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {CODES.map((c) => (
                    <tr key={c.code} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono font-medium">{c.code}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.discount}</td>
                      <td className="px-3 py-2 text-right">{c.eligible.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium">{c.redemptions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right"><Badge variant={c.conv > 60 ? "default" : c.conv > 30 ? "secondary" : "outline"}>{c.conv}%</Badge></td>
                      <td className="px-3 py-2 text-right">${c.gmv.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium text-emerald-600">${c.revLift.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{c.refundRate}%</td>
                      <td className={`px-3 py-2 text-right ${c.churnD30 > 15 ? "text-amber-600 font-medium" : ""}`}>{c.churnD30}%</td>
                      <td className="px-3 py-2"><Badge variant={c.status === "Active" ? "default" : "secondary"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="region" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Regional breakdown</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Region</th><th className="px-3 py-2 text-right">Redemptions</th><th className="px-3 py-2 text-right">GMV ($)</th><th className="px-3 py-2 text-right">Conv %</th><th className="px-3 py-2 text-left">Top code</th><th className="px-3 py-2 text-left w-48">Share of redemptions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {REGIONS.map((r) => {
                    const total = REGIONS.reduce((s, x) => s + x.redemptions, 0);
                    const pct = (r.redemptions / total) * 100;
                    return (
                      <tr key={r.region} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{r.region}</td>
                        <td className="px-3 py-2 text-right">{r.redemptions.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${r.gmv.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{r.conv}%</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="font-mono text-xs">{r.topCode}</Badge></td>
                        <td className="px-3 py-2"><div className="flex items-center gap-2"><Progress value={pct} className="h-2" /><span className="text-xs text-muted-foreground w-10">{pct.toFixed(1)}%</span></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Per-plan impact</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-right">Redemptions</th><th className="px-3 py-2 text-right">Conv %</th><th className="px-3 py-2 text-right">Avg discount</th><th className="px-3 py-2 text-right">Net rev lift</th><th className="px-3 py-2 text-right">LTV uplift</th></tr>
                </thead>
                <tbody className="divide-y">
                  {PLANS.map((p) => (
                    <tr key={p.plan} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{p.plan}</td>
                      <td className="px-3 py-2 text-right">{p.redemptions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{p.conv}%</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{p.avgDiscount}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-medium">${p.revLift.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right"><Badge>{p.ltvUplift}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Cohort retention after redemption</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Cohort</th><th className="px-3 py-2 text-right">Redemptions</th><th className="px-3 py-2 text-right">Conv %</th><th className="px-3 py-2 text-right">Active D30</th><th className="px-3 py-2 text-right">Active D90</th><th className="px-3 py-2 text-right">Avg LTV</th></tr>
                </thead>
                <tbody className="divide-y">
                  {COHORTS.map((c) => (
                    <tr key={c.cohort} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{c.cohort}</td>
                      <td className="px-3 py-2 text-right">{c.redemptions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{c.conv}%</td>
                      <td className={`px-3 py-2 text-right ${c.paidActiveD30 > 80 ? "text-emerald-600 font-medium" : c.paidActiveD30 < 60 ? "text-amber-600" : ""}`}>{c.paidActiveD30}%</td>
                      <td className={`px-3 py-2 text-right ${c.paidActiveD90 > 80 ? "text-emerald-600 font-medium" : c.paidActiveD90 < 50 ? "text-amber-600" : ""}`}>{c.paidActiveD90}%</td>
                      <td className="px-3 py-2 text-right font-medium">{c.ltv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Funnel: redeemed → paid → retained</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: "Code viewed at checkout", value: 38_421, pct: 100 },
                  { step: "Code applied successfully", value: 22_140, pct: 57.6 },
                  { step: "Completed first payment", value: 15_491, pct: 40.3 },
                  { step: "Active at D30", value: 12_180, pct: 31.7 },
                  { step: "Active at D90 (paying)", value: 9_410, pct: 24.5 },
                  { step: "Renewed past discount window", value: 6_820, pct: 17.7 },
                ].map((s) => (
                  <div key={s.step}>
                    <div className="flex justify-between text-xs mb-1"><span>{s.step}</span><span className="font-medium">{s.value.toLocaleString()} · {s.pct}%</span></div>
                    <Progress value={s.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Percent className="h-4 w-4" />Incrementality (vs holdout control)</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["Treatment conversion", "38.4%"],
                  ["Holdout (no code shown)", "21.7%"],
                  ["Lift", "+16.7 pp"],
                  ["Incremental paid users", "5,184"],
                  ["Incremental MRR", "$48,210"],
                  ["Discount cost", "$284,940"],
                  ["Net rev lift (90d)", "$649,310"],
                  ["Payback period", "2.4 months"],
                  ["ROI", "228%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b py-1.5">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-medium ${k === "ROI" || k === "Lift" ? "text-emerald-600" : ""}`}>{v}</span>
                  </div>
                ))}
                <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2"><DollarSign className="h-4 w-4 mt-0.5 shrink-0" /><span>Incrementality measured via 5% randomized holdout. Confidence interval ±1.2pp at p&lt;0.05.</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abuse" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Abuse signals & eligibility breaches</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr><th className="px-3 py-2 text-left">Signal</th><th className="px-3 py-2 text-left">Code</th><th className="px-3 py-2 text-right">Events (90d)</th><th className="px-3 py-2 text-left">Resolution</th></tr>
                </thead>
                <tbody className="divide-y">
                  {ABUSE.map((a, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2">{a.signal}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="font-mono text-xs">{a.code}</Badge></td>
                      <td className="px-3 py-2 text-right font-medium">{a.events}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.action}</td>
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

function KPI({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-bold ${tone === "warn" ? "text-amber-600" : ""}`}>{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}
