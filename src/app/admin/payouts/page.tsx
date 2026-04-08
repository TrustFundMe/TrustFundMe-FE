'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    CreditCard,
    Search,
    Eye,
    X,
    ExternalLink,
    ChevronRight,
    Tag,
    RefreshCcw,
    DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { useAuth } from '@/contexts/AuthContextProxy';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import type {
    RequestStatus,
    ExpenditureRequest as BaseExpenditureRequest
} from '@/components/staff/request/RequestTypes';

type TabType = 'PAYOUT' | 'REFUND';

interface ExpenditureRequest extends BaseExpenditureRequest {
    campaignCoverImage?: string | null;
    fromBankCode?: string;
    fromAccountNumber?: string;
    fromAccountHolderName?: string;
    toBankCode?: string;
    toAccountNumber?: string;
    toAccountHolderName?: string;
    campaignType?: string;
}

interface RefundTransaction {
    id: string;
    expenditureId: number;
    expenditureIdStr: string;
    campaignId: number;
    campaignTitle: string;
    campaignCoverImage?: string | null;
    amount: number;
    status: string;
    proofUrl?: string;
    fromBankCode?: string;
    fromAccountNumber?: string;
    fromAccountHolderName?: string;
    toBankCode?: string;
    toAccountNumber?: string;
    toAccountHolderName?: string;
    createdAt: string;
}

function formatVnd(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api/')) return `/api-backend${url}`;
    return url;
}

export default function AdminPayoutsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expenditureRows, setExpenditureRows] = useState<ExpenditureRequest[]>([]);
    const [refundTransactions, setRefundTransactions] = useState<RefundTransaction[]>([]);
    const [selectedExp, setSelectedExp] = useState<ExpenditureRequest | null>(null);
    const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('PAYOUT');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const campaignsData = await campaignService.getAll(0, 1000);
            const allCampaigns = campaignsData.content;
            const expenditurePromises = allCampaigns.map(c => expenditureService.getByCampaignId(c.id));
            const expenditureResults = await Promise.all(expenditurePromises);
            const allExps = expenditureResults.flat();

            // Collect all media for campaigns
            const mediaMap: Record<number, string | null> = {};
            await Promise.allSettled(
                allCampaigns.map(async (c) => {
                    try {
                        const mediaData = await mediaService.getMediaByCampaignId(c.id);
                        if (mediaData && mediaData.length > 0) {
                            const firstImage = mediaData.find((m: any) => m.mediaType === 'PHOTO') || mediaData[0];
                            mediaMap[c.id] = firstImage.url;
                        } else {
                            mediaMap[c.id] = null;
                        }
                    } catch {
                        mediaMap[c.id] = null;
                    }
                })
            );

            // Process expenditures for PAYOUT tab
            const enrichedExps: ExpenditureRequest[] = allExps.map((e) => {
                const campaign = allCampaigns.find(c => c.id === e.campaignId);

                // Get payout transaction amount
                const payoutTx = e.transactions
                    ?.filter(t => t.type === 'PAYOUT')
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

                // Display amount: for ITEMIZED use payout tx amount, for AUTHORIZED use totalExpectedAmount
                let displayAmount = e.totalExpectedAmount;
                if (campaign?.type === 'ITEMIZED' && payoutTx) {
                    displayAmount = payoutTx.amount;
                }

                return {
                    id: `EXP_${e.id}`,
                    createdAt: e.createdAt || new Date().toISOString(),
                    status: (e.status as RequestStatus) || 'PENDING',
                    type: 'EXPENDITURE',
                    campaignId: e.campaignId,
                    campaignTitle: campaign?.title || `Campaign #${e.campaignId}`,
                    campaignCoverImage: mediaMap[e.campaignId] ?? null,
                    campaignType: campaign?.type,
                    requesterName: 'Fund Owner',
                    totalAmount: displayAmount,
                    totalExpectedAmount: e.totalExpectedAmount,
                    expenditureItems: (e.items || []).map((i: any) => ({
                        description: i.category,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                    justification: e.plan || 'No justification provided',
                    disbursementProofUrl: e.disbursementProofUrl || payoutTx?.proofUrl,
                    disbursedAt: (e as any).disbursedAt,
                    bankCode: e.bankCode || payoutTx?.toBankCode,
                    accountNumber: e.accountNumber || payoutTx?.toAccountNumber,
                    accountHolderName: e.accountHolderName || payoutTx?.toAccountHolderName,
                    fromBankCode: payoutTx?.fromBankCode,
                    fromAccountNumber: payoutTx?.fromAccountNumber,
                    fromAccountHolderName: payoutTx?.fromAccountHolderName,
                    toBankCode: payoutTx?.toBankCode,
                    toAccountNumber: payoutTx?.toAccountNumber,
                    toAccountHolderName: payoutTx?.toAccountHolderName,
                    transactions: e.transactions,
                };
            });

            // Process refund transactions for REFUND tab
            const refundTxs: RefundTransaction[] = [];
            allExps.forEach((e) => {
                const campaign = allCampaigns.find(c => c.id === e.campaignId);
                const refundTxsRaw = e.transactions?.filter(t => t.type === 'REFUND') || [];
                refundTxsRaw.forEach(tx => {
                    refundTxs.push({
                        id: `REF_${tx.id}`,
                        expenditureId: tx.expenditureId,
                        expenditureIdStr: `EXP_${tx.expenditureId}`,
                        campaignId: e.campaignId,
                        campaignTitle: campaign?.title || `Campaign #${e.campaignId}`,
                        campaignCoverImage: mediaMap[e.campaignId] ?? null,
                        amount: tx.amount,
                        status: tx.status,
                        proofUrl: tx.proofUrl,
                        fromBankCode: tx.fromBankCode,
                        fromAccountNumber: tx.fromAccountNumber,
                        fromAccountHolderName: tx.fromAccountHolderName,
                        toBankCode: tx.toBankCode,
                        toAccountNumber: tx.toAccountNumber,
                        toAccountHolderName: tx.toAccountHolderName,
                        createdAt: tx.createdAt || new Date().toISOString(),
                    });
                });
            });

            setExpenditureRows(enrichedExps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setRefundTransactions(refundTxs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to fetch expenditures', error);
            toast.error('Không thể tải danh sách chi tiêu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter for PAYOUT tab (expenditures with WITHDRAWAL_REQUESTED or DISBURSED)
    const filteredExpenditures = useMemo(() => {
        return expenditureRows.filter((r) => {
            const matchesStatus = statusFilter === 'ALL'
                ? ((r.status as string) === 'WITHDRAWAL_REQUESTED' || (r.status as string) === 'DISBURSED')
                : r.status === statusFilter;
            const matchesSearch = searchQuery === ''
                || r.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
                || r.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [expenditureRows, statusFilter, searchQuery]);

    // Filter for REFUND tab
    const filteredRefunds = useMemo(() => {
        return refundTransactions.filter((r) => {
            const matchesStatus = statusFilter === 'ALL'
                ? true
                : r.status === statusFilter;
            const matchesSearch = searchQuery === ''
                || r.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
                || r.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [refundTransactions, statusFilter, searchQuery]);

    const paginatedData = useMemo(() => {
        const data = activeTab === 'PAYOUT' ? filteredExpenditures : filteredRefunds;
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    }, [activeTab, filteredExpenditures, filteredRefunds, currentPage, statusFilter, searchQuery]);

    const totalPages = useMemo(() => {
        const data = activeTab === 'PAYOUT' ? filteredExpenditures : filteredRefunds;
        return Math.ceil(data.length / ITEMS_PER_PAGE);
    }, [activeTab, filteredExpenditures, filteredRefunds]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, activeTab]);

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL';

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
    };

    const handleUpdateStatus = async (id: string, next: RequestStatus) => {
        const expId = id.replace('EXP_', '');
        try {
            await expenditureService.updateStatus(Number(expId), next);
            setExpenditureRows(prev => prev.map(r => r.id === id ? { ...r, status: next } : r));
            if (selectedExp?.id === id) setSelectedExp(prev => prev ? { ...prev, status: next } : null);
            toast.success(`Cập nhật trạng thái thành công: ${next}`);
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleUploadProof = async (file: File) => {
        if (!selectedExp) return;
        const expId = Number(selectedExp.id.replace('EXP_', ''));

        setIsLoading(true);
        try {
            const mediaRes = await mediaService.uploadMedia(file, undefined, undefined, expId, 'Disbursement Proof', 'PHOTO');
            const updatedUrl = mediaRes.url;
            setExpenditureRows(prev => prev.map(r =>
                r.id === selectedExp.id
                    ? { ...r, disbursementProofUrl: updatedUrl }
                    : r
            ));
            setSelectedExp(prev => prev ? { ...prev, disbursementProofUrl: updatedUrl } : null);

            toast.success('Đã tải minh chứng lên. Vui lòng nhấn "Xác nhận đã chuyển tiền" để hoàn tất.');
        } catch (error) {
            console.error('Upload proof failed:', error);
            toast.error('Tải minh chứng thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisburse = async () => {
        if (!selectedExp || !selectedExp.disbursementProofUrl) {
            toast.error('Vui lòng tải minh chứng trước khi xác nhận');
            return;
        }
        const expId = Number(selectedExp.id.replace('EXP_', ''));
        setIsLoading(true);
        try {
            await expenditureService.updateStatus(expId, 'DISBURSED', user?.id ? Number(user.id) : undefined, undefined, selectedExp.disbursementProofUrl);

            setExpenditureRows(prev => prev.map(r =>
                r.id === selectedExp.id ? { ...r, status: 'DISBURSED' as any } : r
            ));
            setSelectedExp(prev => prev ? { ...prev, status: 'DISBURSED' as any } : null);
            toast.success('Chuyển tiền thành công!');
        } catch (error) {
            toast.error('Xác nhận giải ngân thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const openDetail = (exp: ExpenditureRequest) => {
        setSelectedRefund(null);
        setSelectedExp(exp);
        setIsModalOpen(true);
    };

    const openRefundDetail = (refund: RefundTransaction) => {
        setSelectedExp(null);
        setSelectedRefund(refund);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExp(null);
        setSelectedRefund(null);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1 shadow-lg shadow-slate-200/50 w-fit">
                <button
                    onClick={() => { setActiveTab('PAYOUT'); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'PAYOUT'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <DollarSign className="h-4 w-4" />
                    Giải ngân ({filteredExpenditures.length})
                </button>
                <button
                    onClick={() => { setActiveTab('REFUND'); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'REFUND'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <RefreshCcw className="h-4 w-4" />
                    Hoàn tiền dư ({filteredRefunds.length})
                </button>
            </div>

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-3 flex-shrink-0">
                <div className="relative group/search flex-[2] max-w-2xl w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-[#F84D43] transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo mã yêu cầu hoặc tên chiến dịch..."
                        className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full md:w-44 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                    >
                        {activeTab === 'PAYOUT' ? (
                            <>
                                <option value="ALL">Trạng thái</option>
                                <option value="WITHDRAWAL_REQUESTED">Chờ giải ngân</option>
                                <option value="DISBURSED">Đã giải ngân</option>
                            </>
                        ) : (
                            <>
                                <option value="ALL">Trạng thái</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="PENDING">Đang chờ</option>
                            </>
                        )}
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3.5 rounded-3xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all ml-auto"
                        >
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="flex flex-col rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative flex-1 min-h-0 overflow-hidden">
                {isLoading && expenditureRows.length === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="h-full overflow-auto custom-scrollbar">
                    <table className="min-w-full text-sm border-separate border-spacing-0">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr className="text-left">
                                <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Chiến dịch</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Số tiền</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Ngày tạo</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                                <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((r) => {
                                    if (activeTab === 'PAYOUT') {
                                        const exp = r as ExpenditureRequest;
                                        return (
                                            <tr key={exp.id} className="h-[68px] group hover:bg-slate-50/30 transition-colors">
                                                <td className="py-2 pl-8 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-2 ring-white">
                                                            {exp.campaignCoverImage ? (
                                                                <img src={getMediaUrl(exp.campaignCoverImage)} alt={exp.campaignTitle} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                                    <Tag className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors truncate max-w-[150px]">{exp.campaignTitle}</div>
                                                    </div>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className="text-sm font-black text-slate-900">{formatVnd(exp.totalAmount || exp.totalExpectedAmount)}</span>
                                                    {exp.campaignType === 'ITEMIZED' && (
                                                        <span className="ml-1.5 text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">Vật phẩm</span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-500 font-medium text-xs">
                                                    {new Date(exp.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${exp.status === 'WITHDRAWAL_REQUESTED' ? 'bg-blue-100 text-blue-700' :
                                                        exp.status === 'DISBURSED' ? 'bg-[#1A685B]/10 text-[#1A685B]' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {exp.status === 'WITHDRAWAL_REQUESTED' ? 'Chờ giải ngân' :
                                                            exp.status === 'DISBURSED' ? 'Đã giải ngân' : exp.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-8 text-right">
                                                    <button
                                                        onClick={() => openDetail(exp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                                                        title="Chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    } else {
                                        const refund = r as unknown as RefundTransaction;
                                        return (
                                            <tr key={refund.id} className="h-[68px] group hover:bg-slate-50/30 transition-colors">
                                                <td className="py-2 pl-8 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-2 ring-white">
                                                            {refund.campaignCoverImage ? (
                                                                <img src={getMediaUrl(refund.campaignCoverImage)} alt={refund.campaignTitle} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                                    <RefreshCcw className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors truncate max-w-[150px]">{refund.campaignTitle}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">{refund.expenditureIdStr}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className="text-sm font-black text-slate-900">{formatVnd(refund.amount)}</span>
                                                </td>
                                                <td className="py-2 pr-4 text-slate-500 font-medium text-xs">
                                                    {new Date(refund.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${refund.status === 'COMPLETED' ? 'bg-[#1A685B]/10 text-[#1A685B]' :
                                                        'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {refund.status === 'COMPLETED' ? 'Hoàn thành' : refund.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-8 text-right">
                                                    <button
                                                        onClick={() => openRefundDetail(refund)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                                                        title="Chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <CreditCard className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-bold text-slate-500">
                                                {activeTab === 'PAYOUT' ? 'Không tìm thấy yêu cầu chi tiêu nào.' : 'Chưa có yêu cầu hoàn tiền dư nào.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && paginatedData.length < ITEMS_PER_PAGE && paginatedData.length > 0 && (
                                Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }).map((_, i) => (
                                    <tr key={`spacer-${i}`} className="h-[68px] border-none">
                                        <td colSpan={5}></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Trang {currentPage} / {totalPages || 1} (Tổng {activeTab === 'PAYOUT' ? filteredExpenditures.length : filteredRefunds.length})
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === (totalPages || 1) || Math.abs(p - currentPage) <= 1)
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center">
                                        {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))}
                        </div>
                        <button
                            disabled={currentPage === (totalPages || 1)}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && (selectedExp || selectedRefund) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="relative w-full max-w-4xl bg-slate-50 rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#F84D43]/10 flex items-center justify-center text-[#F84D43]">
                                    {activeTab === 'REFUND' ? (
                                        <RefreshCcw className="h-6 w-6" />
                                    ) : (
                                        <CreditCard className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                                        {activeTab === 'REFUND' ? 'Chi tiết hoàn tiền dư' : 'Chi tiết yêu cầu giải ngân'}
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-3 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-8">
                            {activeTab === 'PAYOUT' && selectedExp && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Info */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                            <h3 className="text-[10px] font-black text-[#F84D43] uppercase tracking-[0.2em] mb-4">Thông tin chung</h3>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Số tiền đã rút</span>
                                                    <span className="text-2xl font-black text-slate-900 mt-1">{formatVnd(selectedExp.totalAmount || selectedExp.totalExpectedAmount)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chiến dịch</span>
                                                        <Link
                                                            href={`/campaigns-details?id=${selectedExp.campaignId}`}
                                                            target="_blank"
                                                            className="text-[10px] font-black text-[#F84D43] uppercase flex items-center gap-1 hover:underline"
                                                        >
                                                            Xem chi tiết <ExternalLink className="h-2.5 w-2.5" />
                                                        </Link>
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900">{selectedExp.campaignTitle}</p>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Lý do giải ngân</span>
                                                        <Link
                                                            href={`/account/campaigns/expenditures/${selectedExp.id.replace('EXP_', '')}`}
                                                            target="_blank"
                                                            className="text-[10px] font-black text-[#F84D43] uppercase flex items-center gap-1 hover:underline"
                                                        >
                                                            Xem chi tiết chi tiêu <ExternalLink className="h-2.5 w-2.5" />
                                                        </Link>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-600 line-clamp-3">{selectedExp.justification}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedExp.accountNumber && (
                                            <>
                                                <div className="bg-[#1A685B]/5 p-6 rounded-[32px] border border-[#1A685B]/10 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                                        <CreditCard className="h-20 w-20 text-[#1A685B]" />
                                                    </div>
                                                    <h3 className="text-[10px] font-black text-[#1A685B] uppercase tracking-[0.2em] mb-4">Người nhận</h3>
                                                    <div className="space-y-4 relative z-10">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</span>
                                                                <p className="text-sm font-black text-slate-900">{selectedExp.toBankCode || selectedExp.bankCode}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                                                                <p className="text-sm font-black text-slate-900">{selectedExp.toAccountNumber || selectedExp.accountNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                                                            <p className="text-sm font-black text-slate-900">{selectedExp.toAccountHolderName || selectedExp.accountHolderName}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {(selectedExp.fromBankCode || selectedExp.fromAccountNumber) && (
                                                    <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-200 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <CreditCard className="h-20 w-20 text-amber-600" />
                                                        </div>
                                                        <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-4">Người gửi</h3>
                                                        <div className="space-y-4 relative z-10">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</span>
                                                                    <p className="text-sm font-black text-slate-900">{selectedExp.fromBankCode}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                                                                    <p className="text-sm font-black text-slate-900">{selectedExp.fromAccountNumber}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                                                                <p className="text-sm font-black text-slate-900">{selectedExp.fromAccountHolderName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Right: Panel */}
                                    <div>
                                        <RequestDetailPanel
                                            request={selectedExp}
                                            title={`Xử lý ${selectedExp.id}`}
                                            fields={[]}
                                            onApprove={() => handleUpdateStatus(selectedExp.id, 'APPROVED')}
                                            onReject={() => handleUpdateStatus(selectedExp.id, 'REJECTED')}
                                            onUploadProof={handleUploadProof}
                                            onDisburse={handleDisburse}
                                            uploading={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'REFUND' && selectedRefund && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Info */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                            <h3 className="text-[10px] font-black text-[#F84D43] uppercase tracking-[0.2em] mb-4">Thông tin hoàn tiền dư</h3>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Số tiền hoàn lại</span>
                                                    <span className="text-2xl font-black text-slate-900 mt-1">{formatVnd(selectedRefund.amount)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chiến dịch</span>
                                                        <Link
                                                            href={`/campaigns-details?id=${selectedRefund.campaignId}`}
                                                            target="_blank"
                                                            className="text-[10px] font-black text-[#F84D43] uppercase flex items-center gap-1 hover:underline"
                                                        >
                                                            Xem chi tiết <ExternalLink className="h-2.5 w-2.5" />
                                                        </Link>
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900">{selectedRefund.campaignTitle}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Khoản chi tiêu</span>
                                                    <Link
                                                        href={`/account/campaigns/expenditures/${selectedRefund.expenditureId}`}
                                                        target="_blank"
                                                        className="block text-sm font-black text-slate-900 hover:text-[#F84D43] hover:underline mt-0.5"
                                                    >
                                                        {selectedRefund.expenditureIdStr}
                                                    </Link>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng thái</span>
                                                    <p className={`text-sm font-black mt-0.5 ${selectedRefund.status === 'COMPLETED' ? 'text-[#1A685B]' : 'text-amber-600'}`}>
                                                        {selectedRefund.status === 'COMPLETED' ? 'Hoàn thành' : selectedRefund.status}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ngày yêu cầu</span>
                                                    <p className="text-sm font-black text-slate-900 mt-0.5">
                                                        {new Date(selectedRefund.createdAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sender Bank (Fund Owner) */}
                                        {selectedRefund.fromBankCode && (
                                            <div className="bg-[#1A685B]/5 p-6 rounded-[32px] border border-[#1A685B]/10 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <CreditCard className="h-20 w-20 text-[#1A685B]" />
                                                </div>
                                                <h3 className="text-[10px] font-black text-[#1A685B] uppercase tracking-[0.2em] mb-4">Người gửi (Chủ quỹ)</h3>
                                                <div className="space-y-3 relative z-10">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</span>
                                                            <p className="text-sm font-black text-slate-900">{selectedRefund.fromBankCode}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                                                            <p className="text-sm font-black text-slate-900">{selectedRefund.fromAccountNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                                                        <p className="text-sm font-black text-slate-900">{selectedRefund.fromAccountHolderName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Recipient Bank (Admin) */}
                                        {selectedRefund.toBankCode && (
                                            <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <CreditCard className="h-20 w-20 text-amber-600" />
                                                </div>
                                                <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-4">Người nhận (Admin)</h3>
                                                <div className="space-y-3 relative z-10">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</span>
                                                            <p className="text-sm font-black text-slate-900">{selectedRefund.toBankCode}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                                                            <p className="text-sm font-black text-slate-900">{selectedRefund.toAccountNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                                                        <p className="text-sm font-black text-slate-900">{selectedRefund.toAccountHolderName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Proof Image or placeholder */}
                                    <div className="flex flex-col h-full">
                                        {selectedRefund.proofUrl ? (
                                            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex-1 flex flex-col">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Minh chứng hoàn tiền</h3>
                                                <div className="relative flex-1 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group shadow-sm min-h-[300px]">
                                                    <img
                                                        src={getMediaUrl(selectedRefund.proofUrl)}
                                                        alt="Refund Proof"
                                                        className="absolute inset-0 h-full w-full object-contain"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a
                                                            href={getMediaUrl(selectedRefund.proofUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-white rounded-xl text-slate-900 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-xl"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Xem ảnh gốc
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center text-slate-400">
                                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <RefreshCcw className="h-8 w-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-500">Thông tin hoàn tiền dư</p>
                                                    <p className="text-xs font-medium text-slate-400 mt-1">Yêu cầu hoàn tiền được fund owner gửi về quỹ chung</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-white flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-8 py-4 rounded-[20px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
