'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextProxy';
import { X, Mail } from 'lucide-react';

export function EmailVerificationBanner() {
  const { isAuthenticated, isVerified, user } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if email is verified, not authenticated, or dismissed
  if (!isAuthenticated || isVerified || dismissed || !user) {
    return null;
  }

  const handleVerify = () => {
    router.push(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
  };

  return (
    <div className="bg-orange-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-orange-900">
                <strong>Verify your email:</strong> We've sent a verification code to{' '}
                <strong>{user.email}</strong>. Please verify your email to access all features.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleVerify}
              className="px-4 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Verify Email
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-orange-600 hover:text-orange-800 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
