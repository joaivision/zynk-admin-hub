import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ShieldCheck, Clock } from "lucide-react";
import { useKycRecords, stateColor } from "./KycShared";

export function KycStatusPerUser() {
  const records = useKycRecords();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => records.filter((r) => `${r.user} ${r.email} ${r.country}`.toLowerCase().includes(q.toLowerCase())), [records, q]);

  const byCountry = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of records) m[r.country] = (m[r.country] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [records]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">KYC Status per User</h1>
        <p className="text-sm text-muted-foreground">All users + their current verification state, level, expiry, and history.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-3">
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Avg time to approve</p><p className="text-2xl font-bold mt-1 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> 14h 22m</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Approval rate (90d)</p><p className="text-2xl font-bold mt-1 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /> 87.4%</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">By country</p><div className="flex flex-wrap gap-1 mt-2">{byCountry.map(([c, n]) => <Badge key={c} variant="outline" className="text-[10px]">{c} · {n}</Badge>)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">All Users · KYC Status</CardTitle>
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">Resubmits</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Expires</th></tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{r.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{r.user}</p><p className="text-xs text-muted-foreground">{r.email}</p></div></div></td>
                  <td className="px-4 py-3 text-xs">{r.country}</td>
                  <td className="px-4 py-3 text-xs">{r.level}</td>
                  <td className="px-4 py-3"><Badge className={stateColor[r.state]}>{r.state.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3"><span className={`font-mono text-xs ${r.riskScore < 30 ? "text-emerald-600" : r.riskScore < 60 ? "text-amber-600" : "text-destructive"}`}>{r.riskScore}</span></td>
                  <td className="px-4 py-3 text-xs">{r.resubmitCount}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.submitted}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.expiresAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
