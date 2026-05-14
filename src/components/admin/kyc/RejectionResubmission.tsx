import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RotateCcw, Send, AlertTriangle } from "lucide-react";
import { useKycRecords, kycStore, REJECTION_CODES } from "./KycShared";
import { toast } from "sonner";

export function RejectionResubmission() {
  const records = useKycRecords();
  const [msg, setMsg] = useState("Please re-upload a clearer photo of your ID front. Make sure all four corners are visible and the document is not expired.");

  const rejected = useMemo(() => records.filter((r) => r.state === "rejected" || r.state === "info_requested"), [records]);

  const reasonStats = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of records) if (r.rejectionCode) m[r.rejectionCode] = (m[r.rejectionCode] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const reopen = (id: string) => {
    const rec = records.find((r) => r.id === id); if (!rec) return;
    kycStore.update(id, { state: "submitted", resubmitCount: rec.resubmitCount + 1, rejectionCode: undefined, rejectionNote: undefined });
    toast.success(`${id} reopened for resubmission`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Rejection & Resubmission</h1>
        <p className="text-sm text-muted-foreground">Manage rejected verifications, message users, and reopen for resubmission.</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Rejected Users</TabsTrigger>
          <TabsTrigger value="reasons">Reason Analytics</TabsTrigger>
          <TabsTrigger value="policy">Resubmission Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4 space-y-3">
          {rejected.length === 0 && <p className="text-sm text-muted-foreground">No rejections.</p>}
          {rejected.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback>{r.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{r.user} <span className="text-xs text-muted-foreground">· {r.id}</span></p>
                      <p className="text-xs text-muted-foreground">{r.email} · {r.country}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {r.rejectionCode && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">{r.rejectionCode}</Badge>}
                        <span className="text-xs text-muted-foreground">resubmits: {r.resubmitCount}</span>
                        {r.resubmitCount >= 2 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />Manual escalation</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Notification sent")}>
                      <Send className="h-4 w-4" /> Send template
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => reopen(r.id)} disabled={r.resubmitCount >= 3}>
                      <RotateCcw className="h-4 w-4" /> Reopen
                    </Button>
                  </div>
                </div>
                {r.rejectionNote && <div className="text-xs bg-muted/50 border rounded p-2"><strong>Reviewer note:</strong> {r.rejectionNote}</div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reasons" className="pt-4">
          <Card><CardHeader><CardTitle className="text-base">Top rejection reasons (90d)</CardTitle></CardHeader><CardContent className="space-y-2">
            {reasonStats.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
            {reasonStats.map(([code, n]) => {
              const max = Math.max(...reasonStats.map(([, v]) => v));
              return (
                <div key={code} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-mono">{code}</span><span>{n}</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="policy" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle className="text-sm">Resubmission Rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Max resubmissions</Label><Input defaultValue="3" className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Cooldown (hours)</Label><Input defaultValue="24" className="h-9 mt-1" /></div>
              </div>
              <div className="flex items-center justify-between"><Label>Auto-reject after max attempts</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Escalate to T&S after 2 attempts</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Require new document on every resubmit</Label><Switch /></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="text-sm">User Message Template</CardTitle></CardHeader><CardContent className="space-y-2">
              <div><Label className="text-xs">Reason code</Label><Select defaultValue="DOC_BLURRY"><SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger><SelectContent>{REJECTION_CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Message body</Label><Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} className="mt-1" /></div>
              <Button size="sm" onClick={() => toast.success("Template saved")}>Save template</Button>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
