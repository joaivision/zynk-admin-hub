import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Users, Search, Download, Filter, ChevronDown, MoreHorizontal,
  ShieldAlert, ShieldCheck, Mail, MessageSquare, Trash2, Ban, Star, Sparkles,
  CheckCircle2, AlertTriangle, MapPin, Briefcase, TrendingUp, Award,
  Globe, Smartphone, Plus, Save, Tag, Eye, UserPlus, Activity, Slash, Crown,
} from "lucide-react";

type Role =
  | "founder" | "investor" | "mentor" | "expert" | "talent"
  | "vendor" | "recruiter" | "student" | "operator" | "advisor";
type Plan = "free" | "pro" | "premium" | "enterprise" | "lifetime";
type Status = "active" | "pending" | "suspended" | "shadowbanned" | "deactivated" | "deleted";
type KycLevel = "none" | "basic" | "verified" | "accredited" | "institutional";
type Lifecycle = "lead" | "activated" | "engaged" | "power" | "at_risk" | "churned";

type User = {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  role: Role;
  secondaryRoles: Role[];
  status: Status;
  plan: Plan;
  kyc: KycLevel;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFA: boolean;
  trust: number;            // 0-100
  risk: number;             // 0-100
  lifecycle: Lifecycle;
  ltv: number;
  mrr: number;
  signupAt: string;
  lastActive: string;
  signupSource: "organic" | "referral" | "google" | "linkedin" | "apple" | "phone" | "invite" | "import";
  device: "ios" | "android" | "web";
  language: string;
  industries: string[];
  skills: string[];
  intents: string[];
  connections: number;
  matches: number;
  messagesSent: number;
  reportsAgainst: number;
  badges: string[];
  flags: string[];           // staff flags
  notes: number;
  cohort?: string;
  referredBy?: string;
};

const SEED: User[] = [
  {
    id: "u_8201", name: "Aarav Mehta", handle: "@aaravm", email: "aarav@orbitlabs.ai", phone: "+91 9876 543210",
    country: "IN", city: "Bengaluru", role: "founder", secondaryRoles: ["operator"], status: "active",
    plan: "pro", kyc: "verified", emailVerified: true, phoneVerified: true, twoFA: true,
    trust: 88, risk: 6, lifecycle: "power", ltv: 2840, mrr: 49, signupAt: "2024-03-12",
    lastActive: "2m ago", signupSource: "linkedin", device: "ios", language: "en-IN",
    industries: ["AI/ML", "SaaS"], skills: ["Product", "GTM"], intents: ["raise_seed", "hire_eng"],
    connections: 412, matches: 71, messagesSent: 2304, reportsAgainst: 0,
    badges: ["Top Founder ⚡", "Verified"], flags: [], notes: 2, cohort: "YC W24",
  },
  {
    id: "u_5532", name: "Priya Khanna", handle: "@priyak", email: "priya@anthemcap.com",
    country: "AE", city: "Dubai", role: "investor", secondaryRoles: ["advisor"], status: "active",
    plan: "premium", kyc: "accredited", emailVerified: true, phoneVerified: true, twoFA: true,
    trust: 94, risk: 3, lifecycle: "power", ltv: 8910, mrr: 199, signupAt: "2023-10-04",
    lastActive: "11m ago", signupSource: "referral", device: "web", language: "en-AE",
    industries: ["Fintech", "Climate"], skills: ["Term Sheets"], intents: ["deal_flow"],
    connections: 1284, matches: 218, messagesSent: 940, reportsAgainst: 0,
    badges: ["Accredited 💎", "Lead Investor"], flags: [], notes: 5, cohort: "Angel Club",
  },
  {
    id: "u_9914", name: "Marcus Hill", handle: "@marcus", email: "m@hilladvisors.io",
    country: "US", city: "San Francisco", role: "mentor", secondaryRoles: ["expert"], status: "active",
    plan: "pro", kyc: "verified", emailVerified: true, phoneVerified: false, twoFA: false,
    trust: 81, risk: 12, lifecycle: "engaged", ltv: 1620, mrr: 49, signupAt: "2024-08-22",
    lastActive: "1h ago", signupSource: "google", device: "android", language: "en-US",
    industries: ["B2B SaaS"], skills: ["Sales", "Hiring"], intents: ["mentor_founders"],
    connections: 320, matches: 44, messagesSent: 612, reportsAgainst: 1,
    badges: ["★ 4.9 mentor"], flags: [], notes: 0,
  },
  {
    id: "u_1102", name: "Yuki Tanaka", handle: "@yuki", email: "yuki@tokyocode.dev",
    country: "JP", city: "Tokyo", role: "talent", secondaryRoles: [], status: "pending",
    plan: "free", kyc: "basic", emailVerified: true, phoneVerified: false, twoFA: false,
    trust: 52, risk: 18, lifecycle: "lead", ltv: 0, mrr: 0, signupAt: "2026-05-08",
    lastActive: "today", signupSource: "organic", device: "web", language: "ja-JP",
    industries: ["Web3"], skills: ["Rust", "Solidity"], intents: ["find_job"],
    connections: 12, matches: 3, messagesSent: 7, reportsAgainst: 0, badges: [], flags: ["unverified_phone"], notes: 0,
  },
  {
    id: "u_3344", name: "Noor Al-Hassan", handle: "@noor", email: "noor+spam@tempmail.io",
    country: "KW", city: "Kuwait City", role: "founder", secondaryRoles: [], status: "shadowbanned",
    plan: "free", kyc: "none", emailVerified: false, phoneVerified: false, twoFA: false,
    trust: 14, risk: 87, lifecycle: "at_risk", ltv: 0, mrr: 0, signupAt: "2026-04-30",
    lastActive: "3d ago", signupSource: "invite", device: "web", language: "ar",
    industries: [], skills: [], intents: ["spam"],
    connections: 0, matches: 0, messagesSent: 312, reportsAgainst: 14,
    badges: [], flags: ["disposable_email", "mass_dm", "vpn"], notes: 3,
  },
  {
    id: "u_7700", name: "Lena Ortiz", handle: "@lena", email: "lena@growthloop.es",
    country: "ES", city: "Barcelona", role: "operator", secondaryRoles: ["mentor"], status: "active",
    plan: "premium", kyc: "verified", emailVerified: true, phoneVerified: true, twoFA: true,
    trust: 90, risk: 5, lifecycle: "power", ltv: 4210, mrr: 99, signupAt: "2024-01-19",
    lastActive: "now", signupSource: "linkedin", device: "ios", language: "es",
    industries: ["Marketing", "SaaS"], skills: ["Growth", "Lifecycle"], intents: ["mentor_founders", "advisory"],
    connections: 902, matches: 117, messagesSent: 1880, reportsAgainst: 0,
    badges: ["Speaker", "Verified"], flags: [], notes: 1,
  },
  {
    id: "u_4480", name: "Daniel Kim", handle: "@dkim", email: "dan@kimco.kr",
    country: "KR", city: "Seoul", role: "vendor", secondaryRoles: [], status: "active",
    plan: "free", kyc: "basic", emailVerified: true, phoneVerified: true, twoFA: false,
    trust: 64, risk: 22, lifecycle: "engaged", ltv: 120, mrr: 0, signupAt: "2025-11-02",
    lastActive: "2d ago", signupSource: "google", device: "android", language: "ko",
    industries: ["DesignOps"], skills: ["Branding"], intents: ["sell_services"],
    connections: 88, matches: 22, messagesSent: 230, reportsAgainst: 0, badges: [], flags: [], notes: 0,
  },
  {
    id: "u_5100", name: "Sara Bauer", handle: "@sarab", email: "sara@bauerfo.de",
    country: "DE", city: "Berlin", role: "investor", secondaryRoles: [], status: "active",
    plan: "enterprise", kyc: "institutional", emailVerified: true, phoneVerified: true, twoFA: true,
    trust: 97, risk: 1, lifecycle: "power", ltv: 24800, mrr: 999, signupAt: "2023-06-01",
    lastActive: "8m ago", signupSource: "import", device: "web", language: "de",
    industries: ["Climate", "Deeptech"], skills: ["LP relations"], intents: ["deal_flow", "co_invest"],
    connections: 2210, matches: 410, messagesSent: 1740, reportsAgainst: 0,
    badges: ["LP", "Family Office"], flags: [], notes: 9, cohort: "Bauer FO",
  },
];

const statusVariant: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default", pending: "secondary", suspended: "destructive",
  shadowbanned: "destructive", deactivated: "outline", deleted: "outline",
};

const planColor: Record<Plan, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  premium: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  enterprise: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  lifetime: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

const ROLES: Role[] = ["founder", "investor", "mentor", "expert", "talent", "vendor", "recruiter", "student", "operator", "advisor"];

const SAVED_VIEWS = [
  { id: "all", label: "All users", count: SEED.length },
  { id: "new", label: "New (7d)", count: 1 },
  { id: "investors", label: "Investors", count: SEED.filter((u) => u.role === "investor").length },
  { id: "founders_seed", label: "Founders raising seed", count: 1 },
  { id: "high_risk", label: "High risk (>70)", count: SEED.filter((u) => u.risk > 70).length },
  { id: "kyc_pending", label: "KYC pending", count: SEED.filter((u) => u.kyc === "basic" || u.kyc === "none").length },
  { id: "power", label: "Power users", count: SEED.filter((u) => u.lifecycle === "power").length },
  { id: "churn_risk", label: "Churn risk", count: SEED.filter((u) => u.lifecycle === "at_risk").length },
  { id: "enterprise", label: "Enterprise plan", count: SEED.filter((u) => u.plan === "enterprise").length },
];

export function UsersList() {
  const [users] = useState<User[]>(SEED);
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [kycFilter, setKycFilter] = useState<"all" | KycLevel>("all");
  const [country, setCountry] = useState("all");
  const [riskMin, setRiskMin] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<User | null>(null);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (view === "investors" && u.role !== "investor") return false;
      if (view === "high_risk" && u.risk <= 70) return false;
      if (view === "kyc_pending" && u.kyc !== "basic" && u.kyc !== "none") return false;
      if (view === "power" && u.lifecycle !== "power") return false;
      if (view === "churn_risk" && u.lifecycle !== "at_risk") return false;
      if (view === "enterprise" && u.plan !== "enterprise") return false;

      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      if (kycFilter !== "all" && u.kyc !== kycFilter) return false;
      if (country !== "all" && u.country !== country) return false;
      if (riskMin && u.risk < Number(riskMin)) return false;

      if (query) {
        const q = query.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.handle.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.id.toLowerCase().includes(q) &&
          !u.industries.some((i) => i.toLowerCase().includes(q)) &&
          !u.skills.some((s) => s.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [users, view, roleFilter, statusFilter, planFilter, kycFilter, country, riskMin, query]);

  const allChecked = filtered.length > 0 && filtered.every((u) => selected.has(u.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((u) => next.delete(u.id));
    else filtered.forEach((u) => next.add(u.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const totalMRR = filtered.reduce((s, u) => s + u.mrr, 0);
  const totalLTV = filtered.reduce((s, u) => s + u.ltv, 0);
  const verifiedPct = Math.round(
    (filtered.filter((u) => u.kyc === "verified" || u.kyc === "accredited" || u.kyc === "institutional").length / Math.max(1, filtered.length)) * 100,
  );
  const avgTrust = Math.round(filtered.reduce((s, u) => s + u.trust, 0) / Math.max(1, filtered.length));

  const padding = density === "compact" ? "py-1.5" : "py-3";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" /> All Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified directory of every Zynk member — founders, investors, mentors, talent, vendors. Search, segment, score and act on millions of profiles.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1"><UserPlus className="h-4 w-4" /> Invite</Button>
          <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export CSV</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1"><Sparkles className="h-4 w-4" /> AI Segment <ChevronDown className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Suggested segments</DropdownMenuLabel>
              <DropdownMenuItem>Founders likely to upgrade to Pro</DropdownMenuItem>
              <DropdownMenuItem>Investors who haven't logged in 14d</DropdownMenuItem>
              <DropdownMenuItem>Mentors with rating ≥ 4.8 + 0 sessions</DropdownMenuItem>
              <DropdownMenuItem>Power users in MENA fundraising now</DropdownMenuItem>
              <DropdownMenuItem>Suspected duplicate accounts (LSH)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Describe a segment in plain English…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <Stat label="Users in view" value={filtered.length.toLocaleString()} icon={<Users className="h-4 w-4" />} />
        <Stat label="MRR" value={`$${totalMRR.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" />} />
        <Stat label="LTV" value={`$${totalLTV.toLocaleString()}`} icon={<Award className="h-4 w-4" />} />
        <Stat label="KYC verified" value={`${verifiedPct}%`} icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} />
        <Stat label="Avg trust score" value={avgTrust} icon={<Star className="h-4 w-4 text-amber-500" />} />
      </div>

      <Card>
        <CardContent className="p-3 overflow-x-auto">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="flex-wrap h-auto">
              {SAVED_VIEWS.map((v) => (
                <TabsTrigger key={v.id} value={v.id} className="gap-2">
                  {v.label}
                  <span className="text-[10px] rounded bg-muted px-1.5 py-0.5">{v.count}</span>
                </TabsTrigger>
              ))}
              <Button variant="ghost" size="sm" className="gap-1 ml-1"><Plus className="h-3.5 w-3.5" /> Save view</Button>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, @handle, email, user_id, skill, company…" className="pl-9 h-9" />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All roles</SelectItem>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["active","pending","suspended","shadowbanned","deactivated","deleted"] as Status[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as typeof planFilter)}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {(["free","pro","premium","enterprise","lifetime"] as Plan[]).map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={(v) => setKycFilter(v as typeof kycFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="KYC level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                {(["none","basic","verified","accredited","institutional"] as KycLevel[]).map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {Array.from(new Set(SEED.map((u) => u.country))).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input value={riskMin} onChange={(e) => setRiskMin(e.target.value)} placeholder="Risk ≥" className="h-9 w-24" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1"><Filter className="h-4 w-4" /> More <ChevronDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Advanced filters</DropdownMenuLabel>
                <DropdownMenuItem>Industries / sectors</DropdownMenuItem>
                <DropdownMenuItem>Skills</DropdownMenuItem>
                <DropdownMenuItem>Intent / goal</DropdownMenuItem>
                <DropdownMenuItem>Last active range</DropdownMenuItem>
                <DropdownMenuItem>Signup source</DropdownMenuItem>
                <DropdownMenuItem>Device platform</DropdownMenuItem>
                <DropdownMenuItem>Connections / matches range</DropdownMenuItem>
                <DropdownMenuItem>Reports against ≥ N</DropdownMenuItem>
                <DropdownMenuItem>Has open ticket</DropdownMenuItem>
                <DropdownMenuItem>Cohort / referrer</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Build with SQL-like query…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={density} onValueChange={(v) => setDensity(v as typeof density)}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="comfortable">Comfortable</SelectItem><SelectItem value="compact">Compact</SelectItem></SelectContent>
            </Select>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium">{selected.size} selected</span>
              <span className="text-muted-foreground">·</span>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><Mail className="h-3.5 w-3.5" /> Email</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><MessageSquare className="h-3.5 w-3.5" /> Push</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><Tag className="h-3.5 w-3.5" /> Tag</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><Crown className="h-3.5 w-3.5" /> Change plan</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Force KYC</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1"><Slash className="h-3.5 w-3.5" /> Suspend</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-destructive"><Ban className="h-3.5 w-3.5" /> Shadowban</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete (GDPR)</Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 ml-auto"><Save className="h-3.5 w-3.5" /> Save as segment</Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">KYC</th>
                  <th className="px-3 py-2">Trust / Risk</th>
                  <th className="px-3 py-2">Lifecycle</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpen(u)}>
                    <td className={`px-3 ${padding}`} onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggleOne(u.id)} />
                    </td>
                    <td className={`px-3 ${padding}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8"><AvatarFallback>{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1.5">
                            {u.name}
                            {u.emailVerified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                            {u.flags.length > 0 && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.handle} · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 ${padding}`}>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="secondary">{u.role}</Badge>
                        {u.secondaryRoles.map((r) => <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>)}
                      </div>
                    </td>
                    <td className={`px-3 ${padding}`}><Badge variant={statusVariant[u.status]}>{u.status}</Badge></td>
                    <td className={`px-3 ${padding}`}><span className={`text-[11px] px-2 py-0.5 rounded ${planColor[u.plan]}`}>{u.plan}</span></td>
                    <td className={`px-3 ${padding}`}>
                      <span className="text-xs">
                        {u.kyc === "none" ? <span className="text-muted-foreground">none</span> : u.kyc}
                      </span>
                    </td>
                    <td className={`px-3 ${padding}`}>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-emerald-600">{u.trust}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className={u.risk > 70 ? "text-destructive font-semibold" : u.risk > 30 ? "text-yellow-600" : "text-muted-foreground"}>{u.risk}</span>
                      </div>
                    </td>
                    <td className={`px-3 ${padding}`}>
                      <Badge variant={u.lifecycle === "power" ? "default" : u.lifecycle === "at_risk" ? "destructive" : "outline"} className="text-[10px]">
                        {u.lifecycle}
                      </Badge>
                    </td>
                    <td className={`px-3 ${padding} text-xs text-muted-foreground`}>
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{u.city}, {u.country}</div>
                    </td>
                    <td className={`px-3 ${padding} text-xs`}>
                      <div className="text-muted-foreground">{u.lastActive}</div>
                      <div className="text-[10px] text-muted-foreground">{u.connections} conn · {u.matches} match</div>
                    </td>
                    <td className={`px-3 ${padding} text-xs`}>
                      <div>${u.mrr}/mo</div>
                      <div className="text-[10px] text-muted-foreground">${u.ltv.toLocaleString()} LTV</div>
                    </td>
                    <td className={`px-3 ${padding} text-xs text-muted-foreground`}>{u.signupAt}</td>
                    <td className={`px-3 ${padding} text-right`} onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setOpen(u)}><Eye className="h-4 w-4 mr-2" /> View profile</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Email user</DropdownMenuItem>
                          <DropdownMenuItem><Sparkles className="h-4 w-4 mr-2" /> Impersonate (audited)</DropdownMenuItem>
                          <DropdownMenuItem><Activity className="h-4 w-4 mr-2" /> View activity log</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem><ShieldCheck className="h-4 w-4 mr-2" /> Force re-KYC</DropdownMenuItem>
                          <DropdownMenuItem><Crown className="h-4 w-4 mr-2" /> Change plan</DropdownMenuItem>
                          <DropdownMenuItem><Slash className="h-4 w-4 mr-2" /> Suspend</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Ban className="h-4 w-4 mr-2" /> Shadowban</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Erase (GDPR)</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={13} className="text-center py-12 text-sm text-muted-foreground">No users match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div>Showing <strong>{filtered.length}</strong> of {users.length.toLocaleString()} total</div>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select defaultValue="50">
                <SelectTrigger className="h-7 w-20"><SelectValue /></SelectTrigger>
                <SelectContent>{[25, 50, 100, 250, 500].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" variant="ghost" className="h-7">Prev</Button>
              <Button size="sm" variant="ghost" className="h-7">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && <UserSheet user={open} />}
      </Sheet>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="mt-2 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function UserSheet({ user }: { user: User }) {
  return (
    <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12"><AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2">
              {user.name}
              {user.emailVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {user.twoFA && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
            </SheetTitle>
            <SheetDescription>{user.handle} · {user.email}{user.phone ? ` · ${user.phone}` : ""}</SheetDescription>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="secondary">{user.role}</Badge>
              <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
              <span className={`text-[11px] px-2 py-0.5 rounded ${planColor[user.plan]}`}>{user.plan}</span>
              {user.badges.map((b) => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniStat label="Trust" value={user.trust} tone="good" />
          <MiniStat label="Risk" value={user.risk} tone={user.risk > 70 ? "bad" : user.risk > 30 ? "warn" : "good"} />
          <MiniStat label="LTV" value={`$${user.ltv.toLocaleString()}`} />
        </div>

        <Section title="Identity & verification">
          <KV k="User ID" v={<code className="text-xs">{user.id}</code>} />
          <KV k="KYC level" v={<Badge variant="outline">{user.kyc}</Badge>} />
          <KV k="Email verified" v={user.emailVerified ? "Yes" : "No"} />
          <KV k="Phone verified" v={user.phoneVerified ? "Yes" : "No"} />
          <KV k="2FA enabled" v={user.twoFA ? "Yes" : "No"} />
          <KV k="Language" v={user.language} />
        </Section>

        <Section title="Profile signals">
          <KV k="Industries" v={user.industries.join(", ") || "—"} />
          <KV k="Skills" v={user.skills.join(", ") || "—"} />
          <KV k="Intents" v={user.intents.join(", ") || "—"} />
          <KV k="Cohort" v={user.cohort ?? "—"} />
          <KV k="Referred by" v={user.referredBy ?? "—"} />
        </Section>

        <Section title="Activity">
          <KV k="Last active" v={user.lastActive} />
          <KV k="Connections" v={user.connections.toLocaleString()} />
          <KV k="Matches" v={user.matches.toLocaleString()} />
          <KV k="Messages sent" v={user.messagesSent.toLocaleString()} />
          <KV k="Reports against" v={user.reportsAgainst} />
          <KV k="Lifecycle" v={user.lifecycle} />
        </Section>

        <Section title="Acquisition & device">
          <KV k="Signed up" v={`${user.signupAt} via ${user.signupSource}`} icon={<Globe className="h-3 w-3" />} />
          <KV k="Country / city" v={`${user.city}, ${user.country}`} icon={<MapPin className="h-3 w-3" />} />
          <KV k="Primary device" v={user.device} icon={<Smartphone className="h-3 w-3" />} />
          <KV k="MRR" v={`$${user.mrr}`} icon={<Briefcase className="h-3 w-3" />} />
        </Section>

        {user.flags.length > 0 && (
          <Section title="Risk flags">
            <div className="flex flex-wrap gap-1.5">
              {user.flags.map((f) => (
                <Badge key={f} variant="destructive" className="text-[10px] gap-1"><ShieldAlert className="h-3 w-3" />{f}</Badge>
              ))}
            </div>
          </Section>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" className="gap-1"><Mail className="h-4 w-4" /> Email</Button>
          <Button size="sm" variant="outline" className="gap-1"><Sparkles className="h-4 w-4" /> Impersonate</Button>
          <Button size="sm" variant="outline" className="gap-1"><ShieldCheck className="h-4 w-4" /> Re-KYC</Button>
          <Button size="sm" variant="outline" className="gap-1"><Crown className="h-4 w-4" /> Change plan</Button>
          <Button size="sm" variant="outline" className="gap-1 text-destructive"><Ban className="h-4 w-4" /> Shadowban</Button>
          <Button size="sm" variant="outline" className="gap-1 text-destructive"><Trash2 className="h-4 w-4" /> Erase (GDPR)</Button>
        </div>
      </div>
    </SheetContent>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      <div className="mt-2 rounded-md border divide-y">{children}</div>
    </div>
  );
}
function KV({ k, v, icon }: { k: string; v: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="text-muted-foreground flex items-center gap-1.5">{icon}{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "good" | "warn" | "bad" }) {
  const c = tone === "bad" ? "text-destructive" : tone === "warn" ? "text-yellow-600" : tone === "good" ? "text-emerald-600" : "";
  return (
    <div className="rounded-md border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${c}`}>{value}</div>
    </div>
  );
}

export default UsersList;
