import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Plus,
  Search,
  Download,
  Upload,
  Pencil,
  Trash2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Star,
  TrendingUp,
  Merge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

type Industry = {
  id: string;
  slug: string;
  name: string;
  parent: string | null; // parent slug
  description: string;
  aliases: string[];
  color: string;
  trending: boolean;
  featured: boolean;
  matchable: boolean;
  approved: boolean; // false = user-suggested awaiting approval
  active: boolean;
  users: number; // tagged users
  companies: number;
  jobs: number;
  deals: number; // investor deals
};

const seedRaw: Omit<Industry, "id">[] = [
  // Top-level sectors (parent: null)
  { slug: "technology", name: "Technology", parent: null, description: "Software, hardware, internet, IT services.", aliases: ["Tech", "IT"], color: "#3b82f6", trending: true, featured: true, matchable: true, approved: true, active: true, users: 84210, companies: 12420, jobs: 2410, deals: 820 },
  { slug: "fintech", name: "Fintech", parent: "technology", description: "Payments, lending, neobanks, wealth, insurtech.", aliases: ["Financial Technology"], color: "#10b981", trending: true, featured: true, matchable: true, approved: true, active: true, users: 18420, companies: 2410, jobs: 410, deals: 240 },
  { slug: "saas", name: "SaaS", parent: "technology", description: "Cloud-delivered B2B & B2C software.", aliases: ["B2B SaaS"], color: "#6366f1", trending: true, featured: true, matchable: true, approved: true, active: true, users: 24320, companies: 3840, jobs: 620, deals: 310 },
  { slug: "ai-ml", name: "AI & Machine Learning", parent: "technology", description: "Foundation models, applied AI, MLOps, AI agents.", aliases: ["Artificial Intelligence", "AI"], color: "#8b5cf6", trending: true, featured: true, matchable: true, approved: true, active: true, users: 31240, companies: 4120, jobs: 980, deals: 540 },
  { slug: "cybersecurity", name: "Cybersecurity", parent: "technology", description: "Security software, identity, GRC, threat intel.", aliases: ["InfoSec", "Security"], color: "#ef4444", trending: false, featured: true, matchable: true, approved: true, active: true, users: 8420, companies: 1240, jobs: 320, deals: 110 },
  { slug: "devtools", name: "Developer Tools", parent: "technology", description: "IDEs, CI/CD, observability, infra automation.", aliases: ["DevOps"], color: "#0ea5e9", trending: true, featured: false, matchable: true, approved: true, active: true, users: 11240, companies: 1820, jobs: 280, deals: 90 },
  { slug: "web3", name: "Web3 / Crypto", parent: "technology", description: "Blockchain, DeFi, NFTs, on-chain infra.", aliases: ["Blockchain", "Crypto"], color: "#f97316", trending: false, featured: false, matchable: true, approved: true, active: true, users: 9820, companies: 1410, jobs: 180, deals: 140 },

  { slug: "healthcare", name: "Healthcare", parent: null, description: "Health systems, providers, payers, life sciences.", aliases: ["Health"], color: "#14b8a6", trending: true, featured: true, matchable: true, approved: true, active: true, users: 24820, companies: 3210, jobs: 540, deals: 220 },
  { slug: "healthtech", name: "Healthtech / Digital Health", parent: "healthcare", description: "Telemedicine, EHR, patient apps, digital therapeutics.", aliases: ["Digital Health"], color: "#0d9488", trending: true, featured: true, matchable: true, approved: true, active: true, users: 9820, companies: 1240, jobs: 240, deals: 140 },
  { slug: "biotech", name: "Biotech", parent: "healthcare", description: "Therapeutics, diagnostics, genomics, lab tools.", aliases: ["Biotechnology"], color: "#22c55e", trending: false, featured: true, matchable: true, approved: true, active: true, users: 4210, companies: 820, jobs: 110, deals: 90 },

  { slug: "finance", name: "Financial Services", parent: null, description: "Banks, asset managers, capital markets, insurance.", aliases: ["BFSI"], color: "#0ea5e9", trending: false, featured: true, matchable: true, approved: true, active: true, users: 41210, companies: 6820, jobs: 940, deals: 280 },
  { slug: "venture-capital", name: "Venture Capital", parent: "finance", description: "Funds, angels, syndicates, family offices.", aliases: ["VC"], color: "#6366f1", trending: false, featured: true, matchable: true, approved: true, active: true, users: 4120, companies: 980, jobs: 60, deals: 1240 },

  { slug: "consumer", name: "Consumer & Retail", parent: null, description: "DTC, ecommerce, brands, marketplaces.", aliases: ["Retail", "DTC"], color: "#ec4899", trending: true, featured: true, matchable: true, approved: true, active: true, users: 28420, companies: 4120, jobs: 510, deals: 180 },
  { slug: "ecommerce", name: "Ecommerce", parent: "consumer", description: "Online marketplaces, D2C platforms.", aliases: ["E-commerce"], color: "#f43f5e", trending: true, featured: true, matchable: true, approved: true, active: true, users: 14820, companies: 2410, jobs: 280, deals: 90 },

  { slug: "media", name: "Media & Entertainment", parent: null, description: "Streaming, gaming, publishing, creator economy.", aliases: ["Entertainment"], color: "#a855f7", trending: false, featured: true, matchable: true, approved: true, active: true, users: 18240, companies: 2820, jobs: 320, deals: 110 },
  { slug: "gaming", name: "Gaming", parent: "media", description: "Studios, esports, game infra.", aliases: [], color: "#9333ea", trending: false, featured: false, matchable: true, approved: true, active: true, users: 7240, companies: 1240, jobs: 140, deals: 70 },

  { slug: "education", name: "Education", parent: null, description: "K-12, higher-ed, edtech, professional learning.", aliases: ["EdTech"], color: "#f59e0b", trending: true, featured: true, matchable: true, approved: true, active: true, users: 14820, companies: 1820, jobs: 240, deals: 80 },
  { slug: "real-estate", name: "Real Estate & PropTech", parent: null, description: "Construction, brokerage, proptech, REITs.", aliases: ["PropTech"], color: "#84cc16", trending: false, featured: false, matchable: true, approved: true, active: true, users: 9210, companies: 1820, jobs: 180, deals: 60 },
  { slug: "energy", name: "Energy & Climate", parent: null, description: "Renewables, climate tech, grid, carbon.", aliases: ["CleanTech", "ClimateTech"], color: "#16a34a", trending: true, featured: true, matchable: true, approved: true, active: true, users: 11420, companies: 1640, jobs: 310, deals: 240 },
  { slug: "manufacturing", name: "Manufacturing & Industrial", parent: null, description: "Factories, robotics, supply chain, IoT.", aliases: ["Industrial"], color: "#64748b", trending: false, featured: false, matchable: true, approved: true, active: true, users: 12420, companies: 2240, jobs: 410, deals: 90 },
  { slug: "logistics", name: "Logistics & Mobility", parent: null, description: "Freight, last-mile, mobility, EVs.", aliases: ["Transport", "Mobility"], color: "#0891b2", trending: false, featured: false, matchable: true, approved: true, active: true, users: 8420, companies: 1410, jobs: 220, deals: 70 },
  { slug: "agriculture", name: "Agriculture & FoodTech", parent: null, description: "AgTech, food processing, alt-protein.", aliases: ["AgriTech", "FoodTech"], color: "#65a30d", trending: false, featured: false, matchable: true, approved: true, active: true, users: 4210, companies: 820, jobs: 90, deals: 40 },
  { slug: "professional-services", name: "Professional Services", parent: null, description: "Consulting, legal, accounting, HR services.", aliases: ["Consulting"], color: "#475569", trending: false, featured: false, matchable: true, approved: true, active: true, users: 21420, companies: 3210, jobs: 280, deals: 30 },

  // pending suggestion example
  { slug: "spacetech", name: "SpaceTech", parent: null, description: "Launch, satellites, space data — suggested by user.", aliases: ["Space"], color: "#1e40af", trending: false, featured: false, matchable: true, approved: false, active: true, users: 240, companies: 60, jobs: 8, deals: 4 },
];

const seed: Industry[] = seedRaw.map((s, i) => ({ ...s, id: String(i + 1) }));

const blank = (): Industry => ({
  id: "",
  slug: "",
  name: "",
  parent: null,
  description: "",
  aliases: [],
  color: "#6366f1",
  trending: false,
  featured: false,
  matchable: true,
  approved: true,
  active: true,
  users: 0,
  companies: 0,
  jobs: 0,
  deals: 0,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function IndustryTags() {
  const [items, setItems] = useState<Industry[]>(seed);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("All");
  const [status, setStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Industry | null>(null);
  const [draft, setDraft] = useState<Industry>(blank());
  const [confirmDel, setConfirmDel] = useState<Industry | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<string>("");

  const parents = useMemo(() => items.filter((i) => i.parent === null), [items]);
  const childMap = useMemo(() => {
    const m: Record<string, Industry[]> = {};
    items.forEach((i) => {
      if (i.parent) (m[i.parent] ??= []).push(i);
    });
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (parentFilter !== "All") {
        if (parentFilter === "__top") {
          if (i.parent !== null) return false;
        } else if (i.parent !== parentFilter && i.slug !== parentFilter) return false;
      }
      if (status === "active" && !i.active) return false;
      if (status === "inactive" && i.active) return false;
      if (status === "pending" && i.approved) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.name.toLowerCase().includes(q) &&
          !i.slug.toLowerCase().includes(q) &&
          !i.aliases.join(",").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [items, search, parentFilter, status]);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.active).length;
    const trending = items.filter((i) => i.trending).length;
    const pending = items.filter((i) => !i.approved).length;
    const tagged = items.reduce((s, i) => s + i.users, 0);
    return { active, trending, pending, tagged };
  }, [items]);

  function openNew() { setEditing(null); setDraft(blank()); setOpen(true); }
  function openEdit(i: Industry) { setEditing(i); setDraft({ ...i, aliases: [...i.aliases] }); setOpen(true); }

  function save() {
    const slug = draft.slug.trim() || slugify(draft.name);
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
    if (!slug) { toast.error("Slug is required"); return; }
    const dup = items.find((i) => i.slug === slug && i.id !== editing?.id);
    if (dup) { toast.error(`Slug "${slug}" already exists`); return; }
    if (draft.parent === slug) { toast.error("A tag cannot be its own parent"); return; }

    if (editing) {
      setItems((prev) => prev.map((i) => i.id === editing.id ? { ...draft, slug, id: editing.id } : i));
      toast.success(`${draft.name} updated`);
    } else {
      setItems((prev) => [...prev, { ...draft, slug, id: Date.now().toString() }]);
      toast.success(`${draft.name} added`);
    }
    setOpen(false);
  }

  function remove(i: Industry) {
    const hasChildren = items.some((x) => x.parent === i.slug);
    if (hasChildren) { toast.error("Remove or reassign sub-tags first"); return; }
    setItems((prev) => prev.filter((x) => x.id !== i.id));
    setSelected((prev) => { const n = new Set(prev); n.delete(i.id); return n; });
    toast.success(`${i.name} removed`);
    setConfirmDel(null);
  }

  function toggle(id: string, key: keyof Industry) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [key]: !i[key] } : i));
  }

  function approve(i: Industry) {
    setItems((prev) => prev.map((x) => x.id === i.id ? { ...x, approved: true } : x));
    toast.success(`${i.name} approved`);
  }

  function toggleSel(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function bulkActivate(active: boolean) {
    if (selected.size === 0) return;
    setItems((prev) => prev.map((i) => selected.has(i.id) ? { ...i, active } : i));
    toast.success(`${selected.size} tags ${active ? "activated" : "deactivated"}`);
    setSelected(new Set());
  }

  function doMerge() {
    if (!mergeTarget || selected.size === 0) return;
    const target = items.find((i) => i.slug === mergeTarget);
    if (!target) return;
    let mergedUsers = target.users, mergedCompanies = target.companies, mergedJobs = target.jobs, mergedDeals = target.deals;
    items.forEach((i) => {
      if (selected.has(i.id) && i.slug !== mergeTarget) {
        mergedUsers += i.users; mergedCompanies += i.companies; mergedJobs += i.jobs; mergedDeals += i.deals;
      }
    });
    setItems((prev) =>
      prev
        .map((i) => i.slug === mergeTarget ? { ...i, users: mergedUsers, companies: mergedCompanies, jobs: mergedJobs, deals: mergedDeals } : i)
        .filter((i) => !(selected.has(i.id) && i.slug !== mergeTarget))
    );
    toast.success(`Merged ${selected.size} tags into ${target.name}`);
    setSelected(new Set());
    setMergeOpen(false);
    setMergeTarget("");
  }

  function exportCsv() {
    const rows = [
      ["slug", "name", "parent", "aliases", "trending", "featured", "matchable", "approved", "active", "users", "companies", "jobs", "deals"],
      ...items.map((i) => [
        i.slug, i.name, i.parent ?? "", i.aliases.join("|"),
        i.trending, i.featured, i.matchable, i.approved, i.active,
        i.users, i.companies, i.jobs, i.deals,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zynking-industries.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Industry tags exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Industry / Sector Tags</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Industry / Sector Tags</h1>
          <p className="text-sm text-muted-foreground">
            Curate the taxonomy that powers matching, search, deal flow, and analytics across Zynk.ing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info("CSV import coming soon")}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Tag
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Tags" value={items.length} icon={<Tag className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} accent />
        <StatCard label="Trending" value={stats.trending} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Pending Review" value={stats.pending} />
        <StatCard label="Tagged Users" value={stats.tagged.toLocaleString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taxonomy preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {parents.filter((p) => p.active).slice(0, 6).map((p) => (
              <div key={p.id} className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-medium text-sm">{p.name}</span>
                  {p.trending && <Badge variant="secondary" className="ml-auto gap-1 text-[10px]"><TrendingUp className="h-3 w-3" />trending</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(childMap[p.slug] ?? []).map((c) => (
                    <Badge key={c.id} variant="outline" className="text-[10px]" style={{ borderColor: `${c.color}55`, color: c.color }}>
                      {c.name}
                    </Badge>
                  ))}
                  {!childMap[p.slug] && <span className="text-xs text-muted-foreground">No sub-tags</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">All tags ({filtered.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name, slug, alias…" className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All sectors</SelectItem>
                <SelectItem value="__top">Top-level only</SelectItem>
                {parents.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selected.size > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span>{selected.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkActivate(true)}>Activate</Button>
                <Button size="sm" variant="outline" onClick={() => bulkActivate(false)}>Deactivate</Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setMergeOpen(true)}>
                  <Merge className="h-3.5 w-3.5" /> Merge
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
              </div>
            </div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Aliases</TableHead>
                  <TableHead>Trending</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Matchable</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => {
                  const parent = items.find((p) => p.slug === i.parent);
                  return (
                    <TableRow key={i.id} className={!i.active ? "opacity-60" : ""}>
                      <TableCell>
                        <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggleSel(i.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: i.color }} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-medium text-sm">
                              {i.name}
                              {!i.approved && <Badge variant="secondary" className="text-[10px]">pending</Badge>}
                              {i.featured && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{i.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{parent?.name ?? <span className="italic">— top —</span>}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {i.aliases.slice(0, 2).map((a) => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}
                          {i.aliases.length > 2 && <span className="text-xs text-muted-foreground">+{i.aliases.length - 2}</span>}
                        </div>
                      </TableCell>
                      <TableCell><Switch checked={i.trending} onCheckedChange={() => toggle(i.id, "trending")} /></TableCell>
                      <TableCell><Switch checked={i.featured} onCheckedChange={() => toggle(i.id, "featured")} /></TableCell>
                      <TableCell><Switch checked={i.matchable} onCheckedChange={() => toggle(i.id, "matchable")} /></TableCell>
                      <TableCell className="text-xs tabular-nums">{i.users.toLocaleString()}</TableCell>
                      <TableCell className="text-xs tabular-nums">{i.jobs.toLocaleString()}</TableCell>
                      <TableCell className="text-xs tabular-nums">{i.deals.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!i.approved && (
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-emerald-600" onClick={() => approve(i)}>Approve</Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDel(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                      No tags match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aliases boost search recall. Featured tags surface in onboarding. Merge collapses duplicates and sums their users.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit tag" : "Add tag"}</DialogTitle>
            <DialogDescription>Tags drive matching, deal-flow filters, and user discovery.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} placeholder="Fintech" />
            </Field>
            <Field label="Slug">
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} placeholder="fintech" />
            </Field>
            <Field label="Parent sector">
              <Select value={draft.parent ?? "__none"} onValueChange={(v) => setDraft({ ...draft, parent: v === "__none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— top-level —</SelectItem>
                  {parents.filter((p) => p.id !== editing?.id).map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Color">
              <div className="flex gap-2">
                <Input type="color" className="w-14 p-1 h-10" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
                <Input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short description shown in tooltips and search" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Aliases (comma separated)">
                <Input
                  value={draft.aliases.join(", ")}
                  onChange={(e) => setDraft({ ...draft, aliases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Financial Technology, FinTech"
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
            <ToggleRow label="Trending" desc="Show trending badge & boost in discovery" checked={draft.trending} onChange={(v) => setDraft({ ...draft, trending: v })} />
            <ToggleRow label="Featured" desc="Surface in onboarding & directories" checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
            <ToggleRow label="Matchable" desc="Used by the matching engine" checked={draft.matchable} onChange={(v) => setDraft({ ...draft, matchable: v })} />
            <ToggleRow label="Approved" desc="Verified — not pending moderator review" checked={draft.approved} onChange={(v) => setDraft({ ...draft, approved: v })} />
            <ToggleRow label="Active" desc="Inactive tags are hidden everywhere" checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add tag"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge {selected.size} tags</DialogTitle>
            <DialogDescription>
              All selected tags will be merged into the chosen target. Their users, jobs, and deals counts will be summed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Merge into</Label>
            <Select value={mergeTarget} onValueChange={setMergeTarget}>
              <SelectTrigger><SelectValue placeholder="Select target tag" /></SelectTrigger>
              <SelectContent>
                {items.filter((i) => selected.has(i.id)).map((i) => <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeOpen(false)}>Cancel</Button>
            <Button onClick={doMerge} disabled={!mergeTarget}>Merge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel?.users.toLocaleString()} users have this tag. They will lose this association. This cannot be undone.
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
