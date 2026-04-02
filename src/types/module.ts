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
    | "heart"
    | "dollar-sign"
    | "target"
    | "credit-card"
    | "user-check"
    | "tag"
    | "message-circle"
    | "message-square"
    | "rss"
    | "bell"
    | "history"
    | "database";


export interface ModuleGroup {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    totalModules?: number;
    modules: Module[];
    createdAt: string;
    updatedAt: string;
}


export interface Module {
    id: number;
    title: string;
    url?: string;
    icon?: IconKey;
    description?: string;
    moduleGroupId: number;
    moduleGroupName?: string;
    displayOrder: number;
    isActive: boolean;
    requiredPermission?: string;
    parentId?: number | null;
    children?: Module[];
    createdAt: string;
    updatedAt: string;
}


export interface CreateModuleGroupRequest {
    name: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
}


export interface CreateModuleRequest {
    moduleGroupId: number;
    title: string;
    url?: string;
    icon?: IconKey;
    description?: string;
    displayOrder?: number;
    requiredPermission?: string;
    isActive?: boolean;
}
