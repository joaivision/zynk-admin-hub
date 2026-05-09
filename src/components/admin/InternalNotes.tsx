import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyNote, Pin, AtSign, Lock, Search, Tag, Eye, Paperclip, AlertCircle } from "lucide-react";

const NOTES = [
  { id: 1, who: "noor", initials: "NS", at: "2h ago", visibility: "team", tag: "trust-safety", pinned: true, body: "User flagged 3x for spam in 24h. Reviewed messages — boilerplate copy/paste to investors. Issued 7-day suspension. Awaiting appeal." },
  { id: 2, who: "rajiv", initials: "RA", at: "1d ago", visibility: "admin-only", tag: "vip", pinned: true, body: "VIP — referred by @adi_vc. Handle escalations personally. Direct line: …" },
  { id: 3, who: "support", initials: "SP", at: "3d ago", visibility: "team", tag: "support", pinned: false, body: "Reported login issues on Android 14. Cleared session, advised to re-enroll passkey. Resolved." },
  { id: 4, who: "finance", initials: "FN", at: "6d ago", visibility: "finance", tag: "billing", pinned: false, body: "Refunded $29 (Pro renewal) as goodwill — service outage 2 May. Stripe charge ch_3Nx…" },
  { id: 5, who: "compliance", initials: "CP", at: "11d ago", visibility: "compliance", tag: "kyc", pinned: false, body: "PEP screening — false positive (homonym). Cleared after manual review of DOB+address." },
];

export function InternalNotes() {
  const [text, setText] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Notes</h1>
          <p className="text-sm text-muted-foreground">Private CRM-style notes on user accounts. Never visible to the user. Fully audited.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search notes across all users…" /></div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" />Notes for @aarav.r · usr_8f3a91b2</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" />Encrypted at rest · audited</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-md border p-3">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Add a note. Use @mentions to ping teammates, #tags to categorize." />
            <div className="flex flex-wrap items-center gap-2">
              <Select defaultValue="team">
                <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin-only">Visible: Admins only</SelectItem>
                  <SelectItem value="team">Visible: Trust & Safety team</SelectItem>
                  <SelectItem value="support">Visible: Support team</SelectItem>
                  <SelectItem value="finance">Visible: Finance team</SelectItem>
                  <SelectItem value="compliance">Visible: Compliance team</SelectItem>
                  <SelectItem value="all-staff">Visible: All staff</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="general">
                <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">#general</SelectItem>
                  <SelectItem value="trust-safety">#trust-safety</SelectItem>
                  <SelectItem value="kyc">#kyc</SelectItem>
                  <SelectItem value="billing">#billing</SelectItem>
                  <SelectItem value="vip">#vip</SelectItem>
                  <SelectItem value="legal">#legal</SelectItem>
                  <SelectItem value="support">#support</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-8 gap-1"><AtSign className="h-3.5 w-3.5" />Mention</Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1"><Paperclip className="h-3.5 w-3.5" />Attach</Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1"><Pin className="h-3.5 w-3.5" />Pin</Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1"><AlertCircle className="h-3.5 w-3.5" />Mark important</Button>
              <div className="ml-auto"><Button size="sm">Post note</Button></div>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({NOTES.length})</TabsTrigger>
              <TabsTrigger value="pinned">Pinned ({NOTES.filter((n) => n.pinned).length})</TabsTrigger>
              <TabsTrigger value="mine">Mine</TabsTrigger>
              <TabsTrigger value="ts">#trust-safety</TabsTrigger>
              <TabsTrigger value="kyc">#kyc</TabsTrigger>
              <TabsTrigger value="billing">#billing</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-4 space-y-3">
              {NOTES.map((n) => (
                <div key={n.id} className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-primary/10 text-primary">{n.initials}</AvatarFallback></Avatar>
                    <div className="text-sm font-medium">@{n.who}</div>
                    <span className="text-xs text-muted-foreground">{n.at}</span>
                    <Badge variant="outline" className="gap-1 text-xs"><Eye className="h-3 w-3" />{n.visibility}</Badge>
                    <Badge variant="secondary" className="gap-1 text-xs"><Tag className="h-3 w-3" />#{n.tag}</Badge>
                    {n.pinned && <Badge variant="default" className="gap-1 text-xs"><Pin className="h-3 w-3" />Pinned</Badge>}
                    <div className="ml-auto flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Reply</Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{n.body}</p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="pinned" className="pt-4 text-sm text-muted-foreground">Showing pinned notes only.</TabsContent>
            <TabsContent value="mine" className="pt-4 text-sm text-muted-foreground">Showing notes you authored.</TabsContent>
            <TabsContent value="ts" className="pt-4 text-sm text-muted-foreground">Filtered by #trust-safety.</TabsContent>
            <TabsContent value="kyc" className="pt-4 text-sm text-muted-foreground">Filtered by #kyc.</TabsContent>
            <TabsContent value="billing" className="pt-4 text-sm text-muted-foreground">Filtered by #billing.</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Note governance</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• All notes are <b className="text-foreground">encrypted at rest</b> (AES-256) and excluded from user data exports.</p>
            <p>• <b className="text-foreground">Edits are versioned</b>; deletes are soft and recoverable for 90 days.</p>
            <p>• <b className="text-foreground">Visibility groups</b> enforce least-privilege — finance notes invisible to support, etc.</p>
            <p>• Notes containing PII are auto-masked in audit exports.</p>
            <p>• Authors and viewers are logged for SOC 2 / ISO 27001.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Auto-generated notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              "KYC events (submitted/approved/rejected/expired)",
              "Payment events (chargeback, refund, plan change)",
              "Moderation actions (suspend, ban, shadowban)",
              "Account security (password reset, 2FA changes, new device)",
              "Risk model alerts (score >70)",
              "Manual support contacts (email/ticket sync)",
            ].map((s) => (
              <div key={s} className="flex items-center justify-between rounded-md border p-2">
                <span>{s}</span><Badge variant="secondary">enabled</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
