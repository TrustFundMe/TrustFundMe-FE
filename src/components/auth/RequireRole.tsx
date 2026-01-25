'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole } from '@/config/roles';
import { normalizeRole } from '@/config/roles';

type Props = {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
  redirectTo?: string;
};

export default function RequireRole({ allowedRoles, children, redirectTo = '/sign-in' }: Props) {
  const router = useRouter();
  const { loading, isAuthenticated, role } = usePermissions();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    const normalized = normalizeRole(role);
    if (!allowedRoles.includes(normalized)) {
      router.replace('/');
    }
  }, [allowedRoles, isAuthenticated, loading, redirectTo, role, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (!allowedRoles.includes(normalizeRole(role))) return null;

  return <>{children}</>;
}
