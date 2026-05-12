import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { filterMenuForRole } from "@/lib/admin-roles";
import { useAdminAuth } from "@/lib/admin-auth";
import logo from "@/assets/zynking-logo.png";

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentSlug = pathname.replace(/^\/admin\/?/, "");
  const { roleId, access } = useAdminAuth();
  const menu = filterMenuForRole(roleId);

  const isActive = (slug: string) =>
    slug === "" ? pathname === "/admin" || pathname === "/admin/" : currentSlug === slug;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3 px-2 py-3">
          <img src={logo} alt="Zynk.ing" className="h-9 w-9 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Zynk.ing</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Admin Console
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((group) => {
                const Icon = group.icon;
                if (!group.items) {
                  return (
                    <SidebarMenuItem key={group.slug}>
                      <SidebarMenuButton asChild isActive={isActive(group.slug)}>
                        <Link to="/admin/$" params={{ _splat: group.slug }}>
                          <Icon className="h-4 w-4" />
                          <span>{group.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                const groupActive = group.items.some((i) => isActive(i.slug));
                return (
                  <Collapsible
                    key={group.slug}
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Icon className="h-4 w-4" />
                          <span>{group.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => {
                            const a = access(item.slug);
                            return (
                              <SidebarMenuSubItem key={item.slug}>
                                <SidebarMenuSubButton asChild isActive={isActive(item.slug)}>
                                  <Link to="/admin/$" params={{ _splat: item.slug }}>
                                    <span className="flex-1 truncate">{item.title}</span>
                                    {a === "view" && (
                                      <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] font-normal">RO</Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
