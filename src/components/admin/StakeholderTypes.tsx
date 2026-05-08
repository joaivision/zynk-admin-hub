import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Users,
  Star,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Rocket,
  Briefcase,
  GraduationCap,
  Building2,
  HandCoins,
  ShoppingBag,
  Megaphone,
  Code2,
  Newspaper,
  Landmark,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Rocket, Briefcase, GraduationCap, Building2, HandCoins, ShoppingBag,
  Megaphone, Code2, Newspaper, Landmark, Heart, Users, Sparkles,
};

type Stakeholder = {
  id: string;
  key: string; // slug
  name: string;
  description: string;
  icon: keyof typeof ICONS;
  color: string; // hex
  category: "Builder" | "Capital" | "Talent" | "Service" | "Community" | "Media";
  kycRequired: boolean;
  approvalRequired: boolean;
  paid: boolean; // requires paid plan
  visibleSignup: boolean;
  matchable: boolean;
  canPostJobs: boolean;
  canRaise: boolean;
  canInvest: boolean;
  canMentor: boolean;
  canSell: boolean; // marketplace
  defaultPlan: "Free" | "Pro" | "Premium" | "Enterprise";
  order: number;
  active: boolean;
  users: number;
};

const seed: Stakeholder[] = [
  { id: "1", key: "founder", name: "Founder / Startup", description: "Building a venture, raising or bootstrapping.", icon: "Rocket", color: "#6366f1", category: "Builder", kycRequired: true, approvalRequired: false, paid: false, visibleSignup: true, matchable: true, canPostJobs: true, canRaise: true, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Free", order: 1, active: true, users: 28420 },
  { id: "2", key: "investor", name: "Investor / VC", description: "Angels, funds, family offices, accelerators.", icon: "HandCoins", color: "#10b981", category: "Capital", kycRequired: true, approvalRequired: true, paid: true, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: true, canMentor: true, canSell: false, defaultPlan: "Premium", order: 2, active: true, users: 4120 },
  { id: "3", key: "mentor", name: "Mentor / Expert", description: "Domain experts, advisors, fractional leaders.", icon: "GraduationCap", color: "#f59e0b", category: "Talent", kycRequired: true, approvalRequired: true, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: true, canSell: true, defaultPlan: "Pro", order: 3, active: true, users: 6840 },
  { id: "4", key: "corporate", name: "Corporate / Enterprise", description: "Innovation teams, BD, scouting & partnerships.", icon: "Building2", color: "#0ea5e9", category: "Builder", kycRequired: true, approvalRequired: true, paid: true, visibleSignup: true, matchable: true, canPostJobs: true, canRaise: false, canInvest: true, canMentor: false, canSell: false, defaultPlan: "Enterprise", order: 4, active: true, users: 1820 },
  { id: "5", key: "service-provider", name: "Service Provider", description: "Agencies, freelancers, consultancies.", icon: "Briefcase", color: "#8b5cf6", category: "Service", kycRequired: true, approvalRequired: false, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: true, defaultPlan: "Free", order: 5, active: true, users: 9210 },
  { id: "6", key: "talent", name: "Job Seeker / Talent", description: "Engineers, designers, operators looking for roles.", icon: "Users", color: "#ec4899", category: "Talent", kycRequired: false, approvalRequired: false, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Free", order: 6, active: true, users: 41320 },
  { id: "7", key: "vendor", name: "Vendor / Marketplace Seller", description: "Sells products or service packages on the marketplace.", icon: "ShoppingBag", color: "#f97316", category: "Service", kycRequired: true, approvalRequired: true, paid: false, visibleSignup: true, matchable: false, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: true, defaultPlan: "Pro", order: 7, active: true, users: 2410 },
  { id: "8", key: "community-builder", name: "Community Builder", description: "Runs hubs, chapters, accelerators, meetups.", icon: "Megaphone", color: "#14b8a6", category: "Community", kycRequired: false, approvalRequired: true, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: true, canSell: false, defaultPlan: "Free", order: 8, active: true, users: 980 },
  { id: "9", key: "developer", name: "Developer / Maker", description: "Indie hackers, OSS maintainers, technical builders.", icon: "Code2", color: "#3b82f6", category: "Talent", kycRequired: false, approvalRequired: false, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Free", order: 9, active: true, users: 12440 },
  { id: "10", key: "media", name: "Media / Journalist", description: "Reporters, podcasters, content creators.", icon: "Newspaper", color: "#ef4444", category: "Media", kycRequired: true, approvalRequired: true, paid: false, visibleSignup: true, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Free", order: 10, active: true, users: 720 },
  { id: "11", key: "government", name: "Government / Public Sector", description: "Trade bodies, ministries, public innovation programs.", icon: "Landmark", color: "#64748b", category: "Community", kycRequired: true, approvalRequired: true, paid: false, visibleSignup: false, matchable: true, canPostJobs: false, canRaise: false, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Enterprise", order: 11, active: true, users: 140 },
  { id: "12", key: "ngo", name: "NGO / Impact", description: "Non-profits, foundations, impact orgs.", icon: "Heart", color: "#a855f7", category: "Community", kycRequired: true, approvalRequired: true, paid: false, visibleSignup: true, matchable: true, canPostJobs: true, canRaise: true, canInvest: false, canMentor: false, canSell: false, defaultPlan: "Free", order: 12, active: true, users: 410 },
];

const categories = ["All", "Builder", "Capital", "Talent", "Service", "Community", "Media"] as const;

const blank = (): Stakeholder => ({
  id: "",
  key: "",
  name: "",
  description: "",
  icon: "Sparkles",
  color: "#6366f1",
  category: "Builder",
  kycRequired: false,
  approvalRequired: false,
  paid: false,
  visibleSignup: true,
  matchable: true,
  canPostJobs: false,
  canRaise: false,
  canInvest: false,
  canMentor: false,
  canSell: false,
  defaultPlan: "Free",
  order: 99,
  active: true,
  users: 0,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function StakeholderTypes() {
  const [items, setItems] = useState<Stakeholder[]>(seed);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Stakeholder | null>(null);
  const [draft, setDraft] = useState<Stakeholder>(blank());
  const [confirmDel, setConfirmDel] = useState<Stakeholder | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const filtered = useMemo(() => {
    return sorted.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (status === "active" && !s.active) return false;
      if (status === "inactive" && s.active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.key.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sorted, search, category, status]);

  const stats = useMemo(() => {
    const active = items.filter((s) => s.active).length;
    const kyc = items.filter((s) => s.kycRequired).length;
    const approval = items.filter((s) => s.approvalRequired).length;
    const users = items.reduce((sum, s) => sum + s.users, 0);
    return { active, kyc, approval, users };
  }, [items]);

  function openNew() { setEditing(null); setDraft(blank()); setOpen(true); }
  function openEdit(s: Stakeholder) { setEditing(s); setDraft({ ...s }); setOpen(true); }

  function save() {
    const key = draft.key.trim() || slugify(draft.name);
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
    if (!key) { toast.error("Key is required"); return; }
    const dup = items.find((s) => s.key === key && s.id !== editing?.id);
    if (dup) { toast.error(`Key "${key}" already exists`); return; }

    if (editing) {
      setItems((prev) => prev.map((s) => s.id === editing.id ? { ...draft, key, id: editing.id } : s));
      toast.success(`${draft.name} updated`);
    } else {
      const next: Stakeholder = { ...draft, key, id: Date.now().toString(), order: items.length + 1 };
      setItems((prev) => [...prev, next]);
      toast.success(`${draft.name} added`);
    }
    setOpen(false);
  }

  function remove(s: Stakeholder) {
    setItems((prev) => prev.filter((i) => i.id !== s.id));
    toast.success(`${s.name} removed`);
    setConfirmDel(null);
  }

  function toggle(id: string, key: keyof Stakeholder) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, [key]: !s[key] } : s));
  }

  function move(s: Stakeholder, dir: -1 | 1) {
    const list = [...sorted];
    const idx = list.findIndex((i) => i.id === s.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    const a = list[idx], b = list[swap];
    setItems((prev) => prev.map((i) => i.id === a.id ? { ...i, order: b.order } : i.id === b.id ? { ...i, order: a.order } : i));
  }

  function exportCsv() {
    const rows = [
      ["key", "name", "category", "kyc", "approval", "paid", "matchable", "canRaise", "canInvest", "canMentor", "canPostJobs", "canSell", "plan", "active", "users"],
      ...sorted.map((s) => [
        s.key, s.name, s.category, s.kycRequired, s.approvalRequired, s.paid,
        s.matchable, s.canRaise, s.canInvest, s.canMentor, s.canPostJobs, s.canSell,
        s.defaultPlan, s.active, s.users,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zynking-stakeholders.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Stakeholder types exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Stakeholder Types</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stakeholder Types</h1>
          <p className="text-sm text-muted-foreground">
            Define every persona that joins Zynk.ing — what they unlock, how they're verified, and how they appear in matching.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Type
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={items.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} accent />
        <StatCard label="KYC Required" value={stats.kyc} />
        <StatCard label="Manual Approval" value={stats.approval} />
        <StatCard label="Members" value={stats.users.toLocaleString()} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.slice(0, 8).map((s) => {
          const Icon = ICONS[s.icon] ?? Sparkles;
          return (
            <Card key={s.id} className={!s.active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}1a`, color: s.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                </div>
                <p className="mt-3 font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">{s.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{s.users.toLocaleString()} users</span>
                  <span>{s.defaultPlan}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">All stakeholder types ({filtered.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name or key…" className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Signup</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const Icon = ICONS[s.icon] ?? Sparkles;
                  const caps: string[] = [];
                  if (s.canRaise) caps.push("Raise");
                  if (s.canInvest) caps.push("Invest");
                  if (s.canMentor) caps.push("Mentor");
                  if (s.canPostJobs) caps.push("Hire");
                  if (s.canSell) caps.push("Sell");
                  if (s.matchable) caps.push("Match");
                  return (
                    <TableRow key={s.id} className={!s.active ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex flex-col items-center">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(s, -1)}><ArrowUp className="h-3 w-3" /></Button>
                          <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(s, 1)}><ArrowDown className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: `${s.color}1a`, color: s.color }}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm">{s.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{s.key}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{s.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {caps.map((c) => <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell><Switch checked={s.kycRequired} onCheckedChange={() => toggle(s.id, "kycRequired")} /></TableCell>
                      <TableCell><Switch checked={s.approvalRequired} onCheckedChange={() => toggle(s.id, "approvalRequired")} /></TableCell>
                      <TableCell><Switch checked={s.visibleSignup} onCheckedChange={() => toggle(s.id, "visibleSignup")} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          {s.paid && <Star className="h-3 w-3 text-amber-500" />}
                          {s.defaultPlan}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">{s.users.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDel(s)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                      No stakeholder types match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Reorder controls how types appear in the signup wizard. Capabilities drive feature access and matching weights.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit stakeholder type" : "Add stakeholder type"}</DialogTitle>
            <DialogDescription>Personas decide signup flow, KYC, capabilities, and matching weights.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, key: draft.key || slugify(e.target.value) })} placeholder="Founder / Startup" />
            </Field>
            <Field label="Key (slug)">
              <Input value={draft.key} onChange={(e) => setDraft({ ...draft, key: slugify(e.target.value) })} placeholder="founder" />
            </Field>
            <Field label="Category">
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as Stakeholder["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Default plan">
              <Select value={draft.defaultPlan} onValueChange={(v) => setDraft({ ...draft, defaultPlan: v as Stakeholder["defaultPlan"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Free", "Pro", "Premium", "Enterprise"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Icon">
              <Select value={draft.icon} onValueChange={(v) => setDraft({ ...draft, icon: v as keyof typeof ICONS })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(ICONS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Accent color">
              <div className="flex gap-2">
                <Input type="color" className="w-14 p-1 h-10" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
                <Input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short description shown on signup cards" />
              </Field>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification & access</p>
            <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
              <ToggleRow label="KYC required" desc="Must complete identity verification" checked={draft.kycRequired} onChange={(v) => setDraft({ ...draft, kycRequired: v })} />
              <ToggleRow label="Manual approval" desc="Admin reviews before activation" checked={draft.approvalRequired} onChange={(v) => setDraft({ ...draft, approvalRequired: v })} />
              <ToggleRow label="Paid persona" desc="Requires paid subscription" checked={draft.paid} onChange={(v) => setDraft({ ...draft, paid: v })} />
              <ToggleRow label="Show on signup" desc="Visible in the persona picker" checked={draft.visibleSignup} onChange={(v) => setDraft({ ...draft, visibleSignup: v })} />
              <ToggleRow label="Active" desc="Inactive types are hidden everywhere" checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capabilities</p>
            <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
              <ToggleRow label="Matchable" desc="Appears in the matching engine" checked={draft.matchable} onChange={(v) => setDraft({ ...draft, matchable: v })} />
              <ToggleRow label="Can raise capital" desc="Access fundraising tools & data room" checked={draft.canRaise} onChange={(v) => setDraft({ ...draft, canRaise: v })} />
              <ToggleRow label="Can invest" desc="See deal flow, join syndicates" checked={draft.canInvest} onChange={(v) => setDraft({ ...draft, canInvest: v })} />
              <ToggleRow label="Can mentor" desc="List as expert, take bookings" checked={draft.canMentor} onChange={(v) => setDraft({ ...draft, canMentor: v })} />
              <ToggleRow label="Can post jobs" desc="Use talent hiring module" checked={draft.canPostJobs} onChange={(v) => setDraft({ ...draft, canPostJobs: v })} />
              <ToggleRow label="Can sell on marketplace" desc="List services and respond to RFQs" checked={draft.canSell} onChange={(v) => setDraft({ ...draft, canSell: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add type"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel?.users.toLocaleString()} existing users have this persona. They will need to be reassigned. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && remove(confirmDel)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
        </div>
        {icon && <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
