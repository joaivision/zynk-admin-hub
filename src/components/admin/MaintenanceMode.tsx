import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Power, Wrench, ShieldCheck, Globe, Users, Clock, Plus, Trash2 } from "lucide-react";

type Scope = "full" | "writes_only" | "reads_only" | "module";
type Audience = "everyone" | "anonymous" | "non_admins" | "by_country" | "by_plan";

const MODULES = [
  "Auth / Signup", "Matching", "Messaging", "Mentorship Bookings",
  "Payments", "Investor Deal Flow", "Data Room", "Events", "Talent / Jobs",
  "Marketplace / RFQ", "AI Tools", "Public API",
];

export function MaintenanceMode() {
  const [enabled, setEnabled] = useState(false);
  const [scope, setScope] = useState<Scope>("writes_only");
  const [audience, setAudience] = useState<Audience>("non_admins");
  const [modules, setModules] = useState<string[]>(["Payments"]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [title, setTitle] = useState("Scheduled maintenance in progress");
  const [message, setMessage] = useState(
    "We're upgrading our systems to make Zynk faster and safer. Service will resume shortly. Follow @zynk for live updates.",
  );
  const [allowIPs, setAllowIPs] = useState("203.0.113.0/24\n198.51.100.42");
  const [retryAfter, setRetryAfter] = useState(900);
  const [statusPage, setStatusPage] = useState("https://status.zynk.ing");
  const [supportEmail, setSupportEmail] = useState("support@zynk.ing");
  const [killSwitch, setKillSwitch] = useState(false);

  const toggleModule = (m: string) =>
    setModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6" /> Maintenance Mode
        </h1>
        <p className="text-sm text-muted-foreground">
          Gracefully take parts of the platform offline for upgrades, incident response, or scheduled work.
        </p>
      </div>

      <Card className={enabled ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Power className={`h-4 w-4 ${enabled ? "text-yellow-600" : "text-muted-foreground"}`} />
              Master switch
            </CardTitle>
            <CardDescription>
              {enabled ? (
                <>Maintenance is <Badge variant="secondary">ACTIVE</Badge> — affected users see your banner.</>
              ) : (
                "Turn on to start serving the maintenance response to selected audiences."
              )}
            </CardDescription>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scope</CardTitle>
            <CardDescription>What is restricted while maintenance is active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Restriction level</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full outage (HTTP 503 site-wide)</SelectItem>
                  <SelectItem value="writes_only">Read-only (block POST/PUT/DELETE)</SelectItem>
                  <SelectItem value="reads_only">Block reads only (rare)</SelectItem>
                  <SelectItem value="module">Per-module maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === "module" && (
              <div className="grid gap-2">
                <Label>Modules under maintenance</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map((m) => (
                    <label key={m} className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/30">
                      <Switch checked={modules.includes(m)} onCheckedChange={() => toggleModule(m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-1.5">
              <Label>Affected audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="non_admins">Everyone except admins</SelectItem>
                  <SelectItem value="anonymous">Anonymous (logged-out) only</SelectItem>
                  <SelectItem value="by_country">By country</SelectItem>
                  <SelectItem value="by_plan">By subscription plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Allow-list IPs / CIDR (always bypassed)</Label>
              <Textarea rows={3} value={allowIPs} onChange={(e) => setAllowIPs(e.target.value)} className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Window & response</CardTitle>
            <CardDescription>Schedule and what users see / receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Start</Label><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>End (auto-disable)</Label><Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            </div>
            <div className="grid gap-1.5">
              <Label>Banner title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Message shown to users</Label>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>HTTP Retry-After (seconds)</Label>
                <Input type="number" value={retryAfter} onChange={(e) => setRetryAfter(Number(e.target.value))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Status page URL</Label>
                <Input value={statusPage} onChange={(e) => setStatusPage(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Support email shown to users</Label>
              <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Toggle title="Email registered users 30 min before window" />
          <Toggle title="Push in-app banner 24h before" defaultOn />
          <Toggle title="Post to status page automatically" defaultOn />
          <Toggle title="Notify partner apps via webhook" defaultOn />
          <Toggle title="Slack #ops channel alert" defaultOn />
          <Toggle title="Pause outbound emails during window" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Scheduled windows</CardTitle>
          <CardDescription>Upcoming and recent maintenance windows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Scope</th><th className="px-4 py-3">Window</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { t: "Postgres major upgrade", s: "Read-only", w: "May 12, 02:00–03:00 UTC", st: "scheduled" },
                  { t: "Payments router patch", s: "Module: Payments", w: "May 09, 04:00–04:20 UTC", st: "completed" },
                  { t: "Search reindex", s: "Module: Matching", w: "May 02, 01:00–01:45 UTC", st: "completed" },
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.t}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.s}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.w}</td>
                    <td className="px-4 py-3"><Badge variant={r.st === "scheduled" ? "secondary" : "outline"}>{r.st}</Badge></td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" className="mt-3 gap-1"><Plus className="h-4 w-4" /> Schedule window</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Emergency kill switch</CardTitle>
          <CardDescription>Immediately disable all writes platform-wide. Use only during active incident.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Requires re-authentication and a recorded incident reference.
          </div>
          <Switch checked={killSwitch} onCheckedChange={setKillSwitch} />
        </CardContent>
      </Card>

      <Separator />
      <div className="flex justify-end gap-2">
        <Button variant="outline">Discard</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  );
}

function Toggle({ title, defaultOn }: { title: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30">
      <span>{title}</span>
      <Switch checked={on} onCheckedChange={setOn} />
    </label>
  );
}

export default MaintenanceMode;
