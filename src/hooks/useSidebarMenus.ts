import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import type { ModuleGroup } from "@/types/module"

import { moduleGroupApi } from "@/api/moduleApi"
import { iconMap } from "@/constants/iconMap"
import { useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"


/* ================= QUERY (LOCAL) ================= */
export const useActiveModuleGroups = (enabled = true) => {
    return useQuery<ModuleGroup[]>({
        queryKey: ["module-groups", "active"],
        queryFn: moduleGroupApi.getActiveModuleGroups,
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};

/* ================= FALLBACK MENU ================= */
const fallbackMenus: ModuleGroup[] = [
    {
        id: 1,
        name: "Main Menu",
        isActive: true,
        displayOrder: 1,
        modules: [
            {
                id: 100,
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: "dashboard",
                moduleGroupId: 1,
                displayOrder: 1,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 101,
                title: "Quản lý người dùng",
                url: "/admin/users",
                icon: "users",
                moduleGroupId: 1,
                displayOrder: 2,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 102,
                title: "Quản lý chiến dịch",
                url: "/admin/campaigns",
                icon: "target",
                moduleGroupId: 1,
                displayOrder: 3,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 103,
                title: "Quản lý bài viết",
                url: "/admin/feed-posts",
                icon: "rss",
                moduleGroupId: 1,
                displayOrder: 4,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 104,
                title: "Quản lý thanh toán",
                url: "/admin/payouts",
                icon: "credit-card",
                moduleGroupId: 1,
                displayOrder: 5,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 105,
                title: "Quản lý nhiệm vụ",
                url: "/admin/tasks",
                icon: "clipboard-check",
                moduleGroupId: 1,
                displayOrder: 6,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 106,
                title: "Quản lý báo cáo",
                url: "/admin/flags",
                icon: "bell",
                moduleGroupId: 1,
                displayOrder: 7,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 107,
                title: "Quản lý modules",
                url: "/admin/modules",
                icon: "layers",
                moduleGroupId: 1,
                displayOrder: 8,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 108,
                title: "Quỹ chung",
                url: "/admin/general-fund",
                icon: "database",
                moduleGroupId: 1,
                displayOrder: 9,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 109,
                title: "Tổng quan quỹ",
                url: "/admin/funds-overview",
                icon: "chart-bar",
                moduleGroupId: 1,
                displayOrder: 10,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 110,
                title: "Dòng tiền",
                url: "/admin/cash-flow",
                icon: "dollar-sign",
                moduleGroupId: 1,
                displayOrder: 11,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
            {
                id: 111,
                title: "Quản lý Prompt AI",
                url: "/admin/promt-AI",
                icon: "brain",
                moduleGroupId: 1,
                displayOrder: 12,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            },
        ],
        createdAt: "",
        updatedAt: "",
    },
];



/* ================= TYPES ================= */
interface SidebarItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive: boolean;
    items?: {
        title: string;
        url: string;
        isActive: boolean;
    }[];
}

interface SidebarNavGroup {
    id: string;
    name: string;
    items: SidebarItem[];
}

/* -------- ENSURE /admin PREFIX ---------- */
const ensureAdminPrefix = (url?: string) => {
    if (!url || url === '#') return url || '#';
    if (url.startsWith('/admin')) return url;
    return '/admin' + (url.startsWith('/') ? '' : '/') + url;
};
/* --------------------------------------- */

export function useSidebarMenus() {

    const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([])
    const pathname = usePathname()

    /* -------- ACTIVE ROUTE CHECK ------------ */
    const isActiveRoute = useCallback(
        (url?: string) => {
            if (!url || !pathname) return false;
            if (url === '/admin') return pathname === '/admin';
            if (url === '/admin/dashboard') return pathname === '/admin/dashboard';
            return pathname === url || pathname.startsWith(url + "/");
        },
        [pathname]
    )
    /* --------------------------------------- */

    /* -------- LOAD MODULE GROUPS (API) ------ */
    useEffect(() => {
        moduleGroupApi
            .getActiveModuleGroups()
            .then((data) => {
                if (data && data.length > 0) {
                    setModuleGroups(data);
                } else {
                    setModuleGroups(fallbackMenus);
                }
            })
            .catch(() => {
                console.warn("Using fallback menu: API not available");
                setModuleGroups(fallbackMenus);
            });
    }, [])
    /* --------------------------------------- */

    /* -------- MAP MODULE ➜ Sidebar Nav ------ */
    const navGroups = useMemo<SidebarNavGroup[]>(() => {
        return moduleGroups
            .map((group) => {
                const items: SidebarItem[] = (group.modules || [])
                    .filter((module) => !module.parentId)
                    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                    .map((module) => {
                        const safeIcon =
                            module.icon && module.icon in iconMap
                                ? module.icon
                                : "menu"

                        // Map children to sub-items
                        const children = module.children
                            ?.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                            .map((c) => {
                                const childUrl = ensureAdminPrefix(c.url);
                                return {
                                    title: c.title,
                                    url: childUrl,
                                    isActive: isActiveRoute(childUrl),
                                };
                            })

                        const moduleUrl = ensureAdminPrefix(module.url);
                        const isActive =
                            isActiveRoute(moduleUrl) ||
                            (children?.some((c) => c.isActive) ?? false);

                        return {
                            title: module.title,
                            url: moduleUrl,
                            icon: iconMap[safeIcon],
                            isActive,
                            items:
                                children && children.length > 0
                                    ? children
                                    : undefined,
                        }
                    })

                if (items.length === 0) return null

                return {
                    id: String(group.id),
                    name: group.name,
                    items,
                }
            })
            .filter((group): group is SidebarNavGroup => group !== null)
    }, [moduleGroups, isActiveRoute])
    /* --------------------------------------- */

    return {
        navGroups,
    }
}
