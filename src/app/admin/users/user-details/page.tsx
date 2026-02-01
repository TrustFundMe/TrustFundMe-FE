'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Mail,
  UserRound,
  Phone,
  CheckCircle,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { userService, UserInfo } from '@/services/userService';

function StatusPill({ status }: { status: string | boolean }) {
  const isActive = status === 'ACTIVE' || status === true;
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'ADMIN'
      ? 'text-rose-700 bg-rose-50 border-rose-100'
      : role === 'STAFF'
        ? 'text-blue-700 bg-blue-50 border-blue-100'
        : role === 'FUND_OWNER'
          ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
          : 'text-slate-700 bg-slate-100 border-slate-200';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${cls}`}>
      {role}
    </span>
  );
}

export default function AdminUserDetailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    } else {
      setError('No User ID provided');
      setLoading(false);
    }
  }, [userId]);

  const fetchUser = async (id: string) => {
    setLoading(true);
    const res = await userService.getUserById(id);
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      setError(res.error || 'Failed to load user details');
    }
    setLoading(false);
  };

  const toggleUserStatus = async () => {
    // Placeholder for actual API call
    if (!user) return;
    console.log('Toggle status for user:', user.id);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || 'User not found'}</h2>
          <p className="mt-2 text-slate-500 max-w-xs mx-auto">Rất tiếc, thông tin người dùng bạn yêu cầu không khả dụng hoặc đã xảy ra lỗi.</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to account list
          </button>
        </div>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>

        <div className="flex items-center gap-2">
          {user.verified ? (
            <button
              onClick={toggleUserStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm shadow-slate-200"
            >
              <Ban className="h-4 w-4" />
              Disable account
            </button>
          ) : (
            <button
              onClick={toggleUserStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-sm shadow-red-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              Activate account
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header/Cover Placeholder */}
        <div className="h-32 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100" />

        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex items-end gap-6 mb-8">
            <div className="relative">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-32 w-32 rounded-[32px] object-cover ring-8 ring-white shadow-lg" />
              ) : (
                <div className="h-32 w-32 rounded-[32px] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-bold text-4xl ring-8 ring-white shadow-lg">
                  {initials || <UserRound className="h-16 w-16" />}
                </div>
              )}
              <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white ${user.verified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900">{user.fullName}</h1>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-slate-500 font-medium">#{user.id}</p>
            </div>

            <div className="pb-2">
              <StatusPill status={user.verified} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</p>
                      <p className="text-sm font-bold text-slate-700">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phone Number</p>
                      <p className="text-sm font-bold text-slate-700">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verification Status</p>
                      <p className={`text-sm font-bold ${user.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {user.verified ? 'Verified Account' : 'Unverified / Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 opacity-60">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Join Date</p>
                      <p className="text-sm font-bold text-slate-700">Jan 12, 2026 (Placeholder)</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => router.push('/admin/users')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              Close
            </button>
            <button
              className="px-6 py-2.5 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-md shadow-red-100"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
