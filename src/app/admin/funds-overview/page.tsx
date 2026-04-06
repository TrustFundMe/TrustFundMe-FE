'use client';

import React from 'react';
import { StatCard } from '@/components/admin/funds-overview/StatCard';
import { ApprovalQueue } from '@/components/admin/funds-overview/ApprovalQueue';

export default function FundsOverviewPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30 p-6 font-sans">
            {/* Top Section: 3 Balance Tracking Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8 shrink-0 h-32">
                <StatCard
                    title="TỔNG QUỸ HỆ THỐNG"
                    value="1.014.104.409"
                    isCurrency={true}
                    bgColor="bg-[#fff7ed]"
                    titleColor="text-[#c29d84]"
                    valueColor="text-[#7c5d41]"
                />
                <StatCard
                    title="TIỀN ĐANG TREO (PENDING)"
                    value="110.100.000"
                    isCurrency={true}
                    bgColor="bg-white"
                    titleColor="text-gray-400"
                    valueColor="text-gray-900"
                />
                <StatCard
                    title="TIỀN ĐÃ GIẢI NGÂN (TOTAL DISBURSED)"
                    value="42.856.000"
                    isCurrency={true}
                    bgColor="bg-[#f0fdf4]"
                    titleColor="text-[#86b595]"
                    valueColor="text-[#2d6a4f]"
                />
            </div>

            {/* Bottom Section: Full Width Transaction Table */}
            <div className="flex-1 min-h-0">
                <ApprovalQueue />
            </div>
        </div>
    );
}
