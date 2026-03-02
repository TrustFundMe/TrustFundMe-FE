'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    CreditCard,
    DollarSign,
    Loader2,
    Search,
    Eye,
    CheckCircle2,
    X,
    Clock,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
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
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expenditureRows, setExpenditureRows] = useState<ExpenditureRequest[]>([]);
    const [selectedExp, setSelectedExp] = useState<ExpenditureRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'PENDING' ? (r.status === 'PENDING' || (r.status as string) === 'PENDING_REVIEW') : r.status === statusFilter);
            const matchesSearch = searchQuery === '' ||
                r.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [expenditureRows, statusFilter, searchQuery]);

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
            // Apply proof URL to DB first
            await campaignService.updateDisbursementProof(expId, selectedExp.disbursementProofUrl);
            // Then update status to DISBURSED
            await expenditureService.updateStatus(expId, 'DISBURSED' as any);

            setExpenditureRows(prev => prev.map(r =>
                r.id === selectedExp.id ? { ...r, status: 'DISBURSED' as any } : r
            ));
            setSelectedExp(prev => prev ? { ...prev, status: 'DISBURSED' as any } : null);
            toast.success('Đã xác nhận giải ngân thành công!');
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
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <CreditCard className="h-4 w-4 text-[#F84D43]" />
                        <ChevronRight className="h-3 w-3" />
                        <span>Quản trị hệ thống</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quản lý Giải ngân</h1>
                    <p className="text-slate-500 mt-2 font-medium">Theo dõi các yêu cầu chi tiêu và thực hiện chuyển tiền giải ngân quỹ.</p>
                </div>

                <div className="bg-slate-100/50 p-1.5 rounded-[24px] flex items-center gap-1 shadow-inner">
                    {(['ALL', 'PENDING', 'APPROVED', 'DISBURSED', 'REJECTED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all ${statusFilter === s ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : s === 'DISBURSED' ? 'Đã giải ngân' : 'Từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="relative group/search flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-[#F84D43] transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo mã yêu cầu hoặc tên chiến dịch..."
                        className="w-full bg-white border-2 border-slate-100 rounded-[32px] pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-2xl shadow-slate-200/30"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40 overflow-hidden relative min-h-[400px]">
                {isLoading && expenditureRows.length === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-[#F84D43] animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                <th className="py-6 pl-10 pr-4">Chiến dịch</th>
                                <th className="py-6 pr-4">Số tiền</th>
                                <th className="py-6 pr-4">Ngày tạo</th>
                                <th className="py-6 pr-4">Trạng thái</th>
                                <th className="py-6 pr-10 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredExpenditures.map((r) => (
                                <tr key={r.id} className="group hover:bg-slate-50/40 transition-colors">
                                    <td className="py-6 pl-10 pr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-4 ring-white">
                                                {r.campaignCoverImage ? (
                                                    <img src={r.campaignCoverImage} alt={r.campaignTitle} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                        <Tag className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors line-clamp-1 max-w-[200px]">{r.campaignTitle}</div>
                                        </div>
                                    </td>
                                    <td className="py-6 pr-4">
                                        <span className="text-lg font-black text-slate-900">{formatVnd(r.totalExpectedAmount || r.totalAmount)}</span>
                                    </td>
                                    <td className="py-6 pr-4 text-slate-500 font-medium">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-6 pr-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'APPROVED' ? 'bg-[#1A685B]/10 text-[#1A685B]' :
                                            r.status === 'REJECTED' ? 'bg-[#F84D43]/10 text-[#F84D43]' :
                                                r.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-amber-100 text-amber-800'
                                            }`}>
                                            {r.status === 'PENDING' || (r.status as string) === 'PENDING_REVIEW' ? 'Chờ duyệt' : r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'DISBURSED' ? 'Đã giải ngân' : 'Từ chối'}
                                        </span>
                                    </td>
                                    <td className="py-6 pr-10 text-right">
                                        <button
                                            onClick={() => openDetail(r)}
                                            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:shadow-xl transition-all inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-wider"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredExpenditures.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-slate-50 p-6 rounded-[32px] mb-4 shadow-inner">
                                                <CreditCard className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <p className="font-bold text-slate-500">Không tìm thấy yêu cầu chi tiêu nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
