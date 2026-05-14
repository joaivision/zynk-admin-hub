import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2, Save, Eye } from "lucide-react";
import { toast } from "sonner";

type Step = { id: string; key: string; label: string; required: boolean; gate: "always" | "if_paid" | "if_investor" };

const initial: Step[] = [
  { id: "1", key: "email", label: "Email + Password", required: true, gate: "always" },
  { id: "2", key: "verify_email", label: "Verify Email", required: true, gate: "always" },
  { id: "3", key: "stakeholder", label: "Pick Stakeholder Type", required: true, gate: "always" },
  { id: "4", key: "profile", label: "Basic Profile (name, country, photo)", required: true, gate: "always" },
  { id: "5", key: "phone", label: "Phone + OTP", required: false, gate: "always" },
  { id: "6", key: "intent", label: "Intent / Goals", required: true, gate: "always" },
  { id: "7", key: "kyc", label: "KYC Documents", required: true, gate: "if_investor" },
  { id: "8", key: "billing", label: "Billing Setup", required: false, gate: "if_paid" },
  { id: "9", key: "welcome", label: "Welcome Tour", required: false, gate: "always" },
];

export function SignupFlowConfig() {
  const [steps, setSteps] = useState<Step[]>(initial);
  const [persona, setPersona] = useState("founder");

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Signup Flow Config</h1>
          <p className="text-sm text-muted-foreground">Order, gate, and require steps in the onboarding wizard per persona.</p>
        </div>
        <div className="flex gap-2">
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["founder", "investor", "expert", "talent", "vendor"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1"><Eye className="h-4 w-4" /> Preview</Button>
          <Button size="sm" className="gap-1" onClick={() => toast.success("Flow saved")}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Steps for <span className="text-primary">{persona}</span></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 border rounded-md p-3 bg-card">
              <button className="text-muted-foreground cursor-grab" onMouseDown={() => {/* drag handle */}}><GripVertical className="h-4 w-4" /></button>
              <div className="flex flex-col">
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => move(i, -1)}>▲</button>
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => move(i, 1)}>▼</button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}.</span>
                  <span className="font-medium">{s.label}</span>
                  <Badge variant="outline" className="text-[10px]">{s.key}</Badge>
                </div>
              </div>
              <Select value={s.gate} onValueChange={(v) => setSteps((p) => p.map((x) => x.id === s.id ? { ...x, gate: v as Step["gate"] } : x))}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always show</SelectItem>
                  <SelectItem value="if_paid">If paid plan</SelectItem>
                  <SelectItem value="if_investor">If investor</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Required</Label>
                <Switch checked={s.required} onCheckedChange={(v) => setSteps((p) => p.map((x) => x.id === s.id ? { ...x, required: v } : x))} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSteps((p) => p.filter((x) => x.id !== s.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setSteps((p) => [...p, { id: String(Date.now()), key: "custom", label: "New Step", required: false, gate: "always" }])}>
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        <Card><CardHeader><CardTitle className="text-sm">Drop-off (last 7d)</CardTitle></CardHeader><CardContent className="text-xs space-y-1">
          {steps.slice(0, 5).map((s, i) => (<div key={s.id} className="flex justify-between"><span>{s.label}</span><span className="font-mono text-muted-foreground">{(95 - i * 12).toFixed(0)}%</span></div>))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Allowed Skip</CardTitle></CardHeader><CardContent className="text-xs space-y-2">
          <div className="flex items-center justify-between"><Label>Skip phone for 24h</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Skip KYC until first payout</Label><Switch /></div>
          <div className="flex items-center justify-between"><Label>Skip billing in trial</Label><Switch defaultChecked /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Resume Token TTL</CardTitle></CardHeader><CardContent className="space-y-2">
          <Input defaultValue="72" className="h-9" /><p className="text-xs text-muted-foreground">Hours users can pause + resume signup before re-verifying email.</p>
        </CardContent></Card>
      </div>
    </div>
  );
}
