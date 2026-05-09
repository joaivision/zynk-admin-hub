import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Shield, Bot, Zap, Plus, Trash2, AlertTriangle, Activity, Network } from "lucide-react";

type Action = "log" | "challenge" | "throttle" | "block" | "shadowban";
type Window = "1m" | "5m" | "1h" | "24h";

type Rule = {
  id: string;
  name: string;
  endpoint: string;
  scope: "ip" | "user" | "ip_user" | "device";
  limit: number;
  window: Window;
  action: Action;
  enabled: boolean;
  burst: number;
};

const SEED_RULES: Rule[] = [
  { id: "r1", name: "Login brute-force", endpoint: "POST /auth/login", scope: "ip", limit: 5, window: "5m", action: "challenge", enabled: true, burst: 0 },
  { id: "r2", name: "OTP request flood", endpoint: "POST /auth/otp", scope: "ip_user", limit: 3, window: "5m", action: "block", enabled: true, burst: 1 },
  { id: "r3", name: "Signup spam", endpoint: "POST /auth/signup", scope: "ip", limit: 10, window: "1h", action: "block", enabled: true, burst: 2 },
  { id: "r4", name: "Swipe spam", endpoint: "POST /matches/swipe", scope: "user", limit: 200, window: "1h", action: "throttle", enabled: true, burst: 20 },
  { id: "r5", name: "Connection request flood", endpoint: "POST /connections", scope: "user", limit: 50, window: "24h", action: "throttle", enabled: true, burst: 5 },
  { id: "r6", name: "DM spam", endpoint: "POST /messages", scope: "user", limit: 60, window: "1h", action: "shadowban", enabled: true, burst: 10 },
  { id: "r7", name: "Public API global", endpoint: "GET /api/*", scope: "ip", limit: 600, window: "1m", action: "throttle", enabled: true, burst: 100 },
  { id: "r8", name: "Search abuse", endpoint: "GET /search", scope: "ip", limit: 120, window: "1m", action: "throttle", enabled: true, burst: 30 },
  { id: "r9", name: "Webhook delivery 4xx", endpoint: "outbound webhook", scope: "user", limit: 20, window: "1h", action: "throttle", enabled: true, burst: 5 },
];

const actionVariant: Record<Action, "default" | "secondary" | "destructive" | "outline"> = {
  log: "outline", challenge: "secondary", throttle: "secondary", block: "destructive", shadowban: "default",
};

export function AbuseRules() {
  const [rules, setRules] = useState<Rule[]>(SEED_RULES);
  const [botScore, setBotScore] = useState([60]);
  const [vpn, setVpn] = useState(false);
  const [tor, setTor] = useState(true);
  const [denyList, setDenyList] = useState("203.0.113.66\n198.51.100.0/24\nAS14618 # spammy ASN");
  const [allowList, setAllowList] = useState("10.0.0.0/8\n# office\n");
  const [countryBlock, setCountryBlock] = useState("KP, IR, SY");

  const update = (id: string, p: Partial<Rule>) => setRules((s) => s.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRules((s) => s.filter((r) => r.id !== id));
  const add = () =>
    setRules((s) => [
      ...s,
      { id: Math.random().toString(36).slice(2), name: "New rule", endpoint: "GET /", scope: "ip", limit: 100, window: "1m", action: "log", enabled: false, burst: 0 },
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" /> Abuse & Rate-limit Rules
        </h1>
        <p className="text-sm text-muted-foreground">
          Stop bots, scrapers, brute-force, spam swipes, mass DMs, and API abuse with composable rules and adaptive scoring.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat icon={<Activity className="h-4 w-4" />} label="Requests blocked (24h)" value="14,210" />
        <Stat icon={<Bot className="h-4 w-4" />} label="Bot challenges issued" value="3,082" />
        <Stat icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />} label="Accounts shadowbanned" value="47" />
        <Stat icon={<Zap className="h-4 w-4" />} label="Avg detection latency" value="11ms" />
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Rate-limit rules</TabsTrigger>
          <TabsTrigger value="bot">Bot & device</TabsTrigger>
          <TabsTrigger value="lists">IP / country lists</TabsTrigger>
          <TabsTrigger value="content">Content abuse</TabsTrigger>
          <TabsTrigger value="incidents">Live incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-3 pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Rules</CardTitle>
                <CardDescription>Evaluated top-to-bottom; first match wins.</CardDescription>
              </div>
              <Button size="sm" onClick={add} className="gap-1"><Plus className="h-4 w-4" /> Add rule</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 w-10">On</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Endpoint</th>
                      <th className="px-3 py-2">Scope</th>
                      <th className="px-3 py-2 w-24">Limit</th>
                      <th className="px-3 py-2 w-24">Window</th>
                      <th className="px-3 py-2 w-24">Burst</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rules.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-1.5"><Switch checked={r.enabled} onCheckedChange={(v) => update(r.id, { enabled: v })} /></td>
                        <td className="px-3 py-1.5"><Input className="h-8" value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} /></td>
                        <td className="px-3 py-1.5"><Input className="h-8 font-mono text-xs" value={r.endpoint} onChange={(e) => update(r.id, { endpoint: e.target.value })} /></td>
                        <td className="px-3 py-1.5">
                          <Select value={r.scope} onValueChange={(v) => update(r.id, { scope: v as Rule["scope"] })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ip">IP</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="ip_user">IP + User</SelectItem>
                              <SelectItem value="device">Device fingerprint</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-1.5"><Input className="h-8" type="number" value={r.limit} onChange={(e) => update(r.id, { limit: Number(e.target.value) })} /></td>
                        <td className="px-3 py-1.5">
                          <Select value={r.window} onValueChange={(v) => update(r.id, { window: v as Window })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1m">1 min</SelectItem><SelectItem value="5m">5 min</SelectItem>
                              <SelectItem value="1h">1 hour</SelectItem><SelectItem value="24h">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-1.5"><Input className="h-8" type="number" value={r.burst} onChange={(e) => update(r.id, { burst: Number(e.target.value) })} /></td>
                        <td className="px-3 py-1.5">
                          <Select value={r.action} onValueChange={(v) => update(r.id, { action: v as Action })}>
                            <SelectTrigger className="h-8"><Badge variant={actionVariant[r.action]}>{r.action}</Badge></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="log">log</SelectItem>
                              <SelectItem value="challenge">challenge (CAPTCHA)</SelectItem>
                              <SelectItem value="throttle">throttle (429)</SelectItem>
                              <SelectItem value="block">block</SelectItem>
                              <SelectItem value="shadowban">shadowban</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-1.5 text-right"><Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Bot detection</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Block threshold (bot score 0–100): <strong>{botScore[0]}</strong></Label>
                <Slider value={botScore} onValueChange={setBotScore} max={100} step={5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Higher = stricter. Score combines TLS fingerprint, headless detection, behavioral signals.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Toggle title="Challenge with hCaptcha when score > threshold" defaultOn />
                <Toggle title="Block known datacenter ASNs (AWS, GCP, Azure, OVH)" defaultOn />
                <Toggle title="Block headless browsers (Puppeteer/Playwright fingerprint)" defaultOn />
                <Toggle title="Require WebAuthn for repeat-offender accounts" />
                <Toggle title="Device fingerprint binding (account ↔ device)" defaultOn />
                <Toggle title="Honeypot fields on forms" defaultOn />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Anonymizing networks</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <ToggleControlled title="Block Tor exit nodes" value={tor} onChange={setTor} />
              <ToggleControlled title="Block known VPNs / residential proxies" value={vpn} onChange={setVpn} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">IP / CIDR / ASN deny-list</CardTitle></CardHeader>
              <CardContent><Textarea rows={8} className="font-mono text-xs" value={denyList} onChange={(e) => setDenyList(e.target.value)} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">IP / CIDR allow-list (skip all rules)</CardTitle></CardHeader>
              <CardContent><Textarea rows={8} className="font-mono text-xs" value={allowList} onChange={(e) => setAllowList(e.target.value)} /></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Network className="h-4 w-4" /> Country geo-blocks (ISO-2)</CardTitle></CardHeader>
            <CardContent>
              <Input value={countryBlock} onChange={(e) => setCountryBlock(e.target.value)} className="font-mono" />
              <p className="text-xs text-muted-foreground mt-2">Sanctions / OFAC list applied automatically in addition.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Content & behavioral abuse</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Toggle title="Auto-shadowban accounts after 5 reports/24h" defaultOn />
              <Toggle title="Block duplicate-message spam (Levenshtein < 0.1)" defaultOn />
              <Toggle title="Limit new-account DMs to non-connections" defaultOn />
              <Toggle title="Block link-only profiles for first 7 days" defaultOn />
              <Toggle title="OCR profile images for spam phone numbers" defaultOn />
              <Toggle title="AI moderation on bio / posts (toxicity ≥ 0.85)" defaultOn />
              <Toggle title="Block payments from new accounts < 24h old above $500" defaultOn />
              <Toggle title="Disposable email domain block (mailinator etc.)" defaultOn />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent triggers</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Rule</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Hits</th><th className="px-3 py-2">Action</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { w: "2m ago", r: "Login brute-force", s: "ip 203.0.113.42", h: 18, a: "challenge" as Action },
                      { w: "11m ago", r: "Swipe spam", s: "user u_91nx2", h: 412, a: "throttle" as Action },
                      { w: "23m ago", r: "DM spam", s: "user u_zcd8a", h: 67, a: "shadowban" as Action },
                      { w: "44m ago", r: "Public API global", s: "ip 198.51.100.7", h: 2014, a: "block" as Action },
                      { w: "1h ago", r: "Signup spam", s: "ASN 14061", h: 31, a: "block" as Action },
                    ].map((x, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 text-muted-foreground">{x.w}</td>
                        <td className="px-3 py-2">{x.r}</td>
                        <td className="px-3 py-2 font-mono text-xs">{x.s}</td>
                        <td className="px-3 py-2">{x.h.toLocaleString()}</td>
                        <td className="px-3 py-2"><Badge variant={actionVariant[x.a]}>{x.a}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span>{icon}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </CardContent></Card>
  );
}
function Toggle({ title, defaultOn }: { title: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30">
      <span>{title}</span><Switch checked={on} onCheckedChange={setOn} />
    </label>
  );
}
function ToggleControlled({ title, value, onChange }: { title: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30">
      <span>{title}</span><Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}

export default AbuseRules;
