'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    TrendingUp,
    ArrowUpRight,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';
import { GeneralFundStats, InternalTransaction } from '@/types/internalTransaction';
import { formatCurrency } from '@/lib/utils';
import { api as axiosInstance } from '@/config/axios';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    AreaChart
} from 'recharts';
import { InternalTransactionHistory } from '@/components/admin/general/InternalTransactionHistory';

// --- Shared Components (Matching Screenshot exactly) ---

const StatCard = ({ title, value, isCurrency, bgColor, titleColor, valueColor }: any) => (
    <div className={`${bgColor} p-4 rounded-[28px] shadow-sm flex flex-col justify-between border border-white/40 h-full`}>
        <div className="flex justify-between items-start">
            <span className={`text-[8px] font-black uppercase tracking-widest ${titleColor} opacity-80`}>{title}</span>
            <button className="h-6 w-6 rounded-lg bg-white/60 flex items-center justify-center shadow-sm border border-white/40">
                <Plus className="h-3 w-3 text-gray-400 rotate-45" />
            </button>
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

const ChartContainer = ({ title, filter, setFilter, children }: any) => (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full relative">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{title}</h3>
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-[9px] font-black uppercase text-gray-900 border-2 border-gray-900 rounded-xl px-3 py-1 outline-none cursor-pointer tracking-widest hover:bg-gray-50 transition-colors"
            >
                <option value="NĂM NAY">Năm nay</option>
                <option value="THÁNG NAY">Tháng này</option>
                <option value="TUẦN NAY">Tuần này</option>
            </select>
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </div>
);

// --- Dynamic Trend Line Chart ---
const TrendLineChart = ({ dataPoints, labels, isPositive, filter }: any) => {
    // Transform data for Recharts
    const chartData = dataPoints.map((val: number, i: number) => ({
        name: labels[i] || '',
        balance: val
    }));

    const finalColor = isPositive ? '#0F5D51' : '#ef4444'; // Xanh rêu đậm hoặc Đỏ

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                        dy={10}
                        interval={Math.ceil(labels.length / 8)}
                    />
                    <YAxis
                        hide={true}
                        padding={{ top: 20, bottom: 20 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '12px'
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(value: any) => [new Intl.NumberFormat('vi-VN').format(value) + ' đ', 'Số dư']}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke={finalColor}
                        strokeWidth={3.5}
                        dot={{ r: 4, fill: finalColor, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function AdminGeneralFundPage() {
    const [stats, setStats] = useState<GeneralFundStats & { transactionCount?: number }>({ balance: 0, outcome: 0, income: 0, transactionCount: 0 });
    const [history, setHistory] = useState<InternalTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [chartFilter, setChartFilter] = useState('NĂM NAY');

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, historyPaginated] = await Promise.all([
                generalFundApi.getStats(),
                generalFundApi.getHistoryPaginated(page, pageSize)
            ]);
            setStats(statsRes);
            setHistory(historyPaginated.content);
            setTotalElements(historyPaginated.totalElements);
            setTotalPages(historyPaginated.totalPages);

            // Fetch campaigns and staff using existing local functions
            await Promise.all([fetchCampaigns(), fetchStaff()]);

            // DIAGNOSTIC LOG: Hiển thị bảng ID và Tên chiến dịch để kiểm tra mã ID gốc
            axiosInstance.get('/api/campaigns/status/APPROVED').then(res => {
                console.group('%c [HỆ THỐNG] KIỂM TRA ID CHIẾN DỊCH (ADMIN)', 'color: #ff9800; font-weight: bold;');
                console.table((res.data as any).map((c: any) => ({
                    ID: c.id,
                    TITLE: c.title,
                    BALANCE: new Intl.NumberFormat('vi-VN').format(c.balance) + ' đ'
                })));
                console.groupEnd();
            });

            return { stats: statsRes, history: historyPaginated.content };
        } catch (error) {
            console.error('Failed to fetch data', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [chartFilter]);

    const fetchCampaigns = async () => {
        try {
            const response = await axiosInstance.get('/api/campaigns/status/APPROVED');
            setCampaigns((response.data as any).filter((c: any) => c.id !== 1));
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await axiosInstance.get('/api/users/staff');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        const tx = history.find(t => t.id === id);
        const oldBalance = stats.balance;
        try {
            console.log(`%c >>> BẮT ĐẦU CẬP NHẬT TRẠNG THÁI: ${status} <<< `, 'background: #222; color: #bada55; font-weight: bold;');
            if (tx) {
                console.log('ID Giao dịch:', id);
                console.log('Số tiền:', new Intl.NumberFormat('vi-VN').format(tx.amount), 'đ');
                if (status === 'APPROVED' || status === 'COMPLETED') {
                    console.log('Hành động: TRỪ Quỹ Chung (ID: 1)');
                    console.log(`Hành động: CỘNG Chiến dịch đích (ID: ${tx.toCampaignId})`);
                }
            }

            await generalFundApi.updateStatus(id, status as any);

            if (status === 'REJECTED') {
                console.log('%c ✓ Đã từ chối yêu cầu thành công', 'color: #ef4444; font-weight: bold;');
                toast.success('Đã từ chối yêu cầu thành công');
            } else {
                console.log('%c ✓ Đã duyệt thành công', 'color: #10b981; font-weight: bold;');
                toast.success('Đã duyệt yêu cầu thành công');
            }

            // Đợi fetch lại dữ liệu mới từ SERVER
            const newData = await fetchData();

            if (tx && (status === 'APPROVED' || status === 'COMPLETED')) {
                console.log('%c [XÁC NHẬN SỐ DƯ TỪ SERVER]', 'color: #10b981; font-weight: bold;');
                console.log(' - Trước:', new Intl.NumberFormat('vi-VN').format(oldBalance), 'đ');
                if (newData) {
                    console.log(' - Sau (Thực tế từ DB):', new Intl.NumberFormat('vi-VN').format(newData.stats.balance), 'đ');
                    if (newData.stats.balance === oldBalance) {
                        console.warn('!!! CẢNH BÁO: Số dư DB không đổi sau khi duyệt !!!');
                    }
                }
            }
        } catch (error: any) {
            console.error('Lỗi khi cập nhật trạng thái', error);
            // Error handling toast happens inside InternalTransactionHistory logic if preferred, or here
            throw error;
        }
    };

    // --- Chart Data Computation ---
    const chartData = useMemo(() => {
        let labels: string[] = [];
        let points: number[] = [];
        let isPositive = true;

        if (history.length === 0) {
            return { labels: ['N/A'], points: [stats.balance], isPositive: true };
        }

        const now = new Date();
        const validStatuses = ['COMPLETED', 'APPROVED'];
        const completedHistory = history.filter(tx => validStatuses.includes(tx.status));
        const sortedAsc = [...completedHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        let currentB = Number(stats.balance);

        const orderedDesc = [...completedHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        for (const tx of orderedDesc) {
            if (tx.toCampaignId === 1) {
                currentB -= Number(tx.amount);
            } else if (tx.fromCampaignId === 1) {
                currentB += Number(tx.amount);
            }
        }
        const initialBalance = currentB;

        // Instead of fixed buckets, use actual transaction times for more granularity
        // But still respect the filter range
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        const dayOfWeekOffset = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
        return { labels: [], points: [] };
    }, [history, stats]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30 p-4 font-sans">
            {/* Top Section: 4 Stat Cards in a single row */}
            <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
                <StatCard
                    title="SỐ DƯ"
                    value={stats.balance}
                    isCurrency={true}
                    bgColor="bg-[#fff7ed]" // light orange
                    titleColor="text-[#c29d84]"
                    valueColor="text-[#7c5d41]"
                />
                <StatCard
                    title="CHI TIÊU"
                    value={stats.outcome}
                    isCurrency={true}
                    bgColor="bg-[#f0fdf4]" // light green
                    titleColor="text-[#86b595]"
                    valueColor="text-[#2d6a4f]"
                />
                <StatCard
                    title="TỔNG THU"
                    value={stats.income}
                    isCurrency={true}
                    bgColor="bg-[#f0f9ff]" // light blue
                    titleColor="text-[#88adc6]"
                    valueColor="text-[#1a3f65]"
                />
                <StatCard
                    title="GIAO DỊCH"
                    value={stats.transactionCount || 0}
                    isCurrency={false}
                    bgColor="bg-[#f8fafc]" // gray-50
                    titleColor="text-gray-400"
                    valueColor="text-gray-900"
                />
            </div>

            {/* Bottom Section: Support Requests Table */}
            <div className="flex-1 min-h-0 px-1 pb-1">
                <InternalTransactionHistory
                    history={history}
                    campaigns={campaigns}
                    users={users}
                    onUpdateStatus={handleUpdateStatus}
                    onRefresh={async () => { await fetchData(); }}
                    currentPage={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setPage}
                />
            </div>

            <Toaster position="top-right" />
        </div>
    );
}
