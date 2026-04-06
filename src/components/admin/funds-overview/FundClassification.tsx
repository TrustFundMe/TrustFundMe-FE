'use client';

import React from 'react';

export const FundClassification = () => {
    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Loại quỹ trên tổng chiến dịch</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative h-48 w-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Background / Total */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />

                        {/* Item-based - 25% (Pink/Light Red) - Starts at top, goes to the right */}
                        <circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="#F84D43"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset="188.4"
                            className="opacity-30"
                        />

                        {/* Authorized - 75% (Solid Red) - Starts at right, goes to the top */}
                        <circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="#F84D43"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset="62.8"
                            className="rotate-[90deg] origin-center"
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-gray-900 leading-none">75%</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Ủy quyền</span>
                    </div>

                    {/* Percentage Labels with Lines */}
                    {/* Authorized 75% - positioned bottom-left */}
                    <div className="absolute bottom-[20%] left-[-15%] flex items-center gap-1">
                        <span className="text-[11px] font-black text-gray-400">75%</span>
                        <div className="h-px w-6 bg-gray-200 -rotate-[20deg]"></div>
                    </div>

                    {/* Item-based 25% - positioned top-right */}
                    <div className="absolute top-[20%] right-[-15%] flex items-center gap-1">
                        <div className="h-px w-6 bg-gray-200 rotate-[20deg]"></div>
                        <span className="text-[11px] font-black text-gray-400">25%</span>
                    </div>
                </div>

                {/* Simplified Legends */}
                <div className="mt-4 flex gap-8 justify-center w-full">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#F84D43]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Quỹ Ủy quyền</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#F84D43]/30" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Quỹ Vật phẩm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
