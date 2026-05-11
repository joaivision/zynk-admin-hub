import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ShieldCheck, Fingerprint, Smartphone, Key, AlertTriangle, RefreshCw, MapPin, Wifi, Clock, KeyRound } from "lucide-react";

const METHODS = [
  { method: "Hardware key (FIDO2 / WebAuthn — YubiKey, Titan)", strength: "Phishing-resistant", on: true, locked: true, role: "All admins" },
  { method: "Platform passkey (Touch ID, Windows Hello, Face ID)", strength: "Phishing-resistant", on: true, locked: false, role: "All admins" },
  { method: "TOTP authenticator (Authy, 1Password, Google Auth)", strength: "Strong", on: true, locked: false, role: "Tier 2–3 only" },
  { method: "Push notification (Duo / Okta Verify)", strength: "Strong (verify number-match)", on: true, locked: false, role: "Tier 2–3 only" },
  { method: "Backup codes (one-time)", strength: "Recovery only", on: true, locked: false, role: "Sealed envelope" },
  { method: "SMS / voice OTP", strength: "Weak (SIM-swap risk)", on: false, locked: true, role: "Blocked for admins" },
  { method: "Email OTP", strength: "Weak", on: false, locked: true, role: "Blocked for admins" },
];

const ADMINS_2FA = [
  { name: "Noor Al-Hashimi", role: "Super Admin", primary: "YubiKey 5C NFC", backup: "Touch ID + 8 backup codes", lastUsed: "2 min ago", status: "OK" },
  { name: "Sara Kim", role: "CISO", primary: "Titan Key + YubiKey", backup: "Backup codes (sealed)", lastUsed: "12 min ago", status: "OK" },
  { name: "David Chen", role: "T&S Lead", primary: "Authy TOTP", backup: "Backup codes", lastUsed: "1h ago", status: "Upgrade required" },
  { name: "Maria Lopez", role: "Support T2", primary: "Touch ID passkey", backup: "Backup codes", lastUsed: "3h ago", status: "OK" },
  { name: "Yusuf Al-Mahdi", role: "Data Engineer", primary: "YubiKey 5C", backup: "Backup codes (5 unused)", lastUsed: "Yesterday", status: "OK" },
  { name: "Carlos Mendes", role: "JIT Engineer", primary: "Hardware key (loaner)", backup: "—", lastUsed: "3h ago", status: "Loaner key — return Tue" },
];

export function AdminTwoFactor() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">2FA / MFA for Admins</h1>
          <p className="text-sm text-muted-foreground">Phishing-resistant multi-factor authentication, step-up auth for sensitive actions, and continuous device posture verification. SMS / email OTP are explicitly blocked for admin accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4" />Force re-enrollment</Button>
          <Button size="sm" className="gap-1"><KeyRound className="h-4 w-4" />Issue hardware key</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KPI label="Hardware-key coverage" value="100%" hint="Required since Jan 2025" tone="ok" />
        <KPI label="Passkeys enrolled" value="38 / 42" hint="4 admins on TOTP fallback" />
        <KPI label="Step-up challenges (24h)" value="184" hint="98.4% success" />
        <KPI label="Recovery requests open" value="1" hint="Pending CISO approval" tone="warn" />
      </div>

      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">Methods Policy</TabsTrigger>
          <TabsTrigger value="enrollment">Admin Enrollment</TabsTrigger>
          <TabsTrigger value="stepup">Step-up Auth</TabsTrigger>
          <TabsTrigger value="session">Session & Device</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Allowed authentication factors</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Method</th><th className="px-3 py-2 text-left">Strength</th><th className="px-3 py-2 text-left">Applies to</th><th className="px-3 py-2 text-right">Enabled</th></tr></thead>
                <tbody className="divide-y">
                  {METHODS.map((m) => (
                    <tr key={m.method} className={m.strength.includes("Weak") ? "bg-destructive/5" : ""}>
                      <td className="px-3 py-2 font-medium">{m.method}</td>
                      <td className="px-3 py-2"><Badge variant={m.strength.includes("Phishing") ? "default" : m.strength.includes("Weak") ? "destructive" : m.strength.includes("Recovery") ? "outline" : "secondary"}>{m.strength}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{m.role}</td>
                      <td className="px-3 py-2 text-right"><Switch defaultChecked={m.on} disabled={m.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <span>Following NIST SP 800-63B Authenticator Assurance Level 3 (AAL3) and CISA Zero Trust guidance. SMS / email OTP are blocked for all admin tiers due to SIM-swap and phishing exposure.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Fingerprint className="h-4 w-4" />Per-admin MFA enrollment</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">Admin</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Primary factor</th><th className="px-3 py-2 text-left">Backup</th><th className="px-3 py-2 text-left">Last used</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right"></th></tr></thead>
                <tbody className="divide-y">
                  {ADMINS_2FA.map((a) => (
                    <tr key={a.name} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.role}</td>
                      <td className="px-3 py-2 text-xs">{a.primary}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.backup}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.lastUsed}</td>
                      <td className="px-3 py-2"><Badge variant={a.status === "OK" ? "default" : "secondary"}>{a.status}</Badge></td>
                      <td className="px-3 py-2 text-right"><Button variant="ghost" size="sm">Reset</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stepup" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" />Step-up MFA triggers</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Reveal masked PII (email, phone, IBAN, gov ID)", true, true],
                ["Bulk export &gt; 100 customer records", true, true],
                ["Issue refund &gt; $1,000 / equivalent", true, true],
                ["Suspend or delete user account", true, true],
                ["Edit role assignments / grant new permission", true, true],
                ["Edit feature flags affecting &gt; 5% of users", true, false],
                ["Access audit log raw export", true, true],
                ["Modify payout ledger / financial entries", true, true],
                ["Login from new device or new geography", true, true],
                ["Login after 2+ hours of inactivity", true, false],
                ["Any access to Secrets Vault / API keys", true, true],
                ["Connecting to production database", true, true],
              ].map(([label, on, locked]) => (
                <div key={label as string} className="flex items-center justify-between rounded-md border p-2">
                  <Label className="text-sm font-normal flex items-center gap-2">
                    <span dangerouslySetInnerHTML={{ __html: label as string }} />
                    {locked && <Badge variant="outline" className="text-[10px] py-0">policy-locked</Badge>}
                  </Label>
                  <Switch defaultChecked={on as boolean} disabled={locked as boolean} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Re-auth cadence</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
              <Field label="Idle timeout"><Select defaultValue="15"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5 minutes</SelectItem><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem></SelectContent></Select></Field>
              <Field label="Hard session expiry"><Select defaultValue="8"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="4">4 hours</SelectItem><SelectItem value="8">8 hours (1 shift)</SelectItem><SelectItem value="12">12 hours</SelectItem></SelectContent></Select></Field>
              <Field label="Re-prove identity (full MFA)"><Select defaultValue="24"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="12">Every 12h</SelectItem><SelectItem value="24">Every 24h</SelectItem><SelectItem value="72">Every 3 days</SelectItem></SelectContent></Select></Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" />Device posture (continuous)</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Require managed device (MDM enrollment) — Jamf / Intune" on locked />
                <Toggle label="Require disk encryption (FileVault / BitLocker)" on locked />
                <Toggle label="Require OS up-to-date (≤ 30 days old patches)" on />
                <Toggle label="Require EDR running (CrowdStrike / SentinelOne)" on />
                <Toggle label="Block jailbroken / rooted mobile devices" on locked />
                <Toggle label="Block screen sharing during PII reveal" on />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Network & geography</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Toggle label="Require corporate VPN or office IP for Tier 0 / 1" on locked />
                <Toggle label="Block residential VPN / Tor / proxy networks" on />
                <Toggle label="Block impossible travel (login from 2 countries &lt; 1h)" on />
                <Toggle label="Geo-fence: block listed sanctioned regions (OFAC)" on locked />
                <Toggle label="Alert on first-time country (notify admin + CISO)" on />
                <div className="rounded-md border p-2 flex items-center gap-2 text-xs"><Wifi className="h-3 w-3" /><span className="text-muted-foreground">Risk score: combine device + network + behavior into adaptive challenge</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4" />Account recovery flow (anti-social-engineering)</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Step n="1" title="Open ticket via corporate email" detail="Self-serve form blocked; ticket must originate from corp IDP." />
              <Step n="2" title="Manager confirms identity" detail="Live video call required. Confirm against HR record + last paystub claim." />
              <Step n="3" title="Security team verifies" detail="Pose KBA challenge from secure store (not public/HR data)." />
              <Step n="4" title="Issue temporary token (1h)" detail="Single-use, IP-restricted to known network. Records full session." />
              <Step n="5" title="Force re-enrollment of new factor" detail="Old factors auto-revoked. Backup codes regenerated and sealed." />
              <Step n="6" title="Post-recovery audit" detail="CISO + DPO reviewed within 24h. Logged in immutable audit trail." />
              <div className="rounded-md border bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span><strong>Lessons from MGM, Twilio, Reddit, LinkedIn 2024 incidents:</strong> Help desk MUST NOT reset MFA via phone. Voice / chat-only requests are auto-rejected.</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3 pt-2">
                <KPIMini label="Recovery SLA" value="4–24h" />
                <KPIMini label="Avg time-to-recover (90d)" value="6.2h" />
                <KPIMini label="Recovery requests denied (suspected social eng.)" value="3 (90d)" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "warn" | "ok" }) {
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${tone === "warn" ? "text-amber-600" : tone === "ok" ? "text-emerald-600" : ""}`}>{value}</div><div className="mt-1 text-xs text-muted-foreground">{hint}</div></CardContent></Card>;
}
function KPIMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="text-sm font-semibold">{value}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Toggle({ label, on, locked }: { label: string; on?: boolean; locked?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal flex items-center gap-2">{label}{locked && <Badge variant="outline" className="text-[10px] py-0">policy-locked</Badge>}</Label><Switch defaultChecked={on} disabled={locked} /></div>;
}
function Step({ n, title, detail }: { n: string; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">{n}</div>
      <div className="flex-1 -mt-0.5"><div className="font-medium text-sm">{title}</div><div className="text-xs text-muted-foreground">{detail}</div></div>
    </div>
  );
}
// Progress unused import safeguard
void Progress;
