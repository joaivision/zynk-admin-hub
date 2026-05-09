import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cookie, Globe, Eye, FileText, Shield, Plus, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  required: boolean;
  description: string;
  cookies: { name: string; provider: string; ttl: string; purpose: string }[];
};

const SEED_CATEGORIES: Category[] = [
  {
    id: "necessary",
    name: "Strictly necessary",
    required: true,
    description: "Required for the site to function (login session, CSRF, load balancing).",
    cookies: [
      { name: "zk_session", provider: "zynk.ing", ttl: "Session", purpose: "Auth session" },
      { name: "csrf_token", provider: "zynk.ing", ttl: "Session", purpose: "CSRF protection" },
    ],
  },
  {
    id: "preferences",
    name: "Preferences",
    required: false,
    description: "Remember UI choices like language, theme, currency.",
    cookies: [{ name: "zk_locale", provider: "zynk.ing", ttl: "1 year", purpose: "Language preference" }],
  },
  {
    id: "analytics",
    name: "Analytics",
    required: false,
    description: "Aggregate usage stats to improve the product.",
    cookies: [
      { name: "_ga", provider: "Google Analytics", ttl: "2 years", purpose: "User distinction" },
      { name: "ph_*", provider: "PostHog", ttl: "1 year", purpose: "Product analytics" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    required: false,
    description: "Personalized ads and conversion tracking.",
    cookies: [
      { name: "_fbp", provider: "Meta", ttl: "3 months", purpose: "Ad attribution" },
      { name: "li_at", provider: "LinkedIn", ttl: "1 year", purpose: "LinkedIn Insights" },
    ],
  },
];

export function ConsentBanner() {
  const [enabled, setEnabled] = useState(true);
  const [layout, setLayout] = useState("bottom_bar");
  const [theme, setTheme] = useState("auto");
  const [framework, setFramework] = useState("gdpr_ccpa");
  const [region, setRegion] = useState("eea_uk");
  const [respectGPC, setRespectGPC] = useState(true);
  const [blockUntilConsent, setBlockUntilConsent] = useState(true);
  const [revisionDays, setRevisionDays] = useState(180);
  const [title, setTitle] = useState("We value your privacy");
  const [body, setBody] = useState(
    "We use cookies to power core features, measure how Zynk is used, and (with your permission) personalize content. You can change your choices anytime in Privacy Preferences.",
  );
  const [cats, setCats] = useState(SEED_CATEGORIES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Cookie className="h-6 w-6" /> Cookie & Consent Banner
        </h1>
        <p className="text-sm text-muted-foreground">
          GDPR / ePrivacy / CCPA-compliant consent. Tags fire only after the matching category is granted.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Banner enabled</CardTitle>
            <CardDescription>When off, all non-essential tags are blocked everywhere.</CardDescription>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardHeader>
      </Card>

      <Tabs defaultValue="categories">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="categories"><Shield className="h-3.5 w-3.5 mr-1" />Categories</TabsTrigger>
          <TabsTrigger value="appearance"><Eye className="h-3.5 w-3.5 mr-1" />Appearance</TabsTrigger>
          <TabsTrigger value="regional"><Globe className="h-3.5 w-3.5 mr-1" />Regional rules</TabsTrigger>
          <TabsTrigger value="copy"><FileText className="h-3.5 w-3.5 mr-1" />Copy & links</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="h-3.5 w-3.5 mr-1" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-3 pt-4">
          {cats.map((c, idx) => (
            <Card key={c.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {c.name}
                    {c.required && <Badge variant="secondary">Always on</Badge>}
                  </CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked disabled={c.required} />
                  {!c.required && (
                    <Button variant="ghost" size="icon" onClick={() => setCats((p) => p.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-left uppercase tracking-wider text-muted-foreground">
                      <tr><th className="px-3 py-2">Cookie</th><th className="px-3 py-2">Provider</th><th className="px-3 py-2">TTL</th><th className="px-3 py-2">Purpose</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {c.cookies.map((k) => (
                        <tr key={k.name}><td className="px-3 py-2 font-mono">{k.name}</td><td className="px-3 py-2">{k.provider}</td><td className="px-3 py-2">{k.ttl}</td><td className="px-3 py-2 text-muted-foreground">{k.purpose}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add category</Button>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom_bar">Bottom bar</SelectItem>
                  <SelectItem value="bottom_left">Bottom-left popup</SelectItem>
                  <SelectItem value="bottom_right">Bottom-right popup</SelectItem>
                  <SelectItem value="center_modal">Center modal (blocking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (match site)</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Toggle title="Show 'Reject All' with equal prominence to 'Accept All' (GDPR)" defaultOn />
            <Toggle title='Show "Customize" / per-category toggles' defaultOn />
            <Toggle title="Show floating revoke icon after first choice" defaultOn />
            <Toggle title="Animate banner entry" defaultOn />
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Compliance framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gdpr_ccpa">GDPR + CCPA/CPRA + ePrivacy</SelectItem>
                  <SelectItem value="gdpr">GDPR only</SelectItem>
                  <SelectItem value="ccpa">CCPA / CPRA only</SelectItem>
                  <SelectItem value="lgpd">Brazil LGPD</SelectItem>
                  <SelectItem value="pdpl">UAE / KSA PDPL</SelectItem>
                  <SelectItem value="dpdp">India DPDP Act</SelectItem>
                  <SelectItem value="all">All — strictest applies per region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Show banner for visitors from</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eea_uk">EEA + UK + Switzerland</SelectItem>
                  <SelectItem value="eea_uk_ca">EEA + UK + California</SelectItem>
                  <SelectItem value="all">All visitors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Re-prompt after (days)</Label>
              <Input type="number" value={revisionDays} onChange={(e) => setRevisionDays(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleControlled title="Honor Global Privacy Control (GPC) signal" value={respectGPC} onChange={setRespectGPC} />
            <ToggleControlled title="Block third-party tags until consent (TCF v2.2)" value={blockUntilConsent} onChange={setBlockUntilConsent} />
            <Toggle title="Treat 'X' / dismiss as Reject (not Accept)" defaultOn />
            <Toggle title='Show "Do Not Sell or Share My Personal Information" link (US)' defaultOn />
            <Toggle title="Require explicit consent for minors (16/13)" defaultOn />
            <Toggle title="Geo-IP override allowed (debug)" />
          </div>
        </TabsContent>

        <TabsContent value="copy" className="space-y-4 pt-4">
          <div className="grid gap-1.5"><Label>Banner title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Banner body</Label><Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5"><Label>Privacy Policy URL</Label><Input defaultValue="/legal/privacy" /></div>
            <div className="grid gap-1.5"><Label>Cookie Policy URL</Label><Input defaultValue="/legal/cookies" /></div>
            <div className="grid gap-1.5"><Label>DPA / DPO contact</Label><Input defaultValue="dpo@zynk.ing" /></div>
            <div className="grid gap-1.5"><Label>Data Subject Request URL</Label><Input defaultValue="/legal/dsr" /></div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Consent stats (last 30 days)</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <Stat label="Banners shown" value="284,910" />
              <Stat label="Accept all" value="61.2%" />
              <Stat label="Reject all" value="22.4%" />
              <Stat label="Custom selection" value="16.4%" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Consent log retention</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Each consent action is stored with: timestamp, user_id (if logged in), pseudonymous visitor_id, region, banner version, granted categories, GPC flag.</p>
              <p>Retained for <strong>5 years</strong> as proof of consent under GDPR Art. 7. Exportable via DSAR endpoint.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Preview banner</Button>
        <Button>Publish</Button>
      </div>
    </div>
  );
}

function Toggle({ title, defaultOn }: { title: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30">
      <span>{title}</span><Switch checked={on} onCheckedChange={setOn} />
    </label>
  );
}
function ToggleControlled({ title, value, onChange }: { title: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30">
      <span>{title}</span><Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xl font-semibold mt-1">{value}</div></div>
  );
}

export default ConsentBanner;
