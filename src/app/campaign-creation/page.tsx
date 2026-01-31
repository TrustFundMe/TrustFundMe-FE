'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';

import { FileField, TextAreaField, TextField } from '@/components/campaign/FormField';
import SubmitResultPanel from '@/components/campaign/SubmitResultPanel';

import type { CreateCampaignRequest } from '@/types/campaign';

type StepId = 'campaign_basic' | 'campaign_schedule' | 'review';

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
  { id: 'campaign_basic', title: 'Campaign Info', subtitle: 'Title & description' },
  { id: 'campaign_schedule', title: 'Schedule & Cover', subtitle: 'Dates & image' },
  { id: 'review', title: 'Review', subtitle: 'Confirm & submit' },
];

const initialCampaignState = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  coverImage: null as File | null,
  thankMessage: '',
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
    <aside className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onJump(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black hover:bg-black/5"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-semibold text-black">Campaign Creation</div>
      </div>

      <div className="mt-4 space-y-4">
        {steps.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(idx)}
              className="group flex w-full items-start gap-3 text-left"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${isActive
                    ? 'border-red-600 bg-red-600 text-white'
                    : isDone
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 bg-white text-black'
                    }`}
                >
                  {idx + 1}
                </div>
                {idx !== steps.length - 1 ? (
                  <div className="mt-1 h-8 w-px bg-black/10" />
                ) : null}
              </div>

              <div className="min-w-0">
                <div
                  className={`text-xs font-semibold ${isActive ? 'text-black' : 'text-black/70'}`}
                >
                  {s.title}
                </div>
                <div className="mt-0.5 text-[11px] text-black/50">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function CampaignCreationPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchedSteps, setTouchedSteps] = useState<Record<StepId, boolean>>({
    campaign_basic: false,
    campaign_schedule: false,
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
    if (!campaign.coverImage) e.coverImage = 'Cover image is required.';

    if (campaign.startDate && campaign.endDate) {
      const s = new Date(campaign.startDate);
      const ed = new Date(campaign.endDate);
      if (ed.getTime() < s.getTime()) e.endDate = 'End date should be after start date.';
    }

    return e;
  }, [campaign]);

  const canGoNext = useMemo(() => {
    switch (currentStep.id) {
      case 'campaign_basic':
        return Object.keys(campaignBasicErrors).length === 0;
      case 'campaign_schedule':
        return Object.keys(campaignScheduleErrors).length === 0;
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

  // UI blocks per step
  const renderStep = () => {
    switch (currentStep.id) {
      case 'campaign_basic': {
        const show = touchedSteps.campaign_basic;
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-sm font-semibold text-black">Campaign Information</div>
              <div className="mt-1 text-xs text-black/60">Basic campaign information.</div>

              <div className="mt-5 space-y-4">
                <div>
                  <TextField
                    label="Title"
                    value={campaign.title}
                    onChange={(v) => setCampaignField('title', v)}
                    required
                  />
                  <ErrorText show={show} message={campaignBasicErrors.title} />
                </div>

                <div>
                  <TextAreaField
                    label="Description"
                    value={campaign.description}
                    onChange={(v) => setCampaignField('description', v)}
                    rows={5}
                    required
                  />
                  <ErrorText show={show} message={campaignBasicErrors.description} />
                </div>

                <div>
                  <TextAreaField
                    label="Thank You Message"
                    value={campaign.thankMessage}
                    onChange={(v) => setCampaignField('thankMessage', v)}
                    rows={3}
                  />
                  <ErrorText show={show} message={campaignBasicErrors.thankMessage} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-xs font-semibold text-black">Limits</div>
                <div className="mt-2 text-xs text-black/60">
                  Title max 255 chars. Description max 5000. Thank you message max 2000.
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'campaign_schedule': {
        const show = touchedSteps.campaign_schedule;
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-sm font-semibold text-black">Schedule & Cover</div>
              <div className="mt-1 text-xs text-black/60">Campaign dates and cover image.</div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <TextField
                    label="Start Date"
                    value={campaign.startDate}
                    onChange={(v) => setCampaignField('startDate', v)}
                    type="date"
                    required
                  />
                  <ErrorText show={show} message={campaignScheduleErrors.startDate} />
                </div>

                <div>
                  <TextField
                    label="End Date"
                    value={campaign.endDate}
                    onChange={(v) => setCampaignField('endDate', v)}
                    type="date"
                    required
                  />
                  <ErrorText show={show} message={campaignScheduleErrors.endDate} />
                </div>

                <div className="sm:col-span-2">
                  <FileField
                    label="Cover Image"
                    file={campaign.coverImage}
                    onChange={(f) => setCampaignField('coverImage', f)}
                    accept="image/*"
                    required
                  />
                  <ErrorText show={show} message={campaignScheduleErrors.coverImage} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-xs font-semibold text-black">Preview</div>
                <div className="mt-2 h-28 rounded-xl border border-black/10 bg-black/5" />
              </div>
            </div>
          </div>
        );
      }

      case 'review': {
        const show = touchedSteps.review;
        const campCount = Object.keys(campaignBasicErrors).length + Object.keys(campaignScheduleErrors).length;
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-sm font-semibold text-black">Review</div>
              <div className="mt-1 text-xs text-black/60">Confirm and submit your campaign.</div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs font-semibold text-black">Campaign Details</div>
                  <div className="mt-2 text-xs text-black/60">
                    {campCount === 0 ? 'Ready to submit' : `${campCount} issue(s) found`}
                  </div>
                </div>
              </div>

              {show && campCount > 0 ? (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  Please go back and fix validation errors before submitting.
                </div>
              ) : null}

              <div className="mt-4">
                {result.type === 'success' ? (
                  <SubmitResultPanel
                    variant="success"
                    title="Campaign Created"
                    message={result.message}
                    primaryLabel="Back to Campaigns"
                    onPrimary={() => router.push('/campaigns')}
                  />
                ) : result.type === 'error' ? (
                  <SubmitResultPanel
                    variant="error"
                    title="Submit failed"
                    message={result.message}
                    primaryLabel="Try again"
                    onPrimary={() => setResult({ type: 'idle' })}
                    secondaryLabel="Back"
                    onSecondary={() => router.back()}
                  />
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-xs font-semibold text-black">Submit</div>
                <div className="mt-2 text-xs text-black/60">
                  Submit will create your campaign as a draft for staff review.
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting || authLoading || !isAuthenticated}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
                </button>
              </div>
            </div>
          </div>
        );
      }

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
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-black">{currentStep.title}</div>
                <div className="mt-1 text-xs text-black/60">{currentStep.subtitle}</div>
              </div>

              {currentStep.id !== 'review' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={activeIndex === 0}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-6">{renderStep()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
