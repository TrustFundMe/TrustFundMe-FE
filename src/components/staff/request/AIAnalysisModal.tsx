'use client';

import React, { useEffect, useState } from 'react';
import {
    X, Sparkles, CheckCircle,
    ShieldCheck, Printer, LineChart, Store, Loader2, AlertTriangle,
    Search, Globe
} from 'lucide-react';
import { ExpenditureItem, Expenditure } from '@/types/expenditure';
import { expenditureService } from '@/services/expenditureService';
import { aiService } from '@/services/aiService';

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
    marketPriceMin?: number;
    marketPriceMax?: number;
    productExists?: boolean;
    productExistsByBrand?: boolean;
    unit?: string;
    evidenceUrls?: (string | { url: string; title?: string; price?: number })[];
    statusMessage?: string;
    isLinkMatched?: boolean;
    linkType?: string;
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
    forensics?: {
        isManipulated: boolean;
        heatmapUrl?: string;
        warnings?: string[];
    };
    reconciliation?: {
        itemName: string;
        planPrice: number;
        planQty: number;
        planUnit?: string;
        planBrand?: string;
        planLocation?: string;
        planNote?: string;
        actualPrice: number;
        actualQty: number;
        actualUnit?: string;
        actualBrand?: string;
        actualLocation?: string;
        billPrice: number;
        billQty: number;
        billUnit?: string;
        billBrand?: string;
        status: string;
    }[];
    billItems?: any[];
    unplannedBillItems?: any[];
}

interface AIAnalysisModalProps {
    result?: Partial<AIAnalysisResult>;
    itemsProp?: ExpenditureItem[];
    donationSummary?: Record<number, number>;
    exp?: any;
    mode?: 'plan' | 'evidence';
    onClose: () => void;
}

const fmtVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export default function AIAnalysisModal({
    result = {},
    itemsProp = [],
    exp,
    mode = 'evidence',
    onClose,
}: AIAnalysisModalProps) {
    const [items, setItems] = useState<ExpenditureItem[]>(itemsProp);
    const [loadingItems, setLoadingItems] = useState(itemsProp.length === 0);
    const [detected, setDetected] = useState<DetectedItem[]>(Array.isArray(result?.detectedItems) ? result.detectedItems : []);
    const [overallSummary, setOverallSummary] = useState<string>(result?.summary || 'Đang chờ phân tích tổng hợp...');
    const [overallRecommendation, setOverallRecommendation] = useState<string>(result?.recommendation || 'Đang thẩm định kế hoạch chi tiêu...');
    const [reconciliation, setReconciliation] = useState<AIAnalysisResult['reconciliation']>(result?.reconciliation || []);
    const [billItems, setBillItems] = useState<any[]>(result?.billItems || []);
    const [unplannedBillItems, setUnplannedBillItems] = useState<any[]>(result?.unplannedBillItems || []);
    const [isAnalyzing3Way, setIsAnalyzing3Way] = useState(mode === 'evidence' && (!result?.reconciliation || result?.reconciliation?.length === 0));
    const [loadingAIItems, setLoadingAIItems] = useState<Record<number, boolean>>({});
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [evidenceTab, setEvidenceTab] = useState<'3way' | 'market'>('3way');
    const [marketAuditStarted, setMarketAuditStarted] = useState(false);
    const [isBill, setIsBill] = useState(result?.isBill !== false);
    const [forensics, setForensics] = useState(result?.forensics);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        const targetId = exp?.id || result?.expenditureId;

        // Chỉ cập nhật từ itemsProp nếu nó có dữ liệu. 
        // Tuyệt đối không setItems([]) nếu itemsProp trống, để giữ lại dữ liệu cũ hoặc chờ fetch.
        if (itemsProp && itemsProp.length > 0) {
            setItems(itemsProp);
            setLoadingItems(false);
            return;
        }

        if (!targetId) return;

        const fetchItems = async () => {
            console.log('[AIAudit] No itemsProp, fetching from backend for ID:', targetId);
            try {
                setLoadingItems(true);
                const fetched: ExpenditureItem[] = await expenditureService.getItems(targetId);
                console.log('[AIAudit] Fetched items count:', fetched.length);
                setItems(fetched);
            } catch (err) {
                console.error('[AIAudit] Fetch items failed:', err);
            } finally {
                setLoadingItems(false);
            }
        };
        fetchItems();
    }, [exp?.id, itemsProp, result?.expenditureId]);

    // NEW: Tự động chạy phân tích đối soát 3 chân nếu chưa có
    useEffect(() => {
        if (mode !== 'evidence' || !isAnalyzing3Way || items.length === 0) {
            console.log('[AI-3Way] Skip invocation:', { mode, isAnalyzing3Way, itemsCount: items.length });
            return;
        }

        const invoke3Way = async () => {
            console.log('[AI-3Way] Starting analysis for expId:', exp?.id);
            try {
                const itemsToAnalyze = items.filter(i => (i.actualQuantity ?? 0) > 0);
                const dataToSend = {
                    expenditureId: exp?.id,
                    plan: exp?.plan,
                    purpose: exp?.purpose || '',
                    totalAmount: exp?.totalAmount,
                    items: itemsToAnalyze.length > 0 ? itemsToAnalyze : items,
                    photoUrls: exp?.evidencePhotos || [],
                    createdAt: exp?.createdAt
                };

                const res = await aiService.analyzeEvidence(dataToSend) as AIAnalysisResult;

                if (res) {
                    setIsBill(res.isBill !== false);
                    setForensics(res.forensics);
                    setReconciliation(res.reconciliation || []);
                    setBillItems(res.billItems || []);
                    setUnplannedBillItems(res.unplannedBillItems || []);
                    setOverallSummary(res.summary || 'Hoàn tất đối soát.');
                    setOverallRecommendation(res.recommendation || 'Xem kết quả chi tiết.');

                    if (res.detectedItems) {
                        setDetected(res.detectedItems);
                    }
                }
            } catch (err) {
                console.error('[AI-3Way] Execution Error:', err);
                setOverallSummary('Lỗi phân tích đối soát.');
            } finally {
                setIsAnalyzing3Way(false);
            }
        };



        invoke3Way();
    }, [mode, isAnalyzing3Way, items, exp]);

    // Bắt đầu gọi API AI cho từng item
    useEffect(() => {
        if (mode !== 'plan' || items.length === 0) return;

        // Nếu đã có detected items từ prop (ví dụ ở evidence), bỏ qua
        if (result?.detectedItems && result.detectedItems.length > 0) return;

        const invokeAI = async () => {
            // Gọi song song (parallel) tất cả items cùng lúc để giảm tổng thời gian chờ.
            // Kết quả hiện real-time khi từng item hoàn thành.
            const validItems = items.filter(item => !!item.id);

            // Đánh dấu loading cho tất cả items ngay từ đầu
            setLoadingAIItems(prev => {
                const next = { ...prev };
                validItems.forEach(item => { next[item.id!] = true; });
                return next;
            });

            await Promise.all(
                validItems.map(async (sysItem) => {
                    try {
                        const aiData = await expenditureService.analyzeItemWithAI(sysItem.id!);
                        if (aiData && aiData.detectedItems && aiData.detectedItems.length > 0) {
                            const aiItem = aiData.detectedItems[0];
                            setDetected(prev => {
                                const newArr = prev.filter(d => d.name !== sysItem.name);
                                return [...newArr, aiItem];
                            });
                        }
                    } catch (error) {
                        const axiosError = error as any;
                        console.group(`🔴 [AIAudit] Lỗi item ${sysItem.id}`);
                        console.error('HTTP Status:', axiosError.response?.status);
                        console.error('Response body:', axiosError.response?.data);
                        console.error('Error message:', axiosError.message);
                        console.error('Full error:', axiosError);
                        console.groupEnd();
                    } finally {
                        setLoadingAIItems(prev => ({ ...prev, [sysItem.id!]: false }));
                    }
                })
            );

            setOverallSummary('Đã hoàn tất kiểm tra chéo giá thị trường cho tất cả các bản nháp/hạng mục.');
            setOverallRecommendation('Gợi ý: Căn cứ vào bảng đối soát từng mục để tự tin duyệt ngân sách mà không lo thất thoát quỹ.');
        };

        invokeAI();
    }, [items, mode, result.detectedItems]);

    const runMarketAuditForActuals = async () => {
        setMarketAuditStarted(true);
        const validItems = items.filter(item => !!item.id);

        setLoadingAIItems(prev => {
            const next = { ...prev };
            validItems.forEach(item => { next[item.id!] = true; });
            return next;
        });

        await Promise.all(
            validItems.map(async (sysItem) => {
                try {
                    const aiData = await expenditureService.analyzeActualItemWithAI(sysItem.id!);
                    if (aiData && aiData.detectedItems && aiData.detectedItems.length > 0) {
                        const aiItem = aiData.detectedItems[0];
                        setDetected(prev => {
                            const newArr = prev.filter(d => d.name !== sysItem.name);
                            return [...newArr, aiItem];
                        });
                    }
                } catch (error) {
                    console.error('Error market audit actual', sysItem.id, error);
                } finally {
                    setLoadingAIItems(prev => ({ ...prev, [sysItem.id!]: false }));
                }
            })
        );
    };



    // 🔍 DEBUG — mở F12 > Console để xem
    useEffect(() => {
        console.group('[AIAudit] State Change Detected');
        console.log('Mode:', mode);
        console.log('Result Prop:', result);
        console.log('Items State:', items.length, items);
        console.log('Detected State:', detected.length, detected);
        console.log('Is Analyzing 3-Way:', isAnalyzing3Way);
        console.groupEnd();
    }, [result, items, detected, isAnalyzing3Way, mode]);

    // Split Rendering based on mode to provide a dedicated, stunning Evidence UI
    const renderPlanMode = () => (
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-4 gap-3 custom-scrollbar">
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
                    <div className="flex-shrink-0 min-h-[500px] rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-[#F8FAFC] border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-8 text-center border-r border-slate-100">#</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Tên</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right border-r border-slate-100">Giá dự kiến</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">SL dự kiến</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">Đơn vị dự kiến</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Địa điểm dự kiến mua</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Note dự kiến</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">
                                        Kế hoạch (SL x Giá)
                                    </th>
                                    <th className="px-3 py-3 text-[9px] font-black text-indigo-500 uppercase tracking-wider border-r border-slate-100">
                                        Thẩm định & Link Thị Trường
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((sysItem, idx) => {
                                    // Match by item.name
                                    const aiItem = detected.find(d => {
                                        // The backend explicitly maps: aiItem.setItemName(item.getName());
                                        return d.name === sysItem.name || d.plannedCategory === sysItem.name;
                                    });

                                    const isItemLoadingAI = loadingAIItems[sysItem.id!];
                                    const sysQty = sysItem.expectedQuantity || 1;
                                    const sysPrice = sysItem.expectedPrice || 0;
                                    const sysVal = sysQty * sysPrice;

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-3 py-3 text-center text-[10px] font-black text-slate-400 border-r border-slate-50">{idx + 1}</td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="text-[11px] font-bold text-slate-800 leading-tight">{sysItem.name || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50 text-right">
                                                <div className="text-[10px] font-bold text-slate-800">{fmtVND(sysPrice)}</div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50 text-center">
                                                <div className="text-[10px] font-bold text-slate-800">{sysQty}</div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50 text-center">
                                                <div className="text-[10px] font-bold text-slate-700">{sysItem.expectedUnit || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="text-[10px] font-bold text-slate-700">{sysItem.expectedPurchaseLocation || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50">
                                                <div className="text-[9px] text-slate-500">{sysItem.expectedNote || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3 text-center border-r border-slate-50">
                                                <div className="text-[11px] font-black text-blue-700 tabular-nums">{fmtVND(sysVal)}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                                    {`${sysQty} x ${fmtNum(sysPrice)}`}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 border-r border-slate-50 min-w-[180px]">
                                                {isItemLoadingAI ? (
                                                    <div className="flex flex-col items-center justify-center py-2 opacity-50 select-none">
                                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                                        <span className="text-[8px] font-black text-indigo-500 uppercase mt-1">Đang phân tích...</span>
                                                    </div>
                                                ) : aiItem ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Giá tham chiếu (Khoảng giá):</span>
                                                            <span className="text-[10px] font-black text-indigo-700">
                                                                {aiItem.marketPriceMin && aiItem.marketPriceMax
                                                                    ? `${fmtNum(aiItem.marketPriceMin)} - ${fmtNum(aiItem.marketPriceMax)} đ`
                                                                    : aiItem.marketUnitPrice ? fmtVND(aiItem.marketUnitPrice) : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1.5 pt-1 border-t border-slate-50">
                                                            <div className={`text-[10px] font-bold ${aiItem.priceStatus === 'MATCHED' ? 'text-emerald-600' :
                                                                aiItem.priceStatus === 'OVERPRICED' ? 'text-rose-600' :
                                                                    aiItem.priceStatus === 'UNDERPRICED' ? 'text-amber-600' :
                                                                        'text-slate-400'
                                                                }`}>
                                                                {aiItem.statusMessage || (aiItem.priceStatus === 'MATCHED' ? 'Giá hợp lý' :
                                                                    aiItem.priceStatus === 'OVERPRICED' ? 'Giá cao hơn thị trường' :
                                                                        aiItem.priceStatus === 'UNDERPRICED' ? 'Giá thấp hơn thị trường' :
                                                                            aiItem.priceStatus || 'N/A')}
                                                            </div>
                                                        </div>
                                                        {aiItem.evidenceUrls && aiItem.evidenceUrls.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {aiItem.evidenceUrls.slice(0, 4).map((url, uidx) => (
                                                                    <a
                                                                        key={uidx}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[9px] font-black border border-blue-100 transition-all hover:scale-105 active:scale-95"
                                                                    >
                                                                        <Store className="h-3 w-3" /> Link {uidx + 1}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-2 opacity-30 select-none">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Chưa phân tích</span>
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
                                    <td colSpan={9} className="px-3 py-3 text-right uppercase text-[9px] tracking-widest text-slate-400">
                                        Vui lòng xem chi tiết ở trên
                                    </td>
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
                    <p className="text-xs font-black leading-snug">{overallRecommendation}</p>
                    <p className="text-[10px] text-slate-300 italic opacity-80 leading-snug">&ldquo;{overallSummary}&rdquo;</p>
                </div>
            </div>
        </div>
    );

    // Dịch vụ render UI độc lập cho Mảng EVIDENCE - ĐẸP, PREMIUM VÀ TẬP TRUNG
    const renderEvidenceMode = () => (
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-4 gap-4 custom-scrollbar">

            {/* CẢNH BÁO NẾU ẢNH KHÔNG PHẢI LÀ HÓA ĐƠN */}

            {/* THANH TRẠNG THÁI FORENSICS - SIÊU GỌN */}
            {forensics && (
                <div className={`flex-shrink-0 px-4 py-2 rounded-xl border flex items-center justify-between shadow-sm transition-all ${forensics.isManipulated ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    <div className="flex items-center gap-2">
                        {forensics.isManipulated ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        <span className="text-[10px] font-black uppercase tracking-tight">
                            {forensics.isManipulated ? `CẢNH BÁO: PHÁT HIỆN CHỈNH SỬA (${forensics.warnings?.join(', ')})` : 'XÁC THỰC: ẢNH NGUYÊN BẢN (SẠCH)'}
                        </span>
                    </div>
                    {forensics.heatmapUrl && (
                        <button onClick={() => setShowHeatmap(true)} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-slate-800 transition-colors">
                            Xem Heatmap
                        </button>
                    )}
                </div>
            )}

            {/* TAB SELECTION */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                    onClick={() => setEvidenceTab('3way')}
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${evidenceTab === '3way' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    Đối Soát
                </button>
                <button
                    onClick={() => setEvidenceTab('market')}
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${evidenceTab === 'market' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    Khảo Sát Giá Thị Trường (Thực Tế)
                </button>
            </div>

            {/* TAB CONTENT */}
            {evidenceTab === '3way' && (
                <div className="flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Đối Soát</h3>
                            {isAnalyzing3Way && (
                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Đang dùng AI bóc tách hóa đơn & đối soát...
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setEvidenceTab('market')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm"
                        >
                            <Search className="h-3 w-3" /> Khảo sát giá thị trường
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200">
                            <table className="w-full border-collapse min-w-[1200px]">
                                <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-sm border-b border-slate-200">
                                    <tr className="divide-x divide-slate-200">
                                        <th rowSpan={2} className="sticky left-0 z-30 w-12 px-2 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center bg-slate-100 border-r border-slate-200">#</th>
                                        <th rowSpan={2} className="sticky left-12 z-30 w-[220px] px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Tên Hạng Mục</th>
                                        <th colSpan={6} className="px-3 py-2 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center bg-amber-50/50">Kế Hoạch (Plan)</th>
                                        <th colSpan={5} className="px-3 py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50">Thực Chi (Actual)</th>
                                    </tr>
                                    <tr className="divide-x divide-slate-100">
                                        {/* Plan Headers */}
                                        <th className="w-14 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20 text-right">SL</th>
                                        <th className="w-24 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20 text-right">Giá</th>
                                        <th className="w-20 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20">Đơn vị</th>
                                        <th className="w-24 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20">Brand</th>
                                        <th className="w-28 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20">Nơi mua</th>
                                        <th className="w-28 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-amber-50/20 text-right">Tổng</th>

                                        {/* Actual Headers */}
                                        <th className="w-14 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-blue-50/20 text-right">SL</th>
                                        <th className="w-24 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-blue-50/20 text-right">Giá</th>
                                        <th className="w-20 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-blue-50/20">Đơn vị</th>
                                        <th className="w-24 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-blue-50/20">Brand</th>
                                        <th className="w-28 px-2 py-2 text-[9px] font-black text-slate-400 uppercase bg-blue-50/20 text-right font-black">Tổng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((it: ExpenditureItem, idx) => {
                                        const itAny = it as any;

                                        const row = {
                                            itemName: it.name,
                                            planQty: itAny.expectedQuantity ?? itAny.expected_quantity ?? 0,
                                            planPrice: itAny.expectedPrice ?? itAny.expected_price ?? 0,
                                            planUnit: itAny.expectedUnit ?? itAny.expected_unit || '-',
                                            planBrand: itAny.expectedBrand ?? itAny.expected_brand || '-',
                                            planLocation: itAny.expectedPurchaseLocation ?? itAny.expected_purchase_location || '-',
                                            actualQty: itAny.actualQuantity ?? itAny.actual_quantity ?? 0,
                                            actualPrice: itAny.actualPrice ?? itAny.actual_price ?? 0,
                                            actualUnit: itAny.actualUnit ?? itAny.actual_unit || itAny.unit || '-',
                                            actualBrand: itAny.actualBrand ?? itAny.actual_brand || itAny.expectedBrand || itAny.expected_brand || '-',
                                        };

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                                <td className="sticky left-0 z-10 px-2 py-3 text-center text-[10px] font-black text-slate-400 bg-white group-hover:bg-slate-100 border-r border-slate-100 transition-colors">{idx + 1}</td>
                                                <td className="sticky left-12 z-10 px-3 py-3 bg-white group-hover:bg-slate-100 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] transition-colors">
                                                    <div className="text-[11px] font-black text-slate-800 leading-tight">{row.itemName || '-'}</div>
                                                </td>
                                                {/* Plan Data */}
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-amber-50/5"><div className="text-[10px] font-bold text-slate-700">{row.planQty ?? '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-amber-50/5"><div className="text-[10px] font-bold text-slate-700">{row.planPrice ? fmtNum(row.planPrice) : '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 bg-amber-50/5"><div className="text-[9px] text-slate-600 text-center">{row.planUnit || '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 bg-amber-50/5"><div className="text-[9px] text-slate-600 text-center">{row.planBrand || '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 bg-amber-50/5"><div className="text-[9px] text-slate-600 truncate max-w-[100px]">{row.planLocation || '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-amber-50/5 font-black text-amber-700"><div className="text-[10px]">{fmtNum((row.planPrice || 0) * (row.planQty || 0))}</div></td>

                                                {/* Actual Data */}
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-blue-50/5"><div className="text-[10px] font-black text-slate-700">{row.actualQty ?? '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-blue-50/5"><div className="text-[10px] font-black text-slate-700">{row.actualPrice ? fmtNum(row.actualPrice) : '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 bg-blue-50/5"><div className="text-[9px] font-bold text-blue-700 text-center">{row.actualUnit || '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 bg-blue-50/5"><div className="text-[9px] font-bold text-blue-700 text-center">{row.actualBrand || '-'}</div></td>
                                                <td className="px-2 py-3 border-r border-slate-100 text-right bg-blue-50/5 font-black text-blue-800"><div className="text-[10px]">{fmtNum((row.actualPrice || 0) * (row.actualQty || 0))}</div></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>
            )}
            {evidenceTab === 'market' && (
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {!marketAuditStarted ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Kiểm toán giá thị trường thực tế</h3>
                            <p className="text-xs text-slate-500 max-w-md mb-6">
                                Hệ thống sẽ dùng AI quét trên internet để tìm khoảng giá thị trường cho các mặt hàng thực tế đã được mua và đối chiếu với giá nhập trên hệ thống.
                            </p>
                            <button
                                onClick={runMarketAuditForActuals}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105"
                            >
                                Bắt Đầu Khảo Sát Giá
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-0 bg-white">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-[#F8FAFC] border-b border-slate-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-8 text-center border-r border-slate-100">#</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Tên</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-100">Brand</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right border-r border-slate-100">Giá thực chi</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">SL</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">Đơn vị</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center border-r border-slate-100">Thực Chi (SL x Giá)</th>
                                        <th className="px-3 py-3 text-[9px] font-black text-indigo-500 uppercase tracking-wider border-r border-slate-100">Thẩm định & Link Thị Trường</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((sysItem, idx) => {
                                        const aiItem = detected.find(d => d.name === sysItem.name || d.plannedCategory === sysItem.name);
                                        const isItemLoadingAI = loadingAIItems[sysItem.id!];
                                        const sysQty = sysItem.actualQuantity || 1;
                                        const sysPrice = sysItem.actualPrice || 0;
                                        const sysVal = sysQty * sysPrice;

                                        return (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group align-top">
                                                <td className="px-3 py-4 text-center font-black text-slate-400 group-hover:text-blue-500 border-r border-slate-100">{idx + 1}</td>
                                                <td className="px-3 py-4 border-r border-slate-100">
                                                    <div className="font-black text-slate-800 leading-tight">{sysItem.name || '-'}</div>
                                                </td>
                                                <td className="px-3 py-4 border-r border-slate-100">
                                                    <div className="font-bold text-slate-600">{sysItem.actualBrand || sysItem.expectedBrand || (sysItem as any).expected_brand || '-'}</div>
                                                </td>
                                                <td className="px-3 py-4 text-right border-r border-slate-100">
                                                    <div className="font-black text-slate-700">{fmtNum(sysPrice)} đ</div>
                                                </td>
                                                <td className="px-3 py-4 text-center border-r border-slate-100">
                                                    <div className="font-bold text-slate-700">{sysQty}</div>
                                                </td>
                                                <td className="px-3 py-4 text-center border-r border-slate-100">
                                                    <div className="font-medium text-slate-600">{sysItem.actualUnit || '-'}</div>
                                                </td>
                                                <td className="px-3 py-4 text-center border-r border-slate-100">
                                                    <div className="font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg inline-block shadow-inner border border-slate-100">
                                                        {fmtVND(sysVal)}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4">
                                                    {isItemLoadingAI ? (
                                                        <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Đang quét giá thị trường thực tế...</span>
                                                        </div>
                                                    ) : aiItem ? (
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                                                                <div className={`absolute top-0 left-0 w-1 h-full ${aiItem.priceStatus === 'MATCHED' ? 'bg-emerald-500' :
                                                                    aiItem.priceStatus === 'OVERPRICED' ? 'bg-rose-500' :
                                                                        aiItem.priceStatus === 'UNDERPRICED' ? 'bg-amber-500' : 'bg-slate-300'
                                                                    }`} />

                                                                <div className="flex-1 flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded shadow-sm border ${aiItem.priceStatus === 'MATCHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                            aiItem.priceStatus === 'OVERPRICED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                                aiItem.priceStatus === 'UNDERPRICED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                                            }`}>
                                                                            {aiItem.priceStatus === 'MATCHED' ? '✓ Hợp lý' :
                                                                                aiItem.priceStatus === 'OVERPRICED' ? '⚠ Khai Khống Giá' :
                                                                                    aiItem.priceStatus === 'UNDERPRICED' ? '⚠ Giá quá thấp' : 'Không rõ'}
                                                                        </span>

                                                                        {aiItem.marketPriceMin > 0 && aiItem.marketPriceMax > 0 ? (
                                                                            <span className="text-[10px] font-black text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                                                                TT: {fmtNum(aiItem.marketPriceMin)} đ - {fmtNum(aiItem.marketPriceMax)} đ
                                                                            </span>
                                                                        ) : aiItem.marketPriceMin === 0 || aiItem.marketPriceMax === 0 ? (
                                                                            <span className="text-[10px] font-black text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                                                                TT: 0 đ - 0 đ
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold text-slate-400 italic">Không tìm thấy giá thị trường tham chiếu</span>
                                                                        )}
                                                                    </div>

                                                                    {aiItem.statusMessage && (
                                                                        <p className="text-[10px] font-medium text-slate-600 italic">
                                                                            {aiItem.statusMessage}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {aiItem.evidenceUrls && aiItem.evidenceUrls.length > 0 && (
                                                                <div className="flex flex-col gap-1.5 mt-1">
                                                                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                                                        <Globe className="h-3 w-3" /> Nguồn đối chứng:
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                                        {(aiItem.evidenceUrls || []).slice(0, 4).map((link: any, lIdx: number) => {
                                                                            const url = typeof link === 'string' ? link : link.url;
                                                                            const title = typeof link === 'string' ? new URL(link).hostname : (link.title || new URL(url).hostname);
                                                                            if (!url) return null;
                                                                            return (
                                                                                <a
                                                                                    key={lIdx}
                                                                                    href={url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-[9px] font-black border border-indigo-100 transition-all hover:scale-105 active:scale-95"
                                                                                >
                                                                                    <Store className="h-3 w-3" /> {title} {link.price ? `(${fmtNum(link.price)}đ)` : ''}
                                                                                </a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic font-medium">Chưa có dữ liệu</span>
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
            )}

        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px]" onClick={onClose} />

            <div
                className="relative bg-[#fdfdfd] rounded-[32px] shadow-2xl w-full max-w-[95vw] border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
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
                        {/* Removed Risk Level as per request */}
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shadow-inner">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* GỌI GIAO DIỆN TÙY VÀO MODE */}
                {mode === 'plan' ? renderPlanMode() : renderEvidenceMode()}

                {/* Heatmap Modal Overlay */}
                {showHeatmap && result.forensics?.heatmapUrl && (
                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4">Ảnh phân tích nhiệt (ELA Heatmap)</h3>
                        <p className="text-rose-400 text-xs mb-6 text-center max-w-lg">Các điểm sáng bất thường là dấu vết của việc thêm nội dung văn bản hoặc ghép ảnh bằng phần mềm chỉnh sửa ảnh.</p>
                        <img src={result.forensics.heatmapUrl} alt="ELA Heatmap" className="max-h-[70vh] rounded-xl border border-white/20 shadow-2xl" />
                        <button onClick={() => setShowHeatmap(false)} className="mt-8 px-6 py-3 bg-white text-black font-black uppercase rounded-xl hover:bg-slate-200">Đóng Heatmap</button>
                    </div>
                )}

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
