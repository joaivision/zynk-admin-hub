import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Filter, Star, MapPin, Globe, Languages, Award, Briefcase,
  TrendingUp, Users, Calendar, MessageSquare, Eye, Pencil, Shield,
  Sparkles, BadgeCheck, Crown, Flame, Zap, Building2, GraduationCap,
  DollarSign, Clock, Heart, MoreHorizontal, Download, Plus, Video,
  ChevronRight, Activity, Target, BookOpen, Mic, Trophy
} from "lucide-react";

const experts = [
  { id: "EX-1042", name: "Dr. Aisha Rahman", title: "Ex-Sequoia Partner · AI/ML Investor", avatar: "AR", country: "🇦🇪 UAE", city: "Dubai", tier: "elite", verified: true, rating: 4.97, reviews: 312, sessions: 1845, rate: 850, currency: "USD", languages: ["EN","AR","HI"], domains: ["Venture Capital","AI/ML","SaaS"], status: "active", responseTime: "2h", repeatRate: 78, earnings: 1568000, lastActive: "12m ago", badges: ["Top 1%","Repeat Choice","Fast Responder"], availability: "Booked 3 weeks out", trustScore: 98, kycLevel: 2 },
  { id: "EX-1043", name: "Marcus Chen", title: "Founder · 2x YC Alum · Series B CEO", avatar: "MC", country: "🇸🇬 SG", city: "Singapore", tier: "elite", verified: true, rating: 4.94, reviews: 287, sessions: 1432, rate: 650, currency: "USD", languages: ["EN","ZH"], domains: ["Fundraising","Go-to-Market","B2B SaaS"], status: "active", responseTime: "45m", repeatRate: 71, earnings: 930800, lastActive: "now", badges: ["YC Alum","Top Earner"], availability: "Open this week", trustScore: 96, kycLevel: 2 },
  { id: "EX-1044", name: "Priya Venkatesh", title: "Growth Lead · Ex-Stripe, Ex-Notion", avatar: "PV", country: "🇮🇳 IN", city: "Bangalore", tier: "pro", verified: true, rating: 4.89, reviews: 198, sessions: 892, rate: 280, currency: "USD", languages: ["EN","HI","TA"], domains: ["Growth","PLG","Marketing"], status: "active", responseTime: "1h", repeatRate: 64, earnings: 249760, lastActive: "1h ago", badges: ["Rising Star","PPP Eligible"], availability: "Open this week", trustScore: 92, kycLevel: 2 },
  { id: "EX-1045", name: "James O'Connor", title: "PE Operating Partner · LBO Specialist", avatar: "JO", country: "🇬🇧 UK", city: "London", tier: "elite", verified: true, rating: 4.92, reviews: 156, sessions: 643, rate: 1200, currency: "USD", languages: ["EN"], domains: ["Private Equity","M&A","Finance"], status: "active", responseTime: "4h", repeatRate: 82, earnings: 771600, lastActive: "3h ago", badges: ["Premium","Verified Track Record"], availability: "By referral", trustScore: 99, kycLevel: 2 },
  { id: "EX-1046", name: "Sofia Martinez", title: "Brand Strategist · Ex-Apple, Airbnb", avatar: "SM", country: "🇪🇸 ES", city: "Barcelona", tier: "pro", verified: true, rating: 4.86, reviews: 124, sessions: 521, rate: 320, currency: "EUR", languages: ["EN","ES","CA"], domains: ["Brand","Design","Consumer"], status: "vacation", responseTime: "6h", repeatRate: 59, earnings: 166720, lastActive: "2d ago", badges: ["Design Authority"], availability: "Back Mar 15", trustScore: 90, kycLevel: 2 },
  { id: "EX-1047", name: "Hiroshi Tanaka", title: "Robotics PhD · Hardware Founder", avatar: "HT", country: "🇯🇵 JP", city: "Tokyo", tier: "starter", verified: true, rating: 4.78, reviews: 42, sessions: 87, rate: 180, currency: "USD", languages: ["EN","JA"], domains: ["Hardware","Robotics","Deep Tech"], status: "active", responseTime: "12h", repeatRate: 48, earnings: 15660, lastActive: "5h ago", badges: ["New Talent"], availability: "Open this week", trustScore: 84, kycLevel: 1 },
];

const tierColors: Record<string, string> = {
  elite: "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  pro: "bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30",
  starter: "bg-muted text-muted-foreground border-border",
};

export function ExpertDirectory() {
  const [tab, setTab] = useState("all");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expert Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated network of vetted operators, investors, and domain experts powering Zynk.ing's mentorship marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Experts", value: "4,287", icon: Users, hint: "+128 this mo" },
          { label: "Elite Tier", value: "312", icon: Crown, hint: "7.3%" },
          { label: "Avg Rating", value: "4.86", icon: Star, hint: "★ system" },
          { label: "Sessions/30d", value: "18.4k", icon: Calendar, hint: "+22% MoM" },
          { label: "GMV/30d", value: "$2.4M", icon: DollarSign, hint: "+18%" },
          { label: "Repeat Rate", value: "67%", icon: Heart, hint: "Network depth" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name, domain, company, fund, school…" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="vc">Venture Capital</SelectItem>
                <SelectItem value="growth">Growth/PLG</SelectItem>
                <SelectItem value="ai">AI/ML</SelectItem>
                <SelectItem value="ops">Operations</SelectItem>
                <SelectItem value="brand">Brand & Design</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="any">
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Region</SelectItem>
                <SelectItem value="mena">MENA</SelectItem>
                <SelectItem value="apac">APAC</SelectItem>
                <SelectItem value="emea">EMEA</SelectItem>
                <SelectItem value="amer">Americas</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="rec">
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rec">Sort: Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="response">Fastest Response</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1"><Filter className="h-4 w-4" /> Advanced</Button>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Invite Expert</Button>
            <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export</Button>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {["Verified Track Record","Speaks Arabic","Speaks Mandarin","PPP-tier pricing","Available this week","Fortune 500 alum","YC/Techstars","Female-led","Accepts equity","Pro-bono available","Diaspora founder","Family office"].map(c => (
              <Badge key={c} variant="outline" className="cursor-pointer hover:bg-accent">{c}</Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All ({experts.length})</TabsTrigger>
              <TabsTrigger value="elite" className="gap-1"><Crown className="h-3 w-3" /> Elite</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="rising" className="gap-1"><Sparkles className="h-3 w-3" /> Rising</TabsTrigger>
              <TabsTrigger value="watch">Watchlist</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-3">
              {experts.map(e => (
                <div key={e.id} className="rounded-lg border bg-card p-4 hover:border-primary/40 transition">
                  <div className="flex flex-wrap gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/30 font-semibold">{e.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-[260px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base">{e.name}</h3>
                        {e.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                        <Badge className={`text-[10px] uppercase tracking-wide ${tierColors[e.tier]}`} variant="outline">{e.tier}</Badge>
                        <span className="text-[11px] text-muted-foreground">· {e.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{e.title}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.country} · {e.city}</span>
                        <span className="flex items-center gap-1"><Languages className="h-3 w-3" /> {e.languages.join(" · ")}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.responseTime} avg reply</span>
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {e.lastActive}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {e.domains.map(d => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                        {e.badges.map(b => (
                          <Badge key={b} variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                            <Trophy className="h-2.5 w-2.5 mr-0.5" />{b}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 min-w-[180px]">
                      <div className="flex items-center gap-1 font-semibold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {e.rating}
                        <span className="text-xs text-muted-foreground font-normal">({e.reviews})</span>
                      </div>
                      <div className="text-2xl font-bold">${e.rate}<span className="text-xs font-normal text-muted-foreground">/hr {e.currency}</span></div>
                      <div className="text-[11px] text-muted-foreground">{e.availability}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Trust {e.trustScore} · KYC L{e.kycLevel}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t text-xs">
                    <div><span className="text-muted-foreground">Sessions</span><div className="font-semibold">{e.sessions.toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground">Repeat rate</span><div className="font-semibold">{e.repeatRate}%</div></div>
                    <div><span className="text-muted-foreground">Earnings (LTM)</span><div className="font-semibold">${(e.earnings/1000).toFixed(0)}k</div></div>
                    <div><span className="text-muted-foreground">Status</span><div className="font-semibold capitalize">{e.status}</div></div>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 gap-1"><Eye className="h-3 w-3" /> View</Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1"><Pencil className="h-3 w-3" /> Edit</Button>
                      <Button size="sm" variant="outline" className="h-8"><MoreHorizontal className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Smart Discovery</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1.5">
            <p>Vector embeddings + behavioral signals match founders to experts.</p>
            <ul className="space-y-1 mt-2">
              <li>• Semantic intent matching (domain + stage + ticket size)</li>
              <li>• Cohort similarity (founders who booked X also booked Y)</li>
              <li>• Time-zone proximity & language overlap</li>
              <li>• Outcome-weighted ranking (rebooks, deal closures)</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Trust & Quality Bar</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Multi-signal trust score blended from:</p>
            <ul className="space-y-1 mt-2">
              <li>• Verified employment / fund affiliations</li>
              <li>• Identity (KYC L1/L2) + government ID hash</li>
              <li>• Track-record proofs (cap tables, exits, articles)</li>
              <li>• Peer endorsements from other Elite experts</li>
              <li>• Behavioral: no-shows, complaints, response SLAs</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> Differentiators vs LinkedIn</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Bookable, not just browsable — direct calendar</li>
              <li>• Outcome-based ratings (deal/hire/raise tracked)</li>
              <li>• PPP pricing for emerging-market access</li>
              <li>• Confidential mode for stealth founders</li>
              <li>• Group sessions, AMAs, office hours, retainers</li>
              <li>• Equity-for-advice contracts (escrowed)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
