'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    isCurrency: boolean;
    bgColor: string;
    titleColor: string;
    valueColor: string;
}

export const StatCard = ({ title, value, isCurrency, bgColor, titleColor, valueColor }: StatCardProps) => (
    <div className={`${bgColor} p-5 rounded-[32px] shadow-sm flex flex-col justify-between border border-white/60 h-full transition-all hover:shadow-md group relative overflow-hidden`}>
        <div className="flex justify-between items-start">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${titleColor} opacity-70`}>{title}</span>
            <button className="h-7 w-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm border border-white/60 transition-all group-hover:bg-white group-hover:scale-105">
                <Plus className="h-3.5 w-3.5 text-gray-400 rotate-45" />
            </button>
        </div>
        <div className={`text-[22px] font-black ${valueColor} tracking-tight font-sans truncate mb-1`}>
            {isCurrency ? (
                <>
                    {typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value} <span className="underline ml-0.5 text-[14px]">đ</span>
                </>
            ) : value}
        </div>
    </div>
);
