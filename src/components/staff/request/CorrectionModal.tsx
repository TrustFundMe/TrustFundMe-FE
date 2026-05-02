'use client';

import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface CorrectionModalProps {
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

export default function CorrectionModal({ onConfirm, onCancel }: CorrectionModalProps) {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                        <h3 className="text-[11px] font-bold text-gray-800 uppercase">Yêu cầu chỉnh sửa</h3>
                    </div>
                    <button onClick={onCancel} className="h-6 w-6 rounded hover:bg-gray-50 flex items-center justify-center text-gray-400">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <textarea
                    autoFocus
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Nhập nội dung cần chỉnh sửa (VD: Thiếu hóa đơn hạng mục 1...)"
                    rows={4}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-lg p-3 text-[11px] font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-orange-200 focus:bg-white transition-all resize-none mb-4"
                />

                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 h-8 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 hover:bg-gray-50 transition-all uppercase">
                        Hủy
                    </button>
                    <button
                        onClick={() => reason.trim() && onConfirm(reason)}
                        disabled={!reason.trim()}
                        className="flex-[2] h-8 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition-all disabled:opacity-50 uppercase shadow-sm"
                    >
                        Gửi yêu cầu
                    </button>
                </div>
            </div>
        </div>
    );
}
