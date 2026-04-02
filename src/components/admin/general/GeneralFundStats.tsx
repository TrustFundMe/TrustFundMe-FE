'use client';

import React from 'react';
import { Database, ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { GeneralFundStats as StatsInterface } from '@/types/internalTransaction';

interface StatCardProps {
    title: string;
    value: string | number;
    subValue: string;
    icon: React.ElementType;
}

const StatCard = ({ title, value, subValue, icon: Icon }: StatCardProps) => (
    <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md h-full">
        <div className="flex flex-col h-full justify-between">
            <div>
                <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{title}</div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                    {typeof value === 'number' && title.includes('Số tiền') ? formatCurrency(value) : value}
                </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">
                {subValue}
            </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
            <Icon className="h-5 w-5" />
        </div>
    </div>
);

export function GeneralFundStats({ stats, txCount }: { stats: StatsInterface, txCount: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Số dư khả dụng"
                value={formatCurrency(stats.balance)}
                subValue="Nguồn vốn hiện có"
                icon={Database}
            />
            <StatCard
                title="Tổng cứu trợ"
                value={formatCurrency(stats.outcome)}
                subValue="Đã giải ngân"
                icon={ArrowUpRight}
            />
            <StatCard
                title="Tổng thu hồi"
                value={formatCurrency(stats.income)}
                subValue="Đã hoàn lại"
                icon={ArrowDownLeft}
            />
            <StatCard
                title="Tổng giao dịch"
                value={txCount}
                subValue={`Có ${txCount} phiên giao dịch`}
                icon={Repeat}
            />
        </div>
    );
}
