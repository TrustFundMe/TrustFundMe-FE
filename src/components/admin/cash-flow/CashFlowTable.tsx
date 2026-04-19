'use client';

import React, { useState, useEffect } from 'react';
import { Eye, ChevronDown, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api as axiosInstance } from '@/config/axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://localhost:8080';

export interface Transaction {
    id: string;
    actorName: string;
    time: string;
    type: 'DONATION' | 'WITHDRAWAL' | 'REFUND';
    campaignName: string;
    fundType: 'AUTHORIZED' | 'ITEMIZED';
    amount: number;
    isItem?: boolean;
    itemQuantity?: string;
    content: string;
    expenditureId?: string;
    evidence: string;
    status: string;
    rawTime?: string;
    campaignId?: string;
    actorId?: string;
}

interface CashFlowTableProps {
    transactions: Transaction[];
    isLoading?: boolean;
    onViewDetails: (tx: Transaction) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalElements: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const CashFlowTable = ({
    transactions,
    isLoading,
    onViewDetails,
    currentPage,
    totalPages,
    onPageChange,
    totalElements
}: CashFlowTableProps) => {
    // Local pagination removed - now using props from parent

    if (isLoading) {
        return (
            <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-gray-400">Đang tải dữ liệu dòng tiền...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400">Chưa có giao dịch nào</span>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return { text: 'Đã thanh toán', class: 'text-green-600 bg-green-50 border-green-100' };
            case 'DISBURSED':
                return { text: 'Đã giải ngân', class: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'REFUNDED':
                return { text: 'Đã hoàn trả', class: 'text-purple-600 bg-purple-50 border-purple-100' };
            case 'PENDING':
                return { text: 'Chờ duyệt', class: 'text-yellow-600 bg-yellow-50 border-yellow-100' };
            case 'FLAGGED':
                return { text: 'Nghi vấn', class: 'text-red-600 bg-red-50 border-red-100' };
            default:
                return { text: status, class: 'text-gray-600 bg-gray-50 border-gray-100' };
        }
    };

    const getEvidenceBadge = (evidence: string, tx: Transaction) => {
        if (tx.type === 'DONATION') {
            if (evidence === 'NONE') {
                return <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">Không cần</span>;
            }
            return <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Xem ảnh</span>;
        } else {
            // Payouts and Refunds
            if (evidence && evidence.startsWith('http')) {
                return (
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        Xem ảnh
                    </span>
                );
            }
            switch (evidence) {
                case 'COMPLETED':
                    return (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Đã xác nhận</span>
                    );
                case 'PENDING':
                    return <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">Chờ bổ sung</span>;
                case 'FLAGGED':
                    return <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">Cần kiểm</span>;
                default:
                    return <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 uppercase">Không có</span>;
            }
        }
    };

    const getTypeDisplay = (type: Transaction['type']) => {
        switch (type) {
            case 'DONATION':
                return <span className="text-[10px] font-black text-gray-900 block text-center">Quyên góp</span>;
            case 'WITHDRAWAL':
                return <span className="text-[10px] font-black text-gray-900 block text-center">Rút tiền</span>;
            case 'REFUND':
                return <span className="text-[10px] font-black text-gray-900 block text-center">Hoàn tiền</span>;
        }
    };

    return (
        <div className="bg-white p-1 rounded-[16px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            {/* Table */}
            <div className="overflow-auto flex-1 min-h-0">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-gray-50/50 sticky top-0 z-10">
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">
                            <th className="pb-2 px-2 w-[14%]">Người tạo</th>
                            <th className="pb-2 px-2 text-center w-[6%]">Loại</th>
                            <th className="pb-2 px-2 w-[20%]">Chiến dịch</th>
                            <th className="pb-2 px-2 text-center w-[14%]">Số tiền</th>
                            <th className="pb-2 px-2 w-[20%]">Nội dung</th>
                            <th className="pb-2 px-2 text-center w-[10%]">Bằng chứng</th>
                            <th className="pb-2 px-2 text-center w-[10%]">Trạng thái</th>
                            <th className="pb-2 px-2 text-center w-[8%] uppercase tracking-widest">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.map((tx, index) => {
                            const statusBadge = getStatusBadge(tx.status);
                            return (
                                <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Người tạo + Thời gian */}
                                    <td className="py-1 px-2">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-gray-900 truncate">{tx.actorName}</span>
                                            <span className="text-[10px] font-bold text-gray-400">{tx.time}</span>
                                        </div>
                                    </td>

                                    {/* Loại */}
                                    <td className="py-2 px-2 align-middle">
                                        {getTypeDisplay(tx.type)}
                                    </td>

                                    {/* Chiến dịch + Loại quỹ */}
                                    <td className="py-2 px-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-black text-gray-900 truncate">{tx.campaignName}</span>
                                            <span className="text-[10px] font-black truncate text-gray-400">
                                                {tx.fundType === 'AUTHORIZED' ? 'Quỹ ủy quyền' : 'Quỹ vật phẩm'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Số tiền */}
                                    <td className="py-2 px-2 text-center">
                                        <div className="flex flex-col">
                                            <span className={`text-[14px] font-black ${tx.type === 'DONATION' || tx.type === 'REFUND' ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                {tx.type === 'WITHDRAWAL' && '-'}
                                                {formatCurrency(tx.amount)} <span className="underline text-[10px]">đ</span>
                                            </span>
                                        </div>
                                    </td>

                                    {/* Nội dung */}
                                    <td className="py-2 px-2">
                                        <div className="flex items-center gap-1 py-1 px-2 bg-gray-50 border border-gray-100 rounded-lg w-fit">
                                            <span className="text-[10px] font-black text-gray-600 truncate">{tx.content}</span>
                                        </div>
                                    </td>

                                    {/* Bằng chứng */}
                                    <td className="py-2 px-2 text-center">
                                        {getEvidenceBadge(tx.evidence, tx)}
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="py-2 px-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${statusBadge.class}`}>
                                            {statusBadge.text}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-1 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1 opacity-100 transition-all">
                                            <button
                                                onClick={() => onViewDetails(tx)}
                                                className="p-1 rounded-lg text-gray-900 hover:text-indigo-600 transition-all scale-110"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-[10px] font-black text-gray-400">
                <span>Hiển thị {transactions.length} / {totalElements} kết quả</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="p-1 rounded-lg bg-gray-50 border border-gray-100 disabled:opacity-50 hover:bg-gray-100 transition-all"
                    >
                        <ChevronDown className="h-3 w-3 rotate-90" />
                    </button>
                    <span className="mx-1 text-gray-900 font-black">Trang {currentPage + 1} / {totalPages}</span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="p-1 rounded-lg bg-gray-50 border border-gray-100 disabled:opacity-50 hover:bg-gray-100 transition-all"
                    >
                        <ChevronDown className="h-3 w-3 -rotate-90" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal chi tiết giao dịch
interface TransactionDetailModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

export const TransactionDetailModal = ({ transaction, onClose }: TransactionDetailModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [detail, setDetail] = useState<{
        campaign: any;
        user: any;
        txDetail: any;
    }>({ campaign: null, user: null, txDetail: null });

    useEffect(() => {
        if (!transaction) return;
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const [campRes, userRes, txRes] = await Promise.allSettled([
                    transaction.campaignId ? axiosInstance.get(`${API_URL}/api/campaigns/${transaction.campaignId}`) : Promise.reject(),
                    transaction.actorId ? axiosInstance.get(`${API_URL}/api/users/${transaction.actorId}`) : Promise.reject(),
                    transaction.type !== 'DONATION' ? axiosInstance.get(`${API_URL}/api/expenditures/transactions/${transaction.id}`) : Promise.reject()
                ]);

                setDetail({
                    campaign: campRes.status === 'fulfilled' ? campRes.value.data : null,
                    user: userRes.status === 'fulfilled' ? userRes.value.data : null,
                    txDetail: txRes.status === 'fulfilled' ? txRes.value.data : null,
                });
            } catch (err) {
                toast.error('Không thể tải thông tin chi tiết');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [transaction]);

    if (!transaction) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-[20px] w-full overflow-hidden shadow-2xl relative z-10 ${transaction.type === 'DONATION' ? 'max-w-md' : 'max-w-2xl'}`}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-black text-gray-900 uppercase tracking-tight">Chi tiết giao dịch</h2>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${transaction.type === 'DONATION' || transaction.type === 'REFUND' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {transaction.type === 'DONATION' || transaction.type === 'REFUND' ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                            {transaction.type === 'DONATION' ? 'Quyên góp' : transaction.type === 'REFUND' ? 'Hoàn trả' : 'Rút tiền'}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3">
                    <div className={transaction.type === 'DONATION' ? 'space-y-3' : 'grid grid-cols-2 gap-3'}>
                        {/* Info Column */}
                        <div className="space-y-3">
                            {/* Người liên quan */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                                    {transaction.type === 'DONATION' ? 'Người quyên góp' : transaction.type === 'WITHDRAWAL' ? 'Người nhận' : 'Người hoàn trả'}
                                </label>
                                <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                    ) : (
                                        <>
                                            <div className="text-[11px] font-black text-gray-900">{detail.user?.fullName || transaction.actorName}</div>
                                            <div className="text-[10px] font-bold text-indigo-600 mt-0.5">
                                                SĐT: {detail.user?.phoneNumber || 'Chưa cập nhật'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Chiến dịch */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Chiến dịch</label>
                                <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 min-h-[50px] flex items-center">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                    ) : (
                                        <div className="w-full">
                                            <div className="text-[11px] font-black text-gray-900 line-clamp-2">
                                                {detail.campaign?.title || transaction.campaignName}
                                            </div>
                                            <div className="text-[9px] font-black text-gray-400 mt-0.5 uppercase">
                                                {detail.campaign?.type === 'ITEMIZED' || transaction.fundType === 'ITEMIZED' ? 'Quỹ vật phẩm' : 'Quỹ ủy quyền'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Số tiền / Giá trị */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Giá trị giao dịch</label>
                                <div className="bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
                                    <div className={`text-[18px] font-black tracking-tight ${transaction.type === 'DONATION' || transaction.type === 'REFUND' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {transaction.type === 'WITHDRAWAL' && '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                    <div className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">{transaction.time}</div>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Column */}
                        {transaction.type !== 'DONATION' && (
                            <div className="flex flex-col h-full">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Minh chứng giao dịch</label>
                                <div className="bg-gray-50/50 rounded-lg border border-gray-100 overflow-hidden flex-1 min-h-[150px] flex items-center justify-center relative">
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-200" />
                                    ) : detail.txDetail?.proofUrl ? (
                                        <img
                                            src={detail.txDetail.proofUrl}
                                            alt="Proof"
                                            className="w-full h-full object-contain cursor-zoom-in"
                                            onClick={() => window.open(detail.txDetail.proofUrl, '_blank')}
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="text-[10px] font-black text-gray-300 uppercase italic leading-tight">
                                                {isLoading ? 'Đang tải minh chứng...' : 'Chưa có ảnh minh chứng'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-2 bg-gray-50/20 border-t border-gray-100 flex justify-end items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-black transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
