export type IconKey =
    | "dashboard"
    | "users"
    | "person"
    | "people"
    | "security"
    | "settings"
    | "menu"
    | "folder"
    | "layers"
    | "calendar"
    | "book-open"
    | "clipboard-check"
    | "home"
    | "star"
    | "building"
    | "map-pin"
    | "trending-up"
    | "graduation-cap"


export interface ModuleGroup {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    modules: Module[];
    createdAt: string;
    updatedAt: string;
}


export interface Module {
    id: string;
    moduleGroupId: string;
    parentId?: string;

    title: string;
    name?: string; // Backend might return name instead of title
    url?: string;
    icon?: IconKey;
    description?: string;

    displayOrder: number;
    isActive: boolean;
    requiredPermission?: string;

    children: Module[];

    createdAt: string;
    updatedAt: string;
}


export interface CreateModuleGroupRequest {
    name: string;
    description?: string;
    displayOrder?: number;
}


export interface CreateModuleRequest {
    moduleGroupId: string;
    parentId?: string;

    title: string;
    url?: string;
    icon?: IconKey;
    description?: string;

    displayOrder?: number;
    requiredPermission?: string;
}
