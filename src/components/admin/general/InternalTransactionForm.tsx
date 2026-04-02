'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generalFundApi } from '@/api/generalFundApi';

interface InternalTransactionFormProps {
    campaigns: any[];
    onSuccess: () => void;
    onClose: () => void;
}

export function InternalTransactionForm({ campaigns, onSuccess, onClose }: InternalTransactionFormProps) {
    const [formData, setFormData] = useState({
        targetCampaignId: '',
        amount: '',
        type: 'SUPPORT', // SUPPORT or RECOVERY
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

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
                type: formData.type,
                reason: formData.reason,
                fromCampaignId: formData.type === 'SUPPORT' ? 1 : Number(formData.targetCampaignId),
                toCampaignId: formData.type === 'SUPPORT' ? Number(formData.targetCampaignId) : 1,
            };

            await generalFundApi.createTransaction(payload);
            toast.success('Giao dịch thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Giao dịch thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Tạo giao dịch nội bộ</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Loại giao dịch</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'SUPPORT' })}
                            className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'SUPPORT' ? 'bg-red-500 text-white shadow-lg shadow-red-100 border border-transparent' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                        >
                            Cứu trợ
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'RECOVERY' })}
                            className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'RECOVERY' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 border border-transparent' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                        >
                            Thu hồi
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Chiến dịch mục tiêu</label>
                    <select
                        value={formData.targetCampaignId}
                        onChange={(e) => setFormData({ ...formData, targetCampaignId: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all appearance-none"
                    >
                        <option value="">Chọn chiến dịch...</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Số tiền (VNĐ)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-sm font-black text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">đ</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Lý do / Nội dung</label>
                    <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        rows={3}
                        placeholder="Nhập ghi chú giao dịch..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                    />
                </div>

                <button
                    disabled={submitting}
                    className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {submitting ? 'Đang xử lý...' : (
                        <>
                            <Plus className="h-4 w-4" />
                            Xác nhận giao dịch
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
