import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Mail, Phone, MapPin, Building2, Shield, Wallet, MessageSquare, KeyRound,
  Ban, UserX, RefreshCw, FileText, Eye, Download, AlertTriangle, CheckCircle2,
  Smartphone, Globe, Activity, CreditCard, Users, Calendar, Star, Sparkles, Lock,
} from "lucide-react";

export function UserDetail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">AR</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Aarav Rastogi</h1>
              <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
              <Badge variant="secondary">Pro Plan</Badge>
              <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" />Power User</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />aarav@nexa.io</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />+971 50 ••• 4421</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Dubai, UAE</span>
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />Founder · Nexa AI</span>
              <span>UID: usr_8f3a91b2</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><MessageSquare className="h-4 w-4" />Message</Button>
          <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" />Impersonate</Button>
          <Button variant="outline" size="sm" className="gap-1"><KeyRound className="h-4 w-4" />Reset Password</Button>
          <Button variant="destructive" size="sm" className="gap-1"><Ban className="h-4 w-4" />Suspend</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard label="Trust Score" value={87} hint="Top 12% in cohort" tone="primary" />
        <ScoreCard label="Risk Score" value={14} hint="Low risk" tone="success" />
        <ScoreCard label="Engagement" value={92} hint="Daily active · 41d streak" tone="primary" />
        <ScoreCard label="LTV" value={1240} display="$1,240" hint="MRR $29 · 14 mo" tone="default" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="kyc">KYC & Docs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="connections">Network</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="risk">Risk & Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-3 pt-4">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Identity & Verification</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Stakeholder type" value="Founder · seeking Series A" />
              <Row label="Industry" value="AI / Fintech" />
              <Row label="Joined" value="Apr 12, 2024" />
              <Row label="Last active" value="2 hours ago" />
              <Row label="Signup source" value="Google Ads · UAE" />
              <Row label="Referral code" value="AAFOUNDER25 (12 referred)" />
              <Row label="Languages" value="English, Hindi, Arabic" />
              <Row label="Time zone" value="Asia/Dubai (GMT+4)" />
              <Separator className="col-span-2" />
              <Row label="Email" value="✓ Verified · Apr 12" icon={Mail} />
              <Row label="Phone" value="✓ Verified · Apr 12" icon={Phone} />
              <Row label="Government ID" value="✓ Emirates ID · Approved" icon={Shield} />
              <Row label="Selfie / Liveness" value="✓ Passed · 99.4%" icon={Eye} />
              <Row label="Address proof" value="✓ DEWA bill · Approved" icon={FileText} />
              <Row label="Sanctions / PEP" value="✓ Clean (refreshed 7d ago)" icon={CheckCircle2} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <ActionBtn icon={RefreshCw} label="Force re-KYC" />
              <ActionBtn icon={Sparkles} label="Award credits" />
              <ActionBtn icon={Lock} label="Toggle 2FA" />
              <ActionBtn icon={UserX} label="Shadowban" />
              <ActionBtn icon={Download} label="Export user data (GDPR)" />
              <ActionBtn icon={AlertTriangle} label="Forget user (right to erasure)" tone="destructive" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <Card><CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
            <Row label="Headline" value="Building Nexa AI · ex-Stripe · IIT Bombay" />
            <Row label="Bio" value="Helping MENA fintechs ship LLM products faster." />
            <Row label="Skills" value="LLMs, Product, GTM, Fundraising" />
            <Row label="Open to" value="Investment, Co-founders, Talent" />
            <Row label="Cheque size" value="N/A (raising)" />
            <Row label="Stage" value="Seed → Series A" />
            <Row label="Profile completeness" value="94%" />
            <Row label="Profile boosts" value="3 active · expires in 4d" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="kyc" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            {["Emirates ID — Approved · Apr 12", "Passport — Approved · Apr 12", "Selfie liveness — 99.4% · Apr 12", "Address (DEWA bill) — Approved · Apr 14", "Company trade license — Pending review"].map((d) => (
              <div key={d} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{d}</span>
                <div className="flex gap-2"><Button variant="outline" size="sm">View</Button><Button variant="ghost" size="sm">Re-request</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3">
            {[
              { i: Activity, t: "Swiped right on @sara_vc · matched", at: "2h ago" },
              { i: MessageSquare, t: "Sent 4 messages in Investor Club", at: "5h ago" },
              { i: Calendar, t: "Booked 30-min session with expert @ravi", at: "1d ago" },
              { i: CreditCard, t: "Renewed Pro plan · $29 · Stripe", at: "3d ago" },
              { i: Users, t: "Joined event 'MENA Founders Mixer'", at: "4d ago" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0">
                <e.i className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{e.t}</span>
                <span className="text-xs text-muted-foreground">{e.at}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="connections" className="pt-4">
          <Card><CardContent className="pt-6 grid grid-cols-3 gap-4 text-sm">
            <Stat label="Connections" value="412" />
            <Stat label="Pending requests" value="23" />
            <Stat label="Followers" value="1,847" />
            <Stat label="Matches (90d)" value="56" />
            <Stat label="Sessions booked" value="9" />
            <Stat label="Clubs joined" value="4" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3 text-sm">
            <Row label="Current plan" value="Pro · $29/mo · renews May 12" />
            <Row label="Lifetime value" value="$1,240 across 14 months" />
            <Row label="Active payment methods" value="Stripe (Visa •4242), Mamo (Apple Pay), CAPShield wallet" />
            <Row label="Failed payments (90d)" value="0" />
            <Row label="Chargebacks" value="0" />
            <Row label="Refunds issued" value="$29 (Jan 2025 · goodwill)" />
            <Row label="Credits balance" value="240 (≈ 4 boosts)" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="devices" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3 text-sm">
            {[
              { d: "iPhone 15 Pro · iOS 18.2 · App 4.6.1", l: "Dubai, UAE · WiFi", at: "Active now", i: Smartphone },
              { d: "MacBook Pro · Safari 18", l: "Dubai, UAE · WiFi", at: "1d ago", i: Globe },
              { d: "iPad Air · iOS 17.5", l: "Mumbai, IN · 5G", at: "12d ago", i: Smartphone },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3"><s.i className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{s.d}</div><div className="text-xs text-muted-foreground">{s.l}</div></div></div>
                <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{s.at}</span><Button variant="ghost" size="sm">Revoke</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="risk" className="pt-4">
          <Card><CardContent className="pt-6 space-y-3 text-sm">
            <Row label="Reports filed against" value="0" />
            <Row label="Reports filed by" value="1 (resolved)" />
            <Row label="Moderation flags" value="0 active" />
            <Row label="Velocity anomalies" value="None" />
            <Row label="Linked accounts (device fingerprint)" value="2 (reviewed · same household)" />
            <Row label="Sanctions screening" value="Clean (last refreshed 7d)" />
            <Row label="AI risk classifier" value="14/100 — Low" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <Card><CardContent className="pt-6 space-y-2 text-xs font-mono">
            {[
              "2026-05-09 14:21 · admin:rajiv · viewed_user · usr_8f3a91b2",
              "2026-05-09 11:02 · system · auto_kyc_refresh · clean",
              "2026-05-08 09:12 · admin:noor · awarded_credits +100 · note='retention'",
              "2026-05-04 18:33 · system · payment_succeeded · stripe · $29",
              "2026-04-29 10:12 · admin:rajiv · impersonate_start (45s)",
            ].map((l) => <div key={l} className="text-muted-foreground">{l}</div>)}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScoreCard({ label, value, hint, tone, display }: { label: string; value: number; hint: string; tone: "primary" | "success" | "default"; display?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
        <div className="mt-1 text-2xl font-bold">{display ?? value}</div>
        {!display && <Progress value={value} className="mt-2 h-1.5" />}
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">{Icon && <Icon className="h-3 w-3" />}{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, tone }: { icon: any; label: string; tone?: "destructive" }) {
  return (
    <Button variant={tone === "destructive" ? "destructive" : "outline"} size="sm" className="w-full justify-start gap-2">
      <Icon className="h-4 w-4" />{label}
    </Button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
