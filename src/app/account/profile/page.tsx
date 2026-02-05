'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DanboxLayout from '@/layout/DanboxLayout';
import Link from 'next/link';
import { User, Mail, Phone, Save, X, Pencil, FolderOpen, Heart, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Initialize form with user data from BE
  useEffect(() => {
    if (user) {
      // Parse fullName from BE user
      const nameParts = user.fullName?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleEdit = () => {
    const nameParts = user?.fullName?.split(' ') || [];
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setPhone(user?.phoneNumber || '');
    setAvatarPreview(user?.avatarUrl ?? null);
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean }> => {
    if (!user) throw new Error('Not authenticated');

    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', String(user.id));

      const uploadRes = await fetch('/api/upload/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || 'Upload failed');
      }

      const avatarUrl = uploadJson.avatarUrl as string;
      updateUser({ avatarUrl });
      setAvatarPreview(avatarUrl);

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id, avatarUrl }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          updateUser({ avatarUrl: (data as { avatarUrl?: string }).avatarUrl || avatarUrl });
          setError('');
          setSuccess('Avatar updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setSuccess('');
          setError(
            response.status === 401
              ? ((data as { error?: string }).error || 'Session expired or invalid. Please sign in again and try uploading again.')
              : 'Avatar is updated here, but it could not be synced to your account. It may not appear after you log in again. Please try uploading again.'
          );
        }
      } catch (err) {
        console.error('Failed to sync avatar with BE:', err);
        setSuccess('');
        setError(
          'Avatar is updated here, but it could not be synced to your account. It may not appear after you log in again. Please try uploading again.'
        );
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(msg);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!user?.id) {
        setError('User ID is required');
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          fullName: fullName || undefined,
          phoneNumber: phone.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        updateUser({
          fullName: data.fullName ?? fullName,
          phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : phone.trim(),
        });
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute requireVerified={true}>
      <DanboxLayout header={2} footer={2}>
        <section className="about-section section-padding">
          <div className="container">
            <div className="row">
              <div className="col-12">


                {error && (
                  <div className="mb-4 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 max-w-2xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 max-w-2xl mx-auto">
                  {!isEditing ? (
                    <>
                      <div className="flex justify-end mb-6">
                        <button
                          type="button"
                          onClick={handleEdit}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      </div>
                      {/* View: Avatar (display only) */}
                      <div className="mb-8">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Profile Picture
                        </div>
                        <Avatar className="h-32 w-32 border-2 border-gray-200 shadow-sm">
                          <AvatarImage
                            src={avatarPreview ?? user?.avatarUrl ?? undefined}
                            alt="Avatar"
                          />
                          <AvatarFallback className="border-2 border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-600">
                            {user.fullName
                              ? user.fullName
                                .split(/\s+/)
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2) || '?'
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* View: label-value rows */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 gap-1">
                          <span className="text-sm font-medium text-gray-500 min-w-[140px]">
                            Full Name
                          </span>
                          <span className="text-gray-900">
                            {user.fullName || '—'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 gap-1">
                          <span className="text-sm font-medium text-gray-500 min-w-[140px]">
                            <Mail className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                            Email Address
                          </span>
                          <span className="text-gray-900">
                            {user.email || '—'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 gap-1">
                          <span className="text-sm font-medium text-gray-500 min-w-[140px]">
                            <Phone className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                            Phone Number
                          </span>
                          <span className="text-gray-900">
                            {user.phoneNumber || '—'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 gap-1">
                          <span className="text-sm font-medium text-gray-500 min-w-[140px]">
                            <ShieldCheck className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                            Email verified
                          </span>
                          <span className="text-gray-900">
                            {user.verified ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

                      {/* Quick access */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Quick access
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Link
                            href="/account/campaigns"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <FolderOpen className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              My Campaigns
                            </span>
                          </Link>
                          <Link
                            href="/account/impact"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <Heart className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Your Impact
                            </span>
                          </Link>

                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Avatar Section */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Picture
                        </label>
                        <div className="flex items-center gap-6">
                          <AvatarUploader
                            onUpload={handleAvatarUpload}
                            onError={setError}
                            maxSizeMB={5}
                            acceptedTypes={['jpeg', 'jpg', 'png', 'webp', 'gif']}
                          >
                            <Avatar className="h-32 w-32 cursor-pointer border-2 border-gray-200 shadow-sm hover:opacity-80 transition-opacity">
                              <AvatarImage src={avatarPreview ?? undefined} alt="Avatar" />
                              <AvatarFallback className="border-2 border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-600">
                                {user.fullName
                                  ? user.fullName
                                    .split(/\s+/)
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2) || '?'
                                  : '?'}
                              </AvatarFallback>
                            </Avatar>
                          </AvatarUploader>
                          <p className="text-sm text-gray-500">
                            Click avatar to upload. JPG, PNG, WebP or GIF. Max 5MB
                          </p>
                        </div>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            <User className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                            First Name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Field (Read-only) */}
                      <div className="mb-6">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <Mail className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Phone Field */}
                      <div className="mb-6">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <Phone className="w-4 h-4 inline mr-2 text-[#ff5e14]" />
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                          placeholder="+84 123 456 789"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const nameParts = user.fullName?.split(' ') || [];
                            setFirstName(nameParts[0] || '');
                            setLastName(nameParts.slice(1).join(' ') || '');
                            setPhone(user.phoneNumber || '');
                            setError('');
                            setSuccess('');
                            setIsEditing(false);
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4 inline mr-2" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4 inline mr-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                      {/* Quick access (edit mode) */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Quick access
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Link
                            href="/account/campaigns"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <FolderOpen className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              My Campaigns
                            </span>
                          </Link>
                          <Link
                            href="/account/impact"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <Heart className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Your Impact
                            </span>
                          </Link>

                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
