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
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 font-sans" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            {/* Background with Black Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Main Content Card - Darker glass effect */}
            <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
                <div className="p-10 md:p-14 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight text-white">Cảm Ơn Bạn!</h1>
                    <p className="text-lg md:text-xl font-bold text-[#fbbf24] mb-10 tracking-wide max-w-xl mx-auto italic">
                        {campaign?.thankMessage || 'Sự đóng góp của bạn có ý nghĩa vô cùng lớn với thế giới và chúng tôi.'}
                    </p>

                    <div className="max-w-lg mx-auto mb-10 space-y-6">
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
                            Chúng tôi vô cùng trân trọng sự tin tưởng của bạn. Khoản quyên góp{' '}
                            <span className="font-bold text-white">
                                {amount.toLocaleString('vi-VN')}₫
                            </span>{' '}
                            đã được nhận thành công.
                        </p>

                        <p className="text-[11px] text-gray-400 font-medium pt-4">
                            Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của TrustFundMe.
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
                        className="px-8 py-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-extrabold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg text-xs uppercase tracking-wider"
                    >
                        {campaign?.id === 1 ? 'Quay về Quỹ Chung' : (campaign ? 'Quay về chiến dịch' : 'Quay về trang chủ')}
                    </button>
                </div>
            </div>
        </div>
    );
}
