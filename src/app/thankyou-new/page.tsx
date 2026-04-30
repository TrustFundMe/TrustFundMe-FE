'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { paymentService } from '@/services/paymentService';
import { campaignService } from '@/services/campaignService';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const donationIdParam = searchParams?.get('donationId');
  const campaignIdParam = searchParams?.get('campaignId');
  const [amount, setAmount] = useState<number>(Number(searchParams?.get('amount')) || 0);
  const [campaignTitle, setCampaignTitle] = useState<string>(searchParams?.get('campaignTitle') || 'Chưa có dữ liệu chiến dịch');
  const [thankMessage, setThankMessage] = useState<string>(
    searchParams?.get('thankMessage') || 'Khoản đóng góp của bạn đã được ghi nhận thành công.',
  );
  const [campaignId, setCampaignId] = useState<string>(campaignIdParam || '-');
  const [paidAt, setPaidAt] = useState<string>(new Date().toLocaleString('vi-VN'));
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(donationIdParam));
  const [animatedAmount, setAnimatedAmount] = useState(0);

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    let rafId = 0;
    const duration = 900;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedAmount(Math.round(amount * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [amount]);

  useEffect(() => {
    let mounted = true;

    const loadRealData = async () => {
      if (!donationIdParam) {
        setIsLoading(false);
        return;
      }

      const donationId = Number(donationIdParam);
      if (Number.isNaN(donationId)) {
        setIsLoading(false);
        return;
      }

      try {
        const donation = await paymentService.getDonation(donationId);
        if (!mounted) return;

        setAmount(donation.totalAmount || donation.donationAmount || 0);
        setPaidAt(new Date().toLocaleString('vi-VN'));

        if (donation.campaignId) {
          const cid = String(donation.campaignId);
          setCampaignId(cid);
          try {
            const campaign = await campaignService.getById(donation.campaignId);
            if (!mounted) return;
            setCampaignTitle(campaign.title || campaignTitle);
            setBalance(campaign.balance || 0);
            if (campaign.thankMessage) setThankMessage(campaign.thankMessage);
          } catch {
            if (mounted) setCampaignTitle(`Chiến dịch #${cid}`);
          }
        }
      } catch {
        // Keep query fallback values when API fails.
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadRealData();
    return () => {
      mounted = false;
    };
  }, [donationIdParam, campaignTitle]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#fff8f3] px-4 py-8">
        <div className="mx-auto w-full max-w-[900px] rounded-[2rem] bg-white p-6 ring-1 ring-black/[0.08] md:p-8">
          <div className="h-5 w-40 rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-4 h-12 w-2/3 rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-3 h-4 w-full rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-6 h-32 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }



  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#fff8f3] flex items-center justify-center p-2" style={{ fontFamily: 'var(--font-dm-sans)' }}>
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,138,80,0.1), rgba(255,138,80,0) 62%)' }}
          animate={{ x: [0, 10, 0], y: [0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
        />
        <motion.div
          className="absolute -right-24 bottom-0 h-[460px] w-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle at 60% 40%, rgba(255,138,80,0.1), rgba(255,138,80,0) 62%)' }}
          animate={{ x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      <div className="relative w-full max-w-[850px]">
        <motion.section
          className="rounded-[2rem] bg-black/[0.03] p-1 ring-1 ring-black/[0.06]"
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="rounded-[calc(2rem-0.25rem)] bg-white p-5 md:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff5e14]/20 bg-[#ff5e14]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5e14]">
              <span className="h-2 w-2 rounded-full bg-[#ff5e14]" />
              Quyên góp thành công
            </span>

            <h1 className="mt-2 text-4xl font-black leading-none tracking-tight text-[#18110d] md:text-5xl">
              Cảm ơn bạn.
            </h1>
            <p className="mt-2 max-w-[64ch] text-[14px] leading-snug text-[#2f241f] line-clamp-2 md:line-clamp-none">
              {thankMessage}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-orange-200/50 bg-[#fff8f3] p-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a34a1d]">Số tiền đã nhận</p>
                <div className="mt-1 flex items-baseline gap-1">
                    <p className="text-[36px] font-black leading-none tracking-tight text-[#18110d]">
                    {animatedAmount.toLocaleString('vi-VN')}
                    </p>
                    <span className="text-base font-bold text-[#a34a1d]">đ</span>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#3a2a23]">Xác nhận: {paidAt}</p>
              </div>

              <div className="rounded-2xl border border-orange-200/50 bg-white p-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a34a1d]">Chiến dịch</p>
                <p className="mt-1 text-base font-bold text-[#18110d] line-clamp-1">{campaignTitle}</p>
                
                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-0.5">
                    <p className="text-[10px] font-medium text-gray-500">Đã huy động được:</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-[#ff5e14]">
                            {balance.toLocaleString('vi-VN')}
                        </p>
                        <span className="text-xs font-bold text-[#ff5e14] opacity-80">đ</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={`/campaigns-details?id=${encodeURIComponent(campaignId)}`}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#ff5e14] px-6 py-2.5 text-sm font-bold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#ea550c] active:scale-[0.98] sm:w-auto"
              >
                Quay về chiến dịch
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default function ThankYouNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#fff8f3] px-4 py-8">
          <div className="mx-auto w-full max-w-[900px] rounded-[2rem] bg-white p-6 ring-1 ring-black/[0.08] md:p-8">
            <div className="h-5 w-40 rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-4 h-12 w-2/3 rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-3 h-4 w-full rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-6 h-32 rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
