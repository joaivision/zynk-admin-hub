import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Calendar as CalIcon, Clock, Video, Users, AlertTriangle, CheckCircle2,
  XCircle, Eye, MessageSquare, Sparkles, Activity, Zap, ChevronLeft,
  ChevronRight, CalendarDays, List, ArrowRightLeft, Plus, Search, Filter,
  RotateCcw, Ban, Globe, Headphones, Shield, FileText, PauseCircle, Phone,
} from "lucide-react";

// ---- Types ---------------------------------------------------------------

type Status = "pending_approval" | "scheduled" | "live" | "completed" | "cancelled" | "no_show" | "disputed" | "blocked";

type Booking = {
  id: string;
  start: string; // ISO
  duration: number; // min
  expert: string;
  expertA: string;
  founder: string;
  founderA: string;
  topic: string;
  type: "1:1" | "group" | "ama" | "office_hours" | "retainer" | "confidential";
  status: Status;
  price: number;
  currency: string;
  room: string;
  tz: string;
  flags?: string[];
};

const STATUS_META: Record<Status, { label: string; color: string; dot: string }> = {
  pending_approval: { label: "Pending Approval", color: "bg-amber-500/15 text-amber-600 border-amber-500/30",   dot: "bg-amber-500" },
  scheduled:        { label: "Scheduled",        color: "bg-blue-500/15 text-blue-600 border-blue-500/30",      dot: "bg-blue-500" },
  live:             { label: "Live",             color: "bg-rose-500/15 text-rose-600 border-rose-500/30",      dot: "bg-rose-500" },
  completed:        { label: "Completed",        color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", dot: "bg-emerald-500" },
  cancelled:        { label: "Cancelled",        color: "bg-muted text-muted-foreground border-border",         dot: "bg-muted-foreground" },
  no_show:          { label: "No-show",          color: "bg-orange-500/15 text-orange-600 border-orange-500/30", dot: "bg-orange-500" },
  disputed:         { label: "Disputed",         color: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/30", dot: "bg-fuchsia-500" },
  blocked:          { label: "Blocked",          color: "bg-zinc-500/15 text-zinc-600 border-zinc-500/30",      dot: "bg-zinc-500" },
};

// ---- Seed data: dates relative to today ---------------------------------

function iso(daysFromToday: number, hours: number, mins = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
}

const seedBookings: Booking[] = [
  { id: "BK-44210", start: iso(0, 14), duration: 60, expert: "Dr. Aisha Rahman", expertA: "AR", founder: "Karim Hassan", founderA: "KH", topic: "Series A pitch review", type: "1:1", status: "live", price: 850, currency: "USD", room: "Daily.co", tz: "Asia/Dubai" },
  { id: "BK-44211", start: iso(0, 16, 30), duration: 45, expert: "Marcus Chen", expertA: "MC", founder: "Sarah Park", founderA: "SP", topic: "GTM for B2B SaaS in APAC", type: "1:1", status: "scheduled", price: 488, currency: "USD", room: "Daily.co", tz: "Asia/Singapore" },
  { id: "BK-44212", start: iso(1, 10), duration: 90, expert: "Priya Venkatesh", expertA: "PV", founder: "Group · 8 attendees", founderA: "G8", topic: "PLG fundamentals masterclass", type: "group", status: "scheduled", price: 1120, currency: "USD", room: "Streaming", tz: "Asia/Kolkata" },
  { id: "BK-44213", start: iso(1, 15), duration: 60, expert: "James O'Connor", expertA: "JO", founder: "Anonymous (NDA)", founderA: "AF", topic: "Confidential M&A review", type: "confidential", status: "pending_approval", price: 1200, currency: "USD", room: "E2E Encrypted", tz: "Europe/London", flags: ["NDA", "High value"] },
  { id: "BK-44214", start: iso(2, 9), duration: 30, expert: "Sofia Martinez", expertA: "SM", founder: "Yuki Tanaka", founderA: "YT", topic: "Brand sprint follow-up", type: "follow-up" as any, status: "scheduled", price: 160, currency: "USD", room: "Daily.co", tz: "Europe/Madrid" },
  { id: "BK-44215", start: iso(2, 19), duration: 75, expert: "Multi-Expert AMA", expertA: "AMA", founder: "247 attendees", founderA: "247", topic: "AMA: Raising in a down market", type: "ama", status: "scheduled", price: 0, currency: "—", room: "Streaming", tz: "Pacific/LA" },
  { id: "BK-44216", start: iso(3, 11), duration: 60, expert: "Dr. Aisha Rahman", expertA: "AR", founder: "Maya Lin", founderA: "ML", topic: "Term sheet negotiation", type: "1:1", status: "pending_approval", price: 850, currency: "USD", room: "Daily.co", tz: "Asia/Dubai" },
  { id: "BK-44217", start: iso(4, 14), duration: 60, expert: "Marcus Chen", expertA: "MC", founder: "Daniel Roth", founderA: "DR", topic: "Hiring VP Sales", type: "1:1", status: "scheduled", price: 488, currency: "USD", room: "Daily.co", tz: "Asia/Singapore" },
  { id: "BK-44218", start: iso(-1, 21), duration: 60, expert: "James O'Connor", expertA: "JO", founder: "Anonymous", founderA: "AF", topic: "Confidential M&A review", type: "confidential", status: "completed", price: 1200, currency: "USD", room: "E2E Encrypted", tz: "Europe/London" },
  { id: "BK-44219", start: iso(-2, 9), duration: 30, expert: "Sofia Martinez", expertA: "SM", founder: "Yuki Tanaka", founderA: "YT", topic: "Brand sprint kick-off", type: "1:1", status: "no_show", price: 160, currency: "USD", room: "Daily.co", tz: "Europe/Madrid" },
  { id: "BK-44220", start: iso(-3, 10), duration: 60, expert: "Priya Venkatesh", expertA: "PV", founder: "Ravi Kumar", founderA: "RK", topic: "Refund dispute", type: "1:1", status: "disputed", price: 280, currency: "USD", room: "Daily.co", tz: "Asia/Kolkata" },
];

// ---- Helpers -------------------------------------------------------------

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 = Sun
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function fmtDay(d: Date) { return d.toLocaleDateString([], { weekday: "short", day: "numeric" }); }

// ---- Component -----------------------------------------------------------

export function SessionBookings() {
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "details" | "reschedule" | "reserve" | "cancel">(null);

  // Reserve form
  const [resExpert, setResExpert] = useState("Dr. Aisha Rahman");
  const [resFounder, setResFounder] = useState("");
  const [resTopic, setResTopic] = useState("");
  const [resStart, setResStart] = useState<string>(iso(1, 14).slice(0, 16));
  const [resDuration, setResDuration] = useState(60);

  // Reschedule form
  const [reStart, setReStart] = useState<string>("");

  // Cancel form
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelNote, setCancelNote] = useState<string>("");

  const open = useMemo(() => bookings.find((b) => b.id === openId) || null, [openId, bookings]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (!q) return true;
      return [b.id, b.expert, b.founder, b.topic].some((s) => s.toLowerCase().includes(q));
    });
  }, [bookings, tab, search]);

  // Bookings on a given day
  const onDay = (d: Date) => filtered.filter((b) => sameDay(new Date(b.start), d));

  // ---- Mutations -----

  const approve = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "scheduled" } : b)));
    toast.success(`${id} approved · founder + expert notified`);
  };

  const cancel = (id: string, reason: string, note: string) => {
    if (!reason) { toast.error("Pick a cancellation reason."); return; }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled", flags: [...(b.flags || []), `cancel:${reason}`] } : b)));
    toast.success(`${id} cancelled · refund flow triggered (${reason})`);
    setDialog(null); setCancelReason(""); setCancelNote("");
  };

  const reschedule = (id: string, newStartLocal: string) => {
    if (!newStartLocal) { toast.error("Pick a new date/time."); return; }
    const newStart = new Date(newStartLocal).toISOString();
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, start: newStart, status: "scheduled" } : b)));
    toast.success(`${id} rescheduled · calendar invites updated`);
    setDialog(null); setReStart("");
  };

  const reserveByAdmin = () => {
    if (!resExpert || !resFounder || !resTopic || !resStart) { toast.error("Fill all fields."); return; }
    const id = "BK-" + Math.floor(Math.random() * 90000 + 10000);
    const newBooking: Booking = {
      id,
      start: new Date(resStart).toISOString(),
      duration: resDuration,
      expert: resExpert,
      expertA: resExpert.split(" ").map((s) => s[0]).slice(0, 2).join(""),
      founder: resFounder,
      founderA: resFounder.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(),
      topic: resTopic,
      type: "1:1",
      status: "scheduled",
      price: 0,
      currency: "USD",
      room: "Daily.co",
      tz: "Auto",
      flags: ["admin-reserved"],
    };
    setBookings((prev) => [newBooking, ...prev]);
    toast.success(`${id} reserved by admin · invites sent`);
    setDialog(null);
    setResFounder(""); setResTopic("");
  };

  // ---- Render -----

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calendar-first admin console: approve, cancel, reschedule, or reserve sessions on behalf of either party.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => { setDialog("reserve"); }}>
            <Plus className="h-4 w-4" /> Reserve by Admin
          </Button>
          <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Live", value: bookings.filter((b) => b.status === "live").length, icon: Activity, hint: "Now" },
          { label: "Pending Approval", value: bookings.filter((b) => b.status === "pending_approval").length, icon: AlertTriangle, hint: "Action needed" },
          { label: "This Week", value: bookings.filter((b) => { const d = new Date(b.start); return d >= weekStart && d < addDays(weekStart, 7); }).length, icon: CalendarDays, hint: "" },
          { label: "GMV (30d)", value: "$2.4M", icon: Sparkles, hint: "AOV $214" },
          { label: "No-show Rate", value: "3.2%", icon: AlertTriangle, hint: "Industry: 8%" },
          { label: "Disputed", value: bookings.filter((b) => b.status === "disputed").length, icon: Shield, hint: "Needs review" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search booking ID, expert, founder, topic…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex border rounded-md p-0.5">
              <Button size="sm" variant={view === "calendar" ? "default" : "ghost"} className="h-7 gap-1" onClick={() => setView("calendar")}><CalendarDays className="h-3.5 w-3.5" /> Calendar</Button>
              <Button size="sm" variant={view === "list" ? "default" : "ghost"} className="h-7 gap-1" onClick={() => setView("list")}><List className="h-3.5 w-3.5" /> List</Button>
            </div>
            <Button variant="outline" size="sm" className="gap-1"><Filter className="h-4 w-4" /> Filter</Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending_approval">Pending ({bookings.filter((b) => b.status === "pending_approval").length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="live" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Live</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="no_show">No-shows</TabsTrigger>
              <TabsTrigger value="disputed">Disputed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {view === "calendar" ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="text-sm font-medium">
                  {weekStart.toLocaleDateString([], { month: "long", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const items = onDay(d);
                  const isToday = sameDay(d, new Date());
                  return (
                    <div key={d.toISOString()} className={`rounded-lg border min-h-[260px] p-2 ${isToday ? "bg-primary/5 border-primary/40" : ""}`}>
                      <div className="text-xs font-semibold mb-2 flex items-center justify-between">
                        <span>{fmtDay(d)}</span>
                        {items.length > 0 && <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>}
                      </div>
                      <div className="space-y-1.5">
                        {items.length === 0 && <p className="text-[11px] text-muted-foreground italic">No sessions</p>}
                        {items.sort((a, b) => a.start.localeCompare(b.start)).map((b) => {
                          const M = STATUS_META[b.status];
                          return (
                            <button
                              key={b.id}
                              onClick={() => { setOpenId(b.id); setDialog("details"); }}
                              className={`w-full text-left rounded-md border p-2 hover:border-primary/60 transition ${M.color}`}
                            >
                              <div className="flex items-center gap-1 text-[11px] font-semibold">
                                <span className={`h-1.5 w-1.5 rounded-full ${M.dot} ${b.status === "live" ? "animate-pulse" : ""}`} />
                                {fmtTime(new Date(b.start))} · {b.duration}m
                              </div>
                              <div className="text-[11px] mt-0.5 line-clamp-1 text-foreground">{b.expert}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1">{b.topic}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No sessions match.</p>}
              {filtered.sort((a, b) => a.start.localeCompare(b.start)).map((b) => {
                const M = STATUS_META[b.status];
                const date = new Date(b.start);
                return (
                  <div key={b.id} className="rounded-lg border p-3 hover:border-primary/40 transition flex flex-wrap items-center gap-3">
                    <div className="min-w-[120px]">
                      <div className="text-xs font-semibold">{date.toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                      <div className="text-xs text-muted-foreground">{fmtTime(date)} · {b.duration}m</div>
                    </div>
                    <div className="flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-background"><AvatarFallback className="text-xs bg-primary/15">{b.expertA}</AvatarFallback></Avatar>
                      <Avatar className="h-8 w-8 border-2 border-background"><AvatarFallback className="text-xs bg-accent/30">{b.founderA}</AvatarFallback></Avatar>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm font-medium flex items-center gap-2">{b.expert} <ArrowRightLeft className="h-3 w-3 text-muted-foreground" /> {b.founder}</div>
                      <div className="text-xs text-muted-foreground">{b.topic} · <span className="font-mono">{b.id}</span></div>
                    </div>
                    <Badge variant="outline" className={M.color}>{M.label}</Badge>
                    <div className="flex gap-1">
                      {b.status === "pending_approval" && (
                        <Button size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => approve(b.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8" onClick={() => { setOpenId(b.id); setDialog("reschedule"); setReStart(b.start.slice(0, 16)); }}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => { setOpenId(b.id); setDialog("cancel"); }}>
                        <Ban className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => { setOpenId(b.id); setDialog("details"); }}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DETAILS dialog */}
      <Dialog open={dialog === "details" && !!open} onOpenChange={(o) => { if (!o) { setDialog(null); setOpenId(null); } }}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_META[open.status].color}>{STATUS_META[open.status].label}</Badge>
                  {open.id}
                </DialogTitle>
                <DialogDescription>{open.topic}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Expert</div><div className="font-medium">{open.expert}</div></div>
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Founder</div><div className="font-medium">{open.founder}</div></div>
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">When</div><div className="font-medium">{new Date(open.start).toLocaleString()} ({open.duration}m)</div></div>
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Room</div><div className="font-medium flex items-center gap-1"><Video className="h-3 w-3" /> {open.room}</div></div>
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Type / TZ</div><div className="font-medium">{open.type} · {open.tz}</div></div>
                  <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Price</div><div className="font-medium">{open.price ? `$${open.price} ${open.currency}` : "Free"}</div></div>
                </div>
                {open.flags && open.flags.length > 0 && (
                  <div className="rounded-lg border p-3 bg-amber-500/5">
                    <div className="text-xs font-medium mb-1">Flags</div>
                    <div className="flex flex-wrap gap-1">
                      {open.flags.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {open.status === "pending_approval" && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => { approve(open.id); setDialog(null); }}>
                    <CheckCircle2 className="h-4 w-4" /> Approve booking
                  </Button>
                )}
                <Button variant="outline" className="gap-1" onClick={() => { setDialog("reschedule"); setReStart(open.start.slice(0, 16)); }}>
                  <RotateCcw className="h-4 w-4" /> Reschedule
                </Button>
                <Button variant="outline" className="gap-1"><MessageSquare className="h-4 w-4" /> Message both</Button>
                <Button variant="destructive" className="gap-1" onClick={() => setDialog("cancel")}>
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* RESCHEDULE dialog */}
      <Dialog open={dialog === "reschedule" && !!open} onOpenChange={(o) => { if (!o) setDialog(null); }}>
        <DialogContent className="max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reschedule {open.id}</DialogTitle>
                <DialogDescription>Both parties will receive updated calendar invites instantly.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Current</Label>
                  <div className="text-sm">{new Date(open.start).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-xs">New date & time</Label>
                  <Input type="datetime-local" value={reStart} onChange={(e) => setReStart(e.target.value)} className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
                <Button className="gap-1" onClick={() => reschedule(open.id, reStart)}><RotateCcw className="h-4 w-4" /> Confirm reschedule</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCEL dialog */}
      <Dialog open={dialog === "cancel" && !!open} onOpenChange={(o) => { if (!o) setDialog(null); }}>
        <DialogContent className="max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Ban className="h-4 w-4" /> Cancel {open.id}</DialogTitle>
                <DialogDescription>Refund flow runs based on the reason and policy.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Reason</Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder_request">Founder request (full refund)</SelectItem>
                      <SelectItem value="expert_request">Expert request (full refund + penalty)</SelectItem>
                      <SelectItem value="admin_policy">Admin policy violation (no refund)</SelectItem>
                      <SelectItem value="duplicate">Duplicate booking</SelectItem>
                      <SelectItem value="payment_failed">Payment failed</SelectItem>
                      <SelectItem value="safety">Safety / abuse concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Internal note (audit log)</Label>
                  <Textarea rows={3} value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialog(null)}>Back</Button>
                <Button variant="destructive" className="gap-1" onClick={() => cancel(open.id, cancelReason, cancelNote)}><Ban className="h-4 w-4" /> Confirm cancellation</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* RESERVE BY ADMIN dialog */}
      <Dialog open={dialog === "reserve"} onOpenChange={(o) => { if (!o) setDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Reserve by Admin</DialogTitle>
            <DialogDescription>Create a session on behalf of both parties. Bypasses approval — used for VIP, partnerships, and recovery flows.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Expert</Label>
                <Select value={resExpert} onValueChange={setResExpert}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(seedBookings.map((b) => b.expert))).map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Founder (name or email)</Label>
                <Input value={resFounder} onChange={(e) => setResFounder(e.target.value)} placeholder="founder@startup.com" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Topic / agenda</Label>
              <Input value={resTopic} onChange={(e) => setResTopic(e.target.value)} placeholder="Series A pitch review" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start</Label>
                <Input type="datetime-local" value={resStart} onChange={(e) => setResStart(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Duration (min)</Label>
                <Select value={String(resDuration)} onValueChange={(v) => setResDuration(Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button className="gap-1" onClick={reserveByAdmin}><Plus className="h-4 w-4" /> Reserve & notify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Approval Rules</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground space-y-1"><ul className="space-y-1"><li>• Pending Approval = high-value, NDA, first-time founder/expert pair, or flagged.</li><li>• Auto-approve threshold: trust score &gt; 85 + repeat pair.</li><li>• Confidential sessions always need manual approval.</li><li>• SLA: 4h max in pending state.</li></ul></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reschedule Policy</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground space-y-1"><ul className="space-y-1"><li>• Free reschedule &gt; 24h before start.</li><li>• Inside 24h: founder pays 25% fee, expert pays trust hit.</li><li>• Admin reschedule: no fee, full audit log entry.</li><li>• Calendar invites + push + SMS auto-sent.</li></ul></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Headphones className="h-4 w-4" /> Reserve-by-Admin Use Cases</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground space-y-1"><ul className="space-y-1"><li>• VIP onboarding (private equity, Fortune 500).</li><li>• Recovery: rebook after no-show or dispute.</li><li>• Partner programs (accelerator cohorts).</li><li>• Internal team training / mock sessions.</li></ul></CardContent></Card>
      </div>
    </div>
  );
}
