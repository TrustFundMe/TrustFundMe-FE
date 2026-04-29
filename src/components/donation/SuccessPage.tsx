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

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#fff8f3] font-sans" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,94,20,0.06) 0%, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-lg">
                <div className="rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-[#ff5e14] via-[#ff8a50] to-[#ff5e14]" />

                    <div className="p-8 md:p-10 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5e14]">
                            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff5e14] mb-4">
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            Quyên góp thành công
                        </span>

                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-3">Cảm ơn bạn!</h1>
                        <p className="text-base font-medium text-gray-600 leading-relaxed max-w-md mx-auto mb-6">
                            {campaign?.thankMessage || 'Khoản đóng góp của bạn đã được ghi nhận thành công và đúng chiến dịch.'}
                        </p>

                        <div className="mx-auto max-w-sm rounded-xl border border-orange-100 bg-[#fff8f3] p-4 mb-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1">
                                Số tiền đóng góp
                            </p>
                            <p className="text-2xl font-black tabular-nums text-gray-900">
                                {amount.toLocaleString('vi-VN')}
                                <span className="ml-1 text-sm font-bold text-gray-400">VNĐ</span>
                            </p>
                        </div>

                        {campaign && (
                            <div className="mx-auto max-w-sm rounded-xl border border-gray-100 bg-gray-50/60 p-4 mb-6 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1.5">
                                    Chiến dịch
                                </p>
                                <p className="text-sm font-bold text-gray-800 leading-snug">
                                    {campaign.title}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Bạn có thể theo dõi tiến độ sử dụng quỹ tại trang chi tiết chiến dịch.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (campaign?.id === 1) {
                                    router.push('/campaigns#general-donation');
                                } else {
                                    router.push(campaign ? `/campaigns-details?id=${campaign.id}` : '/');
                                }
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff5e14] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea550c] active:scale-[0.98]"
                        >
                            {campaign?.id === 1 ? 'Quay về quỹ chung' : (campaign ? 'Quay về chiến dịch' : 'Quay về trang chủ')}
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 10h10M11 6l4 4-4 4" />
                            </svg>
                        </button>

                        <div className="mt-3">
                            <a href="/campaigns" className="text-xs font-semibold text-gray-400 hover:text-[#ff5e14] transition-colors">
                                Khám phá thêm chiến dịch khác
                            </a>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-[10px] font-medium text-gray-300">
                    TrustFundMe &mdash; Nền tảng gây quỹ minh bạch
                </p>
            </div>
        </div>
    );
}
