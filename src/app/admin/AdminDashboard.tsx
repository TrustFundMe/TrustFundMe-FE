'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Target,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';

import { userService } from '@/services/userService';
import { campaignService } from '@/services/campaignService';

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
  const { data: usersRes } = useQuery({ queryKey: ['dash-users'], queryFn: () => userService.getAllUsers(0, 100) });
  const { data: campaignsRes } = useQuery({ queryKey: ['dash-campaigns'], queryFn: () => campaignService.getAll(0, 1) });
  const { data: tasks } = useQuery({ queryKey: ['dash-tasks'], queryFn: () => campaignService.getAllTasks() });

  // --- Derived Data ---
  const activeCampaigns = campaignsRes?.totalElements || 0;
  const totalUsersCount = usersRes?.data?.totalElements || 0;

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
    let completed = 0;
    let notCompleted = 0;
    all.forEach((t: any) => {
      if (t.status === 'COMPLETED') completed++;
      else notCompleted++;
    });
    return [
      { name: 'Hoàn thành', value: completed || 1 },
      { name: 'Chưa hoàn thành', value: notCompleted || 1 },
    ];
  }, [tasks]);

  // Sort users by trustScore descending
  const sortedUsers = useMemo(() => {
    const users = usersRes?.data?.content || [];
    return [...users].sort((a: any, b: any) => (b.trustScore || 0) - (a.trustScore || 0));
  }, [usersRes]);

  return (
    <div className="flex flex-col gap-3 p-1 bg-slate-50 min-h-screen">

      {/* KPI Cards Strip - No gaps */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex divide-x divide-slate-100 overflow-hidden">
        <StatCard title="Người dùng" value={totalUsersCount} icon={Users} />
        <StatCard title="Chiến dịch" value={activeCampaigns} icon={Target} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
              </Pie>
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '9px' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-3 h-[280px]">
        <TableBox title="Người dùng & Uy tín">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 uppercase text-[8px] font-black text-slate-400 sticky top-0">
              <tr><th className="p-2">Tên</th><th className="p-2 text-right">Uy tín</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.slice(0, 10).map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-2 font-bold truncate max-w-[100px]">{u.fullName}</td>
                  <td className="p-2 text-right"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[#1e3a8a] font-black">{u.trustScore || 0}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>
      </div>
    </div>
  );
}
