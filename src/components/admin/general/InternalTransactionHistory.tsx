'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye, Check, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { InternalTransaction } from '@/types/internalTransaction';



interface InternalTransactionHistoryProps {
    history: InternalTransaction[];
}

export function InternalTransactionHistory({ history: initialHistory }: InternalTransactionHistoryProps) {
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Mock Data for demonstration as requested
    const mockData: any[] = [
        {
            id: 'REQ-001',
            createdAt: new Date().toISOString(),
            staff: { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=a' },
            campaign: { title: 'Cứu trợ lũ lụt miền Trung', type: 'Ủy quyền', owner: 'Lê Văn C' },
            amount: 50000000,
            reason: 'Cần trích quỹ khẩn cấp để mua nhu yếu phẩm cho vùng cô lập',
            status: 'PENDING'
        },
        {
            id: 'REQ-002',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            staff: { name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=b' },
            campaign: { title: 'Xây trường cho em', type: 'Vật phẩm', owner: 'Phạm Thị D' },
            amount: 25000000,
            reason: 'Bổ dung kinh phí vận chuyển vật liệu xây dựng',
            status: 'APPROVED'
        }
    ];

    const displayHistory = [...mockData, ...initialHistory];

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative font-sans">
            <div className="p-4 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Yêu cầu hỗ trợ từ Staff</h3>
                    <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-orange-100">
                        {mockData.length} MỚI
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên nhân viên hoặc chiến dịch..."
                            className="w-full bg-gray-50 border border-gray-100 py-1.5 pl-10 pr-4 rounded-xl text-[10px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest">
                        <Filter className="h-3 w-3" />
                        Lọc
                    </button>
                </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100 uppercase">
                        <tr>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Nhân viên</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Chiến dịch</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-right">Số tiền</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Lý do</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-center">Trạng thái</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayHistory.map((tx, idx) => (
                            <tr key={tx.id || idx} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-3 px-6">
                                    <div className="flex items-center gap-3">
                                        {tx.staff ? (
                                            <img src={tx.staff.avatar} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" alt="" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">S</div>
                                        )}
                                        <div>
                                            <div className="text-[11px] font-black text-gray-900">{tx.staff?.name || 'Hệ thống'}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 px-6">
                                    <div className="text-[11px] font-black text-gray-800 line-clamp-1">{tx.campaign?.title || 'Quỹ Chung'}</div>
                                    <div className="text-[9px] text-gray-400 font-bold">{tx.campaign?.type || 'Điều chuyển'}</div>
                                </td>
                                <td className="p-3 px-6 text-right">
                                    <div className={`text-[11px] font-black ${tx.status === 'REJECTED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {formatCurrency(tx.amount)}
                                    </div>
                                </td>
                                <td className="p-3 px-6">
                                    <div className="text-[10px] font-bold text-gray-600 line-clamp-1 max-w-xs">{tx.reason || 'Yêu cầu trích quỹ nội bộ'}</div>
                                </td>
                                <td className="p-3 px-6 text-center">
                                    <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-lg border ${tx.status === 'COMPLETED' || tx.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        tx.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {tx.status === 'COMPLETED' || tx.status === 'APPROVED' ? 'Đã duyệt' :
                                            tx.status === 'PENDING' ? 'Đang chờ' : 'Từ chối'}
                                    </span>
                                </td>
                                <td className="p-3 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedRequest(tx)}
                                            className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedRequest && (
                    <RequestDetailsModal
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function RequestDetailsModal({ request, onClose }: { request: any, onClose: () => void }) {
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
                className="bg-white rounded-[32px] w-full max-w-5xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Chi tiết yêu cầu hỗ trợ quỹ</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">YÊU CẦU: {request.id} • NGÀY TẠO: {new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all hover:scale-105 active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Col 1: Entities */}
                        <div className="space-y-4">
                            <section>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Chiến dịch & Chủ sở hữu</label>
                                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                                    <div className="text-[12px] font-black text-gray-900 leading-snug">{request.campaign?.title}</div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="text-[10px] font-bold text-gray-500">Chủ quỹ:</div>
                                        <div className="text-[10px] font-black text-gray-900">{request.campaign?.owner || '---'}</div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                                        <span className="font-bold text-gray-500">Loại quỹ:</span>
                                        <span className="font-black text-blue-600 bg-blue-50 px-1.5 rounded">{request.campaign?.type}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nhân viên đề xuất (Staff)</label>
                                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                    <img src={request.staff?.avatar} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" alt="" />
                                    <div>
                                        <div className="text-[11px] font-black text-gray-900">{request.staff?.name}</div>
                                        <div className="text-[9px] font-bold text-gray-400">STAFF ID: 1241</div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Col 2: Details */}
                        <div className="space-y-4">
                            <section>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ngân sách & Lý do</label>
                                <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 text-center">
                                    <div className="text-[20px] font-black text-emerald-600 tracking-tight">
                                        {formatCurrency(request.amount)}
                                    </div>
                                    <div className={`mt-2 inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-lg border ${request.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                        {request.status === 'APPROVED' ? 'Duyệt sơ bộ' : 'Chờ phê duyệt'}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-[100px] overflow-auto custom-scrollbar">
                                    <p className="text-[10px] font-medium text-gray-600 leading-relaxed italic">
                                        "{request.reason}"
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Col 3: Evidence */}
                        <div className="flex flex-col">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Minh chứng giải ngân (Admin)</label>
                            <div className="flex-1 min-h-[180px] bg-gray-900 rounded-3xl p-5 text-white flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                                        <Plus className="h-4 w-4 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex-1 border-2 border-dashed border-white/20 rounded-[20px] flex flex-col items-center justify-center hover:border-white/40 transition-all cursor-pointer bg-white/5 space-y-2">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                                        <div className="text-[16px]">🖼️</div>
                                    </div>
                                    <div className="text-center px-4">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-200">Kéo thả hoặc Click</div>
                                        <div className="text-[8px] text-gray-500 font-bold mt-1 uppercase">JPG, PNG • Tối đa 5MB</div>
                                    </div>
                                    <input type="file" className="hidden" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center px-10">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all"
                    >
                        Để sau
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                            Từ chối
                        </button>
                        <button className="px-10 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200/50 hover:bg-gray-800 transition-all hover:translate-y-[-1px] active:translate-y-[1px]">
                            Duyệt & Giải ngân
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}



