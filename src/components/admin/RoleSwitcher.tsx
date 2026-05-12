import { useAdminAuth } from "@/lib/admin-auth";
import { ADMIN_ROLES, type AdminRoleId } from "@/lib/admin-roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
  const { roleId, setRoleId, email } = useAdminAuth();
  const role = ADMIN_ROLES[roleId];
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
          {email.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-xs font-medium">{email}</span>
        <span className="text-[10px] text-muted-foreground">{role.tier} · {role.name}</span>
      </div>
      <Badge variant="outline" className="hidden lg:inline-flex text-[9px]">Signed in as</Badge>
      <Select value={roleId} onValueChange={(v) => setRoleId(v as AdminRoleId)}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ADMIN_ROLES).map((r) => (
            <SelectItem key={r.id} value={r.id} className="text-xs">
              {r.name} <span className="text-muted-foreground ml-1">· {r.tier}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
