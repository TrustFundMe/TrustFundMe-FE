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

    if (requireVerified && !isVerified) {
      // Redirect to verify email page with user's email
      const email = user?.email || '';
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }
  }, [isAuthenticated, isVerified, requireVerified, loading, router, user]);

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

  if (requireVerified && !isVerified) {
    return null;
  }

  return <>{children}</>;
}
