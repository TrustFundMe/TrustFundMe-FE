'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { OtpInput } from '@/components/OtpInput';

type Step = 'email' | 'otp' | 'password';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
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
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
      } else {
        setSuccess('OTP has been sent to your email');
        setResendCooldown(60);
        setStep('otp');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOtpComplete = async (completeOtp: string) => {
    setLoading(true);
    setError('');
    setOtp(completeOtp);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: completeOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired OTP');
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError('Failed to get reset token');
        setLoading(false);
        return;
      }

      setToken(data.token);
      setStep('password');
    } catch (err: any) {
      setError('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Reset token is missing. Please start over.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: any) {
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'email' && 'Enter your email to receive a verification code'}
              {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
              {step === 'password' && 'Enter your new password'}
            </p>
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

          {/* Step 1: Email */}
          {step === 'email' && (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={sending || !email.trim()}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div>
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

              <button
                onClick={handleSendOtp}
                disabled={sending || resendCooldown > 0}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {sending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend Code'}
              </button>

              <button
                onClick={() => setStep('email')}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email
              </button>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Password must have:</p>
                <ul className="space-y-2">
                  {Object.entries({
                    minLength: 'Minimum 12 characters',
                    hasUppercase: '1 uppercase letter',
                    hasLowercase: '1 lowercase letter',
                    hasNumber: '1 number',
                    hasSymbol: '1 symbol',
                  }).map(([key, label]) => (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      {passwordValidation[key as keyof typeof passwordValidation] ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                      <span
                        className={
                          passwordValidation[key as keyof typeof passwordValidation]
                            ? 'text-green-700'
                            : 'text-gray-600'
                        }
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
