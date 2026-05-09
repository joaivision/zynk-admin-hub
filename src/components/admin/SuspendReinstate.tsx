import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Ban, RotateCcw, ShieldAlert, Eye, Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export function SuspendReinstate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suspend / Reinstate</h1>
        <p className="text-sm text-muted-foreground">Issue moderation actions with severity, duration, and audit trail. Manage appeals and reinstatement.</p>
      </div>

      <Tabs defaultValue="action">
        <TabsList>
          <TabsTrigger value="action">New Action</TabsTrigger>
          <TabsTrigger value="suspended">Currently Suspended</TabsTrigger>
          <TabsTrigger value="appeals">Appeals Queue</TabsTrigger>
          <TabsTrigger value="bulk">Bulk / Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="action" className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Issue moderation action</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>User</Label>
                  <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by email, phone, UID, @handle…" className="pl-9" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Action type</Label>
                    <Select defaultValue="suspend">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warn">Warning (visible)</SelectItem>
                        <SelectItem value="restrict">Restrict (read-only)</SelectItem>
                        <SelectItem value="shadowban">Shadowban (silent)</SelectItem>
                        <SelectItem value="suspend">Temporary suspension</SelectItem>
                        <SelectItem value="ban">Permanent ban</SelectItem>
                        <SelectItem value="payment_block">Payment block only</SelectItem>
                        <SelectItem value="messaging_block">Messaging block only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Select defaultValue="7d">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="indef">Indefinite (until appeal)</SelectItem>
                        <SelectItem value="perm">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Reason category</Label>
                  <Select defaultValue="spam">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam / Mass messaging</SelectItem>
                      <SelectItem value="harassment">Harassment / Abuse</SelectItem>
                      <SelectItem value="fraud">Payment fraud / Chargeback</SelectItem>
                      <SelectItem value="impersonation">Impersonation / Fake identity</SelectItem>
                      <SelectItem value="kyc">KYC failure / Sanctions match</SelectItem>
                      <SelectItem value="csam">CSAM / Illegal content</SelectItem>
                      <SelectItem value="tos">ToS violation (other)</SelectItem>
                      <SelectItem value="security">Account compromise / Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Internal note (not visible to user)</Label>
                  <Textarea placeholder="Evidence summary, ticket IDs, related accounts…" rows={3} />
                </div>
                <div>
                  <Label>Message to user</Label>
                  <Textarea placeholder="Reason shown to user. Keep clear and policy-cited." rows={3} defaultValue="Your account has been temporarily suspended for violating our anti-spam policy (Sec 4.2). You may appeal within 14 days." />
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <Toggle label="Notify user via email + in-app" on />
                  <Toggle label="Block linked devices (fingerprint)" on />
                  <Toggle label="Block linked email/phone/payment methods" />
                  <Toggle label="Refund pending charges" />
                  <Toggle label="Cancel active subscription" on />
                  <Toggle label="Hide user content from feed" on />
                  <Toggle label="Require 2-admin approval (4-eyes)" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Preview impact</Button>
                  <Button variant="destructive" className="gap-1"><Ban className="h-4 w-4" />Apply action</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Severity ladder</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { i: AlertTriangle, l: "Warning", d: "Visible nudge. No restriction." },
                  { i: ShieldAlert, l: "Restrict", d: "Read-only. No posts/messages/pay." },
                  { i: Eye, l: "Shadowban", d: "Silent. Content hidden globally." },
                  { i: Clock, l: "Temp suspend", d: "Login blocked. Auto-restore." },
                  { i: Ban, l: "Permanent ban", d: "Hard ban + blacklist." },
                ].map((s) => (
                  <div key={s.l} className="flex items-start gap-2 rounded-md border p-2">
                    <s.i className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div><div className="font-medium">{s.l}</div><div className="text-xs text-muted-foreground">{s.d}</div></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suspended" className="pt-4">
          <Card><CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                <tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Action</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-left">Issued</th><th className="px-3 py-2 text-left">Expires</th><th className="px-3 py-2 text-left">By</th><th className="px-3 py-2 text-right">—</th></tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["@spam_x91", "Suspended", "Spam", "3d ago", "in 4d", "system"],
                  ["@trader_99", "Banned", "Chargeback fraud", "1d ago", "Permanent", "admin:rajiv"],
                  ["@noor_fake", "Shadowbanned", "Impersonation", "5d ago", "Indef", "admin:noor"],
                  ["@bot_loop", "Restricted", "Velocity anomaly", "12h ago", "in 6d", "system"],
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{r[0]}</td>
                    <td className="px-3 py-2"><Badge variant="destructive">{r[1]}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground">{r[2]}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r[3]}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r[4]}</td>
                    <td className="px-3 py-2">{r[5]}</td>
                    <td className="px-3 py-2 text-right"><Button variant="outline" size="sm" className="gap-1"><RotateCcw className="h-3.5 w-3.5" />Reinstate</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="appeals" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            {[
              { u: "@maya.k", a: "Suspended", r: "Says spam reports were retaliatory. Provided context.", w: "2h ago" },
              { u: "@founder_n", a: "Restricted", r: "Profile flagged as fake — has trade license to verify.", w: "8h ago" },
              { u: "@coach_s", a: "Banned", r: "Chargeback was a card test — bank confirmed fraud.", w: "1d ago" },
            ].map((ap, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{ap.u} <Badge variant="outline" className="ml-2">{ap.a}</Badge></div>
                  <span className="text-xs text-muted-foreground">{ap.w}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ap.r}</p>
                <div className="mt-3 flex gap-2 justify-end">
                  <Button variant="ghost" size="sm">Request more info</Button>
                  <Button variant="outline" size="sm">Reject appeal</Button>
                  <Button size="sm" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Approve & reinstate</Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="bulk" className="pt-4">
          <Card><CardHeader><CardTitle className="text-base">Automated suspension rules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                "Auto-suspend if 3+ valid spam reports in 24h",
                "Auto-ban if 4+ chargebacks in 90d",
                "Auto-restrict on sanctions list match (PEP/OFAC)",
                "Auto-shadowban on AI moderation score >0.92 (NSFW/abuse)",
                "Auto-suspend on >50 messages/min (bot velocity)",
                "Auto-ban on duplicate device + new email after prior ban",
              ].map((r) => (
                <div key={r} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{r}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch defaultChecked={on} />
    </div>
  );
}
