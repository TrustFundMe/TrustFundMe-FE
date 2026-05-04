'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, AlertCircle, FileImage, Sparkles, MessageSquare, Lock, LockOpen, Ban, ShieldAlert, Megaphone, Phone, Info, AlertTriangle, Building2, MapPin, X, ExternalLink, ChevronDown, ChevronRight, RefreshCw, CheckCircle2, Calendar, CheckCircle } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { chatService } from '@/services/chatService';
import { feedPostService } from '@/services/feedPostService';
import { appointmentService } from '@/services/appointmentService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useRouter } from 'next/navigation';
import AIAnalysisModal from './AIAnalysisModal';
import CreateAppointmentModal from '@/components/staff/CreateAppointmentModal';
import BanUserModal from '@/components/staff/BanUserModal';
import DisableCampaignModal from '@/components/staff/DisableCampaignModal';
import StaffConfirmModal from '@/components/staff/StaffConfirmModal';
import axios from 'axios';

/* ══ HELPERS ══ */
const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);
const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const daysLeft = (s?: string | null) => {
    if (!s) return null;
    return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
};

/* ══ TYPES ══ */
interface EvidenceRecord {
    taskId: string; expenditureId: number; campaignId: number; campaignTitle: string;
    ownerName: string; ownerEmail: string; ownerPhone: string; ownerId: number;
    plan: string; totalAmount: number; evidenceStatus: string; evidenceDueAt?: string | null;
    createdAt: string; evidencePhotos: string[]; expenditureItems: any[]; purpose?: string;
    ownerIsActive: boolean; campaignStatus: string; hasFraudReport: boolean;
    hasAppointment: boolean; appointmentDate?: string;
}

/* ══ STATUS CONFIG ══ */
const S: Record<string, { label: string; c: string; bg: string }> = {
    PENDING: { label: 'Chờ nộp', c: '#92400e', bg: '#fef3c7' },
    SUBMITTED: { label: 'Đã nộp', c: '#1d4ed8', bg: '#dbeafe' },
    VERIFIED: { label: 'Xác nhận', c: '#14532d', bg: '#dcfce7' },
    APPROVED: { label: 'Đã duyệt', c: '#14532d', bg: '#dcfce7' },
    REJECTED: { label: 'Từ chối', c: '#991b1b', bg: '#fee2e2' },
};
function Pill({ s }: { s: string }) {
    const cfg = S[s] ?? { label: s, c: '#374151', bg: '#f3f4f6' };
    return <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide" style={{ color: cfg.c, background: cfg.bg }}>{cfg.label}</span>;
}

interface AIResult {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    recommendation: string;
    redFlags: string[];
    spendingAnalysis: string[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

/* ══ CONFIRM MODAL ══ */
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger = false }: { title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-xs border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{title}</p>
                    <button onClick={onCancel}><X className="h-3.5 w-3.5 text-gray-400" /></button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 font-bold hover:bg-gray-50">Huỷ</button>
                    <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg text-xs font-black text-white transition-all ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#ff5e14] hover:bg-[#3a5c51]'}`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

/* ══ DETAIL PANEL ══ */
function DetailPanel({ rec, onRefresh }: { rec: EvidenceRecord; onRefresh: () => void }) {
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [confirm, setConfirm] = useState<null | 'post_fraud' | 'send_legal'>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasPostedFraud, setHasPostedFraud] = useState(rec.hasFraudReport);

    const [banModal, setBanModal] = useState<{
        isOpen: boolean; userId: number; userName: string;
    }>({ isOpen: false, userId: 0, userName: '' });

    const [disableCampaignModal, setDisableCampaignModal] = useState<{
        isOpen: boolean; campaignId: number; campaignTitle: string;
    }>({ isOpen: false, campaignId: 0, campaignTitle: '' });

    const [confirmAction, setConfirmAction] = useState<{
        type: 'UNLOCK_CAMPAIGN' | 'ALLOW_EDIT_EVIDENCE';
        id: number;
        title: string;
        message: string;
    } | null>(null);

    const d = daysLeft(rec.evidenceDueAt);
    const overdue = d !== null && d < 0;
    const hasPhotos = rec.evidencePhotos.length > 0;

    const [isChatting, setIsChatting] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (rec.hasFraudReport) {
            setHasPostedFraud(true);
        }
    }, [rec.hasFraudReport, rec.campaignId]);

    const startChat = async () => {
        setIsChatting(true);
        try {
            const res = await chatService.createConversation(rec.ownerId, rec.campaignId);
            if (res.success && res.data) {
                toast.success('Đang chuyển đến cuộc hội thoại...');
                router.push(`/staff/chat?conversationId=${res.data.id}`);
            } else { toast.error('Không thể tạo cuộc hội thoại'); }
        } catch { toast.error('Lỗi kết nối chat'); }
        finally { setIsChatting(false); }
    };

    const doAction = async (type: typeof confirm) => {
        setConfirm(null);
        try {
            if (type === 'post_fraud') {
                await feedPostService.create({
                    campaignId: rec.campaignId,
                    targetId: rec.campaignId,
                    targetType: 'CAMPAIGN',
                    type: 'ANNOUNCEMENT',
                    visibility: 'PUBLIC',
                    title: `CẢNH BÁO RỦI RO: Chiến dịch "${rec.campaignTitle}"`,
                    content: `[HỆ THỐNG CẢNH BÁO THÔNG TIN]\n\nChiến dịch quyên góp "${rec.campaignTitle}" của chủ quỹ ${rec.ownerName} hiện đang bị đưa vào danh sách rủi ro và theo dõi đặc biệt do các dấu hiệu nghi vấn về tính minh bạch trong minh chứng chi tiêu.\n\nHiện tại, hệ thống của chúng tôi đang trong quá trình xử lý vi phạm, đối soát dữ liệu và yêu cầu giải trình từ phía chủ quỹ để làm rõ các sai lệch này cho mọi người cùng biết. \n\nBan quản trị khuyến cáo các nhà hảo tâm nên tạm dừng các giao dịch quyên góp liên quan đến chiến dịch này cho đến khi có kết luận cuối cùng. Chúng tôi cam kết bảo vệ quyền lợi của cộng đồng và sự minh bạch của hệ thống.`,
                    status: 'PUBLISHED',
                    category: 'Cảnh báo'
                });
                // Save to local cache to prevent flickering even if backend is slow
                try {
                    const cache = JSON.parse(localStorage.getItem('reported_campaigns') || '[]');
                    if (!cache.includes(rec.campaignId)) {
                        localStorage.setItem('reported_campaigns', JSON.stringify([...cache, rec.campaignId]));
                    }
                } catch (e) { console.error('Cache error:', e); }

                toast.success('Đã đăng bài tố cáo thành công');
                setHasPostedFraud(true);
                setTimeout(() => onRefresh(), 2000);
            }
            else if (type === 'send_legal') {
                await notificationService.createEvent({
                    userId: rec.ownerId,
                    type: 'LEGAL_WARNING',
                    title: `CẢNH BÁO PHÁP LÝ: CHIẾN DỊCH "${rec.campaignTitle.toUpperCase()}"`,
                    content: `Bạn đã vi phạm nghiêm trọng các điều khoản cam kết minh bạch tài chính trong chiến dịch "${rec.campaignTitle}". Hệ thống của chúng tôi đang tiến hành bàn giao hồ sơ vi phạm và đối soát bằng chứng của bạn cho các cơ quan pháp luật có thẩm quyền để xử lý dựa trên Bản cam kết trách nhiệm mà bạn đã ký kết từ trước. Chúng tôi yêu cầu bạn thực hiện giải trình ngay lập tức để tránh các hậu quả pháp lý nghiêm trọng.`,
                    targetId: rec.campaignId,
                    targetType: 'CAMPAIGN',
                    data: { campaignTitle: rec.campaignTitle, plan: rec.plan }
                });
                toast.success('Đã gửi thông báo pháp lý thành công');
                onRefresh();
            }
        } catch (err: any) {
            console.error('Action failed:', err);
            toast.error(err?.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const handleLockAccount = async () => {
        if (rec.ownerIsActive) {
            setBanModal({ isOpen: true, userId: rec.ownerId, userName: rec.ownerName });
        } else {
            try {
                setLoading(true);
                await userService.unbanUser(rec.ownerId);
                toast.success('Đã gỡ đình chỉ tài khoản');
                onRefresh();
            } catch { toast.error('Thao tác thất bại'); }
            finally { setLoading(false); }
        }
    };

    const confirmLockAccount = async (reason: string) => {
        try {
            setLoading(true);
            await userService.banUser(rec.ownerId, reason);
            toast.success('Đã khóa tài khoản');
            onRefresh();
        } catch { toast.error('Khóa tài khoản thất bại'); }
        finally { setLoading(false); }
    };

    const handleLockCampaign = async () => {
        const isLocked = rec.campaignStatus?.toUpperCase() === 'DISABLED' || rec.campaignStatus?.toUpperCase() === 'LOCKED';
        if (!isLocked) {
            setDisableCampaignModal({ isOpen: true, campaignId: rec.campaignId, campaignTitle: rec.campaignTitle });
        } else {
            setConfirmAction({
                type: 'UNLOCK_CAMPAIGN',
                id: rec.campaignId,
                title: 'Mở khóa chiến dịch?',
                message: `Bạn có chắc chắn muốn mở khóa chiến dịch "${rec.campaignTitle}"? Chiến dịch sẽ hiển thị và tiếp nhận quyên góp trở lại.`
            });
        }
    };

    const confirmDisableCampaign = async (reason: string) => {
        try {
            setLoading(true);
            await campaignService.disableCampaign(rec.campaignId, reason);
            toast.success('Đã khóa chiến dịch thành công');
            onRefresh();
        } catch { toast.error('Khóa chiến dịch thất bại'); }
        finally { setLoading(false); }
    };

    const executeConfirmAction = async () => {
        if (!confirmAction) return;
        try {
            setLoading(true);
            if (confirmAction.type === 'UNLOCK_CAMPAIGN') {
                await campaignService.reviewCampaign(rec.campaignId, 'APPROVED');
                toast.success('Đã mở khóa chiến dịch thành công');
            } else if (confirmAction.type === 'ALLOW_EDIT_EVIDENCE') {
                await expenditureService.updateEvidenceStatus(rec.expenditureId, 'ALLOWED_EDIT');
                toast.success('Đã mở quyền chỉnh sửa cho chủ quỹ');
            }
            onRefresh();
        } catch { toast.error('Thao tác thất bại'); }
        finally { setLoading(false); setConfirmAction(null); }
    };

    const CONFIRMS = {
        post_fraud: { title: 'Đăng bài tố cáo', message: `Đăng bài cảnh báo về chiến dịch "${rec.campaignTitle}" lên trang cộng đồng.`, confirmLabel: 'Xác nhận đăng', danger: true },
        send_legal: { title: 'Cảnh báo pháp lý', message: `Gửi email cảnh báo vi phạm hợp đồng đến "${rec.ownerEmail}".`, confirmLabel: 'Gửi cảnh báo', danger: false },
    };

    const runAI = async () => {
        if (!hasPhotos) { toast.error('Chưa có ảnh minh chứng'); return; }
        setAnalyzing(true);
        try {
            const itemsToAnalyze = rec.expenditureItems.filter((i: any) => (i.actualQuantity ?? 0) > 0);

            const result = await aiService.analyzeEvidence({
                expenditureId: rec.expenditureId,
                plan: rec.plan,
                purpose: rec.purpose || '',
                totalAmount: rec.totalAmount,
                items: itemsToAnalyze.length > 0 ? itemsToAnalyze : rec.expenditureItems,
                photoUrls: rec.evidencePhotos,
                createdAt: rec.createdAt
            });
            setAiResult(result as any);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.details || err?.message || 'AI phân tích thất bại';
            console.error('[runAI]', msg);
            toast.error(msg);
        } finally { setAnalyzing(false); }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {aiResult && (
                <AIAnalysisModal
                    result={aiResult}
                    itemsProp={rec.expenditureItems}
                    exp={{ id: rec.expenditureId } as any}
                    mode="evidence"
                    onClose={() => setAiResult(null)}
                />
            )}
            {lightbox && (
                <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="phóng to" className="max-h-full max-w-full rounded-xl object-contain" />
                    <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" onClick={() => setLightbox(null)}><X className="h-4 w-4 text-white" /></button>
                </div>
            )}
            {confirm && <ConfirmModal {...CONFIRMS[confirm]} onConfirm={() => doAction(confirm)} onCancel={() => setConfirm(null)} />}

            <BanUserModal
                isOpen={banModal.isOpen}
                onClose={() => setBanModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmLockAccount}
                userName={banModal.userName}
            />

            <DisableCampaignModal
                isOpen={disableCampaignModal.isOpen}
                onClose={() => setDisableCampaignModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDisableCampaign}
                campaignTitle={disableCampaignModal.campaignTitle}
            />

            <StaffConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeConfirmAction}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
            />

            {/* ── Combined Header & Owner Info ── */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-gray-50/40">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="h-8 w-8 rounded-lg bg-[#ff5e14]/10 flex items-center justify-center text-xs font-black text-[#ff5e14] shrink-0">{rec.ownerName[0]}</div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-gray-800 leading-tight truncate">{rec.ownerName}</p>
                                <p className="text-[10px] text-gray-500 leading-tight truncate">{rec.ownerEmail}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2">{rec.campaignTitle}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Đợt:</span>
                                <span className="text-[10px] font-black text-[#ff5e14] uppercase">{rec.plan}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Pill s={rec.evidenceStatus} />
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tổng chi</p>
                            <p className="text-base font-black text-gray-900 leading-none">{fmt(rec.totalAmount)}</p>
                        </div>
                        {rec.evidenceDueAt && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border ${overdue ? 'border-red-100' : 'border-gray-100'}`}>
                                <Calendar className={`h-3 w-3 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={`text-[9px] font-black ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                                    {fmtDate(rec.evidenceDueAt)} {overdue ? `(-${Math.abs(d!)}d)` : `(${d}d)`}
                                </span>
                            </div>
                        )}
                        {rec.ownerPhone && (
                            <a href={`tel:${rec.ownerPhone}`} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 text-[10px] font-black hover:bg-gray-100 transition-colors">
                                <Phone className="h-3 w-3" /> {rec.ownerPhone}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Scrollable body (EXPANDED) ── */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100 custom-scrollbar pr-1">

                {/* Mục tiêu chi */}
                {rec.expenditureItems.length > 0 && (
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-5 w-1 bg-[#ff5e14] rounded-full"></div>
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Mục tiêu sử dụng quỹ</p>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100 bg-gray-50/80">
                                        <th className="py-2 px-3 text-left min-w-[120px]">Hạng mục / Loại</th>
                                        <th className="py-2 px-3 text-center min-w-[100px]">Số lượng & Đơn vị</th>
                                        <th className="py-2 px-3 text-center min-w-[100px]">Thương hiệu</th>
                                        <th className="py-2 px-3 text-right min-w-[110px]">Đơn giá</th>
                                        <th className="py-2.5 px-3 text-[10px] font-black text-gray-400 uppercase border-r border-[#E2E8F0]">Địa điểm</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {rec.expenditureItems.flatMap((it: any, idx: number) => {
                                        const priceOver = (it.price || it.actualPrice || 0) > (it.expectedPrice || 0);
                                        const qtyDiff = (it.actualQuantity != null) && (it.actualQuantity !== it.expectedQuantity);

                                        return [
                                            <tr key={`exp-${idx}`} className="bg-white">
                                                {/* 1. Name & Category - Spans 2 rows */}
                                                <td rowSpan={2} className="py-2 px-3 align-middle min-w-[140px] border-b border-gray-100">
                                                    <p className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2">{it.name || it.description || `Hạng mục ${idx + 1}`}</p>
                                                    <span className="text-[9px] font-black text-[#ff5e14]/70 uppercase tracking-tighter bg-[#ff5e14]/5 px-1 rounded leading-none inline-block mt-1">
                                                        {it.catologyName || it.category || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* 2. Expected Quantity */}
                                                <td className="pt-2 pb-0.5 px-3 text-center align-bottom min-w-[110px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <span className="text-[10px] text-gray-400 opacity-60 italic whitespace-nowrap">Dự kiến:</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{it.expectedQuantity || 0} {it.expectedUnit || '-'}</span>
                                                    </div>
                                                </td>

                                                {/* 3. Expected Brand */}
                                                <td className="pt-2 pb-0.5 px-3 text-center align-bottom min-w-[100px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <span className="text-[10px] text-gray-400 opacity-60 italic whitespace-nowrap">Dự kiến:</span>
                                                        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[80px]">{it.expectedBrand || '-'}</span>
                                                    </div>
                                                </td>

                                                {/* 4. Expected Price */}
                                                <td className="pt-2 pb-0.5 px-3 text-right align-bottom min-w-[110px]">
                                                    <div className="flex items-center justify-end gap-1 leading-none">
                                                        <span className="text-[10px] text-gray-400 opacity-60 italic whitespace-nowrap">Dự kiến:</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{fmt(it.expectedPrice || 0)}</span>
                                                    </div>
                                                </td>

                                                {/* 5. Expected Location */}
                                                <td className="pt-2 pb-0.5 px-3 text-center align-bottom min-w-[140px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <span className="text-[10px] font-medium text-gray-400 italic mr-0.5">Dự kiến:</span>
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{it.expectedPurchaseLocation || '-'}</span>
                                                    </div>
                                                </td>
                                            </tr>,

                                            <tr key={`act-${idx}`} className="bg-white border-b border-gray-100 last:border-0">
                                                {/* 2. Actual Quantity */}
                                                <td className="pt-0.5 pb-2 px-3 text-center align-top min-w-[110px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <span className={`text-[10px] opacity-40 italic whitespace-nowrap font-black ${qtyDiff ? 'text-amber-600' : 'text-gray-700'}`}>Thực tế:</span>
                                                        <span className={`text-[10px] font-black ${qtyDiff ? 'text-amber-600' : 'text-gray-700'}`}>
                                                            {it.actualQuantity ?? it.expectedQuantity ?? 0} {it.actualUnit ?? it.unit ?? it.expectedUnit ?? '-'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 3. Actual Brand */}
                                                <td className="pt-0.5 pb-2 px-3 text-center align-top min-w-[100px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <span className={`text-[10px] opacity-40 italic whitespace-nowrap font-black ${it.actualBrand && it.actualBrand !== it.expectedBrand ? 'text-purple-600' : 'text-gray-700'}`}>Thực tế:</span>
                                                        <span className={`text-[10px] font-black truncate max-w-[80px] ${it.actualBrand && it.actualBrand !== it.expectedBrand ? 'text-purple-600' : 'text-gray-700'}`}>
                                                            {it.actualBrand || it.expectedBrand || '-'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 4. Actual Price */}
                                                <td className="pt-0.5 pb-2 px-3 text-right align-top min-w-[110px]">
                                                    <div className="flex items-center justify-end gap-1 leading-none">
                                                        <span className={`text-[10px] font-black opacity-40 italic whitespace-nowrap ${priceOver ? 'text-red-500' : 'text-[#3a5c51]'}`}>Thực tế:</span>
                                                        <span className={`text-[10px] font-extrabold ${priceOver ? 'text-red-500' : 'text-[#3a5c51]'}`}>
                                                            {fmt(it.price || it.actualPrice || it.expectedPrice || 0)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 5. Actual Location */}
                                                <td className="pt-0.5 pb-2 px-3 text-center align-top min-w-[140px]">
                                                    <div className="flex items-center justify-center gap-1 leading-none">
                                                        <div className="text-[10px] text-gray-700 font-bold leading-tight break-all">
                                                            {it.actualPurchaseLocation || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ];
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Ảnh minh chứng */}
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-1 bg-[#ff5e14] rounded-full"></div>
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Ảnh minh chứng ({rec.evidencePhotos.length})</p>
                        </div>
                        {hasPhotos && (
                            <button onClick={() => setPhotosOpen(v => !v)} className="text-[10px] font-black text-gray-400 hover:text-[#ff5e14] transition-colors flex items-center gap-1">
                                {photosOpen ? 'Thu gọn' : 'Xem thêm'}
                                {photosOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                        )}
                    </div>

                    {photosOpen && (
                        hasPhotos ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {rec.evidencePhotos
                                    .filter((u: any) => typeof u === 'string')
                                    .map((url: string, i: number) => (
                                        <button key={i} onClick={() => setLightbox(url)}
                                            className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 hover:border-[#ff5e14] hover:shadow-md transition-all group relative bg-gray-50">
                                            <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                                                <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all" />
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <FileImage className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-xs font-bold text-gray-400">Chưa có ảnh minh chứng</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ── Action Grid (SHRUNK) ── */}
            <div className="flex-shrink-0 px-4 py-2.5 border-t border-gray-100 bg-white">
                <div className="grid grid-cols-4 gap-1.5">
                    {/* Buttons set to h-8 instead of h-10, px-2 instead of px-3 */}

                    {/* 1. AI */}
                    <button onClick={runAI} disabled={analyzing || !hasPhotos}
                        className="h-8 rounded-lg text-[9px] font-black text-white flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-sm relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg,#ff5e14,#6a8d83)' }}>
                        <Sparkles className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                        <span className="uppercase mt-0.5">AI</span>
                    </button>

                    {/* 2. Message */}
                    <button onClick={startChat} disabled={isChatting}
                        className="h-8 rounded-lg border border-gray-100 bg-white text-gray-500 text-[9px] font-black flex flex-col items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-50">
                        <MessageSquare className="h-3.5 w-3.5 text-[#ff5e14]" />
                        <span className="uppercase mt-0.5">Chat</span>
                    </button>

                    {/* 3. Lock Campaign */}
                    {(() => {
                        const isLocked = rec.campaignStatus?.toUpperCase() === 'DISABLED' || rec.campaignStatus?.toUpperCase() === 'LOCKED';
                        return (
                            <button onClick={handleLockCampaign} disabled={loading}
                                className={`flex flex-col items-center justify-center h-8 rounded-lg border text-[9px] font-black uppercase transition-all ${isLocked
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-red-50'
                                    }`}>
                                {isLocked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                <span className="mt-0.5">{isLocked ? 'Mở CD' : 'Khóa CD'}</span>
                            </button>
                        );
                    })()}

                    {/* 4. Ban Account */}
                    <button onClick={handleLockAccount} disabled={loading}
                        className={`flex flex-col items-center justify-center h-8 rounded-lg border text-[9px] font-black uppercase transition-all ${!rec.ownerIsActive
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-white border-gray-100 text-gray-500 hover:bg-red-50'
                            }`}>
                        {!rec.ownerIsActive ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        <span className="mt-0.5">{!rec.ownerIsActive ? 'Mở TK' : 'Khóa TK'}</span>
                    </button>

                    {/* 5. Fraud Post */}
                    <button onClick={() => !hasPostedFraud && setConfirm('post_fraud')} disabled={loading || hasPostedFraud}
                        className={`flex flex-col items-center justify-center h-8 rounded-lg border text-[9px] font-black uppercase transition-all ${hasPostedFraud
                            ? 'bg-amber-50 border-amber-100 text-amber-600'
                            : 'bg-white border-gray-100 text-gray-500 hover:bg-amber-50'
                            }`}>
                        {hasPostedFraud ? <CheckCircle className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
                        <span className="mt-0.5">{hasPostedFraud ? 'Đã tố' : 'Tố cáo'}</span>
                    </button>

                    {/* 6. Legal Warning */}
                    <button onClick={() => setConfirm('send_legal')}
                        className="flex flex-col items-center justify-center h-8 rounded-lg border border-gray-100 bg-white text-gray-500 text-[9px] font-black uppercase hover:bg-red-50 transition-all">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span className="mt-0.5">Pháp lý</span>
                    </button>

                    {/* 7. Appointment */}
                    <button onClick={() => setShowSchedule(true)}
                        className={`flex flex-col items-center justify-center h-8 rounded-lg border text-[9px] font-black uppercase transition-all ${rec.hasAppointment
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-white border-gray-100 text-gray-500 hover:bg-blue-50'
                            }`}>
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="mt-0.5">{rec.hasAppointment ? 'Lịch' : 'Hẹn'}</span>
                    </button>

                    {/* 8. Allow Update */}
                    <button
                        onClick={() => setConfirmAction({
                            type: 'ALLOW_EDIT_EVIDENCE',
                            id: rec.expenditureId,
                            title: 'Cho phép chỉnh sửa?',
                            message: 'Chủ quỹ sẽ nhận được thông báo yêu cầu cập nhật lại minh chứng này. Trạng thái minh chứng sẽ chuyển sang "Từ chối" để mở quyền chỉnh sửa.'
                        })}
                        disabled={loading || rec.evidenceStatus === 'REJECTED' || rec.evidenceStatus === 'ALLOWED_EDIT'}
                        className="flex flex-col items-center justify-center h-8 rounded-lg border border-gray-100 bg-white text-gray-500 text-[9px] font-black uppercase hover:bg-amber-50 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="mt-0.5">Sửa</span>
                    </button>
                </div>

                {showSchedule && (
                    <CreateAppointmentModal
                        staffId={user?.id ? Number(user.id) : 0}
                        onClose={() => setShowSchedule(false)}
                        onCreated={() => { onRefresh(); setShowSchedule(false); }}
                        initialCampaignId={rec.campaignId}
                        initialDonorId={rec.ownerId}
                    />
                )}
            </div>
        </div>
    );
}

/* ══ MAIN ══ */
export default function EvidenceTab() {
    const [records, setRecords] = useState<EvidenceRecord[]>([]);
    const [filtered, setFiltered] = useState<EvidenceRecord[]>([]);
    const [selected, setSelected] = useState<EvidenceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'APPROVED'>('ALL');
    const { user } = useAuth();

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [tasks, allAppointments] = await Promise.all([
                campaignService.getTasksByStaff(user.id),
                appointmentService.getByStaff(user.id).catch(() => [])
            ]);

            const et = tasks.filter((t: any) => t.type === 'EVIDENCE');
            const rows = await Promise.all(et.map(async (task: any) => {
                try {
                    const exp = await expenditureService.getById(task.targetId);
                    const camp = await campaignService.getById(exp.campaignId);
                    const ownerRes = await userService.getUserById(camp.fundOwnerId);
                    const owner = ownerRes.data;
                    const items = await expenditureService.getItems(exp.id).catch(() => []);

                    // Lấy ảnh từ feedpost minh chứng (targetName = evidence, targetType = EXPENDITURE)
                    let evidencePhotos: string[] = [];
                    try {
                        const posts = await feedPostService.getByTarget(exp.id, 'EXPENDITURE');
                        const evidencePost = posts.find((p: any) => {
                            const tName = p.targetName || p.target_name || '';
                            return tName === 'evidence' || tName.startsWith('evidence|');
                        });

                        if (evidencePost) {
                            // Ưu tiên lấy từ attachments của post DTO nếu có
                            if (evidencePost.attachments && evidencePost.attachments.length > 0) {
                                evidencePhotos = evidencePost.attachments.map((a: any) => a.url);
                            } else {
                                // Fallback: fetch media by postId
                                const media = await mediaService.getMediaByPostId(evidencePost.id).catch(() => []);
                                evidencePhotos = media.map((m: any) => m.url);
                            }
                        }
                    } catch (err) {
                        console.warn(`[EvidenceTab] Failed to fetch feed posts for expenditure ${exp.id}`, err);
                    }

                    // Check for existing fraud report
                    let hasReport = false;
                    try {
                        const cache = JSON.parse(localStorage.getItem('reported_campaigns') || '[]');
                        if (cache.includes(camp.id)) {
                            hasReport = true;
                        } else {
                            const posts = await feedPostService.getByTarget(camp.id, 'CAMPAIGN');
                            hasReport = posts.some((p: any) =>
                                (p.type === 'ANNOUNCEMENT' || p.type === 'TEXT') &&
                                (p.title?.toUpperCase().includes('CẢNH BÁO') || (p as any).category === 'Cảnh báo' || p.content?.includes('HỆ THỐNG CẢNH BÁO'))
                            );
                        }
                    } catch { hasReport = false; }

                    // Check for existing appointment
                    const appt = allAppointments.find((a: any) => a.donorId === camp.fundOwnerId && a.status !== 'CANCELLED');

                    return {
                        taskId: task.id.toString(),
                        expenditureId: exp.id,
                        campaignId: camp.id,
                        campaignTitle: camp.title,
                        ownerName: owner?.fullName || `Chủ quỹ #${camp.fundOwnerId}`,
                        ownerEmail: owner?.email || '',
                        ownerPhone: owner?.phoneNumber || '',
                        ownerId: camp.fundOwnerId,
                        plan: exp.plan || `Đợt chi #${exp.id}`,
                        totalAmount: exp.totalAmount || 0,
                        evidenceStatus: exp.evidenceStatus || 'PENDING',
                        evidenceDueAt: (exp as any).evidenceDueAt || null,
                        createdAt: exp.createdAt || new Date().toISOString(),
                        evidencePhotos: evidencePhotos,
                        expenditureItems: items,
                        purpose: (exp as any).purpose || '',
                        ownerIsActive: (owner as any)?.isActive ?? (owner as any)?.is_active ?? true,
                        campaignStatus: camp.status || 'APPROVED',
                        hasFraudReport: hasReport,
                        hasAppointment: !!appt,
                        appointmentDate: appt?.startTime
                    } as EvidenceRecord;
                } catch { return null; }
            }));
            const valid = rows.filter((r): r is EvidenceRecord => r !== null);
            const sorted = [...valid].sort((a, b) => (daysLeft(a.evidenceDueAt) ?? 9999) - (daysLeft(b.evidenceDueAt) ?? 9999));
            setRecords(sorted);
            setFiltered(sorted);

            // Sync selected record with new data if detail panel is open
            setSelected(prev => {
                if (!prev) return null;
                return sorted.find(r => r.taskId === prev.taskId) || null;
            });
        } catch { toast.error('Lỗi tải danh sách minh chứng'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        let list = records;
        if (filter === 'PENDING') list = list.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) >= 0);
        else if (filter === 'SUBMITTED') list = list.filter(r => r.evidenceStatus === 'SUBMITTED');
        else if (filter === 'OVERDUE') list = list.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) < 0);
        else if (filter === 'APPROVED') list = list.filter(r => r.evidenceStatus === 'APPROVED' || r.evidenceStatus === 'VERIFIED');
        if (search.trim()) list = list.filter(r => r.campaignTitle.toLowerCase().includes(search.toLowerCase()) || r.ownerName.toLowerCase().includes(search.toLowerCase()) || r.plan.toLowerCase().includes(search.toLowerCase()));
        setFiltered(list);
    }, [search, filter, records]);

    const overdueN = records.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) < 0).length;
    const submittedN = records.filter(r => r.evidenceStatus === 'SUBMITTED').length;

    if (loading) return <div className="flex h-40 items-center justify-center text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase animate-pulse">Đang tải...</div>;

    return (
        <div className="flex-1 flex h-full min-h-0 gap-4 overflow-hidden">
            {/* ── Sidebar ── */}
            <div className={`${selected ? 'w-80 flex-shrink-0' : 'flex-1'} flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white`}>
                <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#ff5e14,#6a8d83)' }}>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Minh chứng chi tiêu</h3>
                    <button onClick={load} title="Làm mới" className="h-6 w-6 rounded hover:bg-white/10 flex items-center justify-center"><RefreshCw className="h-3.5 w-3.5 text-white/70" /></button>
                </div>


                {/* Search + Filter */}
                <div className="px-2.5 py-2 border-b border-gray-100 flex-shrink-0 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
                            className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#ff5e14]/30" />
                    </div>
                    <div className="flex gap-1">
                        {([
                            { k: 'ALL', v: 'Tất cả', t: 'Hiển thị tất cả' },
                            { k: 'PENDING', v: 'Chờ nộp', t: 'Chưa nộp, chưa quá hạn' },
                            { k: 'SUBMITTED', v: 'Đã nộp', t: 'Đã nộp ảnh, chờ AI phân tích' },
                            { k: 'OVERDUE', v: 'Quá hạn', t: 'Đã quá hạn nộp minh chứng' },
                            { k: 'APPROVED', v: 'Đã duyệt', t: 'Minh chứng đã được xác nhận' },
                        ] as const).map(f => (
                            <button key={f.k} onClick={() => setFilter(f.k)} title={f.t}
                                className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase whitespace-nowrap transition-all ${filter === f.k ? 'bg-[#ff5e14] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {f.v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-[9px] font-black uppercase mt-1">Trống</p>
                        </div>
                    ) : filtered.map(r => {
                        const d = daysLeft(r.evidenceDueAt);
                        const over = d !== null && d < 0;
                        const active = selected?.taskId === r.taskId;
                        const cfg = S[r.evidenceStatus] ?? S.PENDING;
                        return (
                            <button key={r.taskId} onClick={() => setSelected(r)}
                                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-all ${active ? 'bg-[#ff5e14]/5' : 'hover:bg-gray-50/50'}`}>
                                <div className="flex items-start gap-2">
                                    <div className={`h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black ${active ? 'bg-[#ff5e14] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {over ? '!' : r.evidencePhotos.length > 0 ? r.evidencePhotos.length : r.campaignTitle[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className={`text-[11px] font-black truncate uppercase tracking-tighter ${active ? 'text-[#ff5e14]' : 'text-gray-800'}`}>{r.plan}</p>
                                            {over && <span className="text-[9px] font-black text-red-500 flex-shrink-0">QUÁ HẠN</span>}
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">{r.campaignTitle}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-black text-[#ff5e14]">{fmt(r.totalAmount)}</span>
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase" style={{ color: cfg.c, background: cfg.bg }}>{cfg.label}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Detail ── */}
            {selected && (
                <div className="flex-1 overflow-hidden flex flex-col h-full min-h-0 border border-gray-100 rounded-2xl shadow-sm bg-white">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-50 bg-gray-50/40 flex-shrink-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chi tiết bằng chứng</p>
                        <button onClick={() => setSelected(null)} title="Đóng panel chi tiết"
                            className="h-6 w-6 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors group">
                            <X className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700" />
                        </button>
                    </div>
                    <DetailPanel key={selected.taskId} rec={selected} onRefresh={load} />
                </div>
            )}
        </div>
    );
}
