'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';

interface InternalTransactionFormProps {
    campaigns: any[];
    onSuccess: () => void;
}

export function InternalTransactionForm({ campaigns, onSuccess }: InternalTransactionFormProps) {
    const [formData, setFormData] = useState({
        targetCampaignId: '',
        amount: '',
        type: 'SUPPORT',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredCampaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCampaign = campaigns.find(c => c.id === Number(formData.targetCampaignId));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.targetCampaignId || !formData.amount) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                amount: Number(formData.amount),
                type: 'SUPPORT',
                reason: formData.reason,
                fromCampaignId: 1,
                toCampaignId: Number(formData.targetCampaignId),
                status: 'COMPLETED',
                createdByStaffId: 1 // Placeholder, ideally from auth context
            };

            await generalFundApi.createTransaction(payload);
            toast.success('Giao dịch thành công');
            setFormData({ targetCampaignId: '', amount: '', type: 'SUPPORT', reason: '' });
            setSearchQuery('');
            setIsOpen(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Giao dịch thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Giao dịch nhanh</h3>
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2 relative">
                {/* Custom Searchable Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-900 flex items-center justify-between hover:bg-gray-100 transition-all"
                    >
                        <span className={selectedCampaign ? 'text-gray-900' : 'text-gray-400'}>
                            {selectedCampaign ? selectedCampaign.title : 'Chọn quỹ/chiến dịch...'}
                        </span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="p-2 border-b border-gray-50 flex items-center gap-2">
                                <Search className="h-3 w-3 text-gray-300" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Tìm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-gray-900"
                                />
                            </div>
                            <div className="max-h-[120px] overflow-auto custom-scrollbar p-1">
                                {filteredCampaigns.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, targetCampaignId: c.id.toString() });
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        {c.title}
                                    </button>
                                ))}
                                {filteredCampaigns.length === 0 && (
                                    <div className="px-3 py-2 text-[9px] font-bold text-gray-300 italic">Không tìm thấy</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div className="relative">
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Số tiền (VNĐ)..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-3 pr-8 py-2 text-[10px] font-black text-gray-900 outline-none focus:ring-1 focus:ring-gray-200 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[9px]">đ</span>
                </div>

                {/* Reason */}
                <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={2}
                    placeholder="Lý do (không bắt buộc)..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-600 outline-none focus:ring-1 focus:ring-gray-200 transition-all resize-none flex-1"
                />

                <button
                    disabled={submitting}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {submitting ? 'Đang gửi...' : 'Xác nhận cứu trợ'}
                </button>
            </form>
        </div>
    );
}
