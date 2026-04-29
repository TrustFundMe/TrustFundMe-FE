'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  User, Mail, Phone, X, Pencil,
  Loader2, ChevronRight, Landmark, CheckCircle2,
  Star, ScrollText, Plus, Minus,
  Shield, Info, Clock, XCircle, ZoomIn, FileDown
} from 'lucide-react';
import { Suspense } from 'react';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccountDto } from '@/types/bankAccount';
import { trustScoreService } from '@/services/trustScoreService';
import { kycService } from '@/services/kycService';
import KYCInputForm from '@/components/staff/request/KYCInputForm';
import { KycResponse } from '@/types/kyc';

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
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
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

// ─── User KYC Modal ──────────────────────────────────────────────────────────

function UserKYCModal({
  userId,
  userName,
  onClose,
  onSuccess,
  readOnly,
}: {
  userId: number;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
  readOnly?: boolean;
}) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{ maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-[#ff5e14] flex items-center justify-center text-white shadow-lg shadow-[#ff5e14]/20">
                <Shield className="h-5 w-5" />
             </div>
             <div>
               <h2 className="text-base font-black text-gray-800 uppercase tracking-tight">Xác thực danh tính (KYC)</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Cung cấp giấy tờ để kích hoạt quyền lợi chủ quỹ</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <KYCInputForm
            userId={userId}
            userName={userName}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
            isStaff={false}
            onImageClick={setLightboxImage}
            readOnly={readOnly}
          />
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
            onClick={() => setLightboxImage(null)}
          >
            <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#f8fafe]">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff715e]" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);


  // Trust Score state
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [trustScoreLoading, setTrustScoreLoading] = useState(false);
  const [showTrustScoreLogs, setShowTrustScoreLogs] = useState(false);

  // KYC state
  const [kycData, setKycData] = useState<KycResponse | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(user?.dob || '');
  const [address, setAddress] = useState(user?.address || '');
  const [cvUrl, setCvUrl] = useState(user?.cvUrl || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Bank Account state
  const [bankAccount, setBankAccount] = useState<BankAccountDto | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [webhookKey, setWebhookKey] = useState('');
  const [isBankLoading, setIsBankLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = user.fullName?.split(' ') || [];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
      setAvatarPreview(user.avatarUrl || null);
      setDob(user.dob || '');
      setAddress(user.address || '');
      setCvUrl(user.cvUrl || '');
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
          setWebhookKey(mainBank.webhookKey || '');
        }
      } catch (err) {
        console.error('Failed to fetch bank account:', err);
      } finally {
        setIsBankLoading(false);
      }
    };

    if (user?.id) fetchBankData();
  }, [user?.id]);




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

  // Fetch KYC Data
  const fetchKycData = async () => {
    if (user?.id) {
      setKycLoading(true);
      try {
        const data = await kycService.getMyKyc();
        setKycData(data);
      } catch (err) {
        console.error('Failed to fetch KYC:', err);
      } finally {
        setKycLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchKycData();
  }, [user?.id]);

  const handleEdit = () => {
    const parts = user?.fullName?.split(' ') || [];
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(user?.phoneNumber || '');
    setAvatarPreview(user?.avatarUrl ?? null);
    setDob(user?.dob || '');
    setAddress(user?.address || '');
    setCvUrl(user?.cvUrl || '');

    // Sync bank state with current bankAccount
    if (bankAccount) {
      setBankCode(bankAccount.bankCode);
      setAccountNumber(bankAccount.accountNumber);
      setAccountHolderName(bankAccount.accountHolderName);
    } else {
      setBankCode('');
      setAccountNumber('');
      setAccountHolderName('');
      setWebhookKey('');
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
        address: address || undefined,
        cvUrl: cvUrl || undefined,
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
          accountHolderName: trAccName.toUpperCase(), // Always uppercase for banking
          webhookKey: webhookKey.trim() || undefined
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


  return (
    <div className="min-h-screen bg-[#f8fafe] flex items-center justify-center p-6 md:p-8 overflow-auto">
      {/* ── Main Single Card ── */}
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-fit animate-in fade-in zoom-in-95 duration-700">

        {/* LEFT SECTION: Basic Info & Avatar */}
        <div className="md:w-[320px] p-8 bg-gray-50/40 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
          <div className="relative mb-4 scale-90">
            <AvatarUploader
              onUpload={handleAvatarUpload}
              onError={(m) => { if (m?.trim()) toast(m, 'error'); }}
              maxSizeMB={5}
              acceptedTypes={['jpeg', 'jpg', 'png', 'webp', 'gif']}
            >
              <div className="relative cursor-pointer group">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={avatarPreview ?? user?.avatarUrl ?? undefined} alt="Avatar" />
                  <AvatarFallback className="bg-white text-2xl font-bold text-gray-400">
                    {user.fullName?.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0.5 right-0.5 bg-[#ff715e] p-2 rounded-full shadow-lg border-2 border-white">
                  <Pencil className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </AvatarUploader>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-0.5 tracking-tight">
            {user.fullName || 'Thành viên'}
          </h2>
          
          <div className="pt-5 border-t border-gray-100 mt-6 w-full">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center">
              <p className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-2">Trust Score</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-black leading-none">{user.trustScore ?? 0}</span>
                <button 
                  onClick={() => setShowTrustScoreLogs(true)}
                  className="px-3 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-sm"
                >
                  Lịch sử
                </button>
              </div>
            </div>
            
            <button
              onClick={handleEdit}
              className="w-full mt-5 py-3 border border-black text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-xl"
            >
              Cập nhật hồ sơ
            </button>
          </div>
        </div>

        {/* RIGHT SECTION: Details & Bank */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-black ml-1">Họ</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-black ml-1">Tên</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-black ml-1">Số điện thoại</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" placeholder="+84 ..." />
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3.5">
                <h3 className="text-[11px] font-bold text-black flex items-center gap-2 uppercase">
                  <Landmark className="h-4 w-4" /> Ngân hàng
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Mã ngân hàng" value={bankCode} onChange={e => setBankCode(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" />
                  <input type="text" placeholder="Số tài khoản" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" />
                </div>
                <input type="text" placeholder="Tên chủ thẻ" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none uppercase" />
                <input type="text" placeholder="apiwwebhook (Casso Secure Token)" value={webhookKey} onChange={e => setWebhookKey(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black/5 transition-all outline-none" />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={saving} className="flex-1 bg-[#ff715e] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#e04332] transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-white" /> : 'Lưu tất cả'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-y-3.5">
                <div className="flex items-center gap-4 py-1">
                  <Mail className="h-4 w-4 text-black" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-black tracking-widest leading-none mb-1.5">Email</p>
                    <p className="text-[15px] font-semibold text-black leading-none">{user.email}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-4 py-1">
                  <Phone className="h-4 w-4 text-black" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-black tracking-widest leading-none mb-1.5">Số điện thoại</p>
                    <p className="text-[15px] font-semibold text-black leading-none">{user.phoneNumber || '—'}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-4 py-1">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-black tracking-widest leading-none mb-1.5">Xác minh</p>
                    <p className="text-[15px] font-semibold text-black leading-none">{user.verified ? 'Đã kích hoạt' : 'Chưa xác minh'}</p>
                  </div>
                </div>
 
                {/* Compact KYC Row */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100 mt-1">
                  <div className="flex items-center gap-4">
                    <Shield className="h-4 w-4 text-black" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-black tracking-widest leading-none mb-1.5">Hồ sơ KYC</p>
                      <p className="text-sm font-bold text-black leading-none">
                        {kycLoading ? '...' : 
                          kycData?.status === 'APPROVED' ? 'Đã phê duyệt' : 
                          kycData?.status === 'PENDING' ? 'Đang chờ duyệt' : 
                          kycData?.status === 'REJECTED' ? 'Bị từ chối' : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  
                  {!kycLoading && (
                    <button 
                      onClick={() => setShowKycModal(true)}
                      className="w-24 py-2 bg-white border border-black text-[9px] font-bold text-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0"
                    >
                      {kycData?.status === 'APPROVED' ? 'Chi tiết' : 'Xác thực'}
                    </button>
                  )}
                </div>
 
                {/* Compact CV Row */}
                <div className="flex flex-col py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <ScrollText className="h-4 w-4 text-black" />
                      <div>
                        <p className="text-[9px] uppercase font-bold text-black tracking-widest leading-none mb-1.5">Hồ sơ năng lực (CV)</p>
                        <p className="text-sm font-bold text-black leading-none">
                          {user.cvUrl ? 'Đã tải lên' : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
   
                    <div className="flex items-center gap-2">
                      {user.cvUrl && (
                        <a 
                          href={user.cvUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-24 py-2 bg-gray-50 text-[9px] font-bold text-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all border border-transparent hover:border-black flex items-center justify-center shrink-0"
                        >
                          Xem CV
                        </a>
                      )}
                      
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setCvUploading(true);
                            try {
                              const { supabase } = await import('@/lib/supabaseClient');
                            
                              const removeAccents = (str: string) => {
                                return str.normalize('NFD')
                                  .replace(/[\u0300-\u036f]/g, '')
                                  .replace(/đ/g, 'd')
                                  .replace(/Đ/g, 'D')
                                  .replace(/[^a-zA-Z0-9\s_-]/g, '');
                              };

                              const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
                              const rawFullName = user.fullName?.trim() || 'User';
                              const safeFullName = removeAccents(rawFullName).replace(/\s+/g, '_');
                              const fileName = `${safeFullName}_${dateStr}.${file.name.split('.').pop()}`;
                              const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || process.env.SHARED_SUPABASE_BUCKET || 'TrustFundMe';
                              const { error: uploadError } = await supabase.storage.from(bucketName).upload(`cvs/${fileName}`, file);
                              if (uploadError) throw uploadError;
                              
                              const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(`cvs/${fileName}`);
                              
                              await api.put(API_ENDPOINTS.USERS.BY_ID(Number(user.id)), {
                                fullName: user.fullName,
                                cvUrl: publicUrl
                              });
                              
                              updateUser({ cvUrl: publicUrl });
                              toast('Tải lên CV thành công!', 'success');
                            } catch (error: any) {
                              toast('Lỗi tải lên CV: ' + (error.message || 'Unknown error'), 'error');
                            } finally {
                              setCvUploading(false);
                            }
                          }}
                          disabled={cvUploading}
                        />
                        <span className={`w-24 py-2 bg-white border border-black text-[9px] font-bold text-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0 ${cvUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          {cvUploading ? (
                            <div className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>...</span>
                            </div>
                          ) : (
                            user.cvUrl ? 'Đổi CV' : 'Tải lên'
                          )}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Template Links */}
                  <div className="ml-8 flex flex-wrap gap-2">
                    <a 
                      href="/templates/Mau_CV_Thien_Nguyen.docx" 
                      download 
                      className="px-3 py-1.5 bg-gray-50 text-[8px] font-bold text-black uppercase tracking-widest rounded-md hover:bg-gray-200 transition-all flex items-center gap-1.5"
                    >
                      <FileDown className="h-3 w-3" /> Mẫu Word
                    </a>
                  </div>
                </div>
              </div>
 
              {/* Bank Summary Area */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-[11px] font-bold text-black flex items-center gap-2 uppercase tracking-widest">
                    <Landmark className="h-3.5 w-3.5" /> Ngân hàng
                  </h3>
                  {bankAccount && <span className="text-[9px] font-bold text-black uppercase tracking-widest">Đang hoạt động</span>}
                </div>
 
                {bankAccount ? (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                    <div className="px-1">
                      <p className="text-[9px] font-bold text-black opacity-40 tracking-widest mb-1 uppercase">{bankAccount.bankCode}</p>
                      <p className="text-sm font-mono text-black font-bold tracking-tight leading-none mb-1">{bankAccount.accountNumber}</p>
                      <p className="text-[10px] font-bold text-black opacity-40 uppercase tracking-widest leading-none">{bankAccount.accountHolderName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center">
                    <button onClick={handleEdit} className="text-[9px] font-bold text-[#ff715e] uppercase tracking-widest">Thêm ngân hàng</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust Score Logs Modal ── */}
      {showTrustScoreLogs && user?.id && (
        <TrustScoreLogsModal
          userId={Number(user.id)}
          userName={user.fullName || 'Người dùng'}
          onClose={() => setShowTrustScoreLogs(false)}
        />
      )}

      {/* ── User KYC Modal ── */}
      {showKycModal && user?.id && (
        <UserKYCModal
          userId={Number(user.id)}
          userName={user.fullName || 'Người dùng'}
          onClose={() => setShowKycModal(false)}
          onSuccess={fetchKycData}
          readOnly={kycData?.status === 'APPROVED'}
        />
      )}
    </div>
  );
}
