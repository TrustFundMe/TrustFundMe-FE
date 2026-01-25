'use client';

import {
  BarChart3,
  Plus,
  ShieldCheck,
  Users,
  HelpCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  UserRound,
} from 'lucide-react';

const people = [
  { name: 'Helen K.', status: 'Active' },
  { name: 'Jessica T.', status: 'Active' },
  { name: 'Mansur G.', status: 'Active' },
  { name: 'Marina P.', status: 'Active' },
];

const updates = [
  {
    date: '23 Jan, 2020',
    subject: 'AADAMS',
    environment: 'HR - Production',
    action: 'Updated',
    user: 'HK',
  },
  {
    date: '22 Jan, 2020',
    subject: 'AASMITH',
    environment: 'HR - Production',
    action: 'Temporary Access',
    user: 'JT',
  },
  {
    date: '18 Jan, 2020',
    subject: 'PPATRACK',
    environment: 'HR - Production',
    action: 'Updated',
    user: 'MG',
  },
  {
    date: '15 Jan, 2020',
    subject: 'VEWARDS',
    environment: 'HR - Production',
    action: 'Updated Permission',
    user: 'MP',
  },
];

function Pill({ children, variant }: { children: React.ReactNode; variant: 'green' | 'amber' | 'blue' }) {
  const cls =
    variant === 'green'
      ? 'bg-slate-100 text-slate-800'
      : variant === 'amber'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-blue-100 text-blue-800';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-[#F84D43] font-semibold">HR</div>
          <div className="text-2xl font-semibold text-gray-900">HR - Production</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {people.map((p) => (
              <div key={p.name} className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold">
                    {p.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((x) => x[0]?.toUpperCase())
                      .join('')}
                  </div>
                  <span className="text-xs text-amber-500">★</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.status}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Request statistic</div>
                <Pill variant="green">Dec 3 - Dec 10</Pill>
              </div>

              <div className="mt-4 grid grid-cols-8 gap-2 items-end h-40">
                {[18, 35, 23, 28, 12, 14, 30, 22].map((v, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-5 rounded-t-xl ${idx === 5 ? 'bg-[#F84D43]' : 'bg-slate-200'}`}
                      style={{ height: `${v * 3}px` }}
                    />
                    <div className="text-[10px] text-gray-500">{String(idx + 3).padStart(2, '0')}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <BarChart3 className="h-4 w-4" />
                Total requests: 1,248
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Help center</div>
                <HelpCircle className="h-5 w-5 text-[#F84D43]" />
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Learn how to manage users, access requests and security policies.
              </div>
              <button className="mt-4 w-full rounded-xl bg-[#F84D43] text-white py-2 text-sm font-semibold hover:brightness-95">
                Learn
              </button>
              <div className="mt-5 rounded-xl bg-[#F84D43]/5 p-4 text-sm text-slate-700">
                Need assistance? Our support team is ready to help.
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">Security updates</div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Subject</th>
                    <th className="py-2 pr-4 font-medium">Environment</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                    <th className="py-2 pr-2 font-medium">User</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((u, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{u.date}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900 whitespace-nowrap">{u.subject}</td>
                      <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{u.environment}</td>
                      <td className="py-3 pr-4">
                        <Pill
                          variant={
                            u.action === 'Updated'
                              ? 'blue'
                              : u.action === 'Temporary Access'
                                ? 'amber'
                                : 'green'
                          }
                        >
                          {u.action}
                        </Pill>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold">
                          {u.user}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3">
          <div className="rounded-2xl bg-slate-900 text-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Admin info</div>
              <div className="h-6 w-11 rounded-full bg-slate-800 relative">
                <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="h-44 w-44 rounded-full border-8 border-slate-700/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">84%</div>
                  <div className="text-xs text-slate-200/80">SUCCESSED LOGINS</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-200" />
                <div>
                  <div className="text-xs text-slate-200/80">08/26, 23:52 pm</div>
                  <div className="text-sm font-semibold">Last login</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-200" />
                <div>
                  <div className="text-xs text-slate-200/80">12/23, 15:12</div>
                  <div className="text-sm font-semibold">Updated</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-slate-200" />
                <div>
                  <div className="text-xs text-slate-200/80">08/26, 10:52 pm</div>
                  <div className="text-sm font-semibold">Password changed</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserRound className="h-5 w-5 text-slate-200" />
                <div>
                  <div className="text-xs text-slate-200/80">SNT_DELEWIS</div>
                  <div className="text-sm font-semibold">Updated by</div>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-white text-slate-900 py-2.5 text-sm font-semibold hover:bg-slate-50">
              Additional info
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
