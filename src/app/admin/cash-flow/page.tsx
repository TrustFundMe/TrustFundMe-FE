'use client';

import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/admin/cash-flow/StatCard';
import { CashFlowFilters } from '@/components/admin/cash-flow/CashFlowFilters';
import { CashFlowTable, TransactionDetailModal, Transaction } from '@/components/admin/cash-flow/CashFlowTable';
import { api as axiosInstance } from '@/config/axios';
import { ExpenditureDetailPanel } from '@/components/admin/cash-flow/ExpenditureDetailPanel';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// Filter label map
const filterLabels: FilterLabels = {
    type: { ALL: 'Loại', DONATION: 'Quyên góp', WITHDRAWAL: 'Rút tiền', REFUND: 'Hoàn tiền' },
    fundType: { ALL: 'Loại quỹ', AUTHORIZED: 'Quỹ ủy quyền', ITEMIZED: 'Quỹ vật phẩm' },
    status: {
        ALL: 'Trạng thái',
        PAID: 'Đã thanh toán',
        DISBURSED: 'Đã giải ngân',
    },
};

interface FilterCounts {
    type: { ALL: number; DONATION: number; WITHDRAWAL: number; REFUND: number };
    fundType: { ALL: number; AUTHORIZED: number; ITEMIZED: number };
    status: { ALL: number; PAID: number; DISBURSED: number };
}

interface FilterLabels {
    type: { ALL: string; DONATION: string; WITHDRAWAL: string; REFUND: string };
    fundType: { ALL: string; AUTHORIZED: string; ITEMIZED: string };
    status: { ALL: string; PAID: string; DISBURSED: string };
}

interface ExpenditureItem {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface ExpenditureDetail {
    id: string;
    campaignId: string;
    campaignName: string;
    description: string;
    requester: string;
    requestedAt: string;
    approvedBy: string;
    items: ExpenditureItem[];
    images: string[];
    totalAmount: number;
    status: string;
}

interface Stats {
    totalFund: number;
    pending: number;
    disbursed: number;
    refunded: number;
}

export default function CashFlowPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({ totalFund: 0, pending: 0, disbursed: 0, refunded: 0 });
    const [filters, setFilters] = useState({
        search: '',
        type: 'ALL',
        fundType: 'ALL',
        status: 'ALL',
        startDate: '',
        endDate: '',
    });

    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [selectedExp, setSelectedExp] = useState<ExpenditureDetail | null>(null);

    // Fetch transactions from APIs
    const fetchTransactions = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [donationsResult, payoutsResult, refundsResult] = await Promise.allSettled([
                axiosInstance.get(`${API_URL}/api/payments/status/PAID`),
                axiosInstance.get(`${API_URL}/api/expenditures/transactions/type/PAYOUT/status/COMPLETED`),
                axiosInstance.get(`${API_URL}/api/expenditures/transactions/type/REFUND/status/COMPLETED`),
            ]);

            if (donationsResult.status === 'rejected') {
                console.warn('Payment service unavailable:', donationsResult.reason);
                toast.error('Không thể tải dữ liệu quyên góp');
            }
            if (payoutsResult.status === 'rejected') {
                console.warn('Payouts service unavailable:', payoutsResult.reason);
                toast.error('Không thể tải dữ liệu giải ngân');
            }
            if (refundsResult.status === 'rejected') {
                console.warn('Refunds service unavailable:', refundsResult.reason);
                toast.error('Không thể tải dữ liệu hoàn tiền');
            }

            const donationsData: any[] = donationsResult.status === 'fulfilled' ? (donationsResult.value.data ?? []) : [];
            const payoutsData: any[] = payoutsResult.status === 'fulfilled' ? (payoutsResult.value.data ?? []) : [];
            const refundsData: any[] = refundsResult.status === 'fulfilled' ? (refundsResult.value.data ?? []) : [];

            // --- Batch fetch expenditures to get campaignId for payouts and refunds ---
            const allExpenditureIds = Array.from(new Set([
                ...payoutsData.map((p: any) => p.expenditureId).filter(Boolean),
                ...refundsData.map((r: any) => r.expenditureId).filter(Boolean),
            ]));
            const expenditureMap: Record<string, string> = {}; // expId -> campaignId
            await Promise.allSettled(
                allExpenditureIds.map(async (expId) => {
                    try {
                        const res = await axiosInstance.get(`${API_URL}/api/expenditures/${expId}`);
                        if (res.data?.campaignId) {
                            expenditureMap[String(expId)] = String(res.data.campaignId);
                        }
                    } catch { /* fallback */ }
                })
            );

            // --- Batch fetch campaigns (unique IDs) ---
            const allCampaignIds = Array.from(new Set([
                ...donationsData.map((d: any) => d.campaignId).filter(Boolean),
                ...Object.values(expenditureMap)
            ]));
            const campaignMap: Record<string, { title: string; type: string; ownerName: string }> = {};
            await Promise.allSettled(
                allCampaignIds.map(async (cid) => {
                    try {
                        const res = await axiosInstance.get(`${API_URL}/api/campaigns/${cid}`);
                        campaignMap[String(cid)] = {
                            title: res.data?.title || `Chiến dịch`,
                            type: res.data?.type || 'AUTHORIZED',
                            ownerName: res.data?.ownerName || '',
                        };
                    } catch { /* fallback */ }
                })
            );

            // --- Batch fetch donor users (unique IDs) ---
            const allDonorIds = Array.from(new Set([
                ...donationsData.map((d: any) => d.donorId).filter(Boolean),
                ...payoutsData.map((p: any) => p.toUserId).filter(Boolean),
                ...refundsData.map((r: any) => r.fromUserId).filter(Boolean),
            ]));
            const userMap: Record<string, string> = {};
            await Promise.allSettled(
                allDonorIds.map(async (uid) => {
                    try {
                        const res = await axiosInstance.get(`${API_URL}/api/users/${uid}`);
                        userMap[String(uid)] = res.data?.fullName || '';
                    } catch { /* fallback */ }
                })
            );

            // Format donations
            const formattedDonations: Transaction[] = donationsData.map((d: any) => {
                const camp = d.campaignId ? campaignMap[String(d.campaignId)] : null;
                const fundType: 'AUTHORIZED' | 'ITEMIZED' = camp?.type === 'ITEMIZED' ? 'ITEMIZED' : 'AUTHORIZED';
                const description = d.payment?.description || 'Quyên góp';
                return {
                    id: d.id?.toString() ?? '',
                    actorName: d.isAnonymous
                        ? 'Ẩn danh'
                        : (d.donorId ? (userMap[String(d.donorId)] || 'Người dùng') : 'Ẩn danh'),
                    time: d.createdAt
                        ? new Date(d.createdAt).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—',
                    rawTime: d.createdAt ?? '',
                    type: 'DONATION' as const,
                    campaignName: camp?.title || 'Quỹ chung',
                    fundType,
                    amount: Number(d.donationAmount) || 0,
                    content: description,
                    evidence: 'NONE',
                    status: 'PAID',
                };
            });

            // Format payouts
            const formattedPayouts: Transaction[] = payoutsData.map((p: any) => {
                const expIdStr = String(p.expenditureId);
                const campIdStr = expenditureMap[expIdStr];
                const camp = campIdStr ? campaignMap[campIdStr] : null;
                const fundType: 'AUTHORIZED' | 'ITEMIZED' = camp?.type === 'ITEMIZED' ? 'ITEMIZED' : 'AUTHORIZED';
                return {
                    id: p.id?.toString() ?? '',
                    actorName: userMap[String(p.toUserId)] || camp?.ownerName || p.toAccountHolderName || 'Chủ chiến dịch',
                    time: p.createdAt
                        ? new Date(p.createdAt).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—',
                    rawTime: p.createdAt ?? '',
                    type: 'WITHDRAWAL' as const,
                    campaignName: camp?.title || 'Quỹ chung',
                    fundType,
                    amount: Number(p.amount) || 0,
                    content: 'Không có',
                    expenditureId: p.expenditureId?.toString() ?? '',
                    evidence: 'COMPLETED',
                    status: 'DISBURSED',
                };
            });

            // Format refunds
            const formattedRefunds: Transaction[] = refundsData.map((r: any) => {
                const expIdStr = String(r.expenditureId);
                const campIdStr = expenditureMap[expIdStr];
                const camp = campIdStr ? campaignMap[campIdStr] : null;
                const fundType: 'AUTHORIZED' | 'ITEMIZED' = camp?.type === 'ITEMIZED' ? 'ITEMIZED' : 'AUTHORIZED';
                return {
                    id: r.id?.toString() ?? '',
                    actorName: userMap[String(r.fromUserId)] || camp?.ownerName || r.fromAccountHolderName || 'Chủ chiến dịch',
                    time: r.createdAt
                        ? new Date(r.createdAt).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—',
                    rawTime: r.createdAt ?? '',
                    type: 'REFUND' as const,
                    campaignName: camp?.title || 'Quỹ chung',
                    fundType,
                    amount: Number(r.amount) || 0,
                    content: 'Không có',
                    expenditureId: r.expenditureId?.toString() ?? '',
                    evidence: 'COMPLETED',
                    status: 'REFUNDED',
                };
            });

            const allTx = [...formattedDonations, ...formattedPayouts, ...formattedRefunds].sort((a, b) =>
                new Date(b.rawTime as string).getTime() - new Date(a.rawTime as string).getTime()
            );

            setTransactions(allTx);

            // Stats tính từ dữ liệu thực
            const totalIn = formattedDonations.reduce((sum, t) => sum + t.amount, 0);
            const totalOut = formattedPayouts.reduce((sum, t) => sum + t.amount, 0);
            const totalRefund = formattedRefunds.reduce((sum, t) => sum + t.amount, 0);
            setStats({
                totalFund: totalIn - totalOut + totalRefund,
                pending: Math.round(totalIn * 0.1),
                disbursed: totalOut,
                refunded: totalRefund,
            });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Không thể tải dữ liệu dòng tiền');
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Filter logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    tx.actorName.toLowerCase().includes(searchLower) ||
                    tx.campaignName.toLowerCase().includes(searchLower) ||
                    tx.content.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }
            if (filters.type === 'DONATION' && tx.type !== 'DONATION') return false;
            if (filters.type === 'WITHDRAWAL' && tx.type !== 'WITHDRAWAL') return false;
            if (filters.type === 'REFUND' && tx.type !== 'REFUND') return false;
            if (filters.fundType !== 'ALL' && tx.fundType !== filters.fundType) return false;
            if (filters.status !== 'ALL' && tx.status !== filters.status) return false;

            if (filters.startDate) {
                if (!tx.rawTime) return false;
                const txDate = new Date(tx.rawTime as string);
                const startDate = new Date(filters.startDate);
                startDate.setHours(0, 0, 0, 0);
                if (txDate < startDate) return false;
            }
            if (filters.endDate) {
                if (!tx.rawTime) return false;
                const txDate = new Date(tx.rawTime as string);
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (txDate > endDate) return false;
            }

            return true;
        });
    }, [filters, transactions]);

    // Filter counts for badge display
    const filterCounts = useMemo(() => ({
        type: {
            ALL: transactions.length,
            DONATION: transactions.filter(tx => tx.type === 'DONATION').length,
            WITHDRAWAL: transactions.filter(tx => tx.type === 'WITHDRAWAL').length,
            REFUND: transactions.filter(tx => tx.type === 'REFUND').length,
        },
        fundType: {
            ALL: transactions.length,
            AUTHORIZED: transactions.filter(tx => tx.fundType === 'AUTHORIZED').length,
            ITEMIZED: transactions.filter(tx => tx.fundType === 'ITEMIZED').length,
        },
        status: {
            ALL: transactions.length,
            PAID: transactions.filter(tx => tx.status === 'PAID').length,
            DISBURSED: transactions.filter(tx => tx.status === 'DISBURSED').length,
        },
    }), [transactions]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ search: '', type: 'ALL', fundType: 'ALL', status: 'ALL', startDate: '', endDate: '' });
    };

    const handleRefresh = () => {
        fetchTransactions();
    };

    const handleViewDetails = (tx: Transaction) => {
        setSelectedTx(tx);
    };

    const handleViewExpenditure = async (expId: string) => {
        try {
            const res = await axiosInstance.get(`${API_URL}/api/expenditures/${expId}`);
            const exp = res.data;

            // Lấy campaign name
            let campaignName = `Chiến dịch #${exp.campaignId}`;
            try {
                const campRes = await axiosInstance.get(`${API_URL}/api/campaigns/${exp.campaignId}`);
                campaignName = campRes.data?.title || campaignName;
            } catch { /* fallback */ }

            const detail: ExpenditureDetail = {
                id: exp.id?.toString() ?? expId,
                campaignId: exp.campaignId?.toString() ?? '',
                campaignName,
                description: exp.plan || '',
                requester: exp.staffReviewId ? `Staff #${exp.staffReviewId}` : '—',
                requestedAt: exp.createdAt
                    ? new Date(exp.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—',
                approvedBy: exp.staffReviewId ? 'Đã duyệt' : '—',
                items: (exp.transactions || []).map((t: any, i: number) => ({
                    id: t.id?.toString() ?? `EI-${i}`,
                    name: t.toAccountHolderName || 'Hạng mục',
                    unit: 'lần',
                    quantity: 1,
                    unitPrice: Number(t.amount) || 0,
                    total: Number(t.amount) || 0,
                })),
                images: exp.disbursementProofUrl ? [exp.disbursementProofUrl] : [],
                totalAmount: Number(exp.totalAmount) || 0,
                status: exp.status || 'DISBURSED',
            };

            setSelectedExp(detail);
        } catch {
            toast.error(`Không tìm thấy chi tiết cho ${expId}`);
        }
    };

    const handleApprove = (tx: Transaction) => {
        toast.success(`Đã duyệt giải ngân cho ${tx.id}`);
    };

    const handleFlag = (tx: Transaction) => {
        toast.success(`Đã gửi yêu cầu bổ sung bằng chứng cho ${tx.id}`);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30 p-3 font-sans">
            {/* Top Section: 4 Balance Cards */}
            <div className="grid grid-cols-4 gap-3 mb-3 shrink-0">
                <StatCard
                    title="TỔNG QUỸ HỆ THỐNG"
                    value={stats.totalFund}
                    isCurrency={true}
                    bgColor="bg-[#fff7ed]"
                    titleColor="text-[#c29d84]"
                    valueColor="text-[#7c5d41]"
                />
                <StatCard
                    title="TIỀN TIPS"
                    value={stats.pending}
                    isCurrency={true}
                    bgColor="bg-white"
                    titleColor="text-gray-400"
                    valueColor="text-gray-900"
                />
                <StatCard
                    title="TIỀN ĐÃ GIẢI NGÂN"
                    value={stats.disbursed}
                    isCurrency={true}
                    bgColor="bg-[#f0fdf4]"
                    titleColor="text-[#86b595]"
                    valueColor="text-[#2d6a4f]"
                />
                <StatCard
                    title="TIỀN HOÀN TỪ CHỦ QUỸ"
                    value={stats.refunded}
                    isCurrency={true}
                    bgColor="bg-[#eff6ff]"
                    titleColor="text-[#60a5fa]"
                    valueColor="text-[#1d4ed8]"
                />
            </div>

            {/* Middle Section: Filters + Table */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <CashFlowFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} onRefresh={handleRefresh} filterCounts={filterCounts} filterLabels={filterLabels} />

                <div className="mt-2">
                    <CashFlowTable
                        transactions={filteredTransactions}
                        isLoading={isLoading}
                        onViewDetails={handleViewDetails}
                        onApprove={handleApprove}
                        onFlag={handleFlag}
                        onViewExpenditure={handleViewExpenditure}
                    />
                </div>
            </div>

            {/* Modal chi tiết */}
            <TransactionDetailModal
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
                onApprove={handleApprove}
                onFlag={handleFlag}
            />

            {/* EXP Detail Sidebar */}
            <ExpenditureDetailPanel
                expenditure={selectedExp}
                onClose={() => setSelectedExp(null)}
                onApprove={(exp) => {
                    const tx = transactions.find(t => t.expenditureId === exp.id);
                    if (tx) handleApprove(tx);
                    setSelectedExp(null);
                }}
                onFlag={(exp) => {
                    const tx = transactions.find(t => t.expenditureId === exp.id);
                    if (tx) handleFlag(tx);
                    setSelectedExp(null);
                }}
            />
        </div>
    );
}
