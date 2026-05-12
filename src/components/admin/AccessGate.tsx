import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Eye } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { ADMIN_ROLES } from "@/lib/admin-roles";

export function AccessGate({ slug, children }: { slug: string; children: ReactNode }) {
  const { roleId, access } = useAdminAuth();
  const role = ADMIN_ROLES[roleId];
  const a = access(slug);

  if (a === "none") {
    return (
      <Card>
        <CardContent className="pt-8 pb-10 max-w-xl mx-auto text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Access denied</h2>
          <p className="text-sm text-muted-foreground">
            Your role <strong>{role.name}</strong> ({role.tier}) does not include
            permission to view <code className="px-1 rounded bg-muted">{slug || "this page"}</code>.
            Request elevated access or switch to an authorized role.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {a === "view" && (
        <Alert className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
          <Eye className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-sm">Read-only view</AlertTitle>
          <AlertDescription className="text-xs">
            {role.name} has view-only access to this module. Edit, create, and destructive actions are disabled.
          </AlertDescription>
        </Alert>
      )}
      <fieldset disabled={a === "view"} className={a === "view" ? "[&_button:not([data-allow-readonly])]:pointer-events-none [&_button:not([data-allow-readonly])]:opacity-60" : ""}>
        {children}
      </fieldset>
    </div>
  );
}
