'use client';

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';
import { GeneralFundStats as StatsInterface, InternalTransaction } from '@/types/internalTransaction';
import { api as axiosInstance } from '@/config/axios';

// --- Extracted Components ---
import { GeneralFundStats } from '@/components/admin/general/GeneralFundStats';
import { GeneralFundChart } from '@/components/admin/general/GeneralFundChart';
import { InternalTransactionHistory } from '@/components/admin/general/InternalTransactionHistory';
import { InternalTransactionForm } from '@/components/admin/general/InternalTransactionForm';

export default function AdminGeneralFundPage() {
    const [stats, setStats] = useState<StatsInterface>({ balance: 0, outcome: 0, income: 0 });
    const [history, setHistory] = useState<InternalTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchCampaigns();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                generalFundApi.getStats(),
                generalFundApi.getHistory()
            ]);
            setStats(statsRes);
            setHistory(historyRes);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu quỹ chung');
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const response = await axiosInstance.get('/api/campaigns/status/APPROVED');
            setCampaigns((response.data as any).filter((c: any) => c.id !== 1));
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    return (
        <div className="h-screen p-6 bg-gray-50 flex flex-col gap-4 overflow-hidden">
            <Toaster position="top-right" />

            {/* Top Row: 2x2 Stats on Left, Chart on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-none">
                {/* Left: 4 Stats Cards (2x2) */}
                <div className="h-full">
                    <GeneralFundStats stats={stats} txCount={history.length} />
                </div>

                {/* Right: Trend Chart */}
                <div className="h-full min-h-[180px]">
                    <GeneralFundChart />
                </div>
            </div>


            {/* Bottom Row: Detailed History */}
            <div className="flex-1 min-h-0 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <InternalTransactionHistory
                    history={history}
                />
            </div>
        </div>
    );
}



