'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    Search, ChevronDown, ChevronRight, AlertCircle, ArrowUpRight,
    Eye, ThumbsUp, ThumbsDown, CheckCheck, Ban, X, CalendarClock,
    ImageIcon, BadgeCheck, Clock, FileText,
} from 'lucide-react';
import type { Expenditure, ExpenditureItem } from '@/types/expenditure';
import type { CampaignDto } from '@/types/campaign';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { userService } from '@/services/userService';

/* ══════════════════════════════ HELPERS ══════════════════════════════ */
const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);
const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const STATUS_EXP: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
    APPROVED: { label: 'Đã duyệt', color: '#16a34a', bg: '#dcfce7' },
    CLOSED: { label: 'Yêu cầu rút tiền', color: '#2563eb', bg: '#dbeafe' },
    WITHDRAWAL_REQUESTED: { label: 'Yêu cầu rút tiền', color: '#2563eb', bg: '#dbeafe' },
    REJECTED: { label: 'Từ chối', color: '#dc2626', bg: '#fee2e2' },
    DISBURSED: { label: 'Đã giải ngân', color: '#16a34a', bg: '#dcfce7' },
};

const EVIDENCE_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Chờ bằng chứng', color: '#d97706', bg: '#fef3c7' },
    SUBMITTED: { label: 'Đã nộp — chờ duyệt', color: '#2563eb', bg: '#dbeafe' },
    VERIFIED: { label: 'Đã xác nhận', color: '#16a34a', bg: '#dcfce7' },
};

const CAM_TYPE: Record<string, string> = { AUTHORIZED: 'Quỹ Ủy Quyền', TARGET: 'Quỹ Mục Tiêu' };

/* ══════════════════════════════ StatusPill ══════════════════════════════ */
function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_EXP[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' };
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
        </span>
    );
}

/* ══════════════════════════════ RejectModal ══════════════════════════════ */
function RejectModal({ onConfirm, onCancel }: { onConfirm: (r: string) => void; onCancel: () => void }) {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Lý do từ chối</h3>
                    <button onClick={onCancel}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Nhập lý do từ chối kế hoạch chi tiêu…" rows={4}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200" />
                <div className="flex gap-2 mt-4">
                    <button onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Huỷ
                    </button>
                    <button onClick={() => reason.trim() && onConfirm(reason)} disabled={!reason.trim()}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg,#db5945,#f19082)' }}>
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════ EvidenceReviewPanel ══════════════════════════════ */
function EvidenceReviewPanel({ campaignId, evidenceStatus, onAllVerified }:
    { campaignId: number; evidenceStatus: string | null | undefined; onAllVerified: () => void }) {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [fileStatuses, setFileStatuses] = useState<Record<number, 'PENDING' | 'APPROVED' | 'REJECTED'>>({});
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        mediaService.getMediaByCampaignId(campaignId)
            .then(data => {
                setMedia(data);
                const init: Record<number, 'PENDING' | 'APPROVED' | 'REJECTED'> = {};
                data.forEach(m => { init[m.id] = 'PENDING'; });
                setFileStatuses(init);
            })
            .finally(() => setLoading(false));
    }, [campaignId]);

    const canReview = evidenceStatus === 'SUBMITTED' || evidenceStatus === 'PENDING';

    if (loading) return <div className="py-2 text-[10px] text-gray-400 animate-pulse">Đang tải bằng chứng…</div>;

    if (!media.length) return (
        <div className="flex items-center gap-2 py-4 text-gray-400 text-xs text-center justify-center border border-dashed border-gray-100 rounded-xl">
            Chưa có bằng chứng nào được tải lên
        </div>
    );

    return (
        <>
            {canReview && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-[#446b5f]/10 border border-[#446b5f]/20 text-[10px] text-[#446b5f] flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    Fund owner đã nộp bằng chứng — vui lòng kiểm tra từng file bên dưới.
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {media.map(m => {
                    const st = fileStatuses[m.id] ?? 'PENDING';
                    return (
                        <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-xl border border-gray-100 bg-white shadow-sm">
                            <button className="relative flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden group"
                                onClick={() => setLightbox(m.url)}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={m.url} alt={m.fileName} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-all">
                                    <Eye className="h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-gray-700 truncate">{m.fileName}</p>
                                <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${st === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                    st === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {st === 'APPROVED' ? 'Đã duyệt' : st === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                                </span>
                                {canReview && st === 'PENDING' && (
                                    <div className="flex gap-1 mt-1.5">
                                        <button onClick={() => setFileStatuses(p => ({ ...p, [m.id]: 'APPROVED' }))}
                                            className="flex-1 py-1 rounded-md text-[9px] font-bold text-white bg-green-600">
                                            Duyệt
                                        </button>
                                        <button onClick={() => setFileStatuses(p => ({ ...p, [m.id]: 'REJECTED' }))}
                                            className="flex-1 py-1 rounded-md text-[9px] font-bold text-white bg-red-600">
                                            X
                                        </button>
                                    </div>
                                )}
                                {canReview && st !== 'PENDING' && (
                                    <button onClick={() => setFileStatuses(p => ({ ...p, [m.id]: 'PENDING' }))}
                                        className="mt-0.5 text-[9px] text-gray-400 hover:text-gray-600 underline">Hoàn tác</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {canReview && (
                <button onClick={onAllVerified}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold text-white bg-green-600 shadow-md">
                    <CheckCheck className="h-3.5 w-3.5" /> Xác nhận bằng chứng
                </button>
            )}
            {lightbox && (
                <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lightbox} alt="evidence" className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain" />
                </div>
            )}
        </>
    );
}

/* ══════════════════════════════ ExpenditureItemRow ══════════════════════════════ */
function ExpenditureItemRow({ item }: { item: ExpenditureItem }) {
    const actualAmt = (item.actualQuantity ?? item.quantity) * item.price;
    const expectedAmt = item.quantity * item.expectedPrice;
    const diff = actualAmt - expectedAmt;
    return (
        <tr className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
            <td className="py-2 px-3 text-xs text-gray-700 font-medium">{item.category}</td>
            <td className="py-2 px-3 text-xs text-center text-gray-500">{item.quantity}</td>
            <td className="py-2 px-3 text-xs text-center text-gray-500">{item.actualQuantity ?? '—'}</td>
            <td className="py-2 px-3 text-xs text-right text-gray-600">{fmt(item.expectedPrice)}</td>
            <td className="py-2 px-3 text-xs text-right text-gray-600">{fmt(item.price)}</td>
            <td className="py-2 px-3 text-xs text-right font-semibold"
                style={{ color: diff > 0 ? '#db5945' : diff < 0 ? '#446b5f' : '#6b7280' }}>
                {diff > 0 ? '+' : ''}{fmt(diff)}
            </td>
        </tr>
    );
}

/* ══════════════════════════════ ExpenditureRound ══════════════════════════════ */
function ExpenditureRound({ exp: initialExp, index, campaignType }:
    { exp: Expenditure; index: number; campaignType?: string | null }) {
    const [open, setOpen] = useState(index === 0);
    const [exp, setExp] = useState<Expenditure>(initialExp);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [approving, setApproving] = useState(false);

    const loadItems = useCallback(() => {
        if (items.length) return;
        setLoadingItems(true);
        expenditureService.getItems(exp.id)
            .then(data => setItems(data))
            .catch(() => toast.error('Lỗi tải hạng mục'))
            .finally(() => setLoadingItems(false));
    }, [exp.id, items.length]);

    useEffect(() => { if (open) loadItems(); }, [open, loadItems]);

    const handleApprove = async () => {
        setApproving(true);
        try {
            const updated = await expenditureService.updateStatus(exp.id, 'APPROVED');
            setExp(updated);
            toast.success(`Đã duyệt: ${exp.plan}`);
        } catch {
            toast.error('Lỗi khi duyệt');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async (reason: string) => {
        setShowRejectModal(false);
        try {
            const updated = await expenditureService.updateStatus(exp.id, 'REJECTED');
            setExp(updated);
            toast.success('Đã từ chối');
        } catch {
            toast.error('Lỗi khi từ chối');
        }
    };

    const handleAllVerified = async () => {
        try {
            const updated = await expenditureService.updateStatus(exp.id, 'VERIFIED');
            setExp(updated);
            toast.success('Đã xác nhận bằng chứng!');
        } catch {
            toast.error('Lỗi xác nhận');
        }
    };

    return (
        <>
            {showRejectModal && <RejectModal onConfirm={handleReject} onCancel={() => setShowRejectModal(false)} />}
            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-3 bg-white">
                {/* Header */}
                <button onClick={() => setOpen(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg,#db5945,#f19082)' }}>
                            {index + 1}
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{exp.plan ?? `Đợt #${exp.id}`}</p>
                            <p className="text-[9px] text-gray-400">Tạo: {fmtDate(exp.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Đã chi</p>
                            <p className="text-xs font-black text-[#db5945]">{fmt(exp.totalAmount)}</p>
                        </div>
                        <StatusPill status={exp.status} />
                        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                    </div>
                </button>

                {open && (
                    <div className="border-t border-gray-50 bg-gray-50/20">
                        {/* Meta bar */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2 text-[10px] font-medium text-gray-500 border-b border-gray-50">
                            <span>Dự kiến: <strong className="text-gray-700">{fmt(exp.totalExpectedAmount)}</strong></span>
                        </div>

                        {/* Status: Pending Review - ONLY for AUTHORIZED campaigns */}
                        {(exp.status === 'PENDING' || exp.status === 'PENDING_REVIEW') && campaignType === 'AUTHORIZED' && (
                            <div className="mx-4 mt-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 shadow-sm">
                                <p className="text-[10px] font-black text-amber-700 mb-2.5 uppercase tracking-wider">Đang chờ phê duyệt (Quỹ ủy quyền)</p>
                                <div className="flex gap-2">
                                    <button onClick={handleApprove} disabled={approving}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-green-600 shadow-sm transition-all hover:brightness-105 active:scale-95">
                                        {approving ? '...' : 'DUYỆT'}
                                    </button>
                                    <button onClick={() => setShowRejectModal(true)}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-red-600 shadow-sm transition-all hover:brightness-105 active:scale-95">
                                        TỪ CHỐI
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Note for TARGET campaigns pending */}
                        {exp.status === 'PENDING' && campaignType === 'TARGET' && (
                            <div className="mx-4 mt-3 rounded-xl border border-blue-50 bg-blue-50/20 p-3 shadow-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-400" />
                                <p className="text-[10px] text-blue-600 font-medium italic">Kế hoạch chờ chi (Quỹ mục tiêu - Không cần duyệt)</p>
                            </div>
                        )}

                        {/* Items table */}

                        {/* Items table */}
                        <div className="px-4 py-3">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">DANH MỤC CHI TIẾT</p>
                            {loadingItems ? (
                                <div className="py-4 text-center text-[10px] text-gray-400 animate-pulse">Đang tải...</div>
                            ) : (
                                <div className="rounded-lg overflow-hidden border border-gray-50 shadow-sm">
                                    <table className="w-full text-xs bg-white">
                                        <thead className="bg-gray-50 text-[9px] font-black text-gray-400">
                                            <tr>
                                                <th className="py-1.5 px-3 text-left">HẠNG MỤC</th>
                                                <th className="py-1.5 px-3 text-center">KH</th>
                                                <th className="py-1.5 px-3 text-center">TT</th>
                                                <th className="py-1.5 px-3 text-right">ĐƠN GIÁ TT</th>
                                                <th className="py-1.5 px-3 text-right">CHÊNH LỆCH</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {items.map(it => (
                                                <tr key={it.id} className="hover:bg-gray-50/50">
                                                    <td className="py-1.5 px-3 font-medium text-gray-700">{it.category}</td>
                                                    <td className="py-1.5 px-3 text-center text-gray-400">{it.quantity}</td>
                                                    <td className="py-1.5 px-3 text-center text-gray-600 font-bold">{it.actualQuantity ?? '—'}</td>
                                                    <td className="py-1.5 px-3 text-right text-gray-700">{fmt(it.price)}</td>
                                                    <td className="py-1.5 px-3 text-right font-bold" style={{ color: (it.actualQuantity ?? it.quantity) * it.price - it.quantity * it.expectedPrice > 0 ? '#db5945' : '#446b5f' }}>
                                                        {fmt((it.actualQuantity ?? it.quantity) * it.price - it.quantity * it.expectedPrice)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-[10px] text-gray-300 italic">Không có dữ liệu</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Evidence review */}
                        <div className="px-4 pb-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">BẰNG CHỨNG XÁC THỰC</p>
                            <EvidenceReviewPanel
                                campaignId={exp.campaignId}
                                evidenceStatus={exp.evidenceStatus}
                                onAllVerified={handleAllVerified}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

/* ══════════════════════════════ CampaignDetail ══════════════════════════════ */
function CampaignDetail({ campaign }: { campaign: CampaignDto }) {
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [ownerName, setOwnerName] = useState<string>(`Owner #${campaign.fundOwnerId}`);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            expenditureService.getByCampaignId(campaign.id),
            userService.getUserById(campaign.fundOwnerId).then(res => res.success && res.data ? res.data.fullName : `Owner #${campaign.fundOwnerId}`)
        ]).then(([expData, name]) => {
            setExpenditures(expData);
            setOwnerName(name);
        }).finally(() => setLoading(false));
    }, [campaign.id, campaign.fundOwnerId]);

    if (loading) return <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-bold tracking-widest uppercase animate-pulse">ĐANG TẢI DỮ LIỆU...</div>;

    const totalExpected = expenditures.reduce((s, e) => s + (e.totalExpectedAmount || 0), 0);
    const totalActual = expenditures.reduce((s, e) => s + (e.totalAmount || 0), 0);
    const diff = totalActual - totalExpected;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Compact Header Bar */}
            <div className="flex-shrink-0 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between gap-3 shadow-md border border-[#db5945]/10"
                style={{ background: 'linear-gradient(135deg,#db5945,#f19082)' }}>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter">{CAM_TYPE[campaign.type ?? ''] ?? campaign.type}</p>
                    <h2 className="text-xs font-black text-white leading-tight truncate uppercase">{campaign.title}</h2>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] font-bold text-white/80">
                        <span>{ownerName}</span>
                        <span className="flex items-center gap-0.5 h-3 px-1 rounded-sm bg-white/10">{fmtDate(campaign.startDate)} – {fmtDate(campaign.endDate)}</span>
                        {campaign.kycVerified && <span className="text-green-200">KYC ✓</span>}
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3 text-right">
                    <div>
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter">SỐ DƯ</p>
                        <p className="text-xs font-black text-white">{fmt(campaign.balance)}</p>
                    </div>
                    <div className="border-l border-white/20 pl-3">
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter">ĐỢT</p>
                        <p className="text-lg font-black text-white leading-none">{expenditures.length}</p>
                    </div>
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-[9px] font-black uppercase tracking-widest">{campaign.status}</span>
                </div>
            </div>

            {/* Summary Stats Rows */}
            {expenditures.length > 0 && (
                <div className="flex gap-2 mb-3 flex-shrink-0">
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#446b5f]/20">
                        <p className="text-[8px] font-black text-[#446b5f]/60 uppercase tracking-widest mb-0.5">DỰ KIẾN</p>
                        <p className="font-bold text-[#446b5f] text-[11px]">{fmt(totalExpected)}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#446b5f]/20">
                        <p className="text-[8px] font-black text-[#446b5f]/60 uppercase tracking-widest mb-0.5">ĐÃ NHẬN</p>
                        <p className="font-bold text-[#446b5f] text-[11px]">{fmt(campaign.balance + totalActual)}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#db5945]/20">
                        <p className="text-[8px] font-black text-[#db5945]/60 uppercase tracking-widest mb-0.5">ĐÃ CHI</p>
                        <p className="font-black text-[#db5945] text-[11px]">{fmt(totalActual)}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#6b7280]/20">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">SỐ DƯ QUỸ</p>
                        <p className="font-black text-gray-600 text-[11px]">{fmt(campaign.balance)}</p>
                    </div>
                </div>
            )}

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar">
                {expenditures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center opacity-30">
                        <FileText className="h-8 w-8 text-gray-300" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách trống</p>
                    </div>
                ) : expenditures.map((exp, i) => <ExpenditureRound key={exp.id} exp={exp} index={i} campaignType={campaign.type} />)}
            </div>
        </div>
    );
}

/* ══════════════════════════════ Main ExpenditureTab ══════════════════════════════ */
export default function ExpenditureTab() {
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [filtered, setFiltered] = useState<CampaignDto[]>([]);
    const [selected, setSelected] = useState<CampaignDto | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        campaignService.getByStatus('APPROVED')
            .then(data => {
                setCampaigns(data);
                setFiltered(data);
                if (data.length > 0) setSelected(data[0]);
            })
            .catch(() => toast.error('Lỗi tải danh sách'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let list = campaigns;
        if (typeFilter !== 'ALL') list = list.filter(c => c.type === typeFilter);
        if (search.trim()) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
        setFiltered(list);
    }, [search, typeFilter, campaigns]);

    const types = Array.from(new Set(campaigns.map(c => c.type || '').filter(Boolean)));

    if (loading) return (
        <div className="flex h-64 items-center justify-center text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
            LOADING...
        </div>
    );

    return (
        <div className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* Sidebar: Campaign List */}
            <div className="w-64 flex-shrink-0 flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#446b5f,#6a8d83)' }}>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Chiến dịch thu chi</h3>
                </div>
                <div className="px-2.5 py-2.5 border-b border-gray-50 flex-shrink-0 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên chiến dịch..."
                            className="w-full pl-7 pr-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#db5945]/20 bg-gray-50/50" />
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        <button onClick={() => setTypeFilter('ALL')}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap ${typeFilter === 'ALL' ? 'bg-[#db5945] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}>
                            TẤT CẢ
                        </button>
                        {types.map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap ${typeFilter === t
                                    ? (t === 'TARGET' ? 'bg-[#446b5f] text-white' : 'bg-[#db5945] text-white')
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}>
                                {CAM_TYPE[t] ?? t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-[9px] font-black uppercase mt-1">Trống</p>
                        </div>
                    ) : filtered.map(c => {
                        const isActive = selected?.id === c.id;
                        const isTarget = c.type === 'TARGET';
                        const themeColor = isTarget ? '#446b5f' : '#db5945';
                        const themeBg = isTarget ? 'bg-[#446b5f]' : 'bg-[#db5945]';

                        return (
                            <button key={c.id} onClick={() => setSelected(c)}
                                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-all ${isActive ? (isTarget ? 'bg-[#446b5f]/10' : 'bg-[#db5945]/10') : 'hover:bg-gray-50/30'}`}>
                                <div className="flex items-start gap-2.5">
                                    <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${isActive ? `${themeBg} text-white shadow-sm` : 'bg-gray-100 text-gray-400'}`}>
                                        {c.title[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[11px] font-black truncate uppercase tracking-tighter ${isActive ? (isTarget ? 'text-[#446b5f]' : 'text-[#db5945]') : 'text-gray-700'}`}>{c.title}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">{c.type}</span>
                                            <span className="text-[10px] font-black truncate ml-1" style={{ color: isActive ? themeColor : '#db5945' }}>{fmt(c.balance)}</span>
                                        </div>
                                    </div>
                                    {isActive && <div className={`w-0.5 h-6 rounded-full ml-1 ${themeBg}`} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Detail */}
            <div className="flex-1 overflow-hidden flex flex-col border border-gray-100 rounded-2xl shadow-sm bg-white p-4">
                {selected ? (
                    <CampaignDetail key={selected.id} campaign={selected} />
                ) : (
                    <div className="flex flex-col h-full items-center justify-center opacity-20">
                        <FileText className="h-10 w-10" />
                        <p className="text-[10px] font-black uppercase mt-2 tracking-[0.2em]">CHỌN CHIẾN DỊCH</p>
                    </div>
                )}
            </div>
        </div>
    );
}
