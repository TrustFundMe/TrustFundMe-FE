'use client';

import React, { useEffect, useState } from 'react';
import {
    X, Sparkles, CheckCircle,
    ShieldCheck, Printer, LineChart, Store, Loader2, AlertTriangle
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
    priceRangeMin?: number;
    priceRangeMax?: number;
    productExists?: boolean;
    productExistsByBrand?: boolean;
    unit?: string;
    evidenceUrls?: string[];
    statusMessage?: string;
    isLinkMatched?: boolean;
    linkType?: string;
    expectedPurchaseLink?: string;
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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

            {/* Popup cố định, không scroll toàn trang */}
            <div
                className="relative bg-[#fcfcfc] rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col"
                style={{ height: '90vh', maxHeight: '90vh' }}
            >
                {/* Header - cố định */}
                <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-white rounded-t-xl">
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

                {/* Body - flex column, không scroll ngoài */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 p-4 gap-3">

                    {/* BẢNG PHÂN TÍCH - ở trên cùng, chỉ scroll bên trong bảng */}
                    <div className="flex flex-col flex-1 min-h-0 gap-1.5">
                        <div className="flex items-center gap-2 px-1 flex-shrink-0">
                            <LineChart className="h-3.5 w-3.5 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {mode === 'plan' ? 'Phân tích chênh lệch với giá thị trường' : 'Đối soát dữ liệu Hệ thống vs. Hóa đơn'}
                            </p>
                        </div>

                        {loadingItems ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang tải dữ liệu gốc...</p>
                            </div>
                        ) : detected.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-100">
                                <p className="text-[11px] text-slate-400 italic">Không có dữ liệu bóc tách được từ hình ảnh/nội dung</p>
                            </div>
                        ) : (
                            /* Chỉ scroll trong bảng */
                            <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-[#F8FAFC] border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-8 text-center border-r border-slate-100">#</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Hàng hóa / Ghi chú</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Nhãn hiệu / Đơn vị</th>
                                            <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Địa điểm mua (AI Audit)</th>
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
                                                const s1 = (i.name || '').toLowerCase().trim();
                                                const s2 = (item.plannedCategory || item.name || '').toLowerCase().trim();
                                                return s1 === s2 || s1.includes(s2) || s2.includes(s1);
                                            });

                                            const sysQty = sysItem ? (sysItem.expectedQuantity || sysItem.quantity || 1) : 1;
                                            const sysPrice = sysItem ? (sysItem.expectedPrice || 0) : 0;
                                            const sysVal = sysItem ? (mode === 'plan' ? (sysQty * sysPrice) : (sysItem.actualQuantity || 0) * (sysItem.price || 0)) : 0;

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
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-50">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-[9px] text-slate-500 font-medium">{sysItem?.purchaseLocation || '-'}</div>
                                                            {item.expectedPurchaseLink && (
                                                                <a
                                                                    href={item.expectedPurchaseLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                                                                >
                                                                    <Store className="h-2.5 w-2.5" />
                                                                    Chi tiết địa điểm
                                                                </a>
                                                            )}
                                                            {item.linkType && (
                                                                <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full w-fit flex items-center gap-1 ${item.isLinkMatched ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                                    {item.isLinkMatched ? <ShieldCheck className="h-2 w-2" /> : <AlertTriangle className="h-2 w-2" />}
                                                                    {item.linkType} • {item.isLinkMatched ? 'KHỚP' : 'KO KHỚP'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center border-r border-slate-50">
                                                        <div className="text-[11px] font-black text-blue-700 tabular-nums">{fmtVND(sysVal)}</div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                                            {sysItem ? (mode === 'plan' ? `${sysQty} x ${fmtNum(sysPrice)}` : `${sysItem.actualQuantity || 0} x ${fmtNum(sysItem.price || 0)}`) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-50">
                                                        {isPNF ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-black text-rose-600 uppercase">Không kiểm tra được</span>
                                                                {item.productExists === false && <span className="text-[8px] text-rose-400">Sản phẩm không tồn tại</span>}
                                                                {item.productExistsByBrand === false && <span className="text-[8px] text-amber-500">Brand không có sản phẩm này</span>}
                                                                {item.statusMessage && <span className="text-[8px] text-slate-400 italic">{item.statusMessage}</span>}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="font-black text-[11px] tabular-nums text-slate-800">{fmtVND(item.total)}</div>
                                                                <div className="text-[8px] font-bold text-slate-500">{item.quantity || 1} x {fmtNum(item.unitPrice)}</div>
                                                                {(item.priceRangeMin != null && item.priceRangeMax != null && item.priceRangeMin > 0) && (
                                                                    <div className="text-[8px] text-indigo-500 font-bold">
                                                                        Khoảng: {fmtVND(item.priceRangeMin)} – {fmtVND(item.priceRangeMax)}
                                                                    </div>
                                                                )}
                                                                {item.marketPriceRange && (
                                                                    <div className="text-[8px] text-slate-400 italic">{item.marketPriceRange}</div>
                                                                )}
                                                                {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                                        {item.evidenceUrls.map((url, uidx) => (
                                                                            <a key={uidx} href={url} target="_blank" rel="noopener noreferrer"
                                                                                className="inline-flex items-center text-[8px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-1 py-0.5 rounded border border-indigo-100 transition-colors">
                                                                                [{uidx + 1}] Nguồn
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {isPNF ? (
                                                            <span className="text-slate-300 text-[10px]">—</span>
                                                        ) : (
                                                            <div className={`font-black text-[10px] tabular-nums ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                {fmtVND(Math.abs(diff))}
                                                                <div className="text-[8px] font-bold mt-0.5">{diff > 0 ? 'Dự kiến lố' : diff < 0 ? 'Dư thẩm định' : 'Khớp'}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 sticky bottom-0">
                                        {(() => {
                                            const totalSys = detected.reduce((acc, item) => {
                                                const sysItem = items.find(i => {
                                                    const s1 = (i.name || '').toLowerCase().trim();
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
                                                    <td className="px-3 py-3 border-r border-slate-200 text-blue-700 text-xs tabular-nums">
                                                        <div className="font-black">{fmtVND(totalSys)}</div>
                                                        <div className="text-[8px] font-bold text-blue-400 uppercase">{mode === 'plan' ? 'Kế hoạch' : 'Hệ thống'}</div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-slate-200 text-slate-800 text-xs tabular-nums">
                                                        <div className="font-black">{fmtVND(totalAI)}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Thẩm định AI</div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center text-xs tabular-nums">
                                                        <div className={`font-black ${diffTotal > 0 ? 'text-rose-600' : diffTotal < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {fmtVND(Math.abs(diffTotal))}
                                                        </div>
                                                        <div className={`text-[8px] font-bold uppercase ${diffTotal > 0 ? 'text-rose-400' : diffTotal < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                            {diffTotal > 0 ? 'Kế hoạch lố' : diffTotal < 0 ? 'Dư thẩm định' : 'Khớp'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* KẾT LUẬN KIỂM TOÁN - ngang bảng, full width, cố định dưới */}
                    <div className="flex-shrink-0 py-2 px-4 rounded-xl bg-[#1e293b] text-white shadow-md border border-slate-800 flex gap-4 items-center">
                        <div className="flex flex-col items-center flex-shrink-0 text-center">
                            <CheckCircle className="h-5 w-5 text-emerald-400 mb-0.5" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-[1]" style={{ marginBottom: 0 }}>Kết luận</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-[1]">Kiểm toán</p>
                        </div>
                        <div className="w-px self-stretch bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-xs font-black leading-snug">{result.recommendation}</p>
                            <p className="text-[10px] text-slate-300 italic opacity-80 leading-snug">&ldquo;{result.summary}&rdquo;</p>
                        </div>
                    </div>
                </div>

                {/* Footer - cố định */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4 flex-shrink-0 rounded-b-xl">
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
