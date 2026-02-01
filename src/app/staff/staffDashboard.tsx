'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  MoreHorizontal,
  ChevronRight,
  Filter,
  EyeOff,
  ArrowUpDown,
  Calendar,
  Layers,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Data & Mocks ---

const taskStats = [
  { icon: AlertTriangle, label: 'Priority Requests', value: '19/25', progress: 75, footer: '75% Done!', bgColor: 'bg-emerald-50/50', iconColor: 'text-emerald-500' },
  { icon: Monitor, label: 'Upcoming Appts', value: '12/20', progress: 50, footer: '50% Ready!', bgColor: 'bg-sky-50/50', iconColor: 'text-sky-500' },
  { icon: Calendar, label: 'Campaign Req', value: '02/30', progress: 90, footer: '90% Overdue!', bgColor: 'bg-violet-50/50', iconColor: 'text-violet-500' },
  { icon: Clock, label: 'Flag Reports', value: '26/30', progress: 60, footer: '60% Progress!', bgColor: 'bg-orange-50/50', iconColor: 'text-orange-500' },
];

const performanceData = [12, 45, 30, 60, 48, 85, 45, 100, 65, 80, 50, 75];

const timelineEvents = [
  { time: '09:10', title: 'Exploration UI mobile', color: 'bg-violet-500', startPos: '15%', width: '30%' },
  { time: '09:45', title: 'Mobile UI Concept', color: 'bg-gray-900', startPos: '60%', width: '25%' },
  { time: '11:00', title: 'User Interview', color: 'bg-emerald-500', startPos: '85%', width: '20%' },
];

const leaderboard = [
  { id: 1, name: 'Marc Atenson', email: 'marcnine@gmai.com', avatar: 'https://i.pravatar.cc/150?u=1', flag: '🇺🇸' },
  { id: 2, name: 'Athar Malakooti', email: 'gulbicsob@wi.org', avatar: 'https://i.pravatar.cc/150?u=2', flag: '🇳🇱' },
  { id: 3, name: 'Juan Jose Esteve', email: 'juanjosees@tip.net', avatar: 'https://i.pravatar.cc/150?u=3', flag: '🇬🇧' },
  { id: 4, name: 'Brandon Bator', email: 'brandonbator@self', avatar: 'https://i.pravatar.cc/150?u=4', flag: '🇸🇪' },
];

const pendingTasks = [
  { project: 'Branding, visual identity', assignees: ['https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6'], date: '8, Aug 2024', due: '25 August, 2024', status: 'In Progress', statusColor: 'bg-emerald-50 text-emerald-600' },
  { project: 'Landing page options', assignees: ['https://i.pravatar.cc/150?u=7'], date: '10 August, 2024', due: '27 August, 2024', status: 'Review', statusColor: 'bg-sky-50 text-sky-600' },
  { project: 'First web design concept', assignees: ['https://i.pravatar.cc/150?u=8', 'https://i.pravatar.cc/150?u=9'], date: '12 August, 2024', due: '30 August, 2024', status: 'In Progress', statusColor: 'bg-emerald-50 text-emerald-600' },
  { project: 'Exploration UI mobile', assignees: ['https://i.pravatar.cc/150?u=10'], date: '19 August, 2024', due: '01 September, 2024', status: 'Pending', statusColor: 'bg-orange-50 text-orange-600' },
  { project: 'customer journey mapping', assignees: ['https://i.pravatar.cc/150?u=11', 'https://i.pravatar.cc/150?u=12'], date: '20 August, 2024', due: '04 September, 2024', status: 'In Progress', statusColor: 'bg-emerald-50 text-emerald-600' },
];

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, progress, footer, bgColor, iconColor }: any) => (
  <div className={`p-4 rounded-[20px] ${bgColor} border border-white/50 backdrop-blur-sm flex flex-col justify-between`}>
    <div className="flex justify-between items-start">
      <div className={`h-8 w-8 rounded-xl bg-white flex items-center justify-center ${iconColor} shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{label}</div>
        <div className="text-sm font-black text-gray-900">{value}</div>
      </div>
    </div>
    <div className="mt-4">
      <div className="text-[11px] font-bold text-gray-700 mb-2">{footer}</div>
      <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${iconColor.replace('text', 'bg')} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
        />
      </div>
    </div>
  </div>
);

const PerformanceChart = () => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-base font-black text-gray-900">Performance</h3>
      <div className="relative">
        <select className="appearance-none bg-gray-50 border-none rounded-xl px-4 py-1.5 text-xs font-bold text-gray-700 pr-8 focus:ring-0">
          <option>Weekly</option>
        </select>
        <ChevronRight className="h-4 w-4 absolute right-2 top-1.5 rotate-90 text-gray-400 pointer-events-none" />
      </div>
    </div>
    <div className="mb-4">
      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total time worked</div>
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-black text-gray-900">16 hr 30 min</div>
        <div className="text-sm font-bold text-gray-900">54.34%</div>
      </div>
    </div>
    <div className="flex-1 relative mt-4 min-h-[120px]">
      {/* Grid Lines */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute left-0 right-0 border-t border-dashed border-gray-100" style={{ bottom: `${i * 50}%` }} />
      ))}
      <div className="absolute left-0 bottom-0 text-[10px] font-bold text-gray-400">0.0%</div>
      <div className="absolute left-0 bottom-[50%] text-[10px] font-bold text-gray-400">50%</div>
      <div className="absolute left-0 top-0 text-[10px] font-bold text-gray-400">100%</div>

      {/* SVG Path */}
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,100 ${performanceData.map((d, i) => `L ${(i / (performanceData.length - 1)) * 100},${100 - d}`).join(' ')} V 100 H 0`}
          fill="url(#chartGradient)"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={`M 0,${100 - performanceData[0]} ${performanceData.map((d, i) => `L ${(i / (performanceData.length - 1)) * 100},${100 - d}`).join(' ')}`}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Highlight point */}
        <circle cx="70%" cy="55%" r="4" fill="black" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

const TimelineView = () => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-base font-black text-gray-900">Timeline Project</h3>
      <div className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-gray-700">Day View</span>
        <Calendar className="h-3 w-3 text-gray-400" />
      </div>
    </div>

    <div className="flex-1 flex flex-col relative min-h-0">
      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-6 px-2">
        <span>09:00</span><span>09:30</span><span>10:00</span><span>10:30</span><span className="text-white bg-black px-1.5 py-0.5 rounded">11:00</span><span>11:30</span><span>12:00</span><span>12:30</span>
      </div>

      <div className="flex-1 relative">
        {/* Current Time Line */}
        <div className="absolute top-0 bottom-0 left-[75%] border-l-2 border-dashed border-gray-900 z-10" />

        <div className="space-y-4">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="relative h-10 w-full">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: ev.width, opacity: 1 }}
                className={`absolute h-8 rounded-xl ${ev.color} flex items-center px-3 shadow-sm`}
                style={{ left: ev.startPos }}
              >
                <span className="text-[9px] font-bold text-white mr-2">{ev.time}</span>
                <span className="text-[10px] font-bold text-white truncate">{ev.title}</span>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Leaderboard = () => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-base font-black text-gray-900">Leaderboard <span className="text-gray-400 font-bold">(12)</span></h3>
      <button className="text-[10px] font-black text-gray-500 flex items-center gap-1 hover:text-gray-900">
        See All <ChevronRight className="h-3 w-3" />
      </button>
    </div>
    <div className="flex-1 space-y-4 overflow-auto custom-scrollbar pr-1">
      {leaderboard.map((user, i) => (
        <div key={user.id} className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
            <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-violet-100 transition-all">
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-black text-gray-900">{user.name}</div>
              <div className="text-[10px] font-bold text-gray-400">{user.email}</div>
            </div>
          </div>
          <span className="text-base">{user.flag}</span>
        </div>
      ))}
    </div>
  </div>
);

const TaskTable = () => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full min-h-0 overflow-hidden">
    <div className="flex items-center justify-between mb-6 flex-shrink-0">
      <h3 className="text-base font-black text-gray-900">Recommended Task</h3>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-gray-50">
          <EyeOff className="h-3 w-3" /> Hide
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-gray-50">
          <ArrowUpDown className="h-3 w-3" /> Short
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-gray-50">
          <Filter className="h-3 w-3" /> Filter
        </button>
        <button className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-auto custom-scrollbar">
      <table className="w-full text-left">
        <tbody className="divide-y divide-gray-50">
          {pendingTasks.map((task, i) => (
            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
              <td className="py-4 px-2 text-xs font-black text-gray-900">{task.project}</td>
              <td className="py-4 px-2">
                <div className="flex -space-x-2">
                  {task.assignees.map((a, j) => (
                    <img key={j} src={a} className="h-6 w-6 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
              </td>
              <td className="py-4 px-2 text-xs font-bold text-gray-500">{task.date}</td>
              <td className="py-4 px-2 text-xs font-bold text-gray-700">{task.due}</td>
              <td className="py-4 px-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${task.statusColor}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-4 px-2 text-right">
                <button className="text-gray-300 group-hover:text-gray-900 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main Dashboard ---

export default function StaffDashboard() {
  return (
    <div className="h-full flex flex-col p-2 bg-[#f8fafc] overflow-hidden gap-4">

      {/* Top Section */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Unified Left Sidebar Card */}
        <div className="flex-[3.5] bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-8 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {taskStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
          <div className="flex-1 min-h-0">
            <PerformanceChart />
          </div>
        </div>

        {/* Middle/Bottom Right Section */}
        <div className="flex-[8.5] flex flex-col gap-4 min-h-0">
          {/* Top Row: Timeline & Leaderboard */}
          <div className="flex-[4] min-h-0 flex gap-4">
            <div className="flex-[7] min-h-0">
              <TimelineView />
            </div>
            <div className="flex-[4] min-h-0">
              <Leaderboard />
            </div>
          </div>
          {/* Bottom Row: Recommended Tasks */}
          <div className="flex-[6] min-h-0">
            <TaskTable />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
