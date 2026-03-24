import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
        isActive?: boolean;
    }[];
};

export function NavMain({
    title,
    items,
    sidebarState,
}: {
    title: string;
    items: NavItem[];
    sidebarState: "expanded" | "collapsed";
}) {
    // const groupActive = items.some((i) => i.isActive);

    /* ================= COLLAPSED ================= */
    if (sidebarState !== "expanded") {
        return (
            <>
                {items.map((item) => (
                    <SidebarMenuItem
                        key={item.title}
                        className="flex justify-center"
                    >
                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={item.isActive}
                            className="
                            !p-0
                            flex
                            items-center
                            justify-center
                            data-[active=true]:!bg-blue-800
                            data-[active=true]:!text-white
                        "
                        >
                            <Link
                                href={item.url}
                                className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-[10px]
                                transition-colors
                            "
                            >
                                <item.icon className="h-5 w-5" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </>
        );
    }

    /* ================= EXPANDED ================= */
    return (
        <SidebarGroup>
            {title && (
                <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {title}
                </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0;

                    if (!hasChildren) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.isActive}
                                    className="data-[active=true]:bg-blue-800 data-[active=true]:text-white hover:bg-slate-50 transition-all rounded-lg py-2"
                                >
                                    <Link href={item.url} className="flex items-center gap-2">
                                        <item.icon className={`h-3.5 w-3.5 ${item.isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="font-bold text-xs tracking-tight">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={true}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        isActive={item.isActive}
                                        className="data-[active=true]:bg-blue-800 data-[active=true]:text-white hover:bg-slate-50 transition-all rounded-lg py-2"
                                    >
                                        <item.icon className={`h-4 w-4 ${item.isActive ? 'text-white' : 'text-slate-500'}`} />
                                        <span className="font-black text-[13px] tracking-tight">{item.title}</span>
                                        <ChevronRight
                                            className="
                                                ml-auto h-3.5 w-3.5
                                                transition-transform
                                                duration-200
                                                group-data-[state=open]/collapsible:rotate-90
                                            "
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenuSub className="border-l border-slate-100 ml-3.5 pl-2 mt-0.5 gap-0.5">
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={subItem.isActive}
                                                    className="data-[active=true]:bg-blue-800 data-[active=true]:text-white hover:bg-slate-50 transition-all rounded-md py-1.5 px-3"
                                                >
                                                    <Link
                                                        href={subItem.url}
                                                        className="font-bold text-[11px]"
                                                    >
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
