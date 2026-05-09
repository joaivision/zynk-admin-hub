import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Mail, Smartphone, Search, Shield, AlertTriangle, Lock, RefreshCw } from "lucide-react";

export function ResetPassword() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Trigger secure password resets, force re-auth, and manage credential policies.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" />Trigger reset for a user</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User lookup</Label>
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Email, phone, UID or @handle…" className="pl-9" /></div>
            </div>
            <div>
              <Label>Reset method</Label>
              <Select defaultValue="email">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><Mail className="inline h-3.5 w-3.5 mr-1.5" />Email magic link (default)</SelectItem>
                  <SelectItem value="sms"><Smartphone className="inline h-3.5 w-3.5 mr-1.5" />SMS OTP</SelectItem>
                  <SelectItem value="both">Email + SMS (high-risk)</SelectItem>
                  <SelectItem value="manual">Manual temporary password (audited)</SelectItem>
                  <SelectItem value="passkey">Issue new passkey enrolment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Link expiry</Label><Select defaultValue="60"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="1440">24 hours</SelectItem></SelectContent></Select></div>
              <div><Label>Max uses</Label><Select defaultValue="1"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Single use</SelectItem><SelectItem value="3">3 uses</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2 rounded-md border p-3">
              <Toggle label="Force logout on all devices" on />
              <Toggle label="Invalidate active sessions & tokens" on />
              <Toggle label="Require 2FA re-enrolment" />
              <Toggle label="Require fresh KYC on next login" />
              <Toggle label="Notify user via secondary channel" on />
              <Toggle label="Add security alert to user's audit log" on />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Send dry-run preview</Button>
              <Button className="gap-1"><RefreshCw className="h-4 w-4" />Send reset</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Security context</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Last successful login" value="Today, 09:14 · Dubai" />
              <Row label="Last password change" value="86 days ago" />
              <Row label="Failed attempts (24h)" value="0" />
              <Row label="Active sessions" value="3 devices" />
              <Row label="2FA status" value="Enabled (TOTP + SMS)" />
              <Row label="Passkeys enrolled" value="2 (iCloud, Yubikey)" />
              <Row label="Risk score" value={<Badge variant="default">Low (14)</Badge>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Anti-abuse</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Resets requested in last 7d: <b className="text-foreground">2,431</b></p>
              <p>Suspicious bursts blocked: <b className="text-foreground">87</b></p>
              <p>Geo-velocity holds: <b className="text-foreground">12</b></p>
              <p>Account-takeover attempts (ATO): <b className="text-foreground">4 escalated</b></p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Password & credential policy</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            "Minimum length 12 chars",
            "Require mixed case + number + symbol",
            "Block top 100k breached passwords (HIBP)",
            "Block reuse of last 10 passwords",
            "Mandatory rotation every 365 days (admins: 90)",
            "Lockout after 5 failed attempts (15-min cool down)",
            "Require step-up auth for sensitive actions (payment, KYC, profile email)",
            "Encourage passkey adoption (WebAuthn)",
            "SMS OTP disabled in high-fraud regions (fallback to email)",
            "Detect credential stuffing (rate-limit by IP+ASN+device)",
          ].map((p) => (
            <div key={p} className="flex items-center justify-between rounded-md border p-3">
              <Label className="text-sm font-normal">{p}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent reset activity</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Method</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Initiated by</th><th className="px-3 py-2 text-left">When</th></tr></thead>
            <tbody className="divide-y">
              {[
                ["@aarav.r", "Email magic link", "Used", "self", "12m ago"],
                ["@noor_x", "SMS OTP", "Sent", "admin:rajiv", "1h ago"],
                ["@dev_jonas", "Email + SMS", "Expired", "self", "3h ago"],
                ["@founder_a", "Manual temp pwd", "Used", "admin:noor", "1d ago"],
                ["@trader_z", "Email", "Blocked (rate-limit)", "self", "1d ago"],
              ].map((r, i) => (
                <tr key={i} className="hover:bg-muted/30"><td className="px-3 py-2 font-medium">{r[0]}</td><td className="px-3 py-2">{r[1]}</td><td className="px-3 py-2"><Badge variant={r[2] === "Used" ? "default" : r[2].includes("Block") ? "destructive" : "secondary"}>{r[2]}</Badge></td><td className="px-3 py-2">{r[3]}</td><td className="px-3 py-2 text-muted-foreground">{r[4]}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return <div className="flex items-center justify-between"><Label className="text-sm font-normal">{label}</Label><Switch defaultChecked={on} /></div>;
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
