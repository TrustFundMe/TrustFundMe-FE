'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SuccessPage from '@/components/donation/SuccessPage';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService'; // added import
import { CampaignDto } from '@/types/campaign';
import { PaymentResponse } from '@/services/paymentService'; // added for type safety

function SuccessContent() {
    const searchParams = useSearchParams();
    // Read the explicit 'donationId' query param we passed in our returnUrl
    const donationIdParam = searchParams.get('donationId');
    const [amount, setAmount] = useState<number>(0);
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);

    useEffect(() => {
        if (donationIdParam) {
            const id = parseInt(donationIdParam);
            if (!isNaN(id)) {
                // 0. Verify status with backend first (especially for localhost)
                paymentService.verifyPayment(id).then(() => {
                    // 1. Fetch donation details to get campaignId and totalAmount
                    paymentService.getDonation(id)
                        .then(donationData => {
                            setAmount(donationData.totalAmount || 0);

                            // 2. Fetch campaign details for background image
                            if (donationData.campaignId) {
                                campaignService.getById(donationData.campaignId)
                                    .then(data => setCampaign(data))
                                    .catch(err => console.error('Error fetching campaign details:', err));
                            }
                        })
                        .catch(err => console.error('Error fetching donation details:', err));
                });
            }
        }
    }, [donationIdParam]);

    return <SuccessPage campaign={campaign} amount={amount} />;
}

export default function DonationSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
                Đang xử lý thông tin thành công...
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
