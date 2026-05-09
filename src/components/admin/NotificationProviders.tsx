import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Mail, MessageSquare, Bell, Send, ChevronRight, Plus, Search, Edit, Trash2,
  CheckCircle2, XCircle, AlertTriangle, Activity, Zap, Globe, Lock, Eye, Copy,
  Smartphone, Monitor, RefreshCw, Webhook, KeyRound, Server, TrendingUp, Clock,
  Star, Beaker,
} from "lucide-react";

type Channel = "email" | "sms" | "push";
type ProviderStatus = "connected" | "disconnected" | "error";

type Provider = {
  id: string;
  channel: Channel;
  name: string;
  vendor: string;
  status: ProviderStatus;
  primary: boolean;
  fallbackOrder: number;
  regions: string[];
  fromName?: string;
  fromAddress?: string;
  apiKeyMasked?: string;
  domain?: string;
  webhookUrl?: string;
  monthlyVolume: number;
  monthlyCap: number;
  costPer1k: number;
  successRate: number;
  avgLatencyMs: number;
  lastTestedAt: string;
};

type Template = {
  id: string;
  channel: Channel;
  key: string;
  name: string;
  category: string;
  language: string;
  subject?: string;
  body: string;
  audience: string[];
  enabled: boolean;
  sent24h: number;
  openRate?: number;
  clickRate?: number;
  deliveryRate: number;
  variables: string[];
  updatedAt: string;
};

type LogEvent = {
  id: string; channel: Channel; templateKey: string; recipient: string;
  status: "delivered" | "bounced" | "failed" | "queued" | "opened" | "clicked";
  provider: string; at: string; latencyMs: number; error?: string;
};

const channelMeta: Record<Channel, { label: string; icon: typeof Mail; color: string }> = {
  email: { label: "Email", icon: Mail, color: "bg-blue-500/10 text-blue-500" },
  sms: { label: "SMS / WhatsApp", icon: MessageSquare, color: "bg-emerald-500/10 text-emerald-500" },
  push: { label: "Push", icon: Bell, color: "bg-violet-500/10 text-violet-500" },
};

const seedProviders: Provider[] = [
  { id: "p1", channel: "email", name: "Lovable Email (notify.zynk.ing)", vendor: "Lovable Email", status: "connected", primary: true, fallbackOrder: 1, regions: ["Global"], fromName: "Zynk.ing", fromAddress: "noreply@zynk.ing", apiKeyMasked: "••••••• managed", domain: "notify.zynk.ing", webhookUrl: "/lovable/email/suppression", monthlyVolume: 184221, monthlyCap: 1000000, costPer1k: 0.4, successRate: 99.2, avgLatencyMs: 412, lastTestedAt: "2026-05-08 09:21" },
  { id: "p2", channel: "email", name: "Resend (Marketing)", vendor: "Resend", status: "connected", primary: false, fallbackOrder: 2, regions: ["Global"], fromName: "Zynk.ing News", fromAddress: "news@mail.zynk.ing", apiKeyMasked: "re_••••AB12", domain: "mail.zynk.ing", webhookUrl: "https://zynk.ing/api/webhooks/resend", monthlyVolume: 32104, monthlyCap: 250000, costPer1k: 0.5, successRate: 98.4, avgLatencyMs: 502, lastTestedAt: "2026-05-07 18:00" },
  { id: "p3", channel: "email", name: "AWS SES (Failover)", vendor: "AWS SES", status: "disconnected", primary: false, fallbackOrder: 3, regions: ["US","EU"], fromName: "Zynk.ing", fromAddress: "system@zynk.ing", apiKeyMasked: "—", domain: "zynk.ing", monthlyVolume: 0, monthlyCap: 500000, costPer1k: 0.1, successRate: 0, avgLatencyMs: 0, lastTestedAt: "—" },
  { id: "p4", channel: "sms", name: "Twilio SMS", vendor: "Twilio", status: "connected", primary: true, fallbackOrder: 1, regions: ["US","EU","UK","India"], apiKeyMasked: "SK_••••CD34", monthlyVolume: 28412, monthlyCap: 200000, costPer1k: 9.5, successRate: 97.8, avgLatencyMs: 1200, lastTestedAt: "2026-05-08 07:14" },
  { id: "p5", channel: "sms", name: "MSG91 (India)", vendor: "MSG91", status: "connected", primary: false, fallbackOrder: 2, regions: ["India"], apiKeyMasked: "msg_••••EF56", monthlyVolume: 41320, monthlyCap: 500000, costPer1k: 1.8, successRate: 99.1, avgLatencyMs: 850, lastTestedAt: "2026-05-08 06:02" },
  { id: "p6", channel: "sms", name: "Twilio WhatsApp", vendor: "Twilio (WhatsApp)", status: "connected", primary: true, fallbackOrder: 1, regions: ["Global"], apiKeyMasked: "SK_••••GH78", monthlyVolume: 18230, monthlyCap: 100000, costPer1k: 12.0, successRate: 98.6, avgLatencyMs: 1400, lastTestedAt: "2026-05-08 08:50" },
  { id: "p7", channel: "push", name: "Firebase FCM", vendor: "Google FCM", status: "connected", primary: true, fallbackOrder: 1, regions: ["Global"], apiKeyMasked: "fcm_••••IJ90", monthlyVolume: 1284221, monthlyCap: 10000000, costPer1k: 0, successRate: 99.5, avgLatencyMs: 220, lastTestedAt: "2026-05-08 09:40" },
  { id: "p8", channel: "push", name: "Apple APNs", vendor: "Apple APNs", status: "connected", primary: true, fallbackOrder: 1, regions: ["Global"], apiKeyMasked: "apns_••••KL12", monthlyVolume: 921102, monthlyCap: 10000000, costPer1k: 0, successRate: 99.3, avgLatencyMs: 240, lastTestedAt: "2026-05-08 09:40" },
  { id: "p9", channel: "push", name: "OneSignal (Web Push)", vendor: "OneSignal", status: "error", primary: false, fallbackOrder: 2, regions: ["Global"], apiKeyMasked: "os_••••MN34", monthlyVolume: 0, monthlyCap: 500000, costPer1k: 0, successRate: 0, avgLatencyMs: 0, lastTestedAt: "2026-05-06 03:00" },
];

const seedTemplates: Template[] = [
  { id: "t1", channel: "email", key: "auth.welcome", name: "Welcome to Zynk.ing", category: "Auth", language: "en", subject: "Welcome to Zynk.ing, {{firstName}} 👋", body: "Hi {{firstName}}, your network of founders, investors and mentors is one tap away.", audience: ["All Users"], enabled: true, sent24h: 4821, openRate: 62.4, clickRate: 28.1, deliveryRate: 99.4, variables: ["firstName"], updatedAt: "2026-04-29" },
  { id: "t2", channel: "email", key: "match.new_intro", name: "New Match Introduction", category: "Matching", language: "en", subject: "{{matchName}} matched with you on Zynk.ing", body: "{{matchName}} ({{matchRole}}) wants to connect about {{topic}}.", audience: ["Founders","Investors","Mentors"], enabled: true, sent24h: 28412, openRate: 71.2, clickRate: 41.5, deliveryRate: 99.1, variables: ["matchName","matchRole","topic"], updatedAt: "2026-05-02" },
  { id: "t3", channel: "email", key: "kyc.approved", name: "KYC Approved", category: "Compliance", language: "en", subject: "Your KYC is approved 🎉", body: "Your investor profile is now live. Start exploring deal flow.", audience: ["Investors"], enabled: true, sent24h: 132, openRate: 88.0, clickRate: 52.0, deliveryRate: 100, variables: [], updatedAt: "2026-04-12" },
  { id: "t4", channel: "sms", key: "auth.otp", name: "OTP Verification", category: "Auth", language: "en", body: "Your Zynk.ing code: {{otp}}. Valid for 10 mins. Never share this.", audience: ["All Users"], enabled: true, sent24h: 18421, deliveryRate: 99.2, variables: ["otp"], updatedAt: "2026-05-01" },
  { id: "t5", channel: "sms", key: "mentor.session_reminder", name: "Mentor Session Reminder", category: "Mentorship", language: "en", body: "Reminder: Your session with {{mentorName}} starts at {{time}}. Join: {{link}}", audience: ["Founders"], enabled: true, sent24h: 412, deliveryRate: 98.5, variables: ["mentorName","time","link"], updatedAt: "2026-04-28" },
  { id: "t6", channel: "push", key: "match.swipe_match", name: "It's a Match!", category: "Matching", language: "en", subject: "🎉 You matched with {{name}}", body: "Tap to start the conversation.", audience: ["All Users"], enabled: true, sent24h: 91240, deliveryRate: 99.5, variables: ["name"], updatedAt: "2026-05-04" },
  { id: "t7", channel: "push", key: "deal.new_in_pipeline", name: "New Deal in Your Pipeline", category: "Investor", language: "en", subject: "New deal: {{dealName}}", body: "{{round}} round, {{sector}}. Tap to review.", audience: ["Investors"], enabled: true, sent24h: 2104, deliveryRate: 99.4, variables: ["dealName","round","sector"], updatedAt: "2026-05-03" },
  { id: "t8", channel: "push", key: "event.starting_soon", name: "Event Starting Soon", category: "Events", language: "en", subject: "{{eventName}} starts in 15 mins", body: "Join the live room now.", audience: ["All Users"], enabled: true, sent24h: 1820, deliveryRate: 99.6, variables: ["eventName"], updatedAt: "2026-04-30" },
];

const seedLogs: LogEvent[] = [
  { id: "l1", channel: "email", templateKey: "match.new_intro", recipient: "priya@acme.io", status: "opened", provider: "Lovable Email", at: "2026-05-08 09:42", latencyMs: 380 },
  { id: "l2", channel: "sms", templateKey: "auth.otp", recipient: "+91••••2391", status: "delivered", provider: "MSG91", at: "2026-05-08 09:41", latencyMs: 712 },
  { id: "l3", channel: "push", templateKey: "match.swipe_match", recipient: "device:abc…91", status: "delivered", provider: "Firebase FCM", at: "2026-05-08 09:41", latencyMs: 198 },
  { id: "l4", channel: "email", templateKey: "kyc.approved", recipient: "investor@vc.fund", status: "clicked", provider: "Lovable Email", at: "2026-05-08 09:39", latencyMs: 410 },
  { id: "l5", channel: "sms", templateKey: "mentor.session_reminder", recipient: "+1••••4521", status: "failed", provider: "Twilio", at: "2026-05-08 09:35", latencyMs: 1820, error: "Invalid number format" },
  { id: "l6", channel: "push", templateKey: "deal.new_in_pipeline", recipient: "device:xyz…44", status: "delivered", provider: "Apple APNs", at: "2026-05-08 09:33", latencyMs: 244 },
  { id: "l7", channel: "email", templateKey: "auth.welcome", recipient: "ravi@startup.in", status: "delivered", provider: "Lovable Email", at: "2026-05-08 09:32", latencyMs: 421 },
  { id: "l8", channel: "push", templateKey: "event.starting_soon", recipient: "device:def…88", status: "bounced", provider: "Firebase FCM", at: "2026-05-08 09:30", latencyMs: 0, error: "Token unregistered" },
];

const statusBadge: Record<ProviderStatus, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  connected: { label: "Connected", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  disconnected: { label: "Disconnected", cls: "bg-muted text-muted-foreground border-border", icon: XCircle },
  error: { label: "Error", cls: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: AlertTriangle },
};

const eventStatusCls: Record<LogEvent["status"], string> = {
  delivered: "text-emerald-500",
  opened: "text-blue-500",
  clicked: "text-violet-500",
  queued: "text-amber-500",
  bounced: "text-rose-500",
  failed: "text-rose-500",
};

export function NotificationProviders() {
  const [providers, setProviders] = useState<Provider[]>(seedProviders);
  const [templates, setTemplates] = useState<Template[]>(seedTemplates);
  const [logs] = useState<LogEvent[]>(seedLogs);
  const [tab, setTab] = useState<Channel | "overview" | "templates" | "logs">("overview");
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [testProvider, setTestProvider] = useState<Provider | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [search, setSearch] = useState("");

  // global throttling/quiet hours/preferences
  const [quietHours, setQuietHours] = useState({ enabled: true, start: "22:00", end: "07:00" });
  const [throttling, setThrottling] = useState({ email: 600, sms: 120, push: 5000 });
  const [retries, setRetries] = useState(5);
  const [doubleOptIn, setDoubleOptIn] = useState(true);
  const [unifiedPrefs, setUnifiedPrefs] = useState(true);

  const stats = useMemo(() => {
    const emailVol = providers.filter((p) => p.channel === "email").reduce((s, p) => s + p.monthlyVolume, 0);
    const smsVol = providers.filter((p) => p.channel === "sms").reduce((s, p) => s + p.monthlyVolume, 0);
    const pushVol = providers.filter((p) => p.channel === "push").reduce((s, p) => s + p.monthlyVolume, 0);
    const errorCount = providers.filter((p) => p.status === "error").length;
    return { emailVol, smsVol, pushVol, errorCount };
  }, [providers]);

  const updateProvider = (id: string, patch: Partial<Provider>) =>
    setProviders((ps) => ps.map((p) => p.id === id ? { ...p, ...patch } : p));

  const setPrimary = (channel: Channel, id: string) => {
    setProviders((ps) => ps.map((p) => p.channel === channel ? { ...p, primary: p.id === id } : p));
    toast.success("Primary provider updated");
  };

  const runTest = () => {
    if (!testProvider || !testRecipient) return;
    updateProvider(testProvider.id, { lastTestedAt: new Date().toISOString().slice(0, 16).replace("T", " ") });
    toast.success(`Test ${testProvider.channel} sent via ${testProvider.vendor}`);
    setTestProvider(null);
    setTestRecipient("");
  };

  const saveProvider = (p: Provider) => {
    setProviders((ps) => ps.map((x) => x.id === p.id ? p : x));
    setEditingProvider(null);
    toast.success("Provider saved");
  };

  const saveTemplate = (t: Template) => {
    setTemplates((ts) => ts.map((x) => x.id === t.id ? t : x));
    setEditingTemplate(null);
    toast.success("Template saved");
  };

  const filteredTemplates = templates.filter((t) =>
    !search || [t.name, t.key, t.category, t.body, t.subject ?? ""].some((x) => x.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Email / SMS / Push</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Notification Providers</h1>
          <p className="text-sm text-muted-foreground">
            One control room for every notification channel — providers, templates, throttling, fallbacks and live logs.
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Emails / 30d", value: stats.emailVol.toLocaleString(), icon: Mail, tone: "text-blue-500" },
          { label: "SMS+WA / 30d", value: stats.smsVol.toLocaleString(), icon: MessageSquare, tone: "text-emerald-500" },
          { label: "Push / 30d", value: stats.pushVol.toLocaleString(), icon: Bell, tone: "text-violet-500" },
          { label: "Provider issues", value: stats.errorCount, icon: AlertTriangle, tone: stats.errorCount ? "text-rose-500" : "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-muted p-2"><s.icon className={`h-4 w-4 ${s.tone}`} /></div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-base font-semibold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-1 h-3.5 w-3.5" /> Email</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="mr-1 h-3.5 w-3.5" /> SMS / WhatsApp</TabsTrigger>
          <TabsTrigger value="push"><Bell className="mr-1 h-3.5 w-3.5" /> Push</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {(["email","sms","push"] as Channel[]).map((c) => {
              const Icon = channelMeta[c].icon;
              const ch = providers.filter((p) => p.channel === c);
              const primary = ch.find((p) => p.primary);
              const ok = ch.filter((p) => p.status === "connected").length;
              const vol = ch.reduce((s, p) => s + p.monthlyVolume, 0);
              const succ = ch.filter((p) => p.status === "connected").reduce((s, p) => s + p.successRate, 0) / Math.max(1, ok);
              return (
                <Card key={c}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-md p-2 ${channelMeta[c].color}`}><Icon className="h-4 w-4" /></div>
                        <CardTitle className="text-base">{channelMeta[c].label}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{ok}/{ch.length} live</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-md border p-3">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Primary</div>
                      <div className="mt-1 font-medium">{primary?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{primary?.vendor}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Volume / 30d</div>
                        <div className="font-semibold">{vol.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Success</div>
                        <div className="font-semibold">{(succ || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setTab(c)}>Manage</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global delivery rules</CardTitle>
              <CardDescription>Apply across every channel and template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Quiet hours (recipient local time)</div>
                  <div className="text-xs text-muted-foreground">Pause non-critical messages during this window.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="time" value={quietHours.start} onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })} className="w-28" disabled={!quietHours.enabled} />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input type="time" value={quietHours.end} onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })} className="w-28" disabled={!quietHours.enabled} />
                  <Switch checked={quietHours.enabled} onCheckedChange={(v) => setQuietHours({ ...quietHours, enabled: v })} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {(["email","sms","push"] as Channel[]).map((c) => (
                  <div key={c} className="rounded-md border p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {(() => { const I = channelMeta[c].icon; return <I className="h-3.5 w-3.5" />; })()}
                      {channelMeta[c].label} throughput
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Slider value={[throttling[c]]} min={0} max={c === "push" ? 10000 : c === "email" ? 5000 : 1000} step={c === "push" ? 100 : 10} onValueChange={(v) => setThrottling({ ...throttling, [c]: v[0] })} className="flex-1" />
                      <span className="w-16 text-right text-xs font-mono">{throttling[c]}/min</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Max retries</div>
                    <div className="text-xs text-muted-foreground">Per failed delivery.</div>
                  </div>
                  <Select value={String(retries)} onValueChange={(v) => setRetries(Number(v))}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,3,5,7,10].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Double opt-in</div>
                    <div className="text-xs text-muted-foreground">Confirm email & WhatsApp opt-ins.</div>
                  </div>
                  <Switch checked={doubleOptIn} onCheckedChange={setDoubleOptIn} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Unified preference center</div>
                    <div className="text-xs text-muted-foreground">Single consent UI across channels.</div>
                  </div>
                  <Switch checked={unifiedPrefs} onCheckedChange={setUnifiedPrefs} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per-channel provider tabs */}
        {(["email","sms","push"] as Channel[]).map((c) => (
          <TabsContent key={c} value={c} className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {(() => { const I = channelMeta[c].icon; return <I className="h-4 w-4" />; })()}
                    {channelMeta[c].label} providers
                  </CardTitle>
                  <CardDescription>Primary provider sends first; fallbacks engage on failure.</CardDescription>
                </div>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add provider</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {providers.filter((p) => p.channel === c).sort((a, b) => a.fallbackOrder - b.fallbackOrder).map((p) => {
                  const S = statusBadge[p.status];
                  return (
                    <div key={p.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-[260px] flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-xs font-bold uppercase">
                            {p.vendor.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{p.name}</span>
                              <Badge variant="outline" className={S.cls}><S.icon className="mr-1 h-3 w-3" />{S.label}</Badge>
                              {p.primary && (<Badge className="text-[10px]"><Star className="mr-1 h-3 w-3" />Primary</Badge>)}
                              <Badge variant="outline" className="text-[10px]">Fallback #{p.fallbackOrder}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{p.vendor} • {p.regions.join(", ")}</div>
                            {p.fromAddress && (<div className="mt-1 text-xs">From: <code>{p.fromName} &lt;{p.fromAddress}&gt;</code></div>)}
                            {p.apiKeyMasked && (<div className="text-[10px] text-muted-foreground"><KeyRound className="mr-1 inline h-3 w-3" />{p.apiKeyMasked}</div>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!p.primary && p.status === "connected" && (
                            <Button size="sm" variant="outline" onClick={() => setPrimary(c, p.id)}>Make primary</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setTestProvider(p)} className="gap-1"><Beaker className="h-3.5 w-3.5" /> Test</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProvider(p)} className="gap-1"><Edit className="h-3.5 w-3.5" /> Edit</Button>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid gap-3 md:grid-cols-4">
                        <Metric label="Volume / 30d" value={p.monthlyVolume.toLocaleString()} sub={`Cap ${p.monthlyCap.toLocaleString()}`} icon={TrendingUp} />
                        <Metric label="Success rate" value={`${p.successRate.toFixed(1)}%`} icon={CheckCircle2} tone={p.successRate >= 99 ? "text-emerald-500" : p.successRate >= 95 ? "text-amber-500" : "text-rose-500"} />
                        <Metric label="Avg latency" value={`${p.avgLatencyMs}ms`} icon={Zap} />
                        <Metric label="Cost / 1K" value={p.costPer1k === 0 ? "Free" : `$${p.costPer1k.toFixed(2)}`} icon={Activity} />
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Quota usage</span>
                          <span className="font-mono">{Math.round((p.monthlyVolume / Math.max(1, p.monthlyCap)) * 100)}%</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full ${p.monthlyVolume / p.monthlyCap > 0.8 ? "bg-rose-500" : "bg-primary"}`} style={{ width: `${Math.min(100, (p.monthlyVolume / Math.max(1, p.monthlyCap)) * 100)}%` }} />
                        </div>
                      </div>

                      {p.webhookUrl && (
                        <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-xs">
                          <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
                          <code className="flex-1 truncate">{p.webhookUrl}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(p.webhookUrl!); toast("Webhook URL copied"); }}><Copy className="h-3 w-3" /></Button>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span><Clock className="mr-1 inline h-3 w-3" /> Last tested {p.lastTestedAt}</span>
                        {p.status === "error" && <span className="text-rose-500"><AlertTriangle className="mr-1 inline h-3 w-3" /> Webhook auth failing</span>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base flex-1">Notification templates</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search templates…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New template</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-3">Template</th>
                      <th className="px-3 py-3">Channel</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Audience</th>
                      <th className="px-3 py-3">Sent / 24h</th>
                      <th className="px-3 py-3">Performance</th>
                      <th className="px-3 py-3">Enabled</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTemplates.map((t) => {
                      const Icon = channelMeta[t.channel].icon;
                      return (
                        <tr key={t.id} className="hover:bg-muted/30">
                          <td className="px-3 py-3">
                            <div className="font-medium">{t.name}</div>
                            <code className="text-[11px] text-muted-foreground">{t.key}</code>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className="gap-1 text-[10px]"><Icon className="h-3 w-3" />{channelMeta[t.channel].label}</Badge>
                          </td>
                          <td className="px-3 py-3 text-xs">{t.category}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{t.audience.join(", ")}</td>
                          <td className="px-3 py-3 font-mono text-xs">{t.sent24h.toLocaleString()}</td>
                          <td className="px-3 py-3 text-xs">
                            <div>Delivery: <b>{t.deliveryRate.toFixed(1)}%</b></div>
                            {t.openRate !== undefined && (<div className="text-muted-foreground">Open {t.openRate}% · Click {t.clickRate}%</div>)}
                          </td>
                          <td className="px-3 py-3"><Switch checked={t.enabled} onCheckedChange={(v) => setTemplates((ts) => ts.map((x) => x.id === t.id ? { ...x, enabled: v } : x))} /></td>
                          <td className="px-3 py-3 text-right">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTemplate(t)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live delivery feed</CardTitle>
              <CardDescription>Recent sends across every channel and provider.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                <div className="divide-y rounded-md border">
                  {logs.map((l) => {
                    const Icon = channelMeta[l.channel].icon;
                    return (
                      <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                        <div className="flex items-center gap-3 min-w-[260px]">
                          <div className={`rounded-md p-1.5 ${channelMeta[l.channel].color}`}><Icon className="h-3.5 w-3.5" /></div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-xs">{l.templateKey}</code>
                              <span className={`text-xs font-medium uppercase ${eventStatusCls[l.status]}`}>{l.status}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">→ {l.recipient} · via {l.provider}</div>
                            {l.error && (<div className="text-[11px] text-rose-500"><AlertTriangle className="mr-1 inline h-3 w-3" />{l.error}</div>)}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{l.at}</div>
                          <div>{l.latencyMs}ms</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test send */}
      <Dialog open={!!testProvider} onOpenChange={(o) => !o && setTestProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send test via {testProvider?.vendor}</DialogTitle>
            <DialogDescription>Verify the connection end-to-end without affecting real users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{testProvider?.channel === "email" ? "Test email address" : testProvider?.channel === "sms" ? "Test phone (E.164)" : "Test device token"}</Label>
              <Input value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} placeholder={testProvider?.channel === "email" ? "you@zynk.ing" : testProvider?.channel === "sms" ? "+15551234567" : "fcm_or_apns_token"} />
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              The test payload uses the <code>system.test</code> template and bypasses quiet hours.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestProvider(null)}>Cancel</Button>
            <Button onClick={runTest} disabled={!testRecipient} className="gap-1"><Send className="h-4 w-4" /> Send test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit provider */}
      <Dialog open={!!editingProvider} onOpenChange={(o) => !o && setEditingProvider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit — {editingProvider?.name}</DialogTitle>
            <DialogDescription>Credentials are encrypted at rest. Webhooks are HMAC-verified.</DialogDescription>
          </DialogHeader>
          {editingProvider && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2"><Label>Display name</Label>
                <Input value={editingProvider.name} onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })} />
              </div>
              {editingProvider.channel === "email" && (
                <>
                  <div className="space-y-1.5"><Label>From name</Label>
                    <Input value={editingProvider.fromName ?? ""} onChange={(e) => setEditingProvider({ ...editingProvider, fromName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5"><Label>From address</Label>
                    <Input value={editingProvider.fromAddress ?? ""} onChange={(e) => setEditingProvider({ ...editingProvider, fromAddress: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2"><Label>Sending domain</Label>
                    <Input value={editingProvider.domain ?? ""} onChange={(e) => setEditingProvider({ ...editingProvider, domain: e.target.value })} />
                  </div>
                </>
              )}
              <div className="space-y-1.5 md:col-span-2"><Label>API key</Label>
                <div className="flex gap-2">
                  <Input value={editingProvider.apiKeyMasked ?? ""} onChange={(e) => setEditingProvider({ ...editingProvider, apiKeyMasked: e.target.value })} className="font-mono" />
                  <Button variant="outline" size="icon"><Lock className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Monthly cap</Label>
                <Input type="number" value={editingProvider.monthlyCap} onChange={(e) => setEditingProvider({ ...editingProvider, monthlyCap: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5"><Label>Cost per 1K</Label>
                <Input type="number" step="0.01" value={editingProvider.costPer1k} onChange={(e) => setEditingProvider({ ...editingProvider, costPer1k: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label>Webhook URL</Label>
                <Input value={editingProvider.webhookUrl ?? ""} onChange={(e) => setEditingProvider({ ...editingProvider, webhookUrl: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Connection</div>
                  <div className="text-xs text-muted-foreground">Disabled providers are skipped in fallback chain.</div>
                </div>
                <Switch checked={editingProvider.status === "connected"} onCheckedChange={(v) => setEditingProvider({ ...editingProvider, status: v ? "connected" : "disconnected" })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProvider(null)}>Cancel</Button>
            <Button onClick={() => editingProvider && saveProvider(editingProvider)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit template */}
      <Dialog open={!!editingTemplate} onOpenChange={(o) => !o && setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit template — {editingTemplate?.name}</DialogTitle>
            <DialogDescription>Variables in <code>{`{{double_braces}}`}</code> are replaced at send time.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5"><Label>Name</Label>
                  <Input value={editingTemplate.name} onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} />
                </div>
                <div className="space-y-1.5"><Label>Key</Label>
                  <Input value={editingTemplate.key} className="font-mono" onChange={(e) => setEditingTemplate({ ...editingTemplate, key: e.target.value })} />
                </div>
              </div>
              {editingTemplate.subject !== undefined && (
                <div className="space-y-1.5"><Label>Subject</Label>
                  <Input value={editingTemplate.subject} onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} />
                </div>
              )}
              <div className="space-y-1.5"><Label>Body</Label>
                <Textarea rows={8} value={editingTemplate.body} onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })} />
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <div className="mb-1 font-medium">Available variables</div>
                <div className="flex flex-wrap gap-1">
                  {editingTemplate.variables.map((v) => (<Badge key={v} variant="secondary" className="font-mono text-[10px]">{`{{${v}}}`}</Badge>))}
                  {editingTemplate.variables.length === 0 && <span className="text-muted-foreground">None</span>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={() => editingTemplate && saveTemplate(editingTemplate)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: typeof Activity; tone?: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-sm font-semibold ${tone ?? ""}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
