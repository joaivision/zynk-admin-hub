import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Star, Sparkles, Users, ArrowUpRight, Search, Award, Lock } from "lucide-react";

type Tier = {
  id: "founders" | "pro" | "lp_circle";
  name: string;
  price: string;
  cap?: number;
  members: number;
  perks: string[];
  color: string;
};

type Member = {
  id: string;
  name: string;
  firm: string;
  tier: Tier["id"];
  nps: number;
  dealsCo: number;
  joined: string;
  status: "Active" | "Pending" | "Churned";
};

const tiers: Tier[] = [
  { id: "founders", name: "Founders Circle", price: "Invite-only", cap: 50, members: 38, color: "text-amber-600 bg-amber-500/15", perks: ["First-look on all deals", "Quarterly closed-door dinners", "1:1 with platform team", "Co-invest priority", "Dedicated relationship manager"] },
  { id: "lp_circle", name: "LP Circle", price: "$25,000/yr", cap: 200, members: 142, color: "text-violet-600 bg-violet-500/15", perks: ["Institutional deal flow", "SPV admin discount 30%", "Quarterly LP-only research", "Annual summit access"] },
  { id: "pro", name: "Pro Investor", price: "$2,400/yr", members: 1284, color: "text-emerald-600 bg-emerald-500/15", perks: ["Unlimited deal saves", "Founder direct messaging", "Syndicate participation", "Pitch deck AI summaries"] },
];

const seed: Member[] = [
  { id: "M-9001", name: "Ahmed Al-Rashid", firm: "Wadi Capital", tier: "founders", nps: 9, dealsCo: 14, joined: "2023-04-12", status: "Active" },
  { id: "M-9002", name: "Marcus Chen", firm: "Northbeam", tier: "founders", nps: 10, dealsCo: 9, joined: "2022-11-30", status: "Active" },
  { id: "M-9003", name: "David Okafor", firm: "Sahara Growth", tier: "lp_circle", nps: 8, dealsCo: 5, joined: "2023-09-01", status: "Active" },
  { id: "M-9004", name: "Yuki Tanaka", firm: "Mori Syndicate", tier: "pro", nps: 9, dealsCo: 8, joined: "2024-07-19", status: "Active" },
  { id: "M-9005", name: "Priya Iyer", firm: "Self / Angel", tier: "pro", nps: 7, dealsCo: 3, joined: "2024-01-08", status: "Active" },
  { id: "M-9006", name: "Carlos Mendes", firm: "Pampa Capital", tier: "lp_circle", nps: 8, dealsCo: 4, joined: "2023-06-22", status: "Active" },
  { id: "M-9007", name: "Linda Park", firm: "Han Family Office", tier: "lp_circle", nps: 6, dealsCo: 1, joined: "2024-12-02", status: "Pending" },
  { id: "M-9008", name: "Roberto Silva", firm: "Iguaçu Angels", tier: "pro", nps: 4, dealsCo: 0, joined: "2024-03-11", status: "Churned" },
];

const tierIcon = { founders: Crown, lp_circle: Award, pro: Star };

export function InvestorClub() {
  const [members, setMembers] = useState<Member[]>(seed);
  const [tab, setTab] = useState("tiers");
  const [q, setQ] = useState("");
  const [autoUpgrade, setAutoUpgrade] = useState(true);
  const [pendingNominee, setPendingNominee] = useState<Member | null>(null);

  const filtered = useMemo(() => members.filter((m) => q === "" || `${m.name} ${m.firm} ${m.id}`.toLowerCase().includes(q.toLowerCase())), [members, q]);

  const promote = (id: string, tier: Tier["id"]) => {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, tier, status: "Active" } : m)));
    toast.success(`Member promoted to ${tiers.find((t) => t.id === tier)?.name}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investor Club Membership</h1>
          <p className="text-sm text-muted-foreground">Tiered membership program with perks, allocation priority, and SPV discounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm"><Switch checked={autoUpgrade} onCheckedChange={setAutoUpgrade} /><Label className="text-xs">Auto-upgrade by activity score</Label></div>
          <Button size="sm" className="gap-1" onClick={() => toast.success("Founders Circle nomination sent for committee review")}><Sparkles className="h-4 w-4" /> Nominate to Founders</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((t) => {
          const Icon = tierIcon[t.id];
          const fillPct = t.cap ? Math.round((t.members / t.cap) * 100) : null;
          return (
            <Card key={t.id} className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 h-20 w-20 ${t.color} opacity-30 blur-2xl rounded-full`} />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5" />{t.name}</CardTitle>
                  <Badge className={t.color}>{t.price}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{t.members}{t.cap ? ` / ${t.cap}` : ""}</span>
                </div>
                {fillPct !== null && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${fillPct}%` }} /></div>
                )}
                <ul className="space-y-1 text-xs text-muted-foreground">{t.perks.map((p) => <li key={p} className="flex gap-2"><span className="text-primary">•</span>{p}</li>)}</ul>
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info(`Editing ${t.name} perks`)}>Manage perks</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tiers">Members</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="benefits">Benefit Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Active Members</CardTitle>
              <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">NPS</th><th className="px-4 py-3">Co-invests</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {filtered.map((m) => {
                      const tier = tiers.find((t) => t.id === m.tier)!;
                      const Icon = tierIcon[m.tier];
                      return (
                        <tr key={m.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{m.name}</p><p className="text-xs text-muted-foreground">{m.firm} · {m.id}</p></div></div></td>
                          <td className="px-4 py-3"><Badge className={tier.color}><Icon className="h-3 w-3 mr-1" />{tier.name}</Badge></td>
                          <td className="px-4 py-3"><span className={`font-mono text-xs font-semibold ${m.nps >= 9 ? "text-emerald-600" : m.nps >= 7 ? "text-amber-600" : "text-destructive"}`}>{m.nps}</span></td>
                          <td className="px-4 py-3 font-medium">{m.dealsCo}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{m.joined}</td>
                          <td className="px-4 py-3"><Badge variant={m.status === "Active" ? "default" : m.status === "Pending" ? "secondary" : "outline"}>{m.status}</Badge></td>
                          <td className="px-4 py-3 text-right">
                            {m.tier !== "founders" && (<Button size="sm" variant="ghost" onClick={() => promote(m.id, m.tier === "pro" ? "lp_circle" : "founders")}><ArrowUpRight className="h-3.5 w-3.5 mr-1" />Upgrade</Button>)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="pt-4">
          <Card><CardContent className="pt-4 space-y-2">
            {[
              { name: "Aiko Suzuki", firm: "Tomoe Capital", tier: "Founders", reason: "Referred by Ahmed Al-Rashid · 8 years VC, 22 deals" },
              { name: "Omar Khoury", firm: "Beirut Angels", tier: "LP Circle", reason: "AUM > $50M attested · 12 syndicate deals last yr" },
              { name: "Ines Roux", firm: "Self / Angel", tier: "LP Circle", reason: "Repeat founder — 2 exits · Co-investor on 4 Pro deals" },
            ].map((w) => (
              <div key={w.name} className="flex items-center justify-between border rounded-md p-3">
                <div><p className="font-medium text-sm">{w.name} <span className="text-xs text-muted-foreground font-normal">· {w.firm}</span></p><p className="text-xs text-muted-foreground mt-0.5">{w.reason}</p></div>
                <div className="flex gap-1"><Badge variant="outline">{w.tier}</Badge><Button size="sm" onClick={() => { setPendingNominee({ id: "M-9100", name: w.name, firm: w.firm, tier: "founders", nps: 0, dealsCo: 0, joined: "today", status: "Pending" }); }}>Review</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="benefits" className="pt-4">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Allocation & Perk Rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            {[
              { rule: "Founders Circle gets 48h first-look on all deals > $1M raise", on: true },
              { rule: "LP Circle waives SPV admin fee for any deal where they lead $250k+", on: true },
              { rule: "Pro members get 7 free pitch deck AI summaries / month", on: true },
              { rule: "Auto-downgrade Pro → Free if no logins for 90 days", on: false },
              { rule: "Founders Circle annual physical kit (notebook, badge, summit invite)", on: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between border rounded-md p-3"><span className="text-sm">{r.rule}</span><Switch defaultChecked={r.on} /></div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!pendingNominee} onOpenChange={(o) => !o && setPendingNominee(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve nomination</DialogTitle></DialogHeader>
          <p className="text-sm">Promote <strong>{pendingNominee?.name}</strong> ({pendingNominee?.firm}) to Founders Circle? This requires CISO + Head of Investor Relations sign-off.</p>
          <DialogFooter><Button variant="outline" onClick={() => setPendingNominee(null)}>Cancel</Button><Button onClick={() => { toast.success(`${pendingNominee?.name} approved → routed to CISO for co-sign`); setPendingNominee(null); }}>Approve & Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
