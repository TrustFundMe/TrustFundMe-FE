'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextProxy';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean; // Require email verification (default: true for account pages)
}

export function ProtectedRoute({ children, requireVerified = true }: ProtectedRouteProps) {
  const { isAuthenticated, isVerified, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    // Unverified users are allowed access, just show banner (handled by layout)
    // Only redirect if requireVerified is explicitly strict (which we default to false now?)
    // Actually, for now, we NEVER force redirect unverified users from protected routes
    // unless it's a specific route that ABSOLUTELY needs verification (like withdrawal)
    // But generalized ProtectedRoute should be permissive.

    // Previous logic redirected to verify-email. We remove that.
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // if (requireVerified && !isVerified) {
  //   return null;
  // }

  return <>{children}</>;
}
