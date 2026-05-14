import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, RefreshCw, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; email: string; name: string; status: "verified" | "pending" | "expired" | "bounced"; sent: string; attempts: number };

const seed: Row[] = [
  { id: "U-2210", email: "sofia@lusitana.vc", name: "Sofia Almeida", status: "pending", sent: "12 min ago", attempts: 1 },
  { id: "U-2211", email: "marcus@northbeam.com", name: "Marcus Chen", status: "verified", sent: "2 d ago", attempts: 1 },
  { id: "U-2212", email: "ahmed@wadi.ae", name: "Ahmed Al-Rashid", status: "verified", sent: "5 d ago", attempts: 2 },
  { id: "U-2213", email: "hannah@berliner-angels.de", name: "Hannah Müller", status: "expired", sent: "8 d ago", attempts: 3 },
  { id: "U-2214", email: "yuki+test@bounced.local", name: "Yuki Tanaka", status: "bounced", sent: "1 d ago", attempts: 4 },
];

const color: Record<Row["status"], string> = {
  verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  expired: "bg-muted text-muted-foreground",
  bounced: "bg-destructive/15 text-destructive",
};

export function EmailVerification() {
  const [rows, setRows] = useState<Row[]>(seed);
  const [q, setQ] = useState("");

  const filtered = rows.filter((r) => `${r.email} ${r.name}`.toLowerCase().includes(q.toLowerCase()));
  const counts = {
    verified: rows.filter((r) => r.status === "verified").length,
    pending: rows.filter((r) => r.status === "pending").length,
    expired: rows.filter((r) => r.status === "expired").length,
    bounced: rows.filter((r) => r.status === "bounced").length,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
        <p className="text-sm text-muted-foreground">Track verification status, resend links, and configure templates.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Verified", v: counts.verified, i: CheckCircle2, t: "text-emerald-600" },
          { l: "Pending", v: counts.pending, i: Clock, t: "text-amber-600" },
          { l: "Expired", v: counts.expired, i: RefreshCw, t: "text-muted-foreground" },
          { l: "Bounced", v: counts.bounced, i: AlertTriangle, t: "text-destructive" },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5 flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p></div><c.i className={`h-5 w-5 ${c.t}`} /></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Verification Status</CardTitle>
              <div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last sent</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div></div></td>
                      <td className="px-4 py-3"><Badge className={color[r.status]}>{r.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.sent}</td>
                      <td className="px-4 py-3 text-xs">{r.attempts}</td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="sm" variant="outline" onClick={() => { setRows((p) => p.map((x) => x.id === r.id ? { ...x, attempts: x.attempts + 1, sent: "just now", status: "pending" } : x)); toast.success(`Resent to ${r.email}`); }}>Resend</Button>
                        {r.status !== "verified" && <Button size="sm" onClick={() => { setRows((p) => p.map((x) => x.id === r.id ? { ...x, status: "verified" } : x)); toast.success("Marked verified"); }}>Mark verified</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="template" className="pt-4">
          <Card><CardContent className="pt-4 space-y-3 text-sm">
            <div><Label>From name</Label><Input defaultValue="Zynk.ing" className="mt-1" /></div>
            <div><Label>From email</Label><Input defaultValue="noreply@zynk.ing" className="mt-1" /></div>
            <div><Label>Subject</Label><Input defaultValue="Confirm your email — Zynk.ing" className="mt-1" /></div>
            <div><Label>Body</Label><div className="mt-1 border rounded-md p-3 bg-muted/30 text-xs font-mono">Hi {`{{first_name}}`},<br/>Click the button below to verify your email.<br/><br/>{`{{verify_button}}`}<br/><br/>This link expires in {`{{ttl_hours}}`} hours.</div></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="settings" className="pt-4">
          <Card><CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><Label>Block unverified login after grace</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Auto-resend after 24h if pending</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Block disposable email domains</Label><Switch defaultChecked /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Link TTL (hours)</Label><Input defaultValue="24" className="mt-1" /></div>
              <div><Label>Max resends / 24h</Label><Input defaultValue="5" className="mt-1" /></div>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
