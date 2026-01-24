'use client';

import { ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string;
  changeText: string;
  changeDirection: 'up' | 'down';
};

function StatCard({ title, value, changeText, changeDirection }: StatCardProps) {
  const isUp = changeDirection === 'up';

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <span className="h-2 w-2 rounded-full bg-gray-400" />
        </span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${
              isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {changeText}
          </span>
          <span className="text-gray-500">vs last month</span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
        </div>
        {right}
      </div>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </div>
  );
}

function BarChartMock() {
  const bars = [38, 44, 28, 60, 70, 52, 40, 63];
  return (
    <div className="h-44">
      <div className="flex h-full items-end gap-3">
        {bars.map((h, idx) => (
          <div key={idx} className="flex-1">
            <div
              className={`w-full rounded-md ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-red-600'} opacity-90`}
              style={{ height: `${h}%` }}
            />
            <div className="mt-2 text-center text-[11px] text-gray-500">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'][idx]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const activities = [
  { id: 'INV_000076', activity: 'Mobile App Purchase', price: '$25,500', status: 'Completed', date: '17 Apr, 2026 03:45 PM' },
  { id: 'INV_000075', activity: 'Hotel Booking', price: '$3,750', status: 'Pending', date: '15 Apr, 2026 11:30 AM' },
  { id: 'INV_000074', activity: 'Flight Ticket Booking', price: '$4,200', status: 'Completed', date: '14 Apr, 2026 12:00 PM' },
  { id: 'INV_000073', activity: 'Grocery Purchase', price: '$500', status: 'In Progress', date: '14 Apr, 2026 09:15 PM' },
  { id: 'INV_000072', activity: 'Software License', price: '$1,950', status: 'Completed', date: '10 Apr, 2026 06:00 AM' },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    'In Progress': 'bg-sky-50 text-sky-700 ring-sky-100',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${map[status] || 'bg-gray-50 text-gray-700 ring-gray-100'}`}>
      {status}
    </span>
  );
}

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <StatCard title="Total Balance" value="$689,372.00" changeText="+5%" changeDirection="up" />
        </div>
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-red-600 text-white shadow-sm ring-1 ring-black/5 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-white/80">Total Earnings</p>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">$950</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 font-medium">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  -7%
                </span>
                <span className="text-white/70">this month</span>
              </div>
            </div>
            <MiniCard title="Total Spending" value="$700" />
            <MiniCard title="Total Income" value="$1,050" />
            <MiniCard title="Total Revenue" value="$850" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <Card title="Total Income" right={<span className="text-xs text-gray-500">Profit and Loss</span>}>
            <BarChartMock />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Card title="Monthly Spending Limit">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>$14,000.00 spent out of</span>
                <span>$15,500.00</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 w-[70%] rounded-full bg-red-600" />
              </div>
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card title="My Cards" right={<button className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">Add new</button>}>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-4 text-white">
                  <div className="text-xs text-white/70">Active</div>
                  <div className="mt-8 text-[11px] text-white/70">Card Number</div>
                  <div className="mt-1 text-sm font-semibold tracking-widest">•••• •••• •••• 6782</div>
                  <div className="mt-6 flex items-center justify-between text-[11px] text-white/70">
                    <span>EXP 09/29</span>
                    <span>CVV 611</span>
                  </div>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-red-600 p-4 text-white">
                  <div className="text-xs text-white/80">Active</div>
                  <div className="mt-8 text-[11px] text-white/80">Card Number</div>
                  <div className="mt-1 text-sm font-semibold tracking-widest">•••• •••• •••• 4356</div>
                  <div className="mt-6 flex items-center justify-between text-[11px] text-white/80">
                    <span>EXP 10/29</span>
                    <span>CVV 433</span>
                  </div>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
                </div>
              </div>
            </Card>

            <Card title="Wallets" right={<span className="text-xs text-gray-500">Total 6 wallets</span>}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'USD', amount: '$22,678.00', status: 'Active' },
                  { code: 'EUR', amount: '€18,345.00', status: 'Active' },
                  { code: 'GBP', amount: '£15,000.00', status: 'Inactive' },
                ].map((w) => (
                  <div key={w.code} className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
                    <div className="text-xs font-semibold text-gray-800">{w.code}</div>
                    <div className="mt-2 text-sm font-semibold text-gray-900">{w.amount}</div>
                    <div className={`mt-2 text-[11px] font-medium ${w.status === 'Active' ? 'text-emerald-600' : 'text-gray-500'}`}>{w.status}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-6">
          <Card
            title="Recent Activities"
            right={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="h-9 w-56 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 shadow-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                    placeholder="Search"
                  />
                </div>
                <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left" />
                    <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Activity</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activities.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.id}</td>
                      <td className="px-4 py-3 text-gray-700">{a.activity}</td>
                      <td className="px-4 py-3 text-gray-700">{a.price}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
