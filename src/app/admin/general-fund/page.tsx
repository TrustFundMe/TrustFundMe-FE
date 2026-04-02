'use client';

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { generalFundApi } from '@/api/generalFundApi';
import { GeneralFundStats as StatsInterface, InternalTransaction } from '@/types/internalTransaction';
import { api as axiosInstance } from '@/config/axios';

// --- Extracted Components ---
import { GeneralFundStats } from '@/components/admin/general/GeneralFundStats';
import { GeneralFundChart } from '@/components/admin/general/GeneralFundChart';
import { GeneralFundActivity } from '@/components/admin/general/GeneralFundActivity';
import { InternalTransactionHistory } from '@/components/admin/general/InternalTransactionHistory';
import { InternalTransactionForm } from '@/components/admin/general/InternalTransactionForm';

export default function AdminGeneralFundPage() {
    const [stats, setStats] = useState<StatsInterface>({ balance: 0, outcome: 0, income: 0 });
    const [history, setHistory] = useState<InternalTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showForm, setShowForm] = useState(false);

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
        <div className="h-full flex flex-col bg-[#F9FAFB] gap-6 overflow-hidden">
            <Toaster position="top-right" />

            {/* Top Row: Stats (Compact height) */}
            <div className="flex-none">
                <GeneralFundStats stats={stats} txCount={history.length} />
            </div>

            {/* Main Content Area: Grid for flexible height */}
            <div className="flex-1 min-h-0 grid grid-rows-[1.2fr_1.8fr] gap-6">

                {/* Middle Row: Chart + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    <div className="lg:col-span-2 min-h-0">
                        <GeneralFundChart />
                    </div>
                    <div className="min-h-0">
                        <GeneralFundActivity history={history} />
                    </div>
                </div>

                {/* Bottom Row: Detailed History */}
                <div className="min-h-0">
                    <InternalTransactionHistory
                        history={history}
                        onAddTransaction={() => setShowForm(true)}
                    />
                </div>
            </div>

            {/* Transaction Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        <InternalTransactionForm
                            campaigns={campaigns}
                            onSuccess={fetchData}
                            onClose={() => setShowForm(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
