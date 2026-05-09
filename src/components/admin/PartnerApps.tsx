import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AppWindow, Copy, KeyRound, Plus, RefreshCw, Shield, ShieldAlert, Trash2,
  Webhook, Activity, Search, Lock, Globe, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";

type Env = "sandbox" | "production";
type Status = "active" | "suspended" | "pending_review" | "revoked";

type PartnerApp = {
  id: string;
  name: string;
  org: string;
  contactEmail: string;
  status: Status;
  env: Env;
  clientId: string;
  clientSecretMasked: string;
  redirectUris: string[];
  scopes: string[];
  events: string[];
  webhookUrl?: string;
  rateLimitRpm: number;
  installs: number;
  lastUsed: string;
  createdAt: string;
  pkceRequired: boolean;
  trusted: boolean;
};

const ALL_SCOPES: { id: string; group: string; risk: "low" | "medium" | "high"; desc: string }[] = [
  { id: "profile.read", group: "Profile", risk: "low", desc: "Read basic profile" },
  { id: "profile.write", group: "Profile", risk: "medium", desc: "Update profile fields" },
  { id: "connections.read", group: "Network", risk: "low", desc: "Read user's connections" },
  { id: "connections.write", group: "Network", risk: "medium", desc: "Send connection requests" },
  { id: "messages.read", group: "Messaging", risk: "high", desc: "Read DMs" },
  { id: "messages.write", group: "Messaging", risk: "high", desc: "Send DMs on behalf" },
  { id: "matches.read", group: "Matching", risk: "low", desc: "Read match results" },
  { id: "events.read", group: "Events", risk: "low", desc: "Read events the user can see" },
  { id: "events.write", group: "Events", risk: "medium", desc: "Create / RSVP to events" },
  { id: "bookings.read", group: "Mentorship", risk: "low", desc: "Read session bookings" },
  { id: "bookings.write", group: "Mentorship", risk: "medium", desc: "Book / cancel sessions" },
  { id: "payments.read", group: "Payments", risk: "medium", desc: "Read invoices & receipts" },
  { id: "payments.charge", group: "Payments", risk: "high", desc: "Initiate charges via partner" },
  { id: "investor.deals.read", group: "Investor", risk: "high", desc: "Read deal-flow pipeline" },
  { id: "dataroom.read", group: "Data Room", risk: "high", desc: "Read shared docs" },
  { id: "jobs.read", group: "Talent", risk: "low", desc: "Read job postings" },
  { id: "jobs.write", group: "Talent", risk: "medium", desc: "Manage applications" },
  { id: "ai.invoke", group: "AI", risk: "medium", desc: "Use Zynk AI on behalf of user" },
  { id: "admin.audit.read", group: "Admin", risk: "high", desc: "Read audit logs (org admins)" },
];

const ALL_EVENTS: { id: string; group: string; desc: string }[] = [
  { id: "user.created", group: "User", desc: "New user registered" },
  { id: "user.updated", group: "User", desc: "Profile updated" },
  { id: "user.deleted", group: "User", desc: "Account deleted" },
  { id: "connection.requested", group: "Network", desc: "Connection request sent" },
  { id: "connection.accepted", group: "Network", desc: "Connection accepted" },
  { id: "match.created", group: "Matching", desc: "New match" },
  { id: "message.created", group: "Messaging", desc: "Message sent" },
  { id: "booking.confirmed", group: "Mentorship", desc: "Session booked" },
  { id: "booking.cancelled", group: "Mentorship", desc: "Session cancelled" },
  { id: "payment.succeeded", group: "Payments", desc: "Payment captured" },
  { id: "payment.failed", group: "Payments", desc: "Payment failed" },
  { id: "subscription.updated", group: "Payments", desc: "Plan changed" },
  { id: "deal.stage_changed", group: "Investor", desc: "Deal pipeline stage moved" },
  { id: "kyc.approved", group: "Compliance", desc: "User KYC approved" },
  { id: "kyc.rejected", group: "Compliance", desc: "User KYC rejected" },
  { id: "event.rsvp", group: "Events", desc: "User RSVPed to event" },
  { id: "job.applied", group: "Talent", desc: "User applied to job" },
];

const SEED_APPS: PartnerApp[] = [
  {
    id: "app_01",
    name: "HubSpot Sync",
    org: "HubSpot Inc.",
    contactEmail: "integrations@hubspot.com",
    status: "active",
    env: "production",
    clientId: "zk_live_8h2fA9kQwL",
    clientSecretMasked: "sk_live_••••••••••••f3a1",
    redirectUris: ["https://app.hubspot.com/oauth/zynk/callback"],
    scopes: ["profile.read", "connections.read", "events.read", "jobs.read"],
    events: ["user.created", "user.updated", "connection.accepted", "event.rsvp"],
    webhookUrl: "https://api.hubspot.com/webhooks/zynk",
    rateLimitRpm: 600,
    installs: 1240,
    lastUsed: "2m ago",
    createdAt: "2025-08-12",
    pkceRequired: true,
    trusted: true,
  },
  {
    id: "app_02",
    name: "AngelList Deal Bot",
    org: "AngelList LLC",
    contactEmail: "dev@angellist.com",
    status: "active",
    env: "production",
    clientId: "zk_live_2pQrTzN1xs",
    clientSecretMasked: "sk_live_••••••••••••9b22",
    redirectUris: ["https://angel.co/oauth/callback"],
    scopes: ["profile.read", "investor.deals.read", "dataroom.read"],
    events: ["deal.stage_changed", "kyc.approved"],
    webhookUrl: "https://hooks.angel.co/zynk",
    rateLimitRpm: 300,
    installs: 84,
    lastUsed: "11m ago",
    createdAt: "2025-09-30",
    pkceRequired: true,
    trusted: false,
  },
  {
    id: "app_03",
    name: "Internal Mobile (iOS)",
    org: "Zynk First-Party",
    contactEmail: "mobile@zynk.ing",
    status: "active",
    env: "production",
    clientId: "zk_live_FirstParty_iOS",
    clientSecretMasked: "n/a (PKCE public client)",
    redirectUris: ["zynk://oauth/callback"],
    scopes: ALL_SCOPES.map((s) => s.id),
    events: [],
    rateLimitRpm: 1200,
    installs: 0,
    lastUsed: "now",
    createdAt: "2025-01-01",
    pkceRequired: true,
    trusted: true,
  },
  {
    id: "app_04",
    name: "Acme Recruiter Plugin",
    org: "Acme Talent",
    contactEmail: "api@acme.io",
    status: "pending_review",
    env: "sandbox",
    clientId: "zk_test_AcmeRecruit",
    clientSecretMasked: "sk_test_••••••••••••aa01",
    redirectUris: ["https://acme.io/oauth/zynk"],
    scopes: ["profile.read", "jobs.read", "jobs.write"],
    events: ["job.applied"],
    rateLimitRpm: 120,
    installs: 3,
    lastUsed: "1d ago",
    createdAt: "2026-04-22",
    pkceRequired: true,
    trusted: false,
  },
  {
    id: "app_05",
    name: "Legacy CRM",
    org: "Old Corp",
    contactEmail: "it@oldcorp.com",
    status: "suspended",
    env: "production",
    clientId: "zk_live_LegacyCRM",
    clientSecretMasked: "sk_live_••••••••••••0000",
    redirectUris: ["https://oldcorp.com/cb"],
    scopes: ["profile.read", "connections.read"],
    events: ["user.updated"],
    rateLimitRpm: 60,
    installs: 12,
    lastUsed: "21d ago",
    createdAt: "2024-06-10",
    pkceRequired: false,
    trusted: false,
  },
];

const statusVariant: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending_review: "secondary",
  suspended: "outline",
  revoked: "destructive",
};

const riskColor = (r: "low" | "medium" | "high") =>
  r === "high" ? "text-destructive" : r === "medium" ? "text-yellow-600" : "text-muted-foreground";

export function PartnerApps() {
  const [apps, setApps] = useState<PartnerApp[]>(SEED_APPS);
  const [query, setQuery] = useState("");
  const [envFilter, setEnvFilter] = useState<"all" | Env>("all");
  const [selected, setSelected] = useState<PartnerApp | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      apps.filter(
        (a) =>
          (envFilter === "all" || a.env === envFilter) &&
          (a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.org.toLowerCase().includes(query.toLowerCase()) ||
            a.clientId.toLowerCase().includes(query.toLowerCase())),
      ),
    [apps, query, envFilter],
  );

  const totalActive = apps.filter((a) => a.status === "active").length;
  const totalInstalls = apps.reduce((s, a) => s + a.installs, 0);
  const totalScopes = new Set(apps.flatMap((a) => a.scopes)).size;
  const pending = apps.filter((a) => a.status === "pending_review").length;

  const updateApp = (id: string, patch: Partial<PartnerApp>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const rotateSecret = (id: string) =>
    updateApp(id, { clientSecretMasked: "sk_live_••••••••••••" + Math.random().toString(16).slice(-4) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AppWindow className="h-6 w-6" /> Partner Apps
          </h1>
          <p className="text-sm text-muted-foreground">
            Issue OAuth credentials, manage scopes, and review event/webhook access for every connected partner.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New OAuth App</Button>
          </DialogTrigger>
          <CreateAppDialog
            onClose={() => setCreateOpen(false)}
            onCreate={(app) => {
              setApps((prev) => [app, ...prev]);
              setCreateOpen(false);
            }}
          />
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Active apps" value={totalActive} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
        <Stat label="Total installs" value={totalInstalls.toLocaleString()} icon={<Activity className="h-4 w-4" />} />
        <Stat label="Scopes in use" value={`${totalScopes}/${ALL_SCOPES.length}`} icon={<Shield className="h-4 w-4" />} />
        <Stat label="Pending review" value={pending} icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
          <div className="flex-1">
            <CardTitle className="text-base">Registered apps</CardTitle>
            <CardDescription>Click an app to edit scopes, events and webhooks.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as typeof envFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All envs</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search app, org, client_id…" className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">App</th>
                  <th className="px-4 py-3">Env</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scopes</th>
                  <th className="px-4 py-3">Events</th>
                  <th className="px-4 py-3">Installs</th>
                  <th className="px-4 py-3">Last used</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(a)}>
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-2">
                        {a.name}
                        {a.trusted && <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Trusted</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{a.org} • <code className="text-[10px]">{a.clientId}</code></div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={a.env === "production" ? "default" : "outline"}>{a.env}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[a.status]}>{a.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.scopes.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.events.length}</td>
                    <td className="px-4 py-3">{a.installs.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.lastUsed}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(a)}>Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Global OAuth policy</CardTitle>
          <CardDescription>Defaults applied to every new partner app.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <PolicyRow title="Require PKCE for all clients" defaultOn description="Disable plain authorization code flow." />
          <PolicyRow title="Require HTTPS redirect URIs" defaultOn description="Reject http:// except localhost." />
          <PolicyRow title="Rotate refresh tokens on use" defaultOn description="One-time-use refresh tokens." />
          <PolicyRow title="Mandatory consent screen" defaultOn description="Show scope grants to user every install." />
          <PolicyRow title="Block high-risk scopes for unverified apps" defaultOn description="messages.write, payments.charge, dataroom.read." />
          <PolicyRow title="Auto-suspend on >2% 4xx error rate" description="Throttle abusive partners automatically." />
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <AppDetailDialog
            app={selected}
            onChange={(patch) => {
              updateApp(selected.id, patch);
              setSelected({ ...selected, ...patch });
            }}
            onRotate={() => rotateSecret(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </Dialog>
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
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function PolicyRow({ title, description, defaultOn }: { title: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

function CreateAppDialog({
  onClose, onCreate,
}: { onClose: () => void; onCreate: (a: PartnerApp) => void }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [env, setEnv] = useState<Env>("sandbox");

  const submit = () => {
    const id = "app_" + Math.random().toString(36).slice(2, 8);
    const cid = `zk_${env === "production" ? "live" : "test"}_${Math.random().toString(36).slice(2, 10)}`;
    onCreate({
      id,
      name: name || "Untitled app",
      org: org || "Unknown",
      contactEmail: email || "dev@example.com",
      status: "pending_review",
      env,
      clientId: cid,
      clientSecretMasked: `sk_${env === "production" ? "live" : "test"}_••••••••••••${Math.random().toString(16).slice(-4)}`,
      redirectUris: [],
      scopes: ["profile.read"],
      events: [],
      rateLimitRpm: 120,
      installs: 0,
      lastUsed: "—",
      createdAt: new Date().toISOString().slice(0, 10),
      pkceRequired: true,
      trusted: false,
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create OAuth application</DialogTitle>
        <DialogDescription>Generates a client_id and client_secret. Configure scopes after creation.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5"><Label>App name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Organization</Label><Input value={org} onChange={(e) => setOrg(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Contact email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="grid gap-1.5">
          <Label>Environment</Label>
          <Select value={env} onValueChange={(v) => setEnv(v as Env)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox</SelectItem>
              <SelectItem value="production">Production (requires review)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AppDetailDialog({
  app, onChange, onRotate, onClose,
}: {
  app: PartnerApp;
  onChange: (patch: Partial<PartnerApp>) => void;
  onRotate: () => void;
  onClose: () => void;
}) {
  const toggleScope = (id: string) =>
    onChange({ scopes: app.scopes.includes(id) ? app.scopes.filter((s) => s !== id) : [...app.scopes, id] });
  const toggleEvent = (id: string) =>
    onChange({ events: app.events.includes(id) ? app.events.filter((s) => s !== id) : [...app.events, id] });

  const groupedScopes = useMemo(() => {
    const m = new Map<string, typeof ALL_SCOPES>();
    ALL_SCOPES.forEach((s) => { const a = m.get(s.group) ?? []; a.push(s); m.set(s.group, a); });
    return Array.from(m.entries());
  }, []);
  const groupedEvents = useMemo(() => {
    const m = new Map<string, typeof ALL_EVENTS>();
    ALL_EVENTS.forEach((s) => { const a = m.get(s.group) ?? []; a.push(s); m.set(s.group, a); });
    return Array.from(m.entries());
  }, []);

  return (
    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {app.name}
          <Badge variant={app.env === "production" ? "default" : "outline"}>{app.env}</Badge>
          <Badge variant={statusVariant[app.status]}>{app.status.replace("_", " ")}</Badge>
        </DialogTitle>
        <DialogDescription>{app.org} • {app.contactEmail}</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="creds">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="creds"><KeyRound className="h-3.5 w-3.5 mr-1" />Credentials</TabsTrigger>
          <TabsTrigger value="scopes"><Shield className="h-3.5 w-3.5 mr-1" />Scopes</TabsTrigger>
          <TabsTrigger value="events"><Activity className="h-3.5 w-3.5 mr-1" />Events</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-3.5 w-3.5 mr-1" />Webhooks</TabsTrigger>
          <TabsTrigger value="danger"><ShieldAlert className="h-3.5 w-3.5 mr-1" />Danger</TabsTrigger>
        </TabsList>

        <TabsContent value="creds" className="space-y-4 pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Client ID" value={app.clientId} copy />
            <Field label="Client Secret" value={app.clientSecretMasked} copy />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Rate limit (req/min)</Label>
              <Input type="number" value={app.rateLimitRpm} onChange={(e) => onChange({ rateLimitRpm: Number(e.target.value) })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={app.status} onValueChange={(v) => onChange({ status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_review">Pending review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Redirect URIs (one per line)</Label>
            <Textarea
              rows={3}
              value={app.redirectUris.join("\n")}
              onChange={(e) => onChange({ redirectUris: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={app.pkceRequired} onCheckedChange={(v) => onChange({ pkceRequired: v })} />
            <span className="text-sm">Require PKCE</span>
            <Separator orientation="vertical" className="h-6" />
            <Switch checked={app.trusted} onCheckedChange={(v) => onChange({ trusted: v })} />
            <span className="text-sm">Mark as Trusted (skip user consent)</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={onRotate}>
            <RefreshCw className="h-4 w-4" /> Rotate client secret
          </Button>
        </TabsContent>

        <TabsContent value="scopes" className="space-y-4 pt-4">
          <div className="text-xs text-muted-foreground">
            {app.scopes.length} of {ALL_SCOPES.length} scopes granted. High-risk scopes require security review.
          </div>
          {groupedScopes.map(([group, scopes]) => (
            <div key={group}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</div>
              <div className="grid gap-2">
                {scopes.map((s) => (
                  <label key={s.id} className="flex items-start justify-between gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30">
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        <code className="text-xs">{s.id}</code>
                        <span className={`text-[10px] uppercase ${riskColor(s.risk)}`}>{s.risk}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                    <Switch checked={app.scopes.includes(s.id)} onCheckedChange={() => toggleScope(s.id)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 pt-4">
          <div className="text-xs text-muted-foreground">Subscribed events delivered to the webhook URL.</div>
          {groupedEvents.map(([group, events]) => (
            <div key={group}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</div>
              <div className="grid gap-2">
                {events.map((e) => (
                  <label key={e.id} className="flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30">
                    <div>
                      <code className="text-xs">{e.id}</code>
                      <div className="text-xs text-muted-foreground">{e.desc}</div>
                    </div>
                    <Switch checked={app.events.includes(e.id)} onCheckedChange={() => toggleEvent(e.id)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 pt-4">
          <div className="grid gap-1.5">
            <Label>Delivery URL</Label>
            <Input
              value={app.webhookUrl ?? ""}
              placeholder="https://partner.example.com/webhooks/zynk"
              onChange={(e) => onChange({ webhookUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Signed with HMAC-SHA256 using your shared secret. Retries: 5 with exponential backoff.
            </p>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent deliveries</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead className="text-muted-foreground"><tr><th className="text-left py-1">Event</th><th className="text-left">Status</th><th className="text-left">Latency</th><th className="text-left">When</th></tr></thead>
                <tbody className="divide-y">
                  {[
                    { e: "user.created", s: 200, l: "182ms", w: "2m ago" },
                    { e: "match.created", s: 200, l: "211ms", w: "5m ago" },
                    { e: "payment.succeeded", s: 500, l: "3.1s", w: "12m ago" },
                    { e: "booking.confirmed", s: 200, l: "164ms", w: "31m ago" },
                  ].map((d, i) => (
                    <tr key={i}>
                      <td className="py-1.5"><code>{d.e}</code></td>
                      <td>{d.s === 200 ? <Badge variant="default">{d.s}</Badge> : <Badge variant="destructive">{d.s}</Badge>}</td>
                      <td className="text-muted-foreground">{d.l}</td>
                      <td className="text-muted-foreground">{d.w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 pt-4">
          <div className="rounded-md border border-destructive/40 p-4 space-y-3">
            <div className="text-sm font-semibold text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Revoke application
            </div>
            <p className="text-xs text-muted-foreground">
              Immediately invalidates all tokens, blocks new authorizations, and notifies the partner contact email.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onChange({ status: "suspended" })}>Suspend</Button>
              <Button variant="destructive" size="sm" className="gap-1" onClick={() => onChange({ status: "revoked" })}>
                <Trash2 className="h-4 w-4" /> Revoke permanently
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Field({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        {copy && (
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigator.clipboard?.writeText(value)}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default PartnerApps;
