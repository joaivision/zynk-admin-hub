import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, GripVertical, TrendingUp, Filter, ArrowRight, FileText, MessageSquare } from "lucide-react";

type Stage = "Sourced" | "Screened" | "Diligence" | "IC Review" | "Term Sheet" | "Closed" | "Passed";
type Deal = {
  id: string;
  startup: string;
  founder: string;
  sector: string;
  stage: "Pre-seed" | "Seed" | "Series A" | "Series B";
  region: string;
  asking: number;
  committed: number;
  valuation: number;
  pipelineStage: Stage;
  owner: string;
  lastTouched: string;
  conviction: 1 | 2 | 3 | 4 | 5;
};

const stages: Stage[] = ["Sourced", "Screened", "Diligence", "IC Review", "Term Sheet", "Closed", "Passed"];

const seed: Deal[] = [
  { id: "D-201", startup: "Lattica AI", founder: "N. Sharma", sector: "AI Infra", stage: "Series A", region: "NA", asking: 8_000_000, committed: 3_200_000, valuation: 42_000_000, pipelineStage: "IC Review", owner: "Ahmed", lastTouched: "2h", conviction: 5 },
  { id: "D-202", startup: "Mira Health", founder: "L. Park", sector: "DigiHealth", stage: "Seed", region: "APAC", asking: 3_500_000, committed: 1_900_000, valuation: 18_000_000, pipelineStage: "Diligence", owner: "Yuki", lastTouched: "5h", conviction: 4 },
  { id: "D-203", startup: "Sahel Pay", founder: "F. Diop", sector: "Fintech", stage: "Pre-seed", region: "Africa", asking: 1_200_000, committed: 350_000, valuation: 7_000_000, pipelineStage: "Screened", owner: "David", lastTouched: "1d", conviction: 4 },
  { id: "D-204", startup: "Verdura", founder: "C. Mendes", sector: "Climate", stage: "Series A", region: "LATAM", asking: 12_000_000, committed: 6_500_000, valuation: 65_000_000, pipelineStage: "Term Sheet", owner: "Carlos", lastTouched: "3h", conviction: 5 },
  { id: "D-205", startup: "Nordlys", founder: "I. Larsen", sector: "Robotics", stage: "Seed", region: "EU", asking: 4_000_000, committed: 0, valuation: 22_000_000, pipelineStage: "Sourced", owner: "Hannah", lastTouched: "30m", conviction: 3 },
  { id: "D-206", startup: "Khaleej Logistics", founder: "M. Zayed", sector: "Logistics", stage: "Series B", region: "MENA", asking: 25_000_000, committed: 14_000_000, valuation: 140_000_000, pipelineStage: "Closed", owner: "Ahmed", lastTouched: "Yesterday", conviction: 5 },
  { id: "D-207", startup: "Tomo Robotics", founder: "Y. Tanaka", sector: "Robotics", stage: "Seed", region: "APAC", asking: 5_000_000, committed: 0, valuation: 28_000_000, pipelineStage: "Passed", owner: "Yuki", lastTouched: "4d", conviction: 2 },
  { id: "D-208", startup: "PampaSoil", founder: "R. Ortiz", sector: "Agritech", stage: "Pre-seed", region: "LATAM", asking: 800_000, committed: 250_000, valuation: 5_000_000, pipelineStage: "Screened", owner: "Carlos", lastTouched: "6h", conviction: 3 },
  { id: "D-209", startup: "Atlas Labs", founder: "S. Almeida", sector: "AI Apps", stage: "Seed", region: "EU", asking: 2_500_000, committed: 600_000, valuation: 14_000_000, pipelineStage: "Diligence", owner: "Sofia", lastTouched: "1d", conviction: 4 },
];

const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;

const stageColor: Record<Stage, string> = {
  Sourced: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  Screened: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  Diligence: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "IC Review": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Term Sheet": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Closed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Passed: "bg-muted text-muted-foreground",
};

export function InvestorDealFlow() {
  const [deals, setDeals] = useState<Deal[]>(seed);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [region, setRegion] = useState("all");
  const [active, setActive] = useState<Deal | null>(null);
  const [drag, setDrag] = useState<string | null>(null);

  const filtered = useMemo(
    () => deals.filter((d) => (sector === "all" || d.sector === sector) && (region === "all" || d.region === region) && (q === "" || `${d.startup} ${d.founder} ${d.id}`.toLowerCase().includes(q.toLowerCase()))),
    [deals, q, sector, region],
  );

  const totals = useMemo(() => {
    const t = stages.reduce<Record<Stage, { count: number; value: number }>>((acc, s) => ({ ...acc, [s]: { count: 0, value: 0 } }), {} as Record<Stage, { count: number; value: number }>);
    filtered.forEach((d) => { t[d.pipelineStage].count++; t[d.pipelineStage].value += d.asking; });
    return t;
  }, [filtered]);

  const move = (id: string, to: Stage) => {
    setDeals((p) => p.map((d) => (d.id === id ? { ...d, pipelineStage: to, lastTouched: "just now" } : d)));
    toast.success(`Moved to ${to}`);
  };

  const sectors = Array.from(new Set(seed.map((d) => d.sector)));
  const regions = Array.from(new Set(seed.map((d) => d.region)));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deal Flow Pipeline</h1>
          <p className="text-sm text-muted-foreground">Kanban pipeline of every deal from sourcing to close. Drag cards between stages.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deal…" className="pl-9 h-9" /></div>
          <Select value={sector} onValueChange={setSector}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All sectors</SelectItem>{sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={region} onValueChange={setRegion}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All regions</SelectItem>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Button size="sm" variant="outline" className="gap-1"><Filter className="h-4 w-4" />Saved views</Button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {stages.map((s) => (
          <div key={s} className={`rounded-md p-2 ${stageColor[s]}`}><p className="font-semibold uppercase tracking-wider text-[10px]">{s}</p><p className="text-base font-bold mt-1">{totals[s].count}</p><p className="text-[10px] opacity-80">{fmt(totals[s].value)}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {stages.map((s) => (
          <div
            key={s}
            className="bg-muted/30 rounded-lg p-2 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag) { move(drag, s); setDrag(null); } }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s}</p>
              <Badge variant="outline" className="text-[10px]">{totals[s].count}</Badge>
            </div>
            <div className="space-y-2">
              {filtered.filter((d) => d.pipelineStage === s).map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={() => setDrag(d.id)}
                  onClick={() => setActive(d)}
                  className="bg-background border rounded-md p-2 cursor-pointer hover:border-primary/50 hover:shadow-sm transition group"
                >
                  <div className="flex items-start gap-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{d.startup}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.founder} · {d.stage}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-mono">{fmt(d.asking)}</span>
                        <span className="text-[10px] text-emerald-600 font-mono">{Math.round((d.committed / d.asking) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1"><div className="h-full bg-emerald-500" style={{ width: `${(d.committed / d.asking) * 100}%` }} /></div>
                      <div className="flex items-center justify-between mt-2"><Badge variant="secondary" className="text-[9px] px-1 py-0">{d.sector}</Badge><span className="text-[9px] text-amber-500">{"★".repeat(d.conviction)}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (<>
            <DialogHeader><DialogTitle>{active.startup} <span className="text-sm text-muted-foreground font-normal">· {active.id}</span></DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[["Founder", active.founder], ["Sector", active.sector], ["Stage", active.stage], ["Asking", fmt(active.asking)], ["Committed", `${fmt(active.committed)} (${Math.round((active.committed / active.asking) * 100)}%)`], ["Pre-money", fmt(active.valuation)], ["Owner", active.owner], ["Conviction", `${"★".repeat(active.conviction)}`], ["Last activity", active.lastTouched]].map(([k, v]) => (
                <div key={k} className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">{k}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground">Move to:</span>
              {stages.filter((s) => s !== active.pipelineStage).map((s) => (
                <Button key={s} size="sm" variant="outline" onClick={() => { move(active.id, s); setActive(null); }}><ArrowRight className="h-3 w-3 mr-1" />{s}</Button>
              ))}
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-start">
              <Button size="sm" variant="outline" onClick={() => toast.success("Memo opened in editor")}><FileText className="h-3.5 w-3.5 mr-1" />Investment memo</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Founder pinged")}><MessageSquare className="h-3.5 w-3.5 mr-1" />Message founder</Button>
              <Button size="sm" onClick={() => toast.success("Added to IC agenda")} className="ml-auto"><TrendingUp className="h-3.5 w-3.5 mr-1" />Push to IC</Button>
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
