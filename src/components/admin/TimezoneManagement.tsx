import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

type Timezone = {
  id: string;
  iana: string; // IANA name e.g. "Asia/Kolkata"
  label: string; // friendly label
  region: "Africa" | "Americas" | "Asia" | "Europe" | "Oceania" | "Middle East" | "Pacific";
  countries: string[]; // ISO-2 list
  utcOffsetMin: number; // standard offset in minutes
  dst: boolean;
  businessHoursStart: string; // "09:00"
  businessHoursEnd: string; // "18:00"
  schedulingEnabled: boolean; // available for mentor / event scheduling
  notificationsEnabled: boolean; // quiet hours respected
  isDefault: boolean;
  active: boolean;
  users: number;
};

const seed: Timezone[] = [
  { id: "1", iana: "UTC", label: "Coordinated Universal Time", region: "Europe", countries: [], utcOffsetMin: 0, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: true, active: true, users: 12450 },
  { id: "2", iana: "America/Los_Angeles", label: "Pacific Time", region: "Americas", countries: ["US", "CA"], utcOffsetMin: -480, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 38420 },
  { id: "3", iana: "America/New_York", label: "Eastern Time", region: "Americas", countries: ["US", "CA"], utcOffsetMin: -300, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 64210 },
  { id: "4", iana: "America/Chicago", label: "Central Time", region: "Americas", countries: ["US"], utcOffsetMin: -360, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 24180 },
  { id: "5", iana: "America/Sao_Paulo", label: "Brasília Time", region: "Americas", countries: ["BR"], utcOffsetMin: -180, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 18920 },
  { id: "6", iana: "Europe/London", label: "Greenwich Mean Time", region: "Europe", countries: ["GB", "IE"], utcOffsetMin: 0, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 41320 },
  { id: "7", iana: "Europe/Berlin", label: "Central European Time", region: "Europe", countries: ["DE", "FR", "NL", "ES", "IT"], utcOffsetMin: 60, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 52410 },
  { id: "8", iana: "Africa/Lagos", label: "West Africa Time", region: "Africa", countries: ["NG"], utcOffsetMin: 60, dst: false, businessHoursStart: "08:00", businessHoursEnd: "17:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 9120 },
  { id: "9", iana: "Asia/Dubai", label: "Gulf Standard Time", region: "Middle East", countries: ["AE", "OM"], utcOffsetMin: 240, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 14820 },
  { id: "10", iana: "Asia/Kolkata", label: "India Standard Time", region: "Asia", countries: ["IN"], utcOffsetMin: 330, dst: false, businessHoursStart: "10:00", businessHoursEnd: "19:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 86420 },
  { id: "11", iana: "Asia/Singapore", label: "Singapore Time", region: "Asia", countries: ["SG", "MY"], utcOffsetMin: 480, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 21340 },
  { id: "12", iana: "Asia/Shanghai", label: "China Standard Time", region: "Asia", countries: ["CN"], utcOffsetMin: 480, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 32140 },
  { id: "13", iana: "Asia/Tokyo", label: "Japan Standard Time", region: "Asia", countries: ["JP"], utcOffsetMin: 540, dst: false, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 17820 },
  { id: "14", iana: "Australia/Sydney", label: "Australian Eastern Time", region: "Oceania", countries: ["AU"], utcOffsetMin: 600, dst: true, businessHoursStart: "09:00", businessHoursEnd: "18:00", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 15240 },
  { id: "15", iana: "Pacific/Auckland", label: "New Zealand Time", region: "Pacific", countries: ["NZ"], utcOffsetMin: 720, dst: true, businessHoursStart: "09:00", businessHoursEnd: "17:30", schedulingEnabled: true, notificationsEnabled: true, isDefault: false, active: true, users: 4120 },
];

const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Middle East", "Oceania", "Pacific"] as const;

const blank = (): Timezone => ({
  id: "",
  iana: "",
  label: "",
  region: "Europe",
  countries: [],
  utcOffsetMin: 0,
  dst: false,
  businessHoursStart: "09:00",
  businessHoursEnd: "18:00",
  schedulingEnabled: true,
  notificationsEnabled: true,
  isDefault: false,
  active: true,
  users: 0,
});

function offsetLabel(min: number) {
  const sign = min >= 0 ? "+" : "-";
  const abs = Math.abs(min);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

function localTimeIn(iana: string, now: Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: iana,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return "—";
  }
}

export function TimezoneManagement() {
  const [items, setItems] = useState<Timezone[]>(seed);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<(typeof regions)[number]>("All");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Timezone | null>(null);
  const [draft, setDraft] = useState<Timezone>(blank());
  const [confirmDel, setConfirmDel] = useState<Timezone | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (region !== "All" && t.region !== region) return false;
      if (status === "active" && !t.active) return false;
      if (status === "inactive" && t.active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.iana.toLowerCase().includes(q) &&
          !t.label.toLowerCase().includes(q) &&
          !t.countries.join(",").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [items, search, region, status]);

  const stats = useMemo(() => {
    const active = items.filter((t) => t.active).length;
    const sched = items.filter((t) => t.schedulingEnabled).length;
    const dst = items.filter((t) => t.dst).length;
    const users = items.reduce((s, t) => s + t.users, 0);
    return { active, sched, dst, users };
  }, [items]);

  function openNew() {
    setEditing(null);
    setDraft(blank());
    setOpen(true);
  }
  function openEdit(t: Timezone) {
    setEditing(t);
    setDraft({ ...t, countries: [...t.countries] });
    setOpen(true);
  }

  function save() {
    if (!draft.iana.trim() || !draft.iana.includes("/") && draft.iana !== "UTC") {
      toast.error("Enter a valid IANA name (e.g. Asia/Kolkata or UTC)");
      return;
    }
    if (!draft.label.trim()) {
      toast.error("Friendly label is required");
      return;
    }
    const dup = items.find((t) => t.iana === draft.iana && t.id !== editing?.id);
    if (dup) {
      toast.error(`Timezone "${draft.iana}" already exists`);
      return;
    }

    if (editing) {
      setItems((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? { ...draft, id: editing.id }
            : draft.isDefault
              ? { ...t, isDefault: false }
              : t,
        ),
      );
      toast.success(`${draft.iana} updated`);
    } else {
      const next: Timezone = { ...draft, id: Date.now().toString() };
      setItems((prev) =>
        draft.isDefault
          ? [...prev.map((t) => ({ ...t, isDefault: false })), next]
          : [...prev, next],
      );
      toast.success(`${draft.iana} added`);
    }
    setOpen(false);
  }

  function remove(t: Timezone) {
    if (t.isDefault) {
      toast.error("Cannot delete the default timezone");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== t.id));
    toast.success(`${t.iana} removed`);
    setConfirmDel(null);
  }

  function toggle(id: string, key: keyof Timezone) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: !t[key] } : t)),
    );
  }

  function makeDefault(t: Timezone) {
    setItems((prev) =>
      prev.map((i) => ({ ...i, isDefault: i.id === t.id, active: i.id === t.id ? true : i.active })),
    );
    toast.success(`${t.iana} is now the default timezone`);
  }

  function detectBrowserTz() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDraft((d) => ({ ...d, iana: tz, label: d.label || tz.replace(/_/g, " ") }));
    toast.success(`Detected ${tz}`);
  }

  function exportCsv() {
    const rows = [
      ["iana", "label", "region", "countries", "offset", "dst", "bhStart", "bhEnd", "scheduling", "notifications", "default", "active", "users"],
      ...items.map((t) => [
        t.iana, t.label, t.region, t.countries.join("|"), offsetLabel(t.utcOffsetMin),
        t.dst, t.businessHoursStart, t.businessHoursEnd,
        t.schedulingEnabled, t.notificationsEnabled, t.isDefault, t.active, t.users,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zynking-timezones.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timezones exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Timezone Management</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timezone Management</h1>
          <p className="text-sm text-muted-foreground">
            Control IANA timezones, business hours, DST behavior, and per-module availability for global scheduling on Zynk.ing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Timezone
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={items.length} icon={<Globe2 className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} accent />
        <StatCard label="Scheduling On" value={stats.sched} />
        <StatCard label="Observes DST" value={stats.dst} />
        <StatCard label="Users" value={stats.users.toLocaleString()} />
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Timezones ({filtered.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search IANA, label, country…"
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
                  <TableHead>Timezone</TableHead>
                  <TableHead>Offset</TableHead>
                  <TableHead>Local time</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Business hours</TableHead>
                  <TableHead>DST</TableHead>
                  <TableHead>Scheduling</TableHead>
                  <TableHead>Notifications</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id} className={!t.active ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="truncate">{t.iana}</span>
                            {t.isDefault && (
                              <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                                <Star className="h-3 w-3" /> default
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {t.label}
                            {t.countries.length > 0 && <> · {t.countries.join(", ")}</>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{offsetLabel(t.utcOffsetMin)}</TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{localTimeIn(t.iana, now)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.region}</TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {t.businessHoursStart} – {t.businessHoursEnd}
                    </TableCell>
                    <TableCell><Switch checked={t.dst} onCheckedChange={() => toggle(t.id, "dst")} /></TableCell>
                    <TableCell><Switch checked={t.schedulingEnabled} onCheckedChange={() => toggle(t.id, "schedulingEnabled")} /></TableCell>
                    <TableCell><Switch checked={t.notificationsEnabled} onCheckedChange={() => toggle(t.id, "notificationsEnabled")} /></TableCell>
                    <TableCell className="text-xs tabular-nums">{t.users.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!t.isDefault && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => makeDefault(t)} title="Set as default">
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDel(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                      No timezones match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Local times update automatically. Business hours drive default mentor / event slots and quiet-hour notifications.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit timezone" : "Add timezone"}</DialogTitle>
            <DialogDescription>
              Use IANA names (e.g. <span className="font-mono">Asia/Kolkata</span>). Offset is the standard (non-DST) offset in minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IANA name">
              <div className="flex gap-2">
                <Input value={draft.iana} onChange={(e) => setDraft({ ...draft, iana: e.target.value })} placeholder="Asia/Kolkata" />
                <Button type="button" variant="outline" size="sm" onClick={detectBrowserTz}>Detect</Button>
              </div>
            </Field>
            <Field label="Friendly label">
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="India Standard Time" />
            </Field>
            <Field label="Region">
              <Select value={draft.region} onValueChange={(v) => setDraft({ ...draft, region: v as Timezone["region"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.filter((r) => r !== "All").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Countries (ISO-2, comma)">
              <Input
                value={draft.countries.join(", ")}
                onChange={(e) => setDraft({ ...draft, countries: e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) })}
                placeholder="IN, LK"
              />
            </Field>
            <Field label={`UTC offset (minutes) · ${offsetLabel(draft.utcOffsetMin)}`}>
              <Input type="number" step={15} value={draft.utcOffsetMin} onChange={(e) => setDraft({ ...draft, utcOffsetMin: Number(e.target.value) })} />
            </Field>
            <Field label="Active users">
              <Input type="number" value={draft.users} onChange={(e) => setDraft({ ...draft, users: Number(e.target.value) })} />
            </Field>
            <Field label="Business hours start">
              <Input type="time" value={draft.businessHoursStart} onChange={(e) => setDraft({ ...draft, businessHoursStart: e.target.value })} />
            </Field>
            <Field label="Business hours end">
              <Input type="time" value={draft.businessHoursEnd} onChange={(e) => setDraft({ ...draft, businessHoursEnd: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
            <ToggleRow label="Observes DST" desc="Automatically shift offset for daylight saving" checked={draft.dst} onChange={(v) => setDraft({ ...draft, dst: v })} />
            <ToggleRow label="Scheduling" desc="Available for mentor sessions & events" checked={draft.schedulingEnabled} onChange={(v) => setDraft({ ...draft, schedulingEnabled: v })} />
            <ToggleRow label="Notifications" desc="Respect quiet hours for this zone" checked={draft.notificationsEnabled} onChange={(v) => setDraft({ ...draft, notificationsEnabled: v })} />
            <ToggleRow label="Default timezone" desc="Used when user has no preference" checked={draft.isDefault} onChange={(v) => setDraft({ ...draft, isDefault: v })} />
            <ToggleRow label="Active" desc="Inactive zones are hidden from pickers" checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add timezone"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.iana}?</AlertDialogTitle>
            <AlertDialogDescription>
              Users on this timezone will fall back to the platform default. Existing meeting times stay anchored to UTC.
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
