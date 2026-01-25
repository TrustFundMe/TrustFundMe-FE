'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Ban, CheckCircle2, Mail, UserRound } from 'lucide-react';

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

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>(mockUsers);

  const user = useMemo(() => users.find((u) => u.id === params.id), [users, params.id]);

  const disableUser = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'DISABLED' } : u)));
  };

  const activateUser = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'ACTIVE' } : u)));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
          <div className="text-lg font-semibold text-slate-900">User not found</div>
          <div className="mt-1 text-sm text-slate-500">The user id does not exist in current dataset.</div>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          {user.status === 'ACTIVE' ? (
            <button
              onClick={() => disableUser(user.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Ban className="h-4 w-4" />
              Disable account
            </button>
          ) : (
            <button
              onClick={() => activateUser(user.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F84D43] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              Activate account
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold text-lg">
                {initials || <UserRound className="h-5 w-5" />}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-xl font-semibold text-slate-900">{user.name}</div>
                <StatusPill status={user.status} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Role: USER</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">@{user.username}</div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">Email</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Mail className="h-4 w-4 text-slate-500" />
                    {user.email}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">Teams</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.teams.map((t) => (
                      <span key={t} className="inline-flex rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#F84D43]/20 bg-[#F84D43]/5 p-4">
                <div className="text-sm font-semibold text-slate-900">Use cases</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    View account details
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    Activate account
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    Disable account
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    Back to account list
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end">
                <Link
                  href="/admin/users"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Done
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
