import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Search, Plus, Lock, FileSignature, Banknote, AlertTriangle, Globe, Layers } from "lucide-react";

type SPVStatus = "Forming" | "Subscribing" | "Funded" | "Wired" | "Closed" | "Wound Down";
type SPV = {
  id: string;
  name: string;
  lead: string;
  target: string;
  jurisdiction: "Delaware LLC" | "Cayman SPC" | "ADGM SPV" | "DIFC ICC" | "Luxembourg SCSp" | "Singapore VCC";
  carry: number;
  managementFee: number;
  raised: number;
  target_raise: number;
  minTicket: number;
  members: number;
  status: SPVStatus;
  closeDate: string;
  fundingRoundType: "Lead" | "Co-investor" | "Follow-on";
};

const seed: SPV[] = [
  { id: "SPV-501", name: "Lattica AI - Series A SPV", lead: "Wadi Capital", target: "Lattica AI", jurisdiction: "Delaware LLC", carry: 20, managementFee: 2, raised: 1_850_000, target_raise: 2_500_000, minTicket: 25_000, members: 34, status: "Subscribing", closeDate: "2025-06-15", fundingRoundType: "Co-investor" },
  { id: "SPV-502", name: "MENA Climate II", lead: "Wadi Capital", target: "Verdura + 2 others", jurisdiction: "ADGM SPV", carry: 20, managementFee: 2, raised: 4_200_000, target_raise: 5_000_000, minTicket: 50_000, members: 21, status: "Funded", closeDate: "2025-04-30", fundingRoundType: "Lead" },
  { id: "SPV-503", name: "Mira Health Bridge", lead: "Mori Syndicate", target: "Mira Health", jurisdiction: "Cayman SPC", carry: 15, managementFee: 1.5, raised: 800_000, target_raise: 1_000_000, minTicket: 10_000, members: 47, status: "Subscribing", closeDate: "2025-05-30", fundingRoundType: "Follow-on" },
  { id: "SPV-504", name: "Khaleej Logistics B-1", lead: "Wadi Capital", target: "Khaleej Logistics", jurisdiction: "DIFC ICC", carry: 20, managementFee: 2, raised: 6_000_000, target_raise: 6_000_000, minTicket: 100_000, members: 12, status: "Wired", closeDate: "2025-03-12", fundingRoundType: "Co-investor" },
  { id: "SPV-505", name: "Sahel Pay Pre-seed", lead: "Sahara Growth", target: "Sahel Pay", jurisdiction: "Luxembourg SCSp", carry: 10, managementFee: 1, raised: 0, target_raise: 500_000, minTicket: 5_000, members: 0, status: "Forming", closeDate: "2025-07-01", fundingRoundType: "Lead" },
];

type Syndicate = {
  id: string;
  name: string;
  lead: string;
  members: number;
  thesis: string;
  region: string;
  totalDeployed: number;
  spvCount: number;
  status: "Active" | "Paused";
};

const synSeed: Syndicate[] = [
  { id: "SYN-101", name: "Wadi Frontier", lead: "Ahmed Al-Rashid", members: 142, thesis: "MENA + Africa fintech, Seed–Series A, $250k–$2M tickets.", region: "MENA/Africa", totalDeployed: 18_400_000, spvCount: 9, status: "Active" },
  { id: "SYN-102", name: "Mori Syndicate", lead: "Yuki Tanaka", members: 87, thesis: "APAC robotics & AI. Pre-seed to Seed.", region: "APAC", totalDeployed: 6_200_000, spvCount: 6, status: "Active" },
  { id: "SYN-103", name: "Pampa Climate", lead: "Carlos Mendes", members: 53, thesis: "LATAM climate, agritech, hardware. Seed only.", region: "LATAM", totalDeployed: 3_900_000, spvCount: 4, status: "Active" },
  { id: "SYN-104", name: "Berliner DeepTech", lead: "Hannah Müller", members: 38, thesis: "EU deep-tech, dual-use, B2B SaaS.", region: "EU", totalDeployed: 1_200_000, spvCount: 2, status: "Paused" },
];

const statusColor: Record<SPVStatus, string> = {
  Forming: "bg-slate-500/15 text-slate-700",
  Subscribing: "bg-blue-500/15 text-blue-700",
  Funded: "bg-violet-500/15 text-violet-700",
  Wired: "bg-emerald-500/15 text-emerald-700",
  Closed: "bg-muted text-muted-foreground",
  "Wound Down": "bg-muted text-muted-foreground",
};

const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}k`;

export function InvestorSyndicates() {
  const [spvs, setSpvs] = useState<SPV[]>(seed);
  const [syndicates] = useState<Syndicate[]>(synSeed);
  const [tab, setTab] = useState("spvs");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<SPV | null>(null);

  const filtered = useMemo(
    () => spvs.filter((s) => (status === "all" || s.status === status) && (q === "" || `${s.name} ${s.lead} ${s.target}`.toLowerCase().includes(q.toLowerCase()))),
    [spvs, q, status],
  );

  const totals = useMemo(() => ({
    spvs: spvs.length,
    raised: spvs.reduce((a, s) => a + s.raised, 0),
    members: spvs.reduce((a, s) => a + s.members, 0),
    avgCarry: Math.round(spvs.reduce((a, s) => a + s.carry, 0) / spvs.length),
  }), [spvs]);

  const advance = (id: string) => {
    const order: SPVStatus[] = ["Forming", "Subscribing", "Funded", "Wired", "Closed"];
    setSpvs((p) => p.map((s) => {
      if (s.id !== id) return s;
      const i = order.indexOf(s.status);
      if (i < 0 || i === order.length - 1) return s;
      return { ...s, status: order[i + 1] };
    }));
    toast.success("SPV status advanced");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Syndicates & SPVs</h1>
          <p className="text-sm text-muted-foreground">Special-purpose vehicles, lead syndicates, subscription tracking, and entity admin.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create SPV</Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Active SPVs", v: totals.spvs, s: "+2 this month" },
          { l: "Capital raised (YTD)", v: fmt(totals.raised), s: "Across all SPVs" },
          { l: "Subscribed members", v: totals.members, s: "Unique LPs" },
          { l: "Avg. carry", v: `${totals.avgCarry}%`, s: "Mgmt fee 1–2%" },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p><p className="text-[11px] text-muted-foreground mt-1">{c.s}</p></CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="spvs">SPVs</TabsTrigger>
          <TabsTrigger value="syndicates">Syndicates</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="spvs" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" />All SPVs</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
                <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent>{["all", "Forming", "Subscribing", "Funded", "Wired", "Closed"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All status" : s}</SelectItem>)}</SelectContent></Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">SPV</th><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Jurisdiction</th><th className="px-4 py-3">Subscription</th><th className="px-4 py-3">Members</th><th className="px-4 py-3">Carry/Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setActive(s)}>
                        <td className="px-4 py-3"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.id} · {s.target}</p></td>
                        <td className="px-4 py-3 text-xs">{s.lead}<br /><Badge variant="outline" className="mt-1 text-[10px]">{s.fundingRoundType}</Badge></td>
                        <td className="px-4 py-3 text-xs"><div className="flex items-center gap-1"><Globe className="h-3 w-3" />{s.jurisdiction}</div></td>
                        <td className="px-4 py-3 w-48">
                          <div className="flex justify-between text-xs mb-1"><span>{fmt(s.raised)}</span><span className="text-muted-foreground">/ {fmt(s.target_raise)}</span></div>
                          <Progress value={(s.raised / s.target_raise) * 100} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground mt-1">Min ticket {fmt(s.minTicket)}</p>
                        </td>
                        <td className="px-4 py-3 font-mono">{s.members}</td>
                        <td className="px-4 py-3 text-xs">{s.carry}% / {s.managementFee}%</td>
                        <td className="px-4 py-3"><Badge className={statusColor[s.status]}>{s.status}</Badge></td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" onClick={() => advance(s.id)}>Advance →</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syndicates" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {syndicates.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback>{s.lead.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div><CardTitle className="text-base">{s.name}</CardTitle><p className="text-xs text-muted-foreground">Lead: {s.lead} · {s.region}</p></div>
                  </div>
                  <Badge variant={s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground text-xs">{s.thesis}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border rounded-md p-2"><p className="text-[10px] uppercase text-muted-foreground">Members</p><p className="font-bold">{s.members}</p></div>
                    <div className="border rounded-md p-2"><p className="text-[10px] uppercase text-muted-foreground">Deployed</p><p className="font-bold">{fmt(s.totalDeployed)}</p></div>
                    <div className="border rounded-md p-2"><p className="text-[10px] uppercase text-muted-foreground">SPVs</p><p className="font-bold">{s.spvCount}</p></div>
                  </div>
                  <div className="flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Opening members directory")}>View members</Button><Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Opening fee schedule")}>Fee schedule</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Investor caps & limits</CardTitle></CardHeader><CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>SEC Reg D 506(b): max 35 non-accredited investors per SPV.</p>
              <p>SEC Reg D 506(c): unlimited accredited only — general solicitation OK.</p>
              <p>EU AIFMD: SPV with > €100M AUM triggers full AIFM authorization.</p>
              <p>UAE ADGM: max 50 investors per SPV (private placement exemption).</p>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileSignature className="h-4 w-4" />Document templates</CardTitle></CardHeader><CardContent className="text-xs space-y-2">
              {["Operating Agreement (Delaware LLC)", "Subscription Agreement", "Side Letter (carry waiver)", "Form D (auto-file SEC)", "Annual K-1 generator"].map((t) => (
                <div key={t} className="flex items-center justify-between border rounded-md p-2"><span>{t}</span><Button size="sm" variant="ghost">Edit</Button></div>
              ))}
            </CardContent></Card>
            <Card className="md:col-span-2 border-amber-500/30"><CardContent className="pt-4 flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" /><div><p className="text-sm font-medium">2 SPVs require attention</p><p className="text-xs text-muted-foreground mt-1">SPV-503 (Mira Health Bridge): 47 investors approaching MAS S$5M cap. SPV-501 (Lattica AI): 3 LP subscriptions pending W-9 collection — wire blocked until cleared.</p></div></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (<>
            <DialogHeader><DialogTitle>{active.name}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[["SPV ID", active.id], ["Target", active.target], ["Lead", active.lead], ["Jurisdiction", active.jurisdiction], ["Carry", `${active.carry}%`], ["Mgmt fee", `${active.managementFee}% / yr`], ["Min ticket", fmt(active.minTicket)], ["Raised", `${fmt(active.raised)} / ${fmt(active.target_raise)}`], ["Target close", active.closeDate]].map(([k, v]) => (
                <div key={k} className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">{k}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <Button size="sm" variant="outline" onClick={() => toast.success("Subscription page link copied")}><Banknote className="h-3.5 w-3.5 mr-1" />Open subscription page</Button>
              <Button size="sm" onClick={() => { advance(active.id); setActive(null); }}>Advance status</Button>
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New SPV</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div><Label className="text-xs">SPV name</Label><Input placeholder="e.g. Lattica AI - Series A SPV" /></div>
            <div><Label className="text-xs">Target company</Label><Input placeholder="Startup name" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Jurisdiction</Label>
                <Select defaultValue="Delaware LLC"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Delaware LLC", "Cayman SPC", "ADGM SPV", "DIFC ICC", "Luxembourg SCSp", "Singapore VCC"].map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Min ticket (USD)</Label><Input type="number" placeholder="25000" /></div>
              <div><Label className="text-xs">Carry %</Label><Input type="number" placeholder="20" /></div>
              <div><Label className="text-xs">Mgmt fee %</Label><Input type="number" placeholder="2" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => { setCreateOpen(false); toast.success("SPV created → routed to compliance review"); }}>Create SPV</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
