'use client';

import React, { useEffect, useState } from 'react';
import {
    X, Sparkles, CheckCircle,
    ShieldCheck, Printer, MapPin, Phone, Mail, Hash,
    AlertTriangle, LineChart, Store, Loader2
} from 'lucide-react';
import { ExpenditureItem, Expenditure } from '@/types/expenditure';
import { expenditureService } from '@/services/expenditureService';

interface DetectedItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    matchStatus: 'MATCHED' | 'PARTIAL' | 'MISMATCHED';
    plannedCategory?: string;
    plannedAmount?: number;
    differenceAmount?: number;
    marketUnitPrice?: number;
    marketPriceRange?: string;
    unit?: string;
    evidenceUrls?: string[];
    statusMessage?: string;
}

interface AIAnalysisResult {
    expenditureId?: number;
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
    mode?: 'plan' | 'evidence';
    onClose: () => void;
}

const fmtVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export default function AIAnalysisModal({
    result,
    itemsProp = [],
    exp,
    mode = 'evidence',
    onClose,
}: AIAnalysisModalProps) {
    const [items, setItems] = useState<ExpenditureItem[]>(itemsProp);
    const [loadingItems, setLoadingItems] = useState(itemsProp.length === 0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        const targetId = exp?.id || result.expenditureId;
        if (!targetId || itemsProp.length > 0) {
            setItems(itemsProp);
            setLoadingItems(false);
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
                                Hệ thống Kiểm toán AI V3.0 {mode === 'plan' ? '(KẾ HOẠCH)' : '(MINH CHỨNG)'}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                {mode === 'plan' ? 'Thẩm định tính hợp lý của kế hoạch' : 'Đối soát thực tế & Minh chứng'}
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
                    {/* Grid: Vendor (if exists) + Conclusion */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Store className="h-4 w-4 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                    {mode === 'plan' ? 'Thông tin dự kiến (Kế hoạch)' : 'Thông tin đơn vị cung cấp (Vendor)'}
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
                            <div className="p-4 rounded-xl bg-[#1e293b] text-white shadow-md border border-slate-800 h-full">
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

                    {/* Red Flags */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                Cảnh báo vi phạm &amp; Nghi vấn ({redFlags.length})
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {redFlags.length === 0 && (
                                <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-center justify-center col-span-full">
                                    <p className="text-[10px] text-slate-400 italic">Không phát hiện dấu hiệu vi phạm</p>
                                </div>
                            )}
                            {redFlags.map((flag, idx) => (
                                <div key={idx} className="p-3 rounded-lg border border-rose-100 bg-rose-50/50 flex items-start gap-2 hover:bg-rose-100/50 transition-colors">
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] font-black text-rose-900 leading-snug">{flag}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <LineChart className="h-4 w-4 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {mode === 'plan' ? 'Phân tích chênh lệch với giá thị trường' : 'Đối soát dữ liệu Hệ thống vs. Hóa đơn'}
                            </p>
                        </div>
                        {loadingItems ? (
                            <div className="h-40 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang tải dữ liệu gốc...</p>
                            </div>
                        ) : detected.length === 0 ? (
                            <div className="p-10 text-center bg-white rounded-xl border border-slate-100">
                                <p className="text-[11px] text-slate-400 italic">Không có dữ liệu bóc tách được từ hình ảnh/nội dung</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-[#F8FAFC] border-b border-slate-200">
                                        <tr>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-8 text-center border-r border-slate-100">#</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Hàng hóa / Ghi chú</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Nhãn hiệu / Đơn vị / Nơi mua</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">
                                                {mode === 'plan' ? 'Kế hoạch (Dự kiến)' : 'Hệ thống (Database)'}
                                            </th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">
                                                {mode === 'plan' ? 'Thẩm định (Giá thị trường)' : 'Bóc tách từ hóa đơn'}
                                            </th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center">Lệch</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {detected.map((item, idx) => {
                                            const sysItem = items.find(i => {
                                                const s1 = (i.category || '').toLowerCase().trim();
                                                const s2 = (item.plannedCategory || item.name || '').toLowerCase().trim();
                                                return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                            });

                                            const sysQty = sysItem ? (sysItem.expectedQuantity || sysItem.quantity || 1) : 1;
                                            const sysPrice = sysItem ? (sysItem.expectedPrice || 0) : 0;
                                            const sysVal = sysItem ? (mode === 'plan' ? (sysQty * sysPrice) : (sysItem.actualQuantity || 0) * (sysItem.price || 0)) : 0;

                                            // Handle "Product Not Found" case
                                            const isPNF = item.marketUnitPrice === -1 || item.statusMessage === 'Sản phẩm không tồn tại';
                                            const diff = sysVal - item.total;
                                            const isMatch = Math.abs(diff) < 500;

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-3 py-3 text-center text-[10px] font-black text-slate-400 border-r border-slate-50">{idx + 1}</td>
                                                    <td className="px-3 py-3 border-r border-slate-50">
                                                        <div className="font-bold text-slate-800 leading-tight uppercase">{item.plannedCategory || item.name}</div>
                                                        {sysItem?.note && <div className="text-[9px] text-slate-500 font-medium mt-1 uppercase italic opacity-70">{sysItem.note}</div>}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-50">
                                                        <div className="text-[10px] font-bold text-slate-700">
                                                            {sysItem?.brand || '-'} <span className="font-normal text-slate-300">/</span> {sysItem?.unit || '-'}
                                                        </div>
                                                        <div className="text-[9px] text-slate-500 font-medium mt-0.5">{sysItem?.purchaseLocation || '-'}</div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center border-r border-slate-50">
                                                        <div className="text-[11px] font-black text-blue-700 tabular-nums">{fmtVND(sysVal)}</div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                                            {sysItem ? (mode === 'plan' ? `${sysQty} x ${fmtNum(sysPrice)}` : `${sysItem.actualQuantity || 0} x ${fmtNum(sysItem.price || 0)}`) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-50">
                                                        <div className={`font-black text-[11px] tabular-nums ${isPNF ? 'text-rose-600' : 'text-slate-800'}`}>
                                                            {isPNF ? 'KHÔNG THỂ KIỂM TRA GIÁ' : fmtVND(item.total)}
                                                        </div>
                                                        {!isPNF && (
                                                            <div className={`text-[8px] font-bold uppercase mt-0.5 ${mode === 'plan' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                                {`${item.quantity || 1} x ${fmtNum(item.unitPrice)}`}
                                                            </div>
                                                        )}
                                                        {item.statusMessage && (
                                                            <div className={`mt-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block border ${item.statusMessage === 'Sản phẩm không tồn tại'
                                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                                : item.statusMessage === 'Giá bất thường'
                                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                                    : item.statusMessage === 'Thiếu thông tin phân loại'
                                                                        ? 'bg-slate-50 text-slate-600 border-slate-200'
                                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                }`}>
                                                                {item.statusMessage}
                                                            </div>
                                                        )}
                                                        {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {item.evidenceUrls.map((url, uidx) => (
                                                                    <a key={uidx} href={url} target="_blank" rel="noopener noreferrer"
                                                                        className="inline-flex items-center text-[8px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 px-1 py-0.5 rounded border border-indigo-100 transition-colors">
                                                                        [{uidx + 1}] Nguồn AI tìm được
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <div className={`font-black text-[10px] tabular-nums ${isPNF ? 'text-slate-400' : (isMatch ? 'text-emerald-500' : 'text-rose-600')}`}>
                                                            {isPNF ? '—' : (diff !== 0 ? (diff > 0 ? '+' : '') : '') + fmtVND(diff)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                        {(() => {
                                            const totalSys = detected.reduce((acc, item) => {
                                                const sysItem = items.find(i => {
                                                    const s1 = (i.category || '').toLowerCase().trim();
                                                    const s2 = (item.plannedCategory || item.name || '').toLowerCase().trim();
                                                    return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                                });
                                                const sysQty = sysItem ? (sysItem.expectedQuantity || sysItem.quantity || 1) : 1;
                                                const sysPrice = sysItem ? (sysItem.expectedPrice || 0) : 0;
                                                return acc + (sysItem ? (mode === 'plan' ? (sysQty * sysPrice) : (sysItem.actualQuantity || 0) * (sysItem.price || 0)) : 0);
                                            }, 0);
                                            const totalAI = detected.reduce((acc, item) => {
                                                const isPNF = item.marketUnitPrice === -1 || item.statusMessage === 'Sản phẩm không tồn tại';
                                                return acc + (isPNF ? 0 : item.total);
                                            }, 0);
                                            const diffTotal = totalSys - totalAI;

                                            return (
                                                <tr className="font-black text-slate-800">
                                                    <td colSpan={3} className="px-3 py-3 text-right uppercase text-[9px] tracking-widest border-r border-slate-200">
                                                        <span>Tổng cộng đối soát:</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center border-r border-slate-200 text-blue-700 text-xs tabular-nums">{fmtVND(totalSys)}</td>
                                                    <td className="px-3 py-3 text-left border-r border-slate-200 text-slate-800 text-xs tabular-nums">{fmtVND(totalAI)}</td>
                                                    <td className={`px-3 py-3 text-center text-xs tabular-nums ${Math.abs(diffTotal) < 1000 ? 'text-emerald-500' : 'text-rose-600'}`}>
                                                        {diffTotal !== 0 ? (diffTotal > 0 ? '+' : '') : ''}{fmtVND(diffTotal)}
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

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Transparency Audit Protocol &bull; TrustFundMe AI Center
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium italic">
                            Báo cáo phân tích dựa trên {mode === 'plan' ? 'kế hoạch dự kiến' : 'minh chứng thực tế'}.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => window.print()}
                            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all text-[10px] font-black uppercase"
                        >
                            <Printer className="h-3.5 w-3.5" /> In
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 h-9 rounded-lg bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            Đã xem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
