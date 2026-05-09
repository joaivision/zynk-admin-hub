import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Brain,
  Download,
  Plus,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Wand2,
  GitMerge,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";

type SkillCategory =
  | "Engineering"
  | "Design"
  | "Product"
  | "Data & AI"
  | "Business"
  | "Marketing"
  | "Sales"
  | "Finance"
  | "Operations"
  | "Legal"
  | "Soft Skills"
  | "Domain";

type Skill = {
  id: string;
  slug: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  description?: string;
  parent?: string;
  level: "beginner" | "intermediate" | "advanced" | "expert" | "any";
  trending: boolean;
  featured: boolean;
  matchable: boolean;
  approved: boolean;
  endorsable: boolean;
  status: "active" | "inactive" | "pending";
  users: number;
  jobs: number;
  mentors: number;
  createdAt: string;
};

const CATEGORIES: SkillCategory[] = [
  "Engineering",
  "Design",
  "Product",
  "Data & AI",
  "Business",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Legal",
  "Soft Skills",
  "Domain",
];

const seed: Skill[] = [
  ["react", "React", "Engineering", ["reactjs", "react.js"], 18420, 942, 312],
  ["typescript", "TypeScript", "Engineering", ["ts"], 21200, 1180, 410],
  ["nodejs", "Node.js", "Engineering", ["node"], 15600, 870, 280],
  ["python", "Python", "Engineering", ["py"], 24500, 1320, 510],
  ["aws", "AWS", "Engineering", ["amazon web services"], 12800, 940, 220],
  ["kubernetes", "Kubernetes", "Engineering", ["k8s"], 6800, 520, 140],
  ["figma", "Figma", "Design", [], 9400, 410, 190],
  ["ui-design", "UI Design", "Design", ["interface design"], 11200, 540, 260],
  ["ux-research", "UX Research", "Design", ["user research"], 5400, 280, 170],
  ["product-strategy", "Product Strategy", "Product", ["product mgmt"], 8900, 612, 340],
  ["roadmapping", "Roadmapping", "Product", [], 4200, 210, 120],
  ["machine-learning", "Machine Learning", "Data & AI", ["ml"], 13800, 980, 420],
  ["llm-engineering", "LLM Engineering", "Data & AI", ["genai", "rag"], 7200, 720, 360],
  ["data-science", "Data Science", "Data & AI", [], 11600, 820, 290],
  ["fundraising", "Fundraising", "Business", ["capital raise"], 6400, 180, 480],
  ["go-to-market", "Go-to-Market", "Business", ["gtm"], 5100, 260, 310],
  ["growth-marketing", "Growth Marketing", "Marketing", ["growth hacking"], 7800, 410, 230],
  ["seo", "SEO", "Marketing", ["search optimization"], 6200, 340, 150],
  ["b2b-sales", "B2B Sales", "Sales", ["enterprise sales"], 5600, 480, 200],
  ["financial-modeling", "Financial Modeling", "Finance", ["fin model"], 4800, 220, 260],
  ["fp-and-a", "FP&A", "Finance", ["fpa"], 2900, 180, 90],
  ["operations", "Operations", "Operations", ["ops"], 6800, 320, 110],
  ["contracts", "Contracts", "Legal", ["legal contracts"], 2200, 140, 180],
  ["leadership", "Leadership", "Soft Skills", ["team leadership"], 14200, 0, 540],
  ["communication", "Communication", "Soft Skills", [], 18600, 0, 320],
  ["fintech", "Fintech", "Domain", [], 8400, 510, 290],
  ["healthtech", "Healthtech", "Domain", [], 5600, 340, 210],
  ["climate", "Climate Tech", "Domain", ["cleantech"], 3200, 190, 140],
  ["web3", "Web3", "Domain", ["blockchain", "crypto"], 4100, 240, 160],
].map(([slug, name, category, aliases, users, jobs, mentors], i) => ({
  id: `sk_${i + 1}`,
  slug: slug as string,
  name: name as string,
  category: category as SkillCategory,
  aliases: aliases as string[],
  level: "any",
  trending: i < 6 || (i % 7 === 0),
  featured: i < 4,
  matchable: true,
  approved: true,
  endorsable: true,
  status: "active",
  users: users as number,
  jobs: jobs as number,
  mentors: mentors as number,
  createdAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
}));

seed.push({
  id: "sk_pending_1",
  slug: "prompt-engineering",
  name: "Prompt Engineering",
  category: "Data & AI",
  aliases: ["prompting"],
  level: "any",
  trending: true,
  featured: false,
  matchable: false,
  approved: false,
  endorsable: true,
  status: "pending",
  users: 412,
  jobs: 38,
  mentors: 22,
  createdAt: new Date().toISOString(),
});

const empty = (): Skill => ({
  id: `sk_${Math.random().toString(36).slice(2, 9)}`,
  slug: "",
  name: "",
  category: "Engineering",
  aliases: [],
  level: "any",
  trending: false,
  featured: false,
  matchable: true,
  approved: true,
  endorsable: true,
  status: "active",
  users: 0,
  jobs: 0,
  mentors: 0,
  createdAt: new Date().toISOString(),
});

export function SkillTags() {
  const [skills, setSkills] = useState<Skill[]>(seed);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return skills.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (status !== "all" && s.status !== status) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [skills, query, category, status]);

  const stats = useMemo(() => {
    const active = skills.filter((s) => s.status === "active").length;
    const pending = skills.filter((s) => s.status === "pending").length;
    const trending = skills.filter((s) => s.trending).length;
    const totalUsers = skills.reduce((a, s) => a + s.users, 0);
    const totalJobs = skills.reduce((a, s) => a + s.jobs, 0);
    return { active, pending, trending, totalUsers, totalJobs };
  }, [skills]);

  function openNew() {
    setEditing(empty());
    setDialogOpen(true);
  }

  function openEdit(s: Skill) {
    setEditing({ ...s });
    setDialogOpen(true);
  }

  function save() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSkills((prev) => {
      const exists = prev.some((s) => s.id === editing.id);
      return exists ? prev.map((s) => (s.id === editing.id ? editing : s)) : [editing, ...prev];
    });
    toast.success(`Saved ${editing.name}`);
    setDialogOpen(false);
    setEditing(null);
  }

  function patch(id: string, p: Partial<Skill>) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  function remove(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
    toast.success("Skill deleted");
  }

  function approve(id: string) {
    patch(id, { approved: true, status: "active", matchable: true });
    toast.success("Skill approved");
  }

  function reject(id: string) {
    patch(id, { approved: false, status: "inactive", matchable: false });
    toast.success("Skill rejected");
  }

  function bulk(action: "activate" | "deactivate" | "delete" | "trending" | "untrending") {
    if (selected.length === 0) {
      toast.error("Select at least one skill");
      return;
    }
    if (action === "delete") {
      setSkills((prev) => prev.filter((s) => !selected.includes(s.id)));
    } else {
      setSkills((prev) =>
        prev.map((s) => {
          if (!selected.includes(s.id)) return s;
          if (action === "activate") return { ...s, status: "active" };
          if (action === "deactivate") return { ...s, status: "inactive" };
          if (action === "trending") return { ...s, trending: true };
          if (action === "untrending") return { ...s, trending: false };
          return s;
        }),
      );
    }
    toast.success(`Applied "${action}" to ${selected.length} skill(s)`);
    setSelected([]);
  }

  function merge() {
    if (!mergeTarget || selected.length < 2) {
      toast.error("Pick a target and at least 2 skills");
      return;
    }
    const sources = selected.filter((id) => id !== mergeTarget);
    setSkills((prev) => {
      const target = prev.find((s) => s.id === mergeTarget);
      if (!target) return prev;
      const merged = { ...target };
      const aliases = new Set(target.aliases);
      for (const id of sources) {
        const src = prev.find((s) => s.id === id);
        if (!src) continue;
        merged.users += src.users;
        merged.jobs += src.jobs;
        merged.mentors += src.mentors;
        aliases.add(src.slug);
        aliases.add(src.name);
        src.aliases.forEach((a) => aliases.add(a));
      }
      merged.aliases = [...aliases].filter((a) => a !== merged.name && a !== merged.slug);
      return prev.filter((s) => !sources.includes(s.id)).map((s) => (s.id === merged.id ? merged : s));
    });
    toast.success(`Merged ${sources.length} skill(s) into target`);
    setSelected([]);
    setMergeTarget("");
    setMergeOpen(false);
  }

  function exportCSV() {
    const header = ["slug", "name", "category", "aliases", "status", "trending", "featured", "approved", "users", "jobs", "mentors"];
    const rows = filtered.map((s) =>
      [
        s.slug,
        s.name,
        s.category,
        s.aliases.join("|"),
        s.status,
        s.trending,
        s.featured,
        s.approved,
        s.users,
        s.jobs,
        s.mentors,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zynk-skills-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }

  function aiSuggest() {
    const ideas = [
      { name: "Vector Databases", category: "Data & AI" as SkillCategory, aliases: ["pinecone", "weaviate"] },
      { name: "Investor Relations", category: "Business" as SkillCategory, aliases: ["IR"] },
      { name: "Conversion Rate Optimization", category: "Marketing" as SkillCategory, aliases: ["CRO"] },
    ];
    const fresh = ideas
      .filter((i) => !skills.some((s) => s.name.toLowerCase() === i.name.toLowerCase()))
      .map((i, idx) => ({
        ...empty(),
        id: `sk_ai_${Date.now()}_${idx}`,
        name: i.name,
        slug: i.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        category: i.category,
        aliases: i.aliases,
        approved: false,
        status: "pending" as const,
        trending: true,
      }));
    if (fresh.length === 0) {
      toast("No new suggestions right now");
      return;
    }
    setSkills((prev) => [...fresh, ...prev]);
    toast.success(`Added ${fresh.length} AI suggestion(s) to review`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skill Tags</h1>
          <p className="text-sm text-muted-foreground">
            Curate the skill taxonomy that powers matching, search, mentor discovery, and job recommendations on Zynk.ing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={aiSuggest}>
            <Wand2 className="h-4 w-4" /> AI Suggest
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> New Skill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icon={Tag} label="Total Skills" value={skills.length} />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} />
        <StatCard icon={Sparkles} label="Pending Review" value={stats.pending} />
        <StatCard icon={TrendingUp} label="Trending" value={stats.trending} />
        <StatCard icon={Users} label="Tagged Users" value={stats.totalUsers.toLocaleString()} />
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Skill Library</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, slug, alias…"
                className="pl-9 h-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium">{selected.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulk("activate")}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("deactivate")}>
                Deactivate
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("trending")}>
                Mark Trending
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("untrending")}>
                Clear Trending
              </Button>
              <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1" disabled={selected.length < 2}>
                    <GitMerge className="h-4 w-4" /> Merge
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Merge skills</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Pick the canonical skill. Other selected skills become aliases and their usage counts merge in.
                    </p>
                    <Select value={mergeTarget} onValueChange={setMergeTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose target skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skills
                          .filter((s) => selected.includes(s.id))
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.slug})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMergeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={merge}>Merge</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      checked={filtered.length > 0 && filtered.every((s) => selected.includes(s.id))}
                      onCheckedChange={(v) =>
                        setSelected(v ? filtered.map((s) => s.id) : [])
                      }
                    />
                  </TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Aliases</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Mentors</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(s.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v ? [...prev, s.id] : prev.filter((x) => x !== s.id),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.category}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {s.aliases.slice(0, 3).map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                        {s.aliases.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{s.aliases.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.users.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.jobs.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.mentors.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.trending && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <TrendingUp className="h-3 w-3" /> Trending
                          </Badge>
                        )}
                        {s.featured && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Star className="h-3 w-3" /> Featured
                          </Badge>
                        )}
                        {s.matchable && (
                          <Badge variant="outline" className="text-xs">
                            Matchable
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "active"
                            ? "default"
                            : s.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-emerald-600"
                              onClick={() => approve(s.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-destructive"
                              onClick={() => reject(s.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Switch
                          checked={s.status === "active"}
                          onCheckedChange={(v) =>
                            patch(s.id, { status: v ? "active" : "inactive" })
                          }
                        />
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      No skills match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && skills.some((s) => s.id === editing.id) ? "Edit skill" : "New skill"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditing({
                        ...editing,
                        name,
                        slug:
                          editing.slug ||
                          name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={editing.category}
                    onValueChange={(v) =>
                      setEditing({ ...editing, category: v as SkillCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Default level</Label>
                  <Select
                    value={editing.level}
                    onValueChange={(v) =>
                      setEditing({ ...editing, level: v as Skill["level"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Aliases (comma separated)</Label>
                <Input
                  value={editing.aliases.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      aliases: e.target.value
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
                <ToggleRow label="Trending" value={editing.trending} onChange={(v) => setEditing({ ...editing, trending: v })} />
                <ToggleRow label="Featured" value={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} />
                <ToggleRow label="Matchable" value={editing.matchable} onChange={(v) => setEditing({ ...editing, matchable: v })} />
                <ToggleRow label="Endorsable" value={editing.endorsable} onChange={(v) => setEditing({ ...editing, endorsable: v })} />
                <ToggleRow label="Approved" value={editing.approved} onChange={(v) => setEditing({ ...editing, approved: v })} />
                <ToggleRow
                  label="Active"
                  value={editing.status === "active"}
                  onChange={(v) => setEditing({ ...editing, status: v ? "active" : "inactive" })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {editing && skills.some((s) => s.id === editing.id) && (
              <Button
                variant="destructive"
                className="mr-auto"
                onClick={() => {
                  remove(editing.id);
                  setDialogOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: number | string;
}) {
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

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
