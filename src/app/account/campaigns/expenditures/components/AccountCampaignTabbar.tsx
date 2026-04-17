import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Receipt } from 'lucide-react';

export default function AccountCampaignTabbar({ campaignId }: { campaignId?: number | string }) {
    const pathname = usePathname();

    const isEditPage = pathname?.includes('/edit');
    const isExpendituresPage = pathname?.includes('/expenditures');

    return null;
}
