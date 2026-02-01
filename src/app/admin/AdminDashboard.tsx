'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Components ---

const StatCard = ({ title, value, change, icon: Icon, children, colorClass }: any) => (
  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
    <div>
      <div className="text-sm font-bold text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-[10px] font-bold text-gray-400">
        <span className={colorClass}>{change}</span> from yesterday
      </div>
    </div>
    <div className="h-12 w-12 flex items-center justify-center">
      {children ? children : (
        <div className={`h-12 w-12 rounded-full border-2 border-gray-50 flex items-center justify-center ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  </div>
);

const ChartContainer = ({ title, subtitle, children }: any) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-base font-black text-gray-900">{title}</h3>
      <button className="text-gray-400 hover:text-gray-900">
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
    <div className="flex-1 relative min-h-[180px]">
      {children}
    </div>
    {subtitle && (
      <div className="mt-4 text-[10px] font-bold text-gray-400">{subtitle}</div>
    )}
  </div>
);

// --- Charts Mockups (SVG) ---

const SalesLineChart = () => (
  <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Grid Lines */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="150" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
    ))}
    {[0, 25, 50, 75, 100, 125, 150].map(i => (
      <line key={i} x1="0" y1={i} x2="400" y2={i} stroke="#f3f4f6" strokeWidth="1" />
    ))}

    <path
      d="M 0,110 Q 50,50 100,100 T 200,80 T 300,130 T 400,60 V 150 H 0 Z"
      fill="url(#salesGradient)"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      d="M 0,110 Q 50,50 100,100 T 200,80 T 300,130 T 400,60"
      fill="none"
      stroke="#dc2626"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="100" cy="100" r="4" fill="#dc2626" stroke="white" strokeWidth="2" />
  </svg>
);

const ComparisonBarChart = () => (
  <div className="w-full h-full flex flex-col">
    <div className="flex-1 flex items-end justify-around pb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-1.5 h-full items-end pb-4">
          <motion.div initial={{ height: 0 }} animate={{ height: '60%' }} className="w-3 bg-red-400 rounded-sm" />
          <motion.div initial={{ height: 0 }} animate={{ height: '40%' }} className="w-3 bg-red-200 rounded-sm" />
          <motion.div initial={{ height: 0 }} animate={{ height: '75%' }} className="w-3 bg-red-600 rounded-sm" />
        </div>
      ))}
    </div>
    <div className="flex justify-between px-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
      <span>First quarter</span>
      <span>Second quarter</span>
      <span>Third quarter</span>
      <span>Fourth quarter</span>
    </div>
    <div className="mt-4 flex gap-6 justify-center">
      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-400" /><span className="text-[9px] font-bold text-gray-500">Product 1</span></div>
      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-200" /><span className="text-[9px] font-bold text-gray-500">Product 2</span></div>
      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-600" /><span className="text-[9px] font-bold text-gray-500">Product 3</span></div>
    </div>
  </div>
);

const SalesOverviewChart = () => (
  <div className="w-full h-full flex items-end justify-between px-2 pb-6">
    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
      <div key={month} className="flex flex-col items-center gap-2 w-full">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${[40, 35, 30, 55, 45, 75, 35, 40, 65, 45, 75, 60][i]}%` }}
          className={`w-3 rounded-md ${i % 2 === 0 ? 'bg-red-600' : 'bg-red-300'}`}
        />
        <span className="text-[8px] font-bold text-gray-400 uppercase">{month}</span>
      </div>
    ))}
  </div>
);

const TopProducts = () => (
  <div className="space-y-6 pt-4">
    {[
      { id: '01', name: 'Home Decor', pop: 80 },
      { id: '02', name: 'Lighting Devices', pop: 60 },
      { id: '03', name: 'Kitchen Utensils', pop: 90 },
      { id: '04', name: 'Houseware', pop: 50 },
    ].map((p) => (
      <div key={p.id} className="flex items-center gap-6">
        <span className="text-[11px] font-black text-gray-300 w-4">{p.id}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-black text-gray-900">{p.name}</span>
            <span className="text-[10px] font-black text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-md">{p.pop}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p.pop}%` }}
              className="h-full bg-red-600 rounded-full"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page ---

export default function AdminDashboard() {
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value="$320.000" change="+10%" colorClass="text-emerald-500">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <TrendingUp className="h-6 w-6" />
          </div>
        </StatCard>
        <StatCard title="Total Expense" value="$350.000" change="+10%" colorClass="text-red-600">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </StatCard>
        <StatCard title="Total Customers" value="1.872" change="+10%" colorClass="text-sky-500">
          <div className="h-12 w-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
            <Users className="h-6 w-6" />
          </div>
        </StatCard>
        <StatCard title="Total Orders" value="1.923" change="+10%" colorClass="text-violet-500">
          <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-500">
            <FileText className="h-6 w-6" />
          </div>
        </StatCard>
      </div>

      {/* Middle Row: Large Charts */}
      <div className="flex-[5] flex gap-6 min-h-0">
        <div className="flex-1">
          <ChartContainer title="Sales" subtitle="Sales chart for all products">
            <SalesLineChart />
          </ChartContainer>
        </div>
        <div className="flex-1">
          <ChartContainer title="Comparison of Sales of Various Products">
            <ComparisonBarChart />
          </ChartContainer>
        </div>
      </div>

      {/* Bottom Row: Overview & Top Products */}
      <div className="flex-[4] flex gap-6 min-h-0">
        <div className="flex-1">
          <ChartContainer title="Sales Overview">
            <SalesOverviewChart />
          </ChartContainer>
        </div>
        <div className="flex-1">
          <ChartContainer title="Top Products">
            <TopProducts />
          </ChartContainer>
        </div>
      </div>

    </div>
  );
}
