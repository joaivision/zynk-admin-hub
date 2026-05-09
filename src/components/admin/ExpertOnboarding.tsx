import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ShieldCheck, IdCard, Building2, Video, CheckCircle2, XCircle, Clock,
  AlertTriangle, Eye, MessageSquare, FileText, Search, Sparkles, Database,
  Activity, ArrowRight, History, FileCheck2, UserCheck, Ban, RotateCcw,
  Lock, Download, Fingerprint, Briefcase, GraduationCap, Award, Globe,
} from "lucide-react";

// --- Domain ---------------------------------------------------------------

type Stage =
  | "submitted"
  | "triage"
  | "identity_verified"
  | "kyc_approved"
  | "domain_review"
  | "interview_scheduled"
  | "interview_passed"
  | "approved"
  | "rejected"
  | "on_hold"
  | "appeal";

const STAGE_META: Record<Stage, { label: string; color: string; pct: number; icon: typeof Clock }> = {
  submitted:           { label: "Submitted",            color: "bg-slate-500/15 text-slate-600 border-slate-500/30", pct: 10, icon: FileText },
  triage:              { label: "AI Triage",            color: "bg-zinc-500/15 text-zinc-600 border-zinc-500/30",    pct: 20, icon: Search },
  identity_verified:   { label: "Identity Verified",    color: "bg-blue-500/15 text-blue-600 border-blue-500/30",    pct: 35, icon: Fingerprint },
  kyc_approved:        { label: "KYC Approved",         color: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",    pct: 50, icon: IdCard },
  domain_review:       { label: "Domain Review",        color: "bg-violet-500/15 text-violet-600 border-violet-500/30", pct: 65, icon: Briefcase },
  interview_scheduled: { label: "Interview Scheduled",  color: "bg-amber-500/15 text-amber-600 border-amber-500/30", pct: 75, icon: Video },
  interview_passed:    { label: "Interview Passed",     color: "bg-lime-500/15 text-lime-600 border-lime-500/30",    pct: 90, icon: CheckCircle2 },
  approved:            { label: "Approved",             color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", pct: 100, icon: ShieldCheck },
  rejected:            { label: "Rejected",             color: "bg-rose-500/15 text-rose-600 border-rose-500/30",    pct: 100, icon: XCircle },
  on_hold:             { label: "On Hold",              color: "bg-orange-500/15 text-orange-600 border-orange-500/30", pct: 0, icon: AlertTriangle },
  appeal:              { label: "Appeal Open",          color: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/30", pct: 0, icon: RotateCcw },
};

// Allowed transitions per current stage
const TRANSITIONS: Record<Stage, Stage[]> = {
  submitted:           ["triage", "rejected", "on_hold"],
  triage:              ["identity_verified", "rejected", "on_hold"],
  identity_verified:   ["kyc_approved", "rejected", "on_hold"],
  kyc_approved:        ["domain_review", "rejected", "on_hold"],
  domain_review:       ["interview_scheduled", "rejected", "on_hold"],
  interview_scheduled: ["interview_passed", "rejected", "on_hold"],
  interview_passed:    ["approved", "rejected", "on_hold"],
  approved:            ["on_hold"],
  rejected:            ["appeal"],
  on_hold:             ["triage", "identity_verified", "kyc_approved", "domain_review", "interview_scheduled", "interview_passed", "approved", "rejected"],
  appeal:              ["domain_review", "approved", "rejected"],
};

// Reason code library
const REASON_CODES = {
  approve: [
    { code: "APR-EMP-VRF",   label: "Employment & track record verified" },
    { code: "APR-INT-PASS",  label: "Interview passed (Elite reviewer)" },
    { code: "APR-PEER-VCH",  label: "Peer-attested by 2+ Elite experts" },
    { code: "APR-OUTC-DEMO", label: "Documented outcomes (exits, raises)" },
  ],
  reject: [
    { code: "REJ-IDV-FAIL",  label: "Identity verification failed (KYC)" },
    { code: "REJ-EMP-UNVRF", label: "Employment claims unverifiable" },
    { code: "REJ-SANCT",     label: "Sanctions / OFAC / PEP hit" },
    { code: "REJ-FRAUD",     label: "Fraud signals (fake docs, AI photo)" },
    { code: "REJ-DUP",       label: "Duplicate of existing account" },
    { code: "REJ-DOMAIN",    label: "Insufficient domain depth" },
    { code: "REJ-CONDUCT",   label: "Conduct / red flags in interview" },
    { code: "REJ-AUP",       label: "Acceptable Use Policy violation" },
  ],
  hold: [
    { code: "HLD-DOC-REQ",   label: "Awaiting requested documents" },
    { code: "HLD-INFO-REQ",  label: "Awaiting clarification" },
    { code: "HLD-3P-VRF",    label: "Awaiting third-party verification" },
    { code: "HLD-MANUAL",    label: "Manual escalation in progress" },
  ],
};

type AuditEntry = {
  id: string;
  ts: string;          // ISO
  actor: string;       // reviewer / system
  actorRole: "reviewer" | "system" | "ai" | "applicant";
  action: string;      // human readable
  fromStage?: Stage;
  toStage?: Stage;
  reasonCode?: string;
  notes?: string;
  documents?: string[];   // doc IDs/names referenced
  claims?: string[];      // claims reviewed
  ip?: string;
  hash: string;           // tamper-evident chain hash (short)
};

type Document = { id: string; name: string; type: string; uploaded: string; status: "verified" | "pending" | "rejected"; verifiedBy?: string };
type Claim = { id: string; label: string; source: string; status: "verified" | "pending" | "rejected" };

type Applicant = {
  id: string;
  name: string;
  avatar: string;
  title: string;
  country: string;
  email: string;
  appliedAt: string;
  stage: Stage;
  aiScore: number;
  risk: "low" | "medium" | "high";
  reviewer: string;
  documents: Document[];
  claims: Claim[];
  audit: AuditEntry[];
};

// --- Seed data ------------------------------------------------------------

const seed: Applicant[] = [
  {
    id: "AP-9012",
    name: "Elena Volkova",
    avatar: "EV",
    title: "Product Lead · Ex-Stripe",
    country: "🇩🇪 Germany",
    email: "elena@volkova.io",
    appliedAt: "2026-05-07T09:14:00Z",
    stage: "domain_review",
    aiScore: 91,
    risk: "low",
    reviewer: "Dr. Aisha R.",
    documents: [
      { id: "D1", name: "Passport (DE)",       type: "Government ID",  uploaded: "2d ago", status: "verified", verifiedBy: "Persona" },
      { id: "D2", name: "Selfie liveness",     type: "Biometric",      uploaded: "2d ago", status: "verified", verifiedBy: "Persona" },
      { id: "D3", name: "Stripe employment",   type: "Work email proof", uploaded: "2d ago", status: "verified", verifiedBy: "DNS+SMTP" },
      { id: "D4", name: "Notion offer letter", type: "Document",       uploaded: "1d ago", status: "pending" },
    ],
    claims: [
      { id: "C1", label: "Product Lead at Stripe (2021–2024)", source: "LinkedIn API + work email", status: "verified" },
      { id: "C2", label: "Lead Notion launch (2024–present)",   source: "Self-declared",             status: "pending" },
      { id: "C3", label: "TechCrunch coverage",                 source: "URL screenshot",            status: "verified" },
    ],
    audit: [
      { id: "A1", ts: "2026-05-07T09:14:00Z", actor: "applicant",   actorRole: "applicant", action: "Application submitted",          toStage: "submitted", hash: "0x1a4f" },
      { id: "A2", ts: "2026-05-07T09:14:30Z", actor: "AI Triage",   actorRole: "ai",        action: "Auto-scored 91/100 — low risk",  fromStage: "submitted", toStage: "triage", hash: "0x2b71" },
      { id: "A3", ts: "2026-05-07T09:18:00Z", actor: "Persona",     actorRole: "system",    action: "Identity + liveness verified",   fromStage: "triage", toStage: "identity_verified", documents: ["Passport (DE)", "Selfie liveness"], hash: "0x3c92" },
      { id: "A4", ts: "2026-05-07T11:02:00Z", actor: "Sanctions Engine", actorRole: "system", action: "OFAC/UN/EU clear",              fromStage: "identity_verified", toStage: "kyc_approved", hash: "0x4dab" },
      { id: "A5", ts: "2026-05-07T16:45:00Z", actor: "Dr. Aisha R.", actorRole: "reviewer", action: "Picked up domain review",        fromStage: "kyc_approved", toStage: "domain_review", notes: "Verifying Notion claim before interview.", hash: "0x5ef0" },
    ],
  },
  {
    id: "AP-9013",
    name: "Carlos Mendes",
    avatar: "CM",
    title: "Angel Investor · 47 deals",
    country: "🇧🇷 Brazil",
    email: "carlos@mendes.vc",
    appliedAt: "2026-05-08T14:00:00Z",
    stage: "identity_verified",
    aiScore: 72,
    risk: "medium",
    reviewer: "Auto-queue",
    documents: [
      { id: "D1", name: "Passport (BR)",  type: "Government ID", uploaded: "5h ago", status: "verified", verifiedBy: "Onfido" },
      { id: "D2", name: "AngelList CSV",  type: "Track record",  uploaded: "5h ago", status: "pending" },
    ],
    claims: [
      { id: "C1", label: "47 angel deals · 2 exits", source: "AngelList syndicate", status: "pending" },
      { id: "C2", label: "Operating partner at XYZ", source: "Self-declared",       status: "pending" },
    ],
    audit: [
      { id: "A1", ts: "2026-05-08T14:00:00Z", actor: "applicant", actorRole: "applicant", action: "Application submitted", toStage: "submitted", hash: "0x9911" },
      { id: "A2", ts: "2026-05-08T14:00:20Z", actor: "AI Triage", actorRole: "ai",        action: "Scored 72/100 — medium risk", fromStage: "submitted", toStage: "triage", hash: "0x9a22" },
      { id: "A3", ts: "2026-05-08T14:06:00Z", actor: "Onfido",    actorRole: "system",    action: "ID verified, address pending", fromStage: "triage", toStage: "identity_verified", documents: ["Passport (BR)"], hash: "0x9b33" },
    ],
  },
  {
    id: "AP-9014",
    name: "Yuki Sato",
    avatar: "YS",
    title: "CTO · AI Startup",
    country: "🇯🇵 Japan",
    email: "yuki@sato.dev",
    appliedAt: "2026-05-02T08:00:00Z",
    stage: "interview_passed",
    aiScore: 95,
    risk: "low",
    reviewer: "Marcus C.",
    documents: [
      { id: "D1", name: "MyNumber + Passport", type: "Government ID", uploaded: "1w ago", status: "verified", verifiedBy: "Persona" },
      { id: "D2", name: "MIT diploma",         type: "Education",     uploaded: "1w ago", status: "verified", verifiedBy: "Registry API" },
      { id: "D3", name: "Patent grants ×3",    type: "IP",            uploaded: "1w ago", status: "verified", verifiedBy: "USPTO" },
      { id: "D4", name: "Interview recording", type: "Video",         uploaded: "1d ago", status: "verified", verifiedBy: "Marcus C." },
    ],
    claims: [
      { id: "C1", label: "MIT PhD, CSAIL",    source: "MIT Registry",  status: "verified" },
      { id: "C2", label: "Meta alum (2019–22)", source: "LinkedIn API + email", status: "verified" },
      { id: "C3", label: "3 patents",         source: "USPTO",         status: "verified" },
    ],
    audit: [
      { id: "A1", ts: "2026-05-02T08:00:00Z", actor: "applicant", actorRole: "applicant", action: "Application submitted", toStage: "submitted", hash: "0xa101" },
      { id: "A2", ts: "2026-05-02T08:00:10Z", actor: "AI Triage", actorRole: "ai",        action: "Scored 95/100 — fast-track", fromStage: "submitted", toStage: "triage", hash: "0xa202" },
      { id: "A3", ts: "2026-05-02T08:30:00Z", actor: "Persona",   actorRole: "system",    action: "Identity verified",       fromStage: "triage", toStage: "identity_verified", hash: "0xa303" },
      { id: "A4", ts: "2026-05-02T09:00:00Z", actor: "Compliance", actorRole: "system",   action: "KYC + sanctions cleared", fromStage: "identity_verified", toStage: "kyc_approved", hash: "0xa404" },
      { id: "A5", ts: "2026-05-02T15:00:00Z", actor: "Marcus C.", actorRole: "reviewer",  action: "Domain review complete — schedule interview", fromStage: "kyc_approved", toStage: "domain_review", hash: "0xa505" },
      { id: "A6", ts: "2026-05-04T10:00:00Z", actor: "Marcus C.", actorRole: "reviewer",  action: "Interview scheduled (Mar 8 14:00 JST)", fromStage: "domain_review", toStage: "interview_scheduled", hash: "0xa606" },
      { id: "A7", ts: "2026-05-08T05:30:00Z", actor: "Marcus C.", actorRole: "reviewer",  action: "Interview passed — recommending approval", fromStage: "interview_scheduled", toStage: "interview_passed", reasonCode: "APR-INT-PASS", notes: "Excellent depth on RAG architectures, strong communication.", hash: "0xa707" },
    ],
  },
  {
    id: "AP-9015",
    name: "Anonymous Submission",
    avatar: "?",
    title: "Claims: Ex-Goldman MD",
    country: "🇺🇸 USA",
    email: "trader2026@protonmail.com",
    appliedAt: "2026-05-09T03:11:00Z",
    stage: "triage",
    aiScore: 38,
    risk: "high",
    reviewer: "—",
    documents: [],
    claims: [
      { id: "C1", label: "Goldman MD 2010–2024", source: "Self-declared", status: "pending" },
    ],
    audit: [
      { id: "A1", ts: "2026-05-09T03:11:00Z", actor: "applicant", actorRole: "applicant", action: "Application submitted",                   toStage: "submitted", hash: "0xff01" },
      { id: "A2", ts: "2026-05-09T03:11:20Z", actor: "AI Triage", actorRole: "ai",        action: "Scored 38/100 — generic email, thin LI",  fromStage: "submitted", toStage: "triage", hash: "0xff02" },
    ],
  },
];

// --- Component ------------------------------------------------------------

function shortHash(): string {
  return "0x" + Math.random().toString(16).slice(2, 6);
}

export function ExpertOnboarding() {
  const [tab, setTab] = useState("queue");
  const [applicants, setApplicants] = useState<Applicant[]>(seed);
  const [openId, setOpenId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | "hold" | "advance" | null>(null);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [search, setSearch] = useState("");

  const open = useMemo(() => applicants.find((a) => a.id === openId) || null, [openId, applicants]);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return applicants.filter((a) => {
      if (tab === "high-risk" && a.risk !== "high") return false;
      if (tab === "approved" && a.stage !== "approved") return false;
      if (tab === "rejected" && a.stage !== "rejected") return false;
      if (tab === "hold" && a.stage !== "on_hold") return false;
      if (tab === "appeal" && a.stage !== "appeal") return false;
      if (tab === "queue" && (a.stage === "approved" || a.stage === "rejected")) return false;
      if (q && !(a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [applicants, tab, search]);

  const transition = (id: string, toStage: Stage, reasonCode: string | undefined, note: string) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const fromStage = a.stage;
        const entry: AuditEntry = {
          id: "A" + (a.audit.length + 1),
          ts: new Date().toISOString(),
          actor: "you (admin)",
          actorRole: "reviewer",
          action:
            toStage === "approved" ? "Approved expert"
            : toStage === "rejected" ? "Rejected application"
            : toStage === "on_hold" ? "Placed on hold"
            : `Advanced to ${STAGE_META[toStage].label}`,
          fromStage,
          toStage,
          reasonCode,
          notes: note || undefined,
          documents: a.documents.filter((d) => d.status === "verified").map((d) => d.name),
          claims: a.claims.filter((c) => c.status === "verified").map((c) => c.label),
          ip: "10.0.0.1",
          hash: shortHash(),
        };
        return { ...a, stage: toStage, audit: [...a.audit, entry] };
      })
    );
    toast.success(`${id} → ${STAGE_META[toStage].label}`);
    setActionMode(null);
    setReason("");
    setNotes("");
  };

  const requestInfo = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id !== id ? a : {
          ...a,
          audit: [...a.audit, {
            id: "A" + (a.audit.length + 1),
            ts: new Date().toISOString(),
            actor: "you (admin)", actorRole: "reviewer",
            action: "Requested additional info from applicant",
            notes: "Email auto-sent with checklist.",
            hash: shortHash(),
          }],
        }
      )
    );
    toast.info("Info request emailed to applicant.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expert Onboarding & Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-stage workflow with explicit transitions, reviewer actions, and a tamper-evident audit trail.
        </p>
      </div>

      {/* Workflow visualizer */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Verification Workflow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {(["submitted","triage","identity_verified","kyc_approved","domain_review","interview_scheduled","interview_passed","approved"] as Stage[]).map((s, i, arr) => {
              const M = STAGE_META[s];
              const Icon = M.icon;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${M.color}`}>
                    <Icon className="h-3 w-3" /> {M.label}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              );
            })}
            <span className="text-xs text-muted-foreground ml-2">· Side states: <Badge variant="outline" className={STAGE_META.on_hold.color}>On Hold</Badge> <Badge variant="outline" className={STAGE_META.rejected.color}>Rejected</Badge> <Badge variant="outline" className={STAGE_META.appeal.color}>Appeal</Badge></span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "In Queue", value: applicants.filter((a) => !["approved","rejected"].includes(a.stage)).length, icon: Clock },
          { label: "Approved (LTM)", value: 412, icon: ShieldCheck },
          { label: "Rejected (LTM)", value: 1024, icon: XCircle },
          { label: "Avg Time-to-Verify", value: "3.2d", icon: Sparkles },
          { label: "Audit Entries Today", value: 287, icon: History },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name, ID, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export Audit Log</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="queue">Active Queue</TabsTrigger>
              <TabsTrigger value="high-risk">High Risk</TabsTrigger>
              <TabsTrigger value="hold">On Hold</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="appeal">Appeals</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-3">
              {visible.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No applicants in this view.</p>
              )}
              {visible.map((a) => {
                const M = STAGE_META[a.stage];
                const Icon = M.icon;
                const allowed = TRANSITIONS[a.stage];
                return (
                  <div key={a.id} className="rounded-lg border p-4 hover:border-primary/40 transition">
                    <div className="flex flex-wrap gap-3">
                      <Avatar className="h-12 w-12"><AvatarFallback>{a.avatar}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{a.name}</h3>
                          <span className="text-xs text-muted-foreground">{a.country} · {a.id}</span>
                          {a.risk === "high" && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />High Risk</Badge>}
                          {a.risk === "medium" && <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Medium</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{a.title} · {a.email}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {a.claims.slice(0, 3).map((c) => (
                            <Badge key={c.id} variant={c.status === "verified" ? "secondary" : "outline"} className="text-[10px]">
                              {c.status === "verified" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 text-emerald-600" />}
                              {c.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="min-w-[210px]">
                        <Badge variant="outline" className={`${M.color} gap-1`}><Icon className="h-3 w-3" />{M.label}</Badge>
                        <div className="mt-2">
                          <div className="flex justify-between text-[11px] text-muted-foreground"><span>Workflow</span><span>{M.pct}%</span></div>
                          <Progress value={M.pct} className="h-1.5 mt-1" />
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                          AI <span className={`font-semibold ${a.aiScore > 80 ? "text-emerald-600" : a.aiScore > 60 ? "text-amber-600" : "text-rose-600"}`}>{a.aiScore}/100</span> · Reviewer: {a.reviewer} · Audit: {a.audit.length} entries
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpenId(a.id)}>
                        <Eye className="h-3 w-3" /> Open Dossier
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => requestInfo(a.id)}>
                        <MessageSquare className="h-3 w-3" /> Request Info
                      </Button>
                      {allowed.filter((s) => !["approved","rejected","on_hold","appeal"].includes(s)).map((s) => (
                        <Button key={s} size="sm" variant="outline" className="gap-1" onClick={() => transition(a.id, s, undefined, `Advanced from ${STAGE_META[a.stage].label}`)}>
                          <ArrowRight className="h-3 w-3" /> Advance → {STAGE_META[s].label}
                        </Button>
                      ))}
                      {allowed.includes("on_hold") && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => { setOpenId(a.id); setActionMode("hold"); }}>
                          <Lock className="h-3 w-3" /> Hold
                        </Button>
                      )}
                      {allowed.includes("approved") && (
                        <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setOpenId(a.id); setActionMode("approve"); }}>
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                      )}
                      {allowed.includes("rejected") && (
                        <Button size="sm" variant="destructive" className="gap-1" onClick={() => { setOpenId(a.id); setActionMode("reject"); }}>
                          <Ban className="h-3 w-3" /> Reject
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dossier dialog */}
      <Dialog open={!!open} onOpenChange={(o) => { if (!o) { setOpenId(null); setActionMode(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{open.avatar}</AvatarFallback></Avatar>
                  {open.name}
                  <Badge variant="outline" className={STAGE_META[open.stage].color}>{STAGE_META[open.stage].label}</Badge>
                </DialogTitle>
                <DialogDescription>{open.title} · {open.country} · {open.id} · applied {new Date(open.appliedAt).toLocaleString()}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="docs" className="flex-1 overflow-hidden flex flex-col">
                <TabsList>
                  <TabsTrigger value="docs"><FileCheck2 className="h-3.5 w-3.5 mr-1" /> Documents</TabsTrigger>
                  <TabsTrigger value="claims"><Award className="h-3.5 w-3.5 mr-1" /> Claims</TabsTrigger>
                  <TabsTrigger value="audit"><History className="h-3.5 w-3.5 mr-1" /> Audit Trail</TabsTrigger>
                  <TabsTrigger value="action"><UserCheck className="h-3.5 w-3.5 mr-1" /> Reviewer Action</TabsTrigger>
                </TabsList>

                <TabsContent value="docs" className="flex-1 overflow-auto mt-3">
                  <div className="space-y-2">
                    {open.documents.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
                    {open.documents.map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{d.name}</div>
                            <div className="text-xs text-muted-foreground">{d.type} · uploaded {d.uploaded}{d.verifiedBy ? ` · by ${d.verifiedBy}` : ""}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          d.status === "verified" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" :
                          d.status === "pending"  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"     :
                                                    "bg-rose-500/15 text-rose-600 border-rose-500/30"
                        }>{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="claims" className="flex-1 overflow-auto mt-3">
                  <div className="space-y-2">
                    {open.claims.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="font-medium text-sm">{c.label}</div>
                          <div className="text-xs text-muted-foreground">Source: {c.source}</div>
                        </div>
                        <Badge variant="outline" className={
                          c.status === "verified" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" :
                          c.status === "pending"  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"     :
                                                    "bg-rose-500/15 text-rose-600 border-rose-500/30"
                        }>{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="flex-1 overflow-hidden mt-3">
                  <ScrollArea className="h-[420px] rounded-lg border">
                    <div className="p-4 space-y-3">
                      {open.audit.map((e, idx) => (
                        <div key={e.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-2.5 w-2.5 rounded-full ${e.actorRole === "reviewer" ? "bg-primary" : e.actorRole === "ai" ? "bg-violet-500" : e.actorRole === "system" ? "bg-cyan-500" : "bg-muted-foreground"}`} />
                            {idx < open.audit.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{e.action}</span>
                              {e.fromStage && e.toStage && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Badge variant="outline" className={`text-[10px] ${STAGE_META[e.fromStage].color}`}>{STAGE_META[e.fromStage].label}</Badge>
                                  <ArrowRight className="h-3 w-3" />
                                  <Badge variant="outline" className={`text-[10px] ${STAGE_META[e.toStage].color}`}>{STAGE_META[e.toStage].label}</Badge>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              by <span className="font-medium text-foreground">{e.actor}</span> ({e.actorRole}) · {new Date(e.ts).toLocaleString()} · hash <span className="font-mono">{e.hash}</span>
                              {e.ip && <> · ip <span className="font-mono">{e.ip}</span></>}
                            </div>
                            {e.reasonCode && <div className="text-xs mt-1"><Badge variant="secondary" className="text-[10px] font-mono">{e.reasonCode}</Badge></div>}
                            {e.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{e.notes}"</p>}
                            {e.documents && e.documents.length > 0 && (
                              <div className="text-[11px] text-muted-foreground mt-1">Docs: {e.documents.join(", ")}</div>
                            )}
                            {e.claims && e.claims.length > 0 && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">Claims: {e.claims.join(", ")}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Lock className="h-3 w-3" /> Append-only · SHA-256 chain · exportable for SOC2 / GDPR audits</p>
                </TabsContent>

                <TabsContent value="action" className="flex-1 overflow-auto mt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant={actionMode === "approve" ? "default" : "outline"} className="gap-1" onClick={() => setActionMode("approve")} disabled={!TRANSITIONS[open.stage].includes("approved")}>
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button variant={actionMode === "reject" ? "destructive" : "outline"} className="gap-1" onClick={() => setActionMode("reject")} disabled={!TRANSITIONS[open.stage].includes("rejected")}>
                      <Ban className="h-4 w-4" /> Reject
                    </Button>
                    <Button variant={actionMode === "hold" ? "default" : "outline"} className="gap-1" onClick={() => setActionMode("hold")} disabled={!TRANSITIONS[open.stage].includes("on_hold")}>
                      <Lock className="h-4 w-4" /> Hold
                    </Button>
                  </div>

                  {actionMode && (
                    <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                      <div>
                        <Label className="text-xs">Reason code (required)</Label>
                        <Select value={reason} onValueChange={setReason}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason code…" /></SelectTrigger>
                          <SelectContent>
                            {REASON_CODES[actionMode === "advance" ? "approve" : actionMode].map((r) => (
                              <SelectItem key={r.code} value={r.code}>
                                <span className="font-mono text-xs mr-2">{r.code}</span>{r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Reviewer notes (recorded in audit)</Label>
                        <Textarea className="mt-1" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context the next reviewer should see…" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setActionMode(null); setReason(""); setNotes(""); }}>Cancel</Button>
                        <Button
                          size="sm"
                          disabled={!reason}
                          className={actionMode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          variant={actionMode === "reject" ? "destructive" : "default"}
                          onClick={() => transition(open.id, actionMode === "approve" ? "approved" : actionMode === "reject" ? "rejected" : "on_hold", reason, notes)}
                        >
                          Confirm {actionMode}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Verification Sources</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Persona / Onfido — gov ID, liveness, address</li>
              <li>• OFAC / UN / EU sanctions — continuous re-screen</li>
              <li>• LinkedIn API — employment & education depth</li>
              <li>• Crunchbase / PitchBook — investor track records</li>
              <li>• USPTO / EPO — patents</li>
              <li>• University registries — degree verification</li>
              <li>• Work-email DNS+SMTP proof — employer claim</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Audit Trail Guarantees</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• <span className="text-foreground">Append-only</span> — no entry can be edited or deleted</li>
              <li>• <span className="text-foreground">Hash-chained</span> — each entry references the previous</li>
              <li>• <span className="text-foreground">Reason-coded</span> — every approval/rejection has a code</li>
              <li>• <span className="text-foreground">Reviewer attribution</span> — who, when, from which IP</li>
              <li>• <span className="text-foreground">Document & claim pinning</span> — exact evidence at decision time</li>
              <li>• <span className="text-foreground">Exportable</span> — JSON / CSV for SOC2 / GDPR / DAC7</li>
              <li>• <span className="text-foreground">Retained 7 years</span> — per regulatory minimums</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
