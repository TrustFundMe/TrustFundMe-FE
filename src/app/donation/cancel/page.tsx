'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CancelPage from '@/components/donation/CancelPage';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';

function CancelContent() {
    const searchParams = useSearchParams();
    const campaignIdParam = searchParams.get('campaignId');
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);

    // In PayOS redirect, 'id' is often the orderCode (donationId)
    // We might need to fetch the donation first to get campaignId, 
    // but for now let's assume if it's not provided we might just show a general cancel page.

    // TODO: Ideally fetch donation by id to get its campaignId if campaignId isn't in URL

    useEffect(() => {
        if (campaignIdParam) {
            const id = parseInt(campaignIdParam);
            if (!isNaN(id)) {
                campaignService.getById(id)
                    .then(data => setCampaign(data))
                    .catch(err => console.error('Error fetching campaign for cancel page:', err));
            }
        }
    }, [campaignIdParam]);

    return <CancelPage campaign={campaign} />;
}

export default function DonationCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
                Đang xử lý thông tin hủy...
            </div>
        }>
            <CancelContent />
        </Suspense>
    );
}
