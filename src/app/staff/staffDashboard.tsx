'use client';

import StaffDashboardShell from '@/components/staff/StaffDashboardShell';
import StaffDashboardCard from '@/components/staff/StaffDashboardCard';
import StaffStatTile from '@/components/staff/StaffStatTile';
import StaffPopularList from '@/components/staff/StaffPopularList';
import { StaffMiniBarChart, StaffMiniLineChart } from '@/components/staff/StaffMiniChart';

const kpis = [
  { title: 'Total Sales', value: '$23,127', deltaText: '+12%', deltaDirection: 'up' as const },
  { title: 'Total Sales', value: '1,849', deltaText: '+3%', deltaDirection: 'up' as const },
  { title: 'Average Revenue', value: '$15,239', deltaText: '+8%', deltaDirection: 'up' as const },
  { title: 'Average Order', value: '2,034', deltaText: '-3%', deltaDirection: 'down' as const },
];

const revenueSeries = [
  {
    name: 'This month',
    colorClassName: 'text-gray-900/80',
    points: [32, 28, 35, 30, 38, 42, 39, 44, 40, 48, 46, 52, 49, 54, 50],
  },
  {
    name: 'Last month',
    colorClassName: 'text-gray-300',
    points: [20, 26, 24, 29, 31, 30, 33, 36, 34, 38, 40, 42, 41, 44, 43],
  },
];

const popularProducts = [
  {
    name: 'Macbook Air M2 2022 13 inch',
    subtitle: '8,172 Sales',
    value: '8,172',
    pct: 86,
    colorClassName: 'bg-orange-500',
  },
  {
    name: 'Macbook Pro 14 inch 512GB M1 Pro',
    subtitle: '6,345 Sales',
    value: '6,345',
    pct: 66,
    colorClassName: 'bg-violet-500',
  },
  {
    name: 'Apple Mac Mini Pro M2 2023',
    subtitle: '3,287 Sales',
    value: '3,287',
    pct: 42,
    colorClassName: 'bg-emerald-500',
  },
  {
    name: 'Apple 32" 6K Display XDR',
    subtitle: '2,456 Sales',
    value: '2,456',
    pct: 31,
    colorClassName: 'bg-sky-500',
  },
];

export default function StaffDashboard() {
  return (
    <StaffDashboardShell>
      <div className="lg:col-span-12">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <StaffStatTile
              key={k.title + k.value}
              title={k.title}
              value={k.value}
              deltaText={k.deltaText}
              deltaDirection={k.deltaDirection}
            />
          ))}
        </div>
      </div>

      <div className="lg:col-span-8">
        <StaffDashboardCard
          title="Total Revenue"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                This month
              </button>
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                Last month
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <StaffMiniLineChart series={revenueSeries} />
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-[11px] font-semibold text-gray-500">Total Revenue</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">$94,127</div>
                  <div className="mt-1 text-[11px] text-emerald-600">+9% vs last month</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-[11px] font-semibold text-gray-500">Avg. Daily</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">$3,138</div>
                  <div className="mt-1 text-[11px] text-gray-500">Last 30 days</div>
                </div>
              </div>
            </div>
          </div>
        </StaffDashboardCard>
      </div>

      <div className="lg:col-span-4">
        <StaffDashboardCard
          title="Popular Product"
          right={
            <button
              type="button"
              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
            >
              View More
            </button>
          }
        >
          <StaffPopularList items={popularProducts} />
        </StaffDashboardCard>
      </div>

      <div className="lg:col-span-4">
        <StaffDashboardCard title="Average Order Value">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">$992</div>
              <div className="mt-1 text-[11px] text-emerald-600">+2.4% vs last month</div>
            </div>
            <div className="text-[11px] text-gray-500">Feb</div>
          </div>
          <div className="mt-3">
            <StaffMiniBarChart bars={[12, 18, 10, 22, 26, 16, 24, 28, 18, 30, 22, 34]} barClassName="bg-orange-500/80" />
          </div>
        </StaffDashboardCard>
      </div>

      <div className="lg:col-span-4">
        <StaffDashboardCard title="Average Sales">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">840</div>
              <div className="mt-1 text-[11px] text-emerald-600">+13.4% vs last month</div>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-gray-700">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> This month
              </span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-300" /> Last month
              </span>
            </div>
          </div>
          <div className="mt-3">
            <StaffMiniLineChart
              series={[
                { name: 'This month', colorClassName: 'text-orange-500', points: [18, 22, 20, 26, 30, 28, 35, 33, 38, 36, 42, 45] },
                { name: 'Last month', colorClassName: 'text-gray-300', points: [12, 18, 16, 20, 24, 22, 28, 26, 30, 29, 33, 34] },
              ]}
            />
          </div>
        </StaffDashboardCard>
      </div>

      <div className="lg:col-span-4">
        <StaffDashboardCard title="Total Sessions">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">11,240</div>
              <div className="mt-1 text-[11px] text-emerald-600">+4% vs last month</div>
            </div>
            <div className="text-[11px] text-gray-500">Last 14 days</div>
          </div>
          <div className="mt-3">
            <StaffMiniBarChart
              bars={[10, 12, 11, 14, 16, 18, 15, 17, 19, 16, 20, 22, 21, 24]}
              barClassName="bg-gray-900/70"
            />
          </div>
        </StaffDashboardCard>
      </div>
    </StaffDashboardShell>
  );
}
