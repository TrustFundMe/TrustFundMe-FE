'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';
import DanboxLayout from '@/layout/DanboxLayout';
import { User, Mail, Phone, Calendar, Upload, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, beUser, updateUser, updateBEUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update local state immediately
      updateUser({
        avatarUrl,
      });

      // Sync with BE
      if (user?.id) {
        try {
          const response = await fetch('/api/users/profile/avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId: user.id, avatarUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            // Update user state
            updateUser({ avatarUrl: data.avatarUrl || avatarUrl });
          }
        } catch (err) {
          console.error('Failed to sync avatar with BE:', err);
          // Don't fail the whole operation if BE sync fails
        }
      }

      setSuccess('Avatar updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update local state immediately (BE sync happens below)
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      updateUser({
        fullName,
        phoneNumber: phone.trim() || undefined,
      });

      // Sync with BE
      if (user?.id) {
        try {
          const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              userId: user.id,
              fullName: fullName || undefined,
              phoneNumber: phone.trim() || undefined,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Update user state
            updateUser({
              fullName: data.fullName || fullName,
              phoneNumber: data.phoneNumber || phone.trim() || undefined,
            });
          }
        } catch (err) {
          console.error('Failed to sync with BE:', err);
          // Don't fail the whole operation if BE sync fails
        }
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
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
                <div className="section-title mb-5">
                  <h2>My Profile</h2>
                  <p>Manage your personal information and account settings</p>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <form onSubmit={handleSubmit}>
                    {/* Avatar Section */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="avatar-upload"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? 'Uploading...' : 'Upload Avatar'}
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={loading}
                            className="hidden"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG or GIF. Max size 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <User className="w-4 h-4 inline mr-2" />
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
                        <Mail className="w-4 h-4 inline mr-2" />
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
                        <Phone className="w-4 h-4 inline mr-2" />
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

                    {/* Birthday Field */}
                    <div className="mb-6">
                      <label
                        htmlFor="birthday"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date of Birth
                      </label>
                      <input
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
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
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
