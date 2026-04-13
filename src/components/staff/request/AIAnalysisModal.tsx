'use client';

import React, { useEffect } from 'react';
import { 
    X, Sparkles, CheckCircle, 
    ShieldCheck, Info, Printer, MapPin, Phone, Mail, Hash,
    AlertTriangle, LineChart, Package, Store
} from 'lucide-react';

interface AIAnalysisModalProps {
    result: {
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
        detectedItems?: {
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
            matchStatus: 'MATCHED' | 'PARTIAL' | 'MISMATCHED';
            plannedCategory?: string;
            plannedAmount?: number;
            differenceAmount?: number;
        }[];
    };
    onClose: () => void;
}

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export default function AIAnalysisModal({ result, onClose }: AIAnalysisModalProps) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const getRiskStyles = (score: number) => {
        if (score < 30) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (score < 70) return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-rose-700 bg-rose-50 border-rose-100';
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
            
            <div className="relative bg-[#fcfcfc] rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[96vh] border border-slate-200 animate-in zoom-in-95 duration-200">
                
                {/* Compact Header */}
                <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#111827] flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Hệ thống Kiểm toán AI V3.0</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                Phân tích rủi ro & Đối soát thực tế
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

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 space-y-4">
                    
                    {/* Grid: Vendor & Recommendation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Vendor Identity */}
                        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Store className="h-4 w-4 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Thông tin đơn vị cung cấp (Vendor)</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Tên doanh nghiệp/Cửa hàng</p>
                                    <p className="text-xs font-black text-slate-800">{result.vendorInfo?.name || 'Không xác định'}</p>
                                </div>
                                {result.vendorInfo?.taxId && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Mã số thuế</p>
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Hash className="h-3 w-3" /> {result.vendorInfo.taxId}</p>
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Địa chỉ</p>
                                    <p className="text-xs font-medium text-slate-600 flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" /> {result.vendorInfo?.address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Liên hệ</p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        {result.vendorInfo?.phone && <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> {result.vendorInfo.phone}</span>}
                                        {result.vendorInfo?.email && <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {result.vendorInfo.email}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & recommendation - Compact */}
                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl bg-[#1e293b] text-white shadow-md border border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kết luận kiểm toán</p>
                                </div>
                                <p className="text-xs font-black leading-relaxed mb-3">{result.recommendation}</p>
                                <div className="h-px bg-slate-700 my-2" />
                                <p className="text-[11px] text-slate-300 italic opacity-80 leading-relaxed">"{result.summary}"</p>
                            </div>
                        </div>
                    </div>

                    {/* Detection Table: Real Items vs Planned Categories */}
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-slate-500" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Chi tiết hàng hóa bóc tách từ hóa đơn (Itemized Audit)</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{result.detectedItems?.length || 0} Sản phẩm phát hiện</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-4 py-2.5 border-b border-slate-100">Sản phẩm phát hiện</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100">SL</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100 text-right">Đơn giá</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100">Kế hoạch</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100 text-right">Dự kiến</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100 text-right">Số tiền hóa đơn</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100 text-right">Chênh lệch</th>
                                        <th className="px-4 py-2.5 border-b border-slate-100 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {result.detectedItems?.map((item, idx) => {
                                        const actual = item.total || (item.quantity * item.unitPrice) || 0;
                                        const planned = item.plannedAmount || 0;
                                        const diff = item.differenceAmount !== undefined ? item.differenceAmount : (actual - planned);
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-4 py-2 text-xs font-black text-slate-800">{item.name}</td>
                                                <td className="px-4 py-2 text-xs font-bold text-slate-600">{item.quantity}</td>
                                                <td className="px-4 py-2 text-xs font-bold text-slate-600 text-right">{fmt(item.unitPrice)}</td>
                                                <td className="px-4 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">
                                                    {item.plannedCategory || '---'}
                                                </td>
                                                <td className="px-4 py-2 text-xs font-bold text-slate-500 text-right">
                                                    {planned > 0 ? fmt(planned) : '---'}
                                                </td>
                                                <td className="px-4 py-2 text-xs font-black text-slate-900 text-right">
                                                    {fmt(actual)}
                                                </td>
                                                <td className={`px-4 py-2 text-xs font-black text-right ${
                                                    diff > 0 ? 'text-rose-600' : 
                                                    diff < 0 ? 'text-emerald-600' : 'text-slate-400'
                                                }`}>
                                                    {diff !== 0 ? (diff > 0 ? '+' : '') + fmt(diff) : '0 ₫'}
                                                </td>
                                                <td className="px-4 py-2 text-center uppercase">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border inline-block min-w-[60px] ${
                                                        item.matchStatus === 'MATCHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        item.matchStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                        {item.matchStatus === 'MATCHED' ? 'Khớp' : item.matchStatus === 'PARTIAL' ? 'Một phần' : 'Không khớp'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!result.detectedItems || result.detectedItems.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-[11px] font-medium text-slate-400 italic">Không có dữ liệu bóc tách chi tiết</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Double Column: Red Flags & Analysis Logic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Red Flags Section */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-2 px-1">
                                <AlertTriangle className="h-4 w-4 text-rose-500" />
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                    Cảnh báo vi phạm & Nghi vấn ({Array.isArray(result.redFlags) ? result.redFlags.length : (typeof result.redFlags === 'string' ? 1 : 0)})
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                {(Array.isArray(result.redFlags) ? result.redFlags : []).map((flag, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/30 flex items-start gap-2 group hover:bg-rose-50 transition-colors">
                                        <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5" />
                                        <p className="text-[11px] font-bold text-rose-900 leading-snug">{flag}</p>
                                    </div>
                                ))}
                                {(!result.redFlags || (Array.isArray(result.redFlags) && result.redFlags.length === 0)) && (
                                    <p className="text-[10px] text-slate-400 italic px-2">Không phát hiện dấu hiệu vi phạm</p>
                                )}
                            </div>
                        </div>

                        {/* Logical Basis Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <LineChart className="h-4 w-4 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cơ sở lập luận của AI</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-50">
                                {(Array.isArray(result.spendingAnalysis) ? result.spendingAnalysis : (typeof result.spendingAnalysis === 'string' ? [result.spendingAnalysis] : [])).map((point, idx) => (
                                    <div key={idx} className="p-2.5 flex gap-3 items-start group hover:bg-slate-50 transition-colors">
                                        <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 shrink-0 mt-0.5">{idx + 1}</div>
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{point}</p>
                                    </div>
                                ))}
                                {(!result.spendingAnalysis || (Array.isArray(result.spendingAnalysis) && result.spendingAnalysis.length === 0)) && (
                                    <p className="text-[11px] text-slate-400 italic p-4 text-center">Chưa có dữ liệu lập luận</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Action Heavy */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center sm:text-left">Audit System Protocol • TrustFundMe Platform</p>
                        <p className="text-[9px] text-slate-500 font-medium italic">Báo cáo dựa trên đối soát thực tế ảnh hóa đơn và kế hoạch chi tiêu.</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => window.print()} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all text-[10px] font-black uppercase">
                            <Printer className="h-3.5 w-3.5" /> In báo cáo
                        </button>
                        <button onClick={onClose} 
                            className="flex-1 sm:flex-none px-6 h-9 rounded-lg bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Xác nhận & Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
