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
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (donationIdParam) {
            const id = parseInt(donationIdParam);
            if (!isNaN(id)) {
                // 0. Verify status with backend first (especially for localhost)
                paymentService.verifyPayment(id).then(() => {
                    // 1. Fetch donation details to get campaignId and totalAmount
                    paymentService.getDonation(id)
                        .then(async donationData => {
                            if (!mounted) return;
                            setAmount(donationData.totalAmount || 0);

                            // 2. Call payment-service to sync balance safely (idempotent)
                            console.log('🔍 [DEBUG] Donation data received:', donationData);
                            if (donationData.campaignId) {
                                try {
                                    console.info(`🚀 [DEBUG] Triggering syncBalance for donation ${id} on campaign ${donationData.campaignId}`);
                                    await paymentService.syncBalance(id);
                                    console.info('✅ [DEBUG] syncBalance call finished.');
                                } catch (err) {
                                    console.error('❌ [DEBUG] syncBalance error:', err);
                                }
                            } else {
                                console.warn('⚠️ [DEBUG] No campaignId in donationData', donationData);
                            }

                            // 3. Fetch campaign details for background image and thankMessage
                            if (donationData.campaignId) {
                                console.info(`🔍 Fetching campaign details for ID: ${donationData.campaignId}...`);
                                campaignService.getById(donationData.campaignId)
                                    .then(data => {
                                        if (!mounted) return;
                                        console.info('✅ Campaign details fetched:', data);
                                        setCampaign(data);
                                        setIsReady(true);
                                    })
                                    .catch(err => {
                                        console.error('❌ Error fetching campaign details:', err);
                                        if (mounted) setIsReady(true);
                                    });
                            } else {
                                console.warn('⚠️ No campaignId found in donation details.');
                                if (mounted) setIsReady(true);
                            }
                        })
                        .catch(err => {
                            console.error('Error fetching donation details:', err);
                            if (mounted) setIsReady(true);
                        });
                });
            }
        } else {
            setIsReady(true);
        }

        return () => {
            mounted = false;
        };
    }, [donationIdParam]);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#eef5f3] flex items-center justify-center">
                <div className="w-full max-w-2xl rounded-[2rem] border border-[#d6e8e3] bg-white px-8 py-10 shadow-[0_12px_40px_-20px_rgba(15,93,81,0.35)]">
                    <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-6" />
                    <div className="h-10 w-2/3 rounded bg-slate-200 animate-pulse mb-4" />
                    <div className="h-4 w-full rounded bg-slate-200 animate-pulse mb-2" />
                    <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse" />
                </div>
            </div>
        );
    }

    return <SuccessPage campaign={campaign} amount={amount} />;
}

export default function DonationSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#eef5f3] flex items-center justify-center text-[#0f5d51] font-bold">
                Đang xử lý thông tin thành công...
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
