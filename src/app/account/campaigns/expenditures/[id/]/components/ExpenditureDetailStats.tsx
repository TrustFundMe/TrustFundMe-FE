'use client';

import React from 'react';
import { LayoutGrid, CornerUpRight, ShoppingBag, Wallet } from 'lucide-react';

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-8">
            {/* Card 1: Stats & Chart (col-span-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center h-[120px] gap-4">
                {/* Dynamic Bar Chart */}
                <div className="w-24 h-full flex items-end gap-1.5 pb-2 shrink-0 border-r border-[#F1F5F9] pr-4">
                    <div className="w-3 bg-blue-500/10 rounded-t-sm relative group" style={{ height: `${(v1 / maxVal) * 100}%` }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-blue-600 whitespace-nowrap">{(v1 / 1000).toFixed(0)}K</div>
                        <div className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-sm" style={{ height: '100%' }}></div>
                    </div>
                    <div className="w-3 bg-emerald-500/10 rounded-t-sm relative group" style={{ height: `${(v2 / maxVal) * 100}%` }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#10B981] whitespace-nowrap">{(v2 / 1000).toFixed(0)}K</div>
                        <div className="absolute bottom-0 left-0 w-full bg-[#10B981] rounded-t-sm" style={{ height: '100%' }}></div>
                    </div>
                    <div className="w-3 bg-orange-500/10 rounded-t-sm relative group" style={{ height: `${(v3 / maxVal) * 100}%` }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-orange-600 whitespace-nowrap">{(v3 / 1000).toFixed(0)}K</div>
                        <div className="absolute bottom-0 left-0 w-full bg-orange-500 rounded-t-sm" style={{ height: '100%' }}></div>
                    </div>
                    <div className="w-3 bg-slate-500/10 rounded-t-sm relative group" style={{ height: `${(v4 / maxVal) * 100}%` }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#1E293B] whitespace-nowrap">{(v4 / 1000).toFixed(0)}K</div>
                        <div className="absolute bottom-0 left-0 w-full bg-[#1E293B] rounded-t-sm" style={{ height: '100%' }}></div>
                    </div>
                </div>

                {/* Stats Group */}
                <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter flex items-center gap-1">
                            <LayoutGrid className="w-3.5 h-3.5 text-blue-500" /> DỰ KIẾN
                        </span>
                        <span className="text-sm font-black text-blue-600 tabular-nums">
                            {new Intl.NumberFormat('vi-VN').format(v1)} <span className="text-[10px] font-normal opacity-40">đ</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter flex items-center gap-1">
                            <CornerUpRight className="w-3.5 h-3.5 text-[#10B981]" /> GIẢI NGÂN
                        </span>
                        <span className="text-sm font-black text-[#10B981] tabular-nums">
                            {new Intl.NumberFormat('vi-VN').format(v2)} <span className="text-[10px] font-normal opacity-40">đ</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-orange-500" /> ĐÃ CHI
                        </span>
                        <span className="text-sm font-black text-orange-500 tabular-nums">
                            {new Intl.NumberFormat('vi-VN').format(v3)} <span className="text-[10px] font-normal opacity-40">đ</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-[#1E293B]" /> SỐ DƯ
                        </span>
                        <span className="text-sm font-black text-[#1E293B] tabular-nums underline decoration-slate-100 underline-offset-4">
                            {new Intl.NumberFormat('vi-VN').format(v4)} <span className="text-[10px] font-normal opacity-40">đ</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Card 2: Disbursement Status */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm h-[120px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-[#1E293B] uppercase tracking-tight">GIẢI NGÂN</h2>
                    <span className="text-[9px] font-black text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Hoàn tất</span>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5 uppercase text-[9px] font-black text-[#64748B]">
                        <span>TIẾN ĐỘ</span>
                        <span className="text-[#10B981] text-xs leading-none">{Math.round((v3 / (v1 || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-[#10B981]" style={{ width: `${Math.round((v3 / (v1 || 1)) * 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Card 3: Evidence Status */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm h-[120px] flex flex-col justify-center">
                <h2 className="text-[11px] font-black text-[#1E293B] uppercase tracking-tight mb-3 flex items-center gap-2">
                    Minh Chứng
                </h2>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest mb-1">Hạn nộp</span>
                        <span className="text-sm font-black text-[#1E293B]">
                            {expenditure?.evidenceDueAt ? new Date(expenditure.evidenceDueAt).toLocaleDateString('vi-VN') : '--'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest leading-none">Trạng thái</span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase ${expenditure?.evidenceStatus === 'OVERDUE' ? 'text-red-600 bg-red-50 border-red-200' :
                                expenditure?.evidenceStatus === 'SUBMITTED' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                                    expenditure?.evidenceStatus === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                        'text-amber-500 bg-amber-50 border-amber-100'
                            }`}>
                            {expenditure?.evidenceStatus === 'OVERDUE' ? 'Quá hạn' :
                                expenditure?.evidenceStatus === 'SUBMITTED' ? 'Đã nộp' :
                                    expenditure?.evidenceStatus === 'APPROVED' ? 'Đã duyệt' :
                                        'Chưa nộp'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card 4: Description */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm h-[120px] flex flex-col overflow-hidden">
                <h2 className="text-[11px] font-black text-[#1E293B] uppercase tracking-tight mb-2 pb-1.5 border-b border-slate-50">Chi tiết</h2>
                <div className="text-[10px] text-[#64748B] leading-snug italic line-clamp-3 overflow-hidden">
                    {expenditure?.plan || 'Nhiệm vụ chi tiêu.'}
                </div>
            </div>
        </div>
    );
};

export default ExpenditureDetailStats;
