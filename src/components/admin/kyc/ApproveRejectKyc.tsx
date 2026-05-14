import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, MessageSquareWarning, FileText, ShieldAlert } from "lucide-react";
import { useKycRecords, kycStore, stateColor, REJECTION_CODES, type KycRecord } from "./KycShared";
import { toast } from "sonner";

export function ApproveRejectKyc() {
  const records = useKycRecords();
  const [sel, setSel] = useState<KycRecord | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "request" | null>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");

  const queue = useMemo(() => records.filter((r) => ["submitted", "in_review", "info_requested"].includes(r.state)), [records]);

  const open = (rec: KycRecord, a: "approve" | "reject" | "request") => {
    setSel(rec); setAction(a); setCode(""); setNote("");
  };

  const confirm = () => {
    if (!sel || !action) return;
    if (action === "approve") {
      kycStore.update(sel.id, { state: "approved", reviewer: "you@zynk.ing", expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10), rejectionCode: undefined, rejectionNote: undefined });
      toast.success(`${sel.id} approved`);
    } else if (action === "reject") {
      if (!code) return toast.error("Pick a reason code");
      kycStore.update(sel.id, { state: "rejected", reviewer: "you@zynk.ing", rejectionCode: code, rejectionNote: note });
      toast.success(`${sel.id} rejected (${code})`);
    } else {
      if (!note) return toast.error("Add a note for the user");
      kycStore.update(sel.id, { state: "info_requested", reviewer: "you@zynk.ing", rejectionCode: code || "INCOMPLETE_EVIDENCE", rejectionNote: note });
      toast.success(`${sel.id} info requested`);
    }
    setSel(null); setAction(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Approve / Reject KYC</h1>
        <p className="text-sm text-muted-foreground">Final-decision workflow with reason codes, audit trail, and 4-eyes for high-risk.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Awaiting decision</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {queue.length === 0 && <p className="text-sm text-muted-foreground">No pending decisions.</p>}
          {queue.map((r) => (
            <div key={r.id} className="border rounded-md p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback>{r.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{r.user} <span className="text-xs text-muted-foreground">· {r.id}</span></p>
                    <p className="text-xs text-muted-foreground">{r.email} · {r.country} · {r.level}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={stateColor[r.state]}>{r.state.replace("_", " ")}</Badge>
                      <span className={`text-xs font-mono ${r.riskScore < 30 ? "text-emerald-600" : r.riskScore < 60 ? "text-amber-600" : "text-destructive"}`}>risk {r.riskScore}</span>
                      {r.pep && <Badge variant="outline" className="text-[10px]"><ShieldAlert className="h-3 w-3 mr-1" />PEP</Badge>}
                      {r.riskScore >= 60 && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">4-eyes required</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => open(r, "request")} className="gap-1"><MessageSquareWarning className="h-4 w-4" /> Request info</Button>
                  <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => open(r, "reject")}><XCircle className="h-4 w-4" /> Reject</Button>
                  <Button size="sm" className="gap-1" onClick={() => open(r, "approve")}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {r.docs.map((d) => (
                  <div key={d.name} className="border rounded p-2 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate"><FileText className="h-3 w-3 text-muted-foreground shrink-0" /><span className="truncate">{d.type}</span></div>
                    <Badge variant="outline" className={`text-[10px] ${d.status === "Verified" ? "text-emerald-600" : d.status === "Rejected" ? "text-destructive" : ""}`}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!sel} onOpenChange={(o) => !o && (setSel(null), setAction(null))}>
        <DialogContent className="max-w-md">
          {sel && action && (<>
            <DialogHeader><DialogTitle>{action === "approve" ? "Approve" : action === "reject" ? "Reject" : "Request info"} · {sel.id}</DialogTitle></DialogHeader>
            {action !== "approve" && (
              <div>
                <Label className="text-xs">Reason code</Label>
                <Select value={code} onValueChange={setCode}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pick reason…" /></SelectTrigger>
                  <SelectContent>{REJECTION_CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs">{action === "approve" ? "Reviewer note (optional, audit log)" : "Message to user"}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" placeholder={action === "request" ? "Please re-upload a clearer ID front…" : "Notes…"} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => (setSel(null), setAction(null))}>Cancel</Button>
              <Button onClick={confirm}>Confirm {action}</Button>
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
