export type UserRole = 'USER' | 'FUND_OWNER' | 'STAFF' | 'ADMIN';

export const ROLES_ORDER: readonly UserRole[] = ['USER', 'FUND_OWNER', 'STAFF', 'ADMIN'] as const;

export const ROLE_DESCRIPTIONS: Record<UserRole, { name: string; description: string }> = {
  USER: {
    name: 'User',
    description: 'Người dùng thường',
  },
  FUND_OWNER: {
    name: 'Fund Owner',
    description: 'Chủ gây quỹ / người tạo chiến dịch',
  },
  STAFF: {
    name: 'Staff',
    description: 'Nhân viên quản trị',
  },
  ADMIN: {
    name: 'Admin',
    description: 'Quản trị viên',
  },
};

export const PERMISSIONS = {
  // General
  AUTHENTICATED: {
    USER: true,
    FUND_OWNER: true,
    STAFF: true,
    ADMIN: true,
  },

  // Campaigns
  CREATE_CAMPAIGN: {
    USER: false,
    FUND_OWNER: true,
    STAFF: true,
    ADMIN: true,
  },
  MANAGE_OWN_CAMPAIGN: {
    USER: false,
    FUND_OWNER: true,
    STAFF: true,
    ADMIN: true,
  },
  MANAGE_ANY_CAMPAIGN: {
    USER: false,
    FUND_OWNER: false,
    STAFF: true,
    ADMIN: true,
  },

  // Posts
  CREATE_POST: {
    USER: true,
    FUND_OWNER: true,
    STAFF: true,
    ADMIN: true,
  },
  EDIT_ANY_POST: {
    USER: false,
    FUND_OWNER: false,
    STAFF: true,
    ADMIN: true,
  },

  // Admin/Staff areas
  VIEW_STAFF_AREA: {
    USER: false,
    FUND_OWNER: false,
    STAFF: true,
    ADMIN: true,
  },
  VIEW_ADMIN_AREA: {
    USER: false,
    FUND_OWNER: false,
    STAFF: false,
    ADMIN: true,
  },
  MANAGE_USERS: {
    USER: false,
    FUND_OWNER: false,
    STAFF: true,
    ADMIN: true,
  },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function isUserRole(value: unknown): value is UserRole {
  return value === 'USER' || value === 'FUND_OWNER' || value === 'STAFF' || value === 'ADMIN';
}

export function normalizeRole(role: unknown): UserRole {
  if (isUserRole(role)) return role;

  // Allow some common variants (defensive)
  if (typeof role === 'string') {
    const upper = role.toUpperCase();
    if (isUserRole(upper)) return upper;
    if (upper.startsWith('ROLE_')) {
      const stripped = upper.replace(/^ROLE_/, '');
      if (isUserRole(stripped)) return stripped;
    }
  }

  return 'USER';
}

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return Boolean(PERMISSIONS[permission]?.[role]);
}

export function hasAnyRole(role: UserRole, allowed: readonly UserRole[]): boolean {
  return allowed.includes(role);
}
