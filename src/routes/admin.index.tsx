import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  CreditCard,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const stats = [
  { label: "Total Users", value: "48,219", change: "+12.4%", up: true, icon: Users },
  { label: "Active Subscriptions", value: "6,842", change: "+5.2%", up: true, icon: CreditCard },
  { label: "Investor Deals", value: "284", change: "+18.9%", up: true, icon: Briefcase },
  { label: "Match Rate", value: "73.1%", change: "-1.3%", up: false, icon: TrendingUp },
];

const recentUsers = [
  { name: "Aarav Mehta", role: "Founder", status: "Active", plan: "Pro" },
  { name: "Priya Shah", role: "Investor", status: "KYC Pending", plan: "Investor Club" },
  { name: "Rahul Khanna", role: "Mentor", status: "Active", plan: "Expert" },
  { name: "Sara Ali", role: "Talent", status: "Active", plan: "Free" },
  { name: "Vikram Rao", role: "Founder", status: "Suspended", plan: "Pro" },
];

const activity = [
  { text: "New KYC submission from Priya Shah", time: "2m ago" },
  { text: "Investor deal 'SeedX' moved to Term Sheet", time: "12m ago" },
  { text: "Plan 'Pro' pricing updated to $29/mo", time: "1h ago" },
  { text: "Pitch deck analyzed for Founder Aarav", time: "2h ago" },
  { text: "Event 'NetworkX Mumbai' approved", time: "4h ago" },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here's what's happening on Zynk.ing today.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Activity className="h-3 w-3" /> All systems operational
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      s.up ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {s.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {s.change}
                  </span>
                </div>
                <div className="mt-4 text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentUsers.map((u) => (
                <div
                  key={u.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.role}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {u.plan}
                    </Badge>
                    <Badge
                      variant={
                        u.status === "Active"
                          ? "default"
                          : u.status === "Suspended"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1">
                  <div>{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
