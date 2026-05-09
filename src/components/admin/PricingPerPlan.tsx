import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Tag, Calendar, TrendingUp, Plus, Save, History, AlertTriangle, Sparkles, Percent, DollarSign, GraduationCap } from "lucide-react";

const PLANS = ["Free", "Starter", "Pro", "Elite", "Founder Club", "Investor Club", "Enterprise"];
const CURRENCIES = ["USD", "AED", "SAR", "INR", "EUR", "GBP", "SGD", "EGP", "PKR", "TRY", "BTC"];

const PRICE_MATRIX = [
  { region: "Global default", currency: "USD", flag: "🌐", monthly: { Starter: 9, Pro: 29, Elite: 99, "Founder Club": 199, "Investor Club": 299 }, yearly: { Starter: 90, Pro: 290, Elite: 990, "Founder Club": 1990, "Investor Club": 2990 }, tax: "Excl." },
  { region: "United Arab Emirates", currency: "AED", flag: "🇦🇪", monthly: { Starter: 35, Pro: 109, Elite: 369, "Founder Club": 749, "Investor Club": 1099 }, yearly: { Starter: 349, Pro: 1090, Elite: 3690, "Founder Club": 7490, "Investor Club": 10990 }, tax: "5% VAT incl." },
  { region: "Saudi Arabia", currency: "SAR", flag: "🇸🇦", monthly: { Starter: 35, Pro: 109, Elite: 369, "Founder Club": 749, "Investor Club": 1099 }, yearly: { Starter: 349, Pro: 1090, Elite: 3690, "Founder Club": 7490, "Investor Club": 10990 }, tax: "15% VAT incl." },
  { region: "India", currency: "INR", flag: "🇮🇳", monthly: { Starter: 499, Pro: 1499, Elite: 4999, "Founder Club": 9999, "Investor Club": 14999 }, yearly: { Starter: 4990, Pro: 14990, Elite: 49990, "Founder Club": 99990, "Investor Club": 149990 }, tax: "18% GST excl." },
  { region: "European Union", currency: "EUR", flag: "🇪🇺", monthly: { Starter: 8, Pro: 27, Elite: 92, "Founder Club": 185, "Investor Club": 279 }, yearly: { Starter: 80, Pro: 270, Elite: 920, "Founder Club": 1850, "Investor Club": 2790 }, tax: "VAT by country" },
  { region: "United Kingdom", currency: "GBP", flag: "🇬🇧", monthly: { Starter: 7, Pro: 23, Elite: 79, "Founder Club": 159, "Investor Club": 239 }, yearly: { Starter: 70, Pro: 230, Elite: 790, "Founder Club": 1590, "Investor Club": 2390 }, tax: "20% VAT incl." },
  { region: "Singapore", currency: "SGD", flag: "🇸🇬", monthly: { Starter: 12, Pro: 39, Elite: 129, "Founder Club": 259, "Investor Club": 389 }, yearly: { Starter: 120, Pro: 390, Elite: 1290, "Founder Club": 2590, "Investor Club": 3890 }, tax: "9% GST incl." },
];

export function PricingPerPlan() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing per Plan</h1>
          <p className="text-sm text-muted-foreground">Manage prices across regions, billing cycles, currencies and tax models. Schedule changes safely with grandfathering.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><History className="h-4 w-4" />Price history</Button>
          <Button variant="outline" size="sm" className="gap-1"><Sparkles className="h-4 w-4" />Suggest pricing (AI)</Button>
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" />Add region</Button>
          <Button size="sm" className="gap-1"><Save className="h-4 w-4" />Save changes</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KPI label="Active price points" value="187" hint={`across ${PRICE_MATRIX.length} regions × ${PLANS.length - 1} paid plans`} />
        <KPI label="Avg uplift vs USD" value="+3.4%" hint="PPP-adjusted yield" />
        <KPI label="Currencies live" value={CURRENCIES.length.toString()} hint="incl. crypto (BTC)" />
        <KPI label="Pending changes" value="3" hint="Scheduled · 2 require approval" />
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Price Matrix</TabsTrigger>
          <TabsTrigger value="cycles">Billing Cycles</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="tax">Tax & Currency</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Grandfathering</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Regional × Plan price matrix</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="sm">Bulk +5%</Button>
                <Button variant="outline" size="sm">Bulk −5%</Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="px-2 py-2 text-left min-w-[180px]">Region</th>
                    <th className="px-2 py-2 text-left">Currency</th>
                    {PLANS.filter((p) => p !== "Free" && p !== "Enterprise").map((p) => (
                      <th key={p} className="px-2 py-2 text-left min-w-[100px]">{p}</th>
                    ))}
                    <th className="px-2 py-2 text-left">Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PRICE_MATRIX.map((row) => (
                    <tr key={row.region} className="hover:bg-muted/30">
                      <td className="px-2 py-2 font-medium">{row.flag} {row.region}</td>
                      <td className="px-2 py-2"><Badge variant="outline">{row.currency}</Badge></td>
                      {PLANS.filter((p) => p !== "Free" && p !== "Enterprise").map((p) => (
                        <td key={p} className="px-2 py-2">
                          <Input defaultValue={row.monthly[p as keyof typeof row.monthly]?.toString() ?? ""} className="h-8 text-xs px-2" />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-xs text-muted-foreground">{row.tax}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={PLANS.length} className="px-2 py-2 text-center">
                      <Button variant="ghost" size="sm" className="gap-1"><Plus className="h-3 w-3" />Add region</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycles" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Available cycles</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { c: "Monthly", on: true, d: "Default for all plans" },
                  { c: "Quarterly", on: true, d: "5% discount vs monthly" },
                  { c: "Yearly", on: true, d: "2 months free (~17%)" },
                  { c: "2-year", on: false, d: "25% discount, lifetime opt-in only" },
                  { c: "Lifetime", on: false, d: "One-time price, founders only" },
                ].map((c) => (
                  <div key={c.c} className="flex items-center justify-between rounded-md border p-3">
                    <div><div className="font-medium text-sm">{c.c}</div><div className="text-xs text-muted-foreground">{c.d}</div></div>
                    <Switch defaultChecked={c.on} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Percent className="h-4 w-4" />Cycle uplift / discount</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Quarterly discount vs monthly", "5%"],
                  ["Yearly discount vs monthly", "16.7%"],
                  ["2-year discount vs monthly", "25%"],
                  ["Trial-to-paid yearly bonus", "1 extra month free"],
                  ["Auto-upsell yearly at month 4", "Enabled"],
                ].map((p) => (
                  <div key={p[0]} className="grid grid-cols-2 items-center gap-3"><Label className="text-sm">{p[0]}</Label><Input defaultValue={p[1]} className="h-8" /></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discounts" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" />Promo codes & cohort discounts</CardTitle>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New code</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Code</th><th className="px-3 py-2 text-left">Discount</th><th className="px-3 py-2 text-left">Applies to</th><th className="px-3 py-2 text-left">Audience</th><th className="px-3 py-2 text-left">Used</th><th className="px-3 py-2 text-left">Expires</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
                <tbody className="divide-y">
                  {[
                    ["LAUNCH50", "50% first 3 mo", "Pro · Elite", "New users", "8,412", "Jul 31", "Active"],
                    ["FOUNDER100", "100% first month", "Founder Club", "Verified founders", "412", "No expiry", "Active"],
                    ["UAE15", "15% off yearly", "All paid", "AE country", "1,204", "Dec 31", "Active"],
                    ["INVITE-NOOR", "30% lifetime", "Pro", "Referral cohort", "87", "—", "Active"],
                    ["BLACKFRI", "40% first year", "Pro · Elite", "All", "0", "Nov 28", "Scheduled"],
                    ["RECLAIM", "20% off 6 mo", "Any paid", "Win-back (cancelled 30-90d)", "1,847", "Rolling", "Active"],
                  ].map((d, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {d.map((c, j) => <td key={j} className="px-3 py-2">{c === "Active" ? <Badge>Active</Badge> : c === "Scheduled" ? <Badge variant="secondary">Scheduled</Badge> : c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" />Cohort & vertical pricing</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                "Student discount — 50% off Pro with .edu email verification",
                "Non-profit / NGO — 75% off Elite with proof",
                "Female founders — 25% off Founder Club for first year",
                "Y Combinator / Antler / Techstars alumni — 6 months free Pro",
                "Veteran-owned / Senior citizen — country-specific discounts",
                "Bulk seat purchase (>10 seats) — automatic 20% off Enterprise",
              ].map((d) => (
                <div key={d} className="flex items-center justify-between rounded-md border p-2"><span>{d}</span><Switch defaultChecked /></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Currency & FX</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3"><Label>Base reporting currency</Label><Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-3"><Label>FX source</Label><Select defaultValue="oxr"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="oxr">Open Exchange Rates (daily)</SelectItem><SelectItem value="ecb">ECB reference</SelectItem><SelectItem value="manual">Manual override</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-3"><Label>FX margin</Label><Input defaultValue="2%" /></div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Round to local nice numbers (.99 / .00)" on />
                  <Toggle label="Re-quote when FX moves >5%" on />
                  <Toggle label="Allow user to lock currency on first payment" on />
                  <Toggle label="Accept crypto (BTC, USDT) at checkout" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Tax handling</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["UAE", "5% VAT", "Inclusive"],
                  ["Saudi Arabia", "15% VAT", "Inclusive"],
                  ["India", "18% GST", "Exclusive"],
                  ["EU (per country)", "17–27% VAT (OSS)", "Inclusive"],
                  ["UK", "20% VAT", "Inclusive"],
                  ["Singapore", "9% GST", "Inclusive"],
                  ["US (per state)", "Sales tax (Stripe Tax)", "Exclusive"],
                ].map((t) => (
                  <div key={t[0]} className="grid grid-cols-3 items-center gap-2 border-b pb-2">
                    <span className="font-medium">{t[0]}</span>
                    <span className="text-muted-foreground">{t[1]}</span>
                    <Select defaultValue={t[2].toLowerCase()}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inclusive">Inclusive</SelectItem><SelectItem value="exclusive">Exclusive</SelectItem></SelectContent></Select>
                  </div>
                ))}
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Auto-validate VAT/GST numbers (B2B reverse charge)" on />
                  <Toggle label="Generate compliant tax invoices (per region)" on />
                  <Toggle label="Apply OSS one-stop-shop for EU" on />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Scheduled price changes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { plan: "Pro", change: "$29 → $34/mo · USD", eff: "Jul 1, 2026", scope: "New customers only · existing grandfathered 12 mo", status: "Pending approval" },
                { plan: "Investor Club", change: "Add AED 1,099/mo (SuccessPay + Mamo)", eff: "May 20, 2026", scope: "Region launch", status: "Approved" },
                { plan: "Elite", change: "INR 4,999 → INR 5,499/mo", eff: "Aug 15, 2026", scope: "All Indian customers", status: "Draft" },
              ].map((c, i) => (
                <div key={i} className="rounded-md border p-3 flex items-start justify-between">
                  <div>
                    <div className="font-medium">{c.plan}: {c.change}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Effective {c.eff} · {c.scope}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === "Approved" ? "default" : c.status === "Draft" ? "outline" : "secondary"}>{c.status}</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Grandfathering & migration</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                "Lock existing subscribers at current price for 12 months after change",
                "Notify affected users 30 / 14 / 3 days before price change",
                "Offer 1-year prepay at old price as save-flow option",
                "Honor lifetime locked pricing for 'Founding Member' badge holders",
                "Auto-migrate legacy 'Plus 2024' subscribers to Pro at end of term",
                "Require admin (4-eyes) approval for any price increase >10%",
              ].map((p) => (
                <div key={p} className="flex items-center justify-between rounded-md border p-3"><span>{p}</span><Switch defaultChecked /></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-muted-foreground">{hint}</div></CardContent></Card>;
}
function Toggle({ label, on }: { label: string; on?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal">{label}</Label><Switch defaultChecked={on} /></div>;
}
