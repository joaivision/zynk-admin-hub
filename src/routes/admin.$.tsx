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
import { IndustryTags } from "@/components/admin/IndustryTags";
import { SkillTags } from "@/components/admin/SkillTags";
import { IntentOptions } from "@/components/admin/IntentOptions";
import { PlatformBranding } from "@/components/admin/PlatformBranding";
import { LegalDocuments } from "@/components/admin/LegalDocuments";
import { FeatureFlags } from "@/components/admin/FeatureFlags";
import { NotificationProviders } from "@/components/admin/NotificationProviders";
import { PaymentGateways } from "@/components/admin/PaymentGateways";
import { PaymentAnalytics } from "@/components/admin/PaymentAnalytics";
import { Integrations } from "@/components/admin/Integrations";
import { PartnerApps } from "@/components/admin/PartnerApps";
import { MaintenanceMode } from "@/components/admin/MaintenanceMode";
import { ConsentBanner } from "@/components/admin/ConsentBanner";
import { DomainsDNS } from "@/components/admin/DomainsDNS";
import { AbuseRules } from "@/components/admin/AbuseRules";
import { SeoMetadata } from "@/components/admin/SeoMetadata";
import { UsersList } from "@/components/admin/UsersList";
import { UserSearchFilter } from "@/components/admin/UserSearchFilter";
import { UserDetail } from "@/components/admin/UserDetail";
import { AccountStatus } from "@/components/admin/AccountStatus";
import { SuspendReinstate } from "@/components/admin/SuspendReinstate";
import { ResetPassword } from "@/components/admin/ResetPassword";
import { InternalNotes } from "@/components/admin/InternalNotes";
import { ExportUsers } from "@/components/admin/ExportUsers";
import { PlanConfig } from "@/components/admin/PlanConfig";
import { FeatureTogglePerPlan } from "@/components/admin/FeatureTogglePerPlan";
import { PricingPerPlan } from "@/components/admin/PricingPerPlan";
import { ActiveSubscriptions } from "@/components/admin/ActiveSubscriptions";
import { SubscriptionDetail } from "@/components/admin/SubscriptionDetail";
import { ExpertDirectory } from "@/components/admin/ExpertDirectory";
import { ExpertOnboarding } from "@/components/admin/ExpertOnboarding";
import { SessionBookings } from "@/components/admin/SessionBookings";
import { MentorshipPricing } from "@/components/admin/MentorshipPricing";
import { MentorshipReviews } from "@/components/admin/MentorshipReviews";
import { MentorshipPayouts } from "@/components/admin/MentorshipPayouts";

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
  if (slug === "settings/industry-tags") return <IndustryTags />;
  if (slug === "settings/skill-tags") return <SkillTags />;
  if (slug === "settings/intent-options") return <IntentOptions />;
  if (slug === "settings/platform-branding") return <PlatformBranding />;
  if (slug === "settings/legal") return <LegalDocuments />;
  if (slug === "settings/feature-flags") return <FeatureFlags />;
  if (slug === "settings/notification-providers") return <NotificationProviders />;
  if (slug === "settings/payment-gateways") return <PaymentGateways />;
  if (slug === "settings/payment-analytics") return <PaymentAnalytics />;
  if (slug === "settings/integrations") return <Integrations />;
  if (slug === "users/list") return <UsersList />;
  if (slug === "users/search") return <UserSearchFilter />;
  if (slug === "users/detail") return <UserDetail />;
  if (slug === "users/status") return <AccountStatus />;
  if (slug === "users/suspend") return <SuspendReinstate />;
  if (slug === "users/reset-password") return <ResetPassword />;
  if (slug === "users/notes") return <InternalNotes />;
  if (slug === "users/export") return <ExportUsers />;
  if (slug === "plans/config") return <PlanConfig />;
  if (slug === "plans/features") return <FeatureTogglePerPlan />;
  if (slug === "plans/pricing") return <PricingPerPlan />;
  if (slug === "plans/subscriptions") return <ActiveSubscriptions />;
  if (slug === "mentorship/experts") return <ExpertDirectory />;
  if (slug === "mentorship/onboarding") return <ExpertOnboarding />;
  if (slug === "mentorship/bookings") return <SessionBookings />;
  if (slug === "mentorship/pricing") return <MentorshipPricing />;
  if (slug === "mentorship/reviews") return <MentorshipReviews />;
  if (slug === "mentorship/payouts") return <MentorshipPayouts />;
  if (slug === "settings/partner-apps") return <PartnerApps />;
  if (slug === "settings/maintenance") return <MaintenanceMode />;
  if (slug === "settings/consent") return <ConsentBanner />;
  if (slug === "settings/domains") return <DomainsDNS />;
  if (slug === "settings/abuse-rules") return <AbuseRules />;
  if (slug === "settings/seo") return <SeoMetadata />;

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
