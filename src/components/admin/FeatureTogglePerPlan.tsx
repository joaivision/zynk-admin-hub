import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, Briefcase, Sparkles, Database, PieChart, Users, ShoppingBag,
  MessageSquare, Calendar, Search as SearchIcon, GraduationCap, Shield,
  Rocket, Crown, Star, Zap, Gift, Save, Copy, History, Eye,
} from "lucide-react";

const PLANS = [
  { id: "free", name: "Free", icon: Users, color: "text-slate-500" },
  { id: "starter", name: "Starter", icon: Zap, color: "text-sky-500" },
  { id: "pro", name: "Pro", icon: Star, color: "text-violet-500" },
  { id: "elite", name: "Elite", icon: Crown, color: "text-amber-500" },
  { id: "founder", name: "Founder Club", icon: Rocket, color: "text-rose-500" },
  { id: "investor", name: "Investor Club", icon: Briefcase, color: "text-emerald-600" },
  { id: "enterprise", name: "Enterprise", icon: Briefcase, color: "text-zinc-700" },
] as const;

type PlanId = (typeof PLANS)[number]["id"];
type Cell = boolean | string;

type Feature = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  type: "toggle" | "quota";
  unit?: string;
  values: Record<PlanId, Cell>;
};

const GROUPS: { group: string; features: Feature[] }[] = [
  {
    group: "Networking & Matching",
    features: [
      { id: "swipes", name: "Daily swipe limit", desc: "Right-swipes per day in match feed", icon: Heart, type: "quota", unit: "/day",
        values: { free: "10", starter: "50", pro: "Unlimited", elite: "Unlimited", founder: "Unlimited", investor: "Unlimited", enterprise: "Unlimited" } },
      { id: "advanced_filters", name: "Advanced filters", desc: "Industry, stage, cheque size, intent filters", icon: SearchIcon, type: "toggle",
        values: { free: false, starter: true, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "see_who_liked", name: "See who liked you", desc: "Reveal incoming likes before swiping", icon: Eye, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "boosts", name: "Profile boosts", desc: "24h profile amplification credits", icon: Sparkles, type: "quota", unit: "/mo",
        values: { free: "0", starter: "1", pro: "5", elite: "20", founder: "50", investor: "50", enterprise: "Unlimited" } },
    ],
  },
  {
    group: "Messaging",
    features: [
      { id: "messaging", name: "Direct messaging", desc: "Send DMs to matches and connections", icon: MessageSquare, type: "toggle",
        values: { free: true, starter: true, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "message_quota", name: "Monthly message quota", desc: "Outbound messages per month", icon: MessageSquare, type: "quota", unit: "/mo",
        values: { free: "50", starter: "500", pro: "5,000", elite: "Unlimited", founder: "Unlimited", investor: "Unlimited", enterprise: "Unlimited" } },
      { id: "intro_msg", name: "Intro messages (no match)", desc: "Reach out without prior match", icon: MessageSquare, type: "quota", unit: "/mo",
        values: { free: "0", starter: "5", pro: "20", elite: "100", founder: "Unlimited", investor: "Unlimited", enterprise: "Unlimited" } },
    ],
  },
  {
    group: "Mentorship & Experts",
    features: [
      { id: "mentorship", name: "Mentorship & Experts", desc: "Browse and book expert sessions", icon: GraduationCap, type: "toggle",
        values: { free: true, starter: true, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "expert_credits", name: "Included session credits", desc: "Free 30-min expert sessions per month", icon: Gift, type: "quota", unit: "/mo",
        values: { free: "0", starter: "0", pro: "1", elite: "3", founder: "5", investor: "5", enterprise: "10" } },
      { id: "expert_discount", name: "Expert booking discount", desc: "Discount on paid expert sessions", icon: Gift, type: "quota", unit: "%",
        values: { free: "0%", starter: "5%", pro: "10%", elite: "20%", founder: "25%", investor: "25%", enterprise: "Custom" } },
      { id: "become_expert", name: "List yourself as Expert", desc: "Apply to monetize as a verified expert", icon: GraduationCap, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
    ],
  },
  {
    group: "Investor Access",
    features: [
      { id: "investor_directory", name: "Investor directory access", desc: "Browse verified investor profiles", icon: Briefcase, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "investor_intro", name: "Investor warm intros", desc: "AI-curated, double-opt-in introductions", icon: Sparkles, type: "quota", unit: "/mo",
        values: { free: "0", starter: "0", pro: "3", elite: "10", founder: "Unlimited", investor: "Unlimited", enterprise: "Unlimited" } },
      { id: "investor_club", name: "Investor Club membership", desc: "Access to syndicates, deal flow, SPVs", icon: Crown, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: false, founder: false, investor: true, enterprise: true } },
      { id: "deal_flow", name: "Deal flow pipeline", desc: "Curated weekly deal flow digest", icon: PieChart, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: false, founder: false, investor: true, enterprise: true } },
      { id: "syndicates", name: "Syndicates & SPVs", desc: "Co-invest via SPV vehicles", icon: Briefcase, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: false, founder: false, investor: true, enterprise: true } },
    ],
  },
  {
    group: "Fundraising Tools",
    features: [
      { id: "ai_pitch", name: "AI Pitch Deck Analysis", desc: "AI-powered deck scoring & feedback", icon: Sparkles, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: false, enterprise: true } },
      { id: "ai_pitch_quota", name: "Pitch analyses per month", desc: "Number of full deck reviews", icon: Sparkles, type: "quota", unit: "/mo",
        values: { free: "0", starter: "0", pro: "3", elite: "10", founder: "Unlimited", investor: "0", enterprise: "Unlimited" } },
      { id: "fundraising_crm", name: "Fundraising CRM", desc: "Track investor conversations & pipeline", icon: Briefcase, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: false, enterprise: true } },
      { id: "cap_table", name: "Cap Table Management", desc: "Manage equity, options, SAFEs, conversions", icon: PieChart, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: false, enterprise: true } },
      { id: "term_sheets", name: "Term sheet templates", desc: "Library of vetted term sheet templates", icon: PieChart, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "valuation", name: "Valuation tools", desc: "Comparable & DCF valuation calculators", icon: PieChart, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "investor_updates", name: "Investor updates", desc: "Branded monthly update sender", icon: MessageSquare, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: false, enterprise: true } },
    ],
  },
  {
    group: "Data Room",
    features: [
      { id: "data_room", name: "Data Room access", desc: "Secure document vault for diligence", icon: Database, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "data_room_storage", name: "Storage", desc: "Total storage included", icon: Database, type: "quota", unit: "",
        values: { free: "—", starter: "—", pro: "—", elite: "5 GB", founder: "25 GB", investor: "25 GB", enterprise: "Unlimited" } },
      { id: "data_room_users", name: "External viewers", desc: "Invited diligence reviewers per month", icon: Users, type: "quota", unit: "/mo",
        values: { free: "—", starter: "—", pro: "—", elite: "10", founder: "50", investor: "50", enterprise: "Unlimited" } },
      { id: "data_room_drm", name: "Watermark & DRM", desc: "Per-viewer watermarks, screenshot block", icon: Shield, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: false, founder: true, investor: true, enterprise: true } },
    ],
  },
  {
    group: "Marketplace & Hiring",
    features: [
      { id: "marketplace_rfq", name: "Marketplace RFQs", desc: "Post & receive vendor / service quotes", icon: ShoppingBag, type: "toggle",
        values: { free: false, starter: true, pro: true, elite: true, founder: true, investor: false, enterprise: true } },
      { id: "rfq_quota", name: "RFQs per month", desc: "Active requests-for-quote", icon: ShoppingBag, type: "quota", unit: "/mo",
        values: { free: "0", starter: "3", pro: "10", elite: "Unlimited", founder: "Unlimited", investor: "0", enterprise: "Unlimited" } },
      { id: "marketplace_commission", name: "Marketplace commission", desc: "Platform fee on closed deals", icon: ShoppingBag, type: "quota", unit: "",
        values: { free: "—", starter: "12%", pro: "10%", elite: "8%", founder: "5%", investor: "—", enterprise: "Custom" } },
      { id: "talent_post", name: "Job postings", desc: "Active listings on Talent Hiring board", icon: Briefcase, type: "quota", unit: "active",
        values: { free: "0", starter: "1", pro: "3", elite: "10", founder: "10", investor: "0", enterprise: "Unlimited" } },
    ],
  },
  {
    group: "Events",
    features: [
      { id: "events_attend", name: "Event attendance", desc: "RSVP to community events", icon: Calendar, type: "toggle",
        values: { free: true, starter: true, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "events_host", name: "Host events", desc: "Create & promote your own events", icon: Calendar, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "events_premium", name: "Members-only events", desc: "Invite-only premium gatherings", icon: Calendar, type: "toggle",
        values: { free: false, starter: false, pro: false, elite: true, founder: true, investor: true, enterprise: true } },
    ],
  },
  {
    group: "Visibility & Branding",
    features: [
      { id: "verified_badge", name: "Verified badge", desc: "Shown on profile & in feed", icon: Shield, type: "toggle",
        values: { free: false, starter: false, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
      { id: "search_priority", name: "Search ranking boost", desc: "Higher position in match & search results", icon: SearchIcon, type: "quota", unit: "",
        values: { free: "Standard", starter: "+10%", pro: "+25%", elite: "+50%", founder: "Top tier", investor: "Top tier", enterprise: "Top tier" } },
      { id: "custom_url", name: "Custom profile URL", desc: "zynk.ing/yourname", icon: Star, type: "toggle",
        values: { free: false, starter: true, pro: true, elite: true, founder: true, investor: true, enterprise: true } },
    ],
  },
  {
    group: "Support & SLA",
    features: [
      { id: "support", name: "Support channel", desc: "Help & response channel", icon: Shield, type: "quota", unit: "",
        values: { free: "Community", starter: "Email", pro: "Priority email", elite: "Live chat", founder: "Dedicated CSM", investor: "Dedicated CSM", enterprise: "24/7 + SLA" } },
      { id: "response_sla", name: "Response SLA", desc: "First response time", icon: Shield, type: "quota", unit: "",
        values: { free: "Best-effort", starter: "48h", pro: "24h", elite: "8h", founder: "2h", investor: "2h", enterprise: "1h" } },
    ],
  },
];

export function FeatureTogglePerPlan() {
  const [data, setData] = useState(GROUPS);
  const [query, setQuery] = useState("");

  const toggle = (groupIdx: number, featIdx: number, plan: PlanId) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const cur = next[groupIdx].features[featIdx].values[plan];
      if (typeof cur === "boolean") next[groupIdx].features[featIdx].values[plan] = !cur;
      return next;
    });
  };

  const updateQuota = (groupIdx: number, featIdx: number, plan: PlanId, val: string) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next[groupIdx].features[featIdx].values[plan] = val;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Toggles per Plan</h1>
          <p className="text-sm text-muted-foreground">Control which features and quotas are available on each subscription tier. Changes apply on next billing cycle unless overridden.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><History className="h-4 w-4" />Change history</Button>
          <Button variant="outline" size="sm" className="gap-1"><Copy className="h-4 w-4" />Copy from plan…</Button>
          <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" />Preview pricing page</Button>
          <Button size="sm" className="gap-1"><Save className="h-4 w-4" />Save changes</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-sm" placeholder="Search features…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Badge variant="secondary">{data.reduce((n, g) => n + g.features.length, 0)} features</Badge>
        <Badge variant="outline">{PLANS.length} plans</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm">Apply to all paid plans</Button>
          <Button variant="ghost" size="sm">Reset group to defaults</Button>
        </div>
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Feature matrix</TabsTrigger>
          <TabsTrigger value="overrides">Per-user overrides</TabsTrigger>
          <TabsTrigger value="rollout">Rollout & A/B</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="pt-4">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th className="text-left py-2 px-3 border-b w-[34%] min-w-[260px]">Feature</th>
                    {PLANS.map((p) => (
                      <th key={p.id} className="border-b py-2 px-2 text-center min-w-[110px]">
                        <div className="flex flex-col items-center gap-0.5">
                          <p.icon className={`h-4 w-4 ${p.color}`} />
                          <span className="text-xs font-semibold">{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((group, gi) => {
                    const visible = group.features.filter((f) => !query || f.name.toLowerCase().includes(query.toLowerCase()) || group.group.toLowerCase().includes(query.toLowerCase()));
                    if (!visible.length) return null;
                    return (
                      <>
                        <tr key={`g-${gi}`} className="bg-muted/40">
                          <td colSpan={PLANS.length + 1} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {group.group}
                          </td>
                        </tr>
                        {visible.map((f) => {
                          const fi = group.features.indexOf(f);
                          return (
                            <tr key={f.id} className="hover:bg-muted/30 group">
                              <td className="px-3 py-2 align-top border-b">
                                <div className="flex items-start gap-2">
                                  <f.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {f.name}
                                      <Badge variant={f.type === "quota" ? "outline" : "secondary"} className="text-[10px] py-0 h-4">{f.type === "quota" ? f.unit || "value" : "toggle"}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                                  </div>
                                </div>
                              </td>
                              {PLANS.map((p) => {
                                const v = f.values[p.id];
                                return (
                                  <td key={p.id} className="px-2 py-2 text-center border-b align-top">
                                    {f.type === "toggle" ? (
                                      <Switch checked={!!v} onCheckedChange={() => toggle(gi, fi, p.id)} />
                                    ) : (
                                      <Input
                                        value={String(v)}
                                        onChange={(e) => updateQuota(gi, fi, p.id, e.target.value)}
                                        className="h-7 text-center text-xs px-1"
                                      />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Grant or revoke specific features for individual users (e.g. VIP, beta testers, partners). Overrides take precedence over plan defaults.</p>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-left">Feature</th><th className="px-3 py-2 text-left">Override</th><th className="px-3 py-2 text-left">Until</th><th className="px-3 py-2 text-left">By</th></tr></thead>
              <tbody className="divide-y">
                {[
                  ["@aarav.r", "Pro", "AI Pitch Analysis", "Unlimited", "30 Jun", "admin:noor"],
                  ["@sara_vc", "Investor Club", "Cap Table Mgmt", "Enabled", "Forever", "admin:rajiv"],
                  ["@beta_test_42", "Free", "Investor directory", "Enabled (beta)", "30d", "system"],
                  ["@partner_a16", "Enterprise", "Marketplace fee", "0%", "Forever", "admin:rajiv"],
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="rollout" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Gradually roll out new features by plan with percentage targeting and A/B variants.</p>
            {[
              { f: "AI Pitch Analysis v2", p: "Pro · Elite", pct: 25, ab: "A/B vs v1 · primary metric: deck completion" },
              { f: "New Cap Table editor", p: "Elite · Founder", pct: 50, ab: "Holdout 10%" },
              { f: "Marketplace bulk RFQ", p: "Enterprise", pct: 100, ab: "GA · monitoring 7d" },
              { f: "Investor warm-intro AI v3", p: "Investor Club", pct: 10, ab: "Canary" },
            ].map((r, i) => (
              <div key={i} className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{r.f}</div>
                  <div className="text-xs text-muted-foreground">Plans: {r.p} · {r.ab}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.pct === 100 ? "default" : "secondary"}>{r.pct}%</Badge>
                  <Button variant="ghost" size="sm">Adjust</Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dependencies" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3 text-sm">
            <p className="text-muted-foreground">Features may depend on others. Disabling a parent automatically disables children downstream.</p>
            {[
              { p: "Investor Club membership", c: ["Deal flow pipeline", "Syndicates & SPVs", "Investor warm intros (boost)"] },
              { p: "Data Room access", c: ["External viewers quota", "Watermark & DRM", "Storage quota"] },
              { p: "Cap Table Management", c: ["Term sheet templates (write)", "Investor updates (equity widget)"] },
              { p: "AI Pitch Analysis", c: ["Pitch analyses quota", "AI Pitch Coach chat"] },
              { p: "Fundraising CRM", c: ["Investor updates", "Pipeline analytics"] },
              { p: "Marketplace RFQs", c: ["RFQ quota", "Vendor messaging", "Marketplace commission tier"] },
            ].map((d, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="font-medium">{d.p}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {d.c.map((x) => <Badge key={x} variant="outline" className="text-xs">{x}</Badge>)}
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
