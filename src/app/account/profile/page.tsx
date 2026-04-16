'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  User, Mail, Phone, Save, X, Pencil, FolderOpen, Heart, ShieldCheck,
  CalendarClock, Loader2, ChevronRight, Landmark, CheckCircle2, Flag, Search, Box,
  Star, ScrollText, Plus, Minus
} from 'lucide-react';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { appointmentService, AppointmentScheduleDto } from '@/services/appointmentService';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccountDto } from '@/types/bankAccount';
import { flagService, FlagDto } from '@/services/flagService';
import { trustScoreService } from '@/services/trustScoreService';

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
  const postFlags = flags.filter(f => f.postId != null);
  const list = tab === 'CAMPAIGN' ? campaignFlags : postFlags;

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

// ─── Trust Score Logs Modal ─────────────────────────────────────────────────

function TrustScoreLogsModal({
  userId,
  userName,
  onClose,
}: {
  userId: number;
  userName: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedLogs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedLogs(newSet);
  };
  const pageSize = 20;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    trustScoreService.getLogs({ userId, page, size: pageSize })
      .then(res => {
        setLogs(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [userId, page]);

  const formatDate = (d: string) => new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', animation: 'apptSlideUp .25s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-7 pt-6 pb-14"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">Nhật Ký Điểm Uy Tín</h2>
            <p className="text-sm text-white/70 mt-0.5">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ display: 'block', height: '36px' }}>
            <path d="M0,30 C150,50 350,8 600,26 C850,44 1050,4 1200,28 L1200,50 L0,50 Z" fill="white" />
          </svg>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-amber-50">
                <Star className="h-7 w-7 text-amber-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">Chưa có nhật ký điểm uy tín nào.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 sticky top-0">
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Quy tắc</th>
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Mô tả</th>
                    <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs">Điểm</th>
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Liên kết</th>
                    <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const href = log.referenceId
                      ? log.referenceType === 'CAMPAIGN'
                        ? `/campaigns-details?id=${log.referenceId}`
                        : log.referenceType === 'POST'
                          ? `/post/${log.referenceId}`
                          : log.referenceType === 'EXPENDITURE'
                            ? `/account/campaigns/expenditures/${log.referenceId}`
                            : null
                      : null;
                    return (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-5">
                          <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {log.ruleKey}
                          </code>
                        </td>
                        <td className="py-3 px-5 text-gray-600 text-xs max-w-xl min-w-[200px]">
                          <div className={expandedLogs.has(log.id) ? "" : "line-clamp-2"}>
                            {log.description || '-'}
                          </div>
                          {(log.description && log.description.length > 50) && (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 mt-1 uppercase tracking-tight"
                            >
                              {expandedLogs.has(log.id) ? 'Thu gọn' : 'Xem thêm'}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <span className={`inline-flex items-center gap-0.5 font-bold text-sm ${log.pointsChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {log.pointsChange >= 0 ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                            {Math.abs(log.pointsChange)}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          {href ? (
                            <Link
                              href={href}
                              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                            >
                              Xem {log.referenceType === 'CAMPAIGN' ? 'chiến dịch' : log.referenceType === 'POST' ? 'bài viết' : log.referenceType === 'EXPENDITURE' ? 'chi tiêu' : 'chi tiết'}
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right text-xs text-gray-400">{formatDate(log.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
              </div>
            </>
          )}
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

  // Flags state
  const [showFlags, setShowFlags] = useState(false);
  const [myFlags, setMyFlags] = useState<FlagDto[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  // Trust Score state
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [trustScoreLoading, setTrustScoreLoading] = useState(false);
  const [showTrustScoreLogs, setShowTrustScoreLogs] = useState(false);

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

  // Fetch trust score
  useEffect(() => {
    if (user?.id) {
      setTrustScoreLoading(true);
      trustScoreService.getUserScore(Number(user.id))
        .then(res => setTrustScore(res.totalScore ?? 0))
        .catch((err) => {
          console.error('Failed to fetch trust score:', err);
          setTrustScore(0);
        })
        .finally(() => setTrustScoreLoading(false));
    }
  }, [user?.id]);

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
      try {
        const res = await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), { avatarUrl });
        const data = res.data;
        updateUser({ avatarUrl: data.avatarUrl || avatarUrl });
        toast('Cập nhật ảnh đại diện thành công', 'success');
      } catch (err: any) {
        console.error('Avatar sync failed', err);
        const detail = err.response?.data?.message || err.response?.data?.error || err.message;
        toast(`Ảnh đại diện đã được cập nhật cục bộ nhưng đồng bộ lên máy chủ thất bại: ${detail}`, 'error');
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải ảnh đại diện lên';
      toast(msg, 'error');
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validation ──
    const trFirstName = firstName.trim();
    const trLastName = lastName.trim();
    if (!trFirstName || !trLastName) {
      toast('Vui lòng nhập đầy đủ Họ và Tên', 'error');
      return;
    }

    const trPhone = phone.trim();
    if (trPhone) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(trPhone)) {
        toast('Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0', 'error');
        return;
      }
    }

    // Bank info validation (matching campaign creation step 4)
    const trBankCode = bankCode.trim();
    const trAccNum = accountNumber.trim();
    const trAccName = accountHolderName.trim();

    const hasAnyBankInfo = trBankCode || trAccNum || trAccName;
    if (hasAnyBankInfo) {
      if (!trBankCode) { toast('Vui lòng nhập mã ngân hàng', 'error'); return; }
      if (trBankCode.length < 2 || trBankCode.length > 50) { toast('Mã ngân hàng phải từ 2-50 ký tự', 'error'); return; }

      if (!trAccNum) { toast('Vui lòng nhập số tài khoản', 'error'); return; }
      if (!/^\d+$/.test(trAccNum)) { toast('Số tài khoản chỉ được chứa chữ số', 'error'); return; }
      if (trAccNum.length < 6 || trAccNum.length > 50) { toast('Số tài khoản phải từ 6-50 chữ số', 'error'); return; }

      if (!trAccName) { toast('Vui lòng nhập tên chủ tài khoản', 'error'); return; }
      if (trAccName.length < 6 || trAccName.length > 255) { toast('Tên chủ tài khoản phải từ 6-255 ký tự', 'error'); return; }
    }

    setSaving(true);
    try {
      if (!user?.id) throw new Error('Thiếu thông tin người dùng, vui lòng đăng nhập lại');

      // 1. Update Profile (User Info)
      const fullName = `${trFirstName} ${trLastName}`.trim();
      const profileRes = await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), {
        fullName,
        phoneNumber: trPhone || undefined
      });
      updateUser({
        fullName: profileRes.data.fullName ?? fullName,
        phoneNumber: profileRes.data.phoneNumber ?? trPhone
      });

      // 2. Handle Bank Account (Update or Create)
      if (hasAnyBankInfo) {
        const bankPayload = {
          bankCode: trBankCode,
          accountNumber: trAccNum,
          accountHolderName: trAccName.toUpperCase() // Always uppercase for banking
        };

        if (bankAccount) {
          const updatedBank = await bankAccountService.update(bankAccount.id, bankPayload);
          setBankAccount(updatedBank);
        } else {
          const newBank = await bankAccountService.create(bankPayload);
          setBankAccount(newBank);
        }
      }

      toast('Cập nhật hồ sơ và thông tin ngân hàng thành công', 'success');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Submit failed:', err);
      const detail = err.response?.data?.message || err.response?.data?.error || err.message;
      toast(detail || 'Đã xảy ra lỗi khi lưu thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  // Quick access "Lịch Hẹn" button
  const LichHenBtn = () => (
    <Link
      href="/account/schedule"
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group w-full text-left"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5e14]/10 group-hover:bg-[#ff5e14]/15 transition-colors">
        <CalendarClock className="h-5 w-5 text-[#ff5e14]" strokeWidth={2} />
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1">Lịch Hẹn</span>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#ff5e14] transition-colors" />
    </Link>
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
    <div className="h-full bg-[#f8fafe] flex items-center justify-center overflow-hidden p-6">
      {/* ── Main Single Card ── */}
      <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-fit animate-in fade-in zoom-in duration-500">

        {/* LEFT SECTION: Basic Info & Avatar */}
        <div className="md:w-2/5 p-10 bg-gray-50/50 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-100">
          <div className="relative mb-6">
            <AvatarUploader
              onUpload={handleAvatarUpload}
              onError={(m) => { if (m?.trim()) toast(m, 'error'); }}
              maxSizeMB={5}
              acceptedTypes={['jpeg', 'jpg', 'png', 'webp', 'gif']}
            >
              <div className="relative cursor-pointer group">
                <Avatar className="h-32 w-32 ring-8 ring-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={avatarPreview ?? user?.avatarUrl ?? undefined} alt="Avatar" />
                  <AvatarFallback className="bg-white text-3xl font-bold text-gray-400">
                    {user.fullName?.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 bg-[#ff715e] p-2.5 rounded-full shadow-lg border-4 border-white">
                  <Pencil className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
            </AvatarUploader>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tight">
            {user.fullName || 'Thành viên'}
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Hội viên TrustFundMe
          </p>

          {/* Premium Trust Score Section */}
          <div className="w-full mt-3 px-8">
            <div className="bg-white rounded-[2rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-amber-100/40 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-400/5 rounded-full blur-xl group-hover:bg-amber-400/10 transition-all duration-500" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-5 w-5 text-amber-500" fill="currentColor" fillOpacity={0.2} />
                </div>
                
                {trustScoreLoading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-md" />
                    <div className="h-2.5 w-24 bg-gray-50 animate-pulse rounded-sm" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-gray-900 leading-none">
                        {trustScore ?? 0}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">đ</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                      Độ Uy Tín
                    </p>
                    
                    <button 
                      onClick={() => setShowTrustScoreLogs(true)}
                      className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      <ScrollText className="h-2.5 w-2.5" />
                      Biến động
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Sửa hồ sơ
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Details & Bank */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Họ</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Tên</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Số điện thoại</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none" placeholder="+84 ..." />
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                  <Landmark className="h-4 w-4" /> THÔNG TIN NGÂN HÀNG
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Mã ngân hàng" value={bankCode} onChange={e => setBankCode(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none" />
                  <input type="text" placeholder="Số tài khoản" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none" />
                </div>
                <input type="text" placeholder="Tên chủ thẻ" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#ff715e]/20 transition-all outline-none uppercase" />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="submit" disabled={saving} className="flex-1 bg-[#ff715e] text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-red-100 hover:bg-[#e04332] transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Lưu tất cả'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Email cá nhân</p>
                    <p className="text-sm font-bold text-gray-700">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Số điện thoại</p>
                    <p className="text-sm font-bold text-gray-700">{user.phoneNumber || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Xác minh tài khoản</p>
                    <p className="text-sm font-bold text-gray-700">{user.verified ? 'Đã kích hoạt' : 'Chưa xác minh'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Summary Area */}
              <div className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <Landmark className="h-3.5 w-3.5" /> THÔNG TIN THANH TOÁN
                  </h3>
                  {bankAccount && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2.5 py-1 rounded-full">ACTIVE</span>}
                </div>

                {bankAccount ? (
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-white/40 mb-1">{bankAccount.bankCode}</p>
                      <p className="text-base font-mono tracking-widest mb-3">{bankAccount.accountNumber}</p>
                      <p className="text-[10px] font-bold uppercase">{bankAccount.accountHolderName}</p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-full">
                      <Landmark className="h-5 w-5 text-white/50" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-400 italic mb-3">Chưa có thông tin ngân hàng</p>
                    <button onClick={handleEdit} className="text-xs font-bold text-[#ff715e] hover:underline">Thêm ngay</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Flags Modal ── */}
      {showFlags && (
        <FlagsModal
          flags={myFlags}
          loading={flagsLoading}
          onClose={() => setShowFlags(false)}
        />
      )}

      {/* ── Trust Score Logs Modal ── */}
      {showTrustScoreLogs && user?.id && (
        <TrustScoreLogsModal
          userId={Number(user.id)}
          userName={user.fullName || 'Người dùng'}
          onClose={() => setShowTrustScoreLogs(false)}
        />
      )}
    </div>
  );
}
