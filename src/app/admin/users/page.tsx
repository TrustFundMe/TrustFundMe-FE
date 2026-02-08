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
  ShieldAlert,
} from 'lucide-react';
import { userService, UserInfo } from '@/services/userService';

function StatusPill({ status }: { status: string | boolean | number }) {
  const isActive = status === 'ACTIVE' || status === true || status === 1 || status === '1';
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'ADMIN'
      ? 'text-rose-600 bg-rose-50 border-rose-100'
      : role === 'STAFF'
        ? 'text-blue-600 bg-blue-50 border-blue-100'
        : role === 'FUND_OWNER'
          ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
          : 'text-slate-600 bg-slate-50 border-slate-100';

  return (
    <span className={`inline-flex rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm ${cls}`}>
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
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
      const isSearchMatch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.includes(q));

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
            ? u.isActive
            : !u.isActive;

      const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;

      return isSearchMatch && matchesStatus && matchesRole;
    });
  }, [query, users, statusFilter, roleFilter]);

  const hasActiveFilters = query !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span>User Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Users</h1>
          <p className="text-slate-500 mt-1 font-medium">Quản lý và quyền hạn của người dùng trong hệ thống.</p>
        </div>

        <div className="bg-slate-100/50 p-1.5 rounded-[20px] flex items-center gap-1 shadow-inner">
          {(['ALL', 'ACTIVE', 'DISABLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${statusFilter === s
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative group/search flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-red-500 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-xl shadow-slate-100/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="STAFF">Nhân viên</option>
            <option value="FUND_OWNER">Chủ quỹ</option>
            <option value="USER">Người dùng</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3.5 rounded-3xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="py-5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Người dùng</th>
                <th className="py-5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="py-5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò</th>
                <th className="py-5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Liên lạc</th>
                <th className="py-5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => {
                const initials = u.fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('');

                return (
                  <tr key={u.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="py-5 pl-8 pr-4">
                      <div className="flex items-center gap-4">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="h-12 w-12 rounded-2xl object-cover shadow-md ring-2 ring-white" />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white">
                            {initials || <UserRound className="h-6 w-6" />}
                          </div>
                        )}
                        <div className="leading-tight">
                          <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{u.fullName}</div>
                          <div className="text-xs text-slate-400 mt-1 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 pr-4">
                      <StatusPill status={u.isActive} />
                    </td>

                    <td className="py-5 pr-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-5 pr-4">
                      <span className="text-sm font-bold text-slate-700">{u.phoneNumber || '—'}</span>
                    </td>

                    <td className="py-5 pr-8 text-right">
                      <div className="flex justify-end gap-1.5 transition-all">
                        <Link
                          href={`/admin/users/user-details?id=${u.id}`}
                          title="Chi tiết"
                          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        {u.isActive ? (
                          <button
                            onClick={async () => {
                              if (confirm(`Bạn có chắc muốn khóa tài khoản ${u.fullName}?`)) {
                                const res = await userService.banUser(u.id);
                                if (res.success) {
                                  setUsers((prev) => prev.map((user) => (user.id === u.id ? { ...user, isActive: false } : user)));
                                } else {
                                  alert(res.error || 'Lỗi khi khóa người dùng');
                                }
                              }
                            }}
                            title="Khóa tài khoản"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg transition-all"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (confirm(`Bạn có chắc muốn mở khóa tài khoản ${u.fullName}?`)) {
                                const res = await userService.unbanUser(u.id);
                                if (res.success) {
                                  setUsers((prev) => prev.map((user) => (user.id === u.id ? { ...user, isActive: true } : user)));
                                } else {
                                  alert(res.error || 'Lỗi khi mở khóa người dùng');
                                }
                              }
                            }}
                            title="Mở khóa tài khoản"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-green-600 hover:bg-white hover:shadow-lg transition-all"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy người dùng phù hợp.</p>
                      <button onClick={clearFilters} className="mt-4 text-red-500 text-sm font-black uppercase tracking-widest hover:text-red-600 transition-colors">
                        Thử xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-6 rounded-[24px] bg-red-50 border-2 border-red-100 text-red-600 flex items-center gap-4 shadow-xl shadow-red-500/5">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Cảnh báo hệ thống</p>
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
