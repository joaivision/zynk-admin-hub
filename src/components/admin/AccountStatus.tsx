import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, AlertTriangle, Ban, UserX, Pause, Trash2, Archive, Eye, ShieldAlert } from "lucide-react";

const STATUSES = [
  { key: "active", label: "Active", icon: CheckCircle2, count: 124_812, color: "bg-emerald-500", desc: "Normal access. All features enabled." },
  { key: "pending_email", label: "Pending Email", icon: Clock, count: 1_204, color: "bg-amber-500", desc: "Email verification not yet completed." },
  { key: "pending_kyc", label: "Pending KYC", icon: Clock, count: 612, color: "bg-amber-500", desc: "KYC documents under review." },
  { key: "incomplete", label: "Incomplete Profile", icon: AlertTriangle, count: 4_321, color: "bg-amber-500", desc: "<60% profile completion. Limited matches." },
  { key: "restricted", label: "Restricted", icon: ShieldAlert, count: 142, color: "bg-orange-500", desc: "Read-only. Cannot post / message / pay." },
  { key: "shadowbanned", label: "Shadowbanned", icon: Eye, count: 38, color: "bg-violet-500", desc: "User unaware. Content hidden from others." },
  { key: "suspended", label: "Suspended", icon: Pause, count: 87, color: "bg-rose-500", desc: "Login blocked. Visible 'suspended' notice." },
  { key: "banned", label: "Permanently Banned", icon: Ban, count: 23, color: "bg-rose-700", desc: "Hard ban. Device/email/payment blacklisted." },
  { key: "deactivated", label: "Self-Deactivated", icon: UserX, count: 312, color: "bg-slate-500", desc: "User chose to leave. 30-day reactivation window." },
  { key: "archived", label: "Archived (Dormant)", icon: Archive, count: 8_120, color: "bg-slate-400", desc: "No activity 365d+. Excluded from matching." },
  { key: "deleted", label: "Erased (GDPR)", icon: Trash2, count: 76, color: "bg-zinc-700", desc: "Right-to-be-forgotten executed. Anonymized." },
];

export function AccountStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Status</h1>
        <p className="text-sm text-muted-foreground">
          Lifecycle states governing access, visibility, and compliance for every account.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {STATUSES.map((s) => (
          <Card key={s.key}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
                <Badge variant="secondary">{s.count.toLocaleString()}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">View users</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs">Edit policy</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Status Transition Policies</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { l: "Auto-restrict if KYC expired > 30 days", on: true },
            { l: "Auto-archive after 365 days of inactivity", on: true },
            { l: "Force re-verification after 18 months", on: true },
            { l: "Block re-signup with banned email/phone/device", on: true },
            { l: "Require manual approval to reinstate banned users", on: true },
            { l: "Notify user 7 days before auto-archive", on: false },
            { l: "Auto-suspend after 3 chargebacks in 90 days", on: true },
          ].map((p) => (
            <div key={p.l} className="flex items-center justify-between rounded-md border p-3">
              <Label className="text-sm font-normal">{p.l}</Label>
              <Switch defaultChecked={p.on} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Status Changes</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
              <tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">From → To</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-left">By</th><th className="px-3 py-2 text-left">When</th></tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["@sara_vc", "Active → Restricted", "3 reports of spam", "admin:noor", "2h ago"],
                ["@dev_jonas", "Pending KYC → Active", "ID approved", "system", "4h ago"],
                ["@trader_99", "Active → Banned", "Chargeback fraud (4 in 30d)", "system+admin:rajiv", "1d ago"],
                ["@maya.k", "Suspended → Active", "Appeal accepted", "admin:rajiv", "2d ago"],
                ["@old_user", "Active → Archived", "Inactive 365d", "system", "3d ago"],
              ].map((r, i) => (
                <tr key={i} className="hover:bg-muted/30"><td className="px-3 py-2 font-medium">{r[0]}</td><td className="px-3 py-2">{r[1]}</td><td className="px-3 py-2 text-muted-foreground">{r[2]}</td><td className="px-3 py-2">{r[3]}</td><td className="px-3 py-2 text-muted-foreground">{r[4]}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
