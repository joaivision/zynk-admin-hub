import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight, Download, Mail, ExternalLink, CreditCard, Receipt, Users,
  Package, TrendingUp, TrendingDown, History, AlertCircle, CheckCircle2,
  Clock, RefreshCw, Pause, XCircle, ArrowUpRight, ArrowDownRight, Building2,
  FileText, Plus, Minus, Edit3, Shield
} from "lucide-react";

const sub = {
  id: "sub_1NQrA8DkLm",
  customer: "Northwind Capital",
  type: "Enterprise",
  contact: "ops@northwind.vc",
  avatar: "NC",
  plan: "Scale Annual",
  status: "active",
  seats: { used: 47, licensed: 60 },
  mrr: 4980,
  arr: 59760,
  startedAt: "Aug 12, 2024",
  renewsAt: "Aug 12, 2026",
  csm: "Lena Park",
  health: 92,
  region: "EU 🇩🇪",
  paymentMethod: "Visa •••• 4242 (exp 09/27)",
  billingEmail: "billing@northwind.vc",
};

const invoices = [
  { id: "INV-2026-0214", date: "Feb 12, 2026", amount: 4980, status: "paid", method: "Visa •••• 4242", period: "Feb 12 – Mar 11", url: "#" },
  { id: "INV-2026-0118", date: "Jan 12, 2026", amount: 4980, status: "paid", method: "Visa •••• 4242", period: "Jan 12 – Feb 11", url: "#" },
  { id: "INV-2025-1208", date: "Dec 12, 2025", amount: 5260, status: "paid", method: "ACH", period: "Dec 12 – Jan 11 · +1 seat add-on", url: "#" },
  { id: "INV-2025-1112", date: "Nov 12, 2025", amount: 4980, status: "paid", method: "Visa •••• 4242", period: "Nov 12 – Dec 11", url: "#" },
  { id: "INV-2025-1014", date: "Oct 14, 2025", amount: 4980, status: "paid_late", method: "Visa •••• 4242", period: "Oct 12 – Nov 11 · 2 retries", url: "#" },
  { id: "INV-2025-0912", date: "Sep 12, 2025", amount: 4760, status: "paid", method: "Visa •••• 4242", period: "Sep 12 – Oct 11", url: "#" },
];

const addons = [
  { name: "AI Pitch Deck Analysis", qty: 1, unit: 240, total: 240, billing: "Monthly" },
  { name: "Data Room (50 GB)", qty: 2, unit: 80, total: 160, billing: "Monthly" },
  { name: "Investor CRM seats", qty: 5, unit: 24, total: 120, billing: "Monthly" },
  { name: "Mentor credits", qty: 20, unit: 50, total: 1000, billing: "One-off · Q1" },
];

const seatHistory = [
  { d: "Feb 02, 2026", c: "+3 seats", actor: "by ops@northwind.vc", impact: "+$249 MRR" },
  { d: "Dec 12, 2025", c: "+1 seat (mid-cycle proration)", actor: "by ops@northwind.vc", impact: "+$83 MRR" },
  { d: "Oct 28, 2025", c: "−2 seats reclaimed (inactive 30d)", actor: "auto", impact: "−$166 MRR" },
  { d: "Aug 12, 2025", c: "Initial provisioning · 50 seats", actor: "Sales onboarding", impact: "+$4,150 MRR" },
];

const mrrTrend = [
  { m: "Sep", v: 3960 }, { m: "Oct", v: 4150 }, { m: "Nov", v: 3984 },
  { m: "Dec", v: 4067 }, { m: "Jan", v: 4980 }, { m: "Feb", v: 4980 },
];

const changes = [
  { d: "Feb 12, 2026 09:14", actor: "Lena Park (CSM)", action: "Applied 5% loyalty discount", reason: "Renewal negotiation", delta: "−$249 MRR", icon: Edit3, c: "text-amber-600" },
  { d: "Feb 02, 2026 16:22", actor: "ops@northwind.vc", action: "Added 3 seats", reason: "Team expansion", delta: "+$249 MRR", icon: Plus, c: "text-emerald-600" },
  { d: "Jan 12, 2026 00:00", actor: "system", action: "Renewed annual contract", reason: "Auto-renew", delta: "+$0", icon: RefreshCw, c: "text-muted-foreground" },
  { d: "Dec 12, 2025 11:08", actor: "ops@northwind.vc", action: "Upgraded Pro → Scale", reason: "Hit feature gate (data room)", delta: "+$1,920 MRR", icon: ArrowUpRight, c: "text-emerald-600" },
  { d: "Oct 28, 2025 03:00", actor: "system", action: "Reclaimed 2 inactive seats", reason: "30d no login", delta: "−$166 MRR", icon: Minus, c: "text-rose-600" },
  { d: "Oct 14, 2025 14:42", actor: "system", action: "Payment retried (success)", reason: "insufficient_funds → resolved", delta: "$0", icon: CheckCircle2, c: "text-emerald-600" },
  { d: "Oct 12, 2025 09:00", actor: "system", action: "Payment failed", reason: "insufficient_funds", delta: "Past due", icon: AlertCircle, c: "text-rose-600" },
  { d: "Aug 12, 2025 10:12", actor: "Marcus Vale (Sales)", action: "Subscription created", reason: "Closed-won · contract MSA-2024-118", delta: "+$4,150 MRR", icon: CheckCircle2, c: "text-emerald-600" },
];

const statusColor: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-600",
  paid_late: "bg-amber-500/15 text-amber-600",
  open: "bg-blue-500/15 text-blue-600",
  failed: "bg-rose-500/15 text-rose-600",
};

export function SubscriptionDetail({ id }: { id?: string }) {
  const max = Math.max(...mrrTrend.map(p => p.v));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/admin/$" params={{ _splat: "plans/subscriptions" }} className="hover:text-foreground">Subscriptions</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-mono">{id ?? sub.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14"><AvatarFallback>{sub.avatar}</AvatarFallback></Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{sub.customer}</h1>
              <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">{sub.status}</Badge>
              <Badge variant="outline">{sub.type}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {sub.plan} · {sub.region} · CSM: {sub.csm} · <span className="font-mono text-xs">{sub.id}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {sub.contact}</span>
              <span>Started {sub.startedAt}</span>
              <span>Renews {sub.renewsAt}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Mail className="h-4 w-4" /> Message</Button>
          <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4" /> Retry payment</Button>
          <Button variant="outline" size="sm" className="gap-1"><Pause className="h-4 w-4" /> Pause</Button>
          <Button variant="outline" size="sm" className="gap-1 text-rose-600"><XCircle className="h-4 w-4" /> Cancel</Button>
          <Button size="sm" className="gap-1"><Edit3 className="h-4 w-4" /> Edit plan</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "MRR", v: `$${sub.mrr.toLocaleString()}`, h: "+5.2% MoM", i: TrendingUp, c: "text-emerald-600" },
          { l: "ARR", v: `$${(sub.arr/1000).toFixed(1)}k`, h: "Locked-in", i: Receipt },
          { l: "Seats", v: `${sub.seats.used}/${sub.seats.licensed}`, h: `${Math.round(sub.seats.used/sub.seats.licensed*100)}% utilized`, i: Users },
          { l: "Health Score", v: sub.health, h: "Healthy", i: Shield, c: "text-emerald-600" },
          { l: "LTV (est)", v: "$184k", h: "37 mo retention", i: TrendingUp },
        ].map(s => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
              <div className={`text-2xl font-bold mt-1 ${s.c ?? ""}`}>{s.v}</div>
              <div className="text-[11px] text-muted-foreground">{s.h}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="seats">Seats & Add-ons</TabsTrigger>
          <TabsTrigger value="mrr">MRR Impact</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
          <TabsTrigger value="billing">Billing Profile</TabsTrigger>
        </TabsList>

        {/* INVOICES */}
        <TabsContent value="invoices" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4" /> Invoices ({invoices.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export CSV</Button>
                <Button size="sm" className="gap-1"><FileText className="h-3 w-3" /> Generate invoice</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Invoice</th>
                      <th className="text-left">Date</th>
                      <th className="text-left">Period</th>
                      <th className="text-left">Method</th>
                      <th className="text-right">Amount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="py-3 font-mono text-xs">{inv.id}</td>
                        <td className="text-xs">{inv.date}</td>
                        <td className="text-xs text-muted-foreground">{inv.period}</td>
                        <td className="text-xs">{inv.method}</td>
                        <td className="text-right font-semibold">${inv.amount.toLocaleString()}</td>
                        <td><Badge variant="outline" className={`text-[10px] ${statusColor[inv.status]}`}>{inv.status.replace("_", " ")}</Badge></td>
                        <td className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 gap-1"><ExternalLink className="h-3 w-3" /> PDF</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={4} className="py-3 text-xs text-muted-foreground">Lifetime billed (6 invoices)</td>
                      <td className="text-right font-bold">${invoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEATS & ADD-ONS */}
        <TabsContent value="seats" className="space-y-3 mt-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="md:col-span-1">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Seat Utilization</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold">{sub.seats.used}</span>
                    <span className="text-sm text-muted-foreground">of {sub.seats.licensed} licensed</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${sub.seats.used/sub.seats.licensed*100}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{sub.seats.licensed - sub.seats.used} seats available · ${(sub.seats.licensed - sub.seats.used) * 83}/mo upgrade headroom</div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Active (30d)</span><span className="font-medium">42</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Idle (no login 14d)</span><span className="font-medium text-amber-600">5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pending invites</span><span className="font-medium">3</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Auto-reclaim threshold</span><span className="font-medium">30d</span></div>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1"><Plus className="h-3 w-3" /> Provision seats</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Add-ons & Modules</CardTitle>
                <Button size="sm" variant="outline" className="gap-1"><Plus className="h-3 w-3" /> Add module</Button>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Module</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Unit</th>
                      <th className="text-right">Total</th>
                      <th className="text-left pl-3">Billing</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {addons.map(a => (
                      <tr key={a.name} className="hover:bg-muted/30">
                        <td className="py-3 font-medium">{a.name}</td>
                        <td className="text-right">{a.qty}</td>
                        <td className="text-right text-muted-foreground">${a.unit}</td>
                        <td className="text-right font-semibold">${a.total.toLocaleString()}</td>
                        <td className="text-xs pl-3">{a.billing}</td>
                        <td className="text-right"><Button size="sm" variant="ghost" className="h-7"><Edit3 className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={3} className="py-3 text-xs text-muted-foreground">Recurring add-on total</td>
                      <td className="text-right font-bold">${addons.filter(a => a.billing === "Monthly").reduce((s, a) => s + a.total, 0).toLocaleString()}/mo</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MRR IMPACT */}
        <TabsContent value="mrr" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> MRR Movement (last 6 months)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3 mb-6">
                {[
                  { l: "New MRR (lifetime)", v: "+$4,150", c: "text-emerald-600", i: ArrowUpRight },
                  { l: "Expansion", v: "+$1,996", c: "text-emerald-600", i: ArrowUpRight },
                  { l: "Contraction", v: "−$415", c: "text-amber-600", i: ArrowDownRight },
                  { l: "Net New MRR", v: "+$5,731", c: "text-emerald-600", i: TrendingUp },
                ].map(s => (
                  <div key={s.l} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
                    <div className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-3 h-48 px-1">
                {mrrTrend.map(p => (
                  <div key={p.m} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-medium">${(p.v/1000).toFixed(2)}k</div>
                    <div className="w-full rounded-t bg-gradient-to-t from-primary to-primary/40" style={{ height: `${(p.v/max)*160}px` }} />
                    <div className="text-xs text-muted-foreground">{p.m}</div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />
              <div>
                <div className="text-sm font-medium mb-3">Seat & add-on contribution to MRR</div>
                <div className="space-y-2 text-sm">
                  {seatHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{h.c}</div>
                        <div className="text-xs text-muted-foreground">{h.d} · {h.actor}</div>
                      </div>
                      <Badge variant="outline" className={h.impact.startsWith("+") ? "text-emerald-600" : "text-rose-600"}>{h.impact}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHANGE HISTORY */}
        <TabsContent value="history" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Change History</CardTitle>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export audit log</Button>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                {changes.map((c, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <div className={`absolute -left-[18px] top-1 h-4 w-4 rounded-full border-2 border-background bg-muted flex items-center justify-center ${c.c}`}>
                      <c.icon className="h-2.5 w-2.5" />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{c.action}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> {c.d} · by <span className="font-medium">{c.actor}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 italic">"{c.reason}"</div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${c.c}`}>{c.delta}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-dashed p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Immutable hash-chained log. Retained 7 years (SOX §404). Verified daily.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING PROFILE */}
        <TabsContent value="billing" className="space-y-3 mt-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Primary</span><span className="font-medium">{sub.paymentMethod}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Backup</span><span className="font-medium">ACH · Mercury Bank ••6188</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">3DS / SCA</span><Badge className="bg-emerald-500/15 text-emerald-600">Verified</Badge></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Auto-retry on failure</span><Badge variant="outline">3× over 7d</Badge></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Billing Profile</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Legal entity</span><span className="font-medium">Northwind Capital GmbH</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">VAT ID</span><span className="font-mono">DE324991108</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Billing email</span><span>{sub.billingEmail}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">PO required</span><Badge variant="outline">Yes (NET-30)</Badge></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Contract</span><Button variant="link" size="sm" className="h-auto p-0 gap-1">MSA-2024-118 <ExternalLink className="h-3 w-3" /></Button></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
