import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; phone: string; name: string; country: string; status: "verified" | "pending" | "failed" | "blocked"; channel: "SMS" | "WhatsApp" | "Voice"; cost: number };

const seed: Row[] = [
  { id: "U-3110", phone: "+351 91 234 5678", name: "Sofia Almeida", country: "PT", status: "verified", channel: "SMS", cost: 0.04 },
  { id: "U-3111", phone: "+1 415 555 0142", name: "Marcus Chen", country: "US", status: "pending", channel: "SMS", cost: 0.0075 },
  { id: "U-3112", phone: "+971 50 123 4567", name: "Ahmed Al-Rashid", country: "AE", status: "verified", channel: "WhatsApp", cost: 0.02 },
  { id: "U-3113", phone: "+49 30 0000 0000", name: "Hannah Müller", country: "DE", status: "failed", channel: "SMS", cost: 0.06 },
  { id: "U-3114", phone: "+1 555 000 0000", name: "Spam Bot", country: "US", status: "blocked", channel: "SMS", cost: 0 },
];

const color: Record<Row["status"], string> = {
  verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  failed: "bg-destructive/15 text-destructive",
  blocked: "bg-muted text-muted-foreground",
};

export function PhoneVerification() {
  const [rows, setRows] = useState<Row[]>(seed);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Phone / OTP Verification</h1>
        <p className="text-sm text-muted-foreground">SMS / WhatsApp / Voice OTP delivery, fraud filters, and per-country cost.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Verified (24h)", v: 1248, i: CheckCircle2, t: "text-emerald-600" },
          { l: "Pending", v: 86, i: Phone, t: "text-amber-600" },
          { l: "Failed (24h)", v: 31, i: AlertTriangle, t: "text-destructive" },
          { l: "OTP cost (24h)", v: "$28.41", i: Smartphone, t: "text-primary" },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5 flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p></div><c.i className={`h-5 w-5 ${c.t}`} /></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Recent</TabsTrigger>
          <TabsTrigger value="config">Provider Config</TabsTrigger>
          <TabsTrigger value="rules">Fraud Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Channel</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3"><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.id}</p></td>
                    <td className="px-4 py-3 font-mono text-xs">{r.phone}</td>
                    <td className="px-4 py-3 text-xs">{r.country}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{r.channel}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">${r.cost.toFixed(4)}</td>
                    <td className="px-4 py-3"><Badge className={color[r.status]}>{r.status}</Badge></td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => toast.success(`OTP resent via ${r.channel}`)}>Resend</Button>
                      {r.status !== "blocked" && <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setRows((p) => p.map((x) => x.id === r.id ? { ...x, status: "blocked" } : x)); toast.success("Blocked number"); }}>Block</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="config" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle className="text-sm">Primary SMS Provider</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <Select defaultValue="twilio"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["twilio", "messagebird", "vonage", "aws-sns"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
              <div><Label className="text-xs">Account SID</Label><Input defaultValue="ACxxxx…1f4d" className="h-9 mt-1 font-mono text-xs" /></div>
              <div><Label className="text-xs">Sender ID / From</Label><Input defaultValue="ZYNK" className="h-9 mt-1" /></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">WhatsApp / Voice fallback</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><Label>Use WhatsApp first if available</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Voice OTP after 2 SMS fails</Label><Switch defaultChecked /></div>
              <div><Label className="text-xs">OTP length</Label><Input defaultValue="6" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">TTL (seconds)</Label><Input defaultValue="300" className="h-9 mt-1" /></div>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="pt-4">
          <Card><CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><Label>Block VoIP / disposable numbers</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Block premium-rate destinations</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Geo-restrict (deny IR, KP, SY, RU, BY)</Label><Switch defaultChecked /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Max OTP / number / hr</Label><Input defaultValue="5" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Max OTP / IP / hr</Label><Input defaultValue="10" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Daily spend cap (USD)</Label><Input defaultValue="200" className="h-9 mt-1" /></div>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
