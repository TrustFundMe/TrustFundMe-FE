'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Auth callback page - redirects to homepage
 * BE authentication doesn't use callback URLs like Supabase
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Simply redirect to homepage
    // BE auth flow doesn't use callbacks
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
