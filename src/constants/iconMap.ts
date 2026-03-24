import type { IconKey } from "@/types/module"
import type { LucideIcon } from "lucide-react"

import {
    LayoutDashboard,
    Users,
    User,
    Shield,
    Settings,
    List,
    Folder,
    Layers,
    Calendar,
    BookOpen,
    ClipboardCheck,
    Home,
    Star,
    Building,
    MapPin,
    TrendingUp,
    GraduationCap,
} from "lucide-react"

export const iconMap: Record<IconKey, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    person: User,
    people: Users,

    security: Shield,
    settings: Settings,
    menu: List,

    folder: Folder,
    layers: Layers,
    calendar: Calendar,

    "book-open": BookOpen,
    "clipboard-check": ClipboardCheck,

    home: Home,
    star: Star,
    building: Building,
    "map-pin": MapPin,
    "trending-up": TrendingUp,
    "graduation-cap": GraduationCap,
}
