import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, Clock, Video, Users, DollarSign, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, Eye, MessageSquare, Phone, FileText, Mic, Shield,
  Globe, Search, Download, Filter, Sparkles, Activity, Zap, Target,
  PlayCircle, PauseCircle, RotateCcw, ArrowRightLeft, Headphones
} from "lucide-react";

const sessions = [
  { id: "BK-44210", date: "Today 14:00 GST", expert: "Dr. Aisha Rahman", expertA: "AR", founder: "Karim Hassan · TechMENA Inc", founderA: "KH", topic: "Series A pitch review", duration: 60, type: "1:1", status: "live", price: 850, currency: "USD", recording: true, transcript: true, calendar: "Google", room: "Zoom + Daily.co fallback", tz: "Asia/Dubai → Africa/Cairo" },
  { id: "BK-44209", date: "Today 16:30 GST", expert: "Marcus Chen", expertA: "MC", founder: "Sarah Park · Bloomly", founderA: "SP", topic: "GTM for B2B SaaS in APAC", duration: 45, type: "1:1", status: "scheduled", price: 488, currency: "USD", recording: true, transcript: true, calendar: "Google", room: "Daily.co", tz: "Asia/Singapore → Asia/Seoul" },
  { id: "BK-44208", date: "Tomorrow 10:00 IST", expert: "Priya Venkatesh", expertA: "PV", founder: "Group session · 8 attendees", founderA: "G8", topic: "PLG fundamentals masterclass", duration: 90, type: "group", status: "scheduled", price: 1120, currency: "USD", recording: true, transcript: true, calendar: "Native", room: "Daily.co + Streaming", tz: "Asia/Kolkata" },
  { id: "BK-44207", date: "Yesterday 21:00 GMT", expert: "James O'Connor", expertA: "JO", founder: "Anonymous Founder (NDA)", founderA: "AF", topic: "Confidential M&A review", duration: 60, type: "confidential", status: "completed", price: 1200, currency: "USD", recording: false, transcript: false, calendar: "Outlook", room: "Daily.co · E2E encrypted", tz: "Europe/London → restricted" },
  { id: "BK-44206", date: "2d ago 09:00 EST", expert: "Sofia Martinez", expertA: "SM", founder: "Yuki Tanaka · Designly", founderA: "YT", topic: "Brand sprint follow-up", duration: 30, type: "follow-up", status: "no-show-founder", price: 160, currency: "USD", recording: false, transcript: false, calendar: "Google", room: "Daily.co", tz: "America/New_York → Asia/Tokyo" },
  { id: "BK-44205", date: "3d ago 19:00 PST", expert: "Multiple Experts (3)", expertA: "AMA", founder: "AMA · 247 attendees", founderA: "247", topic: "AMA: Raising in a down market", duration: 75, type: "ama", status: "completed", price: 0, currency: "—", recording: true, transcript: true, calendar: "Native", room: "Streaming + Q&A", tz: "Pacific/LA" },
];

const statusMap: Record<string, { c: string; i: typeof Clock; t: string }> = {
  live: { c: "bg-rose-500/15 text-rose-600 border-rose-500/30 animate-pulse", i: Activity, t: "● LIVE NOW" },
  scheduled: { c: "bg-blue-500/15 text-blue-600 border-blue-500/30", i: Clock, t: "Scheduled" },
  completed: { c: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", i: CheckCircle2, t: "Completed" },
  "no-show-founder": { c: "bg-amber-500/15 text-amber-600 border-amber-500/30", i: AlertTriangle, t: "No-show (founder)" },
  "no-show-expert": { c: "bg-red-500/15 text-red-600 border-red-500/30", i: AlertTriangle, t: "No-show (expert)" },
  cancelled: { c: "bg-muted text-muted-foreground", i: XCircle, t: "Cancelled" },
  disputed: { c: "bg-orange-500/15 text-orange-600 border-orange-500/30", i: AlertTriangle, t: "Disputed" },
};

export function SessionBookings() {
  const [tab, setTab] = useState("all");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          End-to-end booking lifecycle: scheduling, calendar sync, video room, recording, transcripts, billing, disputes, and outcome tracking.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Live now", value: "12", icon: Activity, hint: "Across 8 TZs" },
          { label: "Today", value: "284", icon: Calendar, hint: "+18% vs avg" },
          { label: "This Week", value: "1,847", icon: Calendar, hint: "" },
          { label: "GMV (30d)", value: "$2.4M", icon: DollarSign, hint: "AOV $214" },
          { label: "No-show Rate", value: "3.2%", icon: AlertTriangle, hint: "Industry: 8%" },
          { label: "Avg Rating", value: "4.86", icon: Sparkles, hint: "Post-session" },
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
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search booking ID, expert, founder, topic…" />
            </div>
            <Select defaultValue="all-types">
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="ama">AMA</SelectItem>
                <SelectItem value="office-hours">Office Hours</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="7d">
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
                <SelectItem value="30d">Last 30d</SelectItem>
                <SelectItem value="90d">Last 90d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1"><Filter className="h-4 w-4" /> Filter</Button>
            <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export</Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="live" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Live (12)</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="no-show">No-shows</TabsTrigger>
              <TabsTrigger value="disputed">Disputed (4)</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-3">
              {sessions.map(s => {
                const ST = statusMap[s.status];
                const Icon = ST.i;
                return (
                  <div key={s.id} className="rounded-lg border p-4 hover:border-primary/40 transition">
                    <div className="flex flex-wrap gap-3 items-start">
                      <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs font-medium text-center">{s.date}</div>
                        <div className="text-[10px] text-muted-foreground">{s.duration} min</div>
                      </div>

                      <div className="flex -space-x-2">
                        <Avatar className="h-9 w-9 border-2 border-background"><AvatarFallback className="text-xs bg-primary/15">{s.expertA}</AvatarFallback></Avatar>
                        <Avatar className="h-9 w-9 border-2 border-background"><AvatarFallback className="text-xs bg-accent/30">{s.founderA}</AvatarFallback></Avatar>
                      </div>

                      <div className="flex-1 min-w-[220px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{s.expert}</span>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{s.founder}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">{s.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{s.topic}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Video className="h-3 w-3" />{s.room}</span>
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{s.tz}</span>
                          <span className="font-mono">{s.id}</span>
                          {s.recording && <Badge variant="secondary" className="text-[10px]">Recording</Badge>}
                          {s.transcript && <Badge variant="secondary" className="text-[10px]">Transcript</Badge>}
                          {s.type === "confidential" && <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-600"><Shield className="h-2.5 w-2.5 mr-0.5" />E2E Encrypted</Badge>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                        <Badge variant="outline" className={`gap-1 ${ST.c}`}><Icon className="h-3 w-3" />{ST.t}</Badge>
                        <div className="font-bold">{s.price ? `$${s.price}` : "Free"} <span className="text-[10px] font-normal text-muted-foreground">{s.currency}</span></div>
                        <div className="flex gap-1">
                          {s.status === "live" && <Button size="sm" className="h-7 gap-1 bg-rose-600 hover:bg-rose-700"><Eye className="h-3 w-3" />Monitor</Button>}
                          {s.status === "scheduled" && <Button size="sm" variant="outline" className="h-7 gap-1"><PlayCircle className="h-3 w-3" />Join</Button>}
                          {s.status === "completed" && <Button size="sm" variant="outline" className="h-7 gap-1"><FileText className="h-3 w-3" />Notes</Button>}
                          <Button size="sm" variant="outline" className="h-7"><MessageSquare className="h-3 w-3" /></Button>
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
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Booking Engine</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Real-time calendar sync (Google, Outlook, iCloud, CalDAV)</li>
              <li>• Multi-timezone smart scheduling with DST handling</li>
              <li>• Buffer time, prep time, minimum notice rules</li>
              <li>• Recurring sessions & retainers</li>
              <li>• Round-robin for team experts</li>
              <li>• Wait-list & instant cancellation backfill</li>
              <li>• Hold-and-confirm with payment auth</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Headphones className="h-4 w-4" /> Session Infrastructure</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• Native video (Daily.co) + Zoom/Meet/Teams pass-through</li>
              <li>• Auto-recording with consent flow per jurisdiction</li>
              <li>• AI transcription (multi-lingual, speaker diarization)</li>
              <li>• Live captions & real-time translation (40+ languages)</li>
              <li>• Whiteboard, screen share, file drop, code editor</li>
              <li>• AI session summary + action items emailed</li>
              <li>• Confidential mode: zero retention, E2E</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Outcome & Trust</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <ul className="space-y-1">
              <li>• 24h post-session NPS + structured feedback</li>
              <li>• Outcome tagging: deal closed, hire made, raise completed</li>
              <li>• No-show: auto-charge or refund per policy</li>
              <li>• Dispute window with mediation workflow</li>
              <li>• Escrow release after dispute window</li>
              <li>• Auto-rebook prompts at right intervals</li>
              <li>• Quality alerts: drops, low ratings, dispute streaks</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
