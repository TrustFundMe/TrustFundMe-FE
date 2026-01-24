'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { hasPermission, normalizeRole, type PermissionKey, type UserRole } from '@/config/roles';

export function usePermissions() {
  const { user, isAuthenticated, loading } = useAuth();

  const role: UserRole = useMemo(() => normalizeRole(user?.role), [user?.role]);

  const can = (permission: PermissionKey) => hasPermission(role, permission);

  const isUser = role === 'USER';
  const isFundOwner = role === 'FUND_OWNER';
  const isStaff = role === 'STAFF';
  const isAdmin = role === 'ADMIN';

  return {
    loading,
    isAuthenticated,
    role,

    isUser,
    isFundOwner,
    isStaff,
    isAdmin,

    can,

    // Convenience flags
    canViewStaffArea: can('VIEW_STAFF_AREA'),
    canViewAdminArea: can('VIEW_ADMIN_AREA'),
    canManageUsers: can('MANAGE_USERS'),
    canCreateCampaign: can('CREATE_CAMPAIGN'),
  };
}
