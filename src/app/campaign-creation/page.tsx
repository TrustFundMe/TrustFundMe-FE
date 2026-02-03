'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';

import Step1Type from '@/components/campaign/creation/Step1Type';
import Step2Setup from '@/components/campaign/creation/Step2Setup';
import Step3FinancialPlan from '@/components/campaign/creation/Step3FinancialPlan';
import Step4Banking from '@/components/campaign/creation/Step4Banking';
import Step5Review from '@/components/campaign/creation/Step5Review';
import SubmitResultPanel from '@/components/campaign/creation/SubmitResultPanel';

import type { CreateCampaignRequest } from '@/types/campaign';

type StepId = 'type' | 'setup' | 'plan' | 'banking' | 'review';

type Step = {
  id: StepId;
  title: string;
  subtitle: string;
};

type SubmitResult =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

const steps: Step[] = [
  { id: 'type', title: 'Loại chiến dịch', subtitle: 'Chọn loại hình quỹ' },
  { id: 'setup', title: 'Thiết lập cơ bản', subtitle: 'Thông tin & Minh chứng' },
  { id: 'plan', title: 'Kế hoạch chi tiêu', subtitle: 'Ngân sách & AI Import' },
  { id: 'banking', title: 'Thông tin nhận quỹ', subtitle: 'Tài khoản ngân hàng' },
  { id: 'review', title: 'Kiểm tra & Cam kết', subtitle: 'Xem lại & Gửi duyệt' },
];

const initialCampaignState = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  coverImage: null as File | null,
  thankMessage: '',
  fundType: 'AUTHORIZED' as 'AUTHORIZED' | 'ITEMIZED',
  targetAmount: 0,
  verificationFile: null as File | null,
  expenditureItems: [] as any[],
  bankAccount: null as any,
  discount: 0,
  taxRate: 11,
};

function formatApiError(err: unknown): string {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  const data = ax?.response?.data;

  const fromServer =
    (typeof data === 'string' && data) ||
    (data && typeof data === 'object' && (data.message || data.error || data.details)) ||
    '';

  if (status === 401) return 'Unauthorized (401). Please sign in again.';
  if (status === 403) return 'Forbidden (403).';
  if (status === 400)
    return fromServer ? `Invalid request (400): ${fromServer}` : 'Invalid request (400). Please check your inputs.';
  if (status) return fromServer ? `Request failed (${status}): ${fromServer}` : `Request failed (${status}).`;

  return (ax as any)?.message || 'Network error. Please try again.';
}

// Helper for error display within steps
function ErrorText({ show, message }: { show: boolean; message?: string }) {
  if (!show || !message) return null;
  return <div className="mt-1 text-xs font-semibold text-red-600">{message}</div>;
}

function Stepper({
  activeIndex,
  onJump,
}: {
  activeIndex: number;
  onJump: (idx: number) => void;
}) {
  return (
    <aside className="h-full flex flex-col py-0">
      <div className="flex items-center gap-2 mb-12">
        <button
          type="button"
          onClick={() => onJump(-1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black hover:bg-black/5"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Campaign Creation</span>
      </div>

      <div className="relative flex-1 flex flex-col justify-center text-right min-h-[440px]">
        {/* Main Vertical line segment */}
        <div className="absolute right-[14px] top-6 bottom-6 w-px bg-black/[0.08]" />

        {/* Top Ornament (very short) */}
        <div className="absolute right-[14px] top-0 h-2 w-px bg-black/[0.08]" />

        {/* Bottom Ornament (very short) */}
        <div className="absolute right-[14px] bottom-0 h-2 w-px bg-black/[0.08]" />

        <div className="flex flex-col gap-9">
          {steps.map((s, idx) => {
            const isDone = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={s.id} className="relative flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => onJump(idx)}
                  className="group relative flex w-full items-start justify-end gap-5 py-0 outline-none"
                >
                  <div className="min-w-0 pr-2 transition-all duration-300">
                    <div
                      className={`text-sm font-black transition-colors ${isActive ? 'text-[#dc2626]' : isDone ? 'text-black/80' : 'text-black/20'
                        }`}
                    >
                      {s.title}
                    </div>
                    <div className={`mt-1 text-[10px] font-bold ${isActive ? 'text-black/40' : 'text-black/10'}`}>
                      {s.subtitle}
                    </div>
                  </div>

                  <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full transition-all duration-300">
                    {isDone ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#82C43C] bg-white text-[#82C43C] shadow-sm">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#dc2626] text-xs font-black text-white shadow-xl shadow-red-100 ring-4 ring-red-50">
                        {idx + 1}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-black/[0.03] bg-white text-xs font-black text-black/20">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                </button>

                {/* Dot on the line between steps */}
                {idx < steps.length - 1 && (
                  <div className="absolute right-[13px] top-[calc(100%+1.5rem)] h-1 w-1 rounded-full bg-black/10 z-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default function CampaignCreationPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchedSteps, setTouchedSteps] = useState<Record<StepId, boolean>>({
    type: false,
    setup: false,
    plan: false,
    banking: false,
    review: false,
  });

  const [campaign, setCampaign] = useState(initialCampaignState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult>({ type: 'idle' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, authLoading, router]);

  const currentStep = steps[activeIndex];

  const setStepTouched = (id: StepId) => {
    setTouchedSteps((prev) => ({ ...prev, [id]: true }));
  };

  const campaignBasicErrors = useMemo(() => {
    const e: Record<string, string> = {};
    const title = campaign.title.trim();
    if (!title) e.title = 'Title is required.';
    else if (title.length > 255) e.title = 'Title must be at most 255 characters.';

    const desc = campaign.description.trim();
    if (!desc) e.description = 'Description is required.';
    else if (desc.length > 5000) e.description = 'Description must be at most 5000 characters.';

    const thank = campaign.thankMessage.trim();
    if (thank.length > 2000) e.thankMessage = 'Thank you message must be at most 2000 characters.';

    return e;
  }, [campaign]);

  const campaignScheduleErrors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!campaign.startDate) e.startDate = 'Start date is required.';
    if (!campaign.endDate) e.endDate = 'End date is required.';
    // if (!campaign.coverImage) e.coverImage = 'Cover image is required.';

    if (campaign.startDate && campaign.endDate) {
      const s = new Date(campaign.startDate);
      const ed = new Date(campaign.endDate);
      if (ed.getTime() < s.getTime()) e.endDate = 'End date should be after start date.';
    }

    return e;
  }, [campaign]);

  const canGoNext = useMemo(() => {
    switch (currentStep.id) {
      case 'type':
        return true;
      case 'setup':
        // Tạm thời cho phép next luôn để test
        return true;
      case 'plan':
      case 'banking':
      case 'review':
        return true;
      default:
        return true;
    }
  }, [campaignBasicErrors, campaignScheduleErrors, currentStep.id]);

  const onPrev = () => {
    setResult({ type: 'idle' });
    setActiveIndex((i) => Math.max(0, i - 1));
  };

  const onNext = () => {
    setStepTouched(currentStep.id);
    if (!canGoNext) return;
    setResult({ type: 'idle' });
    setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  const onJump = (idx: number) => {
    if (idx === -1) {
      router.back();
      return;
    }

    // only allow jumping backwards; forward requires next validation
    if (idx > activeIndex) return;
    setResult({ type: 'idle' });
    setActiveIndex(idx);
  };

  const setCampaignField = <K extends keyof typeof initialCampaignState>(
    key: K,
    value: (typeof initialCampaignState)[K]
  ) => {
    setCampaign((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setStepTouched('review');

    if (!user) {
      setResult({ type: 'error', message: 'You must be logged in.' });
      return;
    }

    // validate all steps
    const hasErrors =
      Object.keys(campaignBasicErrors).length > 0 ||
      Object.keys(campaignScheduleErrors).length > 0;

    if (hasErrors) {
      setResult({ type: 'error', message: 'Please complete all steps correctly before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setResult({ type: 'idle' });

    try {
      const campaignPayload: CreateCampaignRequest = {
        fundOwnerId: user.id,
        title: campaign.title.trim(),
        description: campaign.description.trim(),
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString() : undefined,
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString() : undefined,
        thankMessage: campaign.thankMessage.trim() || undefined,
        coverImage: 'local-file://cover-image',
        status: 'DRAFT',
      };

      await campaignService.create(campaignPayload);

      setResult({
        type: 'success',
        message: 'Campaign created successfully! Staff will review your request.',
      });
    } catch (err) {
      setResult({ type: 'error', message: formatApiError(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case 'type':
        return (
          <Step1Type
            data={campaign}
            onChange={setCampaignField}
          />
        );
      case 'setup':
        return (
          <Step2Setup
            data={campaign}
            onChange={setCampaignField}
            errors={{ ...campaignBasicErrors, ...campaignScheduleErrors }}
            showErrors={touchedSteps.setup}
          />
        );
      case 'plan':
        return <Step3FinancialPlan data={campaign} onChange={setCampaignField} />;
      case 'banking':
        return <Step4Banking data={campaign} onChange={setCampaignField} />;
      case 'review':
        return (
          <Step5Review
            data={campaign}
            onSubmit={submit}
            isSubmitting={isSubmitting}
            result={result}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Stepper activeIndex={activeIndex} onJump={onJump} />
        </div>

        <div className="lg:col-span-9">
          <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col justify-center">{renderStep()}</div>

            {currentStep.id !== 'review' && (
              <div className="mt-12 flex justify-end">
                <div className="flex items-center gap-4 py-2 px-1">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={activeIndex === 0}
                    className="text-sm font-black text-black/20 hover:text-black transition-colors disabled:opacity-0 disabled:cursor-default"
                  >
                    Prev
                  </button>
                  <div className="h-4 w-px bg-black/10" />
                  <button
                    type="button"
                    onClick={onNext}
                    className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
