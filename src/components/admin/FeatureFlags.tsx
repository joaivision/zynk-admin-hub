import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Flag, Plus, Search, Download, Upload, Edit, Trash2, History, Eye, ChevronRight,
  Rocket, Beaker, Lock, AlertTriangle, Users, Globe, Smartphone, Monitor, Zap,
  Pause, PlayCircle, Copy, GitBranch, Activity, ShieldAlert, CheckCircle2,
  Calendar, Clock, UserCheck, GitPullRequest, Code2, UserSearch, X, Check,
} from "lucide-react";

type Env = "dev" | "staging" | "prod";
type FlagType = "release" | "experiment" | "kill-switch" | "permission" | "config";
type FlagStatus = "active" | "paused" | "archived";

type Flag = {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  status: FlagStatus;
  owner: string;
  tags: string[];
  envs: Record<Env, { enabled: boolean; rollout: number }>;
  audiences: string[];
  plans: string[];
  regions: string[];
  platforms: string[];
  variants?: { key: string; weight: number }[];
  killSwitch: boolean;
  prereqs: string[];
  createdAt: string;
  updatedAt: string;
  evaluations24h: number;
  exposureRate: number;
};

type AuditEntry = {
  id: string; flagId: string; at: string; by: string; action: string; detail: string;
};

const allAudiences = ["All Users","Founders","Investors","Mentors","Vendors","Employers","Job Seekers","Beta Testers","Internal"];
const allPlans = ["Free","Starter","Pro","Investor Club","Enterprise"];
const allRegions = ["Global","US","EU","UK","India","UAE","Singapore","Brazil"];
const allPlatforms = ["Web","iOS","Android"];

const typeMeta: Record<FlagType, { label: string; icon: typeof Flag; color: string }> = {
  release: { label: "Release", icon: Rocket, color: "bg-blue-500/10 text-blue-500" },
  experiment: { label: "Experiment", icon: Beaker, color: "bg-violet-500/10 text-violet-500" },
  "kill-switch": { label: "Kill switch", icon: ShieldAlert, color: "bg-rose-500/10 text-rose-500" },
  permission: { label: "Permission", icon: Lock, color: "bg-amber-500/10 text-amber-500" },
  config: { label: "Config", icon: GitBranch, color: "bg-emerald-500/10 text-emerald-500" },
};

const statusMeta: Record<FlagStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  paused: { label: "Paused", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  archived: { label: "Archived", cls: "bg-muted text-muted-foreground border-border" },
};

const seedFlags: Flag[] = [
  {
    id: "f1", key: "ai_match_v2", name: "AI Match Engine v2",
    description: "New embedding-based matching with intent re-ranking.",
    type: "experiment", status: "active", owner: "Matching Squad",
    tags: ["matching","ai","ml"], audiences: ["Founders","Investors"], plans: ["Pro","Investor Club"],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 35 } },
    variants: [{ key: "control", weight: 50 }, { key: "v2", weight: 50 }],
    killSwitch: true, prereqs: [], createdAt: "2026-03-02", updatedAt: "2026-05-04",
    evaluations24h: 1284321, exposureRate: 34.8,
  },
  {
    id: "f2", key: "investor_syndicates", name: "Investor Syndicates",
    description: "SPV creation flow for investor club members.",
    type: "release", status: "active", owner: "Investor Module",
    tags: ["investors","spv"], audiences: ["Investors"], plans: ["Investor Club","Enterprise"],
    regions: ["US","EU","UK","Singapore"], platforms: ["Web"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 100 } },
    killSwitch: true, prereqs: ["accreditation_required"], createdAt: "2025-11-04", updatedAt: "2026-04-22",
    evaluations24h: 22318, exposureRate: 100,
  },
  {
    id: "f3", key: "mentor_video_calls", name: "Native Mentor Video Calls",
    description: "In-app HD video over LiveKit (replaces Zoom hand-off).",
    type: "release", status: "active", owner: "Mentorship",
    tags: ["mentorship","video"], audiences: ["Mentors","Founders"], plans: ["Pro","Investor Club"],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 60 } },
    killSwitch: true, prereqs: [], createdAt: "2026-02-14", updatedAt: "2026-05-05",
    evaluations24h: 84521, exposureRate: 58.2,
  },
  {
    id: "f4", key: "ai_pitch_coach", name: "AI Pitch Coach",
    description: "Interactive pitch rehearsal with realtime feedback.",
    type: "experiment", status: "active", owner: "AI Tools",
    tags: ["ai","fundraising"], audiences: ["Founders"], plans: ["Pro"],
    regions: ["US","EU","India"], platforms: ["Web"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 15 } },
    variants: [{ key: "control", weight: 70 }, { key: "coach", weight: 30 }],
    killSwitch: true, prereqs: [], createdAt: "2026-04-10", updatedAt: "2026-05-04",
    evaluations24h: 41230, exposureRate: 14.6,
  },
  {
    id: "f5", key: "marketplace_rfq", name: "Marketplace RFQ",
    description: "Request-for-quote flow between founders and vendors.",
    type: "release", status: "paused", owner: "Marketplace",
    tags: ["marketplace","vendors"], audiences: ["Founders","Vendors"], plans: ["Starter","Pro","Enterprise"],
    regions: ["India","UAE","Singapore"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: false, rollout: 0 } },
    killSwitch: true, prereqs: [], createdAt: "2026-01-20", updatedAt: "2026-05-02",
    evaluations24h: 0, exposureRate: 0,
  },
  {
    id: "f6", key: "swipe_unlimited", name: "Unlimited Swipes",
    description: "Removes daily swipe cap for selected plans.",
    type: "permission", status: "active", owner: "Plans",
    tags: ["matching","plans"], audiences: ["All Users"], plans: ["Pro","Investor Club","Enterprise"],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 100 } },
    killSwitch: false, prereqs: [], createdAt: "2025-09-01", updatedAt: "2026-04-12",
    evaluations24h: 1841221, exposureRate: 23.1,
  },
  {
    id: "f7", key: "kill_signups", name: "EMERGENCY: Disable Signups",
    description: "Hard disable of all signup methods. Use during incidents only.",
    type: "kill-switch", status: "active", owner: "Platform",
    tags: ["incident","auth"], audiences: ["All Users"], plans: [],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: false, rollout: 0 }, staging: { enabled: false, rollout: 0 }, prod: { enabled: false, rollout: 0 } },
    killSwitch: true, prereqs: [], createdAt: "2025-06-12", updatedAt: "2026-03-30",
    evaluations24h: 0, exposureRate: 0,
  },
  {
    id: "f8", key: "max_swipes_per_day", name: "Daily Swipe Cap",
    description: "Numeric config for free-tier daily swipe limit.",
    type: "config", status: "active", owner: "Plans",
    tags: ["config","matching"], audiences: ["All Users"], plans: ["Free"],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 100 } },
    killSwitch: false, prereqs: [], createdAt: "2025-08-12", updatedAt: "2026-04-01",
    evaluations24h: 921003, exposureRate: 100,
  },
  {
    id: "f9", key: "data_room_drm", name: "Data Room Watermark + DRM",
    description: "Per-viewer dynamic watermarks on confidential docs.",
    type: "release", status: "active", owner: "Data Room",
    tags: ["data-room","security"], audiences: ["Founders","Investors"], plans: ["Pro","Investor Club","Enterprise"],
    regions: ["Global"], platforms: ["Web"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 80 } },
    killSwitch: true, prereqs: [], createdAt: "2026-03-15", updatedAt: "2026-05-01",
    evaluations24h: 12482, exposureRate: 78.4,
  },
  {
    id: "f10", key: "events_ticketing", name: "Events Ticketing",
    description: "Paid ticketing with Stripe + UPI checkout.",
    type: "release", status: "active", owner: "Events",
    tags: ["events","payments"], audiences: ["All Users"], plans: ["Free","Starter","Pro","Investor Club","Enterprise"],
    regions: ["Global"], platforms: ["Web","iOS","Android"],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: true, rollout: 100 }, prod: { enabled: true, rollout: 100 } },
    killSwitch: true, prereqs: [], createdAt: "2025-12-08", updatedAt: "2026-04-18",
    evaluations24h: 220142, exposureRate: 100,
  },
];

const seedAudit: AuditEntry[] = [
  { id: "a1", flagId: "f1", at: "2026-05-04 14:22", by: "priya@zynk.ing", action: "rollout↑", detail: "prod 25% → 35%" },
  { id: "a2", flagId: "f3", at: "2026-05-05 09:11", by: "ravi@zynk.ing", action: "rollout↑", detail: "prod 40% → 60%" },
  { id: "a3", flagId: "f5", at: "2026-05-02 18:40", by: "ops@zynk.ing", action: "paused", detail: "RFQ disputes spike" },
  { id: "a4", flagId: "f7", at: "2026-03-30 02:15", by: "oncall@zynk.ing", action: "toggled", detail: "Disabled (drill)" },
  { id: "a5", flagId: "f4", at: "2026-05-04 17:02", by: "ai@zynk.ing", action: "variant", detail: "coach 25% → 30%" },
];

export function FeatureFlags() {
  const [flags, setFlags] = useState<Flag[]>(seedFlags);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState<Env>("prod");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Flag | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyFlag, setHistoryFlag] = useState<Flag | null>(null);
  const [deleteFlag, setDeleteFlag] = useState<Flag | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const filtered = useMemo(() => flags.filter((f) => {
    if (typeFilter !== "all" && f.type !== typeFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![f.key, f.name, f.description, f.owner, ...f.tags].some((x) => x.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [flags, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = flags.length;
    const liveProd = flags.filter((f) => f.envs.prod.enabled && f.status === "active").length;
    const experiments = flags.filter((f) => f.type === "experiment" && f.status === "active").length;
    const evals = flags.reduce((s, f) => s + f.evaluations24h, 0);
    return { total, liveProd, experiments, evals };
  }, [flags]);

  const log = (flagId: string, action: string, detail: string) => {
    setAudit((a) => [
      { id: `a${Date.now()}`, flagId, at: new Date().toISOString().slice(0,16).replace("T"," "), by: "you@zynk.ing", action, detail },
      ...a,
    ]);
  };

  const updateFlag = (id: string, patch: Partial<Flag>) => {
    setFlags((fs) => fs.map((f) => f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString().slice(0,10) } : f));
  };

  const toggleEnv = (id: string, env: Env, enabled: boolean) => {
    setFlags((fs) => fs.map((f) => {
      if (f.id !== id) return f;
      return { ...f, updatedAt: new Date().toISOString().slice(0,10), envs: { ...f.envs, [env]: { ...f.envs[env], enabled, rollout: enabled ? Math.max(f.envs[env].rollout, 1) : 0 } } };
    }));
    log(id, "toggled", `${env} → ${enabled ? "ON" : "OFF"}`);
    toast.success(`${env.toUpperCase()} ${enabled ? "enabled" : "disabled"}`);
  };

  const setRollout = (id: string, env: Env, rollout: number) => {
    setFlags((fs) => fs.map((f) => f.id === id ? { ...f, updatedAt: new Date().toISOString().slice(0,10), envs: { ...f.envs, [env]: { enabled: rollout > 0, rollout } } } : f));
  };

  const bulk = (action: "pause" | "resume" | "archive" | "delete") => {
    if (!selected.length) return;
    if (action === "delete") {
      setFlags((fs) => fs.filter((f) => !selected.includes(f.id)));
      toast.success(`Deleted ${selected.length} flags`);
    } else {
      const status: FlagStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "archived";
      setFlags((fs) => fs.map((f) => selected.includes(f.id) ? { ...f, status } : f));
      toast.success(`${action === "pause" ? "Paused" : action === "resume" ? "Resumed" : "Archived"} ${selected.length} flags`);
    }
    setSelected([]);
  };

  const saveFlag = (f: Flag) => {
    const isNew = !flags.find((x) => x.id === f.id);
    if (isNew) setFlags((fs) => [...fs, f]);
    else setFlags((fs) => fs.map((x) => x.id === f.id ? f : x));
    log(f.id, isNew ? "created" : "updated", f.key);
    setEditing(null); setCreating(false);
    toast.success(isNew ? "Flag created" : "Flag saved");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(flags, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "feature-flags.json"; a.click(); URL.revokeObjectURL(url);
    toast.success("Exported flags");
  };

  const triggerEmergency = () => {
    setFlags((fs) => fs.map((f) => f.type === "experiment" ? {
      ...f, status: "paused" as FlagStatus,
      envs: { ...f.envs, prod: { enabled: false, rollout: 0 } },
    } : f));
    setEmergencyOpen(false);
    toast.success("All experiments killed in production");
    log("global", "emergency", "Killed all experiments in prod");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Feature Flags</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground">
            Ship safely. Control releases, experiments, kill-switches and per-plan permissions across Zynk.ing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportJson} className="gap-1"><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" size="sm" className="gap-1"><Upload className="h-4 w-4" /> Import</Button>
          <Button variant="outline" size="sm" onClick={() => setEmergencyOpen(true)} className="gap-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
            <ShieldAlert className="h-4 w-4" /> Emergency stop
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1"><Plus className="h-4 w-4" /> New flag</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total flags", value: stats.total, icon: Flag, tone: "text-blue-500" },
          { label: "Live in prod", value: stats.liveProd, icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "Live experiments", value: stats.experiments, icon: Beaker, tone: "text-violet-500" },
          { label: "Evaluations / 24h", value: stats.evals.toLocaleString(), icon: Activity, tone: "text-amber-500" },
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

      <Tabs defaultValue="flags">
        <TabsList>
          <TabsTrigger value="flags">All Flags</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="docs">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by key, name, owner, tag…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(typeMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as Env)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Dev</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Prod</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2">
                  <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                  <Button size="sm" variant="outline" onClick={() => bulk("pause")}>Pause</Button>
                  <Button size="sm" variant="outline" onClick={() => bulk("resume")}>Resume</Button>
                  <Button size="sm" variant="outline" onClick={() => bulk("archive")}>Archive</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulk("delete")}>Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered.map((f) => {
                const Icon = typeMeta[f.type].icon;
                const env = f.envs[envFilter];
                return (
                  <div key={f.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                        <Checkbox checked={selected.includes(f.id)} onCheckedChange={() => setSelected((s) => s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id])} className="mt-1" />
                        <div className={`rounded-md p-2 ${typeMeta[f.type].color}`}><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{f.name}</span>
                            <Badge variant="outline" className={statusMeta[f.status].cls}>{statusMeta[f.status].label}</Badge>
                            <Badge variant="outline" className="text-[10px]">{typeMeta[f.type].label}</Badge>
                            {f.killSwitch && <Badge variant="outline" className="border-rose-500/20 bg-rose-500/10 text-rose-500 text-[10px]"><ShieldAlert className="mr-1 h-3 w-3" />Kill</Badge>}
                          </div>
                          <code className="mt-0.5 block text-[11px] text-muted-foreground">{f.key}</code>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {f.tags.map((t) => (<Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{envFilter}</div>
                          <div className="text-sm font-semibold">{env.rollout}%</div>
                        </div>
                        <Switch checked={env.enabled} onCheckedChange={(v) => toggleEnv(f.id, envFilter, v)} />
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid gap-3 md:grid-cols-3">
                      {(["dev","staging","prod"] as Env[]).map((e) => (
                        <div key={e} className="rounded-md border bg-muted/20 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                              {e === "prod" ? <Rocket className="h-3 w-3" /> : e === "staging" ? <PlayCircle className="h-3 w-3" /> : <Beaker className="h-3 w-3" />}
                              {e}
                            </div>
                            <Switch checked={f.envs[e].enabled} onCheckedChange={(v) => toggleEnv(f.id, e, v)} />
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Slider value={[f.envs[e].rollout]} min={0} max={100} step={1} onValueChange={(v) => setRollout(f.id, e, v[0])} disabled={!f.envs[e].enabled} className="flex-1" />
                            <span className="w-10 text-right text-xs font-mono">{f.envs[e].rollout}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{f.audiences.join(", ") || "All"}</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{f.regions.join(", ")}</span>
                        <span className="flex items-center gap-1">
                          {f.platforms.includes("Web") && <Monitor className="h-3 w-3" />}
                          {(f.platforms.includes("iOS") || f.platforms.includes("Android")) && <Smartphone className="h-3 w-3" />}
                          {f.platforms.join(", ")}
                        </span>
                        <span>Owner: <b className="text-foreground">{f.owner}</b></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{f.evaluations24h.toLocaleString()}/24h • {f.exposureRate.toFixed(1)}% exposed</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(f)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setHistoryFlag(f)}><History className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(f.key); toast("Key copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateFlag(f.id, { status: f.status === "paused" ? "active" : "paused" })}>
                          {f.status === "paused" ? <PlayCircle className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteFlag(f)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No flags match.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live experiments</CardTitle>
              <CardDescription>Variant splits & exposure for active A/B tests in production.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {flags.filter((f) => f.type === "experiment" && f.variants).map((f) => (
                <div key={f.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{f.name}</div>
                      <code className="text-[11px] text-muted-foreground">{f.key}</code>
                    </div>
                    <Badge variant="outline">{f.envs.prod.rollout}% prod rollout</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {f.variants!.map((v) => (
                      <div key={v.key}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono">{v.key}</span>
                          <span className="font-semibold">{v.weight}%</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${v.weight}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {flags.filter((f) => f.type === "experiment").length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No active experiments.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
              <CardDescription>Every flag change is recorded for compliance and incident review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-md border">
                {audit.map((a) => {
                  const f = flags.find((x) => x.id === a.flagId);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-muted p-2"><Activity className="h-3.5 w-3.5" /></div>
                        <div>
                          <div className="font-medium">{f?.name ?? a.flagId} <span className="ml-1 font-mono text-[10px] text-muted-foreground">{f?.key}</span></div>
                          <div className="text-xs text-muted-foreground">{a.action} — {a.detail}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{a.at}</div>
                        <div>{a.by}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration snippet</CardTitle>
              <CardDescription>Drop-in evaluation API for any Zynk.ing surface.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-relaxed">
{`import { useFlag } from "@/lib/flags";

const matchV2 = useFlag("ai_match_v2");
if (matchV2.enabled) {
  // route through new engine
}

// Variants
const { variant } = useFlag("ai_pitch_coach");
if (variant === "coach") showCoach();

// Numeric config
const cap = useFlag<number>("max_swipes_per_day", 20);`}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                Evaluation is sticky per user-id, hashed with the flag key for stable bucketing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FlagEditor open={!!editing || creating} flag={editing} creating={creating} onClose={() => { setEditing(null); setCreating(false); }} onSave={saveFlag} />

      <Dialog open={!!historyFlag} onOpenChange={(o) => !o && setHistoryFlag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>History — {historyFlag?.name}</DialogTitle>
            <DialogDescription>Recent changes to this flag.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y rounded-md border">
              {audit.filter((a) => a.flagId === historyFlag?.id).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-medium">{a.action}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">{a.at}<br />{a.by}</div>
                </div>
              ))}
              {audit.filter((a) => a.flagId === historyFlag?.id).length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">No history yet.</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteFlag} onOpenChange={(o) => !o && setDeleteFlag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteFlag?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>The flag key will stop returning a value. Code referencing it will fall back to defaults.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteFlag) { setFlags((fs) => fs.filter((x) => x.id !== deleteFlag.id)); toast.success("Flag deleted"); } setDeleteFlag(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-500"><ShieldAlert className="h-5 w-5" /> Emergency stop?</AlertDialogTitle>
            <AlertDialogDescription>
              This pauses ALL active experiments in production and disables their prod rollout. Releases and config flags are unaffected. Use during incidents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={triggerEmergency} className="bg-rose-500 text-white hover:bg-rose-600">Kill experiments</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FlagEditor({ open, flag, creating, onClose, onSave }: {
  open: boolean; flag: Flag | null; creating: boolean;
  onClose: () => void; onSave: (f: Flag) => void;
}) {
  const blank = (): Flag => ({
    id: `f${Date.now()}`, key: "", name: "", description: "", type: "release", status: "active",
    owner: "You", tags: [],
    envs: { dev: { enabled: true, rollout: 100 }, staging: { enabled: false, rollout: 0 }, prod: { enabled: false, rollout: 0 } },
    audiences: ["All Users"], plans: [], regions: ["Global"], platforms: ["Web","iOS","Android"],
    killSwitch: true, prereqs: [],
    createdAt: new Date().toISOString().slice(0,10), updatedAt: new Date().toISOString().slice(0,10),
    evaluations24h: 0, exposureRate: 0,
  });
  const [draft, setDraft] = useState<Flag>(flag ?? blank());

  useEffect(() => { if (open) setDraft(flag ?? blank()); }, [open, flag]);

  const update = <K extends keyof Flag>(k: K, v: Flag[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleArr = (key: "audiences" | "plans" | "regions" | "platforms", val: string) => {
    setDraft((d) => ({ ...d, [key]: d[key].includes(val) ? d[key].filter((x) => x !== val) : [...d[key], val] }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{creating ? "New flag" : `Edit — ${draft.name || "Flag"}`}</DialogTitle>
          <DialogDescription>Define behavior, scope and rollout for this flag.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="rollout">Rollout</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Name</Label><Input value={draft.name} onChange={(e) => update("name", e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Key (immutable)</Label>
                <Input value={draft.key} onChange={(e) => update("key", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))} className="font-mono" placeholder="my_feature_key" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => update("type", v as FlagType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Owner</Label><Input value={draft.owner} onChange={(e) => update("owner", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={draft.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={draft.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Kill switch enabled</div>
                <div className="text-xs text-muted-foreground">Allow on-call to instantly disable this flag.</div>
              </div>
              <Switch checked={draft.killSwitch} onCheckedChange={(v) => update("killSwitch", v)} />
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            {([
              { key: "audiences" as const, label: "Audiences", values: allAudiences },
              { key: "plans" as const, label: "Plans", values: allPlans },
              { key: "regions" as const, label: "Regions", values: allRegions },
              { key: "platforms" as const, label: "Platforms", values: allPlatforms },
            ]).map((g) => (
              <div key={g.key} className="space-y-2">
                <Label>{g.label}</Label>
                <div className="flex flex-wrap gap-2">
                  {g.values.map((v) => (
                    <button key={v} type="button" onClick={() => toggleArr(g.key, v)}
                      className={`rounded-md border px-2.5 py-1 text-xs ${draft[g.key].includes(v) ? "border-primary bg-primary/10 text-primary" : ""}`}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="rollout" className="space-y-3">
            {(["dev","staging","prod"] as Env[]).map((e) => (
              <div key={e} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium uppercase tracking-wider">{e}</div>
                  <Switch checked={draft.envs[e].enabled} onCheckedChange={(v) => update("envs", { ...draft.envs, [e]: { ...draft.envs[e], enabled: v, rollout: v ? Math.max(draft.envs[e].rollout, 1) : 0 } })} />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Slider value={[draft.envs[e].rollout]} min={0} max={100} step={1} disabled={!draft.envs[e].enabled} onValueChange={(v) => update("envs", { ...draft.envs, [e]: { enabled: v[0] > 0, rollout: v[0] } })} className="flex-1" />
                  <span className="w-12 text-right text-sm font-mono">{draft.envs[e].rollout}%</span>
                </div>
              </div>
            ))}
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
              Rollout is sticky per user-id. Increase gradually (5 → 25 → 50 → 100) and watch error rates.
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
