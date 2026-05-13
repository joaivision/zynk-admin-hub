import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, TrendingUp, TrendingDown, Activity, Download, AlertCircle, Sparkles, BarChart3 } from "lucide-react";

type Position = {
  id: string;
  startup: string;
  sector: string;
  region: string;
  stage: string;
  invested: number;
  currentValue: number;
  ownership: number;
  entryDate: string;
  lastMark: string;
  status: "Hold" | "Exited" | "Write-off" | "Watchlist";
  moic: number;
  irr: number;
  nextEvent?: string;
  health: "Green" | "Amber" | "Red";
};

const seed: Position[] = [
  { id: "P-301", startup: "Lattica AI", sector: "AI Infra", region: "NA", stage: "Series A", invested: 500_000, currentValue: 1_850_000, ownership: 2.4, entryDate: "2023-11", lastMark: "2025-Q1", status: "Hold", moic: 3.7, irr: 92, nextEvent: "Series B Q4", health: "Green" },
  { id: "P-302", startup: "Mira Health", sector: "DigiHealth", region: "APAC", stage: "Seed", invested: 250_000, currentValue: 380_000, ownership: 3.1, entryDate: "2024-02", lastMark: "2025-Q1", status: "Hold", moic: 1.52, irr: 38, nextEvent: "Bridge round Jul", health: "Green" },
  { id: "P-303", startup: "Khaleej Logistics", sector: "Logistics", region: "MENA", stage: "Series B", invested: 1_000_000, currentValue: 2_400_000, ownership: 1.8, entryDate: "2022-06", lastMark: "2025-Q1", status: "Hold", moic: 2.4, irr: 41, health: "Green" },
  { id: "P-304", startup: "Verdura", sector: "Climate", region: "LATAM", stage: "Series A", invested: 750_000, currentValue: 1_100_000, ownership: 2.2, entryDate: "2024-05", lastMark: "2025-Q1", status: "Hold", moic: 1.47, irr: 34, health: "Amber" },
  { id: "P-305", startup: "Tomo Robotics", sector: "Robotics", region: "APAC", stage: "Seed", invested: 300_000, currentValue: 90_000, ownership: 4.0, entryDate: "2022-11", lastMark: "2024-Q4", status: "Watchlist", moic: 0.3, irr: -38, nextEvent: "Down-round risk", health: "Red" },
  { id: "P-306", startup: "Sahel Pay", sector: "Fintech", region: "Africa", stage: "Pre-seed", invested: 100_000, currentValue: 180_000, ownership: 5.5, entryDate: "2023-08", lastMark: "2025-Q1", status: "Hold", moic: 1.8, irr: 52, health: "Green" },
  { id: "P-307", startup: "Atlas Labs", sector: "AI Apps", region: "EU", stage: "Seed", invested: 200_000, currentValue: 0, ownership: 0, entryDate: "2022-01", lastMark: "2024-Q3", status: "Write-off", moic: 0, irr: -100, health: "Red" },
  { id: "P-308", startup: "PampaSoil", sector: "Agritech", region: "LATAM", stage: "Pre-seed", invested: 50_000, currentValue: 220_000, ownership: 6.0, entryDate: "2023-03", lastMark: "2025-Q1", status: "Hold", moic: 4.4, irr: 118, nextEvent: "Seed Aug", health: "Green" },
  { id: "P-309", startup: "Old Co", sector: "SaaS", region: "EU", stage: "Series A", invested: 400_000, currentValue: 1_600_000, ownership: 1.5, entryDate: "2020-04", lastMark: "2024-12", status: "Exited", moic: 4.0, irr: 38, health: "Green" },
];

const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}k`;
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const healthColor = { Green: "text-emerald-600", Amber: "text-amber-600", Red: "text-destructive" };
const statusColor: Record<Position["status"], string> = {
  Hold: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Exited: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "Write-off": "bg-destructive/15 text-destructive",
  Watchlist: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function InvestorPortfolio() {
  const [positions] = useState<Position[]>(seed);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<Position | null>(null);

  const filtered = useMemo(
    () => positions.filter((p) => (sector === "all" || p.sector === sector) && (status === "all" || p.status === status) && (q === "" || `${p.startup} ${p.id}`.toLowerCase().includes(q.toLowerCase()))),
    [positions, q, sector, status],
  );

  const k = useMemo(() => {
    const totalInv = positions.reduce((a, p) => a + p.invested, 0);
    const totalNAV = positions.filter((p) => p.status !== "Exited").reduce((a, p) => a + p.currentValue, 0);
    const realised = positions.filter((p) => p.status === "Exited").reduce((a, p) => a + p.currentValue, 0);
    const totalValue = totalNAV + realised;
    const moic = totalValue / totalInv;
    const dpi = realised / totalInv;
    const writeOffs = positions.filter((p) => p.status === "Write-off").length;
    return { totalInv, totalNAV, realised, totalValue, moic, dpi, writeOffs };
  }, [positions]);

  const sectors = Array.from(new Set(seed.map((p) => p.sector)));

  const sectorBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    positions.forEach((p) => map.set(p.sector, (map.get(p.sector) ?? 0) + p.currentValue));
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries()).map(([k, v]) => ({ k, v, pct: (v / total) * 100 })).sort((a, b) => b.v - a.v);
  }, [positions]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Tracking</h1>
          <p className="text-sm text-muted-foreground">Live NAV, MOIC, IRR, exit pipeline, and quarterly mark-to-market across all investments.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Quarterly LP report generating…")}><Download className="h-4 w-4" /> LP report</Button>
          <Button size="sm" className="gap-1" onClick={() => toast.success("Marks refresh queued for all positions")}><Activity className="h-4 w-4" /> Refresh marks</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Invested", v: fmt(k.totalInv), s: `${positions.length} positions` },
          { l: "Current NAV", v: fmt(k.totalNAV), s: "Unrealised" },
          { l: "Realised", v: fmt(k.realised), s: "Distributions" },
          { l: "MOIC", v: `${k.moic.toFixed(2)}x`, s: `DPI ${k.dpi.toFixed(2)}x` },
          { l: "Write-offs", v: k.writeOffs, s: `${Math.round((k.writeOffs / positions.length) * 100)}% of count` },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p><p className="text-[11px] text-muted-foreground mt-1">{c.s}</p></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="exits">Exits & Pipeline</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
              <CardTitle className="text-base">All Positions</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
                <Select value={sector} onValueChange={setSector}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All sectors</SelectItem>{sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent>{["all", "Hold", "Watchlist", "Exited", "Write-off"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All status" : s}</SelectItem>)}</SelectContent></Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Sector</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3 text-right">Invested</th><th className="px-4 py-3 text-right">NAV</th><th className="px-4 py-3 text-right">MOIC</th><th className="px-4 py-3 text-right">IRR</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Health</th></tr></thead>
                  <tbody className="divide-y">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setActive(p)}>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{p.startup.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{p.startup}</p><p className="text-xs text-muted-foreground">{p.id} · {p.ownership}% own</p></div></div></td>
                        <td className="px-4 py-3 text-xs"><Badge variant="secondary" className="text-[10px]">{p.sector}</Badge></td>
                        <td className="px-4 py-3 text-xs">{p.stage}</td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(p.invested)}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium">{fmt(p.currentValue)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${p.moic >= 1 ? "text-emerald-600" : "text-destructive"}`}>{p.moic.toFixed(2)}x</td>
                        <td className={`px-4 py-3 text-right font-mono ${p.irr >= 0 ? "text-emerald-600" : "text-destructive"}`}><span className="inline-flex items-center gap-1">{p.irr >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{pct(p.irr)}</span></td>
                        <td className="px-4 py-3"><Badge className={statusColor[p.status]}>{p.status}</Badge></td>
                        <td className="px-4 py-3"><span className={`text-xs font-semibold ${healthColor[p.health]}`}>● {p.health}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />By Sector</CardTitle></CardHeader><CardContent className="space-y-3">
              {sectorBreakdown.map((s) => (
                <div key={s.k}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium">{s.k}</span><span className="text-muted-foreground">{fmt(s.v)} ({s.pct.toFixed(1)}%)</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${s.pct}%` }} /></div>
                </div>
              ))}
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By Stage</CardTitle></CardHeader><CardContent className="space-y-3">
              {["Pre-seed", "Seed", "Series A", "Series B"].map((stage) => {
                const subset = positions.filter((p) => p.stage === stage);
                const value = subset.reduce((a, p) => a + p.currentValue, 0);
                const total = positions.reduce((a, p) => a + p.currentValue, 0);
                const pctV = total ? (value / total) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium">{stage}</span><span className="text-muted-foreground">{subset.length} pos · {fmt(value)}</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${pctV}%` }} /></div>
                  </div>
                );
              })}
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="exits" className="pt-4">
          <Card><CardContent className="pt-4 space-y-2 text-sm">
            {positions.filter((p) => p.nextEvent || p.status === "Exited").map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-md p-3"><div><p className="font-medium">{p.startup} <span className="text-xs text-muted-foreground font-normal">· {p.sector}</span></p><p className="text-xs text-muted-foreground mt-0.5">{p.status === "Exited" ? `Exited at ${p.moic.toFixed(2)}x — ${fmt(p.currentValue)} returned` : `Next: ${p.nextEvent}`}</p></div><Badge className={statusColor[p.status]}>{p.status}</Badge></div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="alerts" className="pt-4">
          <div className="space-y-2">
            {[
              { c: "Tomo Robotics", m: "Runway < 4 months. Down-round indicated. Reserve $50k for follow-on review.", sev: "Red" },
              { c: "Verdura", m: "Q2 burn 22% above plan. CFO turnover. Schedule check-in.", sev: "Amber" },
              { c: "Atlas Labs", m: "Wound down 2024-Q3. Final K-1 dispatched. Mark to $0 confirmed.", sev: "Red" },
              { c: "Lattica AI", m: "Term sheet received from Sequoia for Series B at $180M pre. Pro-rata available.", sev: "Green" },
            ].map((a, i) => (
              <Card key={i} className={`border-l-4 ${a.sev === "Red" ? "border-l-destructive" : a.sev === "Amber" ? "border-l-amber-500" : "border-l-emerald-500"}`}>
                <CardContent className="pt-4 flex items-start gap-3">
                  {a.sev === "Green" ? <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className={`h-5 w-5 shrink-0 ${a.sev === "Red" ? "text-destructive" : "text-amber-600"}`} />}
                  <div className="flex-1"><p className="font-medium text-sm">{a.c}</p><p className="text-xs text-muted-foreground mt-1">{a.m}</p></div>
                  <Button size="sm" variant="outline">Open</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (<>
            <DialogHeader><DialogTitle>{active.startup} <span className="text-sm text-muted-foreground font-normal">· {active.id}</span></DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[["Sector", active.sector], ["Region", active.region], ["Stage", active.stage], ["Invested", fmt(active.invested)], ["Current value", fmt(active.currentValue)], ["Ownership", `${active.ownership}%`], ["MOIC", `${active.moic.toFixed(2)}x`], ["IRR", pct(active.irr)], ["Entry", active.entryDate], ["Last mark", active.lastMark], ["Status", active.status], ["Health", active.health]].map(([k, v]) => (
                <div key={k} className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">{k}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setActive(null)}>Close</Button><Button onClick={() => { toast.success("Mark updated"); setActive(null); }}>Update mark</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
