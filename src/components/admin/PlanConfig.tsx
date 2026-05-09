import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Copy, Archive, GripVertical, Crown, Sparkles, Zap, Users, Briefcase,
  TrendingUp, Globe, Calendar, Gift, AlertTriangle, FileText, Eye, Star, Rocket,
} from "lucide-react";

const PLANS = [
  { id: "free", name: "Free", icon: Users, tagline: "Discover Zynk.ing", color: "bg-slate-500", monthly: 0, yearly: 0, currency: "USD", trialDays: 0, audience: "All users", subs: 124_812, mrr: 0, status: "Live", visible: true, sortable: true, badge: null },
  { id: "starter", name: "Starter", icon: Zap, tagline: "Get serious about networking", color: "bg-sky-500", monthly: 9, yearly: 90, currency: "USD", trialDays: 7, audience: "Individuals", subs: 18_412, mrr: 165_708, status: "Live", visible: true, sortable: true, badge: null },
  { id: "pro", name: "Pro", icon: Star, tagline: "Most popular for builders", color: "bg-violet-500", monthly: 29, yearly: 290, currency: "USD", trialDays: 14, audience: "Founders, Experts", subs: 12_431, mrr: 360_499, status: "Live", visible: true, sortable: true, badge: "Most popular" },
  { id: "elite", name: "Elite", icon: Crown, tagline: "Unlimited everything", color: "bg-amber-500", monthly: 99, yearly: 990, currency: "USD", trialDays: 14, audience: "Power users", subs: 1_842, mrr: 182_358, status: "Live", visible: true, sortable: true, badge: "Best value" },
  { id: "founder-club", name: "Founder Club", icon: Rocket, tagline: "Curated founder cohort", color: "bg-rose-500", monthly: 199, yearly: 1990, currency: "USD", trialDays: 0, audience: "Verified founders only", subs: 612, mrr: 121_788, status: "Invite-only", visible: false, sortable: true, badge: "Application required" },
  { id: "investor-club", name: "Investor Club", icon: Briefcase, tagline: "Deal flow + syndicates", color: "bg-emerald-600", monthly: 299, yearly: 2990, currency: "USD", trialDays: 0, audience: "Accredited investors", subs: 421, mrr: 125_879, status: "Invite-only", visible: false, sortable: true, badge: "Accreditation required" },
  { id: "enterprise", name: "Enterprise", icon: Briefcase, tagline: "Custom for teams & funds", color: "bg-zinc-700", monthly: null, yearly: null, currency: "USD", trialDays: 30, audience: "Funds, accelerators, corporates", subs: 87, mrr: 412_000, status: "Sales-led", visible: true, sortable: true, badge: "Talk to sales" },
];

export function PlanConfig() {
  const [selected, setSelected] = useState(PLANS[2]);

  const totalMRR = PLANS.reduce((s, p) => s + p.mrr, 0);
  const totalSubs = PLANS.reduce((s, p) => s + p.subs, 0);
  const arpu = totalMRR / totalSubs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan Config</h1>
          <p className="text-sm text-muted-foreground">Define subscription tiers, trials, billing cycles, regional pricing, and feature entitlements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" />Preview pricing page</Button>
          <Button variant="outline" size="sm" className="gap-1"><Copy className="h-4 w-4" />Duplicate plan</Button>
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New plan</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KPI label="Active plans" value={PLANS.filter((p) => p.status === "Live").length.toString()} hint={`${PLANS.length} total`} />
        <KPI label="Total subscribers" value={totalSubs.toLocaleString()} hint="across all paid + free" />
        <KPI label="Monthly Recurring Revenue" value={`$${totalMRR.toLocaleString()}`} hint="USD equivalent" />
        <KPI label="Blended ARPU" value={`$${arpu.toFixed(2)}`} hint="per active user / month" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Plans (drag to reorder)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left rounded-md border p-3 transition hover:bg-muted/40 ${selected.id === p.id ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className={`h-8 w-8 rounded-md ${p.color} grid place-items-center text-white shrink-0`}><p.icon className="h-4 w-4" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      {p.badge && <Badge variant="secondary" className="text-xs">{p.badge}</Badge>}
                      <Badge variant={p.status === "Live" ? "default" : "outline"} className="text-xs">{p.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">{p.monthly === null ? "Custom" : p.monthly === 0 ? "Free" : `$${p.monthly}/mo`}</div>
                    <div className="text-xs text-muted-foreground">{p.subs.toLocaleString()} subs</div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <span className={`h-9 w-9 rounded-md ${selected.color} grid place-items-center text-white`}><selected.icon className="h-4 w-4" /></span>
              <div>
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{selected.tagline}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="gap-1"><Archive className="h-3.5 w-3.5" />Archive</Button>
              <Button size="sm">Save changes</Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="trials">Trials</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Plan name</Label><Input defaultValue={selected.name} /></div>
                  <div><Label>Internal slug</Label><Input defaultValue={selected.id} className="font-mono" /></div>
                </div>
                <div><Label>Tagline (shown on pricing page)</Label><Input defaultValue={selected.tagline} /></div>
                <div><Label>Description</Label><Textarea rows={3} placeholder="What this plan is for and who it's best suited to." /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Plan family</Label><Select defaultValue="consumer"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consumer">Consumer</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="club">Club / Invite-only</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select></div>
                  <div><Label>Tier rank</Label><Input type="number" defaultValue={3} /></div>
                  <div><Label>Replaces (legacy plan)</Label><Input placeholder="e.g. plus-2024" /></div>
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Available for new signups" on />
                  <Toggle label="Allow upgrade from lower tiers" on />
                  <Toggle label="Allow downgrade from higher tiers" on />
                  <Toggle label="Stackable add-ons (boosts, credits, seats)" on />
                  <Toggle label="Requires email verification" on />
                  <Toggle label="Requires KYC level 1" />
                  <Toggle label="Requires KYC level 2 (accreditation)" />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Monthly price</Label><Input type="number" defaultValue={selected.monthly ?? 0} /></div>
                  <div><Label>Yearly price</Label><Input type="number" defaultValue={selected.yearly ?? 0} /></div>
                  <div><Label>Default currency</Label><Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["USD","AED","INR","SAR","EUR","GBP","SGD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Yearly discount</Label><Input defaultValue="2 months free (~17%)" /></div>
                  <div><Label>Quarterly option</Label><Input placeholder="$79 / quarter" /></div>
                  <div><Label>Setup / one-time fee</Label><Input type="number" defaultValue={0} /></div>
                </div>

                <div className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5"><Globe className="h-4 w-4" />Regional pricing (PPP-adjusted)</Label>
                    <Switch defaultChecked />
                  </div>
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left py-1">Region</th><th className="text-left">Currency</th><th className="text-left">Monthly</th><th className="text-left">Yearly</th><th className="text-left">Tax</th></tr></thead>
                    <tbody>
                      {[
                        ["UAE", "AED", "109", "1,090", "5% VAT incl."],
                        ["Saudi Arabia", "SAR", "109", "1,090", "15% VAT incl."],
                        ["India", "INR", "1,499", "14,990", "18% GST excl."],
                        ["EU", "EUR", "27", "270", "VAT by country"],
                        ["UK", "GBP", "23", "230", "20% VAT incl."],
                        ["Singapore", "SGD", "39", "390", "9% GST incl."],
                      ].map((r) => (
                        <tr key={r[0]} className="border-t"><td className="py-1.5">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td className="text-muted-foreground">{r[4]}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Tax-inclusive display by region" on />
                  <Toggle label="Round to local nice numbers (.99 / .00)" on />
                  <Toggle label="Allow custom enterprise pricing override" on />
                  <Toggle label="Enable proration on upgrade" on />
                  <Toggle label="Enable proration on downgrade (credit balance)" />
                  <Toggle label="Auto-grandfather existing subscribers on price change" on />
                  <Toggle label="Smart dunning (retry failed cards)" on />
                </div>
              </TabsContent>

              <TabsContent value="trials" className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Free trial length (days)</Label><Input type="number" defaultValue={selected.trialDays} /></div>
                  <div><Label>Card required for trial</Label><Select defaultValue="optional"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="required">Required</SelectItem><SelectItem value="optional">Optional</SelectItem><SelectItem value="none">No card</SelectItem></SelectContent></Select></div>
                  <div><Label>Trial limited to</Label><Select defaultValue="once"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="once">Once per user</SelectItem><SelectItem value="device">Once per device</SelectItem><SelectItem value="payment">Once per payment method</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Send 'trial ending' email at T-3 days" on />
                  <Toggle label="Send 'trial ended' summary with usage" on />
                  <Toggle label="Convert silently if card on file" on />
                  <Toggle label="Pause access at trial end (vs degrade to Free)" />
                  <Toggle label="Enable money-back guarantee (14 days)" />
                  <Toggle label="Block trial abuse (device + email + IP fingerprint)" on />
                </div>
              </TabsContent>

              <TabsContent value="eligibility" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Minimum age</Label><Input type="number" defaultValue={18} /></div>
                  <div><Label>Required stakeholder type</Label><Input defaultValue="Any" placeholder="e.g. Investor, Founder" /></div>
                  <div><Label>Allowed countries</Label><Input placeholder="All except sanctions list" /></div>
                  <div><Label>Excluded countries</Label><Input placeholder="OFAC list" /></div>
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Require accreditation (investor proof)" />
                  <Toggle label="Require employer / company verification" />
                  <Toggle label="Require LinkedIn or domain email" />
                  <Toggle label="Application + manual approval" />
                  <Toggle label="Restrict to corporate domains only" />
                  <Toggle label="Block users with active chargebacks / suspensions" on />
                </div>
              </TabsContent>

              <TabsContent value="lifecycle" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Auto-renew</Label><Select defaultValue="on"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on">On</SelectItem><SelectItem value="off">Off</SelectItem><SelectItem value="opt-in">User opt-in</SelectItem></SelectContent></Select></div>
                  <div><Label>Cancellation policy</Label><Select defaultValue="end"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="end">At period end</SelectItem><SelectItem value="immediate">Immediate + refund prorated</SelectItem><SelectItem value="immediate-noref">Immediate, no refund</SelectItem></SelectContent></Select></div>
                  <div><Label>Pause subscription</Label><Select defaultValue="3m"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="off">Disabled</SelectItem><SelectItem value="1m">Up to 1 month</SelectItem><SelectItem value="3m">Up to 3 months</SelectItem><SelectItem value="6m">Up to 6 months</SelectItem></SelectContent></Select></div>
                  <div><Label>Grace period after failed payment</Label><Select defaultValue="7"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3 days</SelectItem><SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Cancellation save-flow (offer pause / discount)" on />
                  <Toggle label="Win-back campaign 30 days post-cancel" on />
                  <Toggle label="Downgrade to Free instead of full cancel" on />
                  <Toggle label="Show exit survey on cancel" on />
                  <Toggle label="Allow plan switch immediately (proration)" on />
                  <Toggle label="Auto-convert from trial silently if card on file" on />
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Public visibility</Label><Select defaultValue={selected.visible ? "public" : "hidden"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public on pricing page</SelectItem><SelectItem value="hidden">Hidden (direct link only)</SelectItem><SelectItem value="invite">Invite-only</SelectItem></SelectContent></Select></div>
                  <div><Label>Highlight badge</Label><Input defaultValue={selected.badge ?? ""} placeholder="e.g. Most popular" /></div>
                  <div><Label>Color accent</Label><Input defaultValue={selected.color.replace("bg-", "")} className="font-mono" /></div>
                  <div><Label>Sort order</Label><Input type="number" defaultValue={3} /></div>
                </div>
                <div><Label>Marketing bullets (one per line, shown on pricing card)</Label>
                  <Textarea rows={6} defaultValue={"Unlimited swipes & matches\n10 boosts / month\nAI Pitch Coach\nAdvanced filters\nPriority support"} />
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Show on /pricing landing page" on />
                  <Toggle label="Show in in-app upgrade prompts" on />
                  <Toggle label="Show in compare-plans table" on />
                  <Toggle label="Featured in onboarding plan picker" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4" />Add-ons & one-time purchases</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { n: "Profile Boost (24h)", p: "$4.99", u: "12,431 / mo" },
              { n: "Boost Pack ×10", p: "$39", u: "2,104 / mo" },
              { n: "Expert Session Credits ×5", p: "$99", u: "812 / mo" },
              { n: "Extra messaging quota (+500)", p: "$9", u: "1,442 / mo" },
              { n: "Verified badge", p: "$14.99 one-time", u: "8,210 total" },
              { n: "Additional team seat (Enterprise)", p: "$19/seat/mo", u: "1,247 seats" },
            ].map((a) => (
              <div key={a.n} className="flex items-center justify-between rounded-md border p-2">
                <div><div className="font-medium">{a.n}</div><div className="text-xs text-muted-foreground">{a.u}</div></div>
                <Badge variant="secondary">{a.p}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Plan economics (last 30d)</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="text-left px-2 py-1.5">Plan</th><th className="text-left">Subs</th><th className="text-left">MRR</th><th className="text-left">Trial→paid</th><th className="text-left">Churn</th></tr></thead>
              <tbody className="divide-y">
                {[
                  ["Starter", "18,412", "$165k", "42%", "4.1%"],
                  ["Pro", "12,431", "$360k", "58%", "2.8%"],
                  ["Elite", "1,842", "$182k", "71%", "1.4%"],
                  ["Founder Club", "612", "$122k", "—", "0.9%"],
                  ["Investor Club", "421", "$126k", "—", "0.6%"],
                  ["Enterprise", "87", "$412k", "—", "0.0%"],
                ].map((r) => (
                  <tr key={r[0] as string}><td className="px-2 py-1.5 font-medium">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Scheduled price & plan changes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { i: AlertTriangle, t: "Pro plan: $29 → $34/mo", w: "Effective Jul 1, 2026", n: "Existing subs grandfathered for 12 months. Email blast scheduled T-30." },
            { i: Sparkles, t: "Launch new plan 'Pro+' ($49)", w: "Effective Jun 15, 2026", n: "Slots above Pro, below Elite. Currently in draft." },
            { i: FileText, t: "Investor Club: AED pricing live", w: "Effective May 20, 2026", n: "Adds AED 1,099/mo via SuccessPay + Mamo." },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border p-3">
              <c.i className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1"><div className="font-medium text-sm">{c.t}</div><div className="text-xs text-muted-foreground">{c.w} · {c.n}</div></div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card><CardContent className="pt-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </CardContent></Card>
  );
}
function Toggle({ label, on }: { label: string; on?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal">{label}</Label><Switch defaultChecked={on} /></div>;
}
