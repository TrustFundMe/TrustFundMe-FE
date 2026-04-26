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

export default function NewCampaignTestPage() {
  const [state, setState] = useState<NewCampaignTestState>(seedState);
  const [activeStep, setActiveStep] = useState(0);
  /** Bước xa nhất user đã từng đạt tới (đã validate). Cho phép nhảy tự do trong [0, maxReached]. */
  const [maxReached, setMaxReached] = useState(0);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<string>('');
  const [mockDraftId, setMockDraftId] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [step6FullPreview, setStep6FullPreview] = useState(false);
  const [step2ShowErrors, setStep2ShowErrors] = useState(false);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const budgetTotal = useMemo(
    () => state.budgetLines.reduce((sum, item) => sum + (item.plannedAmount || 0), 0),
    [state.budgetLines],
  );

  const milestoneTotal = useMemo(() => {
    if (state.milestones.length === 0) return 0;
    const target = state.campaignCore.targetAmount;
    const withoutLast = state.milestones.slice(0, state.milestones.length - 1);
    const sumWithoutLast = withoutLast.reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
    return sumWithoutLast + Math.max(target - sumWithoutLast, 0);
  }, [state.milestones, state.campaignCore.targetAmount]);

  const step2Errors = useMemo(() => {
    const e: Record<string, string> = {};
    const core = state.campaignCore;
    const title = core.title.trim();
    if (!title) e.title = 'Tiêu đề không được để trống.';
    else if (title.length < 10) e.title = 'Tiêu đề phải từ 10 ký tự trở lên.';
    else if (title.length > 255) e.title = 'Tiêu đề tối đa 255 ký tự.';

    const desc = core.objective.trim();
    if (!desc) e.objective = 'Mô tả không được để trống.';
    else if (desc.length < 50) e.objective = 'Mô tả phải từ 50 ký tự trở lên.';
    else if (desc.length > 10000) e.objective = 'Mô tả tối đa 10,000 ký tự.';

    const thank = core.thankMessage.trim();
    if (!thank) e.thankMessage = 'Lời cảm ơn không được để trống.';
    else if (thank.length < 10) e.thankMessage = 'Lời cảm ơn phải từ 10 ký tự trở lên.';

    if (core.targetAmount < 10000) e.targetAmount = 'Số tiền mục tiêu tối thiểu là 10,000đ.';

    if (!core.category.trim()) e.category = 'Vui lòng nhập danh mục chiến dịch.';
    if (!core.region.trim()) e.region = 'Vui lòng nhập vị trí hỗ trợ.';
    if (!core.beneficiaryType.trim()) e.beneficiaryType = 'Vui lòng nhập đối tượng thụ hưởng.';

    const imgs = core.campaignImages ?? [];
    const coverOk =
      imgs.length > 0 &&
      Boolean(core.coverImageId) &&
      imgs.some((i) => i.id === core.coverImageId) &&
      Boolean(core.coverImageUrl?.trim());
    if (!coverOk) e.coverImage = 'Vui lòng thêm ít nhất một ảnh và chọn ảnh bìa.';

    if (!core.startDate) e.startDate = 'Thiếu ngày bắt đầu';
    if (!core.endDate) e.endDate = 'Thiếu ngày kết thúc';
    if (core.startDate && core.endDate && core.endDate <= core.startDate)
      e.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    return e;
  }, [state.campaignCore]);

  const step0CanNext = useMemo(() => {
    const b = state.bankInfo;
    return (
      state.kycStatus === 'APPROVED' &&
      b.accountNumber.trim() !== '' &&
      b.bankCode.trim() !== '' &&
      b.bankName.trim() !== '' &&
      b.accountHolderName.trim() !== '' &&
      state.bankProofFiles.length > 0 &&
      state.acknowledgements.legalRead &&
      state.acknowledgements.slaAccepted
    );
  }, [state]);

  const step2CanNext = useMemo(() => Object.keys(step2Errors).length === 0, [step2Errors]);

  const step3CanNext = useMemo(() => {
    const target = state.campaignCore.targetAmount;
    if (state.milestones.length < 1) return false;
    return milestoneTotal === target;
  }, [state.milestones.length, state.campaignCore.targetAmount, milestoneTotal]);

  const step4CanNext = useMemo(() => state.acknowledgements.termsAccepted, [state.acknowledgements.termsAccepted]);

  const finalValidations = useMemo(() => {
    const target = state.campaignCore.targetAmount;
    const bank = state.bankInfo;
    return {
      coreOk: Object.keys(step2Errors).length === 0,
      milestoneOk: milestoneTotal === target,
      bankOk: Boolean(bank.accountHolderName && bank.accountNumber && bank.bankName && bank.bankCode),
      acknowledgementsOk:
        state.acknowledgements.termsAccepted &&
        state.acknowledgements.transparencyAccepted &&
        state.acknowledgements.legalLiabilityAccepted &&
        state.acknowledgements.overfundPolicyAccepted,
      gatesOk:
        state.kycStatus === 'APPROVED' &&
        state.bankProofFiles.length > 0 &&
        Boolean(state.bankInfo.bankCode) &&
        state.bankInfo.accountHolderName.trim() !== '' &&
        state.acknowledgements.legalRead &&
        state.acknowledgements.slaAccepted,
    };
  }, [state, step2Errors, milestoneTotal]);

  const canSubmit = Object.values(finalValidations).every(Boolean);

  const patchState = (patch: Partial<NewCampaignTestState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleMockSubmit = () => {
    if (!canSubmit) return;
    const id = `DRAFT-${Math.floor(Math.random() * 900000 + 100000)}`;
    setMockDraftId(id);
    setSubmittedSnapshot(
      JSON.stringify(
        { campaignDraftId: id, submittedAt: new Date().toISOString(), mode: state.fundMode, checks: finalValidations },
        null,
        2,
      ),
    );
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
          (current === 0 && step0CanNext) ||
          (current === 1 && step2CanNext) ||
          (current === 2 && step3CanNext) ||
          (current === 3 && step4CanNext);
        if (!ok) return current;
        setMaxReached((m) => Math.max(m, target));
        return target;
      });
    },
    [maxReached, step0CanNext, step2CanNext, step3CanNext, step4CanNext],
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
            className="group inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
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
          <div className="mx-auto max-w-[1200px] px-4 py-1.5 md:px-8 md:py-2">
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
      <main ref={mainScrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[960px] px-4 py-6 md:px-8 md:py-8">
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
              <Step1Eligibility state={state} onPatch={patchState} canNext={step0CanNext} onNext={() => goToStep(1)} />
            )}
            {activeStep === 1 && (
              <Step2CampaignForm
                state={state}
                errors={step2Errors}
                showErrors={step2ShowErrors}
                onPatchCore={(patch) => patchState({ campaignCore: { ...state.campaignCore, ...patch } })}
                onTogglePreview={() => setPreviewVisible((v) => !v)}
                previewOpen={previewVisible}
                onPrev={() => goToStep(0)}
                onNext={() => {
                  if (step2CanNext) {
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
                onNext={() => goToStep(3)}
                canNext={step3CanNext}
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
                onSubmit={handleMockSubmit}
                canSubmit={canSubmit}
              />
            )}

            {submittedSnapshot && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
              >
                <p className="font-semibold text-emerald-800">
                  Gửi duyệt thành công (mock): {mockDraftId}
                </p>
                <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-gray-950 p-4 text-[11px] text-emerald-300">
                  {submittedSnapshot}
                </pre>
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
        #new-campaign-test-root h1,
        #new-campaign-test-root h2,
        #new-campaign-test-root h3,
        #new-campaign-test-root h4,
        #new-campaign-test-root p,
        #new-campaign-test-root span,
        #new-campaign-test-root label,
        #new-campaign-test-root li,
        #new-campaign-test-root button,
        #new-campaign-test-root input,
        #new-campaign-test-root textarea {
          font-size: 0.92em !important;
        }
      `}</style>
    </div>
  );
}
