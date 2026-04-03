'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';
import { GeneralFundStats, InternalTransaction } from '@/types/internalTransaction';
import { formatCurrency } from '@/lib/utils';
import { api as axiosInstance } from '@/config/axios';
import { InternalTransactionHistory } from '@/components/admin/general/InternalTransactionHistory';

// --- Shared Components (Matching Screenshot exactly) ---

const StatCard = ({ title, value, isCurrency, bgColor, titleColor, valueColor }: any) => (
    <div className={`${bgColor} p-6 rounded-[24px] transition-all hover:scale-[1.01] shadow-sm flex flex-col justify-between h-[160px]`}>
        <div className="flex justify-between items-start">
            <div className={`text-[10px] font-black uppercase tracking-wider ${titleColor}`}>{title}</div>
            <button className="h-6 w-6 rounded-md bg-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100">
                <ArrowUpRight className="h-3 w-3 text-gray-400" />
            </button>
        </div>
        <div className={`text-[22px] font-black ${valueColor} tracking-tight font-sans`}>
            {isCurrency ? (
                <>
                    {typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value} <span className="underline ml-0.5">đ</span>
                </>
            ) : value}
        </div>
    </div>
);

const ChartContainer = ({ title, filter, setFilter, children }: any) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full relative">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{title}</h3>
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-[10px] font-black uppercase text-gray-900 border-2 border-gray-900 rounded-xl px-4 py-1 outline-none cursor-pointer tracking-widest hover:bg-gray-50 transition-colors"
            >
                <option value="NĂM NAY">Năm nay</option>
                <option value="THÁNG NAY">Tháng này</option>
                <option value="TUẦN NAY">Tuần này</option>
            </select>
        </div>
        <div className="flex-1 relative min-h-[220px] w-full">
            {children}
        </div>
    </div>
);

// --- Dynamic Trend Line Chart ---
const TrendLineChart = ({ dataPoints, labels, isPositive, filter }: any) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Calculate SVG paths
    const maxVal = Math.max(...dataPoints, 1);
    const minVal = Math.min(...dataPoints, 0);
    const range = maxVal - minVal || 1;
    const paddingY = 30; // More padding for bottom labels
    const height = 220;
    const width = 500;

    const points = dataPoints.map((val: number, i: number) => {
        const x = dataPoints.length === 1 ? width / 2 : (i / (dataPoints.length - 1)) * width;
        const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
        return { x, y, val };
    });

    const d = `M ${points.map((p: any) => `${p.x},${p.y}`).join(' L ')}`;
    const areaD = `${d} L ${points[points.length - 1]?.x || width},${height} L ${points[0]?.x || 0},${height} Z`;

    const color = isPositive ? '#1a1a1a' : '#1a1a1a'; // As seen in screenshot, black line
    const colorArea = isPositive ? '#16a34a' : '#ef4444'; // Subtle green/red area under it? Wait, screenshot is plain black. Let's make the line black, no gradient for now, or match exactly what user asked ("xanh rêu đậm, giảm màu đỏ"). 
    const finalColor = isPositive ? '#16a34a' : '#ef4444';

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Horizontal Grid Lines */}
                {[0, 0.33, 0.66, 1].map((scale, i) => (
                    <line key={i} x1="0" y1={paddingY + scale * (height - paddingY * 2)} x2={width} y2={paddingY + scale * (height - paddingY * 2)} stroke="#f8fafc" strokeWidth="1.5" />
                ))}

                {/* Line Path */}
                {points.length > 1 && (
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={d}
                        fill="none"
                        stroke={finalColor} // Matches user instruction
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Interaction Overlay */}
                {points.map((p: any, i: number) => (
                    <g key={i} className="group cursor-pointer">
                        {/* Hover visual circle */}
                        <circle cx={p.x} cy={p.y} r="6" fill={finalColor} stroke="white" strokeWidth="2.5"
                            className={`transition-all ${hoverIndex === i ? 'opacity-100 scale-125' : 'opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-125'}`}
                        />
                        {/* Invisible capture area */}
                        <rect x={p.x - (width / dataPoints.length) / 2} y="0" width={width / dataPoints.length} height={height} fill="transparent"
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                        />
                    </g>
                ))}
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                {labels.filter((_: any, i: number) => {
                    if (labels.length > 12) {
                        return i % (Math.ceil(labels.length / 12)) === 0;
                    }
                    return true;
                }).map((l: string, i: number) => (
                    <span key={i} className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{l}</span>
                ))}
            </div>

            {/* Tooltip */}
            {hoverIndex !== null && (
                <div
                    className="absolute z-10 bg-white border border-gray-100 shadow-xl rounded-[16px] p-4 pointer-events-none transform -translate-x-1/2 -translate-y-[130%]"
                    style={{ left: `${(hoverIndex / (points.length - 1 || 1)) * 100}%`, top: `${(points[hoverIndex].y / height) * 100}%` }}
                >
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{filter === 'NĂM NAY' ? 'Tháng ' : ''}{labels[hoverIndex]}</div>
                    <div className="text-[11px] font-black text-gray-900">{formatCurrency(points[hoverIndex].val)}<span className="underline ml-0.5">đ</span></div>
                </div>
            )}
        </div>
    );
};

export default function AdminGeneralFundPage() {
    const [stats, setStats] = useState<GeneralFundStats>({ balance: 0, outcome: 0, income: 0 });
    const [history, setHistory] = useState<InternalTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [chartFilter, setChartFilter] = useState('NĂM NAY');

    useEffect(() => {
        fetchData();
        fetchCampaigns();
        fetchStaff();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                generalFundApi.getStats(),
                generalFundApi.getHistory() // History contains support requests and standard txes
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

    const fetchStaff = async () => {
        try {
            const response = await axiosInstance.get('/api/users/staff');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await generalFundApi.updateStatus(id, status as any);
            toast.success('Đã duyệt yêu cầu thành công');
            fetchData();
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
        const completedHistory = history.filter(tx => tx.status === 'COMPLETED');
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

        if (chartFilter === 'NĂM NAY') {
            labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            points = new Array(12).fill(initialBalance);

            let runningB = initialBalance;
            for (let month = 0; month < 12; month++) {
                const txsInMonth = sortedAsc.filter(tx => {
                    const d = new Date(tx.createdAt);
                    return d.getFullYear() === now.getFullYear() && d.getMonth() === month;
                });

                for (const tx of txsInMonth) {
                    if (tx.toCampaignId === 1) runningB += Number(tx.amount);
                    if (tx.fromCampaignId === 1) runningB -= Number(tx.amount);
                }
                points[month] = runningB;
            }
        } else if (chartFilter === 'THÁNG NAY') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            points = new Array(daysInMonth).fill(initialBalance);

            let runningB = initialBalance;

            const pastTxs = sortedAsc.filter(tx => new Date(tx.createdAt).getMonth() < now.getMonth());
            for (const tx of pastTxs) {
                if (tx.toCampaignId === 1) runningB += Number(tx.amount);
                if (tx.fromCampaignId === 1) runningB -= Number(tx.amount);
            }

            for (let day = 0; day < daysInMonth; day++) {
                const txsInDate = sortedAsc.filter(tx => {
                    const d = new Date(tx.createdAt);
                    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === day + 1;
                });

                for (const tx of txsInDate) {
                    if (tx.toCampaignId === 1) runningB += Number(tx.amount);
                    if (tx.fromCampaignId === 1) runningB -= Number(tx.amount);
                }
                points[day] = runningB;
            }
        } else {
            labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            points = new Array(7).fill(initialBalance);

            let startOfWeek = new Date(now);
            const dayOfWeek = startOfWeek.getDay() === 0 ? 7 : startOfWeek.getDay();
            startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
            startOfWeek.setHours(0, 0, 0, 0);

            let runningB = initialBalance;
            const pastTxs = sortedAsc.filter(tx => new Date(tx.createdAt).getTime() < startOfWeek.getTime());
            for (const tx of pastTxs) {
                if (tx.toCampaignId === 1) runningB += Number(tx.amount);
                if (tx.fromCampaignId === 1) runningB -= Number(tx.amount);
            }

            for (let d = 0; d < 7; d++) {
                const targetDay = new Date(startOfWeek);
                targetDay.setDate(targetDay.getDate() + d);

                const txsInDate = sortedAsc.filter(tx => {
                    const dt = new Date(tx.createdAt);
                    return dt.getDate() === targetDay.getDate() && dt.getMonth() === targetDay.getMonth() && dt.getFullYear() === targetDay.getFullYear();
                });

                for (const tx of txsInDate) {
                    if (tx.toCampaignId === 1) runningB += Number(tx.amount);
                    if (tx.fromCampaignId === 1) runningB -= Number(tx.amount);
                }
                points[d] = runningB;
            }
        }

        isPositive = points[points.length - 1] >= points[0];

        return { labels, points, isPositive };
    }, [history, stats, chartFilter]);

    return (
        <div className="p-8 space-y-6 bg-gray-50 min-h-screen font-sans">
            <Toaster position="top-right" />

            {/* Header Section */}
            {/* Omitted from the user's screenshot, but we keep it minimal if they want it.
                Since screenshot cuts off top, we'll keep a subtle header or remove it. 
                Let's keep it. */}

            {/* Top Section: 2x2 Cards (Left) + Chart (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* 4 Stat Cards in 2x2 grid */}
                <div className="grid grid-cols-2 gap-6">
                    <StatCard
                        title="BALANCE"
                        value={stats.balance}
                        isCurrency={true}
                        bgColor="bg-[#fff7ed]" // light orange
                        titleColor="text-[#df9e6e]"
                        valueColor="text-[#b25528]"
                    />
                    <StatCard
                        title="SPENDING"
                        value={stats.outcome}
                        isCurrency={true}
                        bgColor="bg-[#f0fdf4]" // light green
                        titleColor="text-[#7ea68d]"
                        valueColor="text-[#1d6b38]"
                    />
                    <StatCard
                        title="PORTFOLIO"
                        value={stats.income}
                        isCurrency={true}
                        bgColor="bg-[#f0f9ff]" // light blue
                        titleColor="text-[#88adc6]"
                        valueColor="text-[#1a3f65]"
                    />
                    <StatCard
                        title="INVESTMENT"
                        value={history.length}
                        isCurrency={false}
                        bgColor="bg-[#f8fafc]" // light slate
                        titleColor="text-[#8b9dba]"
                        valueColor="text-[#132034]"
                    />
                </div>

                {/* Trend Chart */}
                <div className="h-full">
                    <ChartContainer title="XU HƯỚNG NGUỒN VỐN" filter={chartFilter} setFilter={setChartFilter}>
                        <TrendLineChart
                            dataPoints={chartData.points}
                            labels={chartData.labels}
                            isPositive={chartData.isPositive} // Dynamically colors the chart
                            filter={chartFilter}
                        />
                    </ChartContainer>
                </div>
            </div>

            {/* Bottom Section: Support Requests Table */}
            <div className="mt-6">
                <InternalTransactionHistory
                    history={history}
                    campaigns={campaigns}
                    users={users}
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>
        </div>
    );
}
