import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Receipt } from 'lucide-react';

export default function AccountCampaignTabbar({ campaignId }: { campaignId?: number | string }) {
    const pathname = usePathname();

    const isEditPage = pathname?.includes('/edit');
    const isExpendituresPage = pathname?.includes('/expenditures');

    return (
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2 overflow-x-auto custom-scrollbar">
            {campaignId && (
                <>
                    <Link
                        href={`/account/campaigns/edit?id=${campaignId}`}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${isEditPage
                            ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Thiết lập & Cập nhật
                    </Link>

                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${campaignId}`}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${isExpendituresPage
                            ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                    >
                        <Receipt className="w-4 h-4" />
                        Quản lý chi tiêu
                    </Link>
                </>
            )}
        </div>
    );
}
