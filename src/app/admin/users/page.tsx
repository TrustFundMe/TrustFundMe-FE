'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  Search,
  Ban,
  CheckCircle2,
  MoreVertical,
  UserRound,
  Users,
  ChevronRight,
} from 'lucide-react';
import { userService, UserInfo } from '@/services/userService';

function StatusPill({ status }: { status: string | boolean }) {
  const isActive = status === 'ACTIVE' || status === true;
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'ADMIN'
      ? 'text-rose-700 bg-rose-50'
      : role === 'STAFF'
        ? 'text-blue-700 bg-blue-50'
        : role === 'FUND_OWNER'
          ? 'text-emerald-700 bg-emerald-50'
          : 'text-slate-700 bg-slate-100';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setError(res.error || 'Failed to load users');
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q);

      const isActive = u.verified;
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
            ? isActive
            : !isActive;
      return matchesQuery && matchesStatus;
    });
  }, [query, users, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span>User Management</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và quyền hạn của người dùng trong hệ thống.</p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="relative group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-red-500 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-64 md:w-72 bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="ALL">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-3.5 pl-5 pr-4 font-medium">Name</th>
                <th className="py-3.5 pr-4 font-medium">Status</th>
                <th className="py-3.5 pr-4 font-medium">Role</th>
                <th className="py-3.5 pr-4 font-medium">Phone number</th>
                <th className="py-3.5 pr-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const initials = u.fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('');

                return (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="h-10 w-10 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold text-xs">
                            {initials || <UserRound className="h-5 w-5" />}
                          </div>
                        )}
                        <div className="leading-tight">
                          <div className="font-semibold text-slate-900">{u.fullName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4">
                      <StatusPill status={u.verified} />
                    </td>

                    <td className="py-4 pr-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-4 pr-4">
                      <span className="text-slate-600">{u.phoneNumber || '—'}</span>
                    </td>

                    <td className="py-4 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/user-details?id=${u.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>

                        <button
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 p-2 text-white hover:bg-slate-800 transition-all"
                        >
                          <Ban className="h-4 w-4" />
                        </button>

                        <button
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
