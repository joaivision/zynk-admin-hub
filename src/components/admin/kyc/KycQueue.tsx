import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, CheckCircle2, XCircle, AlertTriangle, Globe } from "lucide-react";
import { useKycRecords, kycStore, stateColor, type KycState } from "./KycShared";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function KycQueue() {
  const records = useKycRecords();
  const [q, setQ] = useState("");
  const [state, setState] = useState<"all" | KycState>("all");
  const [country, setCountry] = useState("all");

  const filtered = useMemo(() => records.filter((r) => (state === "all" || r.state === state) && (country === "all" || r.country === country) && (q === "" || `${r.user} ${r.email} ${r.id}`.toLowerCase().includes(q.toLowerCase()))), [records, q, state, country]);

  const counts = {
    queue: records.filter((r) => ["submitted", "in_review", "info_requested"].includes(r.state)).length,
    approved: records.filter((r) => r.state === "approved").length,
    rejected: records.filter((r) => r.state === "rejected").length,
    sla: records.filter((r) => r.state === "submitted").length,
  };

  const claim = (id: string) => { kycStore.update(id, { state: "in_review", reviewer: "you@zynk.ing" }); toast.success(`${id} claimed`); };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">KYC Queue</h1>
        <p className="text-sm text-muted-foreground">Review queue for all submitted user verifications across regions.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "In Queue", v: counts.queue, i: Clock, t: "text-amber-600" },
          { l: "Approved", v: counts.approved, i: CheckCircle2, t: "text-emerald-600" },
          { l: "Rejected", v: counts.rejected, i: XCircle, t: "text-destructive" },
          { l: "Awaiting claim", v: counts.sla, i: AlertTriangle, t: "text-orange-600" },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5 flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p></div><c.i className={`h-5 w-5 ${c.t}`} /></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <CardTitle className="text-base">Submissions</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
            <Select value={state} onValueChange={(v) => setState(v as any)}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "submitted", "in_review", "info_requested", "approved", "rejected", "expired"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "US", "PT", "DE", "AE", "JP", "IN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">AML</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Reviewer</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{r.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{r.user}</p><p className="text-xs text-muted-foreground">{r.email} · {r.id}</p></div></div></td>
                  <td className="px-4 py-3 text-xs"><div className="flex items-center gap-1"><Globe className="h-3 w-3" />{r.country}</div></td>
                  <td className="px-4 py-3 text-xs">{r.level}</td>
                  <td className="px-4 py-3"><span className={`font-mono text-xs ${r.riskScore < 30 ? "text-emerald-600" : r.riskScore < 60 ? "text-amber-600" : "text-destructive"}`}>{r.riskScore}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1">{r.pep && <Badge variant="outline" className="text-[10px]">PEP</Badge>}{r.sanctions && <Badge variant="destructive" className="text-[10px]">Sanc</Badge>}{!r.pep && !r.sanctions && <span className="text-xs text-emerald-600">Clear</span>}</div></td>
                  <td className="px-4 py-3"><Badge className={stateColor[r.state]}>{r.state.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.reviewer ?? "—"}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {r.state === "submitted" && <Button size="sm" onClick={() => claim(r.id)}>Claim</Button>}
                    <Button size="sm" variant="outline" asChild><Link to="/admin/$" params={{ _splat: "kyc/review" }} search={{ id: r.id } as any}>Open</Link></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
