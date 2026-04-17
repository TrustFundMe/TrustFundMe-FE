'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Flag,
  Star,
  Award,
  Zap,
  Eye,
  Check,
  X,
  ChevronDown,
  ArrowUpRight,
  BarChart2,
  Activity,
  Clock3,
  FileCheck,
  UserCheck,
  ClipboardList,
  Inbox,
  Send,
  Image,
  Receipt,
  BarChart,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Landmark,
  Pencil,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useRouter } from 'next/navigation';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccountDto } from '@/types/bankAccount';
import { useToast } from '@/components/ui/Toast';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';

// =====================================================================
// MOCK DATA – Staff Work Dashboard
// =====================================================================

const STAFF_PROFILE = {
  name: 'Nguyễn Văn Minh',
  role: 'Nhân viên Kiểm duyệt',
  avatar: 'https://i.pravatar.cc/300?img=33',
  employeeId: 'TF-STAFF-042',
  department: 'Kiểm duyệt & Vận hành',
  joinDate: '15 tháng 3, 2023',
  directReport: 'Lê Thị Hương Giang',
  lineManager: 'Phạm Đình Khoa',
  email: 'minh.nv@trustfundme.com',
  phone: '+84 90-123-4567',
  address: 'Quận 7, TP. Hồ Chí Minh',
  gender: 'Nam',
  dob: '12 tháng 9, 1995',
};

const METRIC_CARDS = [
  { label: 'KYC Định danh', value: 47, total: 60, color: '#10b981', bg: 'bg-emerald-50', icon: ShieldCheck, trend: '+3 hôm nay', delta: '+5.2%' },
  { label: 'Lịch hẹn', value: 12, total: 20, color: '#6366f1', bg: 'bg-indigo-50', icon: Calendar, trend: '5 hoàn tất', delta: '+12%' },
  { label: 'Flag Báo cáo', value: 8, total: 25, color: '#f59e0b', bg: 'bg-amber-50', icon: Flag, trend: '3 chưa xử lý', delta: '-2' },
  { label: 'Campaign duyệt', value: 15, total: 30, color: '#ec4899', bg: 'bg-pink-50', icon: FileCheck, trend: '2 chờ xử lý', delta: '+8%' },
  { label: 'Expenditure duyệt', value: 23, total: 40, color: '#8b5cf6', bg: 'bg-violet-50', icon: Receipt, trend: '5 chờ xử lý', delta: '+15%' },
  { label: 'Evidence xác minh', value: 31, total: 50, color: '#14b8a6', bg: 'bg-teal-50', icon: Image, trend: '8 đang kiểm tra', delta: '+6%' },
  { label: 'Feed Post', value: 19, total: 30, color: '#f97316', bg: 'bg-orange-50', icon: MessageSquare, trend: '6 đã đăng', delta: '+10%' },
  { label: 'Nhắc nhở', value: 5, total: 20, color: '#ef4444', bg: 'bg-red-50', icon: AlertTriangle, trend: '2 khẩn cấp', delta: '' },
];

// KYC Doughnut data
const KYC_DATA = { approved: 47, rejected: 8, pending: 5 };

// Campaign status bar data
const CAMPAIGN_DATA = [
  { label: 'Đã duyệt', value: 15, color: '#10b981' },
  { label: 'Chờ duyệt', value: 8, color: '#6366f1' },
  { label: 'Từ chối', value: 4, color: '#ef4444' },
  { label: 'Bản nháp', value: 3, color: '#f59e0b' },
];

// Expenditure pie data
const EXPENDITURE_DATA = [
  { label: 'Đã xác minh', value: 23, color: '#10b981' },
  { label: 'Chờ kiểm tra', value: 12, color: '#f59e0b' },
  { label: 'Cần bổ sung', value: 5, color: '#ef4444' },
];

// Weekly workload line data
const WORKLOAD_DATA = [
  { day: 'T2', kyc: 8, flag: 3, campaign: 5, appointment: 2 },
  { day: 'T3', kyc: 6, flag: 5, campaign: 7, appointment: 4 },
  { day: 'T4', kyc: 9, flag: 2, campaign: 4, appointment: 3 },
  { day: 'T5', kyc: 7, flag: 6, campaign: 6, appointment: 5 },
  { day: 'T6', kyc: 10, flag: 4, campaign: 8, appointment: 3 },
  { day: 'T7', kyc: 4, flag: 1, campaign: 3, appointment: 1 },
  { day: 'CN', kyc: 3, flag: 0, campaign: 2, appointment: 0 },
];

// Feed post engagement data
const FEED_DATA = [
  { label: 'KYC thành công', value: 22, color: '#10b981' },
  { label: 'Campaign mới', value: 15, color: '#6366f1' },
  { label: 'Expenditure', value: 18, color: '#8b5cf6' },
  { label: 'Evidence', value: 12, color: '#14b8a6' },
  { label: 'Tin tức', value: 10, color: '#f97316' },
];

// Payroll / Task summary
const TASK_SUMMARY = [
  { label: 'KYC hoàn tất', value: 47 },
  { label: 'Báo cáo vi phạm', value: 8 },
  { label: 'Hợp đồng', value: 15 },
  { label: 'Lịch hẹn tuần này', value: 12 },
  { label: 'Feed post đã đăng', value: 19 },
  { label: 'Evidence xác minh', value: 31 },
  { label: 'Giờ làm việc', value: '38h/40h' },
  { label: 'Ngày nghỉ phép', value: 2 },
  { label: 'Task khẩn cấp', value: 3 },
  { label: 'Đánh giá hiệu suất', value: '92%' },
  { label: 'Điểm tin cậy (Trust Score)', value: 88 },
  { label: 'Thưởng hiệu suất', value: '2.5M' },
];

const AI_ANALYSIS = {
  score: 87.5,
  delta: '+3.2%',
  summary:
    'Tuần này bạn đã xử lý vượt mức chỉ tiêu KYC (+12%) và duyệt 8 campaign mới. Điểm chưa đạt: 3 báo cáo vi phạm Flag chưa được xử lý trong 48h — khuyến nghị ưu tiên ngay hôm nay. Expenditure mới cần kiểm tra thêm 5 hồ sơ.',
  suggestions: [
    'Ưu tiên xử lý 3 Flag vi phạm còn tồn đọng trước 12h',
    'KYC tuần sau cần tăng 15% để đạt KPI tháng',
    'Evidence thiếu hình ảnh gốc — cần yêu cầu bổ sung',
  ],
};

const TEAM_STATS = [
  { label: 'Tổng Staff', value: 12, icon: Users, color: '#6366f1' },
  { label: 'Đang online', value: 8, icon: Activity, color: '#10b981' },
  { label: 'Task đang xử lý', value: 45, icon: ClipboardList, color: '#f59e0b' },
  { label: 'Task hoàn tất', value: 312, icon: CheckCircle2, color: '#14b8a6' },
];

const RECENT_ACTIVITY = [
  { user: 'Nguyễn Văn Minh', action: 'Duyệt KYC', target: 'Trần Thị Lan', time: '5 phút trước', icon: ShieldCheck, color: '#10b981' },
  { user: 'Trần Thị Hương', action: 'Flag báo cáo', target: 'Campaign #23', time: '12 phút trước', icon: Flag, color: '#ef4444' },
  { user: 'Lê Đình Khoa', action: 'Duyệt Expenditure', target: 'Exp #156', time: '25 phút trước', icon: Receipt, color: '#f59e0b' },
  { user: 'Phạm Thị Mai', action: 'Đăng Feed Post', target: 'Post #89', time: '1 giờ trước', icon: MessageSquare, color: '#6366f1' },
  { user: 'Hoàng Văn Tùng', action: 'Xác minh Evidence', target: 'Ev #34', time: '2 giờ trước', icon: Image, color: '#14b8a6' },
];

const MONTHLY_STATS = [
  { label: 'KYC đã xử lý', value: 187, target: 200, color: '#10b981' },
  { label: 'Campaign đã duyệt', value: 62, target: 80, color: '#6366f1' },
  { label: 'Flag đã giải quyết', value: 38, target: 50, color: '#f59e0b' },
  { label: 'Evidence đã xác minh', value: 95, target: 100, color: '#14b8a6' },
  { label: 'Feed post đã đăng', value: 44, target: 60, color: '#8b5cf6' },
];

const NOTIFICATIONS = [
  { text: 'KYC của Tín & An cần bổ sung giấy tờ CCCD', time: '10 phút trước', type: 'warning' },
  { text: 'Expenditure #156 vượt ngân sách 20%', time: '30 phút trước', type: 'error' },
  { text: 'Campaign mới cần ưu tiên xử lý trước 11h', time: '1 giờ trước', type: 'info' },
  { text: 'Evidence thiếu hình ảnh gốc — cần bổ sung', time: '2 giờ trước', type: 'warning' },
];

const INCOME_DATA = [
  { label: 'Lương cơ bản', value: '15,000,000đ', color: '#1e293b' },
  { label: 'Phụ cấp hiệu suất', value: '3,500,000đ', color: '#10b981' },
  { label: 'Thưởng KPI', value: '2,500,000đ', color: '#f59e0b' },
  { label: 'Phạt (nếu có)', value: '0đ', color: '#ef4444' },
  { label: 'Thu nhập ròng', value: '21,000,000đ', color: '#6366f1' },
];

// =====================================================================
// CHART COMPONENTS
// =====================================================================

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  colorClass,
  bgClass,
  iconColor,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  iconColor: string;
}) => (
  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
    <div>
      <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{title}</div>
      <div className="text-2xl font-black text-gray-900 mb-0.5">{value}</div>
      <div className={`text-[9px] font-bold ${colorClass}`}>{change}</div>
    </div>
    <div className={`h-12 w-12 rounded-full ${bgClass} flex items-center justify-center ${iconColor}`}>
      <Icon className="h-6 w-6" />
    </div>
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-sm font-black text-gray-900">{title}</h3>
        {subtitle && <div className="text-[10px] font-bold text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${badgeColor || 'bg-emerald-50 text-emerald-600'}`}>
            {badge}
          </span>
        )}
        <button className="text-gray-300 hover:text-gray-600 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="flex-1 relative min-h-[160px]">{children}</div>
  </div>
);

// --- Line Chart (SVG) ---
const LineChart = ({
  data,
  keys,
  colors,
  height = 160,
}: {
  data: any[];
  keys: string[];
  colors: string[];
  height?: number;
}) => {
  const w = 100;
  const h = 100;
  const pts = keys.map((key) => {
    const max = Math.max(...data.map((d) => d[key])) || 1;
    return data.map((d, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - (d[key] / max) * h * 0.85,
    }));
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.15" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line key={v} x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="3 3" />
      ))}
      {pts.map((p, ki) => {
        const pathD = p.map((pt, i) => `${i === 0 ? 'M' : 'T'} ${pt.x},${pt.y}`).join(' ');
        const fillD = `M ${p[0].x},${p[0].y} ${p.map((pt) => `T ${pt.x},${pt.y}`).join(' ')} V ${h} H 0 Z`;
        return (
          <g key={ki}>
            <path d={fillD} fill={`url(#lg${ki})`} />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: ki * 0.2 }}
              d={pathD}
              fill="none"
              stroke={colors[ki]}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {p.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="2" fill={colors[ki]} stroke="white" strokeWidth="1" />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

// --- Bar Chart (SVG) ---
const BarChartSVG = ({
  data,
  keys,
  colors,
  height = 160,
}: {
  data: any[];
  keys: string[];
  colors: string[];
  height?: number;
}) => {
  const w = 100;
  const h = 100;
  const barW = w / data.length / (keys.length + 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`barG${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="1" />
            <stop offset="100%" stopColor={c} stopOpacity="0.7" />
          </linearGradient>
        ))}
      </defs>
      {[0, 25, 50, 75, 100].map((v) => (
        <line key={v} x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#f3f4f6" strokeWidth="0.5" />
      ))}
      {data.map((d, di) => {
        const groupX = (di / data.length) * w + (w / data.length - barW * keys.length) / 2;
        return (
          <g key={di}>
            {keys.map((key, ki) => {
              const max = Math.max(...data.map((dd) => dd[key])) || 1;
              const barH = (d[key] / max) * h * 0.85;
              return (
                <motion.rect
                  key={key}
                  initial={{ height: 0, y: h }}
                  animate={{ height: barH, y: h - barH }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: di * 0.05 + ki * 0.1 }}
                  x={groupX + ki * barW + 0.5}
                  width={barW - 1}
                  rx="2"
                  fill={`url(#barG${ki})`}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

// --- Donut Chart ---
const DonutChart = ({
  segments,
  size = 120,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dashLen = pct * circumference;
            const dashOff = offset;
            offset += dashLen;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={-dashOff}
                strokeLinecap="round"
              />
            );
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="#1e293b">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">
            TỔNG
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-600">{seg.label}</span>
              <span className="text-[10px] font-black text-gray-900">{seg.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Radar Chart (Simple spider chart) ---
const RadarChart = ({ data, color }: { data: { label: string; value: number }[]; color: string }) => {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const n = data.length;
  const pts = data.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + Math.cos(angle) * (d.value / 100) * r, y: cy + Math.sin(angle) * (d.value / 100) * r };
  });
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const polyFill = pts.map((p, i) => {
    const prev = pts[(i - 1 + n) % n];
    return `M ${prev.x},${prev.y} L ${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {[0.2, 0.4, 0.6, 0.8, 1].map((s, i) => (
        <polygon
          key={i}
          points={data.map((_, j) => {
            const angle = (j / n) * 2 * Math.PI - Math.PI / 2;
            return `${cx + Math.cos(angle) * s * r},${cy + Math.sin(angle) * s * r}`;
          }).join(' ')}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        );
      })}
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
      ))}
      {data.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (r + 18);
        const ly = cy + Math.sin(angle) * (r + 18);
        return (
          <text key={i} x={lx} y={ly + 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
};

// --- Horizontal Progress Bar ---
const HBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0 uppercase tracking-tight">{label}</span>
    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
    <span className="text-[10px] font-black text-gray-700 w-8 text-right">{value}</span>
  </div>
);

// --- Stacked Bar (Radar-like for multiple categories) ---
const StackedBar = ({ segments, totalWidth = 100 }: { segments: { label: string; value: number; color: string }[]; totalWidth?: number }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <div>
      <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.value / total) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="h-full flex items-center justify-center"
            style={{ backgroundColor: seg.color }}
            title={seg.label}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[9px] font-bold text-gray-400">{seg.label} ({seg.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================================
// PROFILE MODAL COMPONENT
// =====================================================================

const StaffProfileModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '');
      setPhone(user.phoneNumber || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user, open]);





  const handleAvatarUpload = async (file: File): Promise<{ success: boolean }> => {
    if (!user) throw new Error('Bạn chưa đăng nhập');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userId', String(user.id));
      const upRes = await fetch('/api/upload/avatar', { method: 'POST', credentials: 'include', body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || 'Tải ảnh lên thất bại');
      const avatarUrl = upJson.avatarUrl as string;
      updateUser({ avatarUrl });
      setAvatarPreview(avatarUrl);
      await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), { avatarUrl });
      toast('Cập nhật ảnh đại diện thành công', 'success');
      return { success: true };
    } catch (err: any) {
      toast('Cập nhật ảnh đại diện thất bại', 'error');
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast('Vui lòng nhập Họ & Tên', 'error');
      return;
    }
    setSaving(true);
    try {
      if (!user?.id) throw new Error('Session expired');
      await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), { 
        fullName: fullName.trim(), 
        phoneNumber: phone.trim() || undefined 
      });
      updateUser({ fullName: fullName.trim(), phoneNumber: phone.trim() });
      toast('Cập nhật hồ sơ thành công', 'success');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi khi lưu thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-5xl min-w-[850px] p-0 overflow-hidden bg-white rounded-[32px] border-none shadow-2xl">
        <div className="flex flex-col md:flex-row overflow-hidden">
          {/* Slimmed Sidebar */}
          <div className="md:w-[220px] bg-gray-50/60 p-8 flex flex-col items-center text-center border-r border-gray-100 shrink-0">
            <AvatarUploader onUpload={handleAvatarUpload} onError={m => toast(m, 'error')}>
              <div className="relative group cursor-pointer mb-5">
                <Avatar className="h-24 w-24 ring-8 ring-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={avatarPreview ?? undefined} />
                  <AvatarFallback className="bg-white text-3xl font-black text-gray-400">
                    {(user?.fullName?.[0] || 'S').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-xl shadow-lg border-2 border-white group-hover:bg-emerald-600 transition-colors">
                  <Pencil className="h-3 w-3 text-white" />
                </div>
              </div>
            </AvatarUploader>
            <h2 className="text-base font-black text-gray-900 mb-1 leading-tight line-clamp-2">{user?.fullName}</h2>
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-6 whitespace-nowrap">Thành viên hệ thống</p>
            <div className="w-full space-y-2 text-left">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email liên kết</div>
                <div className="text-[10px] font-bold text-gray-600 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Wider Form Area */}
          <div className="flex-1 px-12 py-10 bg-white">
            <ModalHeader className="mb-8 p-0">
              <ModalTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Cập nhật tài khoản</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">Họ & Tên nhân viên</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="Nhập đầy đủ Họ và Tên"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4.5 text-base font-bold shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">Số điện thoại liên lạc</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="09xx xxx xxx"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4.5 text-base font-bold shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all" 
                />
              </div>

              <div className="flex items-center gap-6 pt-10">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-1 h-14 bg-emerald-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 h-14 bg-gray-50 text-gray-400 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 hover:-translate-y-0.5 transition-all border border-gray-100 whitespace-nowrap"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Tác vụ');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // AI skill data (radar)
  const radarData = [
    { label: 'Định danh', value: 92 },
    { label: 'Báo cáo', value: 78 },
    { label: 'Chiến dịch', value: 85 },
    { label: 'Khoản chi', value: 80 },
    { label: 'Tin tức', value: 88 },
    { label: 'Lịch hẹn', value: 95 },
  ];

  const today = new Date();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const highlightedDays = [3, 7, 10, 15, 18, 22, 25, 28];
  const urgentDays = [10, 15];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-50/40 to-transparent pointer-events-none" />

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-8 px-8 pt-8 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">TrustFundMe Staff</div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Bảng điều khiển nhân viên</h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tác vụ..."
              className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs font-bold w-[300px] focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all"
            />
          </div>
          <button className="h-11 w-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="h-11 w-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm relative">
            <Bell className="w-4 h-4" />
            <div className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
          </button>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-black text-gray-900 uppercase leading-none">{user?.fullName || STAFF_PROFILE.name}</p>
              <p className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-widest">Tài khoản {user?.role === 'ADMIN' ? 'Quản trị' : 'Nhân viên'}</p>
            </div>
            <img src={user?.avatarUrl || STAFF_PROFILE.avatar} alt="Avatar" className="h-11 w-11 rounded-2xl object-cover ring-2 ring-emerald-100 shadow-md" />
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="flex-1 px-8 pb-10 grid grid-cols-12 gap-6 relative z-10 items-start">

        {/* ===== LEFT SIDEBAR ===== */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">

          {/* Staff Profile Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative mb-5">
              <div className="h-28 w-28 rounded-[36px] bg-emerald-50 p-1 shadow-inner border-2 border-gray-100 overflow-hidden flex items-center justify-center">
                <img src={user?.avatarUrl || STAFF_PROFILE.avatar} alt="Avatar" className="h-full w-full object-cover rounded-[30px]" />
              </div>
              <div className="absolute bottom-1 right-1 h-7 w-7 bg-emerald-500 rounded-xl border-4 border-white shadow-md flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{user?.fullName || STAFF_PROFILE.name}</h3>
            <p className="px-3 py-1 bg-emerald-50 rounded-lg text-[9px] font-black text-emerald-700 uppercase tracking-widest mt-2 mb-6 border border-emerald-100">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên kiểm duyệt'}
            </p>

            <div className="w-full space-y-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-wide">Phòng ban</span>
                <span className="font-black text-gray-800 text-right">Kiểm duyệt & Vận hành</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-wide">Mã NV</span>
                <span className="font-black text-gray-800" title="Mã định danh hệ thống TrustFundMe Staff">TFMSTAFF{user?.id || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-wide">Điện thoại</span>
                <span className="font-black text-gray-800">{user?.phoneNumber || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-wide">Ngày vào</span>
                <span className="font-black text-gray-800">
                  {user?.createdAt 
                    ? new Date(user.createdAt as any).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : STAFF_PROFILE.joinDate}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-wide">Trạng thái</span>
                <span className="px-2 py-0.5 bg-emerald-50 rounded-full text-[8px] font-black text-emerald-600 uppercase">
                  {user?.isActive !== false ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full mt-4 py-3 bg-gray-50 text-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-gray-100 shadow-sm"
            >
              Xem hồ sơ chi tiết
            </button>
          </div>

          {/* Personal Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Thông tin cá nhân
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Giới tính', value: user?.gender || STAFF_PROFILE.gender },
                { label: 'Ngày sinh', value: user?.dob || STAFF_PROFILE.dob },
                { label: 'Email', value: user?.email || STAFF_PROFILE.email },
                { label: 'Điện thoại', value: user?.phoneNumber || STAFF_PROFILE.phone },
                { label: 'Địa chỉ', value: user?.address || STAFF_PROFILE.address },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[11px] font-black text-gray-800">{item.value}</span>
                  {i < 4 && <div className="border-t border-gray-50 mt-1" />}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[24px] p-6 shadow-lg shadow-emerald-600/20 text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-emerald-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Thao tác nhanh</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: ShieldCheck, label: 'Duyệt KYC mới' },
                  { icon: FileCheck, label: 'Duyệt Campaign' },
                  { icon: Receipt, label: 'Kiểm tra Expenditure' },
                  { icon: Flag, label: 'Xem Flag báo cáo' },
                  { icon: Calendar, label: 'Lịch hẹn hôm nay' },
                  { icon: MessageSquare, label: 'Đăng Feed Post' },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left group"
                  >
                    <action.icon className="w-4 h-4 text-emerald-200 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wide group-hover:text-white text-emerald-100 transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest"><span title="Trí tuệ nhân tạo (Artificial Intelligence)">AI</span> Phân tích</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 rounded-full text-[8px] font-black text-emerald-600 uppercase tracking-widest">Trực tiếp</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-16 w-16">
                <svg viewBox="0 0 64 64" className="h-full w-full rotate-[-90deg]">
                  <path d="M32 2.5 a 29.5 29.5 0 0 1 0 59 a 29.5 29.5 0 0 1 0 -59" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <motion.path
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${87.5}, 100` }}
                    transition={{ duration: 2 }}
                    d="M32 2.5 a 29.5 29.5 0 0 1 0 59 a 29.5 29.5 0 0 1 0 -59"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-gray-900 leading-none">{AI_ANALYSIS.score}</span>
                  <span className="text-[7px] text-gray-400 font-bold">Điểm</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600">{AI_ANALYSIS.delta} so tuần trước</span>
                </div>
                <p className="text-[9px] text-gray-500 leading-relaxed font-medium">{AI_ANALYSIS.summary.slice(0, 80)}...</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {AI_ANALYSIS.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center text-white text-[8px] font-black shrink-0 mt-0.5 ${i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                    {i + 1}
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tổng quan đội ngũ</h3>
              <div className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_STATS.map((stat, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xl font-black text-gray-900">{stat.value}</span>
                  <span className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tight leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tiến độ tháng</h3>
              <div className="h-7 w-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-4">
              {MONTHLY_STATS.map((stat, i) => {
                const pct = Math.round((stat.value / stat.target) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{stat.label}</span>
                      <span className="text-[10px] font-black" style={{ color: stat.color }}>{stat.value}/{stat.target}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú & Giá thị trường - Moved to Left for Balance */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Giá thị trường & Ghi chú
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[{l:'Gạo',p:'18k'},{l:'Thịt',p:'145k'}].map((m,i)=>(
                  <div key={i} className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400">{m.l}</span>
                    <span className="text-[9px] font-black text-gray-700">{m.p}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-[9px] text-emerald-700 font-bold leading-tight">AI Note: 3 Campaign khẩn cần duyệt trước 18h. KYC Trần Văn A đang chờ ảnh.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CENTER COLUMN ===== */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {METRIC_CARDS.slice(0, 4).map((card, i) => (
              <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: card.color + '15' }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="text-xl font-black text-gray-900">{card.value}<span className="text-xs text-gray-400 font-bold">/{card.total}</span></div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{card.label}</div>
                <div className="text-[8px] font-bold" style={{ color: card.color }}>{card.trend}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {METRIC_CARDS.slice(4, 8).map((card, i) => (
              <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: card.color + '15' }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="text-xl font-black text-gray-900">{card.value}<span className="text-xs text-gray-400 font-bold">/{card.total}</span></div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{card.label}</div>
                <div className="text-[8px] font-bold" style={{ color: card.color }}>{card.trend}</div>
              </div>
            ))}
          </div>

          {/* Performance Overview + Radar */}
          <div className="grid grid-cols-2 gap-5">
            <ChartCard title="Hiệu suất theo tuần" subtitle="Tổng quan công việc tuần này" badge="+5.5%" badgeColor="bg-emerald-50 text-emerald-600">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-gray-900">86.75%</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Hiệu suất tổng</span>
                </div>
                <div className="flex gap-2">
                  {['KYC', 'Flag', 'Campaign', 'Lịch'].map((label, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full`} style={{ backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#14b8a6'][i] }} />
                      <span className="text-[8px] font-bold text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <LineChart
                data={WORKLOAD_DATA}
                keys={['kyc', 'flag', 'campaign', 'appointment']}
                colors={['#10b981', '#f59e0b', '#6366f1', '#14b8a6']}
                height={130}
              />
              <div className="flex justify-between mt-2">
                {WORKLOAD_DATA.map((d, i) => (
                  <span key={i} className="text-[8px] font-bold text-gray-400 uppercase">{d.day}</span>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Kỹ năng & KPI" subtitle="Đánh giá năng lực nhân viên" badge="AI">
              <div className="h-full flex items-center justify-center">
                <RadarChart data={radarData} color="#10b981" />
              </div>
            </ChartCard>
          </div>

          {/* Weekly Workload Chart */}
          <ChartCard title="Khối lượng công việc tuần" subtitle="Biểu đồ cột theo ngày & loại tác vụ" badge="So sánh tuần">
            <div className="flex justify-between items-end mb-4">
              <div className="flex gap-4">
                {['KYC', 'Flag', 'Chiến dịch', 'Lịch'].map((label, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#14b8a6'][i] }} />
                    <span className="text-[9px] font-bold text-gray-500" title={label === 'KYC' ? 'Xác minh danh tính khách hàng' : label === 'Flag' ? 'Báo cáo vi phạm' : ''}>{label}</span>
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">T2 → CN</span>
            </div>
            <BarChartSVG
              data={WORKLOAD_DATA}
              keys={['kyc', 'flag', 'campaign', 'appointment']}
              colors={['#10b981', '#f59e0b', '#6366f1', '#14b8a6']}
              height={150}
            />
            <div className="flex justify-between mt-2">
              {WORKLOAD_DATA.map((d, i) => (
                <span key={i} className="text-[8px] font-bold text-gray-400 uppercase">{d.day}</span>
              ))}
            </div>
          </ChartCard>

          {/* Row: KYC + Campaign Status */}
          <div className="grid grid-cols-2 gap-5">
            <ChartCard title="Tình trạng KYC" subtitle="Định danh hồ sơ">
              <DonutChart
                segments={[
                  { label: 'Đã duyệt', value: KYC_DATA.approved, color: '#10b981' },
                  { label: 'Từ chối', value: KYC_DATA.rejected, color: '#ef4444' },
                  { label: 'Chờ duyệt', value: KYC_DATA.pending, color: '#f59e0b' },
                ]}
              />
            </ChartCard>

            <ChartCard title="Trạng thái Campaign" subtitle="Phân bổ theo trạng thái">
              <div className="flex flex-col gap-3 mt-2">
                <StackedBar segments={CAMPAIGN_DATA} />
                <div className="space-y-3 mt-4">
                  {CAMPAIGN_DATA.map((d, i) => (
                    <HBar key={i} label={d.label} value={d.value} max={30} color={d.color} />
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Row: Expenditure + Feed */}
          <div className="grid grid-cols-2 gap-5">
            <ChartCard title="Expenditure & Evidence" subtitle="Chi tiêu & minh chứng" badge="5 cần xử lý">
              <DonutChart
                segments={EXPENDITURE_DATA.map((d) => ({
                  label: d.label,
                  value: d.value,
                  color: d.color,
                }))}
              />
            </ChartCard>

            <ChartCard title="Feed Post Engagement" subtitle="Hoạt động đăng bài">
              <div className="flex flex-col gap-3 mt-2">
                {FEED_DATA.map((d, i) => (
                  <HBar key={i} label={d.label} value={d.value} max={22} color={d.color} />
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Flag Report Table */}
          <ChartCard title="Báo cáo Flag gần đây" subtitle="Danh sách vi phạm cần xử lý" badge="3 khẩn cấp" badgeColor="bg-rose-50 text-rose-600">
            <div className="space-y-3">
              {[
                { id: 'FL-001', type: 'KYC mờ', status: 'Chưa xử lý', priority: 'Khẩn cấp', color: '#ef4444', time: '2h trước' },
                { id: 'FL-002', type: 'Evidence thiếu', status: 'Đang xử lý', priority: 'Cao', color: '#f59e0b', time: '5h trước' },
                { id: 'FL-003', type: 'Campaign sai thông tin', status: 'Đang xử lý', priority: 'Trung bình', color: '#6366f1', time: '1 ngày' },
                { id: 'FL-004', type: 'Expenditure cao bất thường', status: 'Chưa xử lý', priority: 'Cao', color: '#f59e0b', time: '1 ngày' },
                { id: 'FL-005', type: 'Feed post vi phạm', status: 'Đã xử lý', priority: 'Thấp', color: '#10b981', time: '2 ngày' },
              ].map((flag, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: flag.color + '15' }}>
                    <Flag className="w-4 h-4" style={{ color: flag.color }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-gray-900">{flag.id}</span>
                      <span className="text-[9px] font-bold text-gray-400">•</span>
                      <span className="text-[10px] font-bold text-gray-600">{flag.type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${flag.status === 'Đã xử lý' ? 'bg-emerald-50 text-emerald-600' : flag.status === 'Đang xử lý' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                        {flag.status}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400">{flag.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Campaign Pending List */}
          <ChartCard title="Chiến dịch chờ duyệt" subtitle="Danh sách chiến dịch cần kiểm tra" badge="2 mới hôm nay" badgeColor="bg-indigo-50 text-indigo-600">
            <div className="space-y-3">
              {[
                { title: 'Chiến dịch cứu trợ miền Trung', owner: 'Trần Văn A', amount: '50,000,000đ', date: '16/04/2026', status: 'Chờ <span title="Xác minh danh tính">KYC</span>' },
                { title: 'Quỹ học bổng cho trẻ em nghèo', owner: 'Nguyễn Thị B', amount: '30,000,000đ', date: '15/04/2026', status: 'Chờ Khoản chi' },
                { title: 'Hỗ trợ y tế người già', owner: 'Lê Văn C', amount: '80,000,000đ', date: '14/04/2026', status: 'Chờ Minh chứng' },
                { title: 'Dự án nhà ở cho người cơ nhỡ', owner: 'Phạm Thị D', amount: '120,000,000đ', date: '13/04/2026', status: 'Chờ Xét duyệt' },
              ].map((camp, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[11px] font-black text-gray-900 truncate">{camp.title}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-bold text-gray-400">👤 {camp.owner}</span>
                      <span className="text-[9px] font-black text-emerald-600">{camp.amount}</span>
                      <span className="text-[8px] font-bold text-gray-400">{camp.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase" dangerouslySetInnerHTML={{ __html: camp.status }} />
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>


        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          {/* Notifications - Moved from Center */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[24px] p-5 shadow-sm border border-amber-100">
            <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" />
              Thông báo khẩn
            </h3>
            <div className="space-y-2.5">
              {NOTIFICATIONS.slice(0, 3).map((notif, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-100/50">
                  <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${notif.type === 'error' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-gray-800 truncate">{notif.text}</div>
                    <div className="text-[8px] font-bold text-gray-400">{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity - Moved from Center */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Hoạt động</h3>
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="space-y-2">
              {RECENT_ACTIVITY.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100/50 group">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: act.color + '15' }}>
                    <act.icon className="w-3.5 h-3.5" style={{ color: act.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{act.user}</div>
                    <div className="text-[8px] font-bold text-gray-400 truncate">{act.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Calendar */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-900">{monthNames[calendarMonth]} {calendarYear}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}
                  className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                  className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-[9px] font-black text-emerald-400 uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isHighlighted = highlightedDays.includes(day);
                const isUrgent = urgentDays.includes(day);
                const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                return (
                  <div
                    key={day}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-[11px] font-black cursor-pointer transition-all ${
                      isToday
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                        : isUrgent
                        ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                        : isHighlighted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="text-[9px] font-bold text-gray-400">Đã đặt lịch</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="text-[9px] font-bold text-gray-400">Khẩn cấp</span></div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Lịch hẹn sắp tới</h3>
              <div className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { time: '09:00', title: 'Gặp chủ quỹ Trần Văn A', type: 'Xác minh KYC', status: 'confirmed', color: '#10b981' },
                { time: '11:30', title: 'Kiểm tra Expenditure #12', type: 'Duyệt chi tiêu', status: 'pending', color: '#f59e0b' },
                { time: '14:00', title: 'Review Campaign mới', type: 'Duyệt campaign', status: 'confirmed', color: '#10b981' },
                { time: '16:30', title: 'Kiểm tra Evidence #8', type: 'Xác minh minh chứng', status: 'warning', color: '#ef4444' },
              ].map((apt, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: apt.color + '15' }}>
                    <Clock className="w-5 h-5" style={{ color: apt.color }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[11px] font-black text-gray-900 truncate">{apt.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black" style={{ color: apt.color }}>{apt.time}</span>
                      <span className="text-[9px] font-bold text-gray-400">•</span>
                      <span className="text-[9px] font-bold text-gray-500">{apt.type}</span>
                    </div>
                  </div>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${apt.status === 'confirmed' ? 'bg-emerald-400' : apt.status === 'warning' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Task / Payroll Summary */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest">Báo cáo tháng</h3>
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </div>
            <div className="space-y-6">
              {TASK_SUMMARY.map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none group-hover:text-emerald-600 transition-colors">{item.label}</span>
                    <span className="text-lg font-black text-gray-900 leading-none tracking-tighter">{item.value}</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement / Level Card */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[24px] p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-violet-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-200">Thành tựu tháng</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
                  <Star className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-base font-black leading-tight">Top 5 Staff</h4>
                  <p className="text-[10px] text-violet-200 mt-1">Top performer tháng 4/2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="text-[10px] font-black text-emerald-200">+12% so tháng trước</span>
              </div>
            </div>
          </div>

          {/* Trust Score Gauge */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5">Trust Score cá nhân</h3>
            <div className="flex flex-col items-center">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 112 112" className="h-full w-full rotate-[-90deg]">
                  <path d="M56 4 a 52 52 0 0 1 0 104 a 52 52 0 0 1 0 -104" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <motion.path
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: '88, 100' }}
                    transition={{ duration: 2 }}
                    d="M56 4 a 52 52 0 0 1 0 104 a 52 52 0 0 1 0 -104"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">88</span>
                  <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Trust</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                {[
                  { label: 'KYC chính xác', pct: 95 },
                  { label: 'Phản hồi nhanh', pct: 82 },
                  { label: 'Báo cáo đầy đủ', pct: 87 },
                  { label: 'Chia sẻ kiến thức', pct: 75 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400 w-24 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                    <span className="text-[9px] font-black text-gray-500 w-8 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StaffProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* ===== FOOTER ===== */}
      <div className="border-t border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0 relative z-10 bg-white">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Copyright © 2026 TrustFundMe</span>
        <div className="flex items-center gap-6">
          {['Trang chủ', 'Chính sách', 'Liên hệ'].map((link, i) => (
            <span key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors">{link}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
