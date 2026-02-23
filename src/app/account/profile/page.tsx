'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DanboxLayout from '@/layout/DanboxLayout';
import Link from 'next/link';
import {
  User, Mail, Phone, Save, X, Pencil, FolderOpen, Heart, ShieldCheck,
  CalendarClock, Loader2, ChevronRight,
} from 'lucide-react';
import { appointmentService, AppointmentScheduleDto, AppointmentStatus } from '@/services/appointmentService';

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

// ─── Profile Page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Appointment state
  const [showAppts, setShowAppts] = useState(false);
  const [appts, setAppts] = useState<AppointmentScheduleDto[]>([]);
  const [apptsLoading, setApptsLoading] = useState(false);
  const [apptsError, setApptsError] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

  const handleEdit = () => {
    const parts = user?.fullName?.split(' ') || [];
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(user?.phoneNumber || '');
    setAvatarPreview(user?.avatarUrl ?? null);
    setError(''); setSuccess('');
    setIsEditing(true);
  };

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean }> => {
    if (!user) throw new Error('Not authenticated');
    setError('');
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
        const res = await fetch(`/api/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ userId: user.id, avatarUrl }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          updateUser({ avatarUrl: (data as { avatarUrl?: string }).avatarUrl || avatarUrl });
          setSuccess('Avatar updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('Avatar updated locally but could not sync. Try uploading again.');
        }
      } catch { setError('Avatar updated locally but could not sync.'); }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(msg); throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!user?.id) { setError('User ID is required'); return; }
      const res = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ userId: user.id, fullName: fullName || undefined, phoneNumber: phone.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        updateUser({ fullName: data.fullName ?? fullName, phoneNumber: data.phoneNumber ?? phone.trim() });
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        setIsEditing(false);
      } else { setError(data.error || 'Failed to update profile'); }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  // Quick access "Lịch Hẹn" button – reused in both view and edit mode
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

  return (
    <ProtectedRoute requireVerified={true}>
      <DanboxLayout header={2} footer={2}>
        <section className="about-section section-padding">
          <div className="container">
            <div className="row">
              <div className="col-12">

                {error && (
                  <div className="mb-4 max-w-3xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 max-w-3xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

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

                      {/* Quick access */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Avatar upload */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-3">Profile Picture</label>
                        <div className="flex items-center gap-6">
                          <AvatarUploader onUpload={handleAvatarUpload} onError={setError} maxSizeMB={5} acceptedTypes={['jpeg', 'jpg', 'png', 'webp', 'gif']}>
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

                      {/* Actions */}
                      <div className="flex justify-end gap-3 mb-8">
                        <button type="button"
                          onClick={() => { const p = user.fullName?.split(' ') || []; setFirstName(p[0] || ''); setLastName(p.slice(1).join(' ') || ''); setPhone(user.phoneNumber || ''); setError(''); setSuccess(''); setIsEditing(false); }}
                          className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <X className="w-4 h-4 inline mr-1.5" />Cancel
                        </button>
                        <button type="submit" disabled={saving}
                          className="px-6 py-2.5 bg-[#ff5e14] text-white rounded-lg text-sm font-semibold hover:bg-[#e04e08] transition-colors disabled:opacity-50">
                          {saving ? <Loader2 className="w-4 h-4 inline mr-1.5 animate-spin" /> : <Save className="w-4 h-4 inline mr-1.5" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                      {/* Quick access */}
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    </ProtectedRoute>
  );
}
