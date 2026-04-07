'use client';

import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface CashFlowTableProps {
    transactions: Transaction[];
    isLoading?: boolean;
    onViewDetails: (tx: Transaction) => void;
    onApprove: (tx: Transaction) => void;
    onFlag: (tx: Transaction) => void;
    onViewExpenditure: (expId: string) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const CashFlowTable = ({ transactions, isLoading, onViewDetails, onApprove, onFlag, onViewExpenditure }: CashFlowTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));
    const paginatedData = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                return <span className="text-[9px] font-bold text-gray-400 italic">Không cần</span>;
            }
            return <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Xem ảnh</span>;
        } else {
            // Payouts and Refunds
            if (evidence && evidence.startsWith('http')) {
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewExpenditure(tx.expenditureId!); }}
                        className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                    >
                        Xem ảnh
                    </button>
                );
            }
            switch (evidence) {
                case 'COMPLETED':
                    return (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewExpenditure(tx.expenditureId!); }}
                            className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                            Đã xác nhận
                        </button>
                    );
                case 'PENDING':
                    return <span className="text-[9px] font-bold text-gray-300 italic">Chờ bổ sung</span>;
                case 'FLAGGED':
                    return <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">Cần kiểm</span>;
                default:
                    return <span className="text-[9px] font-bold text-gray-400 italic">Không có</span>;
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
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
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
                            <th className="pb-2 px-2 text-center w-[6%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedData.map((tx, index) => {
                            const statusBadge = getStatusBadge(tx.status);
                            return (
                                <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Người tạo + Thời gian */}
                                    <td className="py-2 px-2">
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
                                    <td className="py-2 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => onViewDetails(tx)}
                                                className="p-1 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 border border-gray-100 transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </button>
                                            {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' && (
                                                <button
                                                    onClick={() => onApprove(tx)}
                                                    className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-all"
                                                    title="Duyệt"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                </button>
                                            )}
                                            {tx.type === 'WITHDRAWAL' && tx.status === 'FLAGGED' && (
                                                <button
                                                    onClick={() => onFlag(tx)}
                                                    className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                                                    title="Kiểm duyệt"
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                </button>
                                            )}
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
                <span>Hiển thị {paginatedData.length} / {transactions.length}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded-lg bg-gray-50 border border-gray-100 disabled:opacity-50 hover:bg-gray-100 transition-all"
                    >
                        <ChevronDown className="h-3 w-3 rotate-90" />
                    </button>
                    <span className="mx-1 text-gray-900 font-black">Trang {currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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
    onApprove: (tx: Transaction) => void;
    onFlag: (tx: Transaction) => void;
}

export const TransactionDetailModal = ({ transaction, onClose, onApprove, onFlag }: TransactionDetailModalProps) => {
    if (!transaction) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Chi tiết giao dịch</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                            MÃ GD: #{transaction.id} • {transaction.time}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                            {/* Type */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Loại giao dịch</label>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black ${transaction.type === 'DONATION' || transaction.type === 'REFUND' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {transaction.type === 'DONATION' || transaction.type === 'REFUND' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                    {transaction.type === 'DONATION' ? 'Quyên góp' : transaction.type === 'REFUND' ? 'Hoàn trả' : 'Rút tiền'}
                                </div>
                            </div>

                            {/* Chiến dịch */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Chiến dịch</label>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-900">{transaction.campaignName}</div>
                                    <div className="text-[9px] font-black mt-0.5 text-gray-400">
                                        {transaction.fundType === 'AUTHORIZED' ? 'Quỹ ủy quyền' : 'Quỹ vật phẩm'}
                                    </div>
                                </div>
                            </div>

                            {/* Số tiền */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Số tiền</label>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                    <div className={`text-[18px] font-black tracking-tight ${transaction.type === 'DONATION' || transaction.type === 'REFUND' ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                        {transaction.type === 'WITHDRAWAL' && '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                            {/* Người tạo */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Người tạo</label>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-900">{transaction.actorName}</div>
                                    <div className="text-[9px] font-bold text-gray-400 mt-0.5">{transaction.time}</div>
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Trạng thái</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black border ${transaction.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' :
                                    transaction.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {transaction.status === 'COMPLETED' ? '✓ Thành công' :
                                        transaction.status === 'PENDING' ? '⏳ Chờ duyệt' : '⚠ Nghi vấn'}
                                </span>
                            </div>

                            {/* Bằng chứng */}
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Bằng chứng</label>
                                <div className="bg-gray-900 rounded-xl p-3 text-white flex items-center justify-center h-14">
                                    <span className="text-[9px] font-bold text-gray-400">
                                        {transaction.evidence === 'COMPLETED' ? 'Đã xác nhận' :
                                            transaction.evidence === 'PENDING' ? 'Chờ bổ sung' : 'Cần kiểm duyệt'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all"
                    >
                        Đóng
                    </button>
                    <div className="flex items-center gap-2">
                        {transaction.type === 'WITHDRAWAL' && transaction.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => { onFlag(transaction); onClose(); }}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                >
                                    Cần bổ sung
                                </button>
                                <button
                                    onClick={() => { onApprove(transaction); onClose(); }}
                                    className="px-5 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow hover:bg-green-700 transition-all"
                                >
                                    ✓ Duyệt giải ngân
                                </button>
                            </>
                        )}
                        {transaction.type === 'WITHDRAWAL' && transaction.status === 'FLAGGED' && (
                            <button
                                onClick={() => { onApprove(transaction); onClose(); }}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow hover:bg-indigo-700 transition-all"
                            >
                                ✓ Xác nhận bằng chứng
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
