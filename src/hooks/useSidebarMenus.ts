import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import type { ModuleGroup } from "@/types/module"

import { usePermissions } from "@/hooks/usePermissions"
import { canAccessMenuItem } from "@/utils/permission.utils"
import { moduleGroupApi } from "@/api/moduleApi"
import { iconMap } from "@/constants/iconMap"
import { useQuery } from "@tanstack/react-query"


/* ================= QUERY (LOCAL) ================= */
export const useActiveModuleGroups = (enabled = true) => {
    return useQuery<ModuleGroup[]>({
        queryKey: ["module-groups", "active"],
        queryFn: moduleGroupApi.getActiveModuleGroups,
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};


const DEFAULT_MENU: ModuleGroup[] = [
    {
        id: "mgmt",
        name: "Quản lý hệ thống",
        isActive: true,
        displayOrder: 1,
        createdAt: "",
        updatedAt: "",
        modules: [
            {
                id: "dashboard",
                moduleGroupId: "mgmt",
                title: "Bảng điều khiển",
                url: "/admin",
                icon: "dashboard",
                displayOrder: 0,
                isActive: true,
                children: [],
                createdAt: "",
                updatedAt: ""
            },
            {
                id: "management_group",
                moduleGroupId: "mgmt",
                title: "Quản lý",
                url: "",
                icon: "menu",
                displayOrder: 1,
                isActive: true,
                requiredPermission: "VIEW_USERS",
                createdAt: "",
                updatedAt: "",
                children: [
                    {
                        id: "users",
                        moduleGroupId: "mgmt",
                        title: "Quản lý Người dùng",
                        url: "/admin/users",
                        icon: "users",
                        displayOrder: 0,
                        isActive: true,
                        requiredPermission: "VIEW_USERS",
                        children: [],
                        createdAt: "",
                        updatedAt: ""
                    },
                    {
                        id: "campaigns",
                        moduleGroupId: "mgmt",
                        title: "Quản lý Chiến dịch",
                        url: "/admin/campaigns",
                        icon: "folder",
                        displayOrder: 1,
                        isActive: true,
                        requiredPermission: "VIEW_CAMPAIGNS",
                        children: [],
                        createdAt: "",
                        updatedAt: ""
                    },
                    {
                        id: "payouts",
                        moduleGroupId: "mgmt",
                        title: "Quản lý Giải ngân",
                        url: "/admin/payouts",
                        icon: "clipboard-check",
                        displayOrder: 2,
                        isActive: true,
                        requiredPermission: "VIEW_PAYOUTS",
                        children: [],
                        createdAt: "",
                        updatedAt: ""
                    },
                    {
                        id: "modules",
                        moduleGroupId: "mgmt",
                        title: "Quản lý Menu",
                        url: "/admin/modules",
                        icon: "layers",
                        displayOrder: 3,
                        isActive: true,
                        requiredPermission: "VIEW_USERS",
                        children: [],
                        createdAt: "",
                        updatedAt: ""
                    }
                ]
            }
        ]
    }
];

export function useSidebarMenus() {
    
    const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([])
    const { can } = usePermissions()
    const pathname = usePathname()

    /* -------- ACTIVE ROUTE CHECK ------------ */
    const isActiveRoute = useCallback(
        (url?: string) => {
            if (!url || !pathname) return false;
            if (url === '/admin') return pathname === '/admin';
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
                    // Kiểm tra nếu data từ API có cấu trúc nhóm (có modules với children)
                    const hasGroupStructure = data.some(
                        group => group.modules?.some(m => m.children && m.children.length > 0)
                    );
                    if (hasGroupStructure) {
                        setModuleGroups(data);
                    } else {
                        // API trả về cấu trúc cũ (phẳng) → dùng DEFAULT_MENU mới
                        setModuleGroups(DEFAULT_MENU);
                    }
                } else {
                    setModuleGroups(DEFAULT_MENU);
                }
            })
            .catch(() => {
                console.warn("Using fallback menu: API not available");
                setModuleGroups(DEFAULT_MENU);
            });
    }, [])
    /* --------------------------------------- */

    /* -------- MAP MODULE ➜ Sidebar Nav ------ */
    const navGroups = useMemo(() => {
        // hasPermission adapter for canAccessMenuItem
        const hasPermissionAdapter = (perm: string) => {
            // Check if perm is a valid PermissionKey, otherwise return true/false based on some logic
            // For now, assume perm is a string that might be a PermissionKey
            return (can as any)(perm);
        };

        return moduleGroups
            .map((group) => {
                const items = (group.modules || [])
                    .filter(
                        (module) =>
                            !module.parentId &&
                            canAccessMenuItem(
                                module.requiredPermission,
                                hasPermissionAdapter
                            )
                    )
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((module) => {
                        const safeIcon =
                            module.icon && module.icon in iconMap
                                ? module.icon
                                : "menu"

                        const children = module.children
                            ?.filter((c) =>
                                canAccessMenuItem(
                                    c.requiredPermission,
                                    hasPermissionAdapter
                                )
                            )
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((c) => ({
                                title: c.title,
                                url: c.url || "#",
                                isActive: isActiveRoute(c.url),
                            }))

                        const isActive =
                            isActiveRoute(module.url) ||
                            children?.some((c) => c.isActive)

                        return {
                            title: module.title,
                            url: module.url || "#",
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
                    id: group.id,
                    name: group.name,
                    items,
                }
            })
            .filter(Boolean) as any[]
    }, [moduleGroups, can, isActiveRoute])

    return {
        navGroups,
    }
}
