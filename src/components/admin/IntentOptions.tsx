import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Target,
  Rocket,
  HandCoins,
  GraduationCap,
  Handshake,
  Briefcase,
  Users,
  ShoppingBag,
  Megaphone,
  Lightbulb,
  Network,
  Heart,
  Plus,
  Download,
  Search,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AudienceKey =
  | "founders"
  | "investors"
  | "mentors"
  | "experts"
  | "talent"
  | "corporates"
  | "service-providers"
  | "students"
  | "all";

const AUDIENCES: { key: AudienceKey; label: string }[] = [
  { key: "founders", label: "Founders" },
  { key: "investors", label: "Investors" },
  { key: "mentors", label: "Mentors" },
  { key: "experts", label: "Experts" },
  { key: "talent", label: "Talent" },
  { key: "corporates", label: "Corporates" },
  { key: "service-providers", label: "Service Providers" },
  { key: "students", label: "Students" },
];

type IntentCategory =
  | "Fundraising"
  | "Investing"
  | "Mentorship"
  | "Hiring"
  | "Partnership"
  | "Networking"
  | "Learning"
  | "Selling"
  | "Marketing"
  | "Other";

const CATEGORIES: IntentCategory[] = [
  "Fundraising",
  "Investing",
  "Mentorship",
  "Hiring",
  "Partnership",
  "Networking",
  "Learning",
  "Selling",
  "Marketing",
  "Other",
];

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  coins: HandCoins,
  cap: GraduationCap,
  handshake: Handshake,
  briefcase: Briefcase,
  users: Users,
  shop: ShoppingBag,
  megaphone: Megaphone,
  bulb: Lightbulb,
  network: Network,
  heart: Heart,
  target: Target,
};

type Intent = {
  id: string;
  slug: string;
  label: string;
  description: string;
  category: IntentCategory;
  icon: keyof typeof ICONS;
  audiences: AudienceKey[];
  matchWith: AudienceKey[];
  weight: number;
  order: number;
  required: boolean;
  multiSelect: boolean;
  trending: boolean;
  showInOnboarding: boolean;
  status: "active" | "inactive" | "draft";
  users: number;
  matches: number;
  createdAt: string;
};

const seedRaw: Array<Omit<Intent, "id" | "createdAt" | "order">> = [
  { slug: "raise-capital", label: "Raise Capital", description: "Connect with angels, VCs and syndicates actively writing checks.", category: "Fundraising", icon: "rocket", audiences: ["founders"], matchWith: ["investors", "mentors"], weight: 10, required: false, multiSelect: true, trending: true, showInOnboarding: true, status: "active", users: 4820, matches: 18420 },
  { slug: "invest-in-startups", label: "Invest in Startups", description: "Discover vetted deal flow matched to your thesis and stage.", category: "Investing", icon: "coins", audiences: ["investors"], matchWith: ["founders"], weight: 10, required: false, multiSelect: true, trending: true, showInOnboarding: true, status: "active", users: 1240, matches: 9610 },
  { slug: "find-mentor", label: "Find a Mentor", description: "Get guidance from operators who've been there before.", category: "Mentorship", icon: "cap", audiences: ["founders", "talent", "students"], matchWith: ["mentors", "experts"], weight: 8, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 6210, matches: 14200 },
  { slug: "mentor-others", label: "Mentor Others", description: "Share expertise, get paid for sessions and build your reputation.", category: "Mentorship", icon: "heart", audiences: ["mentors", "experts"], matchWith: ["founders", "talent", "students"], weight: 8, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 980, matches: 7240 },
  { slug: "find-cofounder", label: "Find a Co-founder", description: "Match with complementary builders by skills, intent and location.", category: "Partnership", icon: "handshake", audiences: ["founders", "talent"], matchWith: ["founders", "talent"], weight: 9, required: false, multiSelect: false, trending: true, showInOnboarding: true, status: "active", users: 2410, matches: 5810 },
  { slug: "hire-talent", label: "Hire Talent", description: "Source vetted operators, engineers and creatives.", category: "Hiring", icon: "briefcase", audiences: ["founders", "corporates"], matchWith: ["talent"], weight: 7, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 3150, matches: 11240 },
  { slug: "find-job", label: "Find a Job", description: "Get matched to startups and corporates hiring for your skills.", category: "Hiring", icon: "briefcase", audiences: ["talent", "students"], matchWith: ["founders", "corporates"], weight: 7, required: false, multiSelect: false, trending: true, showInOnboarding: true, status: "active", users: 8400, matches: 22100 },
  { slug: "partnership", label: "Strategic Partnership", description: "Find distribution, integration or channel partners.", category: "Partnership", icon: "handshake", audiences: ["founders", "corporates", "service-providers"], matchWith: ["founders", "corporates"], weight: 6, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 1820, matches: 4210 },
  { slug: "sell-services", label: "Sell Services", description: "List services on the marketplace and receive RFQs.", category: "Selling", icon: "shop", audiences: ["service-providers", "experts"], matchWith: ["founders", "corporates"], weight: 6, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 1410, matches: 3820 },
  { slug: "buy-services", label: "Buy Services", description: "Post an RFQ and get bids from verified vendors.", category: "Selling", icon: "shop", audiences: ["founders", "corporates"], matchWith: ["service-providers"], weight: 6, required: false, multiSelect: true, trending: false, showInOnboarding: true, status: "active", users: 920, matches: 2410 },
  { slug: "network", label: "Network & Meet People", description: "Open conversations with operators across your industry.", category: "Networking", icon: "network", audiences: ["all"], matchWith: ["all"], weight: 4, required: true, multiSelect: false, trending: false, showInOnboarding: true, status: "active", users: 18420, matches: 64210 },
  { slug: "learn", label: "Learn & Upskill", description: "Discover events, cohorts and content tailored to your goals.", category: "Learning", icon: "bulb", audiences: ["all"], matchWith: ["mentors", "experts"], weight: 5, required: false, multiSelect: true, trending: true, showInOnboarding: true, status: "active", users: 9120, matches: 12410 },
  { slug: "promote-brand", label: "Promote Brand", description: "Sponsor events, run featured placements and grow visibility.", category: "Marketing", icon: "megaphone", audiences: ["corporates", "service-providers"], matchWith: ["all"], weight: 3, required: false, multiSelect: true, trending: false, showInOnboarding: false, status: "active", users: 320, matches: 1240 },
  { slug: "join-syndicate", label: "Join a Syndicate", description: "Co-invest with experienced leads via SPVs.", category: "Investing", icon: "coins", audiences: ["investors"], matchWith: ["investors"], weight: 7, required: false, multiSelect: true, trending: true, showInOnboarding: false, status: "active", users: 410, matches: 1820 },
  { slug: "advisory-board", label: "Join an Advisory Board", description: "Take equity-light advisory roles with high-growth startups.", category: "Mentorship", icon: "users", audiences: ["mentors", "experts", "investors"], matchWith: ["founders"], weight: 6, required: false, multiSelect: true, trending: false, showInOnboarding: false, status: "draft", users: 0, matches: 0 },
];

const seed: Intent[] = seedRaw.map((s, i) => ({
  ...s,
  id: `int_${i + 1}`,
  order: i + 1,
  createdAt: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(),
}));

const empty = (order: number): Intent => ({
  id: `int_${Math.random().toString(36).slice(2, 9)}`,
  slug: "",
  label: "",
  description: "",
  category: "Networking",
  icon: "target",
  audiences: ["all"],
  matchWith: ["all"],
  weight: 5,
  order,
  required: false,
  multiSelect: true,
  trending: false,
  showInOnboarding: true,
  status: "draft",
  users: 0,
  matches: 0,
  createdAt: new Date().toISOString(),
});

export function IntentOptions() {
  const [intents, setIntents] = useState<Intent[]>(seed);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [audience, setAudience] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Intent | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => [...intents].sort((a, b) => a.order - b.order), [intents]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return sorted.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (status !== "all" && i.status !== status) return false;
      if (audience !== "all" && !i.audiences.includes(audience as AudienceKey) && !i.audiences.includes("all")) return false;
      if (!q) return true;
      return (
        i.label.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    });
  }, [sorted, query, category, audience, status]);

  const stats = useMemo(() => {
    const active = intents.filter((i) => i.status === "active").length;
    const onboarding = intents.filter((i) => i.showInOnboarding && i.status === "active").length;
    const trending = intents.filter((i) => i.trending).length;
    const totalUsers = intents.reduce((a, i) => a + i.users, 0);
    return { active, onboarding, trending, totalUsers };
  }, [intents]);

  function patch(id: string, p: Partial<Intent>) {
    setIntents((prev) => prev.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  function move(id: string, dir: -1 | 1) {
    setIntents((prev) => {
      const list = [...prev].sort((a, b) => a.order - b.order);
      const idx = list.findIndex((i) => i.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= list.length) return prev;
      const a = list[idx];
      const b = list[swap];
      const ao = a.order;
      a.order = b.order;
      b.order = ao;
      return [...list];
    });
  }

  function openNew() {
    setEditing(empty(intents.length + 1));
    setOpen(true);
  }

  function openEdit(i: Intent) {
    setEditing({ ...i });
    setOpen(true);
  }

  function save() {
    if (!editing) return;
    if (!editing.label.trim() || !editing.slug.trim()) {
      toast.error("Label and slug are required");
      return;
    }
    setIntents((prev) => {
      const exists = prev.some((i) => i.id === editing.id);
      return exists ? prev.map((i) => (i.id === editing.id ? editing : i)) : [...prev, editing];
    });
    toast.success(`Saved ${editing.label}`);
    setOpen(false);
    setEditing(null);
  }

  function remove(id: string) {
    setIntents((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
    toast.success("Intent removed");
  }

  function bulk(action: "activate" | "deactivate" | "onboarding-on" | "onboarding-off" | "delete") {
    if (selected.length === 0) {
      toast.error("Select at least one intent");
      return;
    }
    if (action === "delete") {
      setIntents((prev) => prev.filter((i) => !selected.includes(i.id)));
    } else {
      setIntents((prev) =>
        prev.map((i) => {
          if (!selected.includes(i.id)) return i;
          if (action === "activate") return { ...i, status: "active" };
          if (action === "deactivate") return { ...i, status: "inactive" };
          if (action === "onboarding-on") return { ...i, showInOnboarding: true };
          if (action === "onboarding-off") return { ...i, showInOnboarding: false };
          return i;
        }),
      );
    }
    toast.success(`Applied to ${selected.length} intent(s)`);
    setSelected([]);
  }

  function exportCSV() {
    const header = ["order", "slug", "label", "category", "audiences", "matchWith", "weight", "required", "multiSelect", "trending", "onboarding", "status", "users", "matches"];
    const rows = filtered.map((i) =>
      [i.order, i.slug, i.label, i.category, i.audiences.join("|"), i.matchWith.join("|"), i.weight, i.required, i.multiSelect, i.trending, i.showInOnboarding, i.status, i.users, i.matches]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zynk-intents-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }

  function audienceLabel(k: AudienceKey) {
    return AUDIENCES.find((a) => a.key === k)?.label ?? "All";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intent / Goal Options</h1>
          <p className="text-sm text-muted-foreground">
            Define the goals users pick during onboarding. Intents drive the matching engine, feed ranking, and recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> New Intent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icon={Target} label="Total Intents" value={intents.length} />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} />
        <StatCard icon={Sparkles} label="In Onboarding" value={stats.onboarding} />
        <StatCard icon={TrendingUp} label="Trending" value={stats.trending} />
        <StatCard icon={Users} label="Selected by Users" value={stats.totalUsers.toLocaleString()} />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Onboarding Preview</CardTitle>
          <p className="text-xs text-muted-foreground">
            Preview of what new users see in the goal-selection step (active + onboarding-enabled, ordered by sort).
          </p>
          <div className="flex flex-wrap gap-2">
            {sorted
              .filter((i) => i.status === "active" && i.showInOnboarding)
              .map((i) => {
                const Icon = ICONS[i.icon] ?? Target;
                return (
                  <div key={i.id} className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{i.label}</span>
                    {i.trending && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <TrendingUp className="h-3 w-3" /> Hot
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Intents</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search intent…" className="pl-9 h-9" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All audiences</SelectItem>
                {AUDIENCES.map((a) => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium">{selected.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulk("activate")}>Activate</Button>
              <Button size="sm" variant="outline" onClick={() => bulk("deactivate")}>Deactivate</Button>
              <Button size="sm" variant="outline" onClick={() => bulk("onboarding-on")}>Show in Onboarding</Button>
              <Button size="sm" variant="outline" onClick={() => bulk("onboarding-off")}>Hide from Onboarding</Button>
              <Button size="sm" variant="destructive" className="gap-1" onClick={() => bulk("delete")}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filtered.length > 0 && filtered.every((i) => selected.includes(i.id))}
                      onCheckedChange={(v) => setSelected(v ? filtered.map((i) => i.id) : [])}
                    />
                  </TableHead>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead>Matches With</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => {
                  const Icon = ICONS[i.icon] ?? Target;
                  return (
                    <TableRow key={i.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(i.id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) => (v ? [...prev, i.id] : prev.filter((x) => x !== i.id)))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i.id, -1)}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-xs tabular-nums">{i.order}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i.id, 1)}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-medium">
                              {i.label}
                              {i.trending && (
                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                  <TrendingUp className="h-3 w-3" /> Hot
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{i.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{i.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {i.audiences.slice(0, 2).map((a) => (
                            <Badge key={a} variant="outline" className="text-xs">{audienceLabel(a)}</Badge>
                          ))}
                          {i.audiences.length > 2 && <Badge variant="outline" className="text-xs">+{i.audiences.length - 2}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {i.matchWith.slice(0, 2).map((a) => (
                            <Badge key={a} variant="secondary" className="text-xs">{audienceLabel(a)}</Badge>
                          ))}
                          {i.matchWith.length > 2 && <Badge variant="secondary" className="text-xs">+{i.matchWith.length - 2}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{i.weight}</TableCell>
                      <TableCell className="text-right tabular-nums">{i.users.toLocaleString()}</TableCell>
                      <TableCell>
                        <Switch checked={i.showInOnboarding} onCheckedChange={(v) => patch(i.id, { showInOnboarding: v })} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={i.status === "active" ? "default" : i.status === "draft" ? "secondary" : "outline"}>
                          {i.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Switch
                            checked={i.status === "active"}
                            onCheckedChange={(v) => patch(i.id, { status: v ? "active" : "inactive" })}
                          />
                          <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                      No intents match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing && intents.some((i) => i.id === editing.id) ? "Edit intent" : "New intent"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Label</Label>
                  <Input
                    value={editing.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setEditing({
                        ...editing,
                        label,
                        slug: editing.slug || label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as IntentCategory })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Icon</Label>
                  <Select value={editing.icon} onValueChange={(v) => setEditing({ ...editing, icon: v as Intent["icon"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(ICONS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Weight (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={editing.weight}
                    onChange={(e) => setEditing({ ...editing, weight: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AudiencePicker label="Shown to" value={editing.audiences} onChange={(v) => setEditing({ ...editing, audiences: v })} />
                <AudiencePicker label="Matches with" value={editing.matchWith} onChange={(v) => setEditing({ ...editing, matchWith: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
                <ToggleRow label="Required" value={editing.required} onChange={(v) => setEditing({ ...editing, required: v })} />
                <ToggleRow label="Multi-select" value={editing.multiSelect} onChange={(v) => setEditing({ ...editing, multiSelect: v })} />
                <ToggleRow label="Trending" value={editing.trending} onChange={(v) => setEditing({ ...editing, trending: v })} />
                <ToggleRow label="Show in onboarding" value={editing.showInOnboarding} onChange={(v) => setEditing({ ...editing, showInOnboarding: v })} />
                <ToggleRow
                  label="Active"
                  value={editing.status === "active"}
                  onChange={(v) => setEditing({ ...editing, status: v ? "active" : "inactive" })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {editing && intents.some((i) => i.id === editing.id) && (
              <Button
                variant="destructive"
                className="mr-auto gap-1"
                onClick={() => {
                  remove(editing.id);
                  setOpen(false);
                }}
              >
                <XCircle className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}

function AudiencePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AudienceKey[];
  onChange: (v: AudienceKey[]) => void;
}) {
  function toggle(k: AudienceKey) {
    if (k === "all") {
      onChange(["all"]);
      return;
    }
    const next = value.filter((v) => v !== "all");
    if (next.includes(k)) onChange(next.filter((v) => v !== k));
    else onChange([...next, k]);
  }
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1 rounded-md border p-2">
        <button
          type="button"
          onClick={() => toggle("all")}
          className={`rounded-full border px-2 py-0.5 text-xs ${value.includes("all") ? "bg-primary text-primary-foreground" : "bg-background"}`}
        >
          All
        </button>
        {AUDIENCES.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => toggle(a.key)}
            className={`rounded-full border px-2 py-0.5 text-xs ${value.includes(a.key) ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
