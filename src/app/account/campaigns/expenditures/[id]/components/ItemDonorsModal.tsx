'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Search, UserCircle, Loader2 } from 'lucide-react';
import { paymentService, RecentDonor } from '@/services/paymentService';
import toast from 'react-hot-toast';

interface ItemDonorsModalProps {
    itemId: number;
    itemName: string;
    onClose: () => void;
}

export const ItemDonorsModal: React.FC<ItemDonorsModalProps> = ({ itemId, itemName, onClose }) => {
    const [donors, setDonors] = useState<RecentDonor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchDonors = async () => {
            try {
                setIsLoading(true);
                const data = await paymentService.getDonorsByItem(itemId);
                if (isMounted) setDonors(data);
            } catch (error) {
                console.error("Failed to fetch item donors:", error);
                if (isMounted) toast.error("Không thể tải danh sách người quyên góp");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchDonors();
        return () => { isMounted = false; };
    }, [itemId]);

    const filteredDonors = donors.filter(d => 
        (d.donorName || 'Nhà hảo tâm ẩn danh').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B152A]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-base font-black text-[#1E293B]">Danh sách người quyên góp</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-0.5 line-clamp-1">{itemName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhà hảo tâm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-3">
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            <p className="text-xs font-bold text-slate-400">Đang tải danh sách...</p>
                        </div>
                    ) : filteredDonors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                                <UserCircle className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">Không tìm thấy kết quả</p>
                            <p className="text-xs text-slate-400">Chưa có người quyên góp nào khớp với tìm kiếm của bạn.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-2">
                            {filteredDonors.map((donor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100 shrink-0">
                                            {donor.anonymous ? (
                                                <UserCircle className="w-5 h-5 text-emerald-600" />
                                            ) : donor.donorAvatar ? (
                                                <img src={donor.donorAvatar} alt={donor.donorName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-black text-emerald-600 uppercase">
                                                    {donor.donorName?.charAt(0) || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-[#1E293B] truncate">
                                                {donor.anonymous ? 'Nhà hảo tâm ẩn danh' : donor.donorName}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[11px] font-medium text-slate-500">
                                                    {new Date(donor.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(donor.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-[11px] font-bold text-[#64748B]">
                                                    SL: {donor.quantity || 1}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-600 shrink-0 tabular-nums">
                                        +{new Intl.NumberFormat('vi-VN').format(donor.amount)} đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
