'use client';

import React from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const CashFlowChart = () => {
    const months = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6'];
    const deposits = [45, 65, 55, 75, 30, 52]; // "Tâm" donor deposits
    const disbursed = [15, 25, 28, 22, 12, 28]; // "Tâm" disbursements

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Dòng tiền hệ thống</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tight">86.400.120đ</span>
                        <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-lg">
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            +10%
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1 mr-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#F84D43]" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">QUYÊN GÓP (DONOR)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#F84D43]/20" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">GIẢI NGÂN (DISBURSED)</span>
                        </div>
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-white border-2 border-gray-900 rounded-xl px-4 py-1 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer pr-8 hover:bg-gray-50 transition-colors">
                            <option>Tháng</option>
                            <option>Tuần</option>
                        </select>
                        <ChevronDown className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between px-4 pb-2 relative">
                {/* Grid lines */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                    {[20, 15, 10, 5, 0].map((v) => (
                        <div key={v} className="flex items-center gap-4 w-full">
                            <span className="text-[10px] font-bold text-gray-400 w-6 text-right font-mono">{v}M</span>
                            <div className="flex-1 border-t border-dashed border-gray-300" />
                        </div>
                    ))}
                </div>

                {/* Bars */}
                {months.map((month, i) => (
                    <div key={month} className="flex flex-col items-center gap-4 w-full relative z-10">
                        {i === 3 && (
                            <div className="absolute top-0 transform -translate-y-full mb-8 bg-white border border-gray-100 shadow-xl rounded-xl p-2 px-3 flex flex-col items-center min-w-max z-20">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Th.4 2024</span>
                                <span className="text-xs font-black text-gray-900">16.832.000đ</span>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 h-2 w-2 bg-white border-r border-b border-gray-100"></div>
                            </div>
                        )}
                        <div className="flex gap-2 items-end h-32 w-full justify-center">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${deposits[i]}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-4 rounded-full bg-[#F84D43]"
                            />
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${disbursed[i]}%` }}
                                transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                                className="w-4 rounded-full bg-[#F84D43]/20 border border-[#F84D43]/10"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
