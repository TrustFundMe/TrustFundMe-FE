'use client';

import { useEffect, useState, useMemo, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, ShieldCheck, User, MoreVertical } from 'lucide-react';
import Image from 'next/image';

const planeImg = '/assets/img/campaign/5.png';
const blocksImg = '/assets/img/campaign/6.png';
const infinityImg = '/assets/img/campaign/7.png';
const flowBgImg = '/assets/img/campaign/8.png';

import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { Expenditure } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';

export default function CampaignExpendituresPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Withdrawal Modal States
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
    const [evidenceDate, setEvidenceDate] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

    // Expandable Row State
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!campaignId) {
            setError('Campaign ID is missing.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch campaign details
                const campaignData = await campaignService.getById(Number(campaignId));
                setCampaign(campaignData);

                // Fetch expenditures
                const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
                setExpenditures(expendituresData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load campaign data or expenditures.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, isAuthenticated, authLoading, router]);

    const totalSpent = useMemo(() => {
        return expenditures.reduce((sum, exp) => sum + exp.totalAmount, 0);
    }, [expenditures]);

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Duyệt</span>;
            case 'PENDING':
            case 'PENDING_REVIEW':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50/50 text-rose-300 border border-rose-100/30"><AlertCircle className="w-3 h-3 mr-1" /> Từ chối</span>;
            case 'CLOSED':
            case 'WITHDRAWAL_REQUESTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100"><Clock className="w-3 h-3 mr-1" /> Yêu cầu rút tiền</span>;
            case 'DISBURSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Đã giải ngân</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100">{status}</span>;
        }
    };

    const handleRequestWithdrawal = async (id: number) => {
        if (campaign?.type === 'ITEMIZED') {
            setSelectedExpId(id);
            setEvidenceDate('');
            setModalError(null);
            setShowWithdrawalModal(true);
            return;
        }

        if (!confirm('Xác nhận gửi yêu cầu rút tiền cho kế hoạch này?')) return;

        try {
            setLoading(true);
            const updated = await expenditureService.requestWithdrawal(id);
            setExpenditures(prev => prev.map(exp => exp.id === id ? updated : exp));
            alert('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Withdrawal request failed:', err);
            alert(err.response?.data?.message || 'Yêu cầu rút tiền thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const submitWithdrawal = async () => {
        if (!selectedExpId || !evidenceDate) {
            setModalError('Vui lòng chọn hạn nộp minh chứng.');
            return;
        }

        const selectedDate = new Date(evidenceDate);
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        if (selectedDate < now) {
            setModalError('Hạn nộp minh chứng không được ở trong quá khứ.');
            return;
        }

        if (selectedDate > oneMonthLater) {
            setModalError('Hạn nộp minh chứng không được quá 1 tháng kể từ hiện tại.');
            return;
        }

        try {
            setSubmittingWithdrawal(true);
            setModalError(null);

            // Convert to ISO string for backend
            const isoDate = selectedDate.toISOString();
            const updated = await expenditureService.requestWithdrawal(selectedExpId, isoDate);

            setExpenditures(prev => prev.map(exp => exp.id === selectedExpId ? updated : exp));
            setShowWithdrawalModal(false);
            alert('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Withdrawal submission failed:', err);
            setModalError(err.response?.data?.message || 'Yêu cầu rút tiền thất bại.');
        } finally {
            setSubmittingWithdrawal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-400 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error || 'Campaign not found'}
                </div>
                <Link href="/account/campaigns" className="mt-4 inline-flex items-center text-[#dc2626] hover:text-red-700 font-bold uppercase tracking-tight text-xs">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/account/campaigns" className="inline-flex items-center text-black/40 hover:text-black mb-6 transition-colors text-[10px] font-black uppercase tracking-[2px]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Campaigns
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tighter leading-none">{campaign.title}</h1>
                            <p className="mt-3 text-sm font-bold text-black/40 flex items-center">
                                Quản lý chi tiêu cho chiến dịch
                                <span className={`ml-4 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${campaign.type === 'AUTHORIZED'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : 'bg-red-50 text-[#dc2626] border-red-100'
                                    }`}>
                                    {campaign.type === 'AUTHORIZED' ? 'Ủy quyền' : 'Tự lập'}
                                </span>
                            </p>
                        </div>
                        <Link
                            href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                            className="inline-flex items-center px-8 py-3 rounded-full shadow-2xl shadow-red-900/10 text-xs font-black uppercase tracking-[1px] text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo khoản chi mới
                        </Link>
                    </div>
                </div>

                {/* Stats - Claymorphic Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Balance */}
                    <div className="relative h-[210px] bg-[#2d3a30] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                        <div className="absolute top-[-25%] right-[-10%] w-[200px] h-[200px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                            <Image src={planeImg} alt="Balance" width={200} height={200} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                {new Intl.NumberFormat('vi-VN').format(campaign.balance)} <span className="text-[12px] align-top opacity-60">VNĐ</span>
                            </h3>
                            <p className="text-[12px] font-black text-white/50 uppercase tracking-[2px]">Số dư hiện tại</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2d3a30] transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Count */}
                    <div className="relative h-[210px] bg-[#a8ba9a] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#a8ba9a]/20 border border-[#a8ba9a]/50">
                        <div className="absolute top-[-20%] right-[-5%] w-[180px] h-[180px] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
                            <Image src={blocksImg} alt="Expenditures" width={180} height={180} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[#2d3a30] tracking-tighter leading-none mb-3">
                                {expenditures.length} <span className="text-[12px] align-top opacity-40">KHOẢN</span>
                            </h3>
                            <p className="text-[12px] font-black text-[#2d3a30]/50 uppercase tracking-[2px]">Tổng khoản chi</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-[#2d3a30] flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Spent */}
                    <div className="relative h-[210px] bg-[#e3dec8] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#e3dec8]/20 border border-[#e3dec8]/50">
                        <div className="absolute top-[-20%] right-[-5%] w-[180px] h-[180px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">
                            <Image src={infinityImg} alt="Total Spent" width={180} height={180} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[#2d3a30] tracking-tighter leading-none mb-3">
                                {new Intl.NumberFormat('vi-VN').format(totalSpent)} <span className="text-[12px] align-top opacity-40">VNĐ</span>
                            </h3>
                            <p className="text-[12px] font-black text-[#2d3a30]/50 uppercase tracking-[2px]">Tổng tiền đã chi</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-[#2d3a30] flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Flow Diagrams - Refined Aesthetics */}
                <div className="mb-12">
                    {campaign.type === 'AUTHORIZED' && (
                        <div className="pl-6 pr-10 py-6 bg-white relative group/flow border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center">
                            <div className="w-72 h-72 flex-shrink-0 relative z-20 lg:-ml-14 lg:-mr-16 transition-transform duration-700 group-hover/flow:scale-110 pointer-events-none drop-shadow-2xl">
                                <Image src={flowBgImg} alt="Flow Bg" width={300} height={300} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 relative z-10 py-2">
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[4px] mb-4 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> QUY TRÌNH GIẢI NGÂN (QUỸ ỦY QUYỀN)
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { title: 'Nhận Donate', desc: 'Ghi nhận & cập nhật số dư' },
                                        { title: 'Gửi yêu cầu', desc: 'Kế hoạch & tiền rút (≤ quỹ)' },
                                        { title: 'Staff duyệt', desc: 'Phê duyệt hoặc Từ chối' },
                                        { title: 'Chuyển tiền', desc: '3 ngày (không tính lễ/tết)' },
                                        { title: 'Up minh chứng', desc: 'Đầy đủ & đúng thời hạn' },
                                    ].map((item, idx, arr) => {
                                        const isActive = idx === 0;
                                        return (
                                            <div
                                                key={idx}
                                                className={`relative flex-1 min-w-[170px] py-6 px-10 transition-all duration-500 overflow-hidden ${isActive ? 'bg-[#1b4332] text-white' : 'bg-[#f4f7f6] text-[#1b4332]'
                                                    }`}
                                                style={{
                                                    clipPath: idx === 0
                                                        ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                                        : idx === arr.length - 1
                                                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                            : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)',
                                                    marginLeft: idx === 0 ? '0' : '-18px'
                                                }}
                                            >
                                                <div className="relative z-10 flex flex-col items-start ml-2">
                                                    <span className={`text-[13px] font-black leading-tight tracking-tight ${isActive ? 'text-white' : 'text-[#1b4332]'}`}>
                                                        {item.title}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-tight`}>
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {campaign.type === 'ITEMIZED' && (
                        <div className="pl-6 pr-10 py-6 bg-white relative group/flow border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center">
                            <div className="w-72 h-72 flex-shrink-0 relative z-20 lg:-ml-14 lg:-mr-16 transition-transform duration-700 group-hover/flow:scale-110 pointer-events-none drop-shadow-2xl">
                                <Image src={flowBgImg} alt="Flow Bg" width={300} height={300} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 relative z-10 py-2">
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[4px] mb-4 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> QUY TRÌNH GIẢI NGÂN (QUỸ TỰ LẬP)
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { title: 'Nhận Donate', desc: 'Ghi nhận & cập nhật số dư' },
                                        { title: 'Gửi yêu cầu', desc: 'Kế hoạch & tiền rút (≤ quỹ)' },
                                        { title: 'Staff duyệt', desc: 'Phê duyệt hoặc Từ chối' },
                                        { title: 'Chuyển tiền', desc: '3 ngày (không tính lễ/tết)' },
                                        { title: 'Up minh chứng', desc: 'Đầy đủ & đúng thời hạn' },
                                    ].map((item, idx, arr) => {
                                        const isActive = idx === 0;
                                        return (
                                            <div
                                                key={idx}
                                                className={`relative flex-1 min-w-[170px] py-6 px-10 transition-all duration-500 overflow-hidden ${isActive ? 'bg-[#1b4332] text-white' : 'bg-[#f4f7f6] text-[#1b4332]'
                                                    }`}
                                                style={{
                                                    clipPath: idx === 0
                                                        ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                                        : idx === arr.length - 1
                                                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                            : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)',
                                                    marginLeft: idx === 0 ? '0' : '-18px'
                                                }}
                                            >
                                                <div className="relative z-10 flex flex-col items-start ml-2">
                                                    <span className={`text-[13px] font-black leading-tight tracking-tight ${isActive ? 'text-white' : 'text-[#1b4332]'}`}>
                                                        {item.title}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-tight`}>
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expenditure List */}
                <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] rounded-[3rem] border border-black/5 overflow-hidden">
                    <div className="px-10 py-6 border-b border-black/5 bg-white flex justify-between items-center">
                        <h2 className="text-[10px] font-black text-black/30 uppercase tracking-[3px]">Danh sách các khoản chi</h2>
                    </div>

                    {expenditures.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-[2rem] bg-gray-50 text-black/10 mb-6">
                                <FileText className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-black tracking-tight">Chưa có khoản chi nào</h3>
                            <p className="mt-2 text-sm font-bold text-black/30">Bắt đầu bằng cách tạo một khoản chi mới cho chiến dịch này.</p>
                            <div className="mt-10">
                                <Link
                                    href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                                    className="inline-flex items-center px-8 py-3 rounded-full shadow-xl shadow-red-900/5 text-[10px] font-black uppercase tracking-widest text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                                    Tạo khoản chi đầu tiên
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-black/5">
                                    <tr>
                                        <th scope="col" className="px-10 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Mô tả / Kế hoạch
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Trạng thái
                                        </th>
                                        {campaign.type === 'AUTHORIZED' && (
                                            <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                                Ngày báo cáo
                                            </th>
                                        )}
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Hành động
                                        </th>
                                        <th scope="col" className="relative px-10 py-5">
                                            <span className="sr-only">Expand</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {expenditures.map((exp) => {
                                        const isExpanded = expandedRowId === exp.id;
                                        return (
                                            <Fragment key={exp.id}>
                                                <tr
                                                    onClick={() => setExpandedRowId(isExpanded ? null : exp.id)}
                                                    className={`cursor-pointer transition-[background-color] duration-300 group ${isExpanded ? 'bg-red-50/10' : 'hover:bg-red-50/10 even:bg-slate-50/30'
                                                        }`}
                                                >
                                                    <td className="px-10 py-6">
                                                        <div className={`text-sm font-black transition-colors ${isExpanded ? 'text-red-900' : 'text-black group-hover:text-red-900'}`}>
                                                            {exp.plan || 'Chi tiêu không tên'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap text-black font-bold">
                                                        {getStatusBadge(exp.status)}
                                                    </td>
                                                    {campaign.type === 'AUTHORIZED' && (
                                                        <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-black/60">
                                                            {exp.evidenceDueAt ? new Date(exp.evidenceDueAt).toLocaleDateString() : '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-black/60">
                                                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-3">
                                                            {exp.isWithdrawalRequested ? (
                                                                <span className="text-[10px] font-black uppercase text-red-900 flex items-center gap-1">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Đã yêu cầu
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {(campaign.type === 'ITEMIZED' && (exp.status === 'APPROVED' || (exp.status as string) === 'CLOSED')) ? (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRequestWithdrawal(exp.id);
                                                                            }}
                                                                            className="px-4 py-1.5 rounded-lg bg-red-50 text-red-900 text-[10px] font-black uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all shadow-sm"
                                                                        >
                                                                            Rút tiền
                                                                        </button>
                                                                    ) : campaign.type === 'AUTHORIZED' ? (
                                                                        <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                                                                            <AlertCircle className="w-3.5 h-3.5" /> Chờ báo cáo
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ArrowUpRight className={`w-5 h-5 transition-[color,opacity] ${isExpanded ? 'text-red-900' : 'text-black/10 group-hover:text-red-900 opacity-60 group-hover:opacity-100'}`} />
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Content with LOG Timeline */}
                                                <tr>
                                                    <td colSpan={campaign.type === 'AUTHORIZED' ? 6 : 5} className="p-0 border-none relative overflow-hidden">
                                                        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                            <div className="overflow-hidden">
                                                                {isExpanded && (
                                                                    <div className="px-10 py-12 bg-gray-50/30 border-t border-black/5">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                                                            {/* Column 1: LOG Timeline */}
                                                                            <div>
                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40 mb-10 flex items-center gap-2">
                                                                                    LOG
                                                                                </h4>
                                                                                <div className="relative pl-8 space-y-12">
                                                                                    {/* Vertical Dotted Line */}
                                                                                    <div className="absolute left-[3.5px] top-2 bottom-6 w-[2px] border-l-2 border-dotted border-gray-200"></div>

                                                                                    {[
                                                                                        { type: 'green', label: 'Yêu cầu được tạo', time: '20 Th02, 2024 10:30 AM' },
                                                                                        { type: 'green', label: 'Đã gửi lệnh chuyển tiền', time: '20 Th02, 2024 10:45 AM' },
                                                                                        { type: 'red', label: 'Bị đánh dấu bất thường', time: '21 Th02, 2024 02:15 PM' },
                                                                                        { type: 'red', label: 'Chờ Quản trị viên xử lý', time: '21 Th02, 2024 02:30 PM' },
                                                                                        { type: 'red', label: 'Đang mở cuộc điều tra', time: '22 Th02, 2024 09:00 AM' },
                                                                                    ].map((log, idx) => (
                                                                                        <div key={idx} className="relative group/log">
                                                                                            {/* Timeline Dot */}
                                                                                            <div className={`absolute -left-[32px] top-1 w-2.5 h-2.5 rounded-full z-10 
                                                                                                ${log.type === 'green' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-red-600 ring-4 ring-red-50'}`}>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className={`text-sm font-black block leading-none mb-1.5 transition-colors 
                                                                                                    ${log.type === 'green' ? 'text-emerald-700' : 'text-red-700'}`}>
                                                                                                    {log.label}
                                                                                                </span>
                                                                                                <span className="text-[10px] font-bold text-black/40 block uppercase tracking-wide">
                                                                                                    {log.time}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 2: INVESTIGATION & EVIDENCE */}
                                                                            <div className="flex flex-col gap-12 lg:pl-12 lg:border-l border-black/5">
                                                                                <div>
                                                                                    <div className="flex items-center justify-between mb-10">
                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">
                                                                                            INVESTIGATION
                                                                                        </h4>
                                                                                        {exp.isWithdrawalRequested && (
                                                                                            <span className="px-3 py-1 bg-red-50 text-red-900 text-[8px] font-black uppercase tracking-widest rounded-full">In Review</span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                                                        <div className="space-y-10">
                                                                                            <div>
                                                                                                <p className="text-[9px] font-black uppercase tracking-[2px] text-black/20 mb-3">Ngày tạo yêu cầu</p>
                                                                                                <p className="text-sm font-black text-black">20 Th02, 2024 10:30 AM</p>
                                                                                            </div>

                                                                                            <div className="space-y-3">
                                                                                                <p className="text-[9px] font-black uppercase tracking-[2px] text-black/20">Người phụ trách</p>
                                                                                                <div className="flex items-center gap-3 group/admin">
                                                                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-black/5 overflow-hidden group-hover/admin:ring-red-900/20 transition-colors">
                                                                                                        <User className="w-6 h-6 text-black/20 group-hover:text-red-900/40 transition-colors" />
                                                                                                    </div>
                                                                                                    <span className="text-sm font-black text-black group-hover:text-red-900 transition-colors">Staff duyệt bảng này</span>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="space-y-4">
                                                                                                <p className="text-[9px] font-black uppercase tracking-[2px] text-black/20">Trạng thái xử lý</p>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <div className="w-3 h-3 rounded-full bg-red-900"></div>
                                                                                                    {[1, 2, 3, 4].map(d => (
                                                                                                        <div key={d} className="w-3 h-3 rounded-full bg-black/5"></div>
                                                                                                    ))}
                                                                                                </div>
                                                                                                <p className="text-xs font-bold leading-relaxed text-black/50 italic font-serif">
                                                                                                    "Yêu cầu rút tiền đang được xem xét chi tiết do có sự chênh lệch lớn trong các báo cáo minh chứng trước đó."
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-4">
                                                                                            <p className="text-[9px] font-black uppercase tracking-[2px] text-black/20">Minh chứng giao dịch</p>
                                                                                            <div className="relative aspect-[4/3] rounded-3xl bg-gray-100 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center group/evidence cursor-zoom-in">
                                                                                                {/* Placeholder for Transaction Screenshot */}
                                                                                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-gray-200 opacity-60"></div>
                                                                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                                                                    <FileText className="w-8 h-8 text-black/10 group-hover/evidence:text-red-900/40 transition-all duration-500 scale-90 group-hover/evidence:scale-110" />
                                                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-black/30">Transfer Receipt</span>
                                                                                                </div>
                                                                                                {/* Mock "Success" Overlay */}
                                                                                                <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg">Verified</div>
                                                                                            </div>
                                                                                            <p className="text-[9px] font-bold text-black/30 italic text-center">Giao dịch thực hiện vào 21 Th02, 2024</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-auto pt-8 border-t border-black/5 flex gap-4">
                                                                                    <button
                                                                                        onClick={() => router.push(`/account/campaigns/expenditures/${exp.id}?campaignId=${campaign.id}`)}
                                                                                        className="flex-1 p-6 rounded-[2rem] bg-black text-white hover:bg-red-900 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-between group"
                                                                                    >
                                                                                        <span className="text-[10px] font-black uppercase tracking-[2.5px]">Xem chi tiết đầy đủ</span>
                                                                                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                                                                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                                                        </div>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div >

            {/* Withdrawal Modal */}
            {
                showWithdrawalModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-black tracking-tighter mb-2">Yêu cầu giải ngân</h3>
                                <p className="text-xs font-bold text-black/40 mb-8 bg-red-50/50 p-4 rounded-2xl border border-red-100/50 leading-relaxed italic">
                                    <strong>Lưu ý quan trọng:</strong> Yêu cầu này sẽ chốt đợt quyên góp hiện tại để tiến hành giải ngân. Vui lòng xác định hạn nộp minh chứng chi tiêu.
                                </p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="evidenceDate" className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">
                                            Hạn nộp minh chứng chi tiêu
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="evidenceDate"
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white outline-none transition-all"
                                            value={evidenceDate}
                                            onChange={(e) => setEvidenceDate(e.target.value)}
                                        />
                                        <p className="mt-1 text-[9px] font-bold text-black/20 uppercase tracking-widest ml-2 italic">Ràng buộc: Không quá 1 tháng kể từ hôm nay.</p>
                                    </div>

                                    {modalError && (
                                        <div className="p-4 bg-red-50 text-[#dc2626] text-[10px] font-black uppercase tracking-tight rounded-2xl flex items-center gap-3 animate-shake">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {modalError}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => setShowWithdrawalModal(false)}
                                        className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                                        disabled={submittingWithdrawal}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={submitWithdrawal}
                                        className="flex-[2] px-4 py-3 bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        disabled={submittingWithdrawal}
                                    >
                                        {submittingWithdrawal ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>Xác nhận yêu cầu</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
