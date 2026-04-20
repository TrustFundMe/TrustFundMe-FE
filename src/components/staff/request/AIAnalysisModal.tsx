'use client';

import React, { useEffect, useState } from 'react';
import {
    X, Sparkles, CheckCircle,
    ShieldCheck, Printer, MapPin, Phone, Mail, Hash,
    AlertTriangle, LineChart, Store, Receipt, Loader2
} from 'lucide-react';
import { ExpenditureItem, Expenditure } from '@/types/expenditure';
import { expenditureService } from '@/services/expenditureService';
import { paymentService } from '@/services/paymentService';

interface DetectedItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    matchStatus: 'MATCHED' | 'PARTIAL' | 'MISMATCHED';
    plannedCategory?: string;
    plannedAmount?: number;
    differenceAmount?: number;
}

interface AIAnalysisResult {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    recommendation: string;
    redFlags: string[];
    spendingAnalysis: string[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    vendorInfo?: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        taxId?: string;
    };
    detectedItems?: DetectedItem[];
}

interface AIAnalysisModalProps {
    result: AIAnalysisResult;
    itemsProp?: ExpenditureItem[];
    donationSummary?: Record<number, number>;
    exp?: Expenditure;
    onClose: () => void;
}

const fmtVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('vi-VN').format(v);


export default function AIAnalysisModal({
    result,
    itemsProp = [],
    donationSummary: donationSummaryProp = {},
    exp,
    onClose,
}: AIAnalysisModalProps) {
    const [items, setItems] = useState<ExpenditureItem[]>(itemsProp);
    const [loadingItems, setLoadingItems] = useState(itemsProp.length === 0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        if (!exp?.id) return;
        if (itemsProp && itemsProp.length > 0) {
            setItems(itemsProp);
            setLoadingItems(false);
        }
    }, [itemsProp, exp?.id]);

    // Fetch items if not passed from parent
    useEffect(() => {
        const targetId = exp?.id || result.expenditureId;
        if (!targetId || (itemsProp && itemsProp.length > 0)) {
            if (itemsProp) setItems(itemsProp);
            return;
        }

        const fetchItems = async () => {
            try {
                setLoadingItems(true);
                const fetched: ExpenditureItem[] = await expenditureService.getItems(targetId);
                setItems(fetched);
            } catch { /* ignore */ } finally {
                setLoadingItems(false);
            }
        };
        fetchItems();
    }, [exp?.id, itemsProp, result.expenditureId]);

    const getRiskStyles = (score: number) => {
        if (score < 30) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (score < 70) return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-rose-700 bg-rose-50 border-rose-100';
    };

    const detected: DetectedItem[] = Array.isArray(result.detectedItems) ? result.detectedItems : [];
    const redFlags: string[] = Array.isArray(result.redFlags)
        ? result.redFlags.map((f) => (typeof f === 'string' ? f : JSON.stringify(f)))
        : [];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative bg-[#fcfcfc] rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[96vh] border border-slate-200 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#111827] flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                                Hệ thống Kiểm toán AI V3.0
                            </h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                Phân tích rủi ro &amp; Đối soát thực tế
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded border-2 uppercase tracking-widest ${getRiskStyles(result.riskScore)}`}>
                            Rủi ro: {result.riskScore}%
                        </span>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 space-y-4">


                    {/* Grid: Vendor + Conclusion */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Store className="h-4 w-4 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                    Thông tin đơn vị cung cấp (Vendor)
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Tên doanh nghiệp/Cửa hàng</p>
                                    <p className="text-xs font-black text-slate-800">
                                        {result.vendorInfo?.name || 'Không xác định'}
                                    </p>
                                </div>
                                {result.vendorInfo?.taxId && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Mã số thuế</p>
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Hash className="h-3 w-3" /> {result.vendorInfo.taxId}
                                        </p>
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Địa chỉ</p>
                                    <p className="text-xs font-medium text-slate-600 flex items-start gap-1.5">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
                                        {result.vendorInfo?.address || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Liên hệ</p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        {result.vendorInfo?.phone && (
                                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                                <Phone className="h-3 w-3 text-slate-400" />
                                                {result.vendorInfo.phone}
                                            </span>
                                        )}
                                        {result.vendorInfo?.email && (
                                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                                <Mail className="h-3 w-3 text-slate-400" />
                                                {result.vendorInfo.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl bg-[#1e293b] text-white shadow-md border border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kết luận kiểm toán</p>
                                </div>
                                <p className="text-xs font-black leading-relaxed mb-3">{result.recommendation}</p>
                                <div className="h-px bg-slate-700 my-2" />
                                <p className="text-[11px] text-slate-300 italic opacity-80 leading-relaxed">
                                    &ldquo;{result.summary}&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Red Flags + AI Detection stack vertically or adjusted grid */}
                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <AlertTriangle className="h-4 w-4 text-rose-500" />
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                    Cảnh báo vi phạm &amp; Nghi vấn ({redFlags.length})
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {redFlags.length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic px-2">Không phát hiện dấu hiệu vi phạm</p>
                                )}
                                {redFlags.map((flag, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/30 flex items-start gap-2 hover:bg-rose-50 transition-colors">
                                        <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5 shrink-0" />
                                        <p className="text-[11px] font-bold text-rose-900 leading-snug">{flag}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <LineChart className="h-4 w-4 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Đối soát dữ liệu bóc tách từ AI ({detected.length} hạng mục)
                                </p>
                            </div>
                            {detected.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic p-4 text-center bg-white rounded-xl border border-slate-100">
                                    Không có dữ liệu bóc tách
                                </p>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-[#F8FAFC] border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-8 text-center border-r border-slate-100">#</th>
                                                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Hàng hóa kê khai</th>
                                                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">Đã chi (Database)</th>
                                                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Bóc tách từ hóa đơn</th>
                                                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center">Chênh lệch</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {detected
                                                .filter(item => {
                                                    const sItem = items.find(i => {
                                                        const s1 = (i.category || '').toLowerCase().trim();
                                                        const s2 = (item.plannedCategory || '').toLowerCase().trim();
                                                        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                                    });
                                                    const sTotal = sItem ? (sItem.actualQuantity ?? sItem.quantity ?? 0) * (sItem.price || 0) : 0;
                                                    return sTotal > 0 || (item.total || 0) > 0;
                                                })
                                                .map((item, idx) => {
                                                    const sysItem = items.find(i => {
                                                        const s1 = (i.category || '').toLowerCase().trim();
                                                        const s2 = (item.plannedCategory || '').toLowerCase().trim();
                                                        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                                    });
                                                    const sysTotal = sysItem ? (sysItem.actualQuantity ?? sysItem.quantity ?? 0) * (sysItem.price || 0) : 0;

                                                    const diff = sysTotal > 0 ? sysTotal - item.total : (item.differenceAmount !== undefined ? Number(item.differenceAmount) : 0);
                                                    const isTotalMatch = Math.abs(diff) < 100;

                                                    const matchLabel = item.matchStatus === 'MATCHED' ? 'KHỚP' : item.matchStatus === 'PARTIAL' ? 'XEM XÉT' : 'SAI LỆCH';
                                                    const matchStyle = item.matchStatus === 'MATCHED'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : item.matchStatus === 'PARTIAL'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                        : 'bg-rose-50 text-rose-700 border-rose-100';

                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                                            <td className="px-3 py-3 text-center text-[10px] font-black text-slate-400 border-r border-slate-50">{idx + 1}</td>
                                                            <td className="px-3 py-3 border-r border-slate-50">
                                                                <div className="font-bold text-slate-800 leading-tight">{item.plannedCategory || 'Chưa xác định'}</div>
                                                            </td>
                                                            <td className="px-3 py-3 text-center border-r border-slate-50">
                                                                {sysItem ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="text-[10px] text-slate-500">
                                                                            {sysItem.actualQuantity ?? sysItem.quantity} x {fmtNum(sysItem.price)}
                                                                        </div>
                                                                        <div className="text-[11px] font-black text-blue-700 tabular-nums">
                                                                            {fmtVND(sysTotal)}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center font-bold text-slate-300 tabular-nums italic text-[9px]">
                                                                        Không có trong DB
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-50">
                                                                <div className="font-bold text-slate-800 leading-tight">{item.name || '—'}</div>
                                                                <div className="text-[10px] text-slate-500 mt-1">
                                                                    {item.quantity > 0 ? `${item.quantity} x ${fmtNum(item.unitPrice)} = ${fmtVND(item.total)}` : '—'}
                                                                </div>
                                                                {(item as any).marketCheck && (item as any).marketCheck !== 'Bình thường' && (
                                                                    <div className="mt-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100/50 inline-block">
                                                                        ⚠️ {(item as any).marketCheck}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <div className={`font-black text-[10px] tabular-nums ${isTotalMatch ? 'text-emerald-500' : 'text-rose-600'}`}>
                                                                    {diff !== 0 ? (diff > 0 ? '+' : '') : ''}{fmtVND(diff)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                        <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                                            {(() => {
                                                const sysTotalSum = detected.reduce((acc, item) => {
                                                    const sItem = items.find(i => {
                                                        const s1 = (i.category || '').toLowerCase().trim();
                                                        const s2 = (item.plannedCategory || '').toLowerCase().trim();
                                                        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                                    });
                                                    return acc + (sItem ? (sItem.actualQuantity ?? sItem.quantity ?? 0) * (sItem.price || 0) : 0);
                                                }, 0);
                                                const aiTotalSum = detected.reduce((acc, item) => acc + (item.total || 0), 0);
                                                const isMismatch = Math.abs(sysTotalSum - aiTotalSum) > 10000;

                                                return (
                                                    <tr className="font-black text-slate-800">
                                                        <td colSpan={2} className="px-3 py-3 text-right uppercase text-[9px] tracking-widest border-r border-slate-200">
                                                            <span>Tổng cộng (Verify)</span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center border-r border-slate-200 text-blue-700 text-xs tabular-nums">
                                                            {fmtVND(sysTotalSum)}
                                                        </td>
                                                        <td className={`px-3 py-3 text-left border-r border-slate-200 text-xs tabular-nums ${isMismatch ? 'text-rose-600' : 'text-slate-800'}`}>
                                                            {fmtVND(aiTotalSum)}
                                                        </td>
                                                        <td className={`px-3 py-3 text-center text-xs tabular-nums ${Math.abs(sysTotalSum - aiTotalSum) < 100 ? 'text-emerald-500' : 'text-rose-600'}`}>
                                                            {sysTotalSum - aiTotalSum !== 0 ? (sysTotalSum - aiTotalSum > 0 ? '+' : '') : ''}{fmtVND(sysTotalSum - aiTotalSum)}
                                                        </td>
                                                    </tr>
                                                );
                                            })()}
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Audit System Protocol &bull; TrustFundMe Platform
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium italic">
                            Báo cáo dựa trên đối soát thực tế ảnh hóa đơn và kế hoạch chi tiêu.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => window.print()}
                            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all text-[10px] font-black uppercase"
                        >
                            <Printer className="h-3.5 w-3.5" /> In báo cáo
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 h-9 rounded-lg bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            Xác nhận &amp; Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
