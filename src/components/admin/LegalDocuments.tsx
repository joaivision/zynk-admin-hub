import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  FileText, ShieldCheck, Cookie, Scale, Users, Briefcase, CreditCard, Globe,
  Plus, Search, Download, Upload, History, Eye, Edit, Trash2, CheckCircle2,
  AlertTriangle, Clock, Languages, ChevronRight, Bell, Copy, Send, FileCheck,
} from "lucide-react";

type DocStatus = "published" | "draft" | "scheduled" | "archived";
type DocType =
  | "terms" | "privacy" | "cookies" | "community" | "investor-disclaimer"
  | "mentor-agreement" | "marketplace-tos" | "data-processing" | "refund" | "aml-kyc";

type LegalDoc = {
  id: string; type: DocType; title: string; slug: string; version: string;
  status: DocStatus; jurisdictions: string[]; languages: string[]; audiences: string[];
  requireAcceptance: boolean; blocking: boolean; effectiveAt: string; updatedAt: string;
  updatedBy: string; acceptanceRate: number; pendingUsers: number; summary: string; body: string;
};

type Version = { id: string; docId: string; version: string; publishedAt: string; publishedBy: string; diff: string; isLive: boolean };

const docTypeMeta: Record<DocType, { label: string; icon: typeof FileText; color: string }> = {
  terms: { label: "Terms of Service", icon: Scale, color: "bg-blue-500/10 text-blue-500" },
  privacy: { label: "Privacy Policy", icon: ShieldCheck, color: "bg-emerald-500/10 text-emerald-500" },
  cookies: { label: "Cookie Policy", icon: Cookie, color: "bg-amber-500/10 text-amber-500" },
  community: { label: "Community Guidelines", icon: Users, color: "bg-violet-500/10 text-violet-500" },
  "investor-disclaimer": { label: "Investor Disclaimer", icon: Briefcase, color: "bg-rose-500/10 text-rose-500" },
  "mentor-agreement": { label: "Mentor Agreement", icon: FileCheck, color: "bg-cyan-500/10 text-cyan-500" },
  "marketplace-tos": { label: "Marketplace Terms", icon: CreditCard, color: "bg-indigo-500/10 text-indigo-500" },
  "data-processing": { label: "Data Processing Addendum", icon: ShieldCheck, color: "bg-teal-500/10 text-teal-500" },
  refund: { label: "Refund & Cancellation", icon: CreditCard, color: "bg-orange-500/10 text-orange-500" },
  "aml-kyc": { label: "AML / KYC Policy", icon: ShieldCheck, color: "bg-fuchsia-500/10 text-fuchsia-500" },
};

const allJurisdictions = ["Global", "EU", "UK", "US", "India", "UAE", "Singapore", "Brazil"];
const allLanguages = ["en", "es", "fr", "de", "pt", "hi", "ar", "zh"];
const allAudiences = ["All Users", "Founders", "Investors", "Mentors", "Vendors", "Employers", "Job Seekers"];

const seed: LegalDoc[] = [
  { id: "d1", type: "terms", title: "Terms of Service", slug: "terms", version: "v4.2", status: "published", jurisdictions: ["Global"], languages: ["en","es","fr","hi"], audiences: ["All Users"], requireAcceptance: true, blocking: true, effectiveAt: "2026-04-01", updatedAt: "2026-04-12", updatedBy: "Legal Ops", acceptanceRate: 96.4, pendingUsers: 1284, summary: "Master agreement governing all use of Zynk.ing.", body: "1. Introduction\nWelcome to Zynk.ing — the AI-powered business networking platform.\n\n2. Eligibility\nYou must be 18+ and legally able to enter contracts.\n\n3. Account & Conduct\nYou are responsible for activity under your account.\n\n4. Subscriptions & Billing\nPaid plans renew automatically until cancelled.\n\n5. Termination\nWe may suspend accounts that violate these Terms." },
  { id: "d2", type: "privacy", title: "Privacy Policy", slug: "privacy", version: "v3.8", status: "published", jurisdictions: ["Global","EU","UK","India"], languages: ["en","de","fr","hi"], audiences: ["All Users"], requireAcceptance: true, blocking: false, effectiveAt: "2026-03-15", updatedAt: "2026-03-15", updatedBy: "DPO", acceptanceRate: 91.2, pendingUsers: 3411, summary: "How we collect, process, and protect personal data.", body: "We process personal data under GDPR, DPDP Act 2023 and CCPA. Data subjects may exercise rights via privacy@zynk.ing." },
  { id: "d3", type: "cookies", title: "Cookie Policy", slug: "cookies", version: "v2.1", status: "published", jurisdictions: ["EU","UK"], languages: ["en","de","fr"], audiences: ["All Users"], requireAcceptance: false, blocking: false, effectiveAt: "2025-11-01", updatedAt: "2025-11-01", updatedBy: "Legal Ops", acceptanceRate: 88.7, pendingUsers: 0, summary: "Categories of cookies and how to manage consent.", body: "Essential, Analytics, Marketing cookies. Manage preferences in Settings → Privacy." },
  { id: "d4", type: "community", title: "Community Guidelines", slug: "community", version: "v1.6", status: "published", jurisdictions: ["Global"], languages: ["en"], audiences: ["All Users"], requireAcceptance: false, blocking: false, effectiveAt: "2026-01-10", updatedAt: "2026-01-10", updatedBy: "Trust & Safety", acceptanceRate: 100, pendingUsers: 0, summary: "Conduct expected on Zynk.ing — no spam, no harassment, no fraud.", body: "Be respectful. No cold-pitch spam. No misrepresentation of credentials." },
  { id: "d5", type: "investor-disclaimer", title: "Investor Disclaimer & Risk Notice", slug: "investor-disclaimer", version: "v2.0", status: "published", jurisdictions: ["US","EU","UK","Singapore","India"], languages: ["en"], audiences: ["Investors"], requireAcceptance: true, blocking: true, effectiveAt: "2026-02-20", updatedAt: "2026-02-20", updatedBy: "Compliance", acceptanceRate: 99.1, pendingUsers: 47, summary: "Risk warnings for accredited investors using deal flow & syndicates.", body: "Investing in private companies is high risk. You may lose all capital invested." },
  { id: "d6", type: "mentor-agreement", title: "Mentor & Expert Agreement", slug: "mentor-agreement", version: "v1.4", status: "published", jurisdictions: ["Global"], languages: ["en"], audiences: ["Mentors"], requireAcceptance: true, blocking: true, effectiveAt: "2026-02-01", updatedAt: "2026-02-01", updatedBy: "Legal Ops", acceptanceRate: 100, pendingUsers: 0, summary: "Independent contractor terms for paid mentorship sessions.", body: "Mentors operate as independent contractors. Platform commission is 15%." },
  { id: "d7", type: "marketplace-tos", title: "Marketplace & RFQ Terms", slug: "marketplace-tos", version: "v1.2", status: "draft", jurisdictions: ["Global"], languages: ["en"], audiences: ["Vendors"], requireAcceptance: true, blocking: false, effectiveAt: "2026-06-01", updatedAt: "2026-05-04", updatedBy: "Marketplace", acceptanceRate: 0, pendingUsers: 0, summary: "Vendor obligations, escrow, dispute resolution.", body: "Vendors warrant accuracy of listings. Disputes resolved via in-platform mediation." },
  { id: "d8", type: "data-processing", title: "Data Processing Addendum (DPA)", slug: "dpa", version: "v2.3", status: "published", jurisdictions: ["EU","UK"], languages: ["en"], audiences: ["Employers","Vendors"], requireAcceptance: true, blocking: false, effectiveAt: "2026-01-25", updatedAt: "2026-01-25", updatedBy: "DPO", acceptanceRate: 87.5, pendingUsers: 213, summary: "GDPR Article 28 controller-processor terms.", body: "Includes SCCs (2021/914), sub-processor list, security measures (Annex II)." },
  { id: "d9", type: "refund", title: "Refund & Cancellation Policy", slug: "refund", version: "v1.1", status: "scheduled", jurisdictions: ["Global"], languages: ["en"], audiences: ["All Users"], requireAcceptance: false, blocking: false, effectiveAt: "2026-05-20", updatedAt: "2026-05-05", updatedBy: "Finance", acceptanceRate: 0, pendingUsers: 0, summary: "7-day refund window for subscriptions.", body: "Subscription refunds within 7 days of purchase." },
  { id: "d10", type: "aml-kyc", title: "AML / KYC Policy", slug: "aml-kyc", version: "v1.0", status: "published", jurisdictions: ["Global"], languages: ["en"], audiences: ["Investors","Vendors"], requireAcceptance: true, blocking: true, effectiveAt: "2025-12-01", updatedAt: "2025-12-01", updatedBy: "Compliance", acceptanceRate: 98.6, pendingUsers: 12, summary: "Identity verification & sanction screening obligations.", body: "All financial actors complete KYC via verified providers." },
];

const seedVersions: Version[] = [
  { id: "v1", docId: "d1", version: "v4.2", publishedAt: "2026-04-12", publishedBy: "Legal Ops", diff: "+ Added AI matching disclosure section", isLive: true },
  { id: "v2", docId: "d1", version: "v4.1", publishedAt: "2026-01-08", publishedBy: "Legal Ops", diff: "Updated arbitration venue to Singapore", isLive: false },
  { id: "v3", docId: "d1", version: "v4.0", publishedAt: "2025-09-22", publishedBy: "Legal Ops", diff: "Major rewrite for marketplace launch", isLive: false },
  { id: "v4", docId: "d2", version: "v3.8", publishedAt: "2026-03-15", publishedBy: "DPO", diff: "Added DPDP Act compliance", isLive: true },
  { id: "v5", docId: "d2", version: "v3.7", publishedAt: "2025-11-30", publishedBy: "DPO", diff: "Updated sub-processor list", isLive: false },
];

const statusVariant: Record<DocStatus, { label: string; cls: string }> = {
  published: { label: "Live", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  draft: { label: "Draft", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  archived: { label: "Archived", cls: "bg-muted text-muted-foreground border-border" },
};

export function LegalDocuments() {
  const [docs, setDocs] = useState<LegalDoc[]>(seed);
  const [versions] = useState<Version[]>(seedVersions);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [editing, setEditing] = useState<LegalDoc | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyDoc, setHistoryDoc] = useState<LegalDoc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LegalDoc | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<LegalDoc | null>(null);
  const [reAcceptOpen, setReAcceptOpen] = useState<LegalDoc | null>(null);

  const filtered = useMemo(() => docs.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (jurisdictionFilter !== "all" && !d.jurisdictions.includes(jurisdictionFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.slug.toLowerCase().includes(q) && !d.summary.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [docs, search, statusFilter, typeFilter, jurisdictionFilter]);

  const stats = useMemo(() => {
    const live = docs.filter((d) => d.status === "published").length;
    const drafts = docs.filter((d) => d.status === "draft").length;
    const pending = docs.reduce((s, d) => s + d.pendingUsers, 0);
    const acc = docs.filter((d) => d.requireAcceptance);
    const avgAccept = acc.reduce((s, d) => s + d.acceptanceRate, 0) / Math.max(1, acc.length);
    return { live, drafts, pending, avgAccept };
  }, [docs]);

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((d) => d.id));
  const toggleOne = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const bulkAction = (action: "publish" | "archive" | "delete") => {
    if (!selected.length) return;
    const today = new Date().toISOString().slice(0, 10);
    if (action === "delete") setDocs((d) => d.filter((x) => !selected.includes(x.id)));
    else if (action === "publish") setDocs((d) => d.map((x) => selected.includes(x.id) ? { ...x, status: "published", updatedAt: today } : x));
    else setDocs((d) => d.map((x) => selected.includes(x.id) ? { ...x, status: "archived" } : x));
    toast.success(`${action === "delete" ? "Deleted" : action === "publish" ? "Published" : "Archived"} ${selected.length} documents`);
    setSelected([]);
  };

  const saveDoc = (doc: LegalDoc) => {
    const isNew = !docs.find((d) => d.id === doc.id);
    if (isNew) setDocs((d) => [...d, doc]);
    else setDocs((d) => d.map((x) => x.id === doc.id ? doc : x));
    setEditing(null); setCreating(false);
    toast.success(isNew ? "Document created" : "Document saved");
  };

  const exportCsv = () => {
    const rows = [
      ["Title","Type","Slug","Version","Status","Jurisdictions","Languages","Audiences","Effective","Updated","AcceptanceRate","PendingUsers"],
      ...docs.map((d) => [d.title, d.type, d.slug, d.version, d.status, d.jurisdictions.join("|"), d.languages.join("|"), d.audiences.join("|"), d.effectiveAt, d.updatedAt, String(d.acceptanceRate), String(d.pendingUsers)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "legal-documents.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  const triggerReAccept = (doc: LegalDoc) => {
    setDocs((d) => d.map((x) => x.id === doc.id ? { ...x, pendingUsers: x.pendingUsers + 8500, acceptanceRate: 0 } : x));
    setReAcceptOpen(null);
    toast.success(`Re-acceptance requested for ${doc.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Legal Documents</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Legal Documents</h1>
          <p className="text-sm text-muted-foreground">
            Author, version, and govern every legal artifact across Zynk.ing — Terms, Privacy, DPA, AML/KYC and more.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1"><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" size="sm" className="gap-1"><Upload className="h-4 w-4" /> Import</Button>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1"><Plus className="h-4 w-4" /> New document</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Live policies", value: stats.live, icon: ShieldCheck, tone: "text-emerald-500" },
          { label: "Drafts in flight", value: stats.drafts, icon: Edit, tone: "text-amber-500" },
          { label: "Pending re-acceptance", value: stats.pending.toLocaleString(), icon: Bell, tone: "text-blue-500" },
          { label: "Avg acceptance", value: `${stats.avgAccept.toFixed(1)}%`, icon: CheckCircle2, tone: "text-violet-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-muted p-2"><s.icon className={`h-4 w-4 ${s.tone}`} /></div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-base font-semibold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="acceptance">Acceptance Tracking</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Map</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by title, slug, summary…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="published">Live</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(docTypeMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {allJurisdictions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2">
                  <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                  <Button size="sm" variant="outline" onClick={() => bulkAction("publish")}>Publish</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction("archive")}>Archive</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulkAction("delete")}>Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="w-10 px-3 py-3"><Checkbox checked={selected.length > 0 && selected.length === filtered.length} onCheckedChange={toggleAll} /></th>
                      <th className="px-3 py-3">Document</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Version</th>
                      <th className="px-3 py-3">Audience</th>
                      <th className="px-3 py-3">Regions</th>
                      <th className="px-3 py-3">Acceptance</th>
                      <th className="px-3 py-3">Effective</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((d) => {
                      const meta = docTypeMeta[d.type];
                      const Icon = meta.icon;
                      return (
                        <tr key={d.id} className="hover:bg-muted/30">
                          <td className="px-3 py-3"><Checkbox checked={selected.includes(d.id)} onCheckedChange={() => toggleOne(d.id)} /></td>
                          <td className="px-3 py-3">
                            <div className="flex items-start gap-2">
                              <div className={`rounded-md p-1.5 ${meta.color}`}><Icon className="h-3.5 w-3.5" /></div>
                              <div className="min-w-0">
                                <div className="font-medium">{d.title}</div>
                                <div className="text-xs text-muted-foreground">/{d.slug} • {meta.label}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className={statusVariant[d.status].cls}>{statusVariant[d.status].label}</Badge>
                            {d.blocking && (<Badge variant="outline" className="ml-1 border-rose-500/20 bg-rose-500/10 text-rose-500"><AlertTriangle className="mr-1 h-3 w-3" /> Blocking</Badge>)}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">{d.version}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{d.audiences.join(", ")}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {d.jurisdictions.slice(0, 3).map((j) => (<Badge key={j} variant="secondary" className="text-[10px]">{j}</Badge>))}
                              {d.jurisdictions.length > 3 && (<Badge variant="secondary" className="text-[10px]">+{d.jurisdictions.length - 3}</Badge>)}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {d.requireAcceptance ? (
                              <div>
                                <div className="text-xs font-medium">{d.acceptanceRate.toFixed(1)}%</div>
                                {d.pendingUsers > 0 && (<div className="text-[10px] text-amber-500">{d.pendingUsers.toLocaleString()} pending</div>)}
                              </div>
                            ) : (<span className="text-xs text-muted-foreground">—</span>)}
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{d.effectiveAt}</td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewDoc(d)}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(d)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setHistoryDoc(d)}><History className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteDoc(d)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (<tr><td colSpan={9} className="px-3 py-12 text-center text-sm text-muted-foreground">No documents match your filters.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acceptance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User acceptance tracking</CardTitle>
              <CardDescription>Force re-acceptance after a material change. Blocking docs gate app access until accepted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.filter((d) => d.requireAcceptance).map((d) => {
                const I = docTypeMeta[d.type].icon;
                return (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-md p-1.5 ${docTypeMeta[d.type].color}`}><I className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="text-sm font-medium">{d.title} <span className="ml-1 font-mono text-xs text-muted-foreground">{d.version}</span></div>
                        <div className="text-xs text-muted-foreground">{d.audiences.join(", ")} • Effective {d.effectiveAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold">{d.acceptanceRate.toFixed(1)}%</div>
                        <div className="text-[10px] text-muted-foreground">{d.pendingUsers.toLocaleString()} pending</div>
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${d.acceptanceRate}%` }} />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setReAcceptOpen(d)} className="gap-1"><Send className="h-3.5 w-3.5" /> Force re-accept</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changelog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent changes</CardTitle>
              <CardDescription>Every published version is immutable and discoverable by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l pl-6">
                {versions.map((v) => {
                  const doc = docs.find((d) => d.id === v.docId);
                  return (
                    <li key={v.id} className="relative">
                      <span className="absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground"><Clock className="h-2.5 w-2.5" /></span>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{doc?.title ?? "Document"}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">{v.version}</Badge>
                        {v.isLive && <Badge className="text-[10px]">Live</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{v.diff}</p>
                      <p className="text-[10px] text-muted-foreground">{v.publishedAt} • {v.publishedBy}</p>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coverage by jurisdiction</CardTitle>
              <CardDescription>Quickly see which regions are covered by each document.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2">Document</th>
                      {allJurisdictions.map((j) => (
                        <th key={j} className="px-2 py-2 text-center">
                          <div className="flex flex-col items-center gap-1"><Globe className="h-3 w-3" />{j}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td className="px-2 py-2 font-medium">{d.title}</td>
                        {allJurisdictions.map((j) => (
                          <td key={j} className="px-2 py-2 text-center">
                            {d.jurisdictions.includes(j) || d.jurisdictions.includes("Global")
                              ? (<CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-500" />)
                              : (<span className="text-muted-foreground/40">—</span>)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DocEditor open={!!editing || creating} doc={editing} creating={creating} onClose={() => { setEditing(null); setCreating(false); }} onSave={saveDoc} />

      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{previewDoc?.title}<Badge variant="outline" className="font-mono text-[10px]">{previewDoc?.version}</Badge></DialogTitle>
            <DialogDescription>{previewDoc?.summary}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{previewDoc?.body}</pre>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(previewDoc?.body ?? ""); toast("Copied"); }} className="gap-1"><Copy className="h-3.5 w-3.5" /> Copy</Button>
            <Button onClick={() => setPreviewDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyDoc} onOpenChange={(o) => !o && setHistoryDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version history — {historyDoc?.title}</DialogTitle>
            <DialogDescription>Roll back to any prior version. Affected users will be re-prompted to accept.</DialogDescription>
          </DialogHeader>
          <div className="divide-y rounded-md border">
            {versions.filter((v) => v.docId === historyDoc?.id).map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">{v.version} {v.isLive && <Badge className="text-[10px]">Live</Badge>}</div>
                  <p className="text-xs text-muted-foreground">{v.diff}</p>
                  <p className="text-[10px] text-muted-foreground">{v.publishedAt} • {v.publishedBy}</p>
                </div>
                <Button size="sm" variant="outline" disabled={v.isLive}>{v.isLive ? "Current" : "Restore"}</Button>
              </div>
            ))}
            {versions.filter((v) => v.docId === historyDoc?.id).length === 0 && (<div className="p-6 text-center text-xs text-muted-foreground">No prior versions.</div>)}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDoc} onOpenChange={(o) => !o && setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteDoc?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This archives the document and removes it from public surfaces. Past acceptance records are preserved for audit.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteDoc) { setDocs((d) => d.filter((x) => x.id !== deleteDoc.id)); toast.success("Document deleted"); } setDeleteDoc(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!reAcceptOpen} onOpenChange={(o) => !o && setReAcceptOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force re-acceptance?</AlertDialogTitle>
            <AlertDialogDescription>
              All users in scope will be prompted to accept the latest version of <b>{reAcceptOpen?.title}</b> on next login.
              {reAcceptOpen?.blocking && " App access will be blocked until accepted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => reAcceptOpen && triggerReAccept(reAcceptOpen)}>Send prompt</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DocEditor({ open, doc, creating, onClose, onSave }: {
  open: boolean; doc: LegalDoc | null; creating: boolean;
  onClose: () => void; onSave: (d: LegalDoc) => void;
}) {
  const blank = (): LegalDoc => ({
    id: `d${Date.now()}`, type: "terms", title: "", slug: "", version: "v1.0", status: "draft",
    jurisdictions: ["Global"], languages: ["en"], audiences: ["All Users"],
    requireAcceptance: false, blocking: false,
    effectiveAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    updatedBy: "You", acceptanceRate: 0, pendingUsers: 0, summary: "", body: "",
  });
  const [draft, setDraft] = useState<LegalDoc>(doc ?? blank());

  useEffect(() => { if (open) setDraft(doc ?? blank()); }, [open, doc]);

  const update = <K extends keyof LegalDoc>(k: K, v: LegalDoc[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleArr = (key: "jurisdictions" | "languages" | "audiences", val: string) => {
    setDraft((d) => ({ ...d, [key]: d[key].includes(val) ? d[key].filter((x) => x !== val) : [...d[key], val] }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{creating ? "New legal document" : `Edit — ${draft.title || "Document"}`}</DialogTitle>
          <DialogDescription>Author content, set scope, and control whether users must accept this document.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="i18n">Translations</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Title</Label><Input value={draft.title} onChange={(e) => update("title", e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => update("type", v as DocType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(docTypeMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs text-muted-foreground">/legal/</span>
                  <Input className="rounded-l-none" value={draft.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
                </div>
              </div>
              <div className="space-y-1.5"><Label>Version</Label><Input value={draft.version} onChange={(e) => update("version", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Input value={draft.summary} onChange={(e) => update("summary", e.target.value)} maxLength={140} />
              <p className="text-xs text-muted-foreground">{draft.summary.length}/140 — shown in user prompts.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Body (Markdown supported)</Label>
              <Textarea rows={12} value={draft.body} onChange={(e) => update("body", e.target.value)} className="font-mono text-xs" />
            </div>
          </TabsContent>

          <TabsContent value="scope" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Jurisdictions</Label>
                <div className="flex flex-wrap gap-2">
                  {allJurisdictions.map((j) => (
                    <button key={j} type="button" onClick={() => toggleArr("jurisdictions", j)}
                      className={`rounded-md border px-2.5 py-1 text-xs ${draft.jurisdictions.includes(j) ? "border-primary bg-primary/10 text-primary" : ""}`}>{j}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Audiences</Label>
                <div className="flex flex-wrap gap-2">
                  {allAudiences.map((a) => (
                    <button key={a} type="button" onClick={() => toggleArr("audiences", a)}
                      className={`rounded-md border px-2.5 py-1 text-xs ${draft.audiences.includes(a) ? "border-primary bg-primary/10 text-primary" : ""}`}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Effective date</Label><Input type="date" value={draft.effectiveAt} onChange={(e) => update("effectiveAt", e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => update("status", v as DocStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Require user acceptance</div>
                <div className="text-xs text-muted-foreground">Users must explicitly tick a box.</div>
              </div>
              <Switch checked={draft.requireAcceptance} onCheckedChange={(v) => update("requireAcceptance", v)} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Blocking modal</div>
                <div className="text-xs text-muted-foreground">Block app access until the user accepts.</div>
              </div>
              <Switch checked={draft.blocking} onCheckedChange={(v) => update("blocking", v)} />
            </div>
            <Separator />
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
              Material changes to <b>blocking</b> docs auto-trigger a re-acceptance prompt for all in-scope users.
            </div>
          </TabsContent>

          <TabsContent value="i18n" className="space-y-3">
            <Label>Available translations</Label>
            <div className="flex flex-wrap gap-2">
              {allLanguages.map((l) => (
                <button key={l} type="button" onClick={() => toggleArr("languages", l)}
                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${draft.languages.includes(l) ? "border-primary bg-primary/10 text-primary" : ""}`}>
                  <Languages className="h-3 w-3" /> {l.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">English is the canonical version. Translations should be reviewed by counsel before publishing.</p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={() => onSave({ ...draft, status: "draft", updatedAt: new Date().toISOString().slice(0, 10) })}>Save draft</Button>
          <Button onClick={() => onSave({ ...draft, status: "published", updatedAt: new Date().toISOString().slice(0, 10) })}>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
