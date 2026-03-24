"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/layout/NavMain";
import { useSidebarMenus } from "@/hooks/useSidebarMenus";

import { TooltipWrapper } from "@/components/TooltipWrapper";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContextProxy";

export function AdminSidebar() {
  const { navGroups } = useSidebarMenus();
  const { user, logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const router = useRouter();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 3) // TrustFundMe uses 2 or 3?
    .map((p: string) => p[0]?.toUpperCase())
    .join('') || 'A';

  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r border-slate-200">
      {/* Header */}
      <SidebarHeader className="py-3 px-0">
        <div className="flex h-auto w-full min-w-0 items-center justify-start gap-3 px-4 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-800 text-sm font-semibold text-white shadow-sm flex-shrink-0">
            TF
          </div>
          <span className="text-lg font-bold text-blue-800 truncate animate-in fade-in duration-300">
            TrustFundMe Admin
          </span>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navGroups.map((group: any) =>
          group ? (
            <NavMain
              key={group.id}
              title={group.name}
              items={group.items}
              sidebarState={state}
            />
          ) : null
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 text-[10px] flex flex-row items-center gap-2 text-slate-400 font-bold uppercase tracking-wider group-data-[collapsible=icon]:justify-center border-t border-slate-100/50">
        {state === "expanded" && (
          <span className="flex-1 truncate">TrustFundMe v1.0</span>
        )}
        
        <TooltipWrapper content="Đăng xuất" side="right">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
            onClick={async () => {
              await logout();
            }}
          >
            <LogOutIcon className="size-4" />
          </Button>
        </TooltipWrapper>
      </SidebarFooter>
    </Sidebar>
  );
}
