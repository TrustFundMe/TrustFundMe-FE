'use client';

import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, UserCircle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const pathname = usePathname() || '';
  const paths = pathname.split('/').filter(Boolean);
  
  const breadcrumbItems = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    return {
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      href,
      active: index === paths.length - 1
    };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 flex-1 pl-2">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem className="hidden md:block">
                  {item.active ? (
                    <BreadcrumbPage className="font-black text-slate-900">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} className="font-bold text-slate-400 hover:text-slate-600">
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-blue-800 border-blue-100 hover:bg-blue-50 gap-2 !outline-none shadow-sm">
              <UserCircle className="h-4 w-4" />
              <span>Admin View</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-100">
             <DropdownMenuItem className="font-bold text-xs py-2.5">Hồ sơ cá nhân</DropdownMenuItem>
             <DropdownMenuItem className="font-bold text-xs py-2.5">Cấu hình hệ thống</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100">
          <Sun className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
