'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    Search, ChevronDown, ChevronRight, AlertCircle,
    X, FileText, CreditCard, CheckCircle
} from 'lucide-react';
import type { Expenditure, ExpenditureItem } from '@/types/expenditure';
import type { CampaignDto } from '@/types/campaign';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';

import { useSearchParams } from 'next/navigation';

/* ══════════════════════════════ HELPERS ══════════════════════════════ */
const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);
const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : <span className="text-gray-300 font-medium italic text-[10px]">Chưa cập nhật</span>;

const STATUS_EXP: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
    APPROVED: { label: 'Đã duyệt', color: '#16a34a', bg: '#dcfce7' },
    CLOSED: { label: 'Đã duyệt', color: '#16a34a', bg: '#dcfce7' },
    WITHDRAWAL_REQUESTED: { label: 'Đã duyệt', color: '#16a34a', bg: '#dcfce7' },
    REJECTED: { label: 'Từ chối', color: '#dc2626', bg: '#fee2e2' },
    DISBURSED: { label: 'Đã giải ngân', color: '#0369a1', bg: '#e0f2fe' },
};

const EVIDENCE_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Chờ bằng chứng', color: '#d97706', bg: '#fef3c7' },
    SUBMITTED: { label: 'Đã nộp — chờ duyệt', color: '#2563eb', bg: '#dbeafe' },
    VERIFIED: { label: 'Đã xác nhận', color: '#16a34a', bg: '#dcfce7' },
    REJECTED: { label: 'Bằng chứng sai', color: '#dc2626', bg: '#fee2e2' },
};

const CAM_TYPE: Record<string, string> = { AUTHORIZED: 'Quỹ Ủy Quyền', ITEMIZED: 'Quỹ Vật Phẩm', TARGET: 'Quỹ Mục Tiêu' };

/* ════════════════════════════ StatusPill ════════════════════════════ */
function StatusPill({ status }: { status: string }) {
    const key = (status ?? '').toUpperCase().replace(/[- ]/g, '_');
    const cfg = STATUS_EXP[key] ?? { label: STATUS_EXP[status]?.label ?? 'Không xác định', color: '#6b7280', bg: '#f3f4f6' };
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


/* ══════════════════════════════ ExpenditureItemRow ══════════════════════════════ */
function ExpenditureItemRow({ item }: { item: ExpenditureItem }) {
    const actualAmt = (item.actualQuantity ?? (item.expectedQuantity || 0)) * (item.expectedPrice || 0);
    const expectedAmt = (item.expectedQuantity || 0) * (item.expectedPrice || 0);
    const diff = actualAmt - expectedAmt;
    return (
        <tr className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
            <td className="py-2 px-3 text-xs text-gray-700 font-medium">{item.name}</td>
            <td className="py-2 px-3 text-xs text-center text-gray-500">{item.expectedQuantity}</td>
            <td className="py-2 px-3 text-xs text-center text-gray-500">{item.actualQuantity ?? '—'}</td>
            <td className="py-2 px-3 text-xs text-right text-gray-600">{fmt(item.expectedPrice)}</td>
            <td className="py-2 px-3 text-xs text-right text-gray-600">{fmt(item.expectedPrice)}</td>
            <td className="py-2 px-3 text-xs text-right font-semibold"
                style={{ color: diff > 0 ? '#db5945' : diff < 0 ? '#ff5e14' : '#6b7280' }}>
                {diff > 0 ? '+' : ''}{fmt(diff)}
            </td>
        </tr>
    );
}

/* ══════════════════════════════ ExpenditureRound ══════════════════════════════ */
function ExpenditureRound({ exp: initialExp, index, campaignType, onModalToggle }:
    { exp: Expenditure; index: number; campaignType?: string | null; onModalToggle?: (open: boolean) => void }) {
    const [open, setOpen] = useState(index === 0);
    const [exp, setExp] = useState<Expenditure>(initialExp);
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        onModalToggle?.(showRejectModal);
    }, [showRejectModal, onModalToggle]);
    const [approving, setApproving] = useState(false);
    const { user } = useAuth();

    const loadItems = useCallback(() => {
        if (categories.length) return;
        setLoadingItems(true);
        expenditureService.getCategories(exp.id)
            .then(data => setCategories(data))
            .catch(() => toast.error('Lỗi tải hạng mục'))
            .finally(() => setLoadingItems(false));
    }, [exp.id, categories.length]);

    useEffect(() => { if (open) loadItems(); }, [open, loadItems]);

    const handleApprove = async () => {
        setApproving(true);
        try {
            const updated = await expenditureService.updateStatus(exp.id, 'APPROVED', user?.id);
            setExp(prev => ({ ...prev, ...(updated ?? {}), status: 'APPROVED' }));
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
            const updated = await expenditureService.updateStatus(exp.id, 'REJECTED', user?.id, reason);
            setExp(prev => ({ ...prev, ...(updated ?? {}), status: 'REJECTED', rejectReason: reason }));
            toast.success('Đã từ chối');
        } catch {
            toast.error('Lỗi khi từ chối');
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
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{exp.plan ?? 'Kế hoạch chi tiêu'}</p>
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
                            {/* Dòng Dự kiến đã bị ẩn theo yêu cầu */}
                        </div>

                        {/* Status: Pending Review - for AUTHORIZED and ITEMIZED campaigns */}
                        {(exp.status === 'PENDING' || exp.status === 'PENDING_REVIEW') && (campaignType === 'AUTHORIZED' || campaignType === 'ITEMIZED') && (
                            <div className="mx-4 mt-4 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-4 shadow-sm">
                                <p className="text-[11px] font-black text-amber-700 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Đang chờ quản trị viên phê duyệt
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={handleApprove} disabled={approving}
                                        className="flex-[2] py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg shadow-green-100 transition-all hover:shadow-green-200 active:scale-95 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> {approving ? 'ĐANG XỬ LÝ...' : 'PHÊ DUYỆT KẾ HOẠCH'}
                                    </button>
                                    <button onClick={() => setShowRejectModal(true)}
                                        className="flex-1 py-3 rounded-xl text-xs font-black text-white bg-red-600 shadow-lg shadow-red-100 transition-all hover:bg-red-700 active:scale-95 flex items-center justify-center gap-2">
                                        <X className="h-4 w-4" /> TỪ CHỐI
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Items table */}

                        {/* Items table */}
                        <div className="px-4 py-3">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">DANH MỤC CHI TIẾT</p>
                            {loadingItems ? (
                                <div className="py-4 text-center text-[10px] text-gray-400 animate-pulse">Đang tải...</div>
                            ) : (
                                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                    <table className="w-full text-xs bg-white text-left">
                                        <thead className="bg-[#ff5e14] text-white">
                                            <tr className="text-[9px] font-black uppercase tracking-widest border-b border-[#ff5e14]">
                                                <th className="py-2 px-3 text-center border-r border-white/20 w-[40px]">STT</th>
                                                <th className="py-2 px-3 border-r border-white/20 w-[15%]">Danh mục</th>
                                                <th className="py-2 px-3 border-r border-white/20 w-[15%] bg-orange-500">Tổng DM</th>
                                                <th className="py-2 px-3 border-r border-white/20">Hàng hóa / Ghi chú</th>
                                                <th className="py-2 px-3 border-r border-white/20 min-w-[120px]">Nhãn / ĐV / Tại</th>
                                                <th className="py-2 px-3 text-right border-r border-white/20 w-[110px]">Kế hoạch</th>
                                                <th className="py-2 px-3 text-right w-[110px]">Thực tế</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {categories.length > 0 ? categories.map((cat, cIdx) => {
                                                const rowSpan = cat.items && cat.items.length > 0 ? cat.items.length : 1;
                                                return (
                                                    <React.Fragment key={cat.id || cIdx}>
                                                        {!cat.items || cat.items.length === 0 ? (
                                                            <tr className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="py-2.5 px-3 text-[10px] font-black text-gray-400 text-center border-r border-gray-50">-</td>
                                                                <td className="py-2.5 px-3 border-r border-gray-50 bg-orange-50/10 align-top">
                                                                    <div className="text-[11px] font-black text-gray-800 uppercase leading-snug">{cat.name}</div>
                                                                </td>
                                                                <td className="py-2.5 px-3 border-r border-gray-50 bg-orange-50/20 align-top">
                                                                    <div className="text-[9px] font-bold text-[#ff5e14] flex flex-col gap-0.5">
                                                                        <span>KH: {fmt(cat.expectedAmount || 0)}</span>
                                                                        <span>TT: {fmt(cat.actualAmount || 0)}</span>
                                                                    </div>
                                                                </td>
                                                                <td colSpan={4} className="py-2.5 px-3 text-center text-[10px] text-gray-400 italic">Chưa có hạng mục chi tiết</td>
                                                            </tr>
                                                        ) : (
                                                            cat.items.map((it: any, idx: number) => {
                                                                const expectedQty = it.expectedQuantity ?? it.quantity;
                                                                return (
                                                                    <tr key={it.id} className="hover:bg-gray-50/50 transition-colors">
                                                                        <td className="py-2.5 px-3 text-[10px] font-black text-gray-400 text-center border-r border-gray-50">
                                                                            {String(idx + 1).padStart(2, '0')}
                                                                        </td>
                                                                        {idx === 0 && (
                                                                            <td rowSpan={rowSpan} className="py-2.5 px-3 border-r border-gray-50 bg-orange-50/10 align-top max-w-[150px]">
                                                                                <div className="text-[11px] font-black text-gray-800 uppercase leading-snug break-words">{cat.name}</div>
                                                                            </td>
                                                                        )}
                                                                        {idx === 0 && (
                                                                            <td rowSpan={rowSpan} className="py-2.5 px-3 border-r border-gray-50 bg-orange-50/20 align-top max-w-[150px]">
                                                                                <div className="text-[9px] font-bold text-[#ff5e14] mt-0.5 flex flex-col gap-1 bg-white p-1.5 rounded border border-orange-100 shadow-sm">
                                                                                    <span className="flex justify-between items-center"><span className="opacity-70">KH:</span> <span className="text-[10px] font-black text-blue-700">{fmt(cat.expectedAmount || 0)}</span></span>
                                                                                    <span className="flex justify-between items-center"><span className="opacity-70">TT:</span> <span className="text-[10px] font-black text-orange-700">{fmt(cat.actualAmount || 0)}</span></span>
                                                                                </div>
                                                                            </td>
                                                                        )}
                                                                        <td className="py-2.5 px-3 border-r border-gray-50">
                                                                            <div className="font-bold text-gray-800 uppercase leading-tight">{it.category}</div>
                                                                            {it.note && <div className="text-[9px] text-gray-400 mt-0.5 font-medium leading-relaxed">{it.note}</div>}
                                                                        </td>
                                                                        <td className="py-2.5 px-3 border-r border-gray-50">
                                                                            <div className="text-[10px] font-bold text-gray-700">{it.brand || '-'} <span className="font-normal text-gray-400">/</span> {it.unit || '-'}</div>
                                                                            <div className="text-[9px] text-gray-500 mt-0.5">{it.purchaseLocation || '-'}</div>
                                                                        </td>
                                                                        <td className="py-2.5 px-3 text-right bg-blue-50/10 border-r border-gray-50">
                                                                            <div className="font-bold text-blue-700 leading-none">{fmt(expectedQty * it.expectedPrice)}</div>
                                                                            <div className="text-[8px] text-gray-400 mt-1 font-medium">{expectedQty} x {fmt(it.expectedPrice)}</div>
                                                                        </td>
                                                                        <td className="py-2.5 px-3 text-right bg-orange-50/10">
                                                                            <div className="font-bold text-orange-700 leading-none">{fmt((it.actualQuantity || 0) * (it.actualPrice ?? it.price))}</div>
                                                                            <div className="text-[8px] text-gray-400 mt-1 font-medium">{it.actualQuantity || 0} x {fmt(it.actualPrice ?? it.price)}</div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </React.Fragment>
                                                );
                                            }) : (
                                                <tr><td colSpan={7} className="py-8 text-center text-[10px] text-gray-300 italic font-bold uppercase tracking-widest">Không có dữ liệu</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}

/* ══════════════════════════════ CampaignDetail ══════════════════════════════ */
function CampaignDetail({ campaign, onModalToggle }: { campaign: CampaignDto; onModalToggle?: (open: boolean) => void }) {
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [ownerName, setOwnerName] = useState<string>(`Owner #${campaign.fundOwnerId}`);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);

        const expPromise = (campaign as any).expenditures
            ? Promise.resolve((campaign as any).expenditures)
            : expenditureService.getByCampaignId(campaign.id);

        Promise.all([
            expPromise,
            userService.getUserById(campaign.fundOwnerId).then(res => res.success && res.data ? res.data.fullName : `Chủ quỹ #${campaign.fundOwnerId}`)
        ]).then(([expData, name]) => {
            setExpenditures(expData);
            setOwnerName(name);
        }).finally(() => setLoading(false));
    }, [campaign.id, campaign.fundOwnerId, (campaign as any).expenditures]);

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
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#ff5e14]/20">
                        <p className="text-[8px] font-black text-[#ff5e14]/60 uppercase tracking-widest mb-0.5">DỰ KIẾN</p>
                        <p className="font-bold text-[#ff5e14] text-[11px]">{fmt(totalExpected)}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#ff5e14]/20">
                        <p className="text-[8px] font-black text-[#ff5e14]/60 uppercase tracking-widest mb-0.5">THỰC TẾ CHI</p>
                        <p className="font-bold text-[#ff5e14] text-[11px]">{fmt(campaign.balance + totalActual)}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-50 bg-white p-2 shadow-sm text-center border-b-[#ff5e14]/20">
                        <p className="text-[8px] font-black text-[#ff5e14]/60 uppercase tracking-widest mb-0.5">DƯ</p>
                        <p className="font-black text-[#ff5e14] text-[11px]">{fmt((campaign.balance + totalActual) - totalActual)}</p>
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
                ) : expenditures.map((exp, i) => <ExpenditureRound key={exp.id} exp={exp} index={i} campaignType={campaign.type} onModalToggle={onModalToggle} />)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-50 flex-shrink-0">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Trang {currentPage + 1} / {totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        Trước
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════ Main ExpenditureTab ══════════════════════════════ */
interface ExpenditureTabProps {
    onModalToggle?: (open: boolean) => void;
}

export default function ExpenditureTab({ onModalToggle }: ExpenditureTabProps) {
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [filtered, setFiltered] = useState<CampaignDto[]>([]);
    const [selected, setSelected] = useState<CampaignDto | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const targetCampaignId = searchParams?.get('campaignId');

    useEffect(() => {
        const loadAllData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch tasks assigned to this staff
                const tasks = await campaignService.getTasksByStaff(user.id);
                const expenditureTaskIds = new Set(
                    tasks.filter(t => t.type === 'EXPENDITURE' && t.status !== 'COMPLETED').map(t => t.targetId)
                );

                // Fetch all campaigns and filter for APPROVED
                const campaignResp = await campaignService.getAll(0, 1000);
                const relevantCampaigns = (campaignResp.content || []).filter((c: CampaignDto) =>
                    c.status === 'APPROVED'
                );

                // For each relevant campaign, fetch its expenditures to check for pending stuff
                const enrichedCampaigns = await Promise.all(
                    relevantCampaigns.map(async (c: CampaignDto) => {
                        try {
                            const exps = await expenditureService.getByCampaignId(c.id);
                            // Only keep expenditures that are assigned to this staff in tasks
                            const assignedExps = exps.filter(e => expenditureTaskIds.has(e.id));

                            if (assignedExps.length === 0) return null;

                            // hasPendingReview: Có kế hoạch chi tiêu mới cần duyệt
                            // hasEvidenceReview: Có bằng chứng mới cần duyệt
                            const hasPendingReview = assignedExps.some(e => e.status === 'PENDING_REVIEW' || e.status === 'PENDING');
                            const hasEvidenceReview = assignedExps.some(e => e.evidenceStatus === 'SUBMITTED');

                            return {
                                ...c,
                                expenditures: assignedExps,
                                hasPendingReview,
                                hasEvidenceReview,
                                needsAttention: hasPendingReview || hasEvidenceReview
                            };
                        } catch (err) {
                            console.error(`Lỗi khi tải chi tiêu cho chiến dịch ${c.id}`, err);
                            return null;
                        }
                    })
                );

                // Filter out nulls
                const validCampaigns = (enrichedCampaigns.filter(Boolean) as any[]);

                // Sort: Needs attention first, then by createdAt desc
                const sorted = [...validCampaigns].sort((a: any, b: any) => {
                    if (a.needsAttention && !b.needsAttention) return -1;
                    if (!a.needsAttention && b.needsAttention) return 1;
                    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
                });

                setCampaigns(sorted);
                setFiltered(sorted);

                // If specialized campaign ID is in URL, choose that as the selected campaign
                if (targetCampaignId) {
                    const found = sorted.find(c => String(c.id) === targetCampaignId);
                    if (found) setSelected(found);
                    else if (sorted.length > 0) setSelected(sorted[0]);
                } else if (sorted.length > 0) {
                    setSelected(sorted[0]);
                }
            } catch (err) {
                toast.error('Lỗi tải danh sách chiến dịch');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadAllData();
        }
    }, [targetCampaignId, user]);

    useEffect(() => {
        let list = campaigns;
        if (statusFilter === 'PENDING') list = list.filter(c => (c as any).needsAttention);
        else if (statusFilter === 'APPROVED') list = list.filter(c => !(c as any).needsAttention);

        if (search.trim()) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
        setFiltered(list);
    }, [search, statusFilter, campaigns]);

    const types = Array.from(new Set(campaigns.map(c => c.type || '').filter(Boolean)));

    if (loading) return (
        <div className="flex h-64 items-center justify-center text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
            ĐANG TẢI...
        </div>
    );

    return (
        <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Sidebar: Campaign List */}
            <div className="w-64 flex-shrink-0 flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ff5e14,#6a8d83)' }}>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Chiến dịch thu chi</h3>
                </div>
                <div className="px-2.5 py-2.5 border-b border-gray-50 flex-shrink-0 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên chiến dịch..."
                            className="w-full pl-7 pr-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#db5945]/20 bg-gray-50/50" />
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        <button onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-[#ff5e14] text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            TẤT CẢ
                        </button>
                        <button onClick={() => setStatusFilter('PENDING')}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap ${statusFilter === 'PENDING' ? 'bg-[#db5945] text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            CHƯA DUYỆT
                        </button>
                        <button onClick={() => setStatusFilter('APPROVED')}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap ${statusFilter === 'APPROVED' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            ĐÃ DUYỆT
                        </button>
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
                        const themeColor = isTarget ? '#ff5e14' : '#db5945';
                        const themeBg = isTarget ? 'bg-[#ff5e14]' : 'bg-[#ff5e14]';

                        return (
                            <button key={c.id} onClick={() => setSelected(c)}
                                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-all ${isActive ? (isTarget ? 'bg-[#ff5e14]/10' : 'bg-[#ff5e14]/10') : 'hover:bg-gray-50/30'}`}>
                                <div className="flex items-start gap-2.5">
                                    <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${isActive ? `${themeBg} text-white shadow-sm` : 'bg-gray-100 text-gray-400'}`}>
                                        {c.title[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-[11px] font-black truncate uppercase tracking-tighter ${isActive ? (isTarget ? 'text-[#ff5e14]' : 'text-[#ff5e14]') : 'text-gray-700'}`}>{c.title}</p>
                                            {(c as any).needsAttention && (
                                                <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={`text-[8px] font-black uppercase tracking-tighter ${(c as any).needsAttention ? 'text-red-500' : 'text-gray-300'}`}>
                                                    {(c as any).needsAttention ? 'CẦN DUYỆT' : 'ĐÃ XỬ LÝ'}
                                                </span>
                                                <span className="text-[8px] font-black text-gray-200 uppercase tracking-tighter">•</span>
                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">{CAM_TYPE[c.type ?? ''] || c.type}</span>
                                            </div>
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
                    <CampaignDetail key={selected.id} campaign={selected} onModalToggle={onModalToggle} />
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
