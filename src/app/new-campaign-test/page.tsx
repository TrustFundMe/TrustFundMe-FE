'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CampaignPreviewPanel from '@/components/campaign/new-campaign-test/CampaignPreviewPanel';
import NewCampaignTestStepper from '@/components/campaign/new-campaign-test/NewCampaignTestStepper';
import { seedState } from '@/components/campaign/new-campaign-test/mockData';
import Step1Eligibility from '@/components/campaign/new-campaign-test/steps/Step1Eligibility';
import Step2CampaignForm from '@/components/campaign/new-campaign-test/steps/Step2CampaignForm';
import Step3Milestones from '@/components/campaign/new-campaign-test/steps/Step3Milestones';
import Step5RiskTerms from '@/components/campaign/new-campaign-test/steps/Step5RiskTerms';
import Step6ReviewSubmit from '@/components/campaign/new-campaign-test/steps/Step6ReviewSubmit';
import { NewCampaignTestState } from '@/components/campaign/new-campaign-test/types';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { campaignService } from '@/services/campaignService';
import { fundraisingGoalService } from '@/services/fundraisingGoalService';
import { bankAccountService } from '@/services/bankAccountService';
import { mediaService } from '@/services/mediaService';
import { expenditureService } from '@/services/expenditureService';
import { useRouter } from 'next/navigation';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

const steps = [
  {
    id: 'eligibility',
    title: 'Xác thực thông tin',
    subtitle: 'KYC, tài khoản nhận tiền, năng lực tài chính, cam kết pháp lý',
  },
  {
    id: 'core',
    title: 'Thông tin chiến dịch',
    subtitle: 'Tiêu đề, mục tiêu, nhiều ảnh và chọn ảnh bìa, thời gian, vị trí',
  },
  { id: 'milestones', title: 'Giai đoạn', subtitle: 'Thiết lập các giai đoạn thực hiện & giải ngân' },
  { id: 'terms', title: 'Điều khoản', subtitle: 'Điều khoản bắt buộc' },
  { id: 'review', title: 'Gửi duyệt', subtitle: 'Xác nhận hồ sơ' },
];

const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// TEMP: bypass validate để đi nhanh tới bước 3 (Giai đoạn).
// Tắt cờ này khi QA xong.
const TEMP_BYPASS_TO_STEP3 = false;

export default function NewCampaignTestPage() {
  const [state, setState] = useState<NewCampaignTestState>(seedState);
  const [activeStep, setActiveStep] = useState(0);
  /** Bước xa nhất user đã từng đạt tới (đã validate). Cho phép nhảy tự do trong [0, maxReached]. */
  const [maxReached, setMaxReached] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [step6FullPreview, setStep6FullPreview] = useState(false);
  const [step2ShowErrors, setStep2ShowErrors] = useState(false);
  const [step3ShowErrors, setStep3ShowErrors] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const budgetTotal = useMemo(
    () => state.budgetLines.reduce((sum, item) => sum + (item.plannedAmount || 0), 0),
    [state.budgetLines],
  );

  const milestoneTotal = useMemo(() => {
    return state.milestones.reduce((sum, mil) => {
      const milSum = (mil.categories || []).reduce((catSum, cat) => {
        return catSum + (cat.items || []).reduce((itemSum, item) => {
          return itemSum + (item.expectedPrice || 0) * (item.expectedQuantity || 0);
        }, 0);
      }, 0);
      return sum + milSum;
    }, 0);
  }, [state.milestones]);

  useEffect(() => {
    if (!state.milestones.length) return;
    const first = state.milestones[0];
    const last = state.milestones[state.milestones.length - 1];
    const autoStart = first.startDate || '';
    const autoEnd = last.evidenceDueAt || '';
    const patch: Partial<typeof state.campaignCore> = {};
    if (autoStart !== state.campaignCore.startDate) patch.startDate = autoStart;
    if (autoEnd !== state.campaignCore.endDate) patch.endDate = autoEnd;
    if (milestoneTotal !== state.campaignCore.targetAmount) patch.targetAmount = milestoneTotal;
    if (Object.keys(patch).length > 0) {
      patchState({ campaignCore: { ...state.campaignCore, ...patch } });
    }
  }, [state.milestones, milestoneTotal]);

  const step2Errors = useMemo(() => {
    const e: Record<string, string> = {};
    const core = state.campaignCore;
    const title = core.title.trim();
    if (!title) e.title = 'Vui lòng nhập tiêu đề chiến dịch.';
    else if (title.length < 10) e.title = 'Tiêu đề phải từ 10 ký tự trở lên.';
    else if (title.length > 255) e.title = 'Tiêu đề tối đa 255 ký tự.';

    const desc = core.objective.trim();
    if (!desc) e.objective = 'Vui lòng nhập mô tả / câu chuyện chiến dịch.';
    else if (desc.length < 50) e.objective = 'Mô tả phải từ 50 ký tự trở lên.';
    else if (desc.length > 10000) e.objective = 'Mô tả tối đa 10,000 ký tự.';

    const thank = core.thankMessage.trim();
    if (!thank) e.thankMessage = 'Vui lòng nhập lời cảm ơn nhà tài trợ.';
    else if (thank.length < 10) e.thankMessage = 'Lời cảm ơn phải từ 10 ký tự trở lên.';

    if (!core.categoryId) e.category = 'Vui lòng chọn danh mục chiến dịch.';

    const imgs = core.campaignImages ?? [];
    const coverOk =
      imgs.length > 0 &&
      Boolean(core.coverImageId) &&
      imgs.some((i) => i.id === core.coverImageId) &&
      Boolean(core.coverImageUrl?.trim());
    if (!coverOk) e.coverImage = 'Vui lòng thêm ít nhất một ảnh và chọn ảnh bìa.';

    return e;
  }, [state.campaignCore]);

  const step0CanNext = useMemo(() => {
    const b = state.bankInfo;
    const accountNumber = b.accountNumber.trim();
    const accountHolderName = b.accountHolderName.trim();
    const bankCode = b.bankCode.trim();
    const bankName = b.bankName.trim();
    const webhookKey = b.webhookKey.trim();
    const isBankValid =
      bankCode.length > 0 &&
      bankName.length > 0 &&
      accountHolderName.length >= 6 &&
      accountHolderName.length <= 255 &&
      accountNumber.length >= 6 &&
      accountNumber.length <= 50 &&
      webhookKey.length > 0;
    return (
      state.kycStatus === 'APPROVED' &&
      isBankValid &&
      !!user?.cvUrl
    );
  }, [state, user?.cvUrl]);
  const step0FailMessage = useMemo(() => {
    const b = state.bankInfo;
    const accountNumber = b.accountNumber.trim();
    const accountHolderName = b.accountHolderName.trim();
    const bankCode = b.bankCode.trim();
    const bankName = b.bankName.trim();
    const webhookKey = b.webhookKey.trim();
    if (state.kycStatus !== 'APPROVED') {
      return 'Hoàn tất xác thực danh tính trên Profile.';
    }
    if (!accountHolderName) return 'Thiếu tên chủ tài khoản nhận tiền';
    if (accountHolderName.length < 6 || accountHolderName.length > 255) {
      return 'Tên chủ tài khoản phải từ 6-255 ký tự';
    }
    if (!accountNumber) return 'Thiếu số tài khoản nhận tiền';
    if (accountNumber.length < 6 || accountNumber.length > 50) {
      return 'Số tài khoản phải từ 6-50 ký tự';
    }
    if (!bankCode || !bankName) return 'Cần chọn ngân hàng nhận tiền';
    if (!webhookKey) return 'Cần nhập mã kết nối Casso';
    if (!user?.cvUrl) return 'Cần CV trên Profile để tiếp tục.';
    return 'Vui lòng hoàn tất các mục bên trên';
  }, [state, user?.cvUrl]);

  const step2CanNext = useMemo(() => Object.keys(step2Errors).length === 0, [step2Errors]);
  const effectiveStep0CanNext = TEMP_BYPASS_TO_STEP3 ? true : step0CanNext;
  const effectiveStep2CanNext = TEMP_BYPASS_TO_STEP3 ? true : step2CanNext;

  const step3CanNext = useMemo(() => {
    if (state.milestones.length < 1) return false;
    if (milestoneTotal <= 0) return false;
    for (let i = 0; i < state.milestones.length; i += 1) {
      const m = state.milestones[i];
      if (!m.title.trim()) return false;
      if (!m.startDate) return false;
      if (!m.endDate) return false;
      if (m.endDate <= m.startDate) return false;
      if (!m.evidenceDueAt) return false;
      if (m.endDate > m.evidenceDueAt) return false;
      if (!m.categories || m.categories.length === 0) return false;
      for (const cat of m.categories) {
        if (!cat.name.trim()) return false;
        if (!cat.items || cat.items.length === 0) return false;
        for (const item of cat.items) {
          if (!item.name.trim()) return false;
          if (!item.expectedQuantity || item.expectedQuantity <= 0) return false;
          if (!item.expectedPrice || item.expectedPrice <= 0) return false;
        }
      }
    }
    return true;
  }, [state.milestones, milestoneTotal]);
  const step3FailMessage = useMemo(() => {
    if (state.milestones.length < 1) return 'Cần ít nhất 1 đợt giải ngân';
    if (milestoneTotal <= 0) return 'Tổng giải ngân phải lớn hơn 0';
    for (let i = 0; i < state.milestones.length; i += 1) {
      const m = state.milestones[i];
      if (!m.title.trim()) return `Đợt ${i + 1}: thiếu tên đợt`;
      if (!m.startDate) return `Đợt ${i + 1}: thiếu ngày bắt đầu`;
      if (!m.endDate) return `Đợt ${i + 1}: thiếu ngày kết thúc`;
      if (m.endDate <= m.startDate) return `Đợt ${i + 1}: ngày kết thúc phải sau ngày bắt đầu`;
      if (!m.evidenceDueAt) return `Đợt ${i + 1}: thiếu ngày nộp minh chứng`;
      if (m.endDate > m.evidenceDueAt) return `Đợt ${i + 1}: ngày kết thúc phải trước hoặc bằng ngày nộp minh chứng`;
      if (!m.categories || m.categories.length === 0) return `Đợt ${i + 1}: cần ít nhất 1 danh mục`;
      for (let j = 0; j < m.categories.length; j += 1) {
        const cat = m.categories[j];
        if (!cat.name.trim()) return `Đợt ${i + 1}, danh mục ${j + 1}: thiếu tên danh mục`;
        if (!cat.items || cat.items.length === 0) return `Đợt ${i + 1}, danh mục ${j + 1}: cần ít nhất 1 hạng mục`;
        for (let k = 0; k < cat.items.length; k += 1) {
          const item = cat.items[k];
          if (!item.name.trim()) return `Đợt ${i + 1}, danh mục ${j + 1}, hạng mục ${k + 1}: thiếu tên`;
          if (!item.expectedQuantity || item.expectedQuantity <= 0) return `Đợt ${i + 1}, hạng mục ${k + 1}: số lượng phải > 0`;
          if (!item.expectedPrice || item.expectedPrice <= 0) return `Đợt ${i + 1}, hạng mục ${k + 1}: đơn giá phải > 0`;
        }
      }
    }
    return 'Vui lòng hoàn tất các mục bên trên';
  }, [state.milestones, milestoneTotal]);

  const step4CanNext = useMemo(() => state.acknowledgements.termsAccepted, [state.acknowledgements.termsAccepted]);

  const finalValidations = useMemo(() => {
    const bank = state.bankInfo;
    return {
      coreOk: Object.keys(step2Errors).length === 0,
      milestoneOk: milestoneTotal > 0,
      bankOk: Boolean(bank.accountHolderName && bank.accountNumber && bank.bankName && bank.bankCode),
      acknowledgementsOk:
        state.acknowledgements.termsAccepted &&
        state.acknowledgements.transparencyAccepted &&
        state.acknowledgements.legalLiabilityAccepted &&
        state.acknowledgements.overfundPolicyAccepted,
      gatesOk:
        state.kycStatus === 'APPROVED' &&
        !!user?.cvUrl &&
        Boolean(state.bankInfo.bankCode) &&
        state.bankInfo.accountHolderName.trim() !== '' &&
        state.bankInfo.webhookKey.trim() !== '',
    };
  }, [state, step2Errors, milestoneTotal]);

  const canSubmit = Object.values(finalValidations).every(Boolean);

  const patchState = (patch: Partial<NewCampaignTestState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleRealSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    if (!isAuthenticated || !user) {
      toast('Vui lòng đăng nhập để tạo chiến dịch.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult({ type: 'idle', message: '' });

    try {
      // 1. Media Uploads
      // Campaign images
      const uploadedImageIds: number[] = [];
      let coverMediaId: number | undefined = undefined;

      for (const img of state.campaignCore.campaignImages) {
        if (img.file) {
          const res = await mediaService.uploadMedia(img.file, undefined, undefined, undefined, undefined, 'PHOTO');
          uploadedImageIds.push(res.id);
          if (img.id === state.campaignCore.coverImageId) {
            coverMediaId = res.id;
          }
        }
      }

      // 2. Create Campaign
      const campaignRes = await campaignService.create({
        fundOwnerId: user.id as number,
        title: state.campaignCore.title,
        description: state.campaignCore.objective,
        categoryId: state.campaignCore.categoryId as number,
        thankMessage: state.campaignCore.thankMessage,
        coverImage: coverMediaId,
        attachments: uploadedImageIds.map(id => ({ id, type: 'PHOTO', url: '' })),
        type: 'AUTHORIZED',
        status: 'PENDING_APPROVAL',
      });

      // 3. Link Media to Campaign
      for (const id of uploadedImageIds) {
        await mediaService.updateMedia(id, { campaignId: campaignRes.id });
      }

      // 4. Create bank account with campaign linkage + optional Casso key
      if (state.bankInfo.bankCode && state.bankInfo.accountNumber) {
        await bankAccountService.create({
          bankCode: state.bankInfo.bankCode,
          accountNumber: state.bankInfo.accountNumber,
          accountHolderName: state.bankInfo.accountHolderName,
          webhookKey: state.bankInfo.webhookKey.trim() || undefined,
          campaignId: campaignRes.id,
        });
      }

      // 5. Create Goal
      await fundraisingGoalService.create({
        campaignId: campaignRes.id,
        targetAmount: state.campaignCore.targetAmount,
        description: 'Mục tiêu chiến dịch',
      });

      // 6. Create Expenditures (Milestones)
      for (const mil of state.milestones) {
        // Map to backend's CreateExpenditureCatologyRequest (categories with nested items)
        const categories = mil.categories.map(cat => ({
          name: cat.name || 'Chưa đặt tên',
          description: cat.description || '',
          items: cat.items.map(item => ({
            name: item.name || cat.name || 'Hạng mục chi tiêu',
            expectedQuantity: item.expectedQuantity || 1,
            actualPrice: 0,
            expectedPrice: item.expectedPrice || 0,
            expectedBrand: item.expectedBrand || '',
            expectedPurchaseLocation: item.expectedPurchaseLocation || '',
            expectedUnit: item.expectedUnit || '',
            expectedNote: item.expectedNote || '',
          })),
        }));

        const milStartDate = mil.startDate || state.campaignCore.startDate || new Date().toISOString().split('T')[0];
        const milEndDate = mil.endDate || state.campaignCore.endDate || new Date().toISOString().split('T')[0];

        const expenditurePayload: any = {
          campaignId: campaignRes.id,
          plan: mil.title || 'Giai đoạn',
          startDate: `${milStartDate}T00:00:00`,
          endDate: `${milEndDate}T23:59:59`,
          evidenceDueAt: mil.evidenceDueAt ? `${mil.evidenceDueAt}T23:59:59` : undefined,
          categories,
        };

        console.log('Expenditure payload:', JSON.stringify(expenditurePayload, null, 2));

        try {
          await expenditureService.create(expenditurePayload);
        } catch (expErr: any) {
          const errMsg = expErr?.response?.data?.message || expErr?.response?.data?.error || 'Lỗi không xác định';
          console.error('Expenditure create error:', expErr?.response?.status, expErr?.response?.data);
          toast(`Lỗi tạo khoản chi cho đợt "${mil.title}": ${errMsg}`, 'error');
          // We might want to stop here if it's a structural error
        }
      }

      setSubmitResult({
        type: 'success',
        message: 'Chiến dịch của bạn đã được gửi duyệt thành công!',
      });
      toast('Tạo chiến dịch thành công!', 'success');

      setTimeout(() => {
        router.push('/account/campaigns');
      }, 2000);

    } catch (error: any) {
      console.error('Submit error:', error);
      const msg = error?.response?.data?.message || error.message || 'Lỗi không xác định.';
      setSubmitResult({ type: 'error', message: msg });
      toast(`Lỗi: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPreviewModal =
    (activeStep === 1 && previewVisible) || (activeStep === 4 && step6FullPreview);

  /**
   * Điều hướng wizard:
   * - Trong [0, maxReached]: nhảy tự do (đã validate trước đây).
   * - Vượt maxReached: chỉ tiến 1 step và phải pass validation hiện tại.
   * - Khi tiến thành công, mở rộng maxReached.
   */
  const goToStep = useCallback(
    (target: number) => {
      const last = steps.length - 1;
      if (target < 0 || target > last) return;
      setActiveStep((current) => {
        if (target === current) return current;
        // Trong vùng đã đạt: nhảy tự do
        if (target <= maxReached) return target;
        // Ngoài vùng: chỉ cho tiến 1 step và phải pass validate
        if (target !== current + 1) return current;
        const ok =
          (current === 0 && effectiveStep0CanNext) ||
          (current === 1 && effectiveStep2CanNext) ||
          (current === 2 && step3CanNext) ||
          (current === 3 && step4CanNext);
        if (!ok) return current;
        setMaxReached((m) => Math.max(m, target));
        return target;
      });
    },
    [maxReached, effectiveStep0CanNext, effectiveStep2CanNext, step3CanNext, step4CanNext],
  );

  useEffect(() => {
    if (!mainScrollRef.current) return;
    mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  return (
    <div id="new-campaign-test-root" className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50">
      {/* Top bar */}
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2 md:px-8">
          <button
            type="button"
            onClick={() => {
              if (activeStep > 0) goToStep(activeStep - 1);
              else if (typeof window !== 'undefined') window.history.back();
            }}
            className="group inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
              <path
                d="M12 4l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Quay lại
          </button>
          <div className="h-4 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[13px] font-semibold leading-tight text-slate-900">
              Tạo chiến dịch gây quỹ từ thiện
            </h1>
          </div>
        </div>

        {/* Horizontal stepper — compact, always on screen */}
        <div className="border-t border-slate-100">
          <div className="mx-auto max-w-[1200px] px-4 py-1 md:px-8">
            <NewCampaignTestStepper
              steps={steps}
              activeIndex={activeStep}
              maxReached={maxReached}
              onJump={goToStep}
            />
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main
        ref={mainScrollRef}
        className={`min-h-0 flex-1 ${activeStep === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}
      >
        <div className="mx-auto max-w-[1240px] px-4 py-2 md:px-8 md:py-2.5">
          {/* Step content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {activeStep === 0 && (
                <Step1Eligibility
                  state={state}
                  onPatch={patchState}
                  canNext={effectiveStep0CanNext}
                  failMessage={step0FailMessage}
                  onNext={() => goToStep(1)}
                />
              )}
              {activeStep === 1 && (
                <Step2CampaignForm
                  state={state}
                  errors={step2Errors}
                  showErrors={step2ShowErrors}
                  canNext={effectiveStep2CanNext}
                  onPatchCore={(patch) => patchState({ campaignCore: { ...state.campaignCore, ...patch } })}
                  onTogglePreview={() => setPreviewVisible((v) => !v)}
                  previewOpen={previewVisible}
                  onPrev={() => goToStep(0)}
                  onNext={() => {
                    if (effectiveStep2CanNext) {
                      setStep2ShowErrors(false);
                      goToStep(2);
                    } else {
                      setStep2ShowErrors(true);
                    }
                  }}
                />
              )}
              {activeStep === 2 && (
                <Step3Milestones
                  state={state}
                  milestoneTotal={milestoneTotal}
                  onPatch={patchState}
                  onPrev={() => goToStep(1)}
                  onNext={() => {
                    if (step3CanNext) {
                      setStep3ShowErrors(false);
                      goToStep(3);
                    } else {
                      setStep3ShowErrors(true);
                    }
                  }}
                  canNext={step3CanNext}
                  showErrors={step3ShowErrors}
                  failMessage={step3FailMessage}
                />
              )}
              {activeStep === 3 && (
                <Step5RiskTerms
                  state={state}
                  onPatch={patchState}
                  onPrev={() => goToStep(2)}
                  onNext={() => goToStep(4)}
                  canNext={step4CanNext}
                />
              )}
              {activeStep === 4 && (
                <Step6ReviewSubmit
                  state={state}
                  checks={finalValidations}
                  onOpenFullPreview={() => setStep6FullPreview(true)}
                  onPrev={() => goToStep(3)}
                  onSubmit={handleRealSubmit}
                  canSubmit={canSubmit && !isSubmitting}
                />
              )}

              {submitResult.type !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 rounded-2xl border p-5 ${submitResult.type === 'success'
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                    : 'border-red-100 bg-red-50 text-red-800'
                    }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {submitResult.type === 'success' ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {submitResult.type === 'success' ? 'Thành công' : 'Lỗi'}
                  </div>
                  <p className="mt-1 text-sm">{submitResult.message}</p>
                  {submitResult.type === 'success' && (
                    <p className="mt-2 text-xs opacity-70 italic">Đang chuyển hướng về trang quản lý chiến dịch...</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {showPreviewModal && (
        <CampaignPreviewPanel
          state={state}
          budgetTotal={budgetTotal}
          milestoneTotal={milestoneTotal}
          fullScreen={activeStep === 4}
          onClose={() => {
            if (activeStep === 1) setPreviewVisible(false);
            if (activeStep === 4) setStep6FullPreview(false);
          }}
        />
      )}
      <style jsx global>{`
        #new-campaign-test-root .min-h-\[52px\] { min-h: 46px !important; }
        #new-campaign-test-root main {
          scrollbar-width: thin;
          scrollbar-color: #111827 #e5e7eb;
        }
        #new-campaign-test-root main::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        #new-campaign-test-root main::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 9999px;
        }
        #new-campaign-test-root main::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          border-radius: 9999px;
        }
        #new-campaign-test-root main::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #111827 0%, #000000 100%);
        }
      `}</style>
    </div>
  );
}
