import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Save, Sparkles, Download, X, MapPin, Briefcase, GraduationCap, Wallet, Globe, Smartphone, Shield, Star } from "lucide-react";

const SAVED_QUERIES = [
  { name: "High-intent investors in MENA", count: 1842, shared: true },
  { name: "Founders raising Seed (UAE+IN)", count: 612, shared: true },
  { name: "Verified experts • English+Arabic", count: 287, shared: false },
  { name: "Power users (DAU>20, plan=Pro)", count: 943, shared: false },
  { name: "At-risk Pro subs (no login 14d)", count: 156, shared: true },
  { name: "Crypto-wallet linked users", count: 421, shared: false },
];

const RECENT_SEARCHES = [
  "intent:fundraise AND country:AE AND plan:pro",
  "skills:(\"AI/ML\" OR \"LLM\") AND availability:open-to-work",
  "trust_score:>80 AND last_active:<7d",
  "kyc:approved AND wallet:capshield",
];

export function UserSearchFilter() {
  const [filters, setFilters] = useState<string[]>(["country:AE", "plan:Pro", "intent:fundraise"]);

  const removeFilter = (f: string) => setFilters((prev) => prev.filter((x) => x !== f));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Search & Filter</h1>
          <p className="text-sm text-muted-foreground">
            Build precise audience queries across 40+ identity, behaviour, and risk signals.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Save className="h-4 w-4" />Save Segment</Button>
          <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" />Export Results</Button>
          <Button size="sm" className="gap-1"><Sparkles className="h-4 w-4" />AI Query Builder</Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder='Try: intent:fundraise AND country:(AE OR SA) AND plan:Pro AND last_active:<7d'
              className="pl-9 h-11 font-mono text-sm"
              defaultValue='intent:fundraise AND country:AE AND plan:Pro'
            />
            <Badge className="absolute right-3 top-1/2 -translate-y-1/2" variant="secondary">12,431 matches</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Badge key={f} variant="outline" className="gap-1 pr-1">
                {f}
                <button onClick={() => removeFilter(f)} className="ml-1 rounded hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 text-xs">+ Add filter</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" />Filter Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="identity">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="behaviour">Behaviour</TabsTrigger>
                <TabsTrigger value="commerce">Commerce</TabsTrigger>
                <TabsTrigger value="trust">Trust & Risk</TabsTrigger>
                <TabsTrigger value="device">Device</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-4 pt-4">
                <FilterRow icon={MapPin} label="Country" placeholder="UAE, India, Saudi Arabia…" />
                <FilterRow icon={Globe} label="Language" placeholder="English, Arabic, Hindi…" />
                <FilterRow icon={Briefcase} label="Stakeholder Type" placeholder="Founder, Investor, Expert, Talent…" />
                <FilterRow icon={GraduationCap} label="Education / Alma Mater" placeholder="IIT, Stanford, IIM…" />
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Age range</Label><Input placeholder="22 — 65" /></div>
                  <div><Label>Gender</Label><Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="m">Male</SelectItem><SelectItem value="f">Female</SelectItem><SelectItem value="o">Other</SelectItem></SelectContent></Select></div>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 pt-4">
                <FilterRow icon={Briefcase} label="Industry / Sector" placeholder="Fintech, AI, SaaS, Real Estate…" />
                <FilterRow icon={Star} label="Skills" placeholder="LLM, Product, GTM, Fund-of-Funds…" />
                <FilterRow icon={Sparkles} label="Intent / Goal" placeholder="Fundraise, Hire, Mentor, Co-found…" />
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Min experience</Label><Input placeholder="3 yrs" /></div>
                  <div><Label>Company stage</Label><Input placeholder="Seed → Series B" /></div>
                  <div><Label>Cheque size</Label><Input placeholder="$25k — $250k" /></div>
                </div>
                <div className="flex gap-4">
                  <CheckOpt label="Open to work" />
                  <CheckOpt label="Open to invest" />
                  <CheckOpt label="Available for mentorship" />
                  <CheckOpt label="Hiring" />
                </div>
              </TabsContent>

              <TabsContent value="behaviour" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Last active</Label><Input placeholder="<7d, 7-30d, >30d, dormant" /></div>
                  <div><Label>Signup date</Label><Input placeholder="Last 30 days" /></div>
                  <div><Label>Sessions / week</Label><Input placeholder=">10" /></div>
                  <div><Label>Swipes / day</Label><Input placeholder=">20" /></div>
                  <div><Label>Messages sent (30d)</Label><Input placeholder=">5" /></div>
                  <div><Label>Connections made</Label><Input placeholder=">3" /></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <CheckOpt label="Booked an expert session" />
                  <CheckOpt label="Posted in feed (30d)" />
                  <CheckOpt label="Joined a club / event" />
                  <CheckOpt label="Replied to AI-suggested match" />
                </div>
              </TabsContent>

              <TabsContent value="commerce" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Plan</Label><Select><SelectTrigger><SelectValue placeholder="Any plan" /></SelectTrigger><SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="elite">Elite</SelectItem><SelectItem value="founder">Founder Club</SelectItem><SelectItem value="investor">Investor Club</SelectItem></SelectContent></Select></div>
                  <div><Label>Subscription status</Label><Select><SelectTrigger><SelectValue placeholder="Active" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="trial">Trial</SelectItem><SelectItem value="past_due">Past due</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem><SelectItem value="paused">Paused</SelectItem></SelectContent></Select></div>
                  <div><Label>LTV ($)</Label><Input placeholder=">500" /></div>
                  <div><Label>MRR contribution</Label><Input placeholder=">29" /></div>
                  <div><Label>Boosts purchased</Label><Input placeholder=">0" /></div>
                  <div><Label>Credits balance</Label><Input placeholder=">100" /></div>
                </div>
                <FilterRow icon={Wallet} label="Payment methods used" placeholder="Stripe, Razorpay, Mamo, SuccessPay, Binance, Crypto, CAPShield, AngelSEED…" />
              </TabsContent>

              <TabsContent value="trust" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Trust score</Label><Input placeholder=">80" /></div>
                  <div><Label>Risk score</Label><Input placeholder="<30" /></div>
                  <div><Label>KYC status</Label><Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select></div>
                  <div><Label>Reports against</Label><Input placeholder="0" /></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <CheckOpt label="Email verified" />
                  <CheckOpt label="Phone verified" />
                  <CheckOpt label="ID verified" />
                  <CheckOpt label="Selfie / liveness verified" />
                  <CheckOpt label="Accredited investor" />
                  <CheckOpt label="Sanctions clean" />
                  <CheckOpt label="PEP cleared" />
                  <CheckOpt label="No chargebacks" />
                </div>
              </TabsContent>

              <TabsContent value="device" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Platform</Label><Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="ios">iOS</SelectItem><SelectItem value="android">Android</SelectItem><SelectItem value="web">Web</SelectItem></SelectContent></Select></div>
                  <div><Label>App version</Label><Input placeholder=">=4.2.0" /></div>
                  <div><Label>OS version</Label><Input placeholder="iOS 17+" /></div>
                  <div><Label>Network</Label><Input placeholder="WiFi, 5G, Tor (block)" /></div>
                </div>
                <FilterRow icon={Smartphone} label="Acquisition source" placeholder="Organic, Google Ads, Meta, Referral, Influencer…" />
                <FilterRow icon={Shield} label="Geo / IP" placeholder="Tier-1 cities, exclude VPN/Proxy" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Saved Segments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {SAVED_QUERIES.map((q) => (
                <div key={q.name} className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/40 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">{q.name}</div>
                    <div className="text-xs text-muted-foreground">{q.count.toLocaleString()} users {q.shared && "• shared"}</div>
                  </div>
                  <Button variant="ghost" size="sm">Load</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Searches</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {RECENT_SEARCHES.map((s) => (
                <div key={s} className="rounded-md p-2 text-xs font-mono text-muted-foreground hover:bg-muted/40 cursor-pointer truncate">{s}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ icon: Icon, label, placeholder }: { icon: any; label: string; placeholder: string }) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-1.5"><Icon className="h-3.5 w-3.5" />{label}</Label>
      <Input placeholder={placeholder} />
    </div>
  );
}

function CheckOpt({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={label} />
      <Label htmlFor={label} className="text-sm font-normal">{label}</Label>
    </div>
  );
}
