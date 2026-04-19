'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Eye,
    HandCoins,
    FileText,
    DollarSign,
    X,
    CheckCircle,
    Search,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { generalFundApi } from '@/api/generalFundApi';
import { InternalTransactionStatus } from '@/types/internalTransaction';
import { useAuth } from '@/contexts/AuthContextProxy';
import { api as axiosInstance } from '@/config/axios';
import RequestTable from '@/components/staff/request/RequestTable';
import { SupportRequest } from '@/components/staff/request/RequestTypes';

export default function SupportRequestManager({ onModalToggle }: { onModalToggle?: (open: boolean) => void } = {}) {
    const { user: currentUser } = useAuth();
    const [history, setHistory] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<InternalTransactionStatus | 'ALL'>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);

    const openModal = () => { setIsCreateModalOpen(true); onModalToggle?.(true); };
    const closeModal = () => { setIsCreateModalOpen(false); onModalToggle?.(false); };

    useEffect(() => {
        fetchHistory();
        fetchCampaigns();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await generalFundApi.getHistory();
            const mappedHistory: SupportRequest[] = data
                .filter(tx => tx.createdByStaffId === currentUser?.id && tx.type === 'SUPPORT')
                .map(tx => ({
                    ...tx,
                    id: String(tx.id),
                    type: 'SUPPORT' as const,
                    status: tx.status as any
                }));
            setHistory(mappedHistory);
        } catch (error) {
            toast.error('Không thể tải lịch sử yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const [approvedRes, activeRes] = await Promise.all([
                axiosInstance.get('/api/campaigns/status/APPROVED'),
                axiosInstance.get('/api/campaigns/status/ACTIVE'),
            ]);
            const merged = [
                ...(approvedRes.data as any[]),
                ...(activeRes.data as any[]),
            ];
            // Dedupe by id, exclude the General Fund (id=1 or type=GENERAL_FUND)
            const seen = new Set<number>();
            const result = merged.filter((c: any) => {
                if (seen.has(c.id)) return false;
                seen.add(c.id);
                return c.id !== 1 && c.type !== 'GENERAL_FUND';
            });
            setCampaigns(result);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    const filteredHistory = useMemo(() => {
        if (statusFilter === 'ALL') return history;
        return history.filter(tx => tx.status === statusFilter);
    }, [history, statusFilter]);

    return (
        <div className="flex flex-col flex-1 gap-6 min-h-0">
            {/* Header / Filter Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : s === 'REJECTED' ? 'Từ chối' : 'Hoàn tất'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-[#446b5f] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#38594e] transition-all shadow-md shadow-[#446b5f]/20 active:scale-95 whitespace-nowrap mr-1"
                >
                    <Plus className="h-4 w-4" />
                    Tạo yêu cầu hỗ trợ
                </button>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-hidden flex flex-col gap-3">
                <div className="flex items-center justify-between flex-shrink-0 px-1">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách yêu cầu hỗ trợ quỹ</h2>
                </div>

                <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm min-h-0 bg-white custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                            <div className="h-10 w-10 border-4 border-[#db5945]/20 border-t-[#db5945] rounded-full animate-spin" />
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Đang tải dữ liệu...</div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 bg-gray-50/30">
                            <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                                <HandCoins className="h-8 w-8 text-gray-200" />
                            </div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Không có yêu cầu nào</h3>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Bắt đầu bằng việc tạo một yêu cầu mới</p>
                        </div>
                    ) : (
                        <RequestTable
                            rows={filteredHistory}
                            selectedId={selectedRequest?.id}
                            onSelect={(r) => setSelectedRequest(r)}
                            columns={[
                                {
                                    key: 'campaign',
                                    title: 'CHIẾN DỊCH NHẬN',
                                    render: (tx: SupportRequest) => (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900 line-clamp-1">
                                                {campaigns.find(c => c.id === tx.toCampaignId)?.title || `Chiến dịch #${tx.toCampaignId}`}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'amount',
                                    title: 'SỐ TIỀN',
                                    className: 'text-right',
                                    render: (tx: SupportRequest) => (
                                        <span className="text-xs font-black text-emerald-600">
                                            {formatCurrency(tx.amount)}
                                        </span>
                                    )
                                },
                                {
                                    key: 'reason',
                                    title: 'LÝ DO',
                                    render: (tx: SupportRequest) => (
                                        <span className="text-xs font-medium text-gray-600 line-clamp-1 max-w-md italic">
                                            "{tx.reason || '---'}"
                                        </span>
                                    )
                                }
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateSupportRequestModal
                        campaigns={campaigns}
                        onClose={closeModal}
                        onSuccess={() => {
                            closeModal();
                            fetchHistory();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreateSupportRequestModal({ campaigns, onClose, onSuccess }: { campaigns: any[], onClose: () => void, onSuccess: () => void }) {
    const { user: currentUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        toCampaignId: '',
        amount: '',
        reason: ''
    });
    const [amountDisplay, setAmountDisplay] = useState('');
    const MAX_REASON = 300;

    const formatWithDots = (val: string) => {
        const num = val.replace(/\D/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\./g, '');
        if (!/^\d*$/.test(raw)) return;
        setFormData({ ...formData, amount: raw });
        setAmountDisplay(formatWithDots(raw));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.toCampaignId || !formData.amount || !formData.reason) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (Number(formData.amount) < 1000) {
            toast.error('Số tiền tối thiểu là 1.000 VNĐ');
            return;
        }

        setSubmitting(true);
        try {
            await generalFundApi.createTransaction({
                fromCampaignId: 1,
                toCampaignId: Number(formData.toCampaignId),
                amount: Number(formData.amount),
                type: 'SUPPORT',
                reason: formData.reason,
                createdByStaffId: currentUser?.id,
                status: 'PENDING'
            } as any);
            toast.success('Gửi yêu cầu thành công!');
            onSuccess();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Gửi yêu cầu thất bại';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop phủ toàn màn hình, đè lên tab */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header — giảm padding */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <HandCoins className="h-4 w-4 text-[#446b5f]" />
                            Tạo yêu cầu hỗ trợ quỹ
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Gửi đề xuất trích tiền từ Quỹ chung cho chiến dịch</p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pt-2 pb-5 space-y-4">
                    {/* Chiến dịch nhận tiền - Searchable Dropdown */}
                    <div className="space-y-1 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <HandCoins className="h-3 w-3" />
                            Chiến dịch nhận tiền
                        </label>

                        <CampaignSelector
                            campaigns={campaigns}
                            selectedId={formData.toCampaignId}
                            onSelect={(id) => setFormData({ ...formData, toCampaignId: id })}
                        />
                    </div>

                    {/* Số tiền với định dạng dấu chấm */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <DollarSign className="h-3 w-3" />
                            Số tiền yêu cầu (VNĐ) — tối thiểu 1.000
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amountDisplay}
                            onChange={handleAmountChange}
                            placeholder="Nhập số tiền..."
                            className="w-full h-11 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-[#446b5f]/30 focus:border-[#446b5f] transition-all"
                        />
                    </div>

                    {/* Lý do + giới hạn ký tự */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                Lý do đề xuất
                            </label>
                            <span className={`text-[10px] font-bold ${formData.reason.length > MAX_REASON * 0.9 ? 'text-red-400' : 'text-gray-300'}`}>
                                {formData.reason.length}/{MAX_REASON}
                            </span>
                        </div>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_REASON)
                                    setFormData({ ...formData, reason: e.target.value });
                            }}
                            placeholder="Nhập nội dung/lý do cần hỗ trợ..."
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#446b5f]/30 focus:border-[#446b5f] transition-all resize-none"
                        />
                    </div>

                    {/* Warning + Submit — padding giảm mạnh */}
                    <div className="flex flex-col gap-2.5">
                        <div className="bg-[#FFF5EB] px-3 py-2 rounded-xl border border-orange-100 flex items-center gap-2.5">
                            <div className="h-4 w-4 shrink-0 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold">!</div>
                            <p className="text-[9px] font-bold text-orange-800 leading-relaxed uppercase tracking-tight">
                                Yêu cầu sẽ gửi Admin phê duyệt. Hệ thống tự trừ tiền Quỹ chung khi hoàn tất.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-12 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200/50 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {submitting ? 'Đang gửi...' : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Xác nhận gửi yêu cầu
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
function CampaignSelector({ campaigns, selectedId, onSelect }: { campaigns: any[], selectedId: string, onSelect: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCampaign = campaigns.find(c => String(c.id) === String(selectedId));

    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return campaigns;
        const normalizedSearch = searchTerm.toLowerCase().trim();
        return campaigns.filter(c =>
            c.title.toLowerCase().includes(normalizedSearch) ||
            (c.ownerName && c.ownerName.toLowerCase().includes(normalizedSearch))
        );
    }, [campaigns, searchTerm]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-2xl px-4 flex items-center justify-between text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#446b5f]/30 focus:border-[#446b5f] transition-all"
            >
                <span className={selectedCampaign ? "text-gray-900" : "text-gray-400"}>
                    {selectedCampaign ? selectedCampaign.title : "-- Chọn chiến dịch --"}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-2 border-b border-gray-50 bg-gray-50/30">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm tên chiến dịch hoặc chủ quỹ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#446b5f]/20 focus:border-[#446b5f] transition-all"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div className="max-h-[220px] overflow-auto py-1 custom-scrollbar">
                                {filteredCampaigns.length === 0 ? (
                                    <div className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 italic">
                                        Không tìm thấy chiến dịch nào
                                    </div>
                                ) : (
                                    filteredCampaigns.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                onSelect(String(c.id));
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full px-4 py-2.5 text-left border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all flex flex-col gap-0.5 ${String(c.id) === String(selectedId) ? 'bg-[#446b5f]/5' : ''}`}
                                        >
                                            <span className={`text-[11px] font-black line-clamp-1 ${String(c.id) === String(selectedId) ? 'text-[#446b5f]' : 'text-gray-900'}`}>
                                                {c.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                Chủ quỹ: {c.ownerName || '---'}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
