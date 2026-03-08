'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DanboxLayout from '@/layout/DanboxLayout';
import Link from 'next/link';
import {
  User, Mail, Phone, Save, X, Pencil, FolderOpen, Heart, ShieldCheck,
  CalendarClock, Loader2, ChevronRight, Landmark, CheckCircle2, Flag,
} from 'lucide-react';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { appointmentService, AppointmentScheduleDto, AppointmentStatus } from '@/services/appointmentService';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccountDto } from '@/types/bankAccount';
import { flagService, FlagDto } from '@/services/flagService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; pill: string }> = {
  PENDING: { label: 'Chờ xác nhận', pill: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', pill: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Hoàn thành', pill: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', pill: 'bg-red-100 text-red-500' },
};

const TABS: { key: 'ALL' | AppointmentStatus; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ─── Appointment Modal ───────────────────────────────────────────────────────

interface ModalProps {
  appointments: AppointmentScheduleDto[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

function AppointmentModal({ appointments, loading, error, onClose, onRetry }: ModalProps) {
  const [tab, setTab] = useState<'ALL' | AppointmentStatus>('ALL');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const list = (tab === 'ALL' ? appointments : appointments.filter(a => a.status === tab))
    .slice()
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', animation: 'apptSlideUp .25s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-7 pt-6 pb-16"
          style={{ background: 'linear-gradient(135deg,#ff5e14,#ff8338)' }}>
          <div>
            <h2 className="text-xl font-bold text-white">Lịch Hẹn Của Tôi</h2>
            <p className="text-sm text-white/70 mt-0.5">Lịch hẹn giữa bạn và nhân viên hỗ trợ</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Wave layer 1 – semi-transparent, higher crest */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            style={{ display: 'block', height: '56px' }}
          >
            <path
              d="M0,25 C200,60 400,0 600,28 C800,58 1000,0 1200,28 L1200,60 L0,60 Z"
              fill="rgba(255,255,255,0.4)"
            />
          </svg>

          {/* Wave layer 2 – solid white */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1200 50"
            preserveAspectRatio="none"
            style={{ display: 'block', height: '38px' }}
          >
            <path
              d="M0,30 C150,50 350,8 600,26 C850,44 1050,4 1200,28 L1200,50 L0,50 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* White cover — kills any orange bleed from waves */}
        <div className="bg-white w-full" style={{ height: '6px', marginTop: '-6px', position: 'relative', zIndex: 1 }} />

        {/* ── Filter tabs ── */}
        <div className="flex flex-wrap gap-2 px-7 pt-3 pb-3 border-b border-gray-100 bg-white relative z-10">
          {TABS.map(t => {
            const count = t.key === 'ALL' ? appointments.length : appointments.filter(a => a.status === t.key).length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                style={active
                  ? { background: 'linear-gradient(135deg,#ff5e14,#ff8338)', color: '#fff' }
                  : { background: '#f3f4f6', color: '#6b7280' }}
              >
                {t.label}
                <span
                  className="px-1.5 py-0.5 rounded-full font-bold text-[10px]"
                  style={active ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#e5e7eb', color: '#374151' }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-[#ff5e14]" />
              <p className="text-gray-500 text-sm">Đang tải lịch hẹn...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={onRetry}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#ff5e14,#ff8338)' }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ff5e14,#ff8338)' }}>
                <CalendarClock className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-gray-700 text-base">Chưa có lịch hẹn nào</p>
              <p className="text-sm text-gray-400">
                {tab === 'ALL' ? 'Bạn chưa có lịch hẹn nào với nhân viên.' : `Không có lịch hẹn ở trạng thái "${STATUS_CONFIG[tab as AppointmentStatus]?.label}".`}
              </p>
            </div>
          )}

          {/* Appointment Cards */}
          {!loading && !error && list.map((appt) => {
            const cfg = STATUS_CONFIG[appt.status];
            const start = fmt(appt.startTime);
            const end = fmt(appt.endTime);
            return (
              <div
                key={appt.id}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow duration-200"
              >
                {/* Row 1: date + status */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[15px] font-bold text-gray-800 capitalize">{start.date}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Row 2: time */}
                <p className="text-[#ff5e14] font-semibold text-sm mb-3">
                  {start.time} — {end.time}
                </p>

                {/* Row 3: staff / location / purpose */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  {appt.staffName && (
                    <p><span className="text-gray-400 font-medium">Nhân viên:</span> {appt.staffName}</p>
                  )}
                  {appt.location && (
                    <p><span className="text-gray-400 font-medium">Địa điểm:</span> {appt.location}</p>
                  )}
                  {appt.purpose && (
                    <p className="text-gray-500 italic">{appt.purpose}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>


      </div>

      <style jsx global>{`
        @keyframes apptSlideUp {
          from { opacity:0; transform: translateY(24px) scale(.97); }
          to   { opacity:1; transform: translateY(0)    scale(1);   }
        }
      `}</style>
    </div>
  );
}

// ─── Flags Modal ─────────────────────────────────────────────────────────────



function FlagsModal({
  flags,
  loading,
  onClose,
}: {
  flags: FlagDto[];
  loading: boolean;
  onClose: () => void;
}) {
  type FlagTab = 'CAMPAIGN' | 'POST';
  const [tab, setTab] = useState<FlagTab>('CAMPAIGN');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const campaignFlags = flags.filter(f => f.campaignId != null);
  const postFlags     = flags.filter(f => f.postId != null);
  const list          = tab === 'CAMPAIGN' ? campaignFlags : postFlags;

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-red-50">
        <Flag className="h-7 w-7 text-red-300" />
      </div>
      <p className="font-semibold text-gray-500 text-sm">
        {tab === 'CAMPAIGN' ? 'Chưa có tố cáo chiến dịch nào' : 'Chưa có tố cáo bài viết nào'}
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', animation: 'apptSlideUp .25s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-7 pt-6 pb-14"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">Tố Cáo Của Tôi</h2>
            <p className="text-sm text-white/70 mt-0.5">Danh sách tố cáo bạn đã gửi</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          {/* Wave */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ display: 'block', height: '36px' }}>
            <path d="M0,30 C150,50 350,8 600,26 C850,44 1050,4 1200,28 L1200,50 L0,50 Z" fill="white" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-7 pt-4 pb-3 border-b border-gray-100 bg-white">
          {(['CAMPAIGN', 'POST'] as FlagTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }}
            >
              <Flag className="h-3.5 w-3.5" />
              {t === 'CAMPAIGN' ? 'Chiến dịch' : 'Bài viết Feed'}
              <span
                className="px-1.5 py-0.5 rounded-full font-bold text-[10px]"
                style={tab === t ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#e5e7eb', color: '#374151' }}
              >
                {t === 'CAMPAIGN' ? campaignFlags.length : postFlags.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-3">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
          )}
          {!loading && list.length === 0 && renderEmpty()}
          {!loading && list.map(flag => {
            const href = flag.campaignId
              ? `/campaigns-details?id=${flag.campaignId}`
              : `/post/${flag.postId}`;
            const label = flag.campaignId ? 'chiến dịch' : 'bài viết';
            return (
              <div key={flag.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Sent indicator */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs font-semibold text-green-600">Tố cáo đã được gửi</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{new Date(flag.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {/* Reason */}
                  <p className="text-sm text-gray-700 truncate" title={flag.reason}>{flag.reason}</p>
                </div>
                {/* Link */}
                <Link
                  href={href}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
                  onClick={onClose}
                >
                  Xem {label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Appointment state
  const [showAppts, setShowAppts] = useState(false);
  const [appts, setAppts] = useState<AppointmentScheduleDto[]>([]);
  const [apptsLoading, setApptsLoading] = useState(false);
  const [apptsError, setApptsError] = useState('');

  // Flags state
  const [showFlags, setShowFlags] = useState(false);
  const [myFlags, setMyFlags] = useState<FlagDto[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Bank Account state
  const [bankAccount, setBankAccount] = useState<BankAccountDto | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isBankLoading, setIsBankLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = user.fullName?.split(' ') || [];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  // Fetch Bank Account
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        setIsBankLoading(true);
        const banks = await bankAccountService.getMyBankAccounts();
        if (banks.length > 0) {
          const mainBank = banks[0];
          setBankAccount(mainBank);
          setBankCode(mainBank.bankCode);
          setAccountNumber(mainBank.accountNumber);
          setAccountHolderName(mainBank.accountHolderName);
        }
      } catch (err) {
        console.error('Failed to fetch bank account:', err);
      } finally {
        setIsBankLoading(false);
      }
    };

    if (user?.id) fetchBankData();
  }, [user?.id]);

  const fetchAppts = useCallback(async () => {
    if (!user?.id) return;
    setApptsLoading(true);
    setApptsError('');
    try {
      const data = await appointmentService.getByDonor(user.id);
      setAppts(data);
    } catch {
      setApptsError('Không thể tải lịch hẹn. Vui lòng thử lại.');
    } finally {
      setApptsLoading(false);
    }
  }, [user?.id]);

  const openAppts = () => { setShowAppts(true); fetchAppts(); };

  const fetchFlags = useCallback(async () => {
    setFlagsLoading(true);
    try {
      const data = await flagService.getMyFlags(0, 100);
      setMyFlags(data);
    } catch {
      setMyFlags([]);
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  const openFlags = () => { setShowFlags(true); fetchFlags(); };

  const handleEdit = () => {
    const parts = user?.fullName?.split(' ') || [];
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(user?.phoneNumber || '');
    setAvatarPreview(user?.avatarUrl ?? null);

    // Sync bank state with current bankAccount
    if (bankAccount) {
      setBankCode(bankAccount.bankCode);
      setAccountNumber(bankAccount.accountNumber);
      setAccountHolderName(bankAccount.accountHolderName);
    } else {
      setBankCode('');
      setAccountNumber('');
      setAccountHolderName('');
    }

    setIsEditing(true);
  };

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean }> => {
    if (!user) throw new Error('Not authenticated');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userId', String(user.id));
      const upRes = await fetch('/api/upload/avatar', { method: 'POST', credentials: 'include', body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || 'Upload failed');
      const avatarUrl = upJson.avatarUrl as string;
      updateUser({ avatarUrl });
      setAvatarPreview(avatarUrl);
      try {
        const res = await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), { avatarUrl });
        const data = res.data;
        updateUser({ avatarUrl: data.avatarUrl || avatarUrl });
        toast('Avatar updated successfully', 'success');
      } catch (err: any) {
        console.error('Avatar sync failed', err);
        const detail = err.response?.data?.message || err.response?.data?.error || err.message;
        toast(`Avatar updated locally but sync failed: ${detail}`, 'error');
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
      toast(msg, 'error');
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!user?.id) { toast('User ID is required', 'error'); return; }

      // 1. Update Profile (Base User)
      try {
        const profileRes = await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), {
          fullName: fullName || undefined,
          phoneNumber: phone.trim()
        });
        updateUser({ fullName: profileRes.data.fullName ?? fullName, phoneNumber: profileRes.data.phoneNumber ?? phone.trim() });
      } catch (err: any) {
        console.error('Profile update 403/error:', err);
        const detail = err.response?.data?.message || err.response?.data?.error || err.message;
        throw new Error(`Profile Save Error: ${detail}`);
      }

      // 2. Handle Bank Account update / create
      try {
        const bankPayload = {
          bankCode: bankCode.trim(),
          accountNumber: accountNumber.trim(),
          accountHolderName: accountHolderName.trim()
        };

        if (bankCode.trim() || accountNumber.trim() || accountHolderName.trim()) {
          if (bankAccount) {
            const updatedBank = await bankAccountService.update(bankAccount.id, bankPayload);
            setBankAccount(updatedBank);
          } else {
            const newBank = await bankAccountService.create(bankPayload);
            setBankAccount(newBank);
          }
        }
      } catch (bankErr: any) {
        console.error('Bank update 403/error:', bankErr);
        const detail = bankErr.response?.data?.message || bankErr.response?.data?.error || bankErr.message;
        toast(`Basic profile saved, but Bank Error: ${detail}`, 'error');
        setIsEditing(false);
        return;
      }

      toast('Profile and bank details updated successfully', 'success');
      setIsEditing(false);
    } catch (err: any) {
      const detail = err.response?.data?.message || err.response?.data?.error || err.message;
      toast(detail || 'An unexpected error occurred', 'error');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  // Quick access "Lịch Hẹn" button
  const LichHenBtn = () => (
    <button
      onClick={openAppts}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group w-full text-left"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10 group-hover:bg-[#ff5e14]/15 transition-colors">
        <CalendarClock className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1">Lịch Hẹn</span>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#ff5e14] transition-colors" />
    </button>
  );

  // Quick access "Tố Cáo" button
  const MyFlagsBtn = () => (
    <button
      onClick={openFlags}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group w-full text-left"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
        <Flag className="h-5 w-5 text-red-400" strokeWidth={2} />
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1">Tố Cáo Của Tôi</span>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-red-400 transition-colors" />
    </button>
  );

  return (
    <ProtectedRoute requireVerified={true}>
      <DanboxLayout header={2} footer={2}>
        <section className="about-section section-padding">
          <div className="container">
            <div className="row">
              <div className="col-12">

                {/* ── Profile Card – wider ── */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-10 max-w-3xl mx-auto">

                  {!isEditing ? (
                    <>
                      {/* Edit button */}
                      <div className="flex justify-end mb-6">
                        <button type="button" onClick={handleEdit}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </button>
                      </div>

                      {/* Avatar */}
                      <div className="mb-8">
                        <p className="text-sm font-medium text-gray-500 mb-3">Profile Picture</p>
                        <Avatar className="h-28 w-28 border-2 border-gray-200 shadow-sm">
                          <AvatarImage src={avatarPreview ?? user?.avatarUrl ?? undefined} alt="Avatar" />
                          <AvatarFallback className="bg-gray-100 text-2xl font-bold text-gray-500">
                            {user.fullName?.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Info */}
                      <div className="divide-y divide-gray-100">
                        {[
                          { label: 'Full Name', value: user.fullName || '—' },
                          { label: 'Email Address', value: user.email || '—', icon: <Mail className="w-4 h-4 inline mr-2 text-[#ff5e14]" /> },
                          { label: 'Phone Number', value: user.phoneNumber || '—', icon: <Phone className="w-4 h-4 inline mr-2 text-[#ff5e14]" /> },
                          { label: 'Email Verified', value: user.verified ? 'Yes' : 'No', icon: <ShieldCheck className="w-4 h-4 inline mr-2 text-[#ff5e14]" /> },
                        ].map(row => (
                          <div key={row.label} className="flex flex-col sm:flex-row sm:items-center py-4 gap-1">
                            <span className="text-sm text-gray-500 min-w-[160px]">{row.icon}{row.label}</span>
                            <span className="text-gray-800 font-medium">{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bank Account */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-[#ff5e14]" /> Bank Account Detail
                          </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                          {isBankLoading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading bank info...
                            </div>
                          ) : bankAccount ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Bank Name</p>
                                  <p className="text-sm font-bold text-gray-800">{bankAccount.bankCode}</p>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> VERIFIED
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Account Holder</p>
                                  <p className="text-sm font-black text-gray-900 uppercase">{bankAccount.accountHolderName}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Account Number</p>
                                  <p className="text-lg font-mono font-black text-[#ff5e14] tracking-widest">{bankAccount.accountNumber}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">No bank account linked. Click "Edit" to add one.</div>
                          )}
                        </div>
                      </div>

                      {/* Quick access */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Link href="/account/campaigns"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <FolderOpen className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">My Campaigns</span>
                          </Link>
                          <Link href="/account/impact"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <Heart className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Your Impact</span>
                          </Link>
                          <LichHenBtn />
                          <MyFlagsBtn />
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Avatar upload */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-3">Profile Picture</label>
                        <div className="flex items-center gap-6">
                          <AvatarUploader onUpload={handleAvatarUpload} onError={(m) => toast(m, 'error')} maxSizeMB={5} acceptedTypes={['jpeg', 'jpg', 'png', 'webp', 'gif']}>
                            <Avatar className="h-28 w-28 cursor-pointer border-2 border-gray-200 shadow-sm hover:opacity-80 transition-opacity">
                              <AvatarImage src={avatarPreview ?? undefined} alt="Avatar" />
                              <AvatarFallback className="bg-gray-100 text-2xl font-bold text-gray-500">
                                {user.fullName?.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </AvatarUploader>
                          <p className="text-sm text-gray-400">Click avatar to upload.<br />JPG, PNG, WebP or GIF. Max 5MB.</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-2">
                            <User className="w-4 h-4 inline mr-2 text-[#ff5e14]" />First Name
                          </label>
                          <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5e14] focus:border-[#ff5e14] outline-none transition-all" />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                          <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5e14] focus:border-[#ff5e14] outline-none transition-all" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                          <Mail className="w-4 h-4 inline mr-2 text-[#ff5e14]" />Email Address
                        </label>
                        <input id="email" type="email" value={email} disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed" />
                        <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                      </div>

                      {/* Phone */}
                      <div className="mb-8">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-2">
                          <Phone className="w-4 h-4 inline mr-2 text-[#ff5e14]" />Phone Number
                        </label>
                        <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+84 123 456 789"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5e14] focus:border-[#ff5e14] outline-none transition-all" />
                      </div>

                      {/* Bank Fields */}
                      <div className="mb-8 p-6 bg-orange-50/30 rounded-2xl border border-orange-100">
                        <h3 className="text-sm font-bold text-orange-800 mb-6 flex items-center gap-2">
                          <Landmark className="w-4 h-4" /> Bank Account Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Bank Name / Code</label>
                            <input
                              type="text"
                              value={bankCode}
                              onChange={e => setBankCode(e.target.value)}
                              placeholder="e.g. MB Bank, Vietcombank"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e14] outline-none text-sm font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Account Number</label>
                              <input
                                type="text"
                                value={accountNumber}
                                onChange={e => setAccountNumber(e.target.value)}
                                placeholder="038 xxxx xxxx"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e14] outline-none text-sm font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Account Holder Name</label>
                              <input
                                type="text"
                                value={accountHolderName}
                                onChange={e => setAccountHolderName(e.target.value)}
                                placeholder="NGUYEN VAN A"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e14] outline-none text-sm font-bold uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 mb-8">
                        <button type="button"
                          onClick={() => { const p = user.fullName?.split(' ') || []; setFirstName(p[0] || ''); setLastName(p.slice(1).join(' ') || ''); setPhone(user.phoneNumber || ''); setIsEditing(false); }}
                          className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <X className="w-4 h-4 inline mr-1.5" />Cancel
                        </button>
                        <button type="submit" disabled={saving}
                          className="px-6 py-2.5 bg-[#ff5e14] text-white rounded-lg text-sm font-semibold hover:bg-[#e04e08] transition-colors disabled:opacity-50">
                          {saving ? <Loader2 className="w-4 h-4 inline mr-1.5 animate-spin" /> : <Save className="w-4 h-4 inline mr-1.5" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                      {/* Quick access (edit mode) */}
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Link href="/account/campaigns"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <FolderOpen className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">My Campaigns</span>
                          </Link>
                          <Link href="/account/impact"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10">
                              <Heart className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Your Impact</span>
                          </Link>
                          <LichHenBtn />
                          <MyFlagsBtn />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>
      </DanboxLayout>

      {showAppts && (
        <AppointmentModal
          appointments={appts}
          loading={apptsLoading}
          error={apptsError}
          onClose={() => setShowAppts(false)}
          onRetry={fetchAppts}
        />
      )}
      {showFlags && (
        <FlagsModal
          flags={myFlags}
          loading={flagsLoading}
          onClose={() => setShowFlags(false)}
        />
      )}
    </ProtectedRoute>
  );
}
