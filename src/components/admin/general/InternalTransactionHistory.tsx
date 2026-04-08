'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye, Check, X, Plus, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { InternalTransaction } from '@/types/internalTransaction';
import { mediaService } from '@/services/mediaService';
import { generalFundApi } from '@/api/generalFundApi';
import { toast } from 'react-hot-toast';



interface InternalTransactionHistoryProps {
    history: InternalTransaction[];
    campaigns: any[];
    users?: any[];
    onUpdateStatus?: (id: number, status: string) => Promise<void>;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onRefresh?: () => Promise<void>;
}

export function InternalTransactionHistory({
    history,
    campaigns,
    users = [],
    onUpdateStatus,
    onRefresh,
    currentPage,
    totalPages,
    totalElements,
    onPageChange
}: InternalTransactionHistoryProps) {
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter type SUPPORT (server-side pagination for General Fund history already implies this, 
    // but we keep the logical check for safety)
    const displayHistory = history.filter(tx => tx.type === 'SUPPORT');

    // Local pagination removed - using props from parent instead

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative font-sans">
            <div className="py-2 px-4 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Yêu cầu hỗ trợ từ Staff</h3>
                    <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-orange-100">
                        {totalElements}
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-lg">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên nhân viên hoặc chiến dịch..."
                            className="w-full bg-gray-50 border border-gray-100 py-1.5 pl-10 pr-4 rounded-xl text-[10px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 p-0.5 rounded-xl border border-gray-100">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-gray-900 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Tải lại dữ liệu"
                        >
                            <RefreshCcw className="h-3 w-3" />
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200"></div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[9px] font-black text-gray-400 px-2 py-1 outline-none uppercase cursor-pointer hover:text-gray-900 transition-colors"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="PENDING">Đang chờ</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
                <table className="w-full text-left border-collapse relative">
                    <thead className="bg-white sticky top-0 z-20 border-b border-gray-100 uppercase shadow-sm">
                        <tr>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Nhân viên</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Số điện thoại</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Chiến dịch</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-right">Số tiền</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em]">Lý do</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-center">Trạng thái</th>
                            <th className="p-3 px-6 text-[9px] font-black text-gray-400 tracking-[0.2em] text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayHistory.map((tx, idx) => {
                            const c = campaigns.find(c => c.id === tx.toCampaignId);
                            const staffUser = users.find(u => u.id === tx.createdByStaffId);
                            return (
                                <tr key={tx.id || idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-inner">
                                                {staffUser?.fullName ? staffUser.fullName.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-gray-900">{staffUser?.fullName || `Staff #${tx.createdByStaffId || 'N/A'}`}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 px-6">
                                        <div className="text-[11px] font-black text-gray-800">{staffUser?.phoneNumber || '---'}</div>
                                    </td>
                                    <td className="p-3 px-6">
                                        <div className="text-[11px] font-black text-gray-800 line-clamp-1">{c?.title || `Chiến dịch #${tx.toCampaignId}`}</div>
                                        <div className="text-[9px] text-gray-400 font-bold">{c?.category?.name || c?.categoryName || 'Quỹ chung'}</div>
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
                                                onClick={() => setSelectedRequest({ ...tx, staffUser })}
                                                className="p-2 rounded-xl bg-slate-50 text-slate-900 hover:text-white hover:bg-slate-900 hover:shadow-lg transition-all"
                                                title="Chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
                <div className="p-3 border-t border-gray-50 flex flex-wrap items-center justify-between text-[10px] font-black text-gray-400">
                    <div>
                        Hiển thị {displayHistory.length} / {totalElements} kết quả
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-100 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-2">Trang {currentPage + 1} / {totalPages}</span>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-100 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedRequest && (
                    <RequestDetailsModal
                        request={selectedRequest}
                        campaign={campaigns.find(c => c.id === selectedRequest.toCampaignId)}
                        onClose={() => setSelectedRequest(null)}
                        onUpdateStatus={onUpdateStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function RequestDetailsModal({ request, campaign, onClose, onUpdateStatus }: { request: any, campaign: any, onClose: () => void, onUpdateStatus?: (id: number, status: string) => Promise<void> }) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);
    const [evidenceUrl, setEvidenceUrl] = React.useState<string | null>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (request.evidenceImageId) {
            mediaService.getMediaById(request.evidenceImageId)
                .then(res => setEvidenceUrl(res.url))
                .catch(err => console.error("Failed to load evidence image", err));
        }
    }, [request.evidenceImageId]);

    const handleUploadClick = () => {
        if (!request.evidenceImageId && !evidenceUrl) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setLocalPreview(URL.createObjectURL(file));
    };

    const handleApprove = async () => {
        if (!onUpdateStatus) return;

        setUploading(true);
        try {
            if (selectedFile) {
                const mediaRes = await mediaService.uploadMedia(selectedFile, undefined, undefined, request.id as number, 'Evidence', 'PHOTO');
                await generalFundApi.updateEvidence(request.id as number, mediaRes.id);
            }
            await onUpdateStatus(request.id, 'APPROVED');
            toast.success('Đã duyệt và lưu minh chứng');
            onClose();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi duyệt');
        } finally {
            setUploading(false);
        }
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
                                    <div className="text-[12px] font-black text-gray-900 leading-snug">{campaign?.title || `Chiến dịch #${request.toCampaignId}`}</div>
                                </div>
                            </section>

                            <section>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nhân viên đề xuất (Staff)</label>
                                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-500 shadow-inner">
                                        {request.staffUser?.fullName ? request.staffUser.fullName.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-900">{request.staffUser?.fullName || `Staff #${request.createdByStaffId}`}</div>
                                        <div className="text-[10px] font-medium text-gray-500 mt-0.5">{request.staffUser?.phoneNumber || 'SĐT: ---'}</div>
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
                                        {request.status === 'APPROVED' ? 'Đã hỗ trợ' : 'Chờ phê duyệt'}
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
                                {(!request.evidenceImageId && !evidenceUrl) && (
                                    <div className="absolute top-0 right-0 p-3 z-20">
                                        <button onClick={handleUploadClick} disabled={uploading} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-emerald-500/80 transition-all cursor-pointer">
                                            <Plus className="h-4 w-4 text-emerald-400 group-hover:text-white" />
                                        </button>
                                    </div>
                                )}
                                <div
                                    onClick={(!request.evidenceImageId && !evidenceUrl) ? handleUploadClick : undefined}
                                    className={`flex-1 border-2 border-dashed border-white/20 rounded-[20px] flex flex-col items-center justify-center bg-white/5 space-y-2 relative overflow-hidden ${(!request.evidenceImageId && !evidenceUrl) ? 'hover:border-white/40 cursor-pointer transition-all' : ''}`}
                                >
                                    {uploading ? (
                                        <div className="h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    ) : evidenceUrl || localPreview ? (
                                        <img src={evidenceUrl || localPreview || ""} className="absolute inset-0 w-full h-full object-cover" alt="Evidence" />
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                                                <div className="text-[16px]">🖼️</div>
                                            </div>
                                            <div className="text-center px-4 relative z-10 bg-gray-900/40 p-2 rounded-xl backdrop-blur-sm">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-200">Kéo thả hoặc Click</div>
                                                <div className="text-[8px] text-gray-500 font-bold mt-1 uppercase">JPG, PNG • Tối đa 5MB</div>
                                            </div>
                                        </>
                                    )}
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
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
                    {request.status === 'PENDING' && onUpdateStatus && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    await onUpdateStatus(request.id, 'REJECTED');
                                    onClose();
                                }}
                                className="px-6 py-2.5 bg-white text-red-600 border border-red-100/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all">
                                Từ chối
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={uploading || (!request.evidenceImageId && !selectedFile)}
                                className="px-10 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200/50 hover:bg-gray-800 transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title={(!request.evidenceImageId && !selectedFile) ? "Vui lòng tải lên minh chứng trước khi duyệt" : ""}
                            >
                                {uploading ? 'Đang xử lý...' : 'Đã hỗ trợ'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}



