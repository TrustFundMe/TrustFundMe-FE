'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Aurora from '@/components/ui/Aurora';
import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import { paymentService, CassoTransaction } from '@/services/paymentService';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-emerald-100 flex flex-col gap-1 min-w-[220px]">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                    {new Date(data.timestamp).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </span>
                <div className="text-lg font-black text-[#1a2e2a] leading-tight mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.cumulativeTotal)}
                </div>
                <div className="text-xs text-slate-500">
                    Giao dịch: {data.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(data.amount)} VNĐ
                </div>
            </div>
        );
    }
    return null;
};

function CampaignTransactionsContent() {
    const searchParams = useSearchParams();
    const campaignId = searchParams?.get('campaignId');
    const { user } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<CassoTransaction[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (id: number) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        const load = async () => {
            if (!campaignId) return;
            try {
                setLoading(true);
                const [camp, cassoTxns] = await Promise.all([
                    campaignService.getById(Number(campaignId)),
                    paymentService.getCassoTransactionsByCampaign(campaignId),
                ]);
                setCampaign(camp);
                setTransactions(cassoTxns);
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

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.transactionDate || a.createdAt).getTime() - new Date(b.transactionDate || b.createdAt).getTime()
    );

    let cumulative = 0;
    const chartData = sortedTransactions.map((t) => {
        cumulative += t.amount;
        return {
            timestamp: new Date(t.transactionDate || t.createdAt).getTime(),
            amount: t.amount,
            cumulativeTotal: cumulative,
        };
    });

    const totalIn = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const totalOut = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const formatSender = (t: CassoTransaction) => {
        const name = t.counterAccountName;
        const bank = t.counterAccountBankName || t.bankAbbreviation;
        if (name && bank) return `${name} (${bank})`;
        if (name) return name;
        if (t.counterAccountNumber && bank) return `${t.counterAccountNumber} - ${bank}`;
        if (t.counterAccountNumber) return t.counterAccountNumber;
        if (bank) return bank;
        return '—';
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans bg-white">
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none opacity-50 z-0"
                 style={{ WebkitMaskImage: 'linear-gradient(to bottom, white 30%, transparent 100%)', maskImage: 'linear-gradient(to bottom, white 30%, transparent 100%)' }}>
                <Aurora colorStops={["#10b981", "#facc15", "#ffffff"]} amplitude={0.6} blend={0.5} />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                <Link href={`/account/campaigns`} className="inline-flex items-center text-emerald-900/60 hover:text-emerald-900 mb-6 transition-colors text-[10px] font-black uppercase tracking-[2px]">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chiến dịch
                </Link>

                <div className="absolute top-[0px] left-[58%] -translate-x-1/2 pointer-events-none hidden lg:block z-0 opacity-100 animate-in fade-in zoom-in duration-1000">
                    <Image src="/assets/img/campaign/9.png" alt="Piggy Bank" width={350} height={350} className="object-contain drop-shadow-2xl" />
                </div>

                {/* Top Section */}
                <div className="flex flex-col lg:flex-row justify-between mb-2 lg:h-[240px]">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-[#1a2e2a] tracking-tight mb-1 mt-2" style={{ fontFamily: 'var(--font-playfair-display), serif' }}>Giao dịch ngân hàng</h1>
                            <p className="text-black text-lg italic font-medium">Chiến dịch: {campaign.title}</p>
                        </div>

                        <div className="flex-1 min-h-[150px] relative">
                            <div className="h-full w-[95%] bottom-0 absolute ml-[-20px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
                                                <stop offset="50%" stopColor="#418d72" stopOpacity={0.08} />
                                                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.12} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']}
                                            axisLine={false} tickLine={false}
                                            tick={{ fontSize: 9, fill: '#1a2e2a', opacity: 0.5, fontWeight: 700 }}
                                            dy={10}
                                            tickFormatter={(ts) => new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone" dataKey="cumulativeTotal"
                                            stroke="#377a62" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)"
                                            dot={{ r: 3, fill: '#377a62', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 5, fill: '#1a2e2a', strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="w-full lg:w-[450px] flex flex-col justify-between shrink-0">
                        <div></div>
                        <div className="flex justify-between items-end pt-8 pr-4">
                            <div>
                                <p className="text-xs font-black text-black uppercase tracking-[2px] mb-2 flex items-center gap-2">Tổng quan</p>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Số dư hiện tại</p>
                                <p className="text-3xl font-black text-[#1a2e2a] tracking-tighter">{new Intl.NumberFormat('vi-VN').format(campaign.balance)} <span className="text-[10px] align-top">VNĐ</span></p>
                            </div>
                            <div className="text-right flex flex-col gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-black uppercase tracking-[2px] mb-0.5 flex items-center gap-2 justify-end">
                                        <Banknote className="w-4 h-4 text-emerald-600"/> Tổng nhận
                                    </p>
                                    <p className="text-xl font-black text-[#377a62]">+{new Intl.NumberFormat('vi-VN').format(totalIn)} <span className="text-[10px] align-top relative top-1">VNĐ</span></p>
                                </div>
                                {totalOut > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-black uppercase tracking-[2px] mb-0.5 flex items-center gap-2 justify-end">
                                            <Banknote className="w-4 h-4 text-rose-600"/> Tổng chi
                                        </p>
                                        <p className="text-xl font-black text-rose-600">-{new Intl.NumberFormat('vi-VN').format(totalOut)} <span className="text-[10px] align-top relative top-1">VNĐ</span></p>
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-slate-400">{transactions.length} giao dịch</p>
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
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                                <tr className="border-b-2 border-emerald-50">
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[50px]">STT</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">Ngày giờ</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px] text-right">Số tiền</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px]">Người gửi / Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400 font-bold italic tracking-widest uppercase text-xs">Chưa có giao dịch nào</td>
                                    </tr>
                                ) : (
                                    transactions.map((t, index) => (
                                        <tr key={t.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-bold text-slate-400">{index + 1}</td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-500 whitespace-nowrap">
                                                {new Date(t.transactionDate || t.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`text-sm font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {t.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(t.amount)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {t.description && t.description.length > 40 ? (
                                                    <div className="flex items-baseline gap-1 flex-wrap">
                                                        <span className="text-sm font-semibold text-[#1a2e2a] break-all">
                                                            {expandedRows.has(t.id) ? t.description : t.description.slice(0, 40) + '...'}
                                                        </span>
                                                        <button
                                                            onClick={() => toggleRow(t.id)}
                                                            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors shrink-0"
                                                        >
                                                            {expandedRows.has(t.id) ? <>Thu gọn <ChevronUp className="w-3 h-3" /></> : <>Xem thêm <ChevronDown className="w-3 h-3" /></>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-semibold text-[#1a2e2a]">{t.description || '—'}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                 {t.amount < 0 ? (
                                                     <span className="text-sm font-semibold text-rose-500 truncate block">Chi phí chiến dịch</span>
                                                 ) : (
                                                     <span className="text-sm font-semibold text-[#1a2e2a] truncate block" title={t.donorName || formatSender(t)}>
                                                         {t.donorName || formatSender(t)}
                                                     </span>
                                                 )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-emerald-50/50 border-t border-emerald-100 p-4 px-8 flex justify-between items-center shrink-0">
                        <p className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest">Hiển thị {transactions.length} giao dịch</p>
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
