'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle2, AlertTriangle, ShoppingCart, ImageIcon } from 'lucide-react';
import { ExpenditureDetail } from '@/app/admin/cash-flow/page';

interface ExpenditureDetailPanelProps {
    expenditure: ExpenditureDetail | null;
    onClose: () => void;
    onApprove: (exp: ExpenditureDetail) => void;
    onFlag: (exp: ExpenditureDetail) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const ExpenditureDetailPanel = ({ expenditure, onClose, onApprove, onFlag }: ExpenditureDetailPanelProps) => {
    const format = formatCurrency;

    return (
        <AnimatePresence>
            {expenditure && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[90] bg-gray-900/40 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-[95] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-start shrink-0 bg-gray-50/30">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Chi tiết giải ngân</h2>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                        expenditure.status === 'PENDING'
                                            ? 'text-yellow-600 bg-yellow-50 border-yellow-100'
                                            : 'text-red-600 bg-red-50 border-red-100'
                                    }`}>
                                        {expenditure.status === 'PENDING' ? 'Chờ duyệt' : 'Nghi vấn'}
                                    </span>
                                </div>
                                <p className="text-[9px] font-black text-gray-400">{expenditure.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Campaign info */}
                            <div className="bg-gray-50 p-3 rounded-[16px] border border-gray-100">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Chiến dịch</label>
                                <div className="text-[10px] font-black text-gray-900 leading-tight">{expenditure.campaignName}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <ExternalLink className="h-2.5 w-2.5 text-gray-400" />
                                    <span className="text-[9px] font-bold text-gray-400">{expenditure.campaignId}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 p-3 rounded-[16px] border border-gray-100">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mô tả</label>
                                <div className="text-[10px] font-bold text-gray-700">{expenditure.description}</div>
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-3 rounded-[16px] border border-gray-100">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Người yêu cầu</label>
                                    <div className="text-[10px] font-black text-gray-900 leading-tight">{expenditure.requester}</div>
                                    <div className="text-[8px] font-bold text-gray-400 mt-0.5">{expenditure.requestedAt}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-[16px] border border-gray-100">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Người duyệt</label>
                                    <div className="text-[10px] font-black text-gray-900 leading-tight">{expenditure.approvedBy}</div>
                                </div>
                            </div>

                            {/* Total amount */}
                            <div className="bg-indigo-50 p-3 rounded-[16px] border border-indigo-100">
                                <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Tổng tiền</label>
                                <div className="text-[18px] font-black text-indigo-600 tracking-tight">
                                    {format(expenditure.totalAmount)} <span className="underline text-[11px]">đ</span>
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                                    <ShoppingCart className="h-3 w-3 text-gray-400" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        Danh sách vật phẩm ({expenditure.items.length})
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {expenditure.items.map((item) => (
                                        <div key={item.id} className="p-3 flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-black text-gray-900 truncate">{item.name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 mt-0.5">
                                                    {item.quantity.toLocaleString('vi-VN')} {item.unit} × {format(item.unitPrice)} đ
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black text-gray-900 ml-3 shrink-0">
                                                {format(item.total)} <span className="underline text-[8px]">đ</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                                    <ImageIcon className="h-3 w-3 text-gray-400" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        Bằng chứng / Hóa đơn ({expenditure.images.length})
                                    </span>
                                </div>
                                {expenditure.images.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <div className="text-[9px] font-bold text-gray-400 italic">Chưa có bằng chứng</div>
                                    </div>
                                ) : (
                                    <div className="p-3 grid grid-cols-2 gap-2">
                                        {expenditure.images.map((img, i) => (
                                            <div key={i} className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={img}
                                                    alt={`Hóa đơn ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                                <div className="hidden absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-gray-400">Ảnh {i + 1}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0 bg-gray-50/30">
                            {expenditure.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => onFlag(expenditure)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        Cần bổ sung
                                    </button>
                                    <button
                                        onClick={() => onApprove(expenditure)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow hover:bg-green-700 transition-all"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Duyệt giải ngân
                                    </button>
                                </>
                            )}
                            {expenditure.status === 'FLAGGED' && (
                                <button
                                    onClick={() => onApprove(expenditure)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow hover:bg-indigo-700 transition-all"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Xác nhận bằng chứng
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
