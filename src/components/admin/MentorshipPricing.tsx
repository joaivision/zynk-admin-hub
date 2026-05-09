import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DollarSign, Percent, TrendingUp, Globe, Sparkles, Users, Crown,
  Calculator, Zap, Award, AlertCircle, Plus, Save, Trash2, Copy,
  Calendar, Clock, ArrowDownUp, Lock,
} from "lucide-react";

// ---- Types ---------------------------------------------------------------

type Tier = "starter" | "growing" | "pro" | "elite" | "legend";
type SessionType = "1:1" | "group" | "ama" | "office_hours" | "retainer" | "confidential";

const TIERS: { id: Tier; label: string; icon: string; gmv: string }[] = [
  { id: "starter",  label: "Starter",  icon: "🌱", gmv: "< $1k" },
  { id: "growing",  label: "Growing",  icon: "📈", gmv: "$1k–10k" },
  { id: "pro",      label: "Pro",      icon: "⚡", gmv: "$10k–50k" },
  { id: "elite",    label: "Elite",    icon: "👑", gmv: "$50k–250k" },
  { id: "legend",   label: "Legend",   icon: "💎", gmv: "> $250k" },
];

const SESSION_TYPES: { id: SessionType; label: string }[] = [
  { id: "1:1",          label: "1:1" },
  { id: "group",        label: "Group" },
  { id: "ama",          label: "AMA" },
  { id: "office_hours", label: "Office Hours" },
  { id: "retainer",     label: "Retainer (mo)" },
  { id: "confidential", label: "Confidential" },
];

type CommissionRule = {
  tier: Tier;
  type: SessionType;
  takeRatePct: number;       // platform commission %
  paymentFeePct: number;     // payment processing %
  payoutSchedule: "instant" | "daily" | "weekly" | "biweekly" | "monthly";
  holdDays: number;          // dispute hold
  minPriceUSD: number;
  maxPriceUSD: number;
};

type RegionOverride = {
  id: string;
  region: string;
  flag: string;
  pppMultiplier: number;     // founder-side localized price multiplier
  takeRateOverridePct?: number;
  payoutCurrency: string;
  enabled: boolean;
};

// ---- Defaults ------------------------------------------------------------

function defaultRules(): CommissionRule[] {
  // base take rates per tier
  const baseTake: Record<Tier, number> = { starter: 25, growing: 22, pro: 18, elite: 15, legend: 12 };
  // type modifiers
  const typeMod: Record<SessionType, number> = {
    "1:1": 0, group: -2, ama: -5, office_hours: -3, retainer: -4, confidential: +3,
  };
  const typeFloor: Record<SessionType, number> = {
    "1:1": 25, group: 50, ama: 0, office_hours: 25, retainer: 200, confidential: 200,
  };
  const typeCap: Record<SessionType, number> = {
    "1:1": 5000, group: 25000, ama: 10000, office_hours: 2000, retainer: 50000, confidential: 25000,
  };
  const rows: CommissionRule[] = [];
  for (const t of TIERS) {
    for (const st of SESSION_TYPES) {
      rows.push({
        tier: t.id,
        type: st.id,
        takeRatePct: Math.max(8, baseTake[t.id] + typeMod[st.id]),
        paymentFeePct: t.id === "elite" || t.id === "legend" ? 2.2 : 2.9,
        payoutSchedule: t.id === "elite" || t.id === "legend" ? "instant" : "weekly",
        holdDays: t.id === "elite" || t.id === "legend" ? 0 : 3,
        minPriceUSD: typeFloor[st.id],
        maxPriceUSD: typeCap[st.id],
      });
    }
  }
  return rows;
}

const defaultRegions: RegionOverride[] = [
  { id: "r-us",   region: "USA / Tier-1",     flag: "🇺🇸", pppMultiplier: 1.00, payoutCurrency: "USD", enabled: true },
  { id: "r-uk",   region: "UK / EU",          flag: "🇬🇧", pppMultiplier: 0.95, payoutCurrency: "GBP/EUR", enabled: true },
  { id: "r-gcc",  region: "GCC",              flag: "🇦🇪", pppMultiplier: 0.90, payoutCurrency: "AED/SAR", enabled: true },
  { id: "r-sg",   region: "Singapore / HK",   flag: "🇸🇬", pppMultiplier: 0.92, payoutCurrency: "SGD", enabled: true },
  { id: "r-jp",   region: "Japan / Korea",    flag: "🇯🇵", pppMultiplier: 0.88, payoutCurrency: "JPY/KRW", enabled: true },
  { id: "r-in",   region: "India",            flag: "🇮🇳", pppMultiplier: 0.45, takeRateOverridePct: 15, payoutCurrency: "INR", enabled: true },
  { id: "r-br",   region: "LATAM",            flag: "🇧🇷", pppMultiplier: 0.55, takeRateOverridePct: 15, payoutCurrency: "BRL/MXN", enabled: true },
  { id: "r-af",   region: "Africa",           flag: "🇳🇬", pppMultiplier: 0.40, takeRateOverridePct: 12, payoutCurrency: "USD", enabled: true },
  { id: "r-saarc",region: "SAARC",            flag: "🇵🇰", pppMultiplier: 0.38, takeRateOverridePct: 12, payoutCurrency: "USD", enabled: true },
  { id: "r-sea",  region: "SEA",              flag: "🇻🇳", pppMultiplier: 0.50, takeRateOverridePct: 15, payoutCurrency: "USD", enabled: true },
];

// ---- Component -----------------------------------------------------------

export function MentorshipPricing() {
  const [rules, setRules] = useState<CommissionRule[]>(defaultRules());
  const [regions, setRegions] = useState<RegionOverride[]>(defaultRegions);
  const [selectedTier, setSelectedTier] = useState<Tier>("pro");

  // Dynamic & equity & floors states
  const [aiAggression, setAiAggression] = useState([60]);

  const updateRule = (tier: Tier, type: SessionType, patch: Partial<CommissionRule>) => {
    setRules((prev) => prev.map((r) => (r.tier === tier && r.type === type ? { ...r, ...patch } : r)));
  };

  const tierRules = useMemo(() => rules.filter((r) => r.tier === selectedTier), [rules, selectedTier]);

  const blendedTake = useMemo(() => {
    const all = rules.map((r) => r.takeRatePct);
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1);
  }, [rules]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing & Commission</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Per-tier × per-session-type commission rules, payout timing, and regional / PPP overrides.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Blended Take Rate", v: `${blendedTake}%`, h: `${rules.length} active rules`, i: Percent },
          { l: "Avg Session Price", v: "$214", h: "AOV ↑12% YoY",  i: DollarSign },
          { l: "GMV (30d)",         v: "$2.4M", h: "Net rev $441k", i: TrendingUp },
          { l: "Expert Earnings",   v: "$1.96M", h: "1,247 paid",   i: Award },
          { l: "PPP Markets Active", v: regions.filter((r) => r.enabled).length, h: "of 10",   i: Globe },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
              <div className="text-[11px] text-muted-foreground">{s.h}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="matrix">Tier × Session Matrix</TabsTrigger>
          <TabsTrigger value="payouts">Payout Timing</TabsTrigger>
          <TabsTrigger value="regions">Regional / PPP Overrides</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="equity">Equity-for-Advice</TabsTrigger>
          <TabsTrigger value="simulator">Calculator</TabsTrigger>
        </TabsList>

        {/* MATRIX */}
        <TabsContent value="matrix" className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base">Commission Rules — {TIERS.find((t) => t.id === selectedTier)?.icon} {TIERS.find((t) => t.id === selectedTier)?.label} Tier</CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Tier</Label>
                  <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as Tier)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{TIERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.icon} {t.label} <span className="text-muted-foreground text-xs ml-1">({t.gmv})</span></SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success(`${selectedTier} tier rules saved`)}><Save className="h-4 w-4" /> Save</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2 pr-3">Session Type</th>
                      <th className="text-right">Commission %</th>
                      <th className="text-right">Pay-fee %</th>
                      <th className="text-right">Net to Expert</th>
                      <th className="text-right">Min $</th>
                      <th className="text-right">Max $</th>
                      <th>Payout</th>
                      <th className="text-right">Hold (d)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tierRules.map((r) => {
                      const net = (100 - r.takeRatePct - r.paymentFeePct).toFixed(1);
                      return (
                        <tr key={r.type} className="hover:bg-muted/30">
                          <td className="py-3 pr-3 font-medium">{SESSION_TYPES.find((s) => s.id === r.type)?.label}</td>
                          <td className="text-right">
                            <Input type="number" className="w-20 h-8 text-right inline-block" value={r.takeRatePct}
                              onChange={(e) => updateRule(r.tier, r.type, { takeRatePct: Number(e.target.value) })} />
                            <span className="ml-1 text-muted-foreground">%</span>
                          </td>
                          <td className="text-right">
                            <Input type="number" step={0.1} className="w-16 h-8 text-right inline-block" value={r.paymentFeePct}
                              onChange={(e) => updateRule(r.tier, r.type, { paymentFeePct: Number(e.target.value) })} />
                            <span className="ml-1 text-muted-foreground">%</span>
                          </td>
                          <td className="text-right font-semibold text-emerald-600">{net}%</td>
                          <td className="text-right">
                            <Input type="number" className="w-20 h-8 text-right inline-block" value={r.minPriceUSD}
                              onChange={(e) => updateRule(r.tier, r.type, { minPriceUSD: Number(e.target.value) })} />
                          </td>
                          <td className="text-right">
                            <Input type="number" className="w-24 h-8 text-right inline-block" value={r.maxPriceUSD}
                              onChange={(e) => updateRule(r.tier, r.type, { maxPriceUSD: Number(e.target.value) })} />
                          </td>
                          <td>
                            <Select value={r.payoutSchedule} onValueChange={(v) => updateRule(r.tier, r.type, { payoutSchedule: v as any })}>
                              <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="instant">Instant</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Biweekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="text-right">
                            <Input type="number" className="w-16 h-8 text-right inline-block" value={r.holdDays}
                              onChange={(e) => updateRule(r.tier, r.type, { holdDays: Number(e.target.value) })} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">First-session bonus to expert</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="100" /><span className="text-xs">% commission waived for new founder relationships</span></div>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Long-term retainer discount</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="-3" /><span className="text-xs">% commission off on 3mo+ retainers</span></div>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Referral kickback</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="5" /><span className="text-xs">% to referring expert (lifetime)</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUT TIMING */}
        <TabsContent value="payouts" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Payout Timing per Tier</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Tier</th>
                      <th>Default Schedule</th>
                      <th className="text-right">Hold (d)</th>
                      <th className="text-right">Min Threshold</th>
                      <th className="text-right">Instant Fee</th>
                      <th>Card Issuing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {TIERS.map((t) => (
                      <tr key={t.id}>
                        <td className="py-3 font-medium">{t.icon} {t.label}</td>
                        <td>
                          <Select defaultValue={t.id === "elite" || t.id === "legend" ? "instant" : "weekly"}>
                            <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instant">Instant</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Biweekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="text-right"><Input type="number" className="w-16 h-8 text-right inline-block" defaultValue={t.id === "elite" || t.id === "legend" ? 0 : 3} /></td>
                        <td className="text-right"><Input type="number" className="w-24 h-8 text-right inline-block" defaultValue={50} /></td>
                        <td className="text-right"><Input className="w-20 h-8 text-right inline-block" defaultValue="1.5%" /></td>
                        <td><Switch defaultChecked={t.id === "elite" || t.id === "legend"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground flex gap-2">
                <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Funds sit in segregated trust accounts (Stripe Treasury). Hold period gates dispute window. Per-tier overrides above; per-session overrides set in the Matrix tab.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGIONS / PPP */}
        <TabsContent value="regions" className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Regional / PPP Overrides</CardTitle>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                  const id = "r-" + Math.random().toString(36).slice(2, 6);
                  setRegions((r) => [...r, { id, region: "New region", flag: "🌐", pppMultiplier: 1, payoutCurrency: "USD", enabled: false }]);
                }}><Plus className="h-4 w-4" /> Add Region</Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Founder pays localized price (base × PPP). Expert payout normalized in their currency. Optional per-region take-rate override applies on top of tier rules.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Region</th>
                      <th className="text-right">PPP Multiplier</th>
                      <th className="text-right">Take-rate Override</th>
                      <th>Payout Currency</th>
                      <th className="text-right">Example ($1,000 base)</th>
                      <th>Enabled</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {regions.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 font-medium">{r.flag} {r.region}</td>
                        <td className="text-right">
                          <Input type="number" step={0.01} className="w-20 h-8 text-right inline-block" value={r.pppMultiplier}
                            onChange={(e) => setRegions((rs) => rs.map((x) => x.id === r.id ? { ...x, pppMultiplier: Number(e.target.value) } : x))} />
                        </td>
                        <td className="text-right">
                          <Input type="number" className="w-20 h-8 text-right inline-block" placeholder="—"
                            value={r.takeRateOverridePct ?? ""}
                            onChange={(e) => setRegions((rs) => rs.map((x) => x.id === r.id ? { ...x, takeRateOverridePct: e.target.value ? Number(e.target.value) : undefined } : x))} />
                          <span className="ml-1 text-muted-foreground">%</span>
                        </td>
                        <td>
                          <Input className="h-8 w-28 inline-block" value={r.payoutCurrency}
                            onChange={(e) => setRegions((rs) => rs.map((x) => x.id === r.id ? { ...x, payoutCurrency: e.target.value } : x))} />
                        </td>
                        <td className="text-right text-xs text-muted-foreground">
                          founder pays <span className="text-foreground font-medium">${(1000 * r.pppMultiplier).toFixed(0)}</span>
                        </td>
                        <td><Switch checked={r.enabled} onCheckedChange={(v) => setRegions((rs) => rs.map((x) => x.id === r.id ? { ...x, enabled: v } : x))} /></td>
                        <td><Button size="sm" variant="ghost" onClick={() => setRegions((rs) => rs.filter((x) => x.id !== r.id))}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-medium">Anti-arbitrage:</span> Geo-IP + payment-method BIN + KYC address triangulation. Mismatched signals trigger review. VPN detection blocks PPP rate.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DYNAMIC */}
        <TabsContent value="dynamic" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Surge & Demand-Based Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { l: "Demand surge (when expert booked >80%)", v: "+25%", on: true },
                { l: "Last-minute booking (<24h notice)",      v: "+15%", on: true },
                { l: "After-hours / weekend premium",          v: "+20%", on: false },
                { l: "First-time founder discount",            v: "-15%", on: true },
                { l: "Cohort/group discount (3+)",             v: "-20%", on: true },
                { l: "Off-peak / wait-list filler",            v: "-10%", on: false },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked={r.on} />
                    <span className="text-sm">{r.l}</span>
                  </div>
                  <Input className="w-24 h-8 text-right" defaultValue={r.v} />
                </div>
              ))}
              <div className="rounded-lg border p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                <Label className="text-sm font-medium flex items-center gap-2"><Calculator className="h-4 w-4" /> AI Price-Optimizer Aggressiveness — {aiAggression[0]}</Label>
                <Slider value={aiAggression} onValueChange={setAiAggression} max={100} step={5} className="mt-3" />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>Conservative</span><span>Balanced</span><span>Aggressive (max GMV)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EQUITY */}
        <TabsContent value="equity" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> Equity-for-Advice (FAST)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Pre-revenue founders compensate experts with equity using YC's FAST template, escrowed and gated by milestones.</p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { tier: "Standard",  hours: "5h/qtr",  equity: "0.05%", vest: "12mo cliff" },
                  { tier: "Strategic", hours: "10h/qtr", equity: "0.15%", vest: "24mo monthly" },
                  { tier: "Board-level", hours: "20h/qtr", equity: "0.50%", vest: "36mo monthly" },
                ].map((t) => (
                  <div key={t.tier} className="rounded-lg border p-4">
                    <div className="font-semibold text-sm">{t.tier}</div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Commitment</span><span>{t.hours}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Equity range</span><span className="font-mono">{t.equity}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Vesting</span><span>{t.vest}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm">Platform fee on equity grant (one-time)</span><Input className="w-24 h-8" defaultValue="2%" /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Cap-table integration (Carta, AngelList, Pulley)</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Escrowed vesting + milestone gates</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Cash + equity hybrid allowed</span><Switch defaultChecked /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIMULATOR */}
        <TabsContent value="simulator" className="space-y-3">
          <PriceSimulator rules={rules} regions={regions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Simulator -----------------------------------------------------------

function PriceSimulator({ rules, regions }: { rules: CommissionRule[]; regions: RegionOverride[] }) {
  const [tier, setTier] = useState<Tier>("pro");
  const [type, setType] = useState<SessionType>("1:1");
  const [region, setRegion] = useState<string>("r-us");
  const [basePrice, setBasePrice] = useState(500);

  const rule = rules.find((r) => r.tier === tier && r.type === type)!;
  const reg = regions.find((r) => r.id === region)!;
  const founderPays = basePrice * reg.pppMultiplier;
  const takeRate = reg.takeRateOverridePct ?? rule.takeRatePct;
  const platformCut = founderPays * (takeRate / 100);
  const paymentFee = founderPays * (rule.paymentFeePct / 100);
  const expertGets = founderPays - platformCut - paymentFee;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" /> Pricing Calculator</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Expert tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{TIERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.icon} {t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Session type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SessionType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{SESSION_TYPES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Founder region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.flag} {r.region}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Base price (USD)</Label>
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="mt-1" />
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-to-br from-primary/5 to-accent/5 space-y-3">
          <div className="text-sm font-semibold">Breakdown</div>
          <div className="space-y-1.5 text-sm">
            <Row label="Base price (expert listing)" value={`$${basePrice.toFixed(2)}`} />
            <Row label={`PPP multiplier (${reg.flag} ${reg.region})`} value={`× ${reg.pppMultiplier}`} />
            <Row label="Founder pays" value={`$${founderPays.toFixed(2)}`} highlight />
            <div className="border-t my-2" />
            <Row label={`Platform commission (${takeRate}%)${reg.takeRateOverridePct ? " · region override" : ""}`} value={`-$${platformCut.toFixed(2)}`} />
            <Row label={`Payment fee (${rule.paymentFeePct}%)`} value={`-$${paymentFee.toFixed(2)}`} />
            <div className="border-t my-2" />
            <Row label="Expert receives" value={`$${expertGets.toFixed(2)}`} highlight emerald />
            <div className="text-[11px] text-muted-foreground mt-1">
              Payout: {rule.payoutSchedule} · hold {rule.holdDays}d · in {reg.payoutCurrency}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, highlight, emerald }: { label: string; value: string; highlight?: boolean; emerald?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${highlight ? "font-semibold" : "text-muted-foreground"} ${emerald ? "text-emerald-600" : ""}`}>
      <span className="text-xs">{label}</span>
      <span className={highlight ? "text-base" : ""}>{value}</span>
    </div>
  );
}
