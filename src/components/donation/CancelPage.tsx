'use client';

import React from 'react';
import { CampaignDto } from '@/types/campaign';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

type CancelPageProps = {
    campaign: CampaignDto | null;
};

export default function CancelPage({ campaign }: CancelPageProps) {
    const router = useRouter();

    // Background image from campaign, or a high-quality default fallback
    const bgImage = (campaign?.coverImageUrl && campaign.coverImageUrl.trim() !== '')
        ? campaign.coverImageUrl
        : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop';

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
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            </div>

            {/* Main Content Card - Darker glass effect */}
            <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
                <div className="p-10 md:p-14 text-center text-white">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-bounce">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white uppercase">Thanh toán bị hủy</h1>
                    <p className="text-lg md:text-xl font-bold text-red-400 mb-10 tracking-wide">
                        Giao dịch chưa hoàn tất. Đừng lo lắng!
                    </p>

                    <div className="max-w-lg mx-auto mb-10">
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
                            Đừng lo lắng, chúng tôi chưa trừ bất kỳ khoản tiền nào từ tài khoản của bạn.
                            Nếu đây là nhầm lẫn, bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
                            Nếu cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => {
                                if (campaign?.id === 1) {
                                    router.push('/campaigns#general-donation');
                                } else {
                                    router.push(`/donation?campaignId=${campaign?.id || ''}`);
                                }
                            }}
                            className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-extrabold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg text-xs uppercase tracking-wider"
                        >
                            Thử lại quyên góp
                        </button>
                        <button
                            onClick={() => {
                                if (campaign?.id === 1) {
                                    router.push('/campaigns#general-donation');
                                } else {
                                    router.push(campaign ? `/campaigns-details?id=${campaign.id}` : '/');
                                }
                            }}
                            className="px-8 py-3 bg-transparent border border-white/20 hover:bg-white/10 text-white font-extrabold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg text-xs uppercase tracking-wider"
                        >
                            {campaign?.id === 1 ? 'Quay về Quỹ Chung' : (campaign ? 'Xem chiến dịch' : 'Quay về trang chủ')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
