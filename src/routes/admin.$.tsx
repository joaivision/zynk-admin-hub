import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { findPage } from "@/lib/admin-menu";
import { ChevronRight, Plus, Search, Download } from "lucide-react";
import { CountryManagement } from "@/components/admin/CountryManagement";
import { CurrencyManagement } from "@/components/admin/CurrencyManagement";
import { LanguageManagement } from "@/components/admin/LanguageManagement";
import { TimezoneManagement } from "@/components/admin/TimezoneManagement";
import { StakeholderTypes } from "@/components/admin/StakeholderTypes";

export const Route = createFileRoute("/admin/$")({
  component: AdminGenericPage,
});

function AdminGenericPage() {
  const { _splat } = Route.useParams();
  const slug = _splat ?? "";

  if (slug === "settings/country") return <CountryManagement />;
  if (slug === "settings/currency") return <CurrencyManagement />;
  if (slug === "settings/language") return <LanguageManagement />;
  if (slug === "settings/timezone") return <TimezoneManagement />;
  if (slug === "settings/stakeholder-types") return <StakeholderTypes />;

  const found = findPage(slug);

  const groupTitle = found?.group.title ?? "Admin";
  const pageTitle = found?.item?.title ?? found?.group.title ?? "Page";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{groupTitle}</span>
        {found?.item && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{found.item.title}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Manage {pageTitle.toLowerCase()} for the Zynk.ing platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Records</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {pageTitle} record #{i + 1}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {groupTitle}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={i % 3 === 0 ? "secondary" : "default"}>
                        {i % 3 === 0 ? "Draft" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {i + 1}d ago
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This is placeholder data. Connect Lovable Cloud to persist real records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
