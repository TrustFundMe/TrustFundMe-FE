'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { campaignService } from '@/services/campaignService';
import { fundraisingGoalService } from '@/services/fundraisingGoalService';
import { bankAccountService } from '@/services/bankAccountService';
import { mediaService } from '@/services/mediaService';

import Step1Type from '../../components/campaign/creation/Step1Type';
import Step2Setup from '../../components/campaign/creation/Step2Setup';
import Step3FinancialPlan from '../../components/campaign/creation/Step3FinancialPlan';
import Step4Banking from '../../components/campaign/creation/Step4Banking';
import Step5Review from '../../components/campaign/creation/Step5Review';


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
  id: undefined as number | undefined,
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  coverImage: '',
  attachments: [] as { id?: number; type: string; url: string; name?: string; isLocal?: boolean; file?: File }[],
  thankMessage: '',
  fundType: 'AUTHORIZED' as 'AUTHORIZED' | 'ITEMIZED',
  targetAmount: 0,
  verificationFile: null as File | null,
  expenditureItems: [] as any[],
  bankAccount: {
    id: undefined as number | undefined,
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
  },
  discount: 0,
  taxRate: 11,
};

function formatApiError(err: unknown): string {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  const data = ax?.response?.data;

  console.log('[API ERROR DEBUG]', { status, data });

  // Handle structured validation errors (Spring Boot @Valid)
  if (status === 400 && data && typeof data === 'object') {
    if (data.errors && typeof data.errors === 'object') {
      return Object.values(data.errors).join('. ');
    }
    if (data.message) return data.message;
  }

  const fromServer =
    (data && typeof data === 'object' && (data.message || data.error || data.details)) ||
    (typeof data === 'string' && data) ||
    '';

  if (status === 401) {
    return 'Phiên đăng nhập hết hạn hoặc không hợp lệ (401). Vui lòng đăng nhập lại.';
  }
  if (status === 403) return 'Bạn không có quyền thực hiện hành động này (403).';
  if (status === 400)
    return fromServer ? `Yêu cầu không hợp lệ: ${fromServer}` : 'Yêu cầu không hợp lệ (400).';
  if (status) return fromServer ? `${fromServer} (${status})` : `Lỗi hệ thống (${status}).`;

  return (ax as any)?.message || 'Lỗi mạng, vui lòng thử lại.';
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
  const { toast } = useToast();

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchedSteps, setTouchedSteps] = useState<Record<StepId, boolean>>({
    type: false,
    setup: false,
    plan: false,
    banking: false,
    review: false,
  });

  const [campaign, setCampaign] = useState(initialCampaignState);
  const [isSaving, setIsSaving] = useState(false);
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
    if (!title) e.title = 'Tiêu đề không được để trống.';
    else if (title.length < 10) e.title = 'Tiêu đề phải từ 10 ký tự trở lên.';
    else if (title.length > 255) e.title = 'Tiêu đề tối đa 255 ký tự.';

    const desc = campaign.description.trim();
    if (!desc) e.description = 'Mô tả không được để trống.';
    else if (desc.length < 50) e.description = 'Mô tả phải từ 50 ký tự trở lên.';
    else if (desc.length > 10000) e.description = 'Mô tả tối đa 10,000 ký tự.';

    if (campaign.targetAmount < 10000) e.targetAmount = 'Số tiền mục tiêu tối thiểu là 10,000đ.';

    return e;
  }, [campaign.title, campaign.description, campaign.targetAmount]);

  const campaignBankingErrors = useMemo(() => {
    const e: Record<string, string> = {};
    const bank = campaign.bankAccount;

    if (!bank.bankCode.trim()) e.bankCode = 'Vui lòng chọn ngân hàng.';
    else if (bank.bankCode.length < 2 || bank.bankCode.length > 50) e.bankCode = 'Mã ngân hàng phải từ 2-50 ký tự.';

    if (!bank.accountNumber.trim()) e.accountNumber = 'Số tài khoản không được để trống.';
    else if (!/^\d+$/.test(bank.accountNumber)) e.accountNumber = 'Số tài khoản chỉ được chứa chữ số.';
    else if (bank.accountNumber.length < 6 || bank.accountNumber.length > 50) e.accountNumber = 'Số tài khoản phải từ 6-50 ký tự.';

    if (!bank.accountHolderName.trim()) e.accountHolderName = 'Tên chủ tài khoản không được để trống.';
    else if (bank.accountHolderName.length < 6 || bank.accountHolderName.length > 255) e.accountHolderName = 'Tên phải từ 6-255 ký tự.';

    return e;
  }, [campaign.bankAccount]);

  const campaignScheduleErrors = useMemo(() => {
    const e: Record<string, string> = {};
    // Date requirements removed as requested

    return e;
  }, [campaign]);

  const canGoNext = useMemo(() => {
    switch (currentStep.id) {
      case 'type':
        return true;
      case 'setup':
        return Object.keys(campaignBasicErrors).length === 0;
      case 'plan':
        return true;
      case 'banking':
        return Object.keys(campaignBankingErrors).length === 0;
      case 'review':
        return true;
      default:
        return true;
    }
  }, [campaignBasicErrors, campaignBankingErrors, campaignScheduleErrors, currentStep.id]);

  const onPrev = () => {
    setResult({ type: 'idle' });
    setActiveIndex((i) => Math.max(0, i - 1));
  };

  const onNext = async () => {
    setStepTouched(currentStep.id);
    if (!canGoNext) return;

    // Intermediate steps no longer call APIs as requested. 
    // All persistence is moved to the final submit in Step 5.

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

  const syncGoal = async (campaignId: number, amount: number) => {
    try {
      const goals = await fundraisingGoalService.getByCampaignId(campaignId);
      if (goals.length > 0) {
        await fundraisingGoalService.update(goals[0].id, {
          targetAmount: amount
        });
      } else if (amount > 0) {
        await fundraisingGoalService.create({
          campaignId,
          targetAmount: amount,
          description: 'Mục tiêu gây quỹ'
        });
      }
    } catch (err) {
      console.error('Goal sync failed:', err);
    }
  };

  const submit = async () => {
    setStepTouched('setup');
    setStepTouched('plan');
    setStepTouched('banking');
    setStepTouched('review');

    if (!user) {
      setResult({ type: 'error', message: 'You must be logged in.' });
      return;
    }

    const hasErrors =
      Object.keys(campaignBasicErrors).length > 0 ||
      Object.keys(campaignScheduleErrors).length > 0 ||
      Object.keys(campaignBankingErrors).length > 0;

    if (hasErrors) {
      setResult({ type: 'error', message: 'Vui lòng hoàn thành chính xác tất cả các bước trước khi gửi duyệt.' });
      return;
    }

    setIsSubmitting(true);
    setResult({ type: 'idle' });

    try {
      // 1. Persist Bank Account (only if creating new - not selecting existing)
      let bankId = campaign.bankAccount.id;

      // Only create new bank account if user filled in new info (no existing id)
      if (!bankId && campaign.bankAccount.bankCode && campaign.bankAccount.accountNumber) {
        const bankData = {
          bankCode: campaign.bankAccount.bankCode,
          accountNumber: campaign.bankAccount.accountNumber,
          accountHolderName: campaign.bankAccount.accountHolderName
        };
        const res = await bankAccountService.create(bankData);
        bankId = res.id;
        setCampaign(prev => ({ ...prev, bankAccount: { ...prev.bankAccount, id: bankId } }));
      }
      // If bankId already exists, user selected an existing account - no API call needed

      // 2. Persist Campaign
      const campaignPayload: any = {
        fundOwnerId: user.id,
        title: campaign.title.trim(),
        description: campaign.description.trim(),
        category: 'General', // Default or from state if added later
        thankMessage: campaign.thankMessage.trim() || undefined,
        coverImage: campaign.coverImage || undefined,
        type: campaign.fundType,
        status: 'PENDING_APPROVAL',
      };

      let campaignId = campaign.id;
      if (!campaignId) {
        const res = await campaignService.create(campaignPayload);
        campaignId = res.id;
        setCampaign(prev => ({ ...prev, id: campaignId }));
      } else {
        await campaignService.update(campaignId, campaignPayload);
      }

      // 3. Upload Media Attachments (media lưu riêng với campaignId, không cần update campaign)
      if (campaign.attachments && campaign.attachments.length > 0) {
        for (const attr of campaign.attachments) {
          if (attr.isLocal && attr.file) {
            try {
              await mediaService.uploadMedia(
                attr.file,
                campaignId,
                undefined,
                undefined,
                attr.type.toUpperCase() === 'IMAGE' ? 'PHOTO' : attr.type.toUpperCase() as any
              );
            } catch (e) {
              console.error(`Failed to upload local media ${attr.name}:`, e);
              throw new Error(`Tải lên tệp ${attr.name} thất bại. Vui lòng thử lại.`);
            }
          } else if (attr.id) {
            // Already uploaded - update campaignId if needed
            await mediaService.updateMedia(attr.id, { campaignId });
          }
        }
      }

      // 4. Create Fundraising Goal
      if (campaign.targetAmount > 0) {
        await fundraisingGoalService.create({
          campaignId,
          targetAmount: campaign.targetAmount,
          description: 'Mục tiêu gây quỹ'
        });
      }

      setResult({
        type: 'success',
        message: 'Chiến dịch đã được tạo và gửi duyệt thành công! Đang chuyển về trang chủ...',
      });

      // Redirect to homepage after successful creation
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error('Submission failed:', err);
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
        return (
          <Step4Banking
            data={campaign}
            onChange={setCampaignField}
            errors={campaignBankingErrors}
            showErrors={touchedSteps.banking}
          />
        );
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
                    disabled={isSaving}
                    className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Next'}
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
