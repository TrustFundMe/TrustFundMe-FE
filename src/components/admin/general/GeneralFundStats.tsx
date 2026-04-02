'use client';

import React from 'react';
import { Database, ArrowUpRight, ArrowDownLeft, Repeat, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { GeneralFundStats as StatsInterface } from '@/types/internalTransaction';

interface StatCardProps {
    title: string;
    value: string | number;
    bgColor: string;
    textColor: string;
}

const StatCard = ({ title, value, bgColor, textColor }: StatCardProps) => (
    <div className={`${bgColor} py-2 px-4 rounded-[16px] shadow-sm flex flex-col justify-center transition-all hover:shadow-md h-full relative`}>
        <div className="flex justify-between items-center mb-0.5">
            <div className={`text-[9px] font-bold ${textColor} opacity-60 uppercase tracking-widest`}>{title}</div>
            <div className="h-5 w-5 rounded-md bg-white/60 flex items-center justify-center">
                <ArrowUpRight className={`h-2.5 w-2.5 ${textColor}`} />
            </div>
        </div>
        <div>
            <div className={`text-base font-black ${textColor} leading-tight truncate`}>
                {value}
            </div>
        </div>
    </div>
);

export function GeneralFundStats({ stats, txCount }: { stats: StatsInterface, txCount: number }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 h-full">

            <StatCard
                title="Balance"
                value={formatCurrency(stats.balance)}
                bgColor="bg-[#FFF5EB]"
                textColor="text-orange-900"
            />
            <StatCard
                title="Spending"
                value={formatCurrency(stats.outcome)}
                bgColor="bg-[#F0FDF4]"
                textColor="text-green-900"
            />
            <StatCard
                title="Portfolio"
                value={formatCurrency(stats.income)}
                bgColor="bg-[#EFF6FF]"
                textColor="text-blue-900"
            />
            <StatCard
                title="Investment"
                value={txCount}
                bgColor="bg-[#F1F5F9]"
                textColor="text-slate-900"
            />
        </div>
    );
}


