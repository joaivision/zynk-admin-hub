import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Apple, Chrome, Linkedin, Github, KeyRound, Building2 } from "lucide-react";
import { toast } from "sonner";

type Method = { id: string; name: string; icon: any; enabled: boolean; primary: boolean; clientId?: string; usage7d: number };

const initial: Method[] = [
  { id: "email", name: "Email + Password", icon: Mail, enabled: true, primary: true, usage7d: 4821 },
  { id: "phone", name: "Phone + OTP", icon: Phone, enabled: true, primary: false, usage7d: 1204 },
  { id: "google", name: "Google OAuth", icon: Chrome, enabled: true, primary: true, clientId: "1023…apps.googleusercontent.com", usage7d: 2914 },
  { id: "apple", name: "Sign in with Apple", icon: Apple, enabled: true, primary: false, clientId: "ing.zynk.signin", usage7d: 612 },
  { id: "linkedin", name: "LinkedIn OAuth", icon: Linkedin, enabled: true, primary: true, clientId: "78a1…", usage7d: 1830 },
  { id: "github", name: "GitHub OAuth", icon: Github, enabled: false, primary: false, clientId: "Iv1.…", usage7d: 0 },
  { id: "passkey", name: "Passkey (WebAuthn)", icon: KeyRound, enabled: true, primary: false, usage7d: 187 },
  { id: "saml", name: "SAML SSO (Enterprise)", icon: Building2, enabled: true, primary: false, usage7d: 42 },
];

export function SignupMethods() {
  const [methods, setMethods] = useState<Method[]>(initial);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Signup Methods</h1>
        <p className="text-sm text-muted-foreground">Enable, prioritize, and configure identity providers for new accounts.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center"><Icon className="h-5 w-5" /></div>
                  <div>
                    <CardTitle className="text-sm">{m.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      {m.primary && <Badge className="text-[10px]">Primary</Badge>}
                      <span className="text-xs text-muted-foreground">{m.usage7d.toLocaleString()} signups / 7d</span>
                    </div>
                  </div>
                </div>
                <Switch checked={m.enabled} onCheckedChange={(v) => setMethods((p) => p.map((x) => x.id === m.id ? { ...x, enabled: v } : x))} />
              </CardHeader>
              {m.enabled && (
                <CardContent className="space-y-2 text-xs">
                  {m.clientId !== undefined && (
                    <div><Label className="text-xs">Client ID</Label><Input defaultValue={m.clientId} className="h-8 text-xs font-mono mt-1" /></div>
                  )}
                  {m.id === "phone" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Provider</Label><Input defaultValue="Twilio" className="h-8 mt-1" /></div>
                      <div><Label className="text-xs">OTP length</Label><Input defaultValue="6" className="h-8 mt-1" /></div>
                    </div>
                  )}
                  {m.id === "saml" && <p className="text-muted-foreground">2 IdPs configured · ACME, Ventura Capital</p>}
                  <div className="flex items-center justify-between pt-1">
                    <Label className="text-xs">Show on signup screen</Label>
                    <Switch checked={m.primary} onCheckedChange={(v) => setMethods((p) => p.map((x) => x.id === m.id ? { ...x, primary: v } : x))} />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end"><Button onClick={() => toast.success("Signup methods updated")}>Save changes</Button></div>
    </div>
  );
}
