import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronRight, Coins, CreditCard,
  Download, RefreshCw, ShieldCheck, TrendingUp, Wallet, Zap,
} from "lucide-react";

// ── Mock seed data (deterministic, no real PII) ────────────────────────────
type ProviderRow = {
  id: string; name: string; channel: "card" | "wallet" | "bnpl" | "crypto" | "bank" | "web3";
  attempts: number; successes: number; declined: number; retries: number; retrySuccess: number;
  threeDS: number; threeDSPass: number; chargebacks: number; refunds: number;
  feePct: number; feeFlat: number; volume: number; // USD
};

const seed: ProviderRow[] = [
  { id: "stripe",     name: "Stripe",        channel: "card",   attempts: 12840, successes: 12380, declined: 460, retries: 612, retrySuccess: 421, threeDS: 5230, threeDSPass: 5050, chargebacks: 14, refunds: 138, feePct: 2.9, feeFlat: 0.30, volume: 184_320 },
  { id: "successpay", name: "SuccessPay",    channel: "card",   attempts:  4720, successes:  4441, declined: 279, retries: 198, retrySuccess: 121, threeDS: 4400, threeDSPass: 4180, chargebacks:  8, refunds:  41, feePct: 2.5, feeFlat: 0.00, volume:  42_100 },
  { id: "mamopay",    name: "Mamo Pay",      channel: "card",   attempts:  2010, successes:  1913, declined:  97, retries:  74, retrySuccess:  48, threeDS: 1900, threeDSPass: 1812, chargebacks:  3, refunds:  19, feePct: 2.79,feeFlat: 1.00, volume:  18_430 },
  { id: "razorpay",   name: "Razorpay",      channel: "card",   attempts: 18420, successes: 17098, declined:1322, retries:1205, retrySuccess: 812, threeDS: 6100, threeDSPass: 5905, chargebacks: 22, refunds: 188, feePct: 2.0, feeFlat: 0.00, volume:  96_720 },
  { id: "paypal",     name: "PayPal",        channel: "wallet", attempts:  3120, successes:  2908, declined: 212, retries: 198, retrySuccess: 119, threeDS:    0, threeDSPass:    0, chargebacks: 11, refunds:  44, feePct: 3.49,feeFlat: 0.49, volume:  31_200 },
  { id: "applepay",   name: "Apple Pay",     channel: "wallet", attempts:  6420, successes:  6330, declined:  90, retries:  41, retrySuccess:  33, threeDS: 6420, threeDSPass: 6390, chargebacks:  2, refunds:  28, feePct: 0.0, feeFlat: 0.00, volume:  38_450 },
  { id: "tabby",      name: "Tabby",         channel: "bnpl",   attempts:   612, successes:   544, declined:  68, retries:  29, retrySuccess:  14, threeDS:    0, threeDSPass:    0, chargebacks:  6, refunds:  19, feePct: 4.0, feeFlat: 0.00, volume:   9_840 },
  { id: "binance",    name: "Binance Pay",   channel: "crypto", attempts:   918, successes:   910, declined:   8, retries:   3, retrySuccess:   3, threeDS:    0, threeDSPass:    0, chargebacks:  0, refunds:   2, feePct: 0.0, feeFlat: 0.00, volume:  28_100 },
  { id: "now",        name: "NOWPayments",   channel: "crypto", attempts:   341, successes:   333, declined:   8, retries:   2, retrySuccess:   2, threeDS:    0, threeDSPass:    0, chargebacks:  0, refunds:   0, feePct: 0.5, feeFlat: 0.00, volume:   9_540 },
  { id: "wise",       name: "Wise (payouts)",channel: "bank",   attempts:   712, successes:   708, declined:   4, retries:   1, retrySuccess:   1, threeDS:    0, threeDSPass:    0, chargebacks:  0, refunds:   1, feePct: 0.6, feeFlat: 0.00, volume:  14_200 },
];

// Time series — last 14 days
const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i));
  return d.toISOString().slice(5, 10);
});
const ts = days.map((day, i) => {
  const base = 92 + Math.sin(i / 2) * 2.5 + (i / 8);
  return {
    day,
    success: +(base + (i % 3 === 0 ? -0.6 : 0.3)).toFixed(2),
    retry:   +(8 - Math.cos(i / 3) * 1.4).toFixed(2),
    threeDS: +(74 + Math.sin(i / 4) * 4).toFixed(2),
    cost:    +(0.42 + Math.sin(i / 5) * 0.07).toFixed(3), // $/txn
    volume:  Math.round(28_000 + Math.sin(i / 2) * 6_000 + i * 800),
  };
});

// Routing outcomes — primary success, fallback rescue, final fail
const routingOutcomes = [
  { route: "AED → SuccessPay → Mamo → Stripe",      primary: 4441, fallback: 187, failed:  92 },
  { route: "INR → Razorpay → Stripe",                primary:17098, fallback:  640, failed: 682 },
  { route: "USD → Stripe → PayPal → Checkout.com",   primary:12380, fallback:  291, failed: 169 },
  { route: "SAR → Tap → SuccessPay",                 primary: 1820, fallback:   88, failed:  41 },
  { route: "Crypto>$1k → Binance → NOWPayments",     primary:  910, fallback:    8, failed:   0 },
  { route: "Escrow ≥$5k → Wise → Stripe",            primary:  708, fallback:    3, failed:   1 },
];

// Decline reason taxonomy
const declineReasons = [
  { reason: "insufficient_funds",      count: 612 },
  { reason: "do_not_honor",            count: 488 },
  { reason: "expired_card",            count: 184 },
  { reason: "3ds_failed",              count: 271 },
  { reason: "fraud_blocked",           count: 142 },
  { reason: "card_velocity_exceeded",  count:  88 },
  { reason: "issuer_unavailable",      count:  74 },
  { reason: "incorrect_cvc",           count:  61 },
  { reason: "other",                   count:  55 },
];

const channelColor: Record<ProviderRow["channel"], string> = {
  card:   "hsl(217 91% 60%)",
  wallet: "hsl(262 83% 64%)",
  bnpl:   "hsl(38  92% 55%)",
  crypto: "hsl(25  95% 55%)",
  bank:   "hsl(160 84% 42%)",
  web3:   "hsl(292 84% 60%)",
};

const fmtPct = (n: number, d = 1) => `${n.toFixed(d)}%`;
const fmtUsd = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n.toFixed(2)}`;
const fmtInt = (n: number) => n.toLocaleString();

export function PaymentAnalytics() {
  const [range, setRange] = useState("14d");
  const [channel, setChannel] = useState<string>("all");

  const rows = useMemo(() => seed.filter((r) => channel === "all" || r.channel === channel), [channel]);

  const totals = useMemo(() => {
    const attempts = rows.reduce((s, r) => s + r.attempts, 0);
    const successes = rows.reduce((s, r) => s + r.successes, 0);
    const retries = rows.reduce((s, r) => s + r.retries, 0);
    const retrySuccess = rows.reduce((s, r) => s + r.retrySuccess, 0);
    const threeDS = rows.reduce((s, r) => s + r.threeDS, 0);
    const threeDSPass = rows.reduce((s, r) => s + r.threeDSPass, 0);
    const volume = rows.reduce((s, r) => s + r.volume, 0);
    const cost = rows.reduce((s, r) => s + (r.volume * r.feePct / 100) + (r.successes * r.feeFlat), 0);
    const cb = rows.reduce((s, r) => s + r.chargebacks, 0);
    const refunds = rows.reduce((s, r) => s + r.refunds, 0);
    return {
      attempts, successes, retries, retrySuccess, threeDS, threeDSPass, volume, cost, cb, refunds,
      successRate: successes / attempts * 100,
      retryRate: retries / attempts * 100,
      retryRescueRate: retrySuccess / Math.max(retries, 1) * 100,
      threeDSRate: threeDS / attempts * 100,
      threeDSPassRate: threeDSPass / Math.max(threeDS, 1) * 100,
      cpt: cost / Math.max(successes, 1),
      cbRate: cb / Math.max(successes, 1) * 100,
      refundRate: refunds / Math.max(successes, 1) * 100,
    };
  }, [rows]);

  const providerKpi = rows.map((r) => ({
    id: r.id, name: r.name, channel: r.channel,
    success: r.successes / r.attempts * 100,
    retry: r.retries / r.attempts * 100,
    retryRescue: r.retrySuccess / Math.max(r.retries, 1) * 100,
    threeDS: r.threeDS / r.attempts * 100,
    threeDSPass: r.threeDSPass / Math.max(r.threeDS, 1) * 100,
    cpt: ((r.volume * r.feePct / 100) + (r.successes * r.feeFlat)) / Math.max(r.successes, 1),
    cbRate: r.chargebacks / Math.max(r.successes, 1) * 100,
    volume: r.volume, attempts: r.attempts,
  }));

  const channelMix = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.channel, (map.get(r.channel) ?? 0) + r.volume));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, color: channelColor[name as ProviderRow["channel"]] }));
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Payment Analytics</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Payment Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Auth-rate, retry rescue, 3DS performance, cost-per-transaction and routing outcomes across every provider.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="card">Cards</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="bnpl">BNPL</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="14d">Last 14d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
          <Button size="sm" variant="outline" className="gap-1"><Download className="h-3.5 w-3.5" />Export CSV</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={TrendingUp} label="Success rate"      value={fmtPct(totals.successRate, 2)} delta={+0.4} good />
        <Kpi icon={RefreshCw}  label="Retry rate"        value={fmtPct(totals.retryRate)}      delta={-0.2} good hint={`Rescue ${fmtPct(totals.retryRescueRate)}`} />
        <Kpi icon={ShieldCheck}label="3DS rate"          value={fmtPct(totals.threeDSRate)}    delta={+1.1} hint={`Pass ${fmtPct(totals.threeDSPassRate)}`} />
        <Kpi icon={Coins}      label="Cost / txn"        value={`$${totals.cpt.toFixed(3)}`}   delta={-0.012} good />
        <Kpi icon={Activity}   label="Volume"            value={fmtUsd(totals.volume)}         delta={+8.2} good />
        <Kpi icon={AlertTriangle} label="Chargeback rate" value={fmtPct(totals.cbRate, 2)}    delta={-0.03} good />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">By provider</TabsTrigger>
          <TabsTrigger value="routing">Routing outcomes</TabsTrigger>
          <TabsTrigger value="risk">Risk &amp; declines</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Success vs retry rate</CardTitle>
                <CardDescription>Daily auth-rate with overlay of retries that succeeded.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ts} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="gSuccess" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(160 84% 42%)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(160 84% 42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="l" domain={[85, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="r" orientation="right" domain={[0, 15]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area yAxisId="l" type="monotone" dataKey="success" name="Success %" stroke="hsl(160 84% 42%)" fill="url(#gSuccess)" strokeWidth={2} />
                    <Line yAxisId="r" type="monotone" dataKey="retry" name="Retry %" stroke="hsl(38 92% 55%)" strokeWidth={2} dot={false} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">3DS challenge rate &amp; cost / txn</CardTitle>
                <CardDescription>Higher 3DS friction usually trades off against fraud cost.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ts} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="l" domain={[60, 90]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line yAxisId="l" type="monotone" dataKey="threeDS" name="3DS %" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
                    <Line yAxisId="r" type="monotone" dataKey="cost" name="$ / txn" stroke="hsl(262 83% 64%)" strokeWidth={2} dot={false} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume by channel</CardTitle>
                <CardDescription>Revenue mix across cards, wallets, BNPL, crypto and bank.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {channelMix.map((c) => (<Cell key={c.name} fill={c.color} />))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtUsd(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily volume</CardTitle>
                <CardDescription>Gross processing volume across all live providers.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ts} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => fmtUsd(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="volume" name="Volume" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── By provider ─────────────────────────────────── */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Provider scorecard</CardTitle>
              <CardDescription>Sorted by volume. Compare auth, retry rescue, 3DS pass and cost-per-transaction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {providerKpi.sort((a, b) => b.volume - a.volume).map((p) => (
                <div key={p.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold"
                        style={{ background: `${channelColor[p.channel]}1a`, color: channelColor[p.channel] }}>
                        {p.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.channel} · {fmtInt(p.attempts)} attempts · {fmtUsd(p.volume)}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={p.success >= 95 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : p.success >= 90 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}>
                      {fmtPct(p.success, 2)} auth
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-5">
                    <Metric label="Success"     value={fmtPct(p.success, 2)} pct={p.success} max={100} />
                    <Metric label="Retry rate"  value={fmtPct(p.retry)}      pct={p.retry}   max={20}  invert />
                    <Metric label="Retry rescue" value={fmtPct(p.retryRescue)} pct={p.retryRescue} max={100} />
                    <Metric label="3DS pass"    value={p.threeDS ? fmtPct(p.threeDSPass) : "—"} pct={p.threeDSPass} max={100} />
                    <Metric label="$ / txn"     value={`$${p.cpt.toFixed(3)}`} pct={Math.min(p.cpt / 1.5 * 100, 100)} max={100} invert />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Auth-rate vs cost per txn</CardTitle>
              <CardDescription>Top-right quadrant = high auth + low cost (best). Bottom-left = action needed.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerKpi} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar yAxisId="l" dataKey="success" name="Auth %" fill="hsl(160 84% 42%)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="r" dataKey="cpt"     name="$ / txn" fill="hsl(262 83% 64%)" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Routing outcomes ────────────────────────────── */}
        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Routing outcomes by rule</CardTitle>
              <CardDescription>How often the primary acquirer cleared, the fallback rescued, or the charge ultimately failed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {routingOutcomes.map((r) => {
                const total = r.primary + r.fallback + r.failed;
                const p = (r.primary / total) * 100;
                const f = (r.fallback / total) * 100;
                const x = (r.failed / total) * 100;
                return (
                  <div key={r.route} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-mono text-xs truncate">{r.route}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{fmtInt(total)} attempts</span>
                    </div>
                    <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
                      <div style={{ width: `${p}%`, background: "hsl(160 84% 42%)" }} />
                      <div style={{ width: `${f}%`, background: "hsl(38 92% 55%)" }} />
                      <div style={{ width: `${x}%`, background: "hsl(0 72% 51%)" }} />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                      <span className="flex items-center gap-1"><Dot color="hsl(160 84% 42%)" />Primary {fmtPct(p)} <span className="text-muted-foreground">({fmtInt(r.primary)})</span></span>
                      <span className="flex items-center gap-1"><Dot color="hsl(38 92% 55%)"  />Fallback rescue {fmtPct(f)} <span className="text-muted-foreground">({fmtInt(r.fallback)})</span></span>
                      <span className="flex items-center gap-1"><Dot color="hsl(0 72% 51%)"   />Final fail {fmtPct(x)} <span className="text-muted-foreground">({fmtInt(r.failed)})</span></span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fallback waterfall</CardTitle>
              <CardDescription>Aggregate across all rules — measures how much revenue your failover chain rescued.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routingOutcomes} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 10 }} width={220} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="primary"  name="Primary"  stackId="r" fill="hsl(160 84% 42%)" />
                  <Bar dataKey="fallback" name="Fallback" stackId="r" fill="hsl(38 92% 55%)" />
                  <Bar dataKey="failed"   name="Failed"   stackId="r" fill="hsl(0 72% 51%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risk & declines ─────────────────────────────── */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Decline reasons</CardTitle>
                <CardDescription>Top issuer decline codes — the long tail is where retry logic earns its keep.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={declineReasons} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={170} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(0 72% 51%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Chargeback &amp; refund rate by provider</CardTitle>
                <CardDescription>Visa/MC threshold for chargeback monitoring is 0.9% — flag anything trending up.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {providerKpi.map((p) => (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{p.name}</span>
                      <span className={p.cbRate >= 0.9 ? "text-rose-500" : p.cbRate >= 0.5 ? "text-amber-500" : "text-emerald-500"}>
                        {fmtPct(p.cbRate, 2)} CB
                      </span>
                    </div>
                    <Progress value={Math.min(p.cbRate / 1.5 * 100, 100)} className="h-1.5" />
                  </div>
                ))}
                <Separator />
                <div className="flex items-center gap-2 rounded-md bg-amber-500/5 p-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Razorpay trending up — review 3DS gating thresholds for INR card subscriptions.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Cost ────────────────────────────────────────── */}
        <TabsContent value="cost" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Processing cost by provider</CardTitle>
                <CardDescription>Total fees paid (% + flat) and effective $/txn — used to negotiate rates.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerKpi.map((p) => ({
                    name: p.name,
                    feeUsd: ((seed.find((s) => s.id === p.id)!.volume * seed.find((s) => s.id === p.id)!.feePct / 100) + (seed.find((s) => s.id === p.id)!.successes * seed.find((s) => s.id === p.id)!.feeFlat)),
                    cpt: p.cpt,
                  }))} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis yAxisId="l" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${Math.round(v)}`} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toFixed(2)}`} />
                    <Tooltip formatter={(v: number, n: string) => n === "Fees ($)" ? fmtUsd(v) : `$${v.toFixed(3)}`} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar yAxisId="l" dataKey="feeUsd" name="Fees ($)" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="r" dataKey="cpt"    name="$ / txn" fill="hsl(262 83% 64%)" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cost summary</CardTitle>
                <CardDescription>Period: last {range}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Gross volume"        value={fmtUsd(totals.volume)} icon={Activity} />
                <Row label="Total fees paid"     value={fmtUsd(totals.cost)} icon={Coins} />
                <Row label="Effective rate"      value={fmtPct(totals.cost / totals.volume * 100, 2)} icon={CreditCard} />
                <Row label="Cost per successful" value={`$${totals.cpt.toFixed(3)}`} icon={Wallet} />
                <Separator />
                <Row label="Refund volume"       value={fmtUsd(totals.refunds * 18)} icon={RefreshCw} hint={`${fmtPct(totals.refundRate, 2)} of successes`} />
                <Row label="Chargeback volume"   value={fmtUsd(totals.cb * 42)} icon={AlertTriangle} hint={`${fmtPct(totals.cbRate, 2)} of successes`} />
                <Separator />
                <div className="rounded-md bg-emerald-500/5 p-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <ArrowDownRight className="mr-1 inline h-3.5 w-3.5" />
                  Routing AED→SuccessPay first instead of Stripe saved ~$1,840 this period.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, good, hint }: {
  icon: typeof Activity; label: string; value: string; delta: number; good?: boolean; hint?: string;
}) {
  const positive = delta >= 0;
  const tone = good
    ? (positive ? "text-emerald-500" : "text-rose-500")
    : (positive ? "text-rose-500" : "text-emerald-500");
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-md bg-muted p-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
          <div className={`flex items-center gap-0.5 text-[11px] font-medium ${tone}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta) < 1 ? delta.toFixed(3) : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
          </div>
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
        {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, pct, max, invert }: { label: string; value: string; pct: number; max: number; invert?: boolean }) {
  const ratio = Math.min(Math.max(pct / max * 100, 0), 100);
  const good = invert ? ratio < 50 : ratio > 70;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`text-xs font-mono ${good ? "text-emerald-500" : "text-foreground"}`}>{value}</span>
      </div>
      <Progress value={ratio} className="h-1" />
    </div>
  );
}

function Row({ label, value, icon: Icon, hint }: { label: string; value: string; icon: typeof Activity; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</span>
      <span className="text-right">
        <span className="font-mono">{value}</span>
        {hint && <span className="block text-[10px] text-muted-foreground">{hint}</span>}
      </span>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />;
}
