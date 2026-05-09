import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Trash2, ShieldCheck, Mail, Lock, RefreshCw, Copy, ExternalLink } from "lucide-react";

type DomainStatus = "active" | "verifying" | "failed" | "offline" | "ready";
type Domain = {
  host: string;
  primary: boolean;
  status: DomainStatus;
  ssl: "issued" | "renewing" | "pending" | "failed";
  ssl_expires: string;
  proxy: boolean;
  forceHttps: boolean;
  hsts: boolean;
};

type DnsRecord = {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "CAA";
  name: string;
  value: string;
  ttl: number;
  priority?: number;
};

const SEED_DOMAINS: Domain[] = [
  { host: "zynk.ing", primary: true, status: "active", ssl: "issued", ssl_expires: "2026-08-12", proxy: false, forceHttps: true, hsts: true },
  { host: "www.zynk.ing", primary: false, status: "active", ssl: "issued", ssl_expires: "2026-08-12", proxy: false, forceHttps: true, hsts: true },
  { host: "app.zynk.ing", primary: false, status: "active", ssl: "issued", ssl_expires: "2026-07-02", proxy: true, forceHttps: true, hsts: true },
  { host: "investors.zynk.ing", primary: false, status: "verifying", ssl: "pending", ssl_expires: "—", proxy: false, forceHttps: false, hsts: false },
  { host: "zynk.ae", primary: false, status: "ready", ssl: "pending", ssl_expires: "—", proxy: false, forceHttps: true, hsts: false },
];

const SEED_RECORDS: DnsRecord[] = [
  { id: "1", type: "A", name: "@", value: "185.158.133.1", ttl: 3600 },
  { id: "2", type: "A", name: "www", value: "185.158.133.1", ttl: 3600 },
  { id: "3", type: "TXT", name: "_lovable", value: "lovable_verify=ABC123", ttl: 3600 },
  { id: "4", type: "MX", name: "@", value: "aspmx.l.google.com", ttl: 3600, priority: 1 },
  { id: "5", type: "TXT", name: "@", value: "v=spf1 include:_spf.google.com include:mailgun.org ~all", ttl: 3600 },
  { id: "6", type: "TXT", name: "default._domainkey", value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQ…", ttl: 3600 },
  { id: "7", type: "TXT", name: "_dmarc", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@zynk.ing; pct=100", ttl: 3600 },
  { id: "8", type: "CAA", name: "@", value: "0 issue \"letsencrypt.org\"", ttl: 3600 },
];

const statusVariant: Record<DomainStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default", verifying: "secondary", failed: "destructive", offline: "destructive", ready: "outline",
};

export function DomainsDNS() {
  const [domains, setDomains] = useState<Domain[]>(SEED_DOMAINS);
  const [records, setRecords] = useState<DnsRecord[]>(SEED_RECORDS);
  const [active, setActive] = useState("zynk.ing");
  const [newHost, setNewHost] = useState("");

  const addDomain = () => {
    if (!newHost.trim()) return;
    setDomains((p) => [...p, {
      host: newHost.trim(), primary: false, status: "verifying", ssl: "pending",
      ssl_expires: "—", proxy: false, forceHttps: true, hsts: false,
    }]);
    setNewHost("");
  };
  const removeDomain = (h: string) => setDomains((p) => p.filter((d) => d.host !== h));
  const setPrimary = (h: string) => setDomains((p) => p.map((d) => ({ ...d, primary: d.host === h })));

  const addRecord = () => setRecords((p) => [...p, { id: Math.random().toString(36).slice(2), type: "A", name: "", value: "", ttl: 3600 }]);
  const removeRecord = (id: string) => setRecords((p) => p.filter((r) => r.id !== id));
  const updateRecord = (id: string, patch: Partial<DnsRecord>) =>
    setRecords((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-6 w-6" /> Domains & DNS
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage custom domains, SSL, redirects, and authoritative DNS zones (A, MX, SPF, DKIM, DMARC, CAA).
        </p>
      </div>

      <Tabs defaultValue="domains">
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="dns">DNS records</TabsTrigger>
          <TabsTrigger value="email">Email auth</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add domain</CardTitle>
              <CardDescription>Connect an existing domain or buy one through Lovable.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input placeholder="example.com" value={newHost} onChange={(e) => setNewHost(e.target.value)} />
              <Button onClick={addDomain} className="gap-1"><Plus className="h-4 w-4" /> Connect</Button>
              <Button variant="outline" className="gap-1"><ExternalLink className="h-4 w-4" /> Buy domain</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Connected domains</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-4 py-3">Host</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">SSL</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Proxy</th><th className="px-4 py-3">Primary</th><th className="px-4 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {domains.map((d) => (
                      <tr key={d.host} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium font-mono">{d.host}</td>
                        <td className="px-4 py-3"><Badge variant={statusVariant[d.status]}>{d.status}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={d.ssl === "issued" ? "default" : "outline"}>{d.ssl}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{d.ssl_expires}</td>
                        <td className="px-4 py-3">{d.proxy ? <Badge variant="secondary">CF</Badge> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3">
                          <Switch checked={d.primary} onCheckedChange={() => setPrimary(d.host)} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setActive(d.host)}>Manage DNS</Button>
                          <Button variant="ghost" size="icon" onClick={() => removeDomain(d.host)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Per-domain options</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Toggle title="Force HTTPS (HTTP → HTTPS 301)" defaultOn />
              <Toggle title="HSTS preload (max-age 1 year, includeSubDomains)" defaultOn />
              <Toggle title="Redirect non-www → www" />
              <Toggle title="Redirect www → root" defaultOn />
              <Toggle title="Auto-renew SSL via ACME / Let's Encrypt" defaultOn />
              <Toggle title="Block country list (geo-restriction)" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">DNS zone</CardTitle>
                <CardDescription>Authoritative records for <code className="font-mono">{active}</code></CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={active} onValueChange={setActive}>
                  <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => <SelectItem key={d.host} value={d.host}>{d.host}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="gap-1"><RefreshCw className="h-4 w-4" /> Reload</Button>
                <Button size="sm" onClick={addRecord} className="gap-1"><Plus className="h-4 w-4" /> Add record</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-3 py-2 w-20">Type</th><th className="px-3 py-2 w-40">Name</th><th className="px-3 py-2">Value</th><th className="px-3 py-2 w-20">TTL</th><th className="px-3 py-2 w-20">Prio</th><th className="px-3 py-2 w-12"></th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-1.5">
                          <Select value={r.type} onValueChange={(v) => updateRecord(r.id, { type: v as DnsRecord["type"] })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{["A","AAAA","CNAME","MX","TXT","SRV","CAA"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-1.5"><Input className="h-8 font-mono text-xs" value={r.name} onChange={(e) => updateRecord(r.id, { name: e.target.value })} /></td>
                        <td className="px-3 py-1.5"><Input className="h-8 font-mono text-xs" value={r.value} onChange={(e) => updateRecord(r.id, { value: e.target.value })} /></td>
                        <td className="px-3 py-1.5"><Input className="h-8" type="number" value={r.ttl} onChange={(e) => updateRecord(r.id, { ttl: Number(e.target.value) })} /></td>
                        <td className="px-3 py-1.5"><Input className="h-8" type="number" value={r.priority ?? ""} onChange={(e) => updateRecord(r.id, { priority: e.target.value ? Number(e.target.value) : undefined })} /></td>
                        <td className="px-3 py-1.5 text-right"><Button variant="ghost" size="icon" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">DNSSEC: <Badge variant="outline">enabled</Badge> · NS: ns1.zynk.ing, ns2.zynk.ing</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email authentication</CardTitle><CardDescription>SPF, DKIM, and DMARC records detected for outbound mail.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Row label="SPF" value="v=spf1 include:_spf.google.com include:mailgun.org ~all" status="pass" />
              <Row label="DKIM (default)" value="v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc…" status="pass" />
              <Row label="DKIM (mailgun)" value="v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8…" status="pass" />
              <Row label="DMARC" value="v=DMARC1; p=quarantine; rua=mailto:dmarc@zynk.ing; pct=100" status="warn" hint="Move to p=reject after monitoring." />
              <Row label="MTA-STS" value="https://mta-sts.zynk.ing/.well-known/mta-sts.txt" status="pass" />
              <Row label="BIMI" value="default._bimi  →  https://zynk.ing/bimi.svg" status="missing" hint="Add a verified BIMI record to show your logo in Gmail." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Transport & policy</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Toggle title="DNSSEC signing" defaultOn />
              <Toggle title="CAA — only Let's Encrypt may issue" defaultOn />
              <Toggle title="TLS 1.3 only" defaultOn />
              <Toggle title="OCSP stapling" defaultOn />
              <Toggle title="Block ALL_PORTS except 80/443" defaultOn />
              <Toggle title="Subdomain takeover protection (CNAME orphan scan)" defaultOn />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Certificate transparency</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Monitoring crt.sh for unexpected certificates. Last alert: <strong>none in 30 days</strong>. Issued by: Let's Encrypt R3.
            </CardContent>
          </Card>
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

function Row({ label, value, status, hint }: { label: string; value: string; status: "pass" | "warn" | "missing"; hint?: string }) {
  const variant = status === "pass" ? "default" : status === "warn" ? "secondary" : "destructive";
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{status}</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard?.writeText(value)}><Copy className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <code className="block text-xs font-mono break-all mt-1.5 text-muted-foreground">{value}</code>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default DomainsDNS;
