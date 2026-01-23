'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextProxy';
import { OtpInput } from '@/components/OtpInput';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Get email from query params or user context
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }

    // Auto-send OTP on page load
    if (emailParam || user?.email) {
      handleSendOtp();
    }
  }, [searchParams, user]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      setError('Email is required');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      // Check if response is JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If not JSON, it might be a Next.js error
        setError('Unable to send verification code. Please try again later.');
        setSending(false);
        return;
      }

      if (!response.ok) {
        // Don't show technical errors to users
        const errorMessage = data.error || data.message || 'Failed to send OTP';
        // Filter out technical error messages
        if (errorMessage.includes('static resource') || 
            errorMessage.includes('No static') ||
            errorMessage.includes('404') ||
            errorMessage.includes('ENOTFOUND')) {
          setError('Unable to send verification code. Please check your connection and try again.');
        } else {
          setError(errorMessage);
        }
      } else {
        setSuccess('OTP has been sent to your email');
        setResendCooldown(60); // 60 seconds cooldown
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      // Don't show technical errors
      console.error('Send OTP error:', err);
      setError('Unable to send verification code. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOtpComplete = async (completeOtp: string) => {
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setOtp(completeOtp);

    try {
      // Step 1: Verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: targetEmail,
          otp: completeOtp,
        }),
      });

      let verifyData;
      try {
        verifyData = await verifyResponse.json();
      } catch (e) {
        setError('Unable to verify code. Please try again.');
        setLoading(false);
        return;
      }

      if (!verifyResponse.ok) {
        const errorMessage = verifyData.error || verifyData.message || 'Invalid or expired OTP';
        if (errorMessage.includes('static resource') || 
            errorMessage.includes('No static') ||
            errorMessage.includes('404')) {
          setError('Unable to verify code. Please check your connection and try again.');
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      if (!verifyData.token) {
        setError('Failed to get verification token');
        setLoading(false);
        return;
      }

      // Step 2: Verify email with token
      const emailResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verifyData.token,
        }),
      });

      let emailData;
      try {
        emailData = await emailResponse.json();
      } catch (e) {
        setError('Unable to verify email. Please try again.');
        setLoading(false);
        return;
      }

      if (!emailResponse.ok) {
        const errorMessage = emailData.error || emailData.message || 'Failed to verify email';
        if (errorMessage.includes('static resource') || 
            errorMessage.includes('No static') ||
            errorMessage.includes('404')) {
          setError('Unable to verify email. Please check your connection and try again.');
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      // Update user verified status
      if (user) {
        updateUser({ verified: true });
      }

      // Success - redirect to homepage
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      console.error('Verify email error:', err);
      setError('Unable to verify email. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const targetEmail = email || user?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-block">
              <img
                src="/assets/img/logo/black-logo.png"
                alt="TrustFundMe Logo"
                className="h-12 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification code to:
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">{targetEmail}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter the 6-digit code
            </label>
            <OtpInput
              onComplete={handleOtpComplete}
              disabled={loading}
              error={error && error.includes('OTP') ? error : undefined}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendOtp}
              disabled={sending || resendCooldown > 0}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend Code'}
            </button>

            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
