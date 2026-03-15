'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    CreditCard,
    Search,
    Eye,
    X,
    ExternalLink,
    ChevronRight,
    Tag
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

interface ExpenditureRequest extends BaseExpenditureRequest {
    campaignCoverImage?: string | null;
}

function formatVnd(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export default function AdminPayoutsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expenditureRows, setExpenditureRows] = useState<ExpenditureRequest[]>([]);
    const [selectedExp, setSelectedExp] = useState<ExpenditureRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    const fetchExpenditures = async () => {
        setIsLoading(true);
        try {
            const allCampaigns = await campaignService.getAll();
            const expenditurePromises = allCampaigns.map(c => expenditureService.getByCampaignId(c.id));
            const expenditureResults = await Promise.all(expenditurePromises);
            const allExps = expenditureResults.flat();

            const enrichedExps: ExpenditureRequest[] = await Promise.all(allExps.map(async (e) => {
                const campaign = allCampaigns.find(c => c.id === e.campaignId);
                let coverImage: string | null = null;
                try {
                    const mediaData = await mediaService.getMediaByCampaignId(e.campaignId);
                    if (mediaData && mediaData.length > 0) {
                        const firstImage = mediaData.find(m => m.mediaType === 'PHOTO') || mediaData[0];
                        coverImage = firstImage.url;
                    }
                } catch (err) {
                    console.warn(`Failed to fetch media for campaign ${e.campaignId}`, err);
                }

                return {
                    id: `EXP_${e.id}`,
                    createdAt: e.createdAt || new Date().toISOString(),
                    status: (e.status as RequestStatus) || 'PENDING',
                    type: 'EXPENDITURE',
                    campaignId: e.campaignId,
                    campaignTitle: campaign?.title || `Campaign #${e.campaignId}`,
                    campaignCoverImage: coverImage,
                    requesterName: 'Fund Owner',
                    totalAmount: e.totalAmount,
                    totalExpectedAmount: e.totalExpectedAmount,
                    expenditureItems: (e.items || []).map(i => ({
                        description: i.category,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                    justification: e.plan || 'No justification provided',
                    disbursementProofUrl: e.disbursementProofUrl,
                    disbursedAt: (e as any).disbursedAt,
                    bankCode: e.bankCode || e.transactions?.filter(t => t.type === 'PAYOUT' && t.status === 'PENDING').slice(-1)[0]?.toBankCode || e.transactions?.filter(t => t.type === 'PAYOUT').slice(-1)[0]?.toBankCode,
                    accountNumber: e.accountNumber || e.transactions?.filter(t => t.type === 'PAYOUT' && t.status === 'PENDING').slice(-1)[0]?.toAccountNumber || e.transactions?.filter(t => t.type === 'PAYOUT').slice(-1)[0]?.toAccountNumber,
                    accountHolderName: e.accountHolderName || e.transactions?.filter(t => t.type === 'PAYOUT' && t.status === 'PENDING').slice(-1)[0]?.toAccountHolderName || e.transactions?.filter(t => t.type === 'PAYOUT').slice(-1)[0]?.toAccountHolderName,
                    transactions: e.transactions
                };
            }));

            setExpenditureRows(enrichedExps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to fetch expenditures', error);
            toast.error('Không thể tải danh sách chi tiêu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenditures();
    }, []);

    const filteredExpenditures = useMemo(() => {
        return expenditureRows.filter((r) => {
            const matchesStatus = statusFilter === 'ALL' ?
                ((r.status as string) === 'WITHDRAWAL_REQUESTED' || (r.status as string) === 'CLOSED' || r.status === 'DISBURSED') :
                r.status === statusFilter;
            const matchesSearch = searchQuery === '' ||
                r.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [expenditureRows, statusFilter, searchQuery]);

    const totalPages = useMemo(() => Math.ceil(filteredExpenditures.length / ITEMS_PER_PAGE), [filteredExpenditures, ITEMS_PER_PAGE]);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredExpenditures.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredExpenditures, currentPage, ITEMS_PER_PAGE]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL';

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
    };

    const handleUpdateStatus = async (id: string, next: RequestStatus) => {
        const expId = id.replace('EXP_', '');
        try {
            await expenditureService.updateStatus(Number(expId), next);
            setExpenditureRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
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
            // Then update status to DISBURSED with proofUrl and staffId (admin)
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
        setSelectedExp(exp);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">

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
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                    >
                        <option value="ALL">Trạng thái</option>
                        <option value="WITHDRAWAL_REQUESTED">Chờ giải ngân</option>
                        <option value="DISBURSED">Đã giải ngân</option>
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
                        <thead className="bg-slate-50">
                            <tr className="text-left">
                                <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Chiến dịch</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Số tiền</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Ngày tạo</th>
                                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                                <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.map((r) => (
                                <tr key={r.id} className="h-[68px] group hover:bg-slate-50/30 transition-colors">
                                    <td className="py-2 pl-8 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-2 ring-white">
                                                {r.campaignCoverImage ? (
                                                    <img src={r.campaignCoverImage} alt={r.campaignTitle} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                        <Tag className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors truncate max-w-[150px]">{r.campaignTitle}</div>
                                        </div>
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span className="text-sm font-black text-slate-900">{formatVnd(r.totalExpectedAmount || r.totalAmount)}</span>
                                    </td>
                                    <td className="py-2 pr-4 text-slate-500 font-medium text-xs">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'WITHDRAWAL_REQUESTED' || (r.status as string) === 'CLOSED' ? 'bg-blue-100 text-blue-700' :
                                            r.status === 'DISBURSED' ? 'bg-[#1A685B]/10 text-[#1A685B]' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                            {r.status === 'WITHDRAWAL_REQUESTED' || (r.status as string) === 'CLOSED' ? 'Chờ giải ngân' :
                                                r.status === 'DISBURSED' ? 'Đã giải ngân' : r.status}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-8 text-right">
                                        <button
                                            onClick={() => openDetail(r)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                                            title="Chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <CreditCard className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-bold text-slate-500">Không tìm thấy yêu cầu chi tiêu nào.</p>
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

                {/* Pagination Section */}
                <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Trang {currentPage} / {totalPages || 1} (Tổng {filteredExpenditures.length})
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
            {isModalOpen && selectedExp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-slate-50 rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#F84D43]/10 flex items-center justify-center text-[#F84D43]">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">Chi tiết yêu cầu giải ngân</h2>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 scroll-smooth">
                            {/* Left Column: Info Card */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                    <h3 className="text-[10px] font-black text-[#F84D43] uppercase tracking-[0.2em] mb-4">Thông tin chung</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Số tiền muốn rút</span>
                                            <span className="text-2xl font-black text-slate-900 mt-1">{formatVnd(selectedExp.totalExpectedAmount || selectedExp.totalAmount)}</span>
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
                                    <div className="bg-[#1A685B]/5 p-6 rounded-[32px] border border-[#1A685B]/10 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <CreditCard className="h-20 w-20 text-[#1A685B]" />
                                        </div>
                                        <h3 className="text-[10px] font-black text-[#1A685B] uppercase tracking-[0.2em] mb-4">Tài khoản thụ hưởng (Lịch sử)</h3>
                                        <div className="space-y-4 relative z-10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</span>
                                                    <p className="text-sm font-black text-slate-900">{selectedExp.bankCode}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                                                    <p className="text-sm font-black text-slate-900">{selectedExp.accountNumber}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                                                <p className="text-sm font-black text-slate-900">{selectedExp.accountHolderName}</p>
                                            </div>
                                            <div className="pt-2">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1A685B]/10 text-[#1A685B] text-[9px] font-bold uppercase">
                                                    Thông tin tại thời điểm yêu cầu
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Right Column: Disbursement Panel */}
                            <div className="h-full">
                                <RequestDetailPanel
                                    request={selectedExp}
                                    title={`Xử lý ${selectedExp.id}`}
                                    fields={[]} // We use the left column for info
                                    onApprove={() => handleUpdateStatus(selectedExp.id, 'APPROVED')}
                                    onReject={() => handleUpdateStatus(selectedExp.id, 'REJECTED')}
                                    onUploadProof={handleUploadProof}
                                    onDisburse={handleDisburse}
                                    uploading={isLoading}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-white flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
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
