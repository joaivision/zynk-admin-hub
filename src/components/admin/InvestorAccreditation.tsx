import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, FileCheck, AlertTriangle, Search, FileText, ScanFace, Globe, Clock, CheckCircle2, XCircle } from "lucide-react";

type Doc = { name: string; type: string; status: "Verified" | "Pending" | "Rejected"; uploaded: string };
type Item = {
  id: string;
  investor: string;
  firm: string;
  jurisdiction: string;
  framework: "SEC Reg D 506(c)" | "FCA HNW" | "ESMA Pro" | "SCA UAE Qualified" | "MAS AI" | "SEBI AIF";
  basis: "Income" | "Net Worth" | "Professional Cert." | "Entity Status" | "Self-Cert + Risk Quiz";
  riskScore: number;
  pep: boolean;
  sanctions: boolean;
  adverseMedia: boolean;
  state: "submitted" | "id_verified" | "kyc_approved" | "approved" | "rejected" | "expired";
  submitted: string;
  expiresAt: string;
  reviewer?: string;
  docs: Doc[];
};

const seed: Item[] = [
  { id: "ACC-3010", investor: "Sofia Almeida", firm: "Lusitana Ventures", jurisdiction: "PT", framework: "ESMA Pro", basis: "Professional Cert.", riskScore: 22, pep: false, sanctions: false, adverseMedia: false, state: "submitted", submitted: "2025-05-10", expiresAt: "2026-05-10", docs: [
    { name: "Passport.pdf", type: "ID", status: "Pending", uploaded: "2025-05-10" },
    { name: "ProofOfAddress.pdf", type: "Address", status: "Pending", uploaded: "2025-05-10" },
    { name: "MiFID-Pro.pdf", type: "Accreditation", status: "Pending", uploaded: "2025-05-10" },
  ]},
  { id: "ACC-3011", investor: "Marcus Chen", firm: "Northbeam Family Office", jurisdiction: "US", framework: "SEC Reg D 506(c)", basis: "Net Worth", riskScore: 14, pep: false, sanctions: false, adverseMedia: false, state: "id_verified", submitted: "2025-05-08", expiresAt: "2026-05-08", reviewer: "fatima@zynk.ing", docs: [
    { name: "Drivers-License.jpg", type: "ID", status: "Verified", uploaded: "2025-05-08" },
    { name: "CPA-Letter.pdf", type: "Net Worth", status: "Pending", uploaded: "2025-05-08" },
  ]},
  { id: "ACC-3012", investor: "Ahmed Al-Rashid", firm: "Wadi Capital", jurisdiction: "AE", framework: "SCA UAE Qualified", basis: "Entity Status", riskScore: 8, pep: true, sanctions: false, adverseMedia: false, state: "kyc_approved", submitted: "2025-05-05", expiresAt: "2026-05-05", reviewer: "fatima@zynk.ing", docs: [
    { name: "EmiratesID.pdf", type: "ID", status: "Verified", uploaded: "2025-05-05" },
    { name: "TradeLicense.pdf", type: "Entity", status: "Verified", uploaded: "2025-05-05" },
    { name: "PEP-Disclosure.pdf", type: "PEP", status: "Verified", uploaded: "2025-05-05" },
  ]},
  { id: "ACC-3013", investor: "Hannah Müller", firm: "Berliner Angels", jurisdiction: "DE", framework: "ESMA Pro", basis: "Self-Cert + Risk Quiz", riskScore: 71, pep: false, sanctions: false, adverseMedia: true, state: "rejected", submitted: "2025-04-28", expiresAt: "—", reviewer: "david@zynk.ing", docs: [
    { name: "ID-Front.jpg", type: "ID", status: "Rejected", uploaded: "2025-04-28" },
  ]},
  { id: "ACC-3014", investor: "Yuki Tanaka", firm: "Mori Syndicate", jurisdiction: "JP", framework: "MAS AI", basis: "Income", riskScore: 18, pep: false, sanctions: false, adverseMedia: false, state: "approved", submitted: "2025-04-19", expiresAt: "2026-04-19", reviewer: "fatima@zynk.ing", docs: [
    { name: "MyNumber-Card.pdf", type: "ID", status: "Verified", uploaded: "2025-04-19" },
    { name: "TaxReturn-2024.pdf", type: "Income", status: "Verified", uploaded: "2025-04-19" },
  ]},
];

const stateColor: Record<Item["state"], string> = {
  submitted: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  id_verified: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  kyc_approved: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

const transitions: Record<Item["state"], { label: string; next: Item["state"] }[]> = {
  submitted: [{ label: "Verify ID", next: "id_verified" }, { label: "Reject", next: "rejected" }],
  id_verified: [{ label: "Approve KYC/AML", next: "kyc_approved" }, { label: "Reject", next: "rejected" }],
  kyc_approved: [{ label: "Final Approve", next: "approved" }, { label: "Reject", next: "rejected" }],
  approved: [{ label: "Re-open", next: "id_verified" }],
  rejected: [{ label: "Re-open", next: "submitted" }],
  expired: [{ label: "Re-open", next: "submitted" }],
};

export function InvestorAccreditation() {
  const [items, setItems] = useState<Item[]>(seed);
  const [tab, setTab] = useState("queue");
  const [q, setQ] = useState("");
  const [framework, setFramework] = useState("all");
  const [sel, setSel] = useState<Item | null>(null);
  const [reasonOpen, setReasonOpen] = useState<{ id: string; next: Item["state"] } | null>(null);
  const [reason, setReason] = useState("");

  const filtered = useMemo(
    () => items.filter((i) => (framework === "all" || i.framework === framework) && (q === "" || `${i.investor} ${i.firm} ${i.id}`.toLowerCase().includes(q.toLowerCase()))),
    [items, q, framework],
  );

  const counts = useMemo(() => ({
    queue: items.filter((i) => ["submitted", "id_verified", "kyc_approved"].includes(i.state)).length,
    approved: items.filter((i) => i.state === "approved").length,
    rejected: items.filter((i) => i.state === "rejected").length,
    expiringSoon: items.filter((i) => i.state === "approved").length,
  }), [items]);

  const apply = (id: string, next: Item["state"]) => {
    if (next === "rejected" || next === "approved") {
      setReasonOpen({ id, next });
      return;
    }
    setItems((p) => p.map((i) => (i.id === id ? { ...i, state: next, reviewer: "you@zynk.ing" } : i)));
    toast.success(`${id} moved to ${next.replace("_", " ")}`);
  };

  const confirmReason = () => {
    if (!reasonOpen) return;
    setItems((p) => p.map((i) => (i.id === reasonOpen.id ? { ...i, state: reasonOpen.next, reviewer: "you@zynk.ing" } : i)));
    toast.success(`${reasonOpen.id} → ${reasonOpen.next} (${reason || "no reason"})`);
    setReason("");
    setReasonOpen(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investor Accreditation & KYC</h1>
          <p className="text-sm text-muted-foreground">Per-jurisdiction accreditation reviews, AML screening, and document verification.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("Bulk re-screen scheduled (sanctions + PEP)")} className="gap-1">
          <ScanFace className="h-4 w-4" /> Re-screen all approved
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "In Queue", v: counts.queue, i: Clock, t: "text-amber-600" },
          { l: "Approved", v: counts.approved, i: CheckCircle2, t: "text-emerald-600" },
          { l: "Rejected (90d)", v: counts.rejected, i: XCircle, t: "text-destructive" },
          { l: "Expiring < 30d", v: counts.expiringSoon, i: AlertTriangle, t: "text-orange-600" },
        ].map((c) => (
          <Card key={c.l}><CardContent className="pt-5 flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p></div><c.i className={`h-5 w-5 ${c.t}`} /></CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
              <CardTitle className="text-base">All Submissions</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{["all", "SEC Reg D 506(c)", "FCA HNW", "ESMA Pro", "SCA UAE Qualified", "MAS AI", "SEBI AIF"].map((f) => <SelectItem key={f} value={f}>{f === "all" ? "All frameworks" : f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-4 py-3">Investor</th><th className="px-4 py-3">Framework</th><th className="px-4 py-3">Basis</th><th className="px-4 py-3">AML</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((i) => (
                      <tr key={i.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSel(i)}>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{i.investor.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium leading-tight">{i.investor}</p><p className="text-xs text-muted-foreground">{i.firm} · {i.id}</p></div></div></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs"><Globe className="h-3 w-3" />{i.jurisdiction}</div><span className="text-xs text-muted-foreground">{i.framework}</span></td>
                        <td className="px-4 py-3 text-xs">{i.basis}</td>
                        <td className="px-4 py-3"><div className="flex gap-1">{i.pep && <Badge variant="outline" className="text-[10px]">PEP</Badge>}{i.sanctions && <Badge variant="destructive" className="text-[10px]">Sanctions</Badge>}{i.adverseMedia && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">Adverse</Badge>}{!i.pep && !i.sanctions && !i.adverseMedia && <span className="text-xs text-emerald-600">Clear</span>}</div></td>
                        <td className="px-4 py-3"><span className={`font-mono text-xs font-medium ${i.riskScore < 30 ? "text-emerald-600" : i.riskScore < 60 ? "text-amber-600" : "text-destructive"}`}>{i.riskScore}</span></td>
                        <td className="px-4 py-3"><Badge className={stateColor[i.state]}>{i.state.replace("_", " ")}</Badge></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{i.submitted}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            {transitions[i.state].map((t) => (
                              <Button key={t.label} size="sm" variant={t.next === "rejected" ? "outline" : "default"} className={t.next === "rejected" ? "text-destructive" : ""} onClick={() => apply(i.id, t.next)}>{t.label}</Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { f: "SEC Reg D 506(c)", j: "United States", req: "Income $200k+ (single), $300k joint, OR net worth $1M ex-residence. Verifier letter from CPA/lawyer required.", refresh: "12 mo" },
              { f: "ESMA Pro / MiFID II", j: "EU/EEA", req: "2 of 3: portfolio > €500k, 1+ yr financial sector, 10+ trades/quarter for last 4 quarters.", refresh: "24 mo" },
              { f: "FCA HNW / Sophisticated", j: "UK", req: "Self-cert: income £170k+ OR net assets £430k+. Risk warning + cooling-off acknowledgement.", refresh: "12 mo" },
              { f: "SCA UAE Qualified", j: "UAE", req: "Net assets > AED 4M OR financial professional. Emirates ID + trade license for entities.", refresh: "12 mo" },
              { f: "MAS Accredited Investor", j: "Singapore", req: "Income S$300k OR net assets S$2M (cap on residence S$1M). Opt-in declaration mandatory.", refresh: "12 mo" },
              { f: "SEBI AIF Cat II", j: "India", req: "Min commitment ₹1 cr (₹25 lakh for employees/directors). PAN + FATCA self-declaration.", refresh: "12 mo" },
            ].map((x) => (
              <Card key={x.f}><CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{x.f}</CardTitle></CardHeader><CardContent className="text-xs space-y-2"><p><strong>Jurisdiction:</strong> {x.j}</p><p className="text-muted-foreground">{x.req}</p><p><Badge variant="secondary" className="text-[10px]">Refresh every {x.refresh}</Badge></p></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <Card><CardContent className="pt-4 text-xs space-y-2 font-mono">
            {[
              "[2025-05-13 09:42:11] APPROVE ACC-3014 by fatima@zynk.ing — basis: Income, evidence: TaxReturn-2024.pdf, hash: a1b2c3…",
              "[2025-05-13 09:31:02] REJECT ACC-3013 by david@zynk.ing — code: AML_ADVERSE_MEDIA, source: Refinitiv WorldCheck, ref: WC-9821",
              "[2025-05-12 18:14:55] KYC_APPROVED ACC-3012 by fatima@zynk.ing — PEP disclosed, EDD waiver granted by ciso",
              "[2025-05-12 14:02:30] ID_VERIFIED ACC-3011 by Onfido auto — confidence: 0.98, liveness: pass",
              "[2025-05-10 11:00:09] SUBMITTED ACC-3010 by investor — framework: ESMA Pro, attestation hash: f88d…",
            ].map((l) => <div key={l} className="border-l-2 border-primary/40 pl-3 py-1">{l}</div>)}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-2xl">
          {sel && (<>
            <DialogHeader><DialogTitle>{sel.investor} <span className="text-sm font-normal text-muted-foreground">· {sel.id}</span></DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">Framework</p><p>{sel.framework}</p></div>
              <div className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">Basis</p><p>{sel.basis}</p></div>
              <div className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">Risk score</p><p className="font-mono">{sel.riskScore}/100</p></div>
              <div className="border rounded-md p-2"><p className="text-[11px] uppercase text-muted-foreground">Reviewer</p><p>{sel.reviewer ?? "—"}</p></div>
            </div>
            <div>
              <Label className="text-xs">Documents</Label>
              <div className="space-y-1 mt-2">{sel.docs.map((d) => (
                <div key={d.name} className="flex items-center justify-between border rounded-md p-2 text-xs"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{d.name}</span><Badge variant="outline" className="text-[10px]">{d.type}</Badge></div><Badge className={d.status === "Verified" ? "bg-emerald-500/15 text-emerald-700" : d.status === "Rejected" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-700"}>{d.status}</Badge></div>
              ))}</div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setSel(null)}>Close</Button>{transitions[sel.state].map((t) => (<Button key={t.label} variant={t.next === "rejected" ? "outline" : "default"} className={t.next === "rejected" ? "text-destructive" : ""} onClick={() => { apply(sel.id, t.next); setSel(null); }}>{t.label}</Button>))}</DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!reasonOpen} onOpenChange={(o) => !o && setReasonOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reason code required</DialogTitle></DialogHeader>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue placeholder="Pick reason code…" /></SelectTrigger>
            <SelectContent>{[
              "AML_SANCTIONS_HIT", "AML_PEP_UNDISCLOSED", "AML_ADVERSE_MEDIA", "DOC_FRAUD_SUSPECTED", "DOC_EXPIRED", "FRAMEWORK_ELIGIBILITY_FAILED", "INCOMPLETE_EVIDENCE", "JURISDICTION_BLOCKED", "MANUAL_OVERRIDE_APPROVE", "EDD_PASSED",
            ].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea placeholder="Reviewer notes (audit log)…" />
          <DialogFooter><Button variant="outline" onClick={() => setReasonOpen(null)}>Cancel</Button><Button onClick={confirmReason} disabled={!reason}><FileCheck className="h-4 w-4 mr-1" /> Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
