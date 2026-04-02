'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Plus,
    Search,
    MoreVertical,
    ChevronRight,
    Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';
import { GeneralFundStats, InternalTransaction } from '@/types/internalTransaction';
import { formatCurrency } from '@/lib/utils';
import { api as axiosInstance } from '@/config/axios';

// --- Shared Components (Reusing AdminDashboard Style) ---

const StatCard = ({ title, value, icon: Icon, colorClass, suffix }: any) => (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
        <div>
            <div className="text-sm font-bold text-gray-400 mb-1">{title}</div>
            <div className="text-2xl font-black text-gray-900 mb-1">
                {formatCurrency(value)}
                {suffix && <span className="text-sm ml-1 text-gray-400 font-bold">{suffix}</span>}
            </div>
            <div className="text-[10px] font-bold text-gray-400">
                Cập nhật <span className="text-gray-900 text-[11px]">vừa xong</span>
            </div>
        </div>
        <div className={`h-12 w-12 rounded-full border-2 border-gray-50 flex items-center justify-center ${colorClass}`}>
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const ChartContainer = ({ title, children }: any) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">{title}</h3>
            <button className="text-gray-400 hover:text-gray-900">
                <MoreVertical className="h-4 w-4" />
            </button>
        </div>
        <div className="flex-1 relative min-h-[250px]">
            {children}
        </div>
    </div>
);

// --- Simple Line Chart SVG ---
const TrendLineChart = () => (
    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
        <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A685B" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#1A685B" stopOpacity="0" />
            </linearGradient>
        </defs>
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="150" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {[0, 25, 50, 75, 100, 125, 150].map(i => (
            <line key={i} x1="0" y1={i} x2="400" y2={i} stroke="#f3f4f6" strokeWidth="1" />
        ))}

        <path
            d="M 0,130 Q 50,110 100,120 T 200,90 T 300,100 T 400,40 V 150 H 0 Z"
            fill="url(#trendGradient)"
        />
        <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M 0,130 Q 50,110 100,120 T 200,90 T 300,100 T 400,40"
            fill="none"
            stroke="#1A685B"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <circle cx="400" cy="40" r="4" fill="#1A685B" stroke="white" strokeWidth="2" />
    </svg>
);

export default function AdminGeneralFundPage() {
    const [stats, setStats] = useState<GeneralFundStats>({ balance: 0, outcome: 0, income: 0 });
    const [history, setHistory] = useState<InternalTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        targetCampaignId: '',
        amount: '',
        type: 'SUPPORT', // SUPPORT (GF -> Camp) or RECOVERY (Camp -> GF)
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

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
            // Lấy danh sách campaign APPROVED để chọn trong form
            const response = await axiosInstance.get('/api/campaigns/status/APPROVED');
            // Filter out General Fund (ID=1)
            setCampaigns((response.data as any).filter((c: any) => c.id !== 1));
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.targetCampaignId || !formData.amount) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                amount: Number(formData.amount),
                type: formData.type,
                reason: formData.reason,
                fromCampaignId: formData.type === 'SUPPORT' ? 1 : Number(formData.targetCampaignId),
                toCampaignId: formData.type === 'SUPPORT' ? Number(formData.targetCampaignId) : 1,
            };

            await generalFundApi.createTransaction(payload);
            toast.success('Giao dịch thành công');
            setFormData({ targetCampaignId: '', amount: '', type: 'SUPPORT', reason: '' });
            fetchData(); // Refresh stats and history
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Giao dịch thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">QUỸ CHUNG <span className="text-gray-400 font-bold ml-2">/ GLOBAL FUND</span></h1>
                    <p className="text-gray-500 font-bold text-sm">Quản lý và điều tiết nguồn vốn hệ thống</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Thống kê nhanh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Số dư khả dụng"
                    value={stats.balance}
                    icon={Database}
                    colorClass="text-blue-600 bg-blue-50 border-blue-100"
                />
                <StatCard
                    title="Tổng cứu trợ (Outcome)"
                    value={stats.outcome}
                    icon={ArrowUpRight}
                    colorClass="text-red-500 bg-red-50 border-red-100"
                />
                <StatCard
                    title="Tổng thu hồi (Income)"
                    value={stats.income}
                    icon={ArrowDownLeft}
                    colorClass="text-emerald-500 bg-emerald-50 border-emerald-100"
                />
            </div>

            {/* Main Content: Chart and Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Trend Chart */}
                <div className="lg:col-span-2">
                    <ChartContainer title="Xu hướng nguồn vốn (7 ngày gần nhất)">
                        <TrendLineChart />
                        <div className="absolute top-0 right-0 p-4 flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1A685B]"></span> Số dư quỹ</div>
                        </div>
                    </ChartContainer>
                </div>

                {/* Right: Transaction Form */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                            <Plus className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Tạo giao dịch nội bộ</h3>
                    </div>

                    <form onSubmit={handleTransaction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Loại giao dịch</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'SUPPORT' })}
                                    className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'SUPPORT' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                                >
                                    Cứu trợ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'RECOVERY' })}
                                    className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'RECOVERY' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                                >
                                    Thu hồi
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Chiến dịch mục tiêu</label>
                            <select
                                value={formData.targetCampaignId}
                                onChange={(e) => setFormData({ ...formData, targetCampaignId: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                            >
                                <option value="">Chọn chiến dịch...</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Số tiền (VNĐ)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">đ</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Lý do / Nội dung</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={3}
                                placeholder="Nhập ghi chú giao dịch..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                            />
                        </div>

                        <button
                            disabled={submitting}
                            className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {submitting ? 'Đang xử lý...' : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Xác nhận giao dịch
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                            <History className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Lịch sử giao dịch quỹ chung</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm giao dịch..."
                                className="bg-gray-50 border border-gray-100 py-2.5 pl-11 pr-5 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 transition-all w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="text-left p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Thời gian</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Loại</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Số tiền</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Nội dung</th>
                                <th className="text-right p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                    <td className="p-6">
                                        <div className="text-xs font-black text-gray-900 mb-0.5">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${tx.type === 'SUPPORT' ? 'bg-red-50 border-red-100 text-red-500' :
                                                tx.type === 'RECOVERY' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                                                    'bg-gray-50 border-gray-100 text-gray-500'
                                            }`}>
                                            {tx.type === 'SUPPORT' ? 'Cứu trợ' : tx.type === 'RECOVERY' ? 'Thu hồi' : 'Khởi tạo'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-sm font-black text-gray-900 leading-none mb-1">
                                            {tx.type === 'SUPPORT' ? '-' : '+'}{formatCurrency(tx.amount)}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs font-bold text-gray-600 max-w-xs">{tx.reason || 'Không có ghi chú'}</div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="h-8 w-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-900 hover:text-white transition-all">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="text-gray-400 font-bold text-sm italic">Chưa có lịch sử giao dịch nào</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
