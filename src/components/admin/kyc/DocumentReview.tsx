import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Image, Video, Download, ZoomIn } from "lucide-react";
import { useKycRecords, kycStore, type KycDoc } from "./KycShared";
import { toast } from "sonner";

export function DocumentReview() {
  const records = useKycRecords();
  const [filter, setFilter] = useState<"all" | KycDoc["status"]>("all");
  const [type, setType] = useState("all");

  const flat = useMemo(() => records.flatMap((r) => r.docs.map((d) => ({ ...d, user: r.user, recordId: r.id, country: r.country }))), [records]);
  const filtered = flat.filter((d) => (filter === "all" || d.status === filter) && (type === "all" || d.type === type));

  const setDocStatus = (recordId: string, name: string, status: KycDoc["status"]) => {
    const rec = records.find((r) => r.id === recordId);
    if (!rec) return;
    kycStore.update(recordId, { docs: rec.docs.map((d) => d.name === name ? { ...d, status } : d) });
    toast.success(`${name} → ${status}`);
  };

  const iconFor = (t: KycDoc["type"]) => t === "Selfie" ? Video : t === "ID Front" || t === "ID Back" ? Image : FileText;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Document Upload & Review</h1>
        <p className="text-sm text-muted-foreground">Inspect every uploaded document, verify or reject individually.</p>
      </header>

      <Tabs defaultValue="grid">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="grid">Document Grid</TabsTrigger>
            <TabsTrigger value="ocr">OCR & Extraction</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "Pending", "Verified", "Rejected"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "ID Front", "ID Back", "Selfie", "Address", "Tax ID", "Source of Funds"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="grid" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((d, i) => {
              const Icon = iconFor(d.type);
              return (
                <Card key={`${d.recordId}-${d.name}-${i}`}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{d.type}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{d.user} · {d.country}</p>
                    </div>
                    <Badge className={d.status === "Verified" ? "bg-emerald-500/15 text-emerald-700" : d.status === "Rejected" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-700"}>{d.status}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="aspect-[4/3] rounded-md bg-gradient-to-br from-muted to-muted/50 border flex items-center justify-center text-muted-foreground text-xs">
                      <Icon className="h-10 w-10 opacity-30" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono truncate max-w-[180px]">{d.name}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><ZoomIn className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => setDocStatus(d.recordId, d.name, "Rejected")}>Reject</Button>
                      <Button size="sm" className="flex-1" onClick={() => setDocStatus(d.recordId, d.name, "Verified")}>Verify</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ocr" className="pt-4">
          <Card><CardContent className="pt-4 text-xs font-mono space-y-2">
            {[
              "[OCR] passport.pdf — name: SOFIA ALMEIDA · dob: 1989-03-14 · doc#: P12345678 · expiry: 2031-09-22 · MRZ valid ✓",
              "[OCR] drivers-license-front.jpg — CHEN, MARCUS J · DOB 1985-07-02 · CA D1234567 · class C · expires 2028-07-02",
              "[FACE] selfie-liveness.mp4 ↔ ID — match score 0.94 · liveness: PASS · spoof prob: 0.02",
              "[ADDRESS] utility-bill.pdf — Rua das Flores 12, 1100-227 Lisboa, PT · issued 2025-03-10 (within 90d ✓)",
              "[TAX] w9.pdf — TIN partially redacted, name match ✓, signature present ✓",
            ].map((l) => <div key={l} className="border-l-2 border-primary/40 pl-3 py-1">{l}</div>)}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
