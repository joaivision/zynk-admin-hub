import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Star, Flag, ThumbsUp, ThumbsDown, MessageSquare, Shield, Sparkles,
  AlertTriangle, CheckCircle2, XCircle, Eye, Search, TrendingUp, Award,
  Filter, Bot, Heart, Target, BarChart3, FileText
} from "lucide-react";

const reviews = [
  { id: "RV-7821", expert: "Dr. Aisha Rahman", expertA: "AR", founder: "Karim H.", founderA: "KH", rating: 5, text: "Aisha didn't just review my deck — she rewired our entire fundraising narrative. Closed $2.5M seed within 6 weeks of her advice. Worth every dollar.", outcome: "raised", verified: true, status: "published", flags: 0, helpful: 47, date: "2d ago", tags: ["fundraising","narrative","seed"] },
  { id: "RV-7820", expert: "Marcus Chen", expertA: "MC", founder: "Sarah P.", founderA: "SP", rating: 5, text: "Marcus broke down our APAC GTM in 45 minutes more clearly than 3 months of consultants. Direct, data-driven, no fluff.", outcome: "implemented", verified: true, status: "published", flags: 0, helpful: 32, date: "5d ago", tags: ["GTM","APAC","B2B"] },
  { id: "RV-7819", expert: "Priya Venkatesh", expertA: "PV", founder: "Anonymous", founderA: "?", rating: 2, text: "Felt rushed. Got generic advice that didn't apply to my niche. Expected more for the price.", outcome: "no-impact", verified: true, status: "review-required", flags: 1, helpful: 4, date: "1d ago", tags: ["growth","disappointed"] },
  { id: "RV-7818", expert: "James O'Connor", expertA: "JO", founder: "[NDA]", founderA: "##", rating: 5, text: "[Confidential — outcome verified by platform: deal closed $42M]", outcome: "deal-closed", verified: true, status: "published-redacted", flags: 0, helpful: 89, date: "1w ago", tags: ["M&A","PE","confidential"] },
  { id: "RV-7817", expert: "Sofia Martinez", expertA: "SM", founder: "Yuki T.", founderA: "YT", rating: 1, text: "[Auto-flagged: profanity + competitor link]", outcome: "—", verified: false, status: "quarantined", flags: 5, helpful: 0, date: "3h ago", tags: ["flagged"] },
];

const statusMap: Record<string, { c: string; t: string; i: typeof Eye }> = {
  published: { c: "bg-emerald-500/15 text-emerald-600", t: "Published", i: CheckCircle2 },
  "review-required": { c: "bg-amber-500/15 text-amber-600", t: "Review Required", i: AlertTriangle },
  "published-redacted": { c: "bg-blue-500/15 text-blue-600", t: "Published (Redacted)", i: Shield },
  quarantined: { c: "bg-rose-500/15 text-rose-600", t: "Quarantined", i: XCircle },
};

export function MentorshipReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Outcome-weighted reputation system: verified, multi-dimensional, fraud-resistant. Built to outperform LinkedIn endorsements.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { l: "Total Reviews", v: "84,217", i: MessageSquare },
          { l: "Avg Rating", v: "4.86", i: Star },
          { l: "Response Rate", v: "92%", i: TrendingUp },
          { l: "AI Auto-Moderated", v: "11.4%", i: Bot },
          { l: "Disputed", v: "184", i: Flag },
          { l: "Outcome-Verified", v: "67%", i: Award },
        ].map(s => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Rating Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[{s:5,p:78,n:65689},{s:4,p:14,n:11790},{s:3,p:5,n:4210},{s:2,p:2,n:1684},{s:1,p:1,n:842}].map(r => (
              <div key={r.s} className="flex items-center gap-3">
                <span className="flex items-center gap-0.5 w-12 text-sm">{r.s} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                <Progress value={r.p} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-20 text-right">{r.p}% · {r.n.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Multi-Dimensional Scoring</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            {[
              ["Depth of expertise", 4.91],
              ["Communication clarity", 4.88],
              ["Actionable advice", 4.83],
              ["Preparation", 4.79],
              ["Followed-through", 4.86],
              ["Worth the price", 4.74],
            ].map(([k,v]:any) => (
              <div key={k} className="flex justify-between"><span>{k}</span><span className="font-mono font-semibold">{v}/5</span></div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by expert, founder, keyword…" />
            </div>
            <Button variant="outline" size="sm" className="gap-1"><Filter className="h-4 w-4" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="flagged">Flagged (32)</TabsTrigger>
              <TabsTrigger value="quarantine">Quarantine (8)</TabsTrigger>
              <TabsTrigger value="appeals">Expert Appeals (5)</TabsTrigger>
              <TabsTrigger value="disputes">Disputes (4)</TabsTrigger>
              <TabsTrigger value="featured">Featured / Hero</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4 space-y-3">
              {reviews.map(r => {
                const ST = statusMap[r.status];
                const I = ST.i;
                return (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex -space-x-2">
                        <Avatar className="h-9 w-9 border-2 border-background"><AvatarFallback className="text-xs bg-accent/30">{r.founderA}</AvatarFallback></Avatar>
                        <Avatar className="h-9 w-9 border-2 border-background"><AvatarFallback className="text-xs bg-primary/15">{r.expertA}</AvatarFallback></Avatar>
                      </div>
                      <div className="flex-1 min-w-[260px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{r.founder}</span>
                          <span className="text-xs text-muted-foreground">→ {r.expert}</span>
                          {r.verified && <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Verified Session</Badge>}
                          {r.outcome !== "—" && <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-600"><Target className="h-2.5 w-2.5 mr-0.5" />Outcome: {r.outcome}</Badge>}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map(i => <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
                          <span className="text-[11px] text-muted-foreground ml-1">· {r.date} · {r.id}</span>
                        </div>
                        <p className="text-sm mt-2 leading-relaxed">{r.text}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {r.helpful}</span>
                          {r.flags > 0 && <span className="flex items-center gap-1 text-amber-600"><Flag className="h-3 w-3" /> {r.flags} flag{r.flags>1?"s":""}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`gap-1 ${ST.c}`}><I className="h-3 w-3" />{ST.t}</Badge>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="outline" className="h-7"><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-7"><MessageSquare className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-7"><Sparkles className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> AI Moderation</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Toxicity, profanity, hate-speech detection (40 langs)</li>
              <li>• PII scrubbing (emails, phones, addresses)</li>
              <li>• Competitor URL & spam link blocker</li>
              <li>• Sentiment + topic extraction → tags</li>
              <li>• Fake/AI-generated review detection</li>
              <li>• Coordinated review attack signals (graph)</li>
              <li>• Auto-translation while preserving original</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Anti-Manipulation</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Reviews only after verified completed session</li>
              <li>• Cooling-off period: 24h before publish</li>
              <li>• Expert can request mediation, not deletion</li>
              <li>• Reviewer's own behavior weighted in</li>
              <li>• No paid review removal — ever (transparency)</li>
              <li>• Network analysis: detect review rings</li>
              <li>• Quarantine quarantine + manual escalation</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Outcome-Verified Edge</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Did founder raise after expert advice? (yes/no)</li>
              <li>• Did founder hire candidate via expert intro?</li>
              <li>• Did deal close after M&A advisor session?</li>
              <li>• Outcome-tagged reviews ranked higher</li>
              <li>• "Verified outcome" badge displayed publicly</li>
              <li>• Expert's outcome rate visible on profile</li>
              <li>• Differentiator: LinkedIn shows endorsements only</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
