'use client';

import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    isCurrency: boolean;
    bgColor: string;
    titleColor: string;
    valueColor: string;
}

export const StatCard = ({ title, value, isCurrency, bgColor, titleColor, valueColor }: StatCardProps) => (
    <div className={`${bgColor} p-4 rounded-[24px] shadow-sm flex flex-col justify-between border border-white/40 h-full`}>
        <div className="flex justify-between items-start">
            <span className={`text-[9px] font-black uppercase tracking-widest ${titleColor} opacity-80`}>{title}</span>
        </div>
        <div className={`text-[18px] font-black ${valueColor} tracking-tight font-sans truncate`}>
            {isCurrency ? (
                <>
                    {typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value} <span className="underline ml-0.5 text-[12px]">đ</span>
                </>
            ) : value}
        </div>
    </div>
);
