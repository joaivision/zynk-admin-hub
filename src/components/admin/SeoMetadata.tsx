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
import { Search, Globe, Image as ImageIcon, FileCode, Link2, Plus, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

type Page = {
  id: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  noindex: boolean;
  canonical?: string;
};

const SEED_PAGES: Page[] = [
  { id: "home", path: "/", title: "Zynk — Where founders, mentors and investors meet", description: "AI-powered networking for founders, investors, and experts. Match, message, and close deals in one place.", ogImage: "/og/home.jpg", noindex: false },
  { id: "investors", path: "/for-investors", title: "Find your next deal — Zynk for Investors", description: "Vetted founders, AI deal matching, and a private deal-flow CRM built for angels, VCs, and family offices.", ogImage: "/og/investors.jpg", noindex: false },
  { id: "mentors", path: "/mentors", title: "Book the world's best startup mentors | Zynk", description: "Get unstuck with 1:1 sessions from operators who've built and scaled.", ogImage: "/og/mentors.jpg", noindex: false },
  { id: "pricing", path: "/pricing", title: "Pricing — Zynk", description: "Simple plans for founders, investors, and teams. Start free.", noindex: false, canonical: "https://zynk.ing/pricing" },
  { id: "blog", path: "/blog", title: "The Zynk Blog — Founder & investor insights", description: "Playbooks on fundraising, hiring, and growth from the Zynk community.", ogImage: "/og/blog.jpg", noindex: false },
];

export function SeoMetadata() {
  const [pages, setPages] = useState<Page[]>(SEED_PAGES);
  const [defaults, setDefaults] = useState({
    titleTemplate: "%s | Zynk",
    siteName: "Zynk",
    defaultTitle: "Zynk — Network smarter",
    defaultDescription: "AI-powered professional networking for founders, investors, and experts.",
    defaultOgImage: "/og/default.jpg",
    twitterHandle: "@zynkapp",
    locale: "en_US",
    themeColor: "#0F172A",
  });
  const [robots, setRobots] = useState(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /_lovable

Sitemap: https://zynk.ing/sitemap.xml`);

  const update = (id: string, p: Partial<Page>) => setPages((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const remove = (id: string) => setPages((s) => s.filter((x) => x.id !== id));
  const add = () =>
    setPages((s) => [...s, { id: Math.random().toString(36).slice(2), path: "/new-page", title: "", description: "", noindex: false }]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6" /> SEO & Metadata
        </h1>
        <p className="text-sm text-muted-foreground">
          Per-page titles, OG/Twitter cards, schema.org JSON-LD, sitemaps, hreflang, robots, and core web vitals targets.
        </p>
      </div>

      <Tabs defaultValue="defaults">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="defaults">Site defaults</TabsTrigger>
          <TabsTrigger value="pages">Per-page</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap & robots</TabsTrigger>
          <TabsTrigger value="hreflang">Hreflang & i18n</TabsTrigger>
          <TabsTrigger value="social">Social preview</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Site-wide defaults</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Site name</Label><Input value={defaults.siteName} onChange={(e) => setDefaults({ ...defaults, siteName: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Title template</Label><Input value={defaults.titleTemplate} onChange={(e) => setDefaults({ ...defaults, titleTemplate: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Default title</Label><Input value={defaults.defaultTitle} onChange={(e) => setDefaults({ ...defaults, defaultTitle: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Default OG image</Label><Input value={defaults.defaultOgImage} onChange={(e) => setDefaults({ ...defaults, defaultOgImage: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Default description</Label><Textarea rows={2} value={defaults.defaultDescription} onChange={(e) => setDefaults({ ...defaults, defaultDescription: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Twitter handle</Label><Input value={defaults.twitterHandle} onChange={(e) => setDefaults({ ...defaults, twitterHandle: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Default locale</Label><Input value={defaults.locale} onChange={(e) => setDefaults({ ...defaults, locale: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Theme color</Label><Input value={defaults.themeColor} onChange={(e) => setDefaults({ ...defaults, themeColor: e.target.value })} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Indexing & crawl policy</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Toggle title="Allow indexing on production domain" defaultOn />
              <Toggle title="Block indexing on staging / preview domains" defaultOn />
              <Toggle title="Strip UTM params from canonical" defaultOn />
              <Toggle title="Auto-add canonical to all pages" defaultOn />
              <Toggle title="Render meta description in SSR head" defaultOn />
              <Toggle title="Add Open Graph + Twitter Card to every page" defaultOn />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-3 pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle className="text-base">Per-page metadata</CardTitle><CardDescription>Override defaults for specific routes.</CardDescription></div>
              <Button size="sm" onClick={add} className="gap-1"><Plus className="h-4 w-4" /> Add page</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pages.map((p) => {
                const titleLen = p.title.length;
                const descLen = p.description.length;
                return (
                  <div key={p.id} className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-muted-foreground">{p.path}</code>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <Switch checked={p.noindex} onCheckedChange={(v) => update(p.id, { noindex: v })} /> noindex
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between"><Label className="text-xs">Title</Label><span className={`text-[10px] ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>{titleLen}/60</span></div>
                        <Input value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} />
                      </div>
                      <div className="grid gap-1.5"><Label className="text-xs">Path</Label><Input value={p.path} onChange={(e) => update(p.id, { path: e.target.value })} className="font-mono text-xs" /></div>
                    </div>
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between"><Label className="text-xs">Description</Label><span className={`text-[10px] ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>{descLen}/160</span></div>
                      <Textarea rows={2} value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-1.5"><Label className="text-xs">OG image URL</Label><Input value={p.ogImage ?? ""} onChange={(e) => update(p.id, { ogImage: e.target.value })} placeholder="/og/page.jpg" /></div>
                      <div className="grid gap-1.5"><Label className="text-xs">Canonical (optional)</Label><Input value={p.canonical ?? ""} onChange={(e) => update(p.id, { canonical: e.target.value })} placeholder="https://zynk.ing/path" /></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileCode className="h-4 w-4" /> JSON-LD types injected</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Toggle title="Organization (logo, sameAs, contactPoint)" defaultOn />
              <Toggle title="WebSite + SearchAction (sitelinks search box)" defaultOn />
              <Toggle title="BreadcrumbList on all routes" defaultOn />
              <Toggle title="Person schema on /u/{username} profiles" defaultOn />
              <Toggle title="Event on /events/{id}" defaultOn />
              <Toggle title="JobPosting on /jobs/{id}" defaultOn />
              <Toggle title="Product + Offer on /pricing plans" defaultOn />
              <Toggle title="Article + Author on /blog posts" defaultOn />
              <Toggle title="FAQPage on marketing pages with Q&A" defaultOn />
              <Toggle title="Course on mentor session listings" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Organization JSON-LD</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={10} className="font-mono text-xs" defaultValue={JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Zynk",
                url: "https://zynk.ing",
                logo: "https://zynk.ing/logo.png",
                sameAs: ["https://twitter.com/zynkapp", "https://linkedin.com/company/zynk"],
                contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: "support@zynk.ing" }],
              }, null, 2)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4" /> Sitemaps</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { p: "/sitemap.xml", c: 1, n: "Index" },
                { p: "/sitemap-pages.xml", c: 47, n: "Static pages" },
                { p: "/sitemap-blog.xml", c: 312, n: "Blog posts" },
                { p: "/sitemap-mentors.xml", c: 2410, n: "Mentor profiles" },
                { p: "/sitemap-jobs.xml", c: 891, n: "Job postings" },
                { p: "/sitemap-events.xml", c: 64, n: "Events" },
              ].map((s) => (
                <div key={s.p} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div><div className="font-medium">{s.n}</div><code className="text-xs text-muted-foreground">{s.p}</code></div>
                  <div className="flex items-center gap-3"><span className="text-muted-foreground">{s.c.toLocaleString()} URLs</span><Badge variant="outline">submitted</Badge></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">robots.txt</CardTitle></CardHeader>
            <CardContent><Textarea rows={8} className="font-mono text-xs" value={robots} onChange={(e) => setRobots(e.target.value)} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hreflang" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hreflang clusters</CardTitle><CardDescription>Tell Google which page to show in which language/region.</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-3 py-2">Locale</th><th className="px-3 py-2">URL pattern</th><th className="px-3 py-2">x-default</th></tr></thead>
                  <tbody className="divide-y">
                    {[
                      { l: "en", p: "https://zynk.ing/{path}", d: true },
                      { l: "en-IN", p: "https://zynk.ing/in/{path}", d: false },
                      { l: "en-AE", p: "https://zynk.ing/ae/{path}", d: false },
                      { l: "ar-AE", p: "https://zynk.ing/ar/{path}", d: false },
                      { l: "es", p: "https://zynk.ing/es/{path}", d: false },
                      { l: "fr", p: "https://zynk.ing/fr/{path}", d: false },
                    ].map((x) => (
                      <tr key={x.l}>
                        <td className="px-3 py-2 font-mono">{x.l}</td>
                        <td className="px-3 py-2 font-mono text-xs">{x.p}</td>
                        <td className="px-3 py-2">{x.d ? <Badge>default</Badge> : <span className="text-muted-foreground">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Open Graph preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden max-w-xl">
                <div className="aspect-[1200/630] bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-muted-foreground text-xs">
                  1200 × 630 OG image preview
                </div>
                <div className="p-3 bg-muted/30">
                  <div className="text-[10px] text-muted-foreground uppercase">zynk.ing</div>
                  <div className="text-sm font-semibold mt-0.5">{defaults.defaultTitle}</div>
                  <div className="text-xs text-muted-foreground">{defaults.defaultDescription}</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 mt-4">
                <Toggle title="Generate dynamic OG image per route (edge function)" defaultOn />
                <Toggle title="Use summary_large_image for Twitter" defaultOn />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 pt-4">
          <div className="grid gap-3 md:grid-cols-3">
            <AuditRow ok label="All indexable pages have unique titles" />
            <AuditRow ok label="All pages have meta description" />
            <AuditRow ok label="Single H1 per page" />
            <AuditRow warn label="3 pages missing OG image" />
            <AuditRow ok label="Canonical present on 100% of pages" />
            <AuditRow ok label="Sitemap submitted to Google + Bing" />
            <AuditRow warn label="LCP > 2.5s on 4 routes (mobile)" />
            <AuditRow ok label="Schema.org validates (Rich Results Test)" />
            <AuditRow ok label="hreflang reciprocal links symmetric" />
          </div>
        </TabsContent>
      </Tabs>
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
function AuditRow({ label, ok, warn }: { label: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-md border p-3 text-sm">
      {ok && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />}
      {warn && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
      <span>{label}</span>
    </div>
  );
}

export default SeoMetadata;
