import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search, Download, Filter, RefreshCw, Pause, Play, X, ArrowUpRight,
  ArrowDownRight, Repeat, AlertTriangle, CreditCard, TrendingUp, TrendingDown,
  Users, DollarSign, Activity, Clock, MoreHorizontal, Mail, FileText, Crown,
} from "lucide-react";

const SUBS = [
  { user: "Aarav Rastogi", handle: "@aarav.r", initials: "AR", plan: "Pro", cycle: "Yearly", price: "$290", status: "Active", method: "Stripe · Visa •4242", country: "🇦🇪 UAE", started: "Apr 12, 2024", renews: "Apr 12, 2026", mrr: 24.17, ltv: 1240, churnRisk: "Low" },
  { user: "Sara Mendoza", handle: "@sara_vc", initials: "SM", plan: "Investor Club", cycle: "Yearly", price: "$2,990", status: "Active", method: "Stripe · Amex •0008", country: "🇺🇸 US", started: "Jan 04, 2024", renews: "Jan 04, 2026", mrr: 249.17, ltv: 4980, churnRisk: "Low" },
  { user: "Ravi Iyer", handle: "@ravi.fund", initials: "RI", plan: "Elite", cycle: "Monthly", price: "$99", status: "Past due", method: "Razorpay · UPI", country: "🇮🇳 IN", started: "Sep 18, 2024", renews: "Retrying May 11", mrr: 99, ltv: 792, churnRisk: "High" },
  { user: "Noor Al-Khalid", handle: "@noor.x", initials: "NK", plan: "Founder Club", cycle: "Yearly", price: "AED 7,490", status: "Active", method: "SuccessPay · Mada", country: "🇸🇦 SA", started: "Feb 20, 2025", renews: "Feb 20, 2026", mrr: 169.99, ltv: 2040, churnRisk: "Low" },
  { user: "Jonas Weber", handle: "@dev_jonas", initials: "JW", plan: "Starter", cycle: "Monthly", price: "€8", status: "Trialing", method: "Mamo · Apple Pay", country: "🇩🇪 DE", started: "May 02, 2026", renews: "Trial ends May 16", mrr: 0, ltv: 0, churnRisk: "Med" },
  { user: "Maya Krishnan", handle: "@maya.k", initials: "MK", plan: "Pro", cycle: "Monthly", price: "$29", status: "Cancelled", method: "Stripe · Mastercard •1331", country: "🇸🇬 SG", started: "Aug 11, 2024", renews: "Ends Jun 11, 2026", mrr: 29, ltv: 290, churnRisk: "—" },
  { user: "Khalid Mansour", handle: "@khalid.m", initials: "KM", plan: "Pro", cycle: "Yearly", price: "AED 1,090", status: "Paused", method: "CAPShield wallet", country: "🇦🇪 UAE", started: "Mar 30, 2025", renews: "Resumes Aug 1", mrr: 0, ltv: 880, churnRisk: "Med" },
  { user: "Lin Chen", handle: "@lin.builder", initials: "LC", plan: "Elite", cycle: "Yearly", price: "$990", status: "Active", method: "Stripe · Visa •9912", country: "🇸🇬 SG", started: "Nov 02, 2024", renews: "Nov 02, 2026", mrr: 82.5, ltv: 1485, churnRisk: "Low" },
  { user: "Aisha Bello", handle: "@aisha.b", initials: "AB", plan: "Pro", cycle: "Monthly", price: "$29", status: "Active", method: "Stripe · Visa •6612", country: "🇳🇬 NG", started: "Dec 18, 2024", renews: "Jun 18, 2026", mrr: 29, ltv: 174, churnRisk: "Low" },
  { user: "Acme Ventures (Team)", handle: "team_acme", initials: "AV", plan: "Enterprise", cycle: "Yearly", price: "$48,000", status: "Active", method: "ACH · Wire", method2: "PO #4421", country: "🇺🇸 US", started: "Oct 01, 2024", renews: "Oct 01, 2026", mrr: 4000, ltv: 32000, churnRisk: "Low" },
];

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Trialing: "secondary",
  "Past due": "destructive",
  Paused: "outline",
  Cancelled: "outline",
};

export function ActiveSubscriptions() {
  const [query, setQuery] = useState("");

  const filtered = SUBS.filter((s) => !query || (s.user + s.handle + s.plan + s.country).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Live ledger of every subscription. Monitor MRR, churn, dunning, and act on at-risk accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4" />Sync providers</Button>
          <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" />Export CSV</Button>
          <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" />Generate invoices</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KPI icon={Users} label="Active subs" value="33,805" delta="+412 / 30d" up />
        <KPI icon={DollarSign} label="MRR" value="$1.36M" delta="+4.8% MoM" up />
        <KPI icon={TrendingUp} label="ARR" value="$16.4M" delta="+58% YoY" up />
        <KPI icon={Activity} label="Net retention" value="112%" delta="upgrades > churn" up />
        <KPI icon={TrendingDown} label="Churn (logo)" value="2.4%" delta="−0.3 pts" up />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Mini label="Trialing" value="1,842" sub="42% likely to convert" />
        <Mini label="Past due / dunning" value="287" sub="$8,412 at risk" tone="destructive" />
        <Mini label="Paused" value="412" sub="avg 47d resume" />
        <Mini label="Scheduled to cancel" value="194" sub="renews skipped" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trialing">Trialing</TabsTrigger>
          <TabsTrigger value="dunning">Past due / Dunning</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4 space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by user, email, plan, country, payment method…" className="pl-9 h-9" />
                </div>
                <Select defaultValue="any-plan"><SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any-plan">All plans</SelectItem><SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="elite">Elite</SelectItem><SelectItem value="founder">Founder Club</SelectItem><SelectItem value="investor">Investor Club</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select>
                <Select defaultValue="any-cycle"><SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any-cycle">Any cycle</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select>
                <Select defaultValue="any-method"><SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any-method">Any payment method</SelectItem><SelectItem value="stripe">Stripe</SelectItem><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="successpay">SuccessPay</SelectItem><SelectItem value="mamo">Mamo</SelectItem><SelectItem value="binance">Binance Pay</SelectItem><SelectItem value="capshield">CAPShield</SelectItem></SelectContent></Select>
                <Button variant="outline" size="sm" className="gap-1 h-9"><Filter className="h-4 w-4" />More filters</Button>
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{filtered.length.toLocaleString()} subscriptions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1"><Mail className="h-4 w-4" />Bulk message</Button>
                  <Button variant="outline" size="sm" className="gap-1"><Repeat className="h-4 w-4" />Bulk retry payment</Button>
                  <Button variant="outline" size="sm" className="gap-1"><ArrowUpRight className="h-4 w-4" />Bulk upgrade</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="px-2 py-2 text-left">Customer</th>
                    <th className="px-2 py-2 text-left">Plan / Cycle</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-left">Price</th>
                    <th className="px-2 py-2 text-left">MRR</th>
                    <th className="px-2 py-2 text-left">Payment method</th>
                    <th className="px-2 py-2 text-left">Started</th>
                    <th className="px-2 py-2 text-left">Renews</th>
                    <th className="px-2 py-2 text-left">Risk</th>
                    <th className="px-2 py-2 text-right">—</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s) => (
                    <tr key={s.handle} className="hover:bg-muted/30">
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-primary/10 text-primary">{s.initials}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{s.user}</div>
                            <div className="text-xs text-muted-foreground">{s.handle} · {s.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          {s.plan === "Founder Club" || s.plan === "Investor Club" || s.plan === "Enterprise" ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : null}
                          <span className="font-medium">{s.plan}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{s.cycle}</div>
                      </td>
                      <td className="px-2 py-2"><Badge variant={STATUS_TONE[s.status]}>{s.status}</Badge></td>
                      <td className="px-2 py-2 font-medium">{s.price}</td>
                      <td className="px-2 py-2">${s.mrr.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs text-muted-foreground"><CreditCard className="inline h-3 w-3 mr-1" />{s.method}</td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">{s.started}</td>
                      <td className="px-2 py-2 text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{s.renews}</td>
                      <td className="px-2 py-2"><Badge variant={s.churnRisk === "High" ? "destructive" : s.churnRisk === "Med" ? "secondary" : "outline"}>{s.churnRisk}</Badge></td>
                      <td className="px-2 py-2 text-right"><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dunning" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Dunning queue · 287 subs · $8,412 at risk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { u: "@ravi.fund", p: "Elite · $99", retry: "1 of 4", next: "in 14h", reason: "card_declined: insufficient_funds", method: "Razorpay UPI" },
                { u: "@founder_x", p: "Pro · $29", retry: "3 of 4", next: "in 2d", reason: "card_declined: do_not_honor", method: "Stripe Visa" },
                { u: "@team_alpha", p: "Enterprise · $4,000", retry: "Manual", next: "—", reason: "ACH return: insufficient", method: "ACH" },
                { u: "@trader_z", p: "Pro · $29", retry: "Final", next: "today", reason: "3DS challenge expired", method: "Mamo Apple Pay" },
              ].map((d, i) => (
                <div key={i} className="rounded-md border p-3 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium">{d.u} · {d.p}</div>
                    <div className="text-xs text-muted-foreground">{d.method} · {d.reason}</div>
                  </div>
                  <Badge variant="outline">Retry {d.retry}</Badge>
                  <Badge variant="secondary">Next attempt {d.next}</Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="gap-1"><Repeat className="h-3.5 w-3.5" />Retry now</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Mail className="h-3.5 w-3.5" />Update card link</Button>
                    <Button variant="ghost" size="sm" className="gap-1"><X className="h-3.5 w-3.5" />Cancel</Button>
                  </div>
                </div>
              ))}
              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                Smart dunning enabled · retries at 0h, 24h, 72h, 168h · auto-downgrade to Free on final failure · win-back email at +14d.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trialing" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            {[
              { u: "@dev_jonas", p: "Starter (€8/mo)", left: "7 days", usage: 72, sig: "Posted 2 events · joined 1 club" },
              { u: "@sara.builds", p: "Pro ($29/mo)", left: "3 days", usage: 92, sig: "Booked expert session · 12 matches" },
              { u: "@anon_user_42", p: "Pro ($29/mo)", left: "12 days", usage: 18, sig: "Low engagement — risk of trial expiry without convert" },
            ].map((t, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div><div className="font-medium">{t.u} · {t.p}</div><div className="text-xs text-muted-foreground">{t.sig}</div></div>
                  <Badge variant="secondary">{t.left} left</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2"><Progress value={t.usage} className="h-1.5 flex-1" /><span className="text-xs text-muted-foreground">{t.usage}% engaged</span></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="paused" className="pt-4">
          <Card><CardContent className="pt-6 space-y-2 text-sm">
            {[
              ["@khalid.m · Pro", "Resumes Aug 1, 2026", "User-paused (3-mo)"],
              ["@old_founder · Founder Club", "Resumes Jul 12, 2026", "Save-flow accepted"],
              ["@ana.vc · Investor Club", "Resumes Jun 30, 2026", "User-paused (1-mo)"],
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div><div className="font-medium">{r[0]}</div><div className="text-xs text-muted-foreground">{r[2]}</div></div>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{r[1]}</span><Button variant="outline" size="sm" className="gap-1"><Play className="h-3.5 w-3.5" />Resume</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cancelled" className="pt-4">
          <Card><CardContent className="pt-6 space-y-2 text-sm">
            {[
              ["@maya.k · Pro", "Cancels Jun 11, 2026", "Reason: Too expensive", "Win-back: 20% off 6mo sent"],
              ["@founder_n · Elite", "Cancels Jul 02, 2026", "Reason: Switching to competitor", "Win-back: pending"],
              ["@coach_s · Pro (annual)", "Cancels Sep 15, 2026", "Reason: Built it in-house", "—"],
            ].map((r, i) => (
              <div key={i} className="rounded-md border p-3 flex items-center justify-between">
                <div><div className="font-medium">{r[0]}</div><div className="text-xs text-muted-foreground">{r[2]} · {r[3]}</div></div>
                <div className="flex items-center gap-2"><Badge variant="outline">{r[1]}</Badge><Button variant="outline" size="sm" className="gap-1"><Pause className="h-3.5 w-3.5" />Offer pause</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="enterprise" className="pt-4">
          <Card><CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Account</th><th className="px-3 py-2 text-left">Seats</th><th className="px-3 py-2 text-left">Contract value</th><th className="px-3 py-2 text-left">Term</th><th className="px-3 py-2 text-left">Renewal</th><th className="px-3 py-2 text-left">CSM</th><th className="px-3 py-2 text-left">Health</th></tr></thead>
              <tbody className="divide-y">
                {[
                  ["Acme Ventures", "120 / 200", "$48,000 / yr", "12-mo · NET-30", "Oct 01, 2026", "Noor", "92"],
                  ["Sequoia MENA", "45 / 50", "$22,000 / yr", "12-mo · NET-30", "Mar 15, 2027", "Rajiv", "88"],
                  ["A16 Crypto", "12 / 25", "$18,000 / yr", "12-mo · prepaid", "Dec 01, 2026", "Noor", "74"],
                  ["Antler MENA", "30 / 50", "$14,400 / yr", "12-mo · quarterly", "Aug 12, 2026", "Sara", "81"],
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    {r.slice(0, -1).map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
                    <td className="px-3 py-2"><div className="flex items-center gap-2"><Progress value={Number(r[6])} className="h-1.5 w-20" /><span className="text-xs">{r[6]}</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base">Lifecycle this month</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          {[
            ["New subs", "+1,842", "up"],
            ["Reactivations", "+312", "up"],
            ["Upgrades", "+612", "up"],
            ["Downgrades", "−187", "down"],
            ["Churn", "−921", "down"],
            ["Net adds", "+1,658", "up"],
          ].map((r) => (
            <div key={r[0]} className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{r[0]}</div>
              <div className="mt-1 text-lg font-bold flex items-center gap-1">
                {r[2] === "up" ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> : <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                {r[1]}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ icon: Icon, label, value, delta, up }: { icon: any; label: string; value: string; delta: string; up?: boolean }) {
  return (
    <Card><CardContent className="pt-5">
      <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className={`mt-1 text-xs flex items-center gap-1 ${up ? "text-emerald-600" : "text-rose-600"}`}>{up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{delta}</div>
    </CardContent></Card>
  );
}
function Mini({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "destructive" }) {
  return (
    <div className={`rounded-md border p-3 ${tone === "destructive" ? "border-destructive/40 bg-destructive/5" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
