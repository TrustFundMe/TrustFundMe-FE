'use client';

import * as React from 'react';
import { LayoutGrid, CornerUpRight, ShoppingBag, Wallet, CheckCircle, Download } from 'lucide-react';

interface ExpenditureDetailStatsProps {
    expenditure: any;
    totalReceived: number;
    totalActual: number;
    totalBalance: number;
}

const ExpenditureDetailStats: React.FC<ExpenditureDetailStatsProps> = ({
    expenditure, totalReceived, totalActual, totalBalance
}) => {
    const v1 = expenditure?.totalExpectedAmount || 0;
    const v2 = totalReceived;
    const v3 = totalActual;
    const v4 = totalBalance;
    const maxVal = Math.max(v1, v2, v3, v4, 1);

    const isEvidenceSubmitted = ['SUBMITTED', 'APPROVED', 'ALLOWED_EDIT'].includes(expenditure?.evidenceStatus);

    const getBarHeight = (val: number, max: number) => {
        if (max === 0 || val === 0) return 0;
        return Math.max((val / max) * 90, 2);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
            {/* Card 1: Stats & Chart (col-span-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 pt-6 border border-[#E2E8F0] shadow-sm flex items-end min-h-[140px] h-[160px] relative">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 px-4 pt-6 pb-14 flex flex-col justify-between pointer-events-none opacity-[0.15]">
                    <div className="w-full border-t border-slate-400 border-dashed"></div>
                    <div className="w-full border-t border-slate-400 border-dashed"></div>
                    <div className="w-full border-t border-slate-400 border-dashed"></div>
                    <div className="w-full border-t border-slate-600"></div>
                </div>

                {/* Bars & Labels */}
                <div className="w-full h-full flex items-end justify-between gap-1 relative z-10">
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-10 rounded-t flex items-end justify-center shadow-inner overflow-hidden" style={{ height: `${getBarHeight(v1, maxVal)}%` }}>
                            <div className="w-full h-full bg-[#065F46] rounded-t opacity-90"></div>
                        </div>
                        <div className="flex flex-col items-center mt-2 w-full text-center">
                            <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-tighter mb-0.5 whitespace-nowrap">DỰ KIẾN</span>
                            <span className="text-sm font-black text-[#1E293B] tabular-nums leading-none">
                                {new Intl.NumberFormat('vi-VN').format(v1)} <span className="text-[10px] font-bold opacity-60">VNĐ</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-10 rounded-t flex items-end justify-center shadow-inner overflow-hidden" style={{ height: `${getBarHeight(v2, maxVal)}%` }}>
                            <div className="w-full h-full bg-[#065F46] rounded-t opacity-90"></div>
                        </div>
                        <div className="flex flex-col items-center mt-2 w-full text-center">
                            <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-tighter mb-0.5 whitespace-nowrap">GIẢI NGÂN</span>
                            <span className="text-sm font-black text-[#1E293B] tabular-nums leading-none">
                                {new Intl.NumberFormat('vi-VN').format(v2)} <span className="text-[10px] font-bold opacity-60">VNĐ</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-10 rounded-t flex items-end justify-center shadow-inner overflow-hidden" style={{ height: `${isEvidenceSubmitted ? getBarHeight(v3, maxVal) : 0}%` }}>
                            {isEvidenceSubmitted && <div className="w-full h-full bg-[#065F46] rounded-t opacity-90"></div>}
                        </div>
                        <div className="flex flex-col items-center mt-2 w-full text-center">
                            <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-tighter mb-0.5 whitespace-nowrap">ĐÃ CHI</span>
                            <span className="text-sm font-black text-[#1E293B] tabular-nums leading-none">
                                {isEvidenceSubmitted 
                                    ? <>{new Intl.NumberFormat('vi-VN').format(v3)} <span className="text-[10px] font-bold opacity-60">VNĐ</span></>
                                    : <span className="text-[10px] text-[#64748B]">Chưa cập nhật</span>
                                }
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-10 rounded-t flex items-end justify-center shadow-inner overflow-hidden" style={{ height: `${isEvidenceSubmitted ? getBarHeight(v4, maxVal) : 0}%` }}>
                            {isEvidenceSubmitted && <div className="w-full h-full bg-[#065F46] rounded-t opacity-90"></div>}
                        </div>
                        <div className="flex flex-col items-center mt-2 w-full text-center">
                            <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-tighter mb-0.5 whitespace-nowrap">SỐ DƯ</span>
                            <span className="text-sm font-black text-[#1E293B] tabular-nums leading-none">
                                {isEvidenceSubmitted 
                                    ? <>{new Intl.NumberFormat('vi-VN').format(v4)} <span className="text-[10px] font-bold opacity-60">VNĐ</span></>
                                    : <span className="text-[10px] text-[#64748B]">Chưa cập nhật</span>
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Disbursement Status */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm min-h-[140px] h-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-black text-[#1E293B]">Trạng thái</h2>
                    <span className="flex items-center gap-1 text-[9px] font-black text-[#065F46] bg-[#065F46]/10 px-2 py-0.5 rounded-full border border-black/5 uppercase tracking-wider">
                        <CheckCircle className="w-2.5 h-2.5" /> Đã giải ngân
                    </span>
                </div>
                
                <div className="flex-1 bg-[#F8FAFC]/50 border border-slate-100 rounded-xl p-2.5 flex flex-col justify-center mb-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-[#64748B] tracking-widest uppercase">Tiến độ</span>
                        <span className="text-[#065F46] text-xs font-black">{Math.round((v3 / (v1 || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F8FAFC] rounded-full overflow-hidden relative shadow-inner">
                        <div 
                            className="h-full  bg-[#065F46] rounded-full" 
                            style={{ width: `${Math.round((v3 / (v1 || 1)) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 py-1 px-2 bg-white border border-black/5 rounded-lg text-[9px] font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-1 shadow-sm">
                        <Download className="w-2.5 h-2.5" /> PDF
                    </button>
                    <button className="flex-1 py-1 px-2 bg-white border border-black/5 rounded-lg text-[9px] font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-1 shadow-sm">
                        <Download className="w-2.5 h-2.5" /> Excel
                    </button>
                </div>
            </div>

            {/* Card 3: Evidence Status (col-span-3) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm min-h-[140px] h-[160px] flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-[#1E293B] uppercase tracking-widest">Minh Chứng</h2>
                    <span className="text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest shadow-sm text-[#065F46] bg-[#F8FAFC] border-black/5">
                        {isEvidenceSubmitted ? 'Đã nộp' : 'Chưa nộp'}
                    </span>
                </div>
                <div className="flex flex-col mt-1">
                    <span className="text-[9px] font-black text-[#64748B] uppercase tracking-tighter mb-0.5">Hạn nộp</span>
                    <span className="text-xl font-black text-[#1E293B] leading-none">
                        {expenditure?.evidenceDueAt ? new Date(expenditure.evidenceDueAt).toLocaleDateString('vi-VN') : '--'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExpenditureDetailStats;
