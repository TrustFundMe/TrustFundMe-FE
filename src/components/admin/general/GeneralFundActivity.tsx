'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { InternalTransaction } from '@/types/internalTransaction';
import { formatCurrency } from '@/lib/utils';

interface GeneralFundActivityProps {
    history: InternalTransaction[];
}

export function GeneralFundActivity({ history }: GeneralFundActivityProps) {
    // Take last 4 activities
    const recentItems = history.slice(0, 4);

    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Hoạt động gần đây</h3>
                <button className="text-gray-400 hover:text-gray-900">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 space-y-4">
                {recentItems.map((item) => (
                    <div key={item.id} className="flex flex-col border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50 cursor-pointer rounded-xl transition-all p-2 -mx-2">
                        <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[11px] font-black text-gray-900">
                                {item.type === 'SUPPORT' ? 'Cứu trợ chiến dịch' : item.type === 'RECOVERY' ? 'Thu hồi nguồn vốn' : 'Giao dịch mới'}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">
                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold leading-tight line-clamp-1">
                            {item.reason || `Chuyển ${formatCurrency(item.amount)} nội bộ`}
                        </div>
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-[10px] font-black text-gray-300 uppercase italic">Chưa có hoạt động</p>
                    </div>
                )}
            </div>
        </div>
    );
}
