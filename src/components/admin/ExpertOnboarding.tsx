import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, FileCheck2, IdCard, Building2, GraduationCap, Linkedin,
  Github, Globe, Mail, Phone, Video, Award, AlertTriangle, CheckCircle2,
  Clock, XCircle, Eye, MessageSquare, FileText, Fingerprint, Camera,
  Search, Users, Sparkles, Target, Zap, Lock, Database
} from "lucide-react";

const applicants = [
  { id: "AP-9012", name: "Elena Volkova", avatar: "EV", title: "Product Lead · Ex-Stripe", country: "🇩🇪", stage: "L3-Domain Review", progress: 78, applied: "2d ago", aiScore: 91, flags: 0, claims: ["Stripe (verified)","Notion (pending)","TechCrunch coverage"], reviewer: "Dr. Aisha R.", risk: "low" },
  { id: "AP-9013", name: "Carlos Mendes", avatar: "CM", title: "Angel Investor · 47 deals", country: "🇧🇷", stage: "L2-Identity", progress: 45, applied: "5h ago", aiScore: 72, flags: 1, claims: ["AngelList syndicate","2 portfolio exits"], reviewer: "Auto-queue", risk: "medium" },
  { id: "AP-9014", name: "Yuki Sato", avatar: "YS", title: "CTO · AI Startup", country: "🇯🇵", stage: "L4-Video Interview", progress: 92, applied: "1w ago", aiScore: 95, flags: 0, claims: ["MIT PhD","3 patents","Meta alum"], reviewer: "Marcus C.", risk: "low" },
  { id: "AP-9015", name: "Anonymous Submission", avatar: "?", title: "Claims: Ex-Goldman MD", country: "🇺🇸", stage: "L1-Triage", progress: 12, applied: "1h ago", aiScore: 38, flags: 4, claims: ["Unverifiable LinkedIn","Generic email"], reviewer: "—", risk: "high" },
];

const stageMap: Record<string, { color: string; icon: typeof Clock }> = {
  "L1-Triage": { color: "bg-slate-500/15 text-slate-600", icon: Search },
  "L2-Identity": { color: "bg-blue-500/15 text-blue-600", icon: IdCard },
  "L3-Domain Review": { color: "bg-violet-500/15 text-violet-600", icon: Award },
  "L4-Video Interview": { color: "bg-amber-500/15 text-amber-600", icon: Video },
  "L5-Approved": { color: "bg-emerald-500/15 text-emerald-600", icon: CheckCircle2 },
};

export function ExpertOnboarding() {
  const [tab, setTab] = useState("queue");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expert Onboarding & Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-stage vetting pipeline: identity, employment, domain credibility, behavioral interview, and continuous monitoring.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "In Queue", value: "247", hint: "+34 today", icon: Clock },
          { label: "Avg Time-to-Verify", value: "3.2d", hint: "Target 48h", icon: Zap },
          { label: "Approval Rate", value: "31%", hint: "Quality bar high", icon: ShieldCheck },
          { label: "Auto-Reject (AI)", value: "42%", hint: "Spam/fraud", icon: XCircle },
          { label: "Active Reviewers", value: "12", hint: "8 elite", icon: Users },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Verification Pipeline (5 Stages)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { n: 1, t: "Triage & Spam", d: "AI scores application: LinkedIn depth, claim plausibility, network signals. Auto-reject obvious spam.", icon: Search, m: "AI · 30s" },
              { n: 2, t: "Identity (KYC)", d: "Government ID + selfie liveness, sanctions/PEP screening, address proof, phone+email verification.", icon: Fingerprint, m: "Persona/Onfido · 5m" },
              { n: 3, t: "Employment & Domain", d: "Verify current/past roles via work email, official records, LinkedIn API, public news. Cross-check claimed exits/cap tables.", icon: Building2, m: "Hybrid · 24h" },
              { n: 4, t: "Behavioral Interview", d: "30-min video with Elite reviewer: communication, ethics, depth probe, mock session. Recording stored for audit.", icon: Video, m: "Human · 30m" },
              { n: 5, t: "Continuous Trust", d: "Ongoing monitoring: review velocity, dispute rate, no-shows, sanctions re-screen quarterly, peer flags.", icon: ShieldCheck, m: "Always-on" },
            ].map(s => (
              <div key={s.n} className="rounded-lg border p-3 bg-gradient-to-br from-card to-card/50">
                <div className="flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" /><span className="text-xs font-mono text-muted-foreground">L{s.n}</span></div>
                <div className="font-semibold text-sm mt-1">{s.t}</div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{s.d}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{s.m}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Applicant Queue</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="queue">Active Queue (247)</TabsTrigger>
              <TabsTrigger value="risk">High-Risk Flags (18)</TabsTrigger>
              <TabsTrigger value="approved">Approved This Week (23)</TabsTrigger>
              <TabsTrigger value="rejected">Rejected (412)</TabsTrigger>
              <TabsTrigger value="appeal">Appeals (7)</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4 space-y-3">
              {applicants.map(a => {
                const S = stageMap[a.stage];
                const Icon = S?.icon || Clock;
                return (
                  <div key={a.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap gap-3">
                      <Avatar className="h-12 w-12"><AvatarFallback>{a.avatar}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{a.name}</h3>
                          <span className="text-xs text-muted-foreground">{a.country} · {a.id} · applied {a.applied}</span>
                          {a.risk === "high" && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />High Risk</Badge>}
                          {a.risk === "medium" && <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Medium Risk</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{a.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {a.claims.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                        </div>
                      </div>
                      <div className="min-w-[200px]">
                        <Badge variant="outline" className={`${S?.color} gap-1`}><Icon className="h-3 w-3" />{a.stage}</Badge>
                        <div className="mt-2">
                          <div className="flex justify-between text-[11px] text-muted-foreground"><span>Progress</span><span>{a.progress}%</span></div>
                          <Progress value={a.progress} className="h-1.5 mt-1" />
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">AI Score: <span className={`font-semibold ${a.aiScore > 80 ? "text-emerald-600" : a.aiScore > 60 ? "text-amber-600" : "text-rose-600"}`}>{a.aiScore}/100</span> · Reviewer: {a.reviewer}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" variant="outline" className="gap-1"><Eye className="h-3 w-3" /> Review Dossier</Button>
                      <Button size="sm" variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" /> Request Info</Button>
                      <Button size="sm" variant="outline" className="gap-1"><Video className="h-3 w-3" /> Schedule Interview</Button>
                      <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                      <Button size="sm" variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Reject</Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Data Sources & Integrations</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            {[
              ["Persona / Onfido","Government ID, liveness, address",CheckCircle2,"Connected"],
              ["LinkedIn API","Employment, education, network depth",CheckCircle2,"Connected"],
              ["Crunchbase / PitchBook","Investor track records, exits",CheckCircle2,"Connected"],
              ["Sanctions (OFAC/UN/EU)","Continuous re-screening",CheckCircle2,"Connected"],
              ["GitHub / Stack Overflow","Technical credibility signals",CheckCircle2,"Connected"],
              ["Truecaller / Hunter.io","Phone & email reputation",Clock,"Pending"],
              ["University Registry APIs","Degree verification",Clock,"Pilot"],
              ["Custom domain DNS proof","'I own this company' verification",CheckCircle2,"Connected"],
            ].map(([n,d,I,s]:any) => (
              <div key={n} className="flex items-center gap-2">
                <I className={`h-3.5 w-3.5 ${s === "Connected" ? "text-emerald-600" : "text-amber-600"}`} />
                <span className="font-medium">{n}</span>
                <span className="text-muted-foreground">— {d}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{s}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> Future-ready Trust Stack</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1.5">
            <p className="text-foreground font-medium">What we do that LinkedIn doesn't:</p>
            <ul className="space-y-1">
              <li>• <span className="text-foreground">Verifiable Credentials (W3C VC)</span> — portable, cryptographic proofs of role/exit/degree</li>
              <li>• <span className="text-foreground">Reputation NFTs</span> (optional) — soulbound badges for milestones</li>
              <li>• <span className="text-foreground">Mock-session scoring</span> — AI evaluates depth/clarity in audition call</li>
              <li>• <span className="text-foreground">Outcome verification</span> — closed-loop tracking of advice → deal/hire/raise</li>
              <li>• <span className="text-foreground">Peer-attested skills</span> — Elite experts vouch for new ones (skin in the game)</li>
              <li>• <span className="text-foreground">Continuous monitoring</span> — sanctions, complaints, behavioral drift</li>
              <li>• <span className="text-foreground">Confidential expert mode</span> — verified to platform, anonymous to public</li>
              <li>• <span className="text-foreground">Audit-grade logs</span> — SOC2/GDPR-ready review trails per applicant</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
