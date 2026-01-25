'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Search,
  Ban,
  CheckCircle2,
  MoreVertical,
  UserRound,
} from 'lucide-react';

type UserStatus = 'ACTIVE' | 'DISABLED';

type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: UserStatus;
  teams: string[];
  avatarUrl?: string | null;
  role: 'USER';
};

const mockUsers: UserRow[] = [
  {
    id: 'u_1',
    name: 'Olivia Rhye',
    username: 'olivia',
    email: 'olivia@unitledui.com',
    status: 'ACTIVE',
    teams: ['Design', 'Product'],
    avatarUrl: null,
    role: 'USER',
  },
  {
    id: 'u_2',
    name: 'Phoenix Baker',
    username: 'phoenix',
    email: 'phoenix@unitledui.com',
    status: 'ACTIVE',
    teams: ['Product', 'Software Engineering'],
    avatarUrl: null,
    role: 'USER',
  },
  {
    id: 'u_3',
    name: 'Lana Steiner',
    username: 'lana',
    email: 'lana@unitledui.com',
    status: 'DISABLED',
    teams: ['Operations', 'Product'],
    avatarUrl: null,
    role: 'USER',
  },
  {
    id: 'u_4',
    name: 'Demi Wilkinson',
    username: 'demi',
    email: 'demi@unitledui.com',
    status: 'ACTIVE',
    teams: ['Design', 'Product', 'Software Engineering'],
    avatarUrl: null,
    role: 'USER',
  },
  {
    id: 'u_5',
    name: 'Candice Wu',
    username: 'candice',
    email: 'candice@unitledui.com',
    status: 'DISABLED',
    teams: ['Operations', 'Finance'],
    avatarUrl: null,
    role: 'USER',
  },
];

function StatusPill({ status }: { status: UserStatus }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function TeamTag({ name }: { name: string }) {
  const cls =
    name === 'Design'
      ? 'text-purple-700 bg-purple-50'
      : name === 'Product'
        ? 'text-blue-700 bg-blue-50'
        : name === 'Software Engineering'
          ? 'text-emerald-700 bg-emerald-50'
          : name === 'Operations'
            ? 'text-rose-700 bg-rose-50'
            : name === 'Finance'
              ? 'text-amber-800 bg-amber-50'
              : 'text-slate-700 bg-slate-100';

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{name}</span>;
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [rows, setRows] = useState<UserRow[]>(mockUsers);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' ? true : u.status === statusFilter;
      return matchesQuery && matchesStatus && u.role === 'USER';
    });
  }, [query, rows, statusFilter]);

  const disableUser = (id: string) => {
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'DISABLED' } : u)));
  };

  const activateUser = (id: string) => {
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'ACTIVE' } : u)));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl font-semibold text-slate-900">User Central</div>
          <div className="text-sm text-slate-500">Danh sách tài khoản người dùng.</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, username, email..."
              className="w-64 max-w-[70vw] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="ALL">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-3 pl-5 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Email address</th>
                <th className="py-3 pr-4 font-medium">Teams</th>
                <th className="py-3 pr-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const initials = u.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('');

                return (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-4 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold">
                            {initials || <UserRound className="h-4 w-4" />}
                          </div>
                        )}
                        <div className="leading-tight">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4">
                      <StatusPill status={u.status} />
                    </td>

                    <td className="py-4 pr-4 text-slate-700 whitespace-nowrap">{u.email}</td>

                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {u.teams.map((t) => (
                          <TeamTag key={t} name={t} />
                        ))}
                      </div>
                    </td>

                    <td className="py-4 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>

                        {u.status === 'ACTIVE' ? (
                          <button
                            onClick={() => disableUser(u.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            title="Disable account"
                          >
                            <Ban className="h-4 w-4" />
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => activateUser(u.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#F84D43] px-3 py-2 text-xs font-semibold text-white hover:brightness-95"
                            title="Activate account"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Activate
                          </button>
                        )}

                        <button
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                          title="More"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
