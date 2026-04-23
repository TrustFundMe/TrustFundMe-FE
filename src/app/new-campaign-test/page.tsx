'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import CampaignPreviewPanel from '@/components/campaign/new-campaign-test/CampaignPreviewPanel';
import NewCampaignTestStepper from '@/components/campaign/new-campaign-test/NewCampaignTestStepper';
import { seedState } from '@/components/campaign/new-campaign-test/mockData';
import Step1Eligibility from '@/components/campaign/new-campaign-test/steps/Step1Eligibility';
import Step2CampaignForm from '@/components/campaign/new-campaign-test/steps/Step2CampaignForm';
import Step3BudgetMilestones from '@/components/campaign/new-campaign-test/steps/Step3BudgetMilestones';
import Step4Milestones from '@/components/campaign/new-campaign-test/steps/Step4Milestones';
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
  { id: 'budget', title: 'Dự toán', subtitle: 'Một quỹ tổng và các hạng mục' },
  { id: 'milestones', title: 'Mốc giải ngân', subtitle: 'Thiết lập nhiều chặng giải ngân' },
  { id: 'terms', title: 'Điều khoản', subtitle: 'Điều khoản bắt buộc' },
  { id: 'review', title: 'Gửi duyệt', subtitle: 'OTP ký điện tử' },
];

const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function NewCampaignTestPage() {
  const [state, setState] = useState<NewCampaignTestState>(seedState);
  const [activeStep, setActiveStep] = useState(0);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<string>('');
  const [mockDraftId, setMockDraftId] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [step6FullPreview, setStep6FullPreview] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [step2ShowErrors, setStep2ShowErrors] = useState(false);

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
      b.accountHolderName.trim() === state.kycFullName.trim() &&
      state.bankProofFiles.length > 0 &&
      state.acknowledgements.legalRead &&
      state.acknowledgements.slaAccepted
    );
  }, [state]);

  const step2CanNext = useMemo(() => Object.keys(step2Errors).length === 0, [step2Errors]);

  const step3CanNext = useMemo(() => {
    const target = state.campaignCore.targetAmount;
    return budgetTotal === target && target > 0;
  }, [state.campaignCore.targetAmount, budgetTotal]);

  const step4CanNext = useMemo(() => {
    const target = state.campaignCore.targetAmount;
    if (state.milestones.length < 1) return false;
    return milestoneTotal === target;
  }, [state.milestones.length, state.campaignCore.targetAmount, milestoneTotal]);

  const step5CanNext = useMemo(() => state.acknowledgements.termsAccepted, [state.acknowledgements.termsAccepted]);

  const finalValidations = useMemo(() => {
    const target = state.campaignCore.targetAmount;
    const bank = state.bankInfo;
    return {
      coreOk: Object.keys(step2Errors).length === 0,
      budgetOk: budgetTotal === target,
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
        state.bankInfo.accountHolderName.trim() === state.kycFullName.trim() &&
        state.acknowledgements.legalRead &&
        state.acknowledgements.slaAccepted,
      otpOk: otpRequested && otpCode.trim().length >= 4,
    };
  }, [state, step2Errors, budgetTotal, milestoneTotal, otpRequested, otpCode]);

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
    (activeStep === 1 && previewVisible) || (activeStep === 5 && step6FullPreview);

  /**
   * Điều hướng wizard:
   * - Lùi (về bước có chỉ số nhỏ hơn): luôn cho phép — chủ yếu qua stepper hoặc "Quay lại".
   * - Tiến một bước: chỉ khi bước hiện tại thỏa điều kiện (tương đương bấm "Tiếp tục" hợp lệ).
   * - Nhảy cóc về phía trước (>1 bước): không cho — tránh bỏ qua gate / form.
   */
  const goToStep = useCallback(
    (target: number) => {
      const last = steps.length - 1;
      if (target < 0 || target > last) return;
      setActiveStep((current) => {
        if (target === current) return current;
        if (target < current) return target;
        if (target > current + 1) return current;
        const ok =
          (current === 0 && step0CanNext) ||
          (current === 1 && step2CanNext) ||
          (current === 2 && step3CanNext) ||
          (current === 3 && step4CanNext) ||
          (current === 4 && step5CanNext);
        if (!ok) return current;
        return target;
      });
    },
    [step0CanNext, step2CanNext, step3CanNext, step4CanNext, step5CanNext],
  );

  return (
    <div className="min-h-[100dvh] bg-[#f9fafb] px-4 py-6 md:py-8">
      <div className="mx-auto max-w-[960px]">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 md:text-3xl">
            Tạo chiến dịch mới
          </h1>
        </div>

        {/* Horizontal Stepper */}
        <NewCampaignTestStepper
          steps={steps}
          activeIndex={activeStep}
          onJump={goToStep}
        />

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
              <Step3BudgetMilestones
                state={state}
                budgetTotal={budgetTotal}
                onPatch={patchState}
                onPrev={() => goToStep(1)}
                onNext={() => goToStep(3)}
                canNext={step3CanNext}
              />
            )}
            {activeStep === 3 && (
              <Step4Milestones
                state={state}
                milestoneTotal={milestoneTotal}
                onPatch={patchState}
                onPrev={() => goToStep(2)}
                onNext={() => goToStep(4)}
                canNext={step4CanNext}
              />
            )}
            {activeStep === 4 && (
              <Step5RiskTerms
                state={state}
                onPatch={patchState}
                onPrev={() => goToStep(3)}
                onNext={() => goToStep(5)}
                canNext={step5CanNext}
              />
            )}
            {activeStep === 5 && (
              <Step6ReviewSubmit
                state={state}
                checks={finalValidations}
                otpCode={otpCode}
                onChangeOtp={setOtpCode}
                onRequestOtp={() => setOtpRequested(true)}
                otpRequested={otpRequested}
                onOpenFullPreview={() => setStep6FullPreview(true)}
                onPrev={() => goToStep(4)}
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

      {showPreviewModal && (
        <CampaignPreviewPanel
          state={state}
          budgetTotal={budgetTotal}
          milestoneTotal={milestoneTotal}
          fullScreen={activeStep === 5}
          onClose={() => {
            if (activeStep === 1) setPreviewVisible(false);
            if (activeStep === 5) setStep6FullPreview(false);
          }}
        />
      )}
    </div>
  );
}
