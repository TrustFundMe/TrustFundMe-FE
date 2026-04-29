'use client';

import React from 'react';
import { CampaignDto } from '@/types/campaign';
import { useRouter } from 'next/navigation';

type SuccessPageProps = {
    campaign: CampaignDto | null;
    amount: number;
};

export default function SuccessPage({ campaign, amount }: SuccessPageProps) {
    const router = useRouter();

    // Background image from campaign, or a high-quality default fallback
    const bgImage = (campaign?.coverImageUrl && campaign.coverImageUrl.trim() !== '')
        ? campaign.coverImageUrl
        : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?q=80&w=2070&auto=format&fit=crop';

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#eef5f3] font-sans" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15,93,81,0.1) 0%, rgba(255,255,255,0.96) 45%), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-[#d6e8e3] bg-white shadow-[0_12px_40px_-20px_rgba(15,93,81,0.35)] overflow-hidden">
                <div className="p-8 md:p-12 text-center">
                    <span className="inline-flex rounded-full bg-[#e9f6f1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f5d51]">
                        Donation Success
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[#103d36]">Cảm ơn bạn!</h1>
                    <p className="mt-4 text-base md:text-lg font-semibold text-[#0f5d51] max-w-xl mx-auto">
                        {campaign?.thankMessage || 'Khoản đóng góp của bạn đã được ghi nhận thành công và đúng chiến dịch.'}
                    </p>

                    <div className="max-w-lg mx-auto mt-8 mb-8 space-y-4 rounded-2xl border border-[#e2efeb] bg-[#f7fbfa] p-5">
                        <p className="text-sm md:text-base text-[#32564f] leading-relaxed font-medium">
                            Chúng tôi rất trân trọng sự tin tưởng của bạn. Khoản quyên góp{' '}
                            <span className="font-bold text-[#0f5d51]">{amount.toLocaleString('vi-VN')}₫</span> đã được xác nhận.
                        </p>
                        <p className="text-xs text-[#4f6f69]">
                            Bạn có thể theo dõi tiến độ sử dụng quỹ tại trang chi tiết chiến dịch.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            if (campaign?.id === 1) {
                                router.push('/campaigns#general-donation');
                            } else {
                                router.push(campaign ? `/campaigns-details?id=${campaign.id}` : '/');
                            }
                        }}
                        className="px-8 py-3 bg-[#0f5d51] hover:bg-[#0c4f45] text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
                    >
                        {campaign?.id === 1 ? 'Quay về quỹ chung' : (campaign ? 'Quay về chiến dịch' : 'Quay về trang chủ')}
                    </button>
                </div>
            </div>
        </div>
    );
}
