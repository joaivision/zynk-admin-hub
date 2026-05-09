import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Palette,
  Globe,
  RotateCcw,
  History,
  CheckCircle2,
  Eye,
  Download,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  Mail,
  Search as SearchIcon,
  ChevronRight,
  Bell,
  Lock,
  Trash2,
  Copy,
  ShieldCheck,
} from "lucide-react";

type Asset = {
  id: string;
  label: string;
  description: string;
  recommended: string;
  format: string;
  url: string | null;
};

type BrandVersion = {
  id: string;
  label: string;
  publishedAt: string;
  publishedBy: string;
  isLive: boolean;
  notes: string;
};

const initialAssets: Asset[] = [
  {
    id: "logo-primary",
    label: "Primary Logo (Light)",
    description: "Used on light backgrounds across web, email, and dashboard.",
    recommended: "1200x320 SVG/PNG",
    format: "SVG, PNG",
    url: null,
  },
  {
    id: "logo-dark",
    label: "Primary Logo (Dark)",
    description: "Used on dark backgrounds, hero sections, and dark mode UI.",
    recommended: "1200x320 SVG/PNG",
    format: "SVG, PNG",
    url: null,
  },
  {
    id: "logo-mark",
    label: "App Icon / Symbol",
    description: "Square mark used in mobile launcher, favicons, and avatars.",
    recommended: "1024x1024 PNG",
    format: "PNG, SVG",
    url: null,
  },
  {
    id: "favicon",
    label: "Favicon",
    description: "Browser tab favicon. ICO + PNG fallbacks.",
    recommended: "64x64 ICO/PNG",
    format: "ICO, PNG",
    url: null,
  },
  {
    id: "og-image",
    label: "Social Share (OG Image)",
    description: "Default OpenGraph card for shared links.",
    recommended: "1200x630 PNG/JPG",
    format: "PNG, JPG",
    url: null,
  },
  {
    id: "email-banner",
    label: "Email Header",
    description: "Top banner used in transactional and marketing emails.",
    recommended: "1200x300 PNG",
    format: "PNG, JPG",
    url: null,
  },
  {
    id: "splash",
    label: "Mobile Splash",
    description: "Mobile app splash screen background.",
    recommended: "1242x2688 PNG",
    format: "PNG",
    url: null,
  },
  {
    id: "loader",
    label: "Loader Animation",
    description: "Lottie or animated SVG used during app boot.",
    recommended: "Lottie JSON / SVG",
    format: "JSON, SVG",
    url: null,
  },
];

const initialVersions: BrandVersion[] = [
  {
    id: "v3",
    label: "Spring Refresh 2026",
    publishedAt: "2026-04-12 10:24",
    publishedBy: "Aarav (Brand)",
    isLive: true,
    notes: "Tightened wordmark, new accent color, refreshed OG card.",
  },
  {
    id: "v2",
    label: "Investor Launch",
    publishedAt: "2025-11-02 18:11",
    publishedBy: "Mira (Founder)",
    isLive: false,
    notes: "Added investor-focused tagline, dark logo variant.",
  },
  {
    id: "v1",
    label: "Initial Brand",
    publishedAt: "2025-06-21 09:02",
    publishedBy: "System",
    isLive: false,
    notes: "MVP launch brand kit.",
  },
];

const fontStacks = [
  { value: "geist", label: "Geist + Inter (Modern Tech)" },
  { value: "satoshi", label: "Satoshi + Inter (Editorial)" },
  { value: "sora", label: "Sora + DM Sans (Friendly)" },
  { value: "ibm", label: "IBM Plex Sans + Mono (Enterprise)" },
  { value: "playfair", label: "Playfair + Inter (Premium)" },
];

export function PlatformBranding() {
  // Identity
  const [name, setName] = useState("Zynk.ing");
  const [legalName, setLegalName] = useState("Zynking Networks Pvt. Ltd.");
  const [tagline, setTagline] = useState("Where Founders, Investors & Operators Connect.");
  const [shortDesc, setShortDesc] = useState(
    "Zynk.ing is the AI-powered business networking platform for founders, investors, mentors and operators — broader and smarter than LinkedIn.",
  );
  const [supportEmail, setSupportEmail] = useState("hello@zynk.ing");
  const [domain, setDomain] = useState("zynk.ing");
  const [tone, setTone] = useState("Confident, founder-friendly, globally inclusive.");
  const [keywords, setKeywords] = useState(
    "business networking, founders, investors, mentors, deal flow, syndicates, AI matching",
  );

  // Colors
  const [primary, setPrimary] = useState("#5B5BF7");
  const [accent, setAccent] = useState("#16E0BD");
  const [bg, setBg] = useState("#0B0B14");
  const [fg, setFg] = useState("#FFFFFF");
  const [font, setFont] = useState("geist");

  // Toggles
  const [showWordmark, setShowWordmark] = useState(true);
  const [autoDarkMode, setAutoDarkMode] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);
  const [showInEmails, setShowInEmails] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [coBranding, setCoBranding] = useState(false);

  // Assets
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Versions
  const [versions, setVersions] = useState<BrandVersion[]>(initialVersions);
  const [restoreOpen, setRestoreOpen] = useState<BrandVersion | null>(null);
  const [previewMode, setPreviewMode] = useState<"web" | "mobile" | "email">("web");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [publishOpen, setPublishOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const initials = useMemo(
    () =>
      name
        .replace(/[^a-zA-Z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "Z",
    [name],
  );

  const onPickFile = (assetId: string) => fileInputs.current[assetId]?.click();

  const onFileChange = (assetId: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, url } : a)));
    toast.success(`${assets.find((a) => a.id === assetId)?.label} uploaded`);
  };

  const removeAsset = (assetId: string) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, url: null } : a)));
    toast("Asset removed");
  };

  const publishDraft = () => {
    const id = `v${versions.length + 1}`;
    const newVersion: BrandVersion = {
      id,
      label: `Update ${new Date().toLocaleDateString()}`,
      publishedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      publishedBy: "You",
      isLive: true,
      notes: "Published from Brand Studio.",
    };
    setVersions((prev) => [newVersion, ...prev.map((v) => ({ ...v, isLive: false }))]);
    setPublishOpen(false);
    toast.success("Brand kit published live");
  };

  const restoreVersion = (v: BrandVersion) => {
    setVersions((prev) => prev.map((x) => ({ ...x, isLive: x.id === v.id })));
    setRestoreOpen(null);
    toast.success(`Restored "${v.label}"`);
  };

  const resetAll = () => {
    setAssets(initialAssets);
    setPrimary("#5B5BF7");
    setAccent("#16E0BD");
    setBg("#0B0B14");
    setFg("#FFFFFF");
    setName("Zynk.ing");
    setTagline("Where Founders, Investors & Operators Connect.");
    setResetOpen(false);
    toast("Reset to defaults");
  };

  const exportKit = () => {
    const kit = {
      name,
      legalName,
      tagline,
      shortDesc,
      domain,
      supportEmail,
      colors: { primary, accent, bg, fg },
      font,
      toggles: { showWordmark, autoDarkMode, showInFooter, showInEmails, maintenanceMode, coBranding },
      assets: assets.map((a) => ({ id: a.id, label: a.label, hasFile: !!a.url })),
    };
    const blob = new Blob([JSON.stringify(kit, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase()}-brand-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Brand kit exported");
  };

  const copyToken = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast(`${token} copied`);
  };

  const previewBg = previewTheme === "dark" ? bg : "#FFFFFF";
  const previewFg = previewTheme === "dark" ? fg : "#0B0B14";
  const logoAsset = assets.find((a) => a.id === (previewTheme === "dark" ? "logo-dark" : "logo-primary"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Platform Name & Logo</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Brand Studio</h1>
          <p className="text-sm text-muted-foreground">
            Manage Zynk.ing's name, logo, colors, typography and brand assets — across web, mobile and email.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportKit} className="gap-1">
            <Download className="h-4 w-4" /> Export kit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResetOpen(true)} className="gap-1">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button size="sm" onClick={() => setPublishOpen(true)} className="gap-1">
            <CheckCircle2 className="h-4 w-4" /> Publish changes
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Live version", value: versions.find((v) => v.isLive)?.label ?? "—", icon: ShieldCheck },
          { label: "Assets uploaded", value: `${assets.filter((a) => a.url).length}/${assets.length}`, icon: ImageIcon },
          { label: "Color tokens", value: "4", icon: Palette },
          { label: "Domain", value: domain, icon: Globe },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-sm font-semibold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Tabs defaultValue="identity">
            <TabsList>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="logos">Logos & Icons</TabsTrigger>
              <TabsTrigger value="colors">Colors & Type</TabsTrigger>
              <TabsTrigger value="meta">SEO & Meta</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>

            {/* Identity */}
            <TabsContent value="identity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Platform identity</CardTitle>
                  <CardDescription>
                    These appear on the navbar, emails, app stores, invoices, and legal pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Legal entity</Label>
                    <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tagline</Label>
                    <Input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={90} />
                    <p className="text-xs text-muted-foreground">{tagline.length}/90 chars</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>One-line description</Label>
                    <Textarea
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      rows={3}
                      maxLength={240}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary domain</Label>
                    <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Support email</Label>
                    <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Voice & tone</Label>
                    <Textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={2} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Display rules</CardTitle>
                  <CardDescription>Control where the brand appears across the product surface.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {[
                    { id: "wm", label: "Show wordmark in navbar", state: showWordmark, set: setShowWordmark, icon: Monitor },
                    { id: "dm", label: "Auto switch logo for dark mode", state: autoDarkMode, set: setAutoDarkMode, icon: Moon },
                    { id: "ft", label: "Show logo in footer", state: showInFooter, set: setShowInFooter, icon: Eye },
                    { id: "em", label: "Brand emails with logo", state: showInEmails, set: setShowInEmails, icon: Mail },
                    { id: "co", label: "Allow co-branding (partners)", state: coBranding, set: setCoBranding, icon: Sparkles },
                    { id: "mn", label: "Maintenance brand override", state: maintenanceMode, set: setMaintenanceMode, icon: Lock },
                  ].map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <t.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t.label}</span>
                      </div>
                      <Switch checked={t.state} onCheckedChange={t.set} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logos */}
            <TabsContent value="logos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Brand assets</CardTitle>
                  <CardDescription>
                    Upload logos, favicons, social cards and animations. Drag-replace anytime — versions are kept.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {assets.map((a) => (
                    <div key={a.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{a.label}</div>
                          <div className="text-xs text-muted-foreground">{a.description}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{a.format}</Badge>
                      </div>

                      <div
                        className="mt-3 flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/30"
                        style={
                          a.id === "logo-dark"
                            ? { background: bg, color: fg }
                            : undefined
                        }
                      >
                        {a.url ? (
                          <img src={a.url} alt={a.label} className="max-h-full max-w-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center text-xs text-muted-foreground">
                            <ImageIcon className="mb-1 h-5 w-5" />
                            <span>No file • {a.recommended}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onPickFile(a.id)} className="gap-1">
                            <Upload className="h-3.5 w-3.5" />
                            {a.url ? "Replace" : "Upload"}
                          </Button>
                          {a.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-destructive"
                              onClick={() => removeAsset(a.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </Button>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{a.recommended}</span>
                      </div>

                      <input
                        ref={(el) => {
                          fileInputs.current[a.id] = el;
                        }}
                        type="file"
                        accept="image/*,.json,.svg,.ico"
                        className="hidden"
                        onChange={(e) => onFileChange(a.id, e.target.files)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors & Type */}
            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Color tokens</CardTitle>
                  <CardDescription>
                    These map to design tokens used throughout the app. Click any value to copy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {[
                    { token: "--primary", label: "Primary", value: primary, set: setPrimary },
                    { token: "--accent", label: "Accent", value: accent, set: setAccent },
                    { token: "--background", label: "Background", value: bg, set: setBg },
                    { token: "--foreground", label: "Foreground", value: fg, set: setFg },
                  ].map((c) => (
                    <div key={c.token} className="flex items-center gap-3 rounded-lg border p-3">
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => c.set(e.target.value)}
                        className="h-12 w-12 cursor-pointer rounded border bg-transparent"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{c.label}</div>
                        <div className="text-xs text-muted-foreground">{c.token}</div>
                      </div>
                      <button
                        onClick={() => copyToken(c.token, c.value)}
                        className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                      >
                        {c.value.toUpperCase()}
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Typography</CardTitle>
                  <CardDescription>Choose a font pairing for headings and body.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {fontStacks.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold tracking-tight">{name} — {tagline}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{shortDesc}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="meta" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SEO & social meta</CardTitle>
                  <CardDescription>Used on Google results, OpenGraph cards, and Twitter previews.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta keywords</Label>
                    <Textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={2} />
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <SearchIcon className="h-3.5 w-3.5" /> Google preview
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-emerald-600">https://{domain}</div>
                      <div className="text-base text-blue-700 dark:text-blue-400">
                        {name} — {tagline}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{shortDesc}</div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <div
                      className="flex aspect-[1200/630] items-end p-6"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                      <div className="text-white">
                        <div className="text-xs uppercase tracking-widest opacity-80">{domain}</div>
                        <div className="text-2xl font-bold">{name}</div>
                        <div className="text-sm opacity-90">{tagline}</div>
                      </div>
                    </div>
                    <div className="border-t p-3 text-xs text-muted-foreground">OG card preview (1200×630)</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Versions */}
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Version history</CardTitle>
                  <CardDescription>Roll back to a previous brand kit anytime. The live version powers all surfaces.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y rounded-md border">
                    {versions.map((v) => (
                      <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-muted p-2"><History className="h-4 w-4" /></div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {v.label}
                              {v.isLive && <Badge className="text-[10px]">Live</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {v.publishedAt} • {v.publishedBy} • {v.notes}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={v.isLive} onClick={() => setRestoreOpen(v)}>
                            {v.isLive ? "Current" : "Restore"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live preview */}
        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Live preview</CardTitle>
              <div className="flex gap-1 rounded-md border p-1">
                <Button size="sm" variant={previewTheme === "light" ? "secondary" : "ghost"} onClick={() => setPreviewTheme("light")} className="h-7 px-2">
                  <Sun className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant={previewTheme === "dark" ? "secondary" : "ghost"} onClick={() => setPreviewTheme("dark")} className="h-7 px-2">
                  <Moon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as typeof previewMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="web"><Monitor className="mr-1 h-3.5 w-3.5" /> Web</TabsTrigger>
                <TabsTrigger value="mobile"><Smartphone className="mr-1 h-3.5 w-3.5" /> Mobile</TabsTrigger>
                <TabsTrigger value="email"><Mail className="mr-1 h-3.5 w-3.5" /> Email</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] rounded-md border">
              <div style={{ background: previewBg, color: previewFg }} className="min-h-[520px] p-4">
                {previewMode === "web" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {logoAsset?.url ? (
                          <img src={logoAsset.url} alt="logo" className="h-7" />
                        ) : (
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                            style={{ background: primary }}
                          >
                            {initials}
                          </div>
                        )}
                        {showWordmark && <span className="text-sm font-semibold">{name}</span>}
                      </div>
                      <Bell className="h-4 w-4 opacity-70" />
                    </div>
                    <div
                      className="rounded-xl p-5"
                      style={{ background: `linear-gradient(135deg, ${primary}33, ${accent}22)` }}
                    >
                      <div className="text-[10px] uppercase tracking-widest opacity-70">{domain}</div>
                      <div className="text-xl font-bold leading-tight">{tagline}</div>
                      <p className="mt-1 text-xs opacity-80">{shortDesc}</p>
                      <button
                        className="mt-3 rounded-md px-3 py-1.5 text-xs font-medium text-white"
                        style={{ background: primary }}
                      >
                        Join the network
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      {["Founders", "Investors", "Mentors"].map((x) => (
                        <div key={x} className="rounded-md border border-current/10 p-2" style={{ background: `${accent}15` }}>
                          {x}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewMode === "mobile" && (
                  <div className="mx-auto w-[220px] overflow-hidden rounded-[28px] border-4 border-current/10" style={{ background: previewBg }}>
                    <div className="flex h-[420px] flex-col items-center justify-center gap-3 p-4 text-center">
                      {logoAsset?.url ? (
                        <img src={logoAsset.url} alt="logo" className="h-12" />
                      ) : (
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
                          style={{ background: primary }}
                        >
                          {initials}
                        </div>
                      )}
                      <div className="text-base font-bold">{name}</div>
                      <div className="text-[11px] opacity-80">{tagline}</div>
                      <button className="mt-2 rounded-full px-3 py-1.5 text-[11px] text-white" style={{ background: accent, color: "#0B0B14" }}>
                        Get started
                      </button>
                    </div>
                  </div>
                )}
                {previewMode === "email" && (
                  <div className="overflow-hidden rounded-md border bg-white text-slate-900">
                    <div className="flex items-center gap-2 border-b p-3" style={{ background: primary, color: "#fff" }}>
                      {logoAsset?.url ? (
                        <img src={logoAsset.url} alt="logo" className="h-5" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: "#fff", color: primary }}>
                          {initials}
                        </div>
                      )}
                      <span className="text-xs font-semibold">{name}</span>
                    </div>
                    <div className="space-y-2 p-4 text-xs">
                      <div className="font-semibold">Welcome to {name} 👋</div>
                      <p>{shortDesc}</p>
                      <button className="rounded px-3 py-1.5 text-[11px] text-white" style={{ background: primary }}>
                        Complete your profile
                      </button>
                      <Separator className="my-2" />
                      <p className="text-[10px] text-slate-500">
                        {legalName} • {supportEmail} • {domain}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Preview updates instantly. Click <b>Publish changes</b> to roll out to all users.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Publish */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish brand kit</DialogTitle>
            <DialogDescription>
              This pushes the current name, logo, colors and copy live across web, mobile and email.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-3 text-sm">
            <div><b>{name}</b> — {tagline}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {assets.filter((a) => a.url).length} assets • 4 color tokens • font: {fontStacks.find((f) => f.value === font)?.label}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button onClick={publishDraft}>Publish live</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore */}
      <AlertDialog open={!!restoreOpen} onOpenChange={(o) => !o && setRestoreOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore "{restoreOpen?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This swaps the live brand kit back to the selected version. You can roll forward again any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoreOpen && restoreVersion(restoreOpen)}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to factory defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              All uploaded assets and color overrides will be cleared. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetAll}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
