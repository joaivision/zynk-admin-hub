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
  Globe2,
  CheckCircle2,
  XCircle,
  Filter,
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

export type Country = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  dialCode: string;
  currency: string;
  region: "Africa" | "Americas" | "Asia" | "Europe" | "Oceania";
  defaultLanguage: string;
  kycRequired: boolean;
  paymentsEnabled: boolean;
  investorEligible: boolean;
  active: boolean;
  users: number;
};

const seed: Country[] = [
  { id: "1", name: "United States", iso2: "US", iso3: "USA", dialCode: "+1", currency: "USD", region: "Americas", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 12840 },
  { id: "2", name: "United Kingdom", iso2: "GB", iso3: "GBR", dialCode: "+44", currency: "GBP", region: "Europe", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 5320 },
  { id: "3", name: "India", iso2: "IN", iso3: "IND", dialCode: "+91", currency: "INR", region: "Asia", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 18920 },
  { id: "4", name: "Singapore", iso2: "SG", iso3: "SGP", dialCode: "+65", currency: "SGD", region: "Asia", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 2410 },
  { id: "5", name: "United Arab Emirates", iso2: "AE", iso3: "ARE", dialCode: "+971", currency: "AED", region: "Asia", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 1980 },
  { id: "6", name: "Germany", iso2: "DE", iso3: "DEU", dialCode: "+49", currency: "EUR", region: "Europe", defaultLanguage: "de", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 3120 },
  { id: "7", name: "France", iso2: "FR", iso3: "FRA", dialCode: "+33", currency: "EUR", region: "Europe", defaultLanguage: "fr", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 2210 },
  { id: "8", name: "Brazil", iso2: "BR", iso3: "BRA", dialCode: "+55", currency: "BRL", region: "Americas", defaultLanguage: "pt", kycRequired: true, paymentsEnabled: true, investorEligible: false, active: true, users: 1640 },
  { id: "9", name: "Nigeria", iso2: "NG", iso3: "NGA", dialCode: "+234", currency: "NGN", region: "Africa", defaultLanguage: "en", kycRequired: true, paymentsEnabled: false, investorEligible: false, active: true, users: 980 },
  { id: "10", name: "Australia", iso2: "AU", iso3: "AUS", dialCode: "+61", currency: "AUD", region: "Oceania", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 1410 },
  { id: "11", name: "Canada", iso2: "CA", iso3: "CAN", dialCode: "+1", currency: "CAD", region: "Americas", defaultLanguage: "en", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: true, users: 2530 },
  { id: "12", name: "Japan", iso2: "JP", iso3: "JPN", dialCode: "+81", currency: "JPY", region: "Asia", defaultLanguage: "ja", kycRequired: true, paymentsEnabled: true, investorEligible: true, active: false, users: 760 },
];

const empty: Omit<Country, "id" | "users"> = {
  name: "",
  iso2: "",
  iso3: "",
  dialCode: "",
  currency: "USD",
  region: "Asia",
  defaultLanguage: "en",
  kycRequired: true,
  paymentsEnabled: true,
  investorEligible: false,
  active: true,
};

export function CountryManagement() {
  const [countries, setCountries] = useState<Country[]>(seed);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Country | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(empty);
  const [deleting, setDeleting] = useState<Country | null>(null);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.iso3.toLowerCase().includes(q) ||
        c.dialCode.includes(q);
      const matchR = region === "all" || c.region === region;
      const matchS =
        status === "all" ||
        (status === "active" && c.active) ||
        (status === "inactive" && !c.active);
      return matchQ && matchR && matchS;
    });
  }, [countries, query, region, status]);

  const stats = useMemo(() => {
    return {
      total: countries.length,
      active: countries.filter((c) => c.active).length,
      payments: countries.filter((c) => c.paymentsEnabled).length,
      investor: countries.filter((c) => c.investorEligible).length,
      users: countries.reduce((s, c) => s + c.users, 0),
    };
  }, [countries]);

  function openCreate() {
    setDraft(empty);
    setCreating(true);
  }
  function openEdit(c: Country) {
    setDraft({ ...c });
    setEditing(c);
  }
  function saveDraft() {
    if (!draft.name || !draft.iso2 || !draft.iso3) {
      toast.error("Name, ISO-2 and ISO-3 are required");
      return;
    }
    if (editing) {
      setCountries((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...editing, ...draft } : c)),
      );
      toast.success(`${draft.name} updated`);
      setEditing(null);
    } else {
      const id = (Math.max(0, ...countries.map((c) => +c.id)) + 1).toString();
      setCountries((prev) => [{ id, users: 0, ...draft }, ...prev]);
      toast.success(`${draft.name} added`);
      setCreating(false);
    }
  }
  function toggle(id: string, key: keyof Country) {
    setCountries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: !c[key] } : c)),
    );
  }
  function remove() {
    if (!deleting) return;
    setCountries((prev) => prev.filter((c) => c.id !== deleting.id));
    toast.success(`${deleting.name} removed`);
    setDeleting(null);
  }
  function exportCsv() {
    const header = "name,iso2,iso3,dial_code,currency,region,language,kyc,payments,investor,active,users\n";
    const rows = countries
      .map((c) =>
        [c.name, c.iso2, c.iso3, c.dialCode, c.currency, c.region, c.defaultLanguage, c.kycRequired, c.paymentsEnabled, c.investorEligible, c.active, c.users].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "countries.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported countries.csv");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Country Management</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Country Management</h1>
          <p className="text-sm text-muted-foreground">
            Control where Zynk.ing operates — onboarding, payments, KYC and investor eligibility.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info("Bulk import coming soon")}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Country
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={Globe2} />
        <StatCard label="Active" value={stats.active} accent="text-emerald-600" />
        <StatCard label="Payments enabled" value={stats.payments} />
        <StatCard label="Investor eligible" value={stats.investor} />
        <StatCard label="Total users" value={stats.users.toLocaleString()} />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Countries</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, ISO, dial code…"
                  className="pl-9 h-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-9 w-[150px]">
                  <Filter className="mr-1 h-3.5 w-3.5" />
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="Americas">Americas</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Oceania">Oceania</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Country</TableHead>
                  <TableHead>ISO</TableHead>
                  <TableHead>Dial</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-muted text-[10px] font-semibold tracking-wider">
                          {c.iso2}
                        </span>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.iso3}</TableCell>
                    <TableCell>{c.dialCode}</TableCell>
                    <TableCell>{c.currency}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{c.region}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.kycRequired ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.paymentsEnabled} onCheckedChange={() => toggle(c.id, "paymentsEnabled")} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.investorEligible} onCheckedChange={() => toggle(c.id, "investorEligible")} />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {c.users.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggle(c.id, "active")}
                        className="inline-flex items-center"
                      >
                        <Badge variant={c.active ? "default" : "secondary"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(c)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                      No countries match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Showing {filtered.length} of {countries.length} countries.
          </p>
        </CardContent>
      </Card>

      <Dialog
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "Add country"}</DialogTitle>
            <DialogDescription>
              Configure how Zynk.ing behaves for users in this country.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Region">
              <Select value={draft.region} onValueChange={(v) => setDraft({ ...draft, region: v as Country["region"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Africa","Americas","Asia","Europe","Oceania"] as const).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="ISO-2">
              <Input maxLength={2} value={draft.iso2} onChange={(e) => setDraft({ ...draft, iso2: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="ISO-3">
              <Input maxLength={3} value={draft.iso3} onChange={(e) => setDraft({ ...draft, iso3: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Dial code">
              <Input placeholder="+1" value={draft.dialCode} onChange={(e) => setDraft({ ...draft, dialCode: e.target.value })} />
            </Field>
            <Field label="Currency">
              <Input maxLength={3} value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Default language">
              <Input maxLength={5} value={draft.defaultLanguage} onChange={(e) => setDraft({ ...draft, defaultLanguage: e.target.value })} />
            </Field>
            <div />
            <ToggleRow label="KYC required" desc="Force identity verification at signup."
              checked={draft.kycRequired} onChange={(v) => setDraft({ ...draft, kycRequired: v })} />
            <ToggleRow label="Payments enabled" desc="Allow subscriptions & marketplace."
              checked={draft.paymentsEnabled} onChange={(v) => setDraft({ ...draft, paymentsEnabled: v })} />
            <ToggleRow label="Investor eligible" desc="Allow access to deal flow & SPVs."
              checked={draft.investorEligible} onChange={(v) => setDraft({ ...draft, investorEligible: v })} />
            <ToggleRow label="Active" desc="Visible to users on signup."
              checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={saveDraft}>{editing ? "Save changes" : "Add country"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the country from new signups. Existing users keep access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon?: typeof Globe2;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</p>
        </div>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
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

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
