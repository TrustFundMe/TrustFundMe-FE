'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, PlusCircle, MinusCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Aurora from '@/components/ui/Aurora';
import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AccountCampaignTabbar from '../expenditures/components/AccountCampaignTabbar';

interface TransactionItem {
    id: string;
    type: 'DONATION' | 'INTERNAL_TRANSFER' | 'EXPENDITURE' | 'REFUND';
    description: string;
    amount: number;
    date: string;
    balanceAfter: number;
}

function CampaignTransactionsContent() {
    const searchParams = useSearchParams();
    const campaignId = searchParams?.get('campaignId');
    const { user } = useAuth();
    
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    
    // Optimized: Fetch aggregated history from a single backend endpoint
    useEffect(() => {
        const load = async () => {
            if (!campaignId) return;
            try {
                setLoading(true);
                const camp = await campaignService.getById(Number(campaignId));
                setCampaign(camp);

                const CAMPAIGN_URL = process.env.NEXT_PUBLIC_CAMPAIGN_API_URL || 'http://localhost:8082';
                const response = await fetch(`${CAMPAIGN_URL}/api/campaigns/${campaignId}/transactions-history`);
                
                if (response.ok) {
                    const history = await response.json();
                    setTransactions(history);
                } else {
                    console.error('Failed to fetch aggregated history');
                    setTransactions([]);
                }
            } catch (error) {
                console.error(error);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [campaignId]);

    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden font-sans bg-white pb-20">
                <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                    <div className="h-6 w-32 bg-slate-100 animate-pulse rounded-full mb-8"></div>
                    <div className="flex flex-col lg:flex-row justify-between mb-8 gap-10">
                        <div className="flex-1">
                            <div className="h-16 w-3/4 bg-slate-100 animate-pulse rounded-2xl mb-4"></div>
                            <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded-lg mb-10"></div>
                            <div className="h-40 w-full bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
                        </div>
                        <div className="w-full lg:w-[450px] space-y-4">
                            <div className="h-12 w-full bg-slate-100 animate-pulse rounded-full"></div>
                            <div className="h-48 w-full bg-slate-50 animate-pulse rounded-3xl"></div>
                        </div>
                    </div>
                    <div className="h-[500px] w-full bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#f8faeb] p-8">
                <Link href="/account/campaigns" className="text-emerald-700 font-bold uppercase text-xs flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </Link>
                <div className="mt-8">Không tìm thấy chiến dịch</div>
            </div>
        );
    }

    // Calculate chart data from transactions
    const chartData = [...transactions].reverse().map((t, idx) => ({
        name: new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        value: t.balanceAfter
    }));

    const totalPlus = transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
    const totalMinus = transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    const getTypeBlock = (type: string) => {
        if (type === 'DONATION') return <div className="flex items-center gap-2"><div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><PlusCircle className="w-4 h-4"/></div> <span className="font-bold text-sm text-slate-700">Quyên góp</span></div>;
        if (type === 'EXPENDITURE') return <div className="flex items-center gap-2"><div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg"><MinusCircle className="w-4 h-4"/></div> <span className="font-bold text-sm text-slate-700">Chi tiêu</span></div>;
        if (type === 'REFUND') return <div className="flex items-center gap-2"><div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><PlusCircle className="w-4 h-4"/></div> <span className="font-bold text-sm text-slate-700">Hoàn trả chi phí</span></div>;
        if (type === 'INTERNAL_TRANSFER') return <div className="flex items-center gap-2"><div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><PlusCircle className="w-4 h-4"/></div> <span className="font-bold text-sm text-slate-700">Quỹ chung</span></div>;
        return <span>{type}</span>;
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans bg-white">
            {/* Aurora Background */}
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none opacity-50 z-0"
                 style={{ WebkitMaskImage: 'linear-gradient(to bottom, white 30%, transparent 100%)', maskImage: 'linear-gradient(to bottom, white 30%, transparent 100%)' }}>
                <Aurora
                    colorStops={["#10b981", "#facc15", "#ffffff"]}
                    amplitude={0.6}
                    blend={0.5}
                />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                {/* Back link */}
                <Link href={`/account/campaigns`} className="inline-flex items-center text-emerald-900/60 hover:text-emerald-900 mb-6 transition-colors text-[10px] font-black uppercase tracking-[2px]">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chiến dịch
                </Link>

                {/* Top Section - Reduced height approximation */}
                <div className="flex flex-col lg:flex-row justify-between mb-2 lg:h-[240px]">
                    {/* Left side: Title and Chart */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-[#1a2e2a] tracking-tight mb-1 mt-2" style={{ fontFamily: 'var(--font-playfair-display), serif' }}>Trang Biến động Số dư</h1>
                            <p className="text-black text-lg italic font-medium">Chiến dịch: {campaign.title}</p>
                        </div>
                        
                        <div className="flex-1 min-h-[150px] relative">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest absolute top-0 left-2 z-10">Net Change</p>
                            <div className="h-full w-[95%] bottom-0 absolute ml-[-20px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#418d72" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#418d72" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1a2e2a', opacity: 0.6 }} dy={10} />
                                        <Tooltip 
                                            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#377a62" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Button and Stats */}
                    <div className="w-full lg:w-[450px] flex flex-col justify-between shrink-0">
                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1a2e2a] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-[#0f1b18] transition-all hover:scale-105 active:scale-95">
                                <Save className="w-4 h-4" />
                                Xuất báo cáo
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-end pt-8 pr-4">
                            <div>
                                <p className="text-xs font-black text-black uppercase tracking-[2px] mb-2 flex items-center gap-2">Tổng quan</p>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Số dư hiện tại</p>
                                <p className="text-3xl font-black text-[#1a2e2a] tracking-tighter">{new Intl.NumberFormat('vi-VN').format(campaign.balance)} <span className="text-[10px] align-top">VNĐ</span></p>
                            </div>
                            
                            <div className="text-right flex flex-col gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-black uppercase tracking-[2px] mb-0.5 flex items-center gap-2 justify-end">
                                        <PlusCircle className="w-4 h-4 text-emerald-600"/> Tổng nhận
                                    </p>
                                    <p className="text-xl font-black text-[#377a62]">+{new Intl.NumberFormat('vi-VN').format(totalPlus)} <span className="text-[10px] gap-1 align-top relative top-1">VNĐ</span></p>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5 flex items-center gap-2 justify-end">
                                        <MinusCircle className="w-4 h-4 text-rose-600"/> Tổng trừ
                                    </p>
                                    <p className="text-xl font-black text-rose-700 tracking-tighter">-{new Intl.NumberFormat('vi-VN').format(totalMinus)} <span className="text-[10px] gap-1 align-top relative top-1">VNĐ</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-t-[2.5rem] rounded-b-3xl shadow-xl shadow-emerald-900/5 border border-white p-0 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 lg:p-8 pb-0">
                        <h2 className="text-xl font-black text-[#1a2e2a] uppercase tracking-widest mb-4">Chi tiết giao dịch</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                                <tr className="border-b-2 border-emerald-50">
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">STT</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">Nội dung / Ghi chú</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số tiền (VNĐ)</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày tháng</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số dư sau GD</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-gray-400 font-bold italic tracking-widest uppercase text-xs">Chưa có giao dịch nào</td>
                                    </tr>
                                ) : (
                                    transactions.map((t, index) => (
                                        <tr key={t.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors group">
                                            <td className="py-3 px-6 text-sm font-bold text-slate-400">{index + 1}</td>
                                            <td className="py-3 px-4">{getTypeBlock(t.type)}</td>
                                            <td className="py-3 px-4 text-sm font-semibold text-[#1a2e2a]">{t.description}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`text-sm font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(t.amount)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-500 text-center">
                                                {new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-black text-[#1a2e2a] text-right">
                                                {new Intl.NumberFormat('vi-VN').format(t.balanceAfter)}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <button className="text-xs font-black text-[#1a2e2a] hover:text-emerald-700 underline underline-offset-4 decoration-emerald-200 hover:decoration-emerald-500 transition-all opacity-0 group-hover:opacity-100">
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Fixed Pagination Bar at Bottom */}
                    <div className="bg-emerald-50/50 border-t border-emerald-100 p-4 px-8 flex justify-between items-center shrink-0">
                        <p className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest">Hiển thị {transactions.length} giao dịch</p>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 text-emerald-600 hover:bg-white transition-all disabled:opacity-30" disabled>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-800 text-white font-black text-xs">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 text-emerald-600 hover:bg-white transition-all">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 text-emerald-600 hover:bg-white transition-all">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function CampaignTransactionsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#f3efe6]"><div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-700 border-t-transparent"></div></div>}>
            <CampaignTransactionsContent />
        </Suspense>
    );
}
