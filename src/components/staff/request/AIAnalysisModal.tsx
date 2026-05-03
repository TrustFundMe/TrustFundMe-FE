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
    priceStatus?: 'MATCHED' | 'OVERPRICED' | 'UNDERPRICED';
    deviationPercentage?: number;
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
    geographicEvidenceUrl?: string;
    logisticsScore?: number;
    vendorTrustScore?: number;
    geographicContextSummary?: string;
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
    isBill?: boolean;
    isElectronicInvoice?: boolean;
    invoiceLookupLink?: string;
    vendorTaxCode?: string;
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

    // 🔍 DEBUG — mở F12 > Console để xem
    console.group('[AIAudit] Raw result from backend');
    console.log('Full result object:', result);
    console.log('detectedItems:', result.detectedItems);
    console.log('detectedItems count:', detected.length);
    console.log('summary:', result.summary);
    console.log('recommendation:', result.recommendation);
    console.groupEnd();

    // Split Rendering based on mode to provide a dedicated, stunning Evidence UI
    const renderPlanMode = () => (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 p-4 gap-3">
            {/* BẢNG PHÂN TÍCH - KẾ HOẠCH */}
            <div className="flex flex-col flex-1 min-h-0 gap-1.5">
                <div className="flex items-center gap-2 px-1 flex-shrink-0">
                    <LineChart className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Phân tích chênh lệch với giá thị trường
                    </p>
                </div>

                {loadingItems ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                        <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang tải dữ liệu gốc...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-100">
                        <p className="text-[11px] text-slate-400 italic">Không có dữ liệu mặt hàng trong kế hoạch này.</p>
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
                                        Kế hoạch (Dự kiến)
                                    </th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">
                                        Thẩm định (Giá thị trường)
                                    </th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center">Lệch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((sysItem, idx) => {
                                    // Find matching AI analysis for this DB item
                                    const aiItem = detected.find(d => {
                                        const s1 = (sysItem.name || '').toLowerCase().trim();
                                        const dName = (d.name || '').toLowerCase().trim();
                                        const dCat = (d.plannedCategory || '').toLowerCase().trim();
                                        return (dName && (s1 === dName || s1.includes(dName) || dName.includes(s1))) ||
                                            (dCat && (s1 === dCat || s1.includes(dCat) || dCat.includes(s1)));
                                    });

                                    const sysQty = sysItem.expectedQuantity || 1;
                                    const sysPrice = sysItem.expectedPrice || 0;
                                    const sysVal = sysQty * sysPrice;

                                    const isPNF = aiItem?.marketUnitPrice === -1 || aiItem?.statusMessage === 'Sản phẩm không tồn tại';
                                    const diff = aiItem && !isPNF ? sysVal - aiItem.total : null;

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-3 py-3 text-center text-[10px] font-black text-slate-400 border-r border-slate-50">{idx + 1}</td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="font-bold text-slate-800 leading-tight uppercase">{sysItem.name}</div>
                                                {sysItem.expectedNote && <div className="text-[9px] text-slate-500 font-medium mt-1 uppercase italic opacity-70">{sysItem.expectedNote}</div>}
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="text-[10px] font-bold text-slate-700">
                                                    {sysItem.expectedBrand || '-'} <span className="font-normal text-slate-300">/</span> {sysItem.expectedUnit || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[9px] text-slate-500 font-medium">{sysItem.expectedPurchaseLocation || '-'}</div>
                                                    {sysItem.expectedPurchaseLink && (
                                                        <a href={sysItem.expectedPurchaseLink} target="_blank" rel="noopener noreferrer"
                                                            className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-1">
                                                            <Store className="h-2.5 w-2.5" /> Link dự kiến mua
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center border-r border-slate-50">
                                                <div className="text-[11px] font-black text-blue-700 tabular-nums">{fmtVND(sysVal)}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                                    {`${sysQty} x ${fmtNum(sysPrice)}`}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50 min-w-[200px]">
                                                {!aiItem ? (
                                                    <div className="text-[9px] text-slate-300 italic">Chưa có dữ liệu AI</div>
                                                ) : isPNF ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-rose-600 uppercase">Không kiểm tra được</span>
                                                        {aiItem.statusMessage && <span className="text-[8px] text-slate-400 italic font-medium">{aiItem.statusMessage}</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-black text-[11px] tabular-nums text-slate-800">{fmtVND(aiItem.total)}</div>
                                                        </div>
                                                        <div className="text-[8px] font-bold text-slate-500">{aiItem.quantity || 1} x {fmtNum(aiItem.unitPrice || 0)}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {!aiItem || isPNF ? (
                                                    <span className="text-slate-300 text-[10px]">—</span>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className={`font-black text-[10px] tabular-nums ${diff! > 0 ? 'text-rose-600' : diff! < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {fmtVND(Math.abs(diff!))}
                                                        </div>
                                                        {aiItem.priceStatus && (
                                                            <div className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${aiItem.priceStatus.includes('MATCHED') ? 'bg-emerald-50 text-emerald-600' : aiItem.priceStatus.includes('OVERPRICED') ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {aiItem.priceStatus}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Tfoot logic for Plan */}
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200 sticky bottom-0">
                                <tr className="font-black text-slate-800">
                                    <td colSpan={6} className="px-3 py-3 text-right uppercase text-[9px] tracking-widest">
                                        Vui lòng xem chi tiết ở trên
                                    </td>
                                    <td></td>
                                </tr>
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
    );

    // Dịch vụ render UI độc lập cho Mảng EVIDENCE - ĐẸP, PREMIUM VÀ TẬP TRUNG
    const renderEvidenceMode = () => (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-4 gap-4">

            {/* CẢNH BÁO NẾU ẢNH KHÔNG PHẢI LÀ HÓA ĐƠN */}
            {result.isBill === false && (
                <div className="flex-shrink-0 p-4 rounded-2xl border-2 bg-rose-50 border-rose-200 flex flex-col justify-center relative overflow-hidden shadow-sm">
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-black text-rose-700 uppercase tracking-tight">Cảnh Báo Nài! Hình Ảnh Không Hợp Lệ</h4>
                            <p className="text-[11px] text-rose-600 font-medium leading-relaxed mt-1">
                                Hệ thống AI Vision nhận diện ảnh tải lên <strong className="font-black">KHÔNG PHẢI</strong> là hóa đơn hoặc chứng từ mua bán hợp lệ. Đây có thể là ảnh phong cảnh, ảnh chụp màn hình linh tinh. Yêu cầu tải lại ảnh hóa đơn thật.
                            </p>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <AlertTriangle className="h-32 w-32 text-rose-900" />
                    </div>
                </div>
            )}

            {/* BẢNG ĐỐI SOÁT CHI TIẾT - EVIDENCE */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Ma Trận Đối Soát 1-1 (Reconciliation Matrix)</h3>
                </div>

                {loadingItems ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-medium">
                        Không có dữ liệu hệ thống để đối soát.
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-10 text-center border-b border-slate-200">#</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 w-1/3">Hạng Mục</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Hệ Thống Phê Duyệt</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Bóc Tách Hóa Đơn</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 w-1/5 text-center">Kết quả Khớp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((sysItem, idx) => {
                                    // Match AI item
                                    const aiItem = detected.find(d => {
                                        const s1 = (sysItem.name || '').toLowerCase().trim();
                                        const dName = (d.name || '').toLowerCase().trim();
                                        return dName && (s1 === dName || s1.includes(dName) || dName.includes(s1));
                                    });

                                    const sysQty = sysItem.actualQuantity || 0;
                                    const sysPrice = sysItem.actualPrice || 0;
                                    const sysVal = sysQty * sysPrice;

                                    const aiQty = aiItem?.quantity || 0;
                                    const aiPrice = aiItem?.unitPrice || 0;
                                    const aiVal = aiItem?.total || 0;

                                    const isMatched = aiItem && (sysVal === aiVal || Math.abs(sysVal - aiVal) < 1000);

                                    return (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-4 py-4 text-center text-[11px] font-black text-slate-400 group-hover:text-blue-500">{idx + 1}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-12 text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-center">Hệ Thống</span>
                                                        <span className="text-xs font-black text-slate-800">{sysItem.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-12 text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded text-center border border-indigo-100">Hóa Đơn</span>
                                                        <span className="text-[11px] font-bold text-indigo-700">{aiItem ? aiItem.name : <em className="text-slate-400 font-normal">Không tìm thấy trên Bill</em>}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right align-top pt-5">
                                                <div className="text-xs font-black text-slate-800 tabular-nums">{fmtVND(sysVal)}</div>
                                                <div className="text-[9px] font-bold text-slate-500 tabular-nums mt-0.5">{sysQty} x {fmtNum(sysPrice)} đ</div>
                                            </td>
                                            <td className="px-4 py-4 text-right align-top pt-5">
                                                {aiItem ? (
                                                    <>
                                                        <div className="text-xs font-black text-slate-800 tabular-nums">{fmtVND(aiVal)}</div>
                                                        <div className="text-[9px] font-bold text-slate-500 tabular-nums mt-0.5">{aiQty} x {fmtNum(aiPrice)} đ</div>
                                                    </>
                                                ) : <span className="text-[10px] text-slate-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 text-center align-middle">
                                                {!aiItem ? (
                                                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded border border-slate-200">
                                                        Thiếu sót
                                                    </span>
                                                ) : isMatched ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase rounded shadow-sm">
                                                        <CheckCircle className="h-3 w-3" /> Trùng khớp
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-block px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase rounded shadow-sm">
                                                            Lệch giá trị
                                                        </span>
                                                        <span className="text-[10px] font-black text-rose-500 tabular-nums">
                                                            {sysVal > aiVal ? '-' : '+'}{fmtVND(Math.abs(sysVal - aiVal))}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* XÁC MINH HÓA ĐƠN ĐIỆN TỬ -> THAY THẾ KẾT LUẬN KIỂM TOÁN TẠI ĐÂY */}
            <div className={`flex-shrink-0 py-3 px-5 rounded-2xl shadow-xl flex items-center justify-between mt-2 border relative overflow-hidden transition-all ${result.isElectronicInvoice
                    ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 border-indigo-500 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                <div className="flex items-center gap-4 relative z-10 w-full">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${result.isElectronicInvoice ? 'bg-indigo-500/40 border border-indigo-400' : 'bg-slate-100 border border-slate-200'
                        }`}>
                        <Sparkles className={`h-6 w-6 ${result.isElectronicInvoice ? 'text-indigo-100' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <h4 className={`text-sm font-black uppercase tracking-tight ${result.isElectronicInvoice ? 'text-white' : 'text-slate-700'}`}>
                            {result.isElectronicInvoice ? 'HÓA ĐƠN ĐIỆN TỬ (CÓ MÃ XÁC THỰC)' : 'HÓA ĐƠN BÁN LẺ THUẦN (KHÔNG ĐIỆN TỬ)'}
                        </h4>
                        <p className={`text-[11px] font-medium mt-0.5 ${result.isElectronicInvoice ? 'text-indigo-200' : 'text-slate-500'}`}>
                            Mã số Thuế nhà cung cấp: <strong className="font-black text-xs tabular-nums">{result.vendorTaxCode || result.vendorInfo?.taxId || 'N/A'}</strong>
                        </p>
                    </div>

                    {result.isElectronicInvoice && result.invoiceLookupLink ? (
                        <a href={result.invoiceLookupLink} target="_blank" rel="noopener noreferrer"
                            className="bg-white text-indigo-700 hover:bg-slate-50 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 flex-shrink-0">
                            <Sparkles className="h-4 w-4" /> Link Tra cứu Hợp pháp
                        </a>
                    ) : (
                        <div className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${result.isElectronicInvoice ? 'bg-indigo-800 text-indigo-300' : 'bg-slate-100 text-slate-400'}`}>
                            Không có link tra cứu
                        </div>
                    )}
                </div>

                {/* Decorative background overlay */}
                {result.isElectronicInvoice && (
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-bottom border-l border-white/10 pointer-events-none" />
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px]" onClick={onClose} />

            <div
                className="relative bg-[#fdfdfd] rounded-2xl shadow-2xl w-full max-w-6xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
                style={{ height: '94vh', maxHeight: '94vh' }}
            >
                {/* Header - cố định */}
                <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-20 relative">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md flex items-center justify-center text-white">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                Hệ thống Kiểm toán AI V4.0 {mode === 'plan' ? '(KẾ HOẠCH)' : '(MINH CHỨNG)'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                {mode === 'plan' ? 'Thẩm định tính hợp lý của kế hoạch' : 'Đối soát chi tiết Hóa Đơn vs Dữ liệu Hệ Thống'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-black px-4 py-1.5 rounded-lg border-2 uppercase tracking-widest shadow-sm ${getRiskStyles(result.riskScore)}`}>
                            Mức Rủi ro: {result.riskScore}%
                        </span>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shadow-inner">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* GỌI GIAO DIỆN TÙY VÀO MODE */}
                {mode === 'plan' ? renderPlanMode() : renderEvidenceMode()}

                {/* Footer - cố định */}
                <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4 flex-shrink-0 z-20 relative">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-shadow-sm">
                            Transparency Audit Protocol &bull; TrustFundMe AI Center
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium italic">
                            Báo cáo phân tích dựa trên {mode === 'plan' ? 'kế hoạch dự kiến' : 'minh chứng thực tế'}.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => window.print()}
                            className="h-10 px-5 rounded-xl border-2 border-slate-200 bg-white text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all text-[11px] font-black uppercase tracking-wider"
                        >
                            <Printer className="h-4 w-4" /> In Báo Cáo
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-10 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <CheckCircle className="h-4 w-4 text-emerald-400" /> Xong
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
