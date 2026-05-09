import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DollarSign, Percent, TrendingUp, Globe, Sparkles, Users, Crown,
  Calculator, Zap, Target, Award, AlertCircle, Settings, ArrowDown, ArrowUp
} from "lucide-react";

export function MentorshipPricing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing & Commission</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Marketplace economics: tiered take rates, regional PPP, surge pricing, equity-for-advice contracts, and earnings rules.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Take Rate (Blended)", v: "18.4%", h: "Target 18-22%", i: Percent },
          { l: "Avg Session Price", v: "$214", h: "AOV ↑12% YoY", i: DollarSign },
          { l: "GMV (30d)", v: "$2.4M", h: "Net rev $441k", i: TrendingUp },
          { l: "Expert Earnings", v: "$1.96M", h: "Paid to 1,247 experts", i: Award },
          { l: "PPP Adoption", v: "31%", h: "Across 14 markets", i: Globe },
        ].map(s => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.i className="h-3.5 w-3.5" />{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
              <div className="text-[11px] text-muted-foreground">{s.h}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="commission" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commission">Commission Tiers</TabsTrigger>
          <TabsTrigger value="ppp">PPP & Regional</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="equity">Equity-for-Advice</TabsTrigger>
          <TabsTrigger value="floors">Price Floors & Caps</TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Tiered Take-Rate by Expert Volume</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Tier</th>
                      <th className="text-left">Lifetime GMV</th>
                      <th className="text-right">Take Rate</th>
                      <th className="text-right">Payment Fee</th>
                      <th className="text-right">Net to Expert</th>
                      <th className="text-right">Experts</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { t: "Starter", icon: "🌱", gmv: "< $1k", rate: 25, fee: 2.9, n: 2840 },
                      { t: "Growing", icon: "📈", gmv: "$1k–10k", rate: 22, fee: 2.9, n: 980 },
                      { t: "Pro", icon: "⚡", gmv: "$10k–50k", rate: 18, fee: 2.5, n: 312 },
                      { t: "Elite", icon: "👑", gmv: "$50k–250k", rate: 15, fee: 2.2, n: 124 },
                      { t: "Legend", icon: "💎", gmv: "> $250k", rate: 12, fee: 2.0, n: 31 },
                    ].map(r => (
                      <tr key={r.t} className="hover:bg-muted/30">
                        <td className="py-3 font-medium">{r.icon} {r.t}</td>
                        <td className="text-muted-foreground">{r.gmv}</td>
                        <td className="text-right"><Input className="w-20 h-8 text-right inline-block" defaultValue={r.rate} />%</td>
                        <td className="text-right text-muted-foreground">{r.fee}%</td>
                        <td className="text-right font-semibold text-emerald-600">{(100 - r.rate - r.fee).toFixed(1)}%</td>
                        <td className="text-right">{r.n.toLocaleString()}</td>
                        <td className="text-right"><Button size="sm" variant="ghost">Edit</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">First-session bonus to expert</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="100" />% take rate waived for new founder relationships</div>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Long-term retainer discount</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="-3" />% take rate reduction on 3mo+ retainers</div>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Referral kickback</Label>
                  <div className="flex items-center gap-2 mt-1"><Input className="w-20 h-8" defaultValue="5" />% to referring expert (lifetime of relationship)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ppp" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Purchasing Power Parity Adjustments</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Founders pay localized rates. Expert payout normalized in their currency. Platform absorbs FX delta to expand market.</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { r: "🇺🇸 USA / Tier-1", mult: 1.00, take: 18 },
                  { r: "🇬🇧 UK / 🇪🇺 EU", mult: 0.95, take: 18 },
                  { r: "🇦🇪 GCC", mult: 0.90, take: 18 },
                  { r: "🇸🇬 SG / 🇭🇰 HK", mult: 0.92, take: 18 },
                  { r: "🇯🇵 JP / 🇰🇷 KR", mult: 0.88, take: 18 },
                  { r: "🇮🇳 India", mult: 0.45, take: 15 },
                  { r: "🇧🇷 LATAM", mult: 0.55, take: 15 },
                  { r: "🇳🇬 Africa", mult: 0.40, take: 12 },
                  { r: "🇵🇰 / 🇧🇩 / 🇱🇰 SAARC", mult: 0.38, take: 12 },
                  { r: "🇻🇳 / 🇮🇩 / 🇵🇭 SEA", mult: 0.50, take: 15 },
                ].map(p => (
                  <div key={p.r} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{p.r}</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <Label className="text-[10px]">PPP Multiplier</Label>
                        <Input className="h-7 mt-0.5" defaultValue={p.mult} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Take Rate (override)</Label>
                        <Input className="h-7 mt-0.5" defaultValue={`${p.take}%`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-medium">Anti-arbitrage:</span> Geo-IP + payment-method + KYC address triangulation. Mismatched signals trigger review. VPN detection blocks PPP rate.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Surge & Demand-Based Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { l: "Demand surge (when expert booked >80%)", v: "+25%", on: true },
                { l: "Last-minute booking (<24h notice)", v: "+15%", on: true },
                { l: "After-hours / weekend premium", v: "+20%", on: false },
                { l: "First-time founder discount", v: "-15%", on: true },
                { l: "Cohort/group discount (3+)", v: "-20%", on: true },
                { l: "Off-peak / wait-list filler", v: "-10%", on: false },
                { l: "AI-suggested optimal price (ML)", v: "Auto", on: true },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked={r.on} />
                    <span className="text-sm">{r.l}</span>
                  </div>
                  <Input className="w-24 h-8 text-right" defaultValue={r.v} />
                </div>
              ))}
              <div className="rounded-lg border p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                <Label className="text-sm font-medium flex items-center gap-2"><Calculator className="h-4 w-4" /> AI Price-Optimizer Aggressiveness</Label>
                <Slider defaultValue={[60]} max={100} step={5} className="mt-3" />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>Conservative (stable)</span><span>Balanced</span><span>Aggressive (max GMV)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equity" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> Equity-for-Advice Contracts (FAST/SAFE)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Pre-revenue founders can compensate experts with equity using YC's FAST agreement template, escrowed and gated by milestones.</p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { tier: "Standard", hours: "5h/qtr", equity: "0.05%", vest: "12mo cliff" },
                  { tier: "Strategic", hours: "10h/qtr", equity: "0.15%", vest: "24mo monthly" },
                  { tier: "Expert (board-level)", hours: "20h/qtr", equity: "0.50%", vest: "36mo monthly" },
                ].map(t => (
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

        <TabsContent value="floors" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Price Floors & Caps (Trust & Anti-Race-to-Bottom)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { l: "Global floor per session (verified expert)", v: "$25" },
                { l: "Global floor per session (Elite tier)", v: "$200" },
                { l: "Global cap per session (anti-fraud)", v: "$5,000" },
                { l: "Max discount stack", v: "35%" },
                { l: "Min retainer term", v: "30 days" },
                { l: "Max free intro per founder/expert pair", v: "1 (15min)" },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between border-b py-2">
                  <span className="text-sm">{r.l}</span>
                  <Input className="w-32 h-8 text-right" defaultValue={r.v} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
