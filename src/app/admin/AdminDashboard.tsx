'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Eye,
  Ban,
  Layers
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';

import { userService } from '@/services/userService';
import { generalFundApi } from '@/api/generalFundApi';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';

// --- Utils ---
const formatVnd = (value: number) => {
  if (!value) return "0 đ";
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + ' Tỷ đ';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Tr đ';
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}

const COLORS = ['#1e3a8a', '#3b82f6', '#94a3b8', '#cbd5e1', '#e2e8f0'];

// --- Components ---
const StatCard = ({ title, value, subtitle, icon: Icon }: any) => (
  <div className="flex-1 p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</div>
      <div className="text-xl font-black text-slate-900 leading-tight">{value}</div>
      <div className="text-[9px] font-bold text-slate-400 mt-0.5">{subtitle}</div>
    </div>
    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-[#1e3a8a]/10 group-hover:text-[#1e3a8a] transition-colors">
      <Icon className="h-5 w-5" />
    </div>
  </div>
);

const ChartBox = ({ title, children }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
    <h3 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">{title}</h3>
    <div className="flex-1 w-full relative min-h-[160px]">
      {children}
    </div>
  </div>
);

const TableBox = ({ title, children }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="flex-1 overflow-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

export default function AdminDashboard() {
  // --- Data Fetching ---
  const { data: fundStats } = useQuery({ queryKey: ['dash-fund-stats'], queryFn: () => generalFundApi.getStats() });
  const { data: fundHistory } = useQuery({ queryKey: ['dash-fund-history'], queryFn: () => generalFundApi.getHistoryPaginated(0, 50) });
  const { data: usersRes } = useQuery({ queryKey: ['dash-users'], queryFn: () => userService.getAllUsers(0, 100) });
  const { data: campaignsRes } = useQuery({ queryKey: ['dash-campaigns'], queryFn: () => campaignService.getAll(0, 1) });
  const { data: transactions } = useQuery({ queryKey: ['dash-transactions'], queryFn: () => expenditureService.getAllTransactions() });
  const { data: tasks } = useQuery({ queryKey: ['dash-tasks'], queryFn: () => campaignService.getAllTasks() });

  // --- Derived Data ---
  const totalBalance = fundStats?.balance || 0;
  const activeCampaigns = campaignsRes?.totalElements || 0;
  const totalUsersCount = usersRes?.data?.totalElements || 0;
  const pendingTransactions = useMemo(() => (transactions || []).filter((tx: any) => tx.status === 'PENDING' || tx.status === 'WITHDRAWAL_REQUESTED'), [transactions]);

  const lineChartData = useMemo(() => {
    const history = fundHistory?.content || [];
    if (history.length === 0) {
      return Array.from({ length: 15 }, (_, i) => ({
        day: (i + 1).toString(),
        totalFunds: 100000000 + Math.random() * 20000000,
        fundsDisbursed: Math.random() * 5000000,
        adminSpending: Math.random() * 1000000
      }));
    }
    return history.slice(0, 15).reverse().map((h: any, i: number) => ({
      day: i.toString(),
      totalFunds: h.amount,
      fundsDisbursed: h.amount * 0.1,
      adminSpending: h.amount * 0.02
    }));
  }, [fundHistory]);

  const roleData = useMemo(() => {
    const users = usersRes?.data?.content || [];
    const counts = { FUND_OWNER: 0, USER: 0, STAFF: 0 };
    users.forEach(u => { if (counts[u.role as keyof typeof counts] !== undefined) counts[u.role as keyof typeof counts]++; });
    return [
      { name: 'Chủ quỹ', value: counts.FUND_OWNER || 1 },
      { name: 'Người dùng', value: counts.USER || 1 },
      { name: 'Staff', value: counts.STAFF || 1 }
    ];
  }, [usersRes]);

  const taskStatusData = useMemo(() => {
    const all = tasks || [];
    const counts = { COMPLETED: 0, PENDING: 0, OTHER: 0 };
    all.forEach((t: any) => {
      if (t.status === 'COMPLETED') counts.COMPLETED++;
      else if (t.status === 'PENDING') counts.PENDING++;
      else counts.OTHER++;
    });
    return [
      { name: 'Xong', value: counts.COMPLETED || 1 },
      { name: 'Chờ', value: counts.PENDING || 1 },
      { name: 'Khác', value: counts.OTHER || 1 }
    ];
  }, [tasks]);

  return (
    <div className="flex flex-col gap-3 p-1 bg-slate-50 min-h-screen">


      {/* KPI Cards Strip - No gaps */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex divide-x divide-slate-100 overflow-hidden">
        <StatCard title="Tổng số Quỹ" value={formatVnd(totalBalance)} subtitle="Dòng tiền thực" icon={TrendingUp} />
        <StatCard title="Giải ngân chờ" value={pendingTransactions.length} subtitle="Cần xử lý ngay" icon={AlertTriangle} />
        <StatCard title="Người dùng" value={totalUsersCount} subtitle="Tăng trưởng thực" icon={Users} />
        <StatCard title="Chiến dịch" value={activeCampaigns} subtitle="Đang gây quỹ" icon={Target} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-3">
        <ChartBox title="Biến động Dòng tiền">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFunds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" hide />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="totalFunds" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorFunds)" />
              <Line type="monotone" dataKey="fundsDisbursed" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Cơ cấu Vai trò">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '9px' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Tiến độ Nhiệm vụ">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={taskStatusData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                <Cell fill="#1e3a8a" />
                <Cell fill="#94a3b8" />
                <Cell fill="#cbd5e1" />
              </Pie>
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '9px' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[280px]">
        <TableBox title="Giải ngân cần xử lý">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 uppercase text-[8px] font-black text-slate-400 sticky top-0">
              <tr><th className="p-2">Chiến dịch</th><th className="p-2">Số tiền</th><th className="p-2 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingTransactions.slice(0, 5).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-2 font-bold truncate">CD #{tx.campaignId}</td>
                  <td className="p-2 font-black text-[#1e3a8a]">{new Intl.NumberFormat('vi-VN').format(tx.amount)} đ</td>
                  <td className="p-2 text-right"><Link href="/admin/payouts" className="text-blue-600 font-black">Xử lý</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>

        <TableBox title="Giao dịch mới nhất">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 uppercase text-[8px] font-black text-slate-400 sticky top-0">
              <tr><th className="p-2">Loại</th><th className="p-2 text-right">Số tiền</th><th className="p-2 text-right">Quỹ</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(fundHistory?.content || []).slice(0, 5).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-2 font-bold">{tx.toCampaignId === 1 ? 'Thu' : 'Chi'}</td>
                  <td className={`p-2 text-right font-black ${tx.toCampaignId === 1 ? 'text-emerald-600' : 'text-slate-600'}`}>{new Intl.NumberFormat('vi-VN').format(tx.amount)} đ</td>
                  <td className="p-2 text-right text-slate-400">#{tx.fromCampaignId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>

        <TableBox title="Người dùng & Uy tín">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 uppercase text-[8px] font-black text-slate-400 sticky top-0">
              <tr><th className="p-2">Tên</th><th className="p-2 text-right">Uy tín</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(usersRes?.data?.content || []).slice(0, 5).map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-2 font-bold truncate max-w-[100px]">{u.fullName}</td>
                  <td className="p-2 text-right"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[#1e3a8a] font-black">{u.trustScore || 90}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>
      </div>
    </div>
  );
}
