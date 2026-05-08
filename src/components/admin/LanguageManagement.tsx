import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Languages,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

type Language = {
  id: string;
  code: string; // ISO 639-1
  name: string; // English name
  nativeName: string;
  region: "Global" | "Asia" | "Europe" | "Americas" | "Africa" | "Oceania" | "Middle East";
  direction: "ltr" | "rtl";
  uiEnabled: boolean;
  contentEnabled: boolean; // user-generated content / posts
  aiEnabled: boolean; // AI translate, pitch coach, profile enhancer
  emailEnabled: boolean; // transactional templates
  isDefault: boolean;
  fallback: string; // code
  translationCoverage: number; // 0-100
  users: number;
  active: boolean;
};

const seed: Language[] = [
  { id: "1", code: "en", name: "English", nativeName: "English", region: "Global", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: true, fallback: "en", translationCoverage: 100, users: 184320, active: true },
  { id: "2", code: "es", name: "Spanish", nativeName: "Español", region: "Europe", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 96, users: 52140, active: true },
  { id: "3", code: "fr", name: "French", nativeName: "Français", region: "Europe", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 94, users: 38210, active: true },
  { id: "4", code: "de", name: "German", nativeName: "Deutsch", region: "Europe", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 92, users: 27440, active: true },
  { id: "5", code: "pt", name: "Portuguese", nativeName: "Português", region: "Americas", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 88, users: 31980, active: true },
  { id: "6", code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "Asia", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 85, users: 64210, active: true },
  { id: "7", code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", region: "Asia", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 90, users: 41230, active: true },
  { id: "8", code: "ja", name: "Japanese", nativeName: "日本語", region: "Asia", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 82, users: 18760, active: true },
  { id: "9", code: "ko", name: "Korean", nativeName: "한국어", region: "Asia", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: false, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 70, users: 9420, active: true },
  { id: "10", code: "ar", name: "Arabic", nativeName: "العربية", region: "Middle East", direction: "rtl", uiEnabled: true, contentEnabled: true, aiEnabled: true, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 78, users: 23110, active: true },
  { id: "11", code: "he", name: "Hebrew", nativeName: "עברית", region: "Middle East", direction: "rtl", uiEnabled: true, contentEnabled: true, aiEnabled: false, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 65, users: 4310, active: true },
  { id: "12", code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "Asia", direction: "ltr", uiEnabled: true, contentEnabled: true, aiEnabled: false, emailEnabled: true, isDefault: false, fallback: "en", translationCoverage: 72, users: 14820, active: true },
  { id: "13", code: "ru", name: "Russian", nativeName: "Русский", region: "Europe", direction: "ltr", uiEnabled: false, contentEnabled: true, aiEnabled: false, emailEnabled: false, isDefault: false, fallback: "en", translationCoverage: 40, users: 2150, active: false },
  { id: "14", code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "Africa", direction: "ltr", uiEnabled: false, contentEnabled: true, aiEnabled: false, emailEnabled: false, isDefault: false, fallback: "en", translationCoverage: 25, users: 880, active: false },
];

const regions = ["All", "Global", "Asia", "Europe", "Americas", "Africa", "Oceania", "Middle East"] as const;

const blank = (): Language => ({
  id: "",
  code: "",
  name: "",
  nativeName: "",
  region: "Global",
  direction: "ltr",
  uiEnabled: true,
  contentEnabled: true,
  aiEnabled: false,
  emailEnabled: false,
  isDefault: false,
  fallback: "en",
  translationCoverage: 0,
  users: 0,
  active: true,
});

export function LanguageManagement() {
  const [items, setItems] = useState<Language[]>(seed);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<(typeof regions)[number]>("All");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [draft, setDraft] = useState<Language>(blank());
  const [confirmDel, setConfirmDel] = useState<Language | null>(null);

  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (region !== "All" && l.region !== region) return false;
      if (status === "active" && !l.active) return false;
      if (status === "inactive" && l.active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.nativeName.toLowerCase().includes(q) &&
          !l.code.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [items, search, region, status]);

  const stats = useMemo(() => {
    const active = items.filter((l) => l.active).length;
    const ui = items.filter((l) => l.uiEnabled).length;
    const ai = items.filter((l) => l.aiEnabled).length;
    const users = items.reduce((s, l) => s + l.users, 0);
    const avgCov = Math.round(
      items.reduce((s, l) => s + l.translationCoverage, 0) / items.length,
    );
    return { active, ui, ai, users, avgCov };
  }, [items]);

  function openNew() {
    setEditing(null);
    setDraft(blank());
    setOpen(true);
  }
  function openEdit(l: Language) {
    setEditing(l);
    setDraft({ ...l });
    setOpen(true);
  }

  function save() {
    if (!draft.code.trim() || draft.code.length < 2) {
      toast.error("ISO 639-1 code is required (2+ chars)");
      return;
    }
    if (!draft.name.trim() || !draft.nativeName.trim()) {
      toast.error("Name and native name are required");
      return;
    }
    const code = draft.code.toLowerCase();
    const dup = items.find((l) => l.code === code && l.id !== editing?.id);
    if (dup) {
      toast.error(`Language code "${code}" already exists`);
      return;
    }

    if (editing) {
      setItems((prev) =>
        prev.map((l) =>
          l.id === editing.id
            ? { ...draft, code, id: editing.id }
            : draft.isDefault
              ? { ...l, isDefault: false }
              : l,
        ),
      );
      toast.success(`${draft.name} updated`);
    } else {
      const next: Language = { ...draft, code, id: Date.now().toString() };
      setItems((prev) =>
        draft.isDefault
          ? [...prev.map((l) => ({ ...l, isDefault: false })), next]
          : [...prev, next],
      );
      toast.success(`${draft.name} added`);
    }
    setOpen(false);
  }

  function remove(l: Language) {
    if (l.isDefault) {
      toast.error("Cannot delete the default language");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== l.id));
    toast.success(`${l.name} removed`);
    setConfirmDel(null);
  }

  function toggle(id: string, key: keyof Language) {
    setItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: !l[key] } : l)),
    );
  }

  function makeDefault(l: Language) {
    setItems((prev) =>
      prev.map((i) => ({ ...i, isDefault: i.id === l.id, active: i.id === l.id ? true : i.active })),
    );
    toast.success(`${l.name} is now the default language`);
  }

  function exportCsv() {
    const rows = [
      ["code", "name", "nativeName", "region", "direction", "uiEnabled", "contentEnabled", "aiEnabled", "emailEnabled", "isDefault", "fallback", "coverage", "users", "active"],
      ...items.map((l) => [
        l.code, l.name, l.nativeName, l.region, l.direction,
        l.uiEnabled, l.contentEnabled, l.aiEnabled, l.emailEnabled,
        l.isDefault, l.fallback, l.translationCoverage, l.users, l.active,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zynking-languages.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Languages exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Language Management</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Language Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure languages, translation coverage, RTL, and per-module availability across Zynk.ing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Language
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={items.length} icon={<Languages className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} accent />
        <StatCard label="UI Enabled" value={stats.ui} />
        <StatCard label="AI Enabled" value={stats.ai} />
        <StatCard label="Avg Coverage" value={`${stats.avgCov}%`} />
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Languages ({filtered.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name or code…"
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={region} onValueChange={(v) => setRegion(v as typeof region)}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
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
                  <TableHead>Language</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead className="w-[180px]">Coverage</TableHead>
                  <TableHead>UI</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id} className={!l.active ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase">
                          {l.code}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium">
                            {l.name}
                            {l.isDefault && (
                              <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                                <Star className="h-3 w-3" /> default
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{l.nativeName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{l.code}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.region}</TableCell>
                    <TableCell>
                      <Badge variant={l.direction === "rtl" ? "default" : "outline"} className="text-[10px] uppercase">
                        {l.direction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={l.translationCoverage} className="h-1.5" />
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                          {l.translationCoverage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell><Switch checked={l.uiEnabled} onCheckedChange={() => toggle(l.id, "uiEnabled")} /></TableCell>
                    <TableCell><Switch checked={l.contentEnabled} onCheckedChange={() => toggle(l.id, "contentEnabled")} /></TableCell>
                    <TableCell><Switch checked={l.aiEnabled} onCheckedChange={() => toggle(l.id, "aiEnabled")} /></TableCell>
                    <TableCell><Switch checked={l.emailEnabled} onCheckedChange={() => toggle(l.id, "emailEnabled")} /></TableCell>
                    <TableCell className="text-xs tabular-nums">{l.users.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!l.isDefault && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => makeDefault(l)} title="Set as default">
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDel(l)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                      No languages match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Toggles update instantly. Connect Lovable Cloud to persist changes and sync with the i18n service.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit language" : "Add language"}</DialogTitle>
            <DialogDescription>
              Use ISO 639-1 codes (e.g. en, es, hi). Coverage controls how complete translations are.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ISO Code">
              <Input value={draft.code} maxLength={5} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="en" />
            </Field>
            <Field label="Region">
              <Select value={draft.region} onValueChange={(v) => setDraft({ ...draft, region: v as Language["region"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.filter((r) => r !== "All").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Name (English)">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="English" />
            </Field>
            <Field label="Native name">
              <Input value={draft.nativeName} onChange={(e) => setDraft({ ...draft, nativeName: e.target.value })} placeholder="English" />
            </Field>
            <Field label="Direction">
              <Select value={draft.direction} onValueChange={(v) => setDraft({ ...draft, direction: v as "ltr" | "rtl" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ltr">Left-to-right</SelectItem>
                  <SelectItem value="rtl">Right-to-left</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fallback language">
              <Select value={draft.fallback} onValueChange={(v) => setDraft({ ...draft, fallback: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {items.map((l) => <SelectItem key={l.code} value={l.code}>{l.name} ({l.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={`Translation coverage (${draft.translationCoverage}%)`}>
              <Input
                type="range" min={0} max={100}
                value={draft.translationCoverage}
                onChange={(e) => setDraft({ ...draft, translationCoverage: Number(e.target.value) })}
              />
            </Field>
            <Field label="Active users">
              <Input type="number" value={draft.users} onChange={(e) => setDraft({ ...draft, users: Number(e.target.value) })} />
            </Field>
          </div>

          <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
            <ToggleRow label="UI translation" desc="Show this language in the app UI" checked={draft.uiEnabled} onChange={(v) => setDraft({ ...draft, uiEnabled: v })} />
            <ToggleRow label="User content" desc="Allow posts / profiles in this language" checked={draft.contentEnabled} onChange={(v) => setDraft({ ...draft, contentEnabled: v })} />
            <ToggleRow label="AI features" desc="Pitch coach, profile enhancer, translate" checked={draft.aiEnabled} onChange={(v) => setDraft({ ...draft, aiEnabled: v })} />
            <ToggleRow label="Email templates" desc="Transactional emails localized" checked={draft.emailEnabled} onChange={(v) => setDraft({ ...draft, emailEnabled: v })} />
            <ToggleRow label="Default language" desc="Used when no preference is set" checked={draft.isDefault} onChange={(v) => setDraft({ ...draft, isDefault: v })} />
            <ToggleRow label="Active" desc="Inactive languages are hidden everywhere" checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add language"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Users currently set to this language will fall back to {confirmDel?.fallback.toUpperCase()}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && remove(confirmDel)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
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
