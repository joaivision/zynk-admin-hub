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
  Coins,
  Filter,
  RefreshCw,
  Star,
  TrendingUp,
  TrendingDown,
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

export type Currency = {
  id: string;
  code: string; // ISO-4217
  name: string;
  symbol: string;
  decimals: number;
  region: "Africa" | "Americas" | "Asia" | "Europe" | "Oceania" | "Global";
  rateToUsd: number; // 1 unit = X USD
  payoutsEnabled: boolean;
  subscriptionsEnabled: boolean;
  marketplaceEnabled: boolean;
  investorEnabled: boolean;
  isBase: boolean;
  active: boolean;
  countries: number;
  volume30d: number; // in USD
  change24h: number; // percent
};

const seed: Currency[] = [
  { id: "1", code: "USD", name: "US Dollar", symbol: "$", decimals: 2, region: "Global", rateToUsd: 1, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: true, active: true, countries: 14, volume30d: 1840000, change24h: 0 },
  { id: "2", code: "EUR", name: "Euro", symbol: "€", decimals: 2, region: "Europe", rateToUsd: 1.08, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 20, volume30d: 920000, change24h: 0.4 },
  { id: "3", code: "GBP", name: "Pound Sterling", symbol: "£", decimals: 2, region: "Europe", rateToUsd: 1.27, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 410000, change24h: -0.2 },
  { id: "4", code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2, region: "Asia", rateToUsd: 0.012, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 680000, change24h: 0.1 },
  { id: "5", code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2, region: "Asia", rateToUsd: 0.74, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 210000, change24h: 0.3 },
  { id: "6", code: "AED", name: "UAE Dirham", symbol: "د.إ", decimals: 2, region: "Asia", rateToUsd: 0.27, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 180000, change24h: 0 },
  { id: "7", code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2, region: "Oceania", rateToUsd: 0.66, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 120000, change24h: -0.5 },
  { id: "8", code: "CAD", name: "Canadian Dollar", symbol: "C$", decimals: 2, region: "Americas", rateToUsd: 0.73, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 150000, change24h: 0.2 },
  { id: "9", code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0, region: "Asia", rateToUsd: 0.0064, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: false, investorEnabled: true, isBase: false, active: true, countries: 1, volume30d: 90000, change24h: -0.7 },
  { id: "10", code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2, region: "Americas", rateToUsd: 0.2, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: false, isBase: false, active: true, countries: 1, volume30d: 75000, change24h: 1.1 },
  { id: "11", code: "NGN", name: "Nigerian Naira", symbol: "₦", decimals: 2, region: "Africa", rateToUsd: 0.00067, payoutsEnabled: false, subscriptionsEnabled: true, marketplaceEnabled: false, investorEnabled: false, isBase: false, active: true, countries: 1, volume30d: 22000, change24h: -1.4 },
  { id: "12", code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2, region: "Africa", rateToUsd: 0.054, payoutsEnabled: true, subscriptionsEnabled: true, marketplaceEnabled: true, investorEnabled: false, isBase: false, active: false, countries: 0, volume30d: 0, change24h: 0 },
];

const empty: Omit<Currency, "id" | "countries" | "volume30d" | "change24h"> = {
  code: "",
  name: "",
  symbol: "",
  decimals: 2,
  region: "Global",
  rateToUsd: 1,
  payoutsEnabled: true,
  subscriptionsEnabled: true,
  marketplaceEnabled: true,
  investorEnabled: false,
  isBase: false,
  active: true,
};

export function CurrencyManagement() {
  const [items, setItems] = useState<Currency[]>(seed);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Currency | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(empty);
  const [deleting, setDeleting] = useState<Currency | null>(null);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const q = query.toLowerCase();
      const mq =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q);
      const mr = region === "all" || c.region === region;
      const ms =
        status === "all" ||
        (status === "active" && c.active) ||
        (status === "inactive" && !c.active);
      return mq && mr && ms;
    });
  }, [items, query, region, status]);

  const stats = useMemo(() => {
    const base = items.find((c) => c.isBase);
    return {
      total: items.length,
      active: items.filter((c) => c.active).length,
      payouts: items.filter((c) => c.payoutsEnabled).length,
      base: base?.code ?? "—",
      volume: items.reduce((s, c) => s + c.volume30d, 0),
    };
  }, [items]);

  function openCreate() {
    setDraft(empty);
    setCreating(true);
  }
  function openEdit(c: Currency) {
    setDraft({ ...c });
    setEditing(c);
  }
  function saveDraft() {
    if (!draft.code || !draft.name || !draft.symbol) {
      toast.error("Code, name and symbol are required");
      return;
    }
    if (draft.code.length !== 3) {
      toast.error("Currency code must be 3 letters (ISO-4217)");
      return;
    }
    if (draft.rateToUsd <= 0) {
      toast.error("Rate to USD must be greater than 0");
      return;
    }
    const code = draft.code.toUpperCase();
    if (editing) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...editing, ...draft, code }
            : draft.isBase
              ? { ...c, isBase: false }
              : c,
        ),
      );
      toast.success(`${code} updated`);
      setEditing(null);
    } else {
      if (items.some((c) => c.code === code)) {
        toast.error(`${code} already exists`);
        return;
      }
      const id = (Math.max(0, ...items.map((c) => +c.id)) + 1).toString();
      setItems((prev) => {
        const next = draft.isBase ? prev.map((c) => ({ ...c, isBase: false })) : prev;
        return [{ id, countries: 0, volume30d: 0, change24h: 0, ...draft, code }, ...next];
      });
      toast.success(`${code} added`);
      setCreating(false);
    }
  }
  function toggle(id: string, key: keyof Currency) {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: !c[key] } : c)),
    );
  }
  function makeBase(id: string) {
    setItems((prev) => prev.map((c) => ({ ...c, isBase: c.id === id })));
    const c = items.find((x) => x.id === id);
    if (c) toast.success(`${c.code} is now the base currency`);
  }
  function remove() {
    if (!deleting) return;
    if (deleting.isBase) {
      toast.error("Cannot remove the base currency");
      setDeleting(null);
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== deleting.id));
    toast.success(`${deleting.code} removed`);
    setDeleting(null);
  }
  function refreshRates() {
    setItems((prev) =>
      prev.map((c) =>
        c.isBase
          ? c
          : {
              ...c,
              rateToUsd: +(c.rateToUsd * (1 + (Math.random() - 0.5) / 100)).toFixed(6),
              change24h: +((Math.random() - 0.5) * 2).toFixed(2),
            },
      ),
    );
    toast.success("FX rates refreshed");
  }
  function exportCsv() {
    const header =
      "code,name,symbol,decimals,region,rate_to_usd,payouts,subscriptions,marketplace,investor,is_base,active,countries,volume_30d_usd\n";
    const rows = items
      .map((c) =>
        [
          c.code,
          c.name,
          c.symbol,
          c.decimals,
          c.region,
          c.rateToUsd,
          c.payoutsEnabled,
          c.subscriptionsEnabled,
          c.marketplaceEnabled,
          c.investorEnabled,
          c.isBase,
          c.active,
          c.countries,
          c.volume30d,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "currencies.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported currencies.csv");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Settings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Currency Management</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Currency Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure the currencies Zynk.ing supports for subscriptions, marketplace,
            investor deals and payouts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={refreshRates}>
            <RefreshCw className="h-4 w-4" /> Refresh rates
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info("Bulk import coming soon")}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Currency
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={Coins} />
        <StatCard label="Active" value={stats.active} accent="text-emerald-600" />
        <StatCard label="Payouts enabled" value={stats.payouts} />
        <StatCard label="Base currency" value={stats.base} />
        <StatCard label="30-day volume" value={`$${(stats.volume / 1000).toFixed(0)}k`} />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Currencies</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search code, name, symbol…"
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
                  <SelectItem value="Global">Global</SelectItem>
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
                  <TableHead>Currency</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Rate (1 = USD)</TableHead>
                  <TableHead>24h</TableHead>
                  <TableHead>Subs</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Payouts</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>30d vol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-muted text-[10px] font-semibold tracking-wider">
                          {c.code}
                        </span>
                        <span>{c.name}</span>
                        {c.isBase && (
                          <Badge variant="default" className="h-5 gap-1 px-1.5 text-[10px]">
                            <Star className="h-3 w-3" /> Base
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.symbol}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{c.region}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{c.rateToUsd}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 tabular-nums text-xs ${
                          c.change24h > 0
                            ? "text-emerald-600"
                            : c.change24h < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {c.change24h > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : c.change24h < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {c.change24h > 0 ? "+" : ""}
                        {c.change24h}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.subscriptionsEnabled} onCheckedChange={() => toggle(c.id, "subscriptionsEnabled")} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.marketplaceEnabled} onCheckedChange={() => toggle(c.id, "marketplaceEnabled")} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.payoutsEnabled} onCheckedChange={() => toggle(c.id, "payoutsEnabled")} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.investorEnabled} onCheckedChange={() => toggle(c.id, "investorEnabled")} />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      ${(c.volume30d / 1000).toFixed(0)}k
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggle(c.id, "active")} className="inline-flex items-center">
                        <Badge variant={c.active ? "default" : "secondary"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      {!c.isBase && (
                        <Button variant="ghost" size="icon" title="Set as base" onClick={() => makeBase(c.id)}>
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
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
                    <TableCell colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                      No currencies match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Showing {filtered.length} of {items.length} currencies. Rates shown are 1 unit ➜ USD.
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
            <DialogTitle>{editing ? `Edit ${editing.code}` : "Add currency"}</DialogTitle>
            <DialogDescription>
              Configure how this currency behaves across Zynk.ing modules.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISO-4217 code">
              <Input maxLength={3} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Display name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Symbol">
              <Input value={draft.symbol} onChange={(e) => setDraft({ ...draft, symbol: e.target.value })} />
            </Field>
            <Field label="Decimals">
              <Input
                type="number"
                min={0}
                max={6}
                value={draft.decimals}
                onChange={(e) => setDraft({ ...draft, decimals: Math.max(0, Math.min(6, +e.target.value || 0)) })}
              />
            </Field>
            <Field label="Region">
              <Select value={draft.region} onValueChange={(v) => setDraft({ ...draft, region: v as Currency["region"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Global","Africa","Americas","Asia","Europe","Oceania"] as const).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rate (1 unit = X USD)">
              <Input
                type="number"
                step="0.000001"
                value={draft.rateToUsd}
                onChange={(e) => setDraft({ ...draft, rateToUsd: +e.target.value || 0 })}
              />
            </Field>
            <ToggleRow label="Subscriptions" desc="Charge plan fees in this currency."
              checked={draft.subscriptionsEnabled} onChange={(v) => setDraft({ ...draft, subscriptionsEnabled: v })} />
            <ToggleRow label="Marketplace & RFQ" desc="Allow service listings & orders."
              checked={draft.marketplaceEnabled} onChange={(v) => setDraft({ ...draft, marketplaceEnabled: v })} />
            <ToggleRow label="Payouts" desc="Allow experts & vendors to receive."
              checked={draft.payoutsEnabled} onChange={(v) => setDraft({ ...draft, payoutsEnabled: v })} />
            <ToggleRow label="Investor deals" desc="Use for SPVs, syndicates & cap tables."
              checked={draft.investorEnabled} onChange={(v) => setDraft({ ...draft, investorEnabled: v })} />
            <ToggleRow label="Base currency" desc="All FX rates are quoted against this."
              checked={draft.isBase} onChange={(v) => setDraft({ ...draft, isBase: v })} />
            <ToggleRow label="Active" desc="Visible to users at checkout."
              checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={saveDraft}>{editing ? "Save changes" : "Add currency"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing transactions keep their historic rate. New checkouts in this currency will be disabled.
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
  icon?: typeof Coins;
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
