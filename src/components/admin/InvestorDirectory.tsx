import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Download, Plus, Globe, ShieldCheck, TrendingUp, Eye, MessageSquare, Ban } from "lucide-react";

type Investor = {
  id: string;
  name: string;
  firm: string;
  type: "Angel" | "VC" | "Family Office" | "Corporate" | "PE" | "Syndicate Lead";
  region: string;
  country: string;
  ticket: string;
  stages: string[];
  sectors: string[];
  aum: string;
  deals: number;
  status: "Active" | "Pending" | "Suspended" | "Dormant";
  accreditation: "Verified" | "Pending" | "Expired" | "Failed";
  club: "Founders" | "Pro" | "LP Circle" | "—";
  joined: string;
  lastActive: string;
};

const seed: Investor[] = [
  { id: "INV-1042", name: "Ahmed Al-Rashid", firm: "Wadi Capital", type: "VC", region: "MENA", country: "UAE", ticket: "$250K–$2M", stages: ["Seed", "Series A"], sectors: ["Fintech", "AI"], aum: "$180M", deals: 34, status: "Active", accreditation: "Verified", club: "LP Circle", joined: "2023-04-12", lastActive: "2h ago" },
  { id: "INV-1043", name: "Priya Iyer", firm: "Self / Angel", type: "Angel", region: "APAC", country: "India", ticket: "$25K–$100K", stages: ["Pre-seed", "Seed"], sectors: ["SaaS", "Climate"], aum: "—", deals: 12, status: "Active", accreditation: "Verified", club: "Pro", joined: "2024-01-08", lastActive: "1d ago" },
  { id: "INV-1044", name: "Marcus Chen", firm: "Northbeam Family Office", type: "Family Office", region: "NA", country: "USA", ticket: "$500K–$5M", stages: ["Series A", "Series B"], sectors: ["Health", "Deep Tech"], aum: "$1.2B", deals: 21, status: "Active", accreditation: "Verified", club: "LP Circle", joined: "2022-11-30", lastActive: "5h ago" },
  { id: "INV-1045", name: "Sofia Almeida", firm: "Lusitana Ventures", type: "VC", region: "EU", country: "Portugal", ticket: "$100K–$1M", stages: ["Seed"], sectors: ["Marketplace"], aum: "$60M", deals: 8, status: "Pending", accreditation: "Pending", club: "—", joined: "2025-04-29", lastActive: "12m ago" },
  { id: "INV-1046", name: "Yuki Tanaka", firm: "Mori Syndicate", type: "Syndicate Lead", region: "APAC", country: "Japan", ticket: "$50K–$500K", stages: ["Seed", "Series A"], sectors: ["Robotics", "AI"], aum: "$22M", deals: 17, status: "Active", accreditation: "Verified", club: "Pro", joined: "2024-07-19", lastActive: "3h ago" },
  { id: "INV-1047", name: "David Okafor", firm: "Sahara Growth", type: "PE", region: "Africa", country: "Nigeria", ticket: "$1M–$10M", stages: ["Series B", "Growth"], sectors: ["Fintech"], aum: "$320M", deals: 11, status: "Active", accreditation: "Verified", club: "LP Circle", joined: "2023-09-01", lastActive: "Yesterday" },
  { id: "INV-1048", name: "Hannah Müller", firm: "Berliner Angels", type: "Angel", region: "EU", country: "Germany", ticket: "$10K–$50K", stages: ["Pre-seed"], sectors: ["Climate", "B2B SaaS"], aum: "—", deals: 6, status: "Suspended", accreditation: "Failed", club: "—", joined: "2024-02-14", lastActive: "21d ago" },
  { id: "INV-1049", name: "Carlos Mendes", firm: "Pampa Capital", type: "VC", region: "LATAM", country: "Brazil", ticket: "$200K–$2M", stages: ["Seed", "Series A"], sectors: ["Agritech", "Fintech"], aum: "$95M", deals: 15, status: "Active", accreditation: "Verified", club: "Pro", joined: "2023-06-22", lastActive: "4h ago" },
];

const statusColor: Record<Investor["status"], string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Suspended: "bg-destructive/15 text-destructive",
  Dormant: "bg-muted text-muted-foreground",
};

export function InvestorDirectory() {
  const [investors, setInvestors] = useState<Investor[]>(seed);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Investor | null>(null);

  const filtered = useMemo(
    () =>
      investors.filter(
        (i) =>
          (region === "all" || i.region === region) &&
          (type === "all" || i.type === type) &&
          (status === "all" || i.status === status) &&
          (q === "" || `${i.name} ${i.firm} ${i.id} ${i.country}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [investors, q, region, type, status],
  );

  const stats = useMemo(() => {
    const total = investors.length;
    const active = investors.filter((i) => i.status === "Active").length;
    const verified = investors.filter((i) => i.accreditation === "Verified").length;
    const dryPowder = investors.filter((i) => i.status === "Active").length * 1.3;
    return { total, active, verified, dryPowder: `$${dryPowder.toFixed(1)}B` };
  }, [investors]);

  const setStatusFor = (id: string, s: Investor["status"]) => {
    setInvestors((p) => p.map((i) => (i.id === id ? { ...i, status: s } : i)));
    toast.success(`Investor ${id} → ${s}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investor Directory</h1>
          <p className="text-sm text-muted-foreground">Master list of accredited investors, syndicates, and institutional LPs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("Exported 8 investors to CSV")}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.info("Invite link copied")}>
            <Plus className="h-4 w-4" /> Invite Investor
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Investors", v: stats.total, s: "+12 this month" },
          { l: "Active", v: stats.active, s: `${Math.round((stats.active / stats.total) * 100)}% of base` },
          { l: "KYC Verified", v: stats.verified, s: "Tier-1 ready" },
          { l: "Indicative Dry Powder", v: stats.dryPowder, s: "Self-reported" },
        ].map((c) => (
          <Card key={c.l}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{c.l}</p>
              <p className="text-2xl font-bold mt-1">{c.v}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{c.s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <CardTitle className="text-base">All Investors</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, firm, ID…" className="pl-9 h-9" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "MENA", "APAC", "NA", "EU", "LATAM", "Africa"].map((r) => (
                  <SelectItem key={r} value={r}>{r === "all" ? "All regions" : r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "Angel", "VC", "Family Office", "Corporate", "PE", "Syndicate Lead"].map((t) => (
                  <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "Active", "Pending", "Suspended", "Dormant"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All status" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Investor</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Stages</th>
                  <th className="px-4 py-3">Deals</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{i.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium leading-tight">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{i.firm} · {i.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{i.type}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground"><span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{i.country}</span></td>
                    <td className="px-4 py-3">{i.ticket}</td>
                    <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{i.stages.map((s) => (<Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>))}</div></td>
                    <td className="px-4 py-3 font-medium">{i.deals}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs ${i.accreditation === "Verified" ? "text-emerald-600" : i.accreditation === "Failed" ? "text-destructive" : "text-amber-600"}`}>
                        <ShieldCheck className="h-3 w-3" />{i.accreditation}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge className={statusColor[i.status]}>{i.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" data-allow-readonly onClick={() => { setActive(i); setOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`Message sent to ${i.name}`)}><MessageSquare className="h-3.5 w-3.5" /></Button>
                        {i.status !== "Suspended" ? (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatusFor(i.id, "Suspended")}><Ban className="h-3.5 w-3.5" /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setStatusFor(i.id, "Active")}><TrendingUp className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{active?.name} <span className="text-muted-foreground text-sm font-normal">· {active?.firm}</span></DialogTitle>
          </DialogHeader>
          {active && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="thesis">Thesis</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Internal Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="grid grid-cols-2 gap-3 text-sm pt-3">
                {[
                  ["Investor ID", active.id], ["Type", active.type], ["Region", `${active.region} · ${active.country}`],
                  ["Ticket size", active.ticket], ["AUM", active.aum], ["Deals on Zynk", String(active.deals)],
                  ["Club", active.club], ["KYC status", active.accreditation], ["Joined", active.joined], ["Last active", active.lastActive],
                ].map(([k, v]) => (
                  <div key={k} className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">{k}</p><p className="font-medium">{v}</p></div>
                ))}
              </TabsContent>
              <TabsContent value="thesis" className="pt-3 text-sm space-y-2">
                <div><Label className="text-xs">Sectors</Label><div className="flex gap-1 mt-1 flex-wrap">{active.sectors.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
                <div><Label className="text-xs">Stages</Label><div className="flex gap-1 mt-1 flex-wrap">{active.stages.map((s) => <Badge key={s}>{s}</Badge>)}</div></div>
                <p className="text-muted-foreground text-xs">Investor's stated thesis is auto-extracted from onboarding intake form and refreshed quarterly.</p>
              </TabsContent>
              <TabsContent value="activity" className="pt-3 text-xs space-y-2">
                {["Reviewed deck — Lattica AI (4h ago)", "Joined syndicate — MENA Climate II (Yesterday)", "Booked call with founder — Mira Health (3d ago)", "Updated thesis tags (1w ago)"].map((a) => (
                  <div key={a} className="border-l-2 border-primary pl-3 py-1">{a}</div>
                ))}
              </TabsContent>
              <TabsContent value="notes" className="pt-3"><Textarea placeholder="Internal note (visible only to admins)…" /></TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={() => { setOpen(false); toast.success("Note saved to investor profile"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
