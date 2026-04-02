'use client';

import React from 'react';
import { Search, Filter, MoreHorizontal, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { InternalTransaction } from '@/types/internalTransaction';

interface InternalTransactionHistoryProps {
    history: InternalTransaction[];
    onAddTransaction: () => void;
}

export function InternalTransactionHistory({ history, onAddTransaction }: InternalTransactionHistoryProps) {
    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Chi tiết giao dịch</h3>
                    <button
                        onClick={onAddTransaction}
                        className="h-6 w-6 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        title="Tạo giao dịch mới"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giao dịch..."
                            className="w-full bg-gray-50 border border-gray-100 py-2 pl-11 pr-4 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest">
                        <Filter className="h-3 w-3" />
                        Lọc
                    </button>
                </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[150px]">Ngày thực hiện</th>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[120px]">Phân loại</th>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Nội dung điều chuyển</th>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Số tiền</th>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center w-[120px]">Trạng thái</th>
                            <th className="p-3 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right w-[80px]">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <td className="p-3 px-6">
                                    <div className="text-[11px] font-black text-gray-900">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-[9px] text-gray-400 font-bold">{new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="p-3 px-6">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${tx.type === 'SUPPORT' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {tx.type === 'SUPPORT' ? 'Cứu trợ' : 'Thu hồi'}
                                    </span>
                                </td>
                                <td className="p-3 px-6">
                                    <div className="text-[11px] font-bold text-gray-600 line-clamp-1 max-w-xs">{tx.reason || 'Chuyển nguồn vốn nội bộ'}</div>
                                </td>
                                <td className="p-3 px-6 text-right">
                                    <div className="text-[11px] font-black text-gray-900">{formatCurrency(tx.amount)}</div>
                                </td>
                                <td className="p-3 px-6 text-center">
                                    <span className="inline-flex items-center text-[10px] font-black bg-gray-50 text-gray-400 px-2.5 py-0.5 rounded-lg border border-gray-100">
                                        Hoàn tất
                                    </span>
                                </td>
                                <td className="p-3 px-6 text-right">
                                    <button className="h-8 w-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-900 hover:text-white transition-all ml-auto">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <p className="text-[11px] font-black text-gray-300 uppercase italic">Chưa có dữ liệu giao dịch</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
