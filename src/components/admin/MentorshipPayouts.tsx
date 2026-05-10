import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign, CreditCard, Banknote, Wallet, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Download, Search, Filter, Globe, FileText,
  Shield, Zap, RefreshCw, ArrowDownUp, Building2, Bitcoin, Sparkles,
  Receipt, Calculator, Lock, Eye
} from "lucide-react";

const payouts = [
  { id: "PO-22841", expert: "Dr. Aisha Rahman", avatar: "AR", country: "🇦🇪", method: "Bank wire (AED)", amount: 18450, currency: "USD", local: "67,800 AED", status: "completed", date: "Mar 1, 2026", sessions: 31, fees: 12, hold: 0, kyc: "L2", tax: "Form W-8BEN" },
  { id: "PO-22840", expert: "Marcus Chen", avatar: "MC", country: "🇸🇬", method: "Wise (SGD)", amount: 12300, currency: "USD", local: "16,420 SGD", status: "processing", date: "Mar 5, 2026", sessions: 24, fees: 8, hold: 0, kyc: "L2", tax: "Form W-8BEN" },
  { id: "PO-22839", expert: "Priya Venkatesh", avatar: "PV", country: "🇮🇳", method: "UPI / IMPS (INR)", amount: 4280, currency: "USD", local: "₹3,55,240", status: "scheduled", date: "Mar 8, 2026", sessions: 18, fees: 4, hold: 200, kyc: "L2", tax: "GST registered" },
  { id: "PO-22838", expert: "James O'Connor", avatar: "JO", country: "🇬🇧", method: "Faster Payments (GBP)", amount: 22800, currency: "USD", local: "£18,050", status: "on-hold", date: "—", sessions: 19, fees: 0, hold: 22800, kyc: "Pending refresh", tax: "VAT registered" },
  { id: "PO-22837", expert: "Yuki Sato", avatar: "YS", country: "🇯🇵", method: "USDC (Polygon)", amount: 1850, currency: "USDC", local: "1,850 USDC", status: "completed", date: "Mar 4, 2026", sessions: 5, fees: 2, hold: 0, kyc: "L2", tax: "Self-declared" },
];

const statusColor: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-600",
  processing: "bg-blue-500/15 text-blue-600",
  scheduled: "bg-violet-500/15 text-violet-600",
  "on-hold": "bg-amber-500/15 text-amber-600",
  failed: "bg-rose-500/15 text-rose-600",
};

export function MentorshipPayouts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global expert payments: 60+ countries, 30+ currencies, multi-rail. Tax compliance, escrow, dispute holds, and instant payouts for top performers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { l: "Pending Payout", v: "$847k", h: "1,247 experts", i: Clock },
          { l: "Paid (30d)", v: "$1.96M", h: "1,124 transfers", i: CheckCircle2 },
          { l: "On Hold (KYC/Disp)", v: "$54k", h: "23 cases", i: AlertCircle },
          { l: "Avg Payout", v: "$1,743", h: "Per expert/mo", i: TrendingUp },
          { l: "Failure Rate", v: "0.4%", h: "Auto-retry", i: RefreshCw },
          { l: "FX Spread Saved", v: "$28k", h: "vs market rates", i: ArrowDownUp },
        ].map(s => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
              <div className="text-[11px] text-muted-foreground">{s.h}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payouts">
        <TabsList>
          <TabsTrigger value="payouts">Payout Queue</TabsTrigger>
          <TabsTrigger value="rails">Payment Rails</TabsTrigger>
          <TabsTrigger value="rules">Schedule & Rules</TabsTrigger>
          <TabsTrigger value="tax">Tax & Compliance</TabsTrigger>
          <TabsTrigger value="escrow">Escrow & Disputes</TabsTrigger>
          <TabsTrigger value="reports">Reports & Ledger</TabsTrigger>
          <TabsTrigger value="recon">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search expert, payout ID, country…" />
                </div>
                <Select defaultValue="all"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-1"><Filter className="h-4 w-4" /> Filter</Button>
                <Button size="sm" className="gap-1"><Zap className="h-4 w-4" /> Run Batch Payout</Button>
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export Ledger</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Expert</th>
                      <th className="text-left">Method</th>
                      <th className="text-right">Amount (USD)</th>
                      <th className="text-right">Local</th>
                      <th className="text-right">Sessions</th>
                      <th className="text-right">Hold</th>
                      <th>Status</th>
                      <th className="text-right">Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payouts.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{p.avatar}</AvatarFallback></Avatar>
                            <div>
                              <div className="font-medium text-sm">{p.expert}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{p.id} · {p.country} · {p.kyc}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs">{p.method}</td>
                        <td className="text-right font-semibold">${p.amount.toLocaleString()}</td>
                        <td className="text-right text-xs text-muted-foreground">{p.local}</td>
                        <td className="text-right">{p.sessions}</td>
                        <td className="text-right text-xs">{p.hold > 0 ? <span className="text-amber-600 font-medium">${p.hold}</span> : "—"}</td>
                        <td><Badge variant="outline" className={`text-[10px] ${statusColor[p.status]}`}>{p.status}</Badge></td>
                        <td className="text-right text-xs text-muted-foreground">{p.date}</td>
                        <td className="text-right"><Button size="sm" variant="ghost"><Eye className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rails" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Global Payment Rails</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { n: "Stripe Connect", t: "60+ countries · cards/ACH", fee: "0.25% + $0.25", on: true, i: CreditCard },
                  { n: "Wise (TransferWise)", t: "70+ countries · multi-currency", fee: "Mid-market FX + 0.4%", on: true, i: ArrowDownUp },
                  { n: "Payoneer", t: "200+ countries · global cards", fee: "$1.50 + FX", on: true, i: Wallet },
                  { n: "Local Bank Wire (SWIFT)", t: "Universal · 1-3 days", fee: "$15 flat", on: true, i: Building2 },
                  { n: "UPI / IMPS / RTGS (India)", t: "Instant · 24/7", fee: "Free", on: true, i: Zap },
                  { n: "Pix (Brazil)", t: "Instant · 24/7", fee: "Free", on: true, i: Zap },
                  { n: "FPS (UK Faster Payments)", t: "Instant · GBP", fee: "£0.20", on: true, i: Zap },
                  { n: "SEPA Instant (EU)", t: "10 sec · EUR", fee: "€0.10", on: true, i: Zap },
                  { n: "USDC / USDT (Stablecoin)", t: "Polygon · Base · Solana", fee: "Network fee only (~$0.01)", on: true, i: Bitcoin },
                  { n: "Mobile Money (M-Pesa, MTN)", t: "Africa rails", fee: "1.0% local", on: true, i: Banknote },
                ].map(r => (
                  <div key={r.n} className="rounded-lg border p-3 flex items-start gap-3">
                    <r.i className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between"><span className="font-medium text-sm">{r.n}</span><Switch defaultChecked={r.on} /></div>
                      <div className="text-xs text-muted-foreground">{r.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Fee: {r.fee}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Payout Schedule & Rules</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { l: "Default payout schedule", v: "Weekly (Mondays)", input: true },
                { l: "Minimum payout threshold", v: "$50", input: true },
                { l: "Hold period (new experts, first 30d)", v: "14 days", input: true },
                { l: "Hold period (Elite/Legend tier)", v: "0 days (instant)", input: true },
                { l: "Dispute window before release", v: "72 hours", input: true },
                { l: "Auto-retry on failure", v: "3 attempts × 24h", input: true },
                { l: "Instant payout fee (on-demand)", v: "1.5%", input: true },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between border-b py-2">
                  <span className="text-sm">{r.l}</span>
                  <Input className="w-44 h-8 text-right" defaultValue={r.v} />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2"><span className="text-sm">Allow expert to choose schedule (D/W/M)</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Earnings statement emailed monthly</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Stripe Issuing card (spend earnings instantly)</span><Switch /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4" /> Tax & Compliance</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { n: "US 1099-NEC / 1099-K", d: "Auto-generate & file with IRS · $600 threshold", on: true },
                  { n: "Form W-9 (US experts)", d: "Required at signup, blocks payout if missing", on: true },
                  { n: "Form W-8BEN (non-US)", d: "Tax treaty withholding lookup", on: true },
                  { n: "DAC7 (EU)", d: "Annual reporting to EU tax authorities", on: true },
                  { n: "GST/VAT Reverse Charge", d: "B2B invoicing across borders", on: true },
                  { n: "India TDS @ 1%", d: "Sec 194-O e-commerce TCS", on: true },
                  { n: "UK MTD VAT", d: "Making Tax Digital filings", on: true },
                  { n: "OFAC / Sanctions screening", d: "Block payouts to sanctioned individuals/regions", on: true },
                ].map(r => (
                  <div key={r.n} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{r.n}</div>
                        <div className="text-xs text-muted-foreground">{r.d}</div>
                      </div>
                      <Switch defaultChecked={r.on} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escrow" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Escrow & Dispute Holds</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">All session funds held in segregated trust accounts (Stripe Treasury) until dispute window closes. Equity grants vested via on-chain or Carta-integrated escrow.</p>
              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">In Escrow</div><div className="text-2xl font-bold">$284k</div><div className="text-[11px] text-muted-foreground">1,847 sessions</div></div>
                <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Active Disputes</div><div className="text-2xl font-bold">14</div><div className="text-[11px] text-muted-foreground">$8.4k value</div></div>
                <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Equity Vesting (Q1)</div><div className="text-2xl font-bold">$1.2M</div><div className="text-[11px] text-muted-foreground">FMV · 23 grants</div></div>
              </div>
              <div className="rounded-lg border p-4 bg-amber-500/5">
                <div className="font-medium text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Dispute Resolution Policy</div>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Tier-1 mediation by Trust & Safety (auto, &lt;48h)</li>
                  <li>• Tier-2: human arbitration by neutral panel</li>
                  <li>• Tier-3: independent arbitration via JAMS / DIAC</li>
                  <li>• Refunds, partial refunds, or service credits possible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-3 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Reports & Audit Ledger</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
              {[
                "Monthly earnings statement (per expert)",
                "Annual tax summary (1099/1042-S)",
                "Platform GMV & take-rate report",
                "Country-level payout breakdown",
                "FX P&L report",
                "Disputed sessions & resolution log",
                "Escrow balance reconciliation",
                "AML/CTR transaction monitoring report",
              ].map(r => (
                <div key={r} className="rounded-lg border p-3 flex items-center justify-between">
                  <span>{r}</span>
                  <Button size="sm" variant="outline" className="gap-1"><Download className="h-3 w-3" /> CSV</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recon" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" /> Commission & Payout Reconciliation</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Match scheduled payouts to completed sessions across region, session type, and expert tier. Period: <span className="font-medium">Feb 1 – Feb 28, 2026</span></p>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="feb26"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feb26">Feb 2026</SelectItem>
                      <SelectItem value="jan26">Jan 2026</SelectItem>
                      <SelectItem value="q1-26">Q1 2026</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all-region"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-region">All Regions</SelectItem>
                      <SelectItem value="na">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="mena">MENA</SelectItem>
                      <SelectItem value="apac">APAC</SelectItem>
                      <SelectItem value="latam">LATAM</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="gap-1"><RefreshCw className="h-3 w-3" /> Re-run</Button>
                  <Button size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { l: "Sessions completed", v: "8,427", h: "GMV $2.41M" },
                  { l: "Commission earned", v: "$486k", h: "Avg take 20.2%" },
                  { l: "Scheduled payouts", v: "$1.92M", h: "1,247 transfers" },
                  { l: "Matched", v: "99.3%", h: "8,368 of 8,427", c: "text-emerald-600" },
                  { l: "Variance", v: "$3,284", h: "59 exceptions", c: "text-amber-600" },
                ].map(s => (
                  <div key={s.l} className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className={`text-xl font-bold mt-1 ${s.c ?? ""}`}>{s.v}</div>
                    <div className="text-[11px] text-muted-foreground">{s.h}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> By Region</div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                      <tr>
                        <th className="text-left py-2 px-3">Region</th>
                        <th className="text-right">Sessions</th>
                        <th className="text-right">GMV</th>
                        <th className="text-right">Commission</th>
                        <th className="text-right">Expert Net</th>
                        <th className="text-right">Scheduled</th>
                        <th className="text-right">Variance</th>
                        <th className="text-right">Match %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { r: "North America 🇺🇸🇨🇦", s: 2841, gmv: 924000, com: 184800, net: 739200, sch: 738900, v: 300, m: 99.8 },
                        { r: "Europe 🇬🇧🇪🇺", s: 1928, gmv: 612000, com: 122400, net: 489600, sch: 489600, v: 0, m: 100 },
                        { r: "MENA 🇦🇪🇸🇦", s: 1247, gmv: 398000, com: 79600, net: 318400, sch: 318400, v: 0, m: 100 },
                        { r: "APAC 🇸🇬🇯🇵🇮🇳", s: 1684, gmv: 312000, com: 62400, net: 249600, sch: 247420, v: 2180, m: 98.4 },
                        { r: "LATAM 🇧🇷🇲🇽", s: 727, gmv: 164000, com: 36800, net: 127200, sch: 126396, v: 804, m: 98.9 },
                      ].map(row => (
                        <tr key={row.r} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{row.r}</td>
                          <td className="text-right">{row.s.toLocaleString()}</td>
                          <td className="text-right">${(row.gmv/1000).toFixed(0)}k</td>
                          <td className="text-right">${(row.com/1000).toFixed(0)}k</td>
                          <td className="text-right">${(row.net/1000).toFixed(0)}k</td>
                          <td className="text-right">${(row.sch/1000).toFixed(0)}k</td>
                          <td className={`text-right ${row.v > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>{row.v > 0 ? `$${row.v}` : "—"}</td>
                          <td className="text-right">{row.m}%</td>
                          <td><Badge variant="outline" className={`text-[10px] ${row.v === 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>{row.v === 0 ? "balanced" : "review"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">By Session Type</div>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                        <tr>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-right">Sessions</th>
                          <th className="text-right">Take %</th>
                          <th className="text-right">Commission</th>
                          <th className="text-right">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { t: "1:1 Coaching (60m)", s: 4218, tk: "20%", com: 246400, v: 1840 },
                          { t: "1:1 Strategy (90m)", s: 1284, tk: "18%", com: 102600, v: 0 },
                          { t: "Group Workshop", s: 1847, tk: "25%", com: 84300, v: 1244 },
                          { t: "Async Review", s: 824, tk: "15%", com: 28400, v: 0 },
                          { t: "Equity-for-Advice", s: 254, tk: "12%", com: 24300, v: 200 },
                        ].map(row => (
                          <tr key={row.t} className="hover:bg-muted/30">
                            <td className="py-2 px-3">{row.t}</td>
                            <td className="text-right">{row.s.toLocaleString()}</td>
                            <td className="text-right">{row.tk}</td>
                            <td className="text-right">${(row.com/1000).toFixed(1)}k</td>
                            <td className={`text-right ${row.v > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{row.v > 0 ? `$${row.v}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">By Expert Tier</div>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                        <tr>
                          <th className="text-left py-2 px-3">Tier</th>
                          <th className="text-right">Experts</th>
                          <th className="text-right">Sessions</th>
                          <th className="text-right">Net Payout</th>
                          <th className="text-right">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { t: "Legend", e: 24, s: 482, np: 412000, v: 0 },
                          { t: "Elite", e: 168, s: 1947, np: 624000, v: 0 },
                          { t: "Pro", e: 524, s: 3284, np: 612000, v: 1840 },
                          { t: "Verified", e: 1247, s: 2247, np: 248000, v: 1244 },
                          { t: "Starter", e: 2840, s: 467, np: 28000, v: 200 },
                        ].map(row => (
                          <tr key={row.t} className="hover:bg-muted/30">
                            <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{row.t}</Badge></td>
                            <td className="text-right">{row.e}</td>
                            <td className="text-right">{row.s.toLocaleString()}</td>
                            <td className="text-right">${(row.np/1000).toFixed(0)}k</td>
                            <td className={`text-right ${row.v > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{row.v > 0 ? `$${row.v}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> Exception Queue (59)</div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                      <tr>
                        <th className="text-left py-2 px-3">Session ID</th>
                        <th className="text-left">Expert</th>
                        <th className="text-left">Type</th>
                        <th className="text-left">Region</th>
                        <th className="text-right">Expected</th>
                        <th className="text-right">Scheduled</th>
                        <th className="text-right">Δ</th>
                        <th>Reason</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { id: "SES-94821", ex: "Priya Venkatesh", t: "Group Workshop", reg: "APAC 🇮🇳", exp: 1840, sch: 1640, reason: "PPP multiplier mismatch (0.45 vs 0.50)" },
                        { id: "SES-94780", ex: "Carlos Mendes", t: "1:1 Coaching", reg: "LATAM 🇧🇷", exp: 240, sch: 196, reason: "FX rate drift (BRL/USD)" },
                        { id: "SES-94712", ex: "James O'Connor", t: "Equity-for-Advice", reg: "EU 🇬🇧", exp: 0, sch: 0, reason: "Vesting milestone unmet · held in escrow" },
                        { id: "SES-94688", ex: "Marcus Chen", t: "1:1 Strategy", reg: "APAC 🇸🇬", exp: 380, sch: 0, reason: "Refund issued · dispute window active" },
                        { id: "SES-94612", ex: "Aisha Rahman", t: "Group Workshop", reg: "MENA 🇦🇪", exp: 620, sch: 558, reason: "Promo code LAUNCH50 applied post-booking" },
                      ].map(r => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono text-[11px]">{r.id}</td>
                          <td>{r.ex}</td>
                          <td className="text-xs">{r.t}</td>
                          <td className="text-xs">{r.reg}</td>
                          <td className="text-right">${r.exp}</td>
                          <td className="text-right">${r.sch}</td>
                          <td className={`text-right font-medium ${r.exp - r.sch !== 0 ? "text-amber-600" : ""}`}>${r.exp - r.sch}</td>
                          <td className="text-xs text-muted-foreground">{r.reason}</td>
                          <td className="text-right"><Button size="sm" variant="ghost" className="h-7">Resolve</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/30 text-xs space-y-1">
                <div className="font-medium text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Reconciliation Method</div>
                <p className="text-muted-foreground">Two-way match: <span className="font-mono">sessions.completed_at</span> joined with <span className="font-mono">payouts.scheduled_for</span> on (expert_id, session_id). Commission recomputed from <span className="font-mono">tier × type × region.ppp</span> ledger and compared against scheduled net. Variance &gt; $1 or &gt; 0.5% flagged. Signed off nightly by Finance Ops; immutable hash-chained log retained 7 yrs (SOX §404).</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
