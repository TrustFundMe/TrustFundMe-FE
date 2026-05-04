'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mockBanks } from '../mockData';
import { NewCampaignTestState } from '../types';
import StepFooter from '../parts/StepFooter';
import { useAuth } from '@/contexts/AuthContextProxy';
import { kycService } from '@/services/kycService';
import { bankAccountService } from '@/services/bankAccountService';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { useToast } from '@/components/ui/Toast';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onNext: () => void;
  canNext: boolean;
  failMessage?: string;
}

/** Ô nhập dạng hộp — dễ nhận diện vùng bấm và nhập liệu */
const fieldBox =
  'w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-1 focus:ring-black/5';

const bankTriggerBase =
  'flex w-full min-h-[44px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black/5';

function LabeledField({
  id,
  label,
  hint,
  action,
  children,
}: {
  /** Có `id` thì gắn `htmlFor` với control (input/button); bỏ qua khi khối chỉ đọc. */
  id?: string;
  label: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hintId = id ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {id ? (
            <label htmlFor={id} className="text-sm font-semibold text-gray-900">
              {label}
            </label>
          ) : (
            <span className="text-sm font-semibold text-gray-900">{label}</span>
          )}
          {hint ? (
            <button
              type="button"
              id={hintId}
              title={hint}
              aria-label={hint}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition hover:text-gray-600"
            >
              <InfoIcon />
            </button>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function SectionBlock({
  step,
  title,
  actions,
  children,
}: {
  step: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-2.5 md:p-3">
      <div className="mb-2 flex min-h-7 items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
        <div className="flex min-w-0 items-center gap-2 self-center">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
            {step}
          </span>
          <h3 className="flex h-6 items-center truncate text-[11px] font-bold uppercase tracking-wide text-black">
            {title}
          </h3>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function CheckBadgeIcon() {
  return (
    <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M3.5 8.2l2.8 2.8 6.2-6.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path strokeLinecap="round" d="M10 9v5M10 6.5v.1" />
    </svg>
  );
}

export default function Step1Eligibility({ state, onPatch, onNext, canNext, failMessage }: Props) {
  const [bankQuery, setBankQuery] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [cassoGuideOpen, setCassoGuideOpen] = useState(false);
  const [webhookKeyDupError, setWebhookKeyDupError] = useState('');
  const [checkingWebhookKey, setCheckingWebhookKey] = useState(false);
  const [refreshingStep1, setRefreshingStep1] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [checkingBankDup, setCheckingBankDup] = useState(false);
  const [checkingBankDupLive, setCheckingBankDupLive] = useState(false);
  const [bankDuplicateError, setBankDuplicateError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [bankTouched, setBankTouched] = useState<{ holder: boolean; number: boolean; bank: boolean; webhookKey: boolean }>({
    holder: false,
    number: false,
    bank: false,
    webhookKey: false,
  });
  const bankWrapRef = useRef<HTMLDivElement>(null);
  const KYC_PAGE_HREF = '/account/profile';
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const refreshStepOneData = async (showDoneNotice = false) => {
    if (!user?.id) return;
    setRefreshingStep1(true);

    const [kycResult, userResult] = await Promise.allSettled([
      kycService.getMyKyc(),
      api.get(API_ENDPOINTS.USERS.BY_ID(user.id)),
    ]);

    if (kycResult.status === 'fulfilled') {
      const kyc = kycResult.value;
      if (kyc) {
        const status = kyc.status === 'APPROVED' ? 'APPROVED' : kyc.status === 'PENDING' ? 'PENDING' : kyc.status === 'REJECTED' ? 'REJECTED' : 'NOT_SUBMITTED';
        onPatch({
          kycStatus: status,
          kycFullName: kyc.fullName || user.fullName || '',
          kycRejectReason: kyc.rejectionReason || '',
        });
      } else {
        onPatch({ kycStatus: 'NOT_SUBMITTED', kycFullName: user.fullName || '', kycRejectReason: '' });
      }
    } else {
      onPatch({ kycStatus: 'NOT_SUBMITTED', kycFullName: user.fullName || '', kycRejectReason: '' });
    }

    if (userResult.status === 'fulfilled' && userResult.value?.data) {
      const latestUser = userResult.value.data;
      updateUser({
        fullName: latestUser.fullName,
        cvUrl: latestUser.cvUrl,
      });
    }

    setRefreshingStep1(false);
    setInitialLoading(false);
  };

  // Auto-fetch KYC + Bank on mount
  useEffect(() => {
    setMounted(true);
    if (!user?.id) {
      return;
    }
    setInitialLoading(true);
    refreshStepOneData();
  }, [user?.id]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (bankWrapRef.current && !bankWrapRef.current.contains(e.target as Node)) setBankOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);


  const selectedBank = useMemo(
    () => mockBanks.find((b) => b.code === state.bankInfo.bankCode) ?? null,
    [state.bankInfo.bankCode],
  );
  const bankHolderTrim = state.bankInfo.accountHolderName.trim();
  const bankNumberTrim = state.bankInfo.accountNumber.trim();
  const bankCodeTrim = state.bankInfo.bankCode.trim();
  const bankDuplicateCheckKey = `${bankCodeTrim}|${bankNumberTrim}`;
  const bankErrors = {
    holder:
      !bankHolderTrim
        ? 'Vui lòng nhập tên chủ tài khoản.'
        : bankHolderTrim.length < 6 || bankHolderTrim.length > 255
          ? 'Tên chủ tài khoản phải từ 6-255 ký tự.'
          : '',
    number:
      !bankNumberTrim
        ? 'Vui lòng nhập số tài khoản.'
        : bankNumberTrim.length < 6 || bankNumberTrim.length > 50
          ? 'Số tài khoản phải từ 6-50 ký tự.'
          : '',
    bank: !bankCodeTrim ? 'Vui lòng chọn ngân hàng nhận tiền.' : '',
    webhookKey: !state.bankInfo.webhookKey.trim() ? 'Vui lòng nhập mã kết nối Casso.' : '',
  };

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return mockBanks;
    return mockBanks.filter(
      (b) =>
        b.shortName.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q),
    );
  }, [bankQuery]);

  useEffect(() => {
    // Chỉ check realtime khi đã có đủ dữ liệu tối thiểu hợp lệ
    if (!bankNumberTrim || !bankCodeTrim || bankErrors.number || bankErrors.bank) {
      setCheckingBankDupLive(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setCheckingBankDupLive(true);
      try {
        const exists = await bankAccountService.checkExists(bankNumberTrim, bankCodeTrim);
        if (cancelled) return;
        if (exists) {
          setBankDuplicateError('Số tài khoản này đã tồn tại trong hệ thống. Vui lòng dùng tài khoản khác.');
        } else {
          setBankDuplicateError('');
        }
      } catch {
        if (!cancelled) {
          setBankDuplicateError('Không kiểm tra được trùng tài khoản. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) {
          setCheckingBankDupLive(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [bankDuplicateCheckKey, bankErrors.number, bankErrors.bank, bankNumberTrim, bankCodeTrim]);

  const webhookKeyTrim = state.bankInfo.webhookKey.trim();
  useEffect(() => {
    if (!webhookKeyTrim) { setWebhookKeyDupError(''); return; }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setCheckingWebhookKey(true);
      try {
        const exists = await bankAccountService.checkWebhookKeyExists(webhookKeyTrim);
        if (cancelled) return;
        setWebhookKeyDupError(exists ? 'Mã Casso này đã được đăng ký bởi tài khoản khác. Vui lòng dùng mã khác.' : '');
      } catch {
        if (!cancelled) setWebhookKeyDupError('');
      } finally {
        if (!cancelled) setCheckingWebhookKey(false);
      }
    }, 450);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [webhookKeyTrim]);

  const handleStepNext = async () => {
    if (!canNext || checkingBankDup) return;
    if (bankDuplicateError || webhookKeyDupError) {
      toast(bankDuplicateError || webhookKeyDupError, 'error');
      return;
    }
    const accountNumber = state.bankInfo.accountNumber.trim();
    const bankCode = state.bankInfo.bankCode.trim();
    if (!accountNumber || !bankCode) return;
    setCheckingBankDup(true);
    setBankDuplicateError('');
    try {
      const exists = await bankAccountService.checkExists(accountNumber, bankCode);
      if (exists) {
        setBankDuplicateError('Số tài khoản này đã tồn tại trong hệ thống. Vui lòng dùng tài khoản khác.');
        toast('Tài khoản ngân hàng bị trùng trong hệ thống', 'error');
        return;
      }
      const webhookExists = await bankAccountService.checkWebhookKeyExists(state.bankInfo.webhookKey.trim());
      if (webhookExists) {
        setWebhookKeyDupError('Mã Casso này đã được đăng ký bởi tài khoản khác. Vui lòng dùng mã khác.');
        toast('Mã Casso bị trùng trong hệ thống', 'error');
        return;
      }
      onNext();
    } catch {
      setBankDuplicateError('Không kiểm tra được trùng tài khoản. Vui lòng thử lại.');
    } finally {
      setCheckingBankDup(false);
    }
  };

  const isStatusLoading = initialLoading || refreshingStep1;
  const hasCv = Boolean(user?.cvUrl);
  const isIdentityVerified = state.kycStatus === 'APPROVED' && hasCv;

  const identityTone = isStatusLoading
    ? {
        box: 'border-gray-200 bg-gray-50',
        badge: 'bg-gray-100 text-gray-700',
        label: 'Đang tải trạng thái...',
      }
    : isIdentityVerified
    ? {
        box: 'border-emerald-200 bg-emerald-50/70',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Đã xác thực danh tính',
      }
    : {
        box: 'border-red-200 bg-red-50/80',
        badge: 'bg-red-100 text-red-800',
        label: 'Chưa xác thực danh tính',
      };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] min-h-[calc(100dvh-6.75rem)] flex-col overflow-hidden rounded-xl bg-white p-2.5 md:p-3">
      <div className="campaign-step-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-0.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold tracking-tight text-black">Bước 1 — Hồ sơ & tài khoản</h2>
        <button
          type="button"
          onClick={() => refreshStepOneData(true)}
          disabled={refreshingStep1 || initialLoading}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshingStep1 ? 'Đang tải…' : 'Làm mới'}
        </button>
      </div>

      <div className="mt-2 space-y-2">
        <SectionBlock
          step="1"
          title="Xác thực danh tính"
          actions={(
            <div className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600">
              <InfoIcon />
              <span>Yêu cầu KYC đã duyệt & có hồ sơ (CV)</span>
            </div>
          )}
        >
          <div
            className={`rounded-lg border p-4 ${identityTone.box} transition-all`}
            role="status"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${identityTone.iconBg}`}>
                  {isIdentityVerified ? <CheckBadgeIcon /> : <InfoIcon />}
                </div>
                <div>
                  <p className={`text-[13px] font-bold ${identityTone.colorClass}`}>
                    {identityTone.label}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {identityTone.subLabel}
                  </p>
                </div>
              </div>

              {!isIdentityVerified && !isStatusLoading && (
                <Link
                  href={KYC_PAGE_HREF}
                  className="shrink-0 rounded-lg bg-black px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-gray-800"
                >
                  Tới trang xác thực
                </Link>
              )}
            </div>

            {state.kycRejectReason && state.kycStatus === 'REJECTED' && (
              <div className="mt-3 rounded-md bg-red-100/50 p-2 border border-red-200/50">
                <p className="text-[11px] font-semibold text-red-800">Lý do từ chối:</p>
                <p className="text-[11px] text-red-700">{state.kycRejectReason}</p>
              </div>
            )}
          </div>
        </SectionBlock>

        <div className={!isIdentityVerified ? 'pointer-events-none opacity-50' : ''}>

        <SectionBlock step="2" title="STK nhận giải ngân">
          <div className="space-y-2.5">
              <p className="text-[11px] font-semibold leading-snug text-blue-900">
                Theo Nghị định 93/2021/NĐ-CP, chiến dịch phải có tài khoản tiếp nhận tiền riêng. Vui lòng nhập thông tin tài khoản chính xác.
              </p>
              <LabeledField
                id="step1-holder-name"
                label="Tên chủ tài khoản"
                hint="Nên trùng tên KYC nếu là cá nhân. Tổ chức có thể dùng tên tổ chức."
              >
                <input
                  id="step1-holder-name"
                  className={fieldBox}
                  placeholder="Ví dụ: NGUYEN VAN A hoặc HỘI CHỮ THẬP ĐỎ"
                  value={state.bankInfo.accountHolderName}
                  onChange={(e) => {
                    setBankDuplicateError('');
                    onPatch({ bankInfo: { ...state.bankInfo, accountHolderName: e.target.value } });
                  }}
                  onBlur={() => setBankTouched((prev) => ({ ...prev, holder: true }))}
                  aria-describedby="step1-holder-name-hint"
                />
                {bankTouched.holder && bankErrors.holder && (
                  <p className="text-xs font-semibold text-red-600">{bankErrors.holder}</p>
                )}
                {state.kycStatus === 'APPROVED' && state.bankInfo.accountHolderName.trim() !== '' && state.bankInfo.accountHolderName.trim() !== state.kycFullName.trim() && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Tên không trùng KYC ({state.kycFullName}). Nếu là tổ chức, có thể bỏ qua.
                  </p>
                )}
              </LabeledField>

              <LabeledField
                id="step1-account-number"
                label="Số tài khoản"
                hint="Nhập số tài khoản nhận giải ngân."
              >
                <input
                  id="step1-account-number"
                  className={fieldBox}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ví dụ: 0123456789"
                  value={state.bankInfo.accountNumber}
                  onChange={(e) => {
                    setBankDuplicateError('');
                    onPatch({ bankInfo: { ...state.bankInfo, accountNumber: e.target.value } });
                  }}
                  onBlur={() => setBankTouched((prev) => ({ ...prev, number: true }))}
                  aria-describedby="step1-account-number-hint"
                />
                {bankTouched.number && bankErrors.number && (
                  <p className="text-xs font-semibold text-red-600">{bankErrors.number}</p>
                )}
              </LabeledField>

              <div className="relative z-30" ref={bankWrapRef}>
                <LabeledField
                  id="step1-bank-trigger"
                  label="Ngân hàng"
                  hint="Chọn ngân hàng nhận giải ngân."
                >
                  <button
                    type="button"
                    id="step1-bank-trigger"
                    aria-expanded={bankOpen}
                    aria-describedby="step1-bank-trigger-hint"
                    aria-haspopup="listbox"
                    onClick={() => setBankOpen((o) => !o)}
                    className={`${bankTriggerBase} ${bankOpen ? 'border-black ring-1 ring-black/5' : ''}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {selectedBank ? (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100">
                          <img
                            src={selectedBank.logoUrl}
                            alt={selectedBank.shortName}
                            className="h-8 w-8 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </span>
                      ) : (
                        <span
                          className="h-10 w-10 shrink-0 rounded-lg bg-gray-50 ring-1 ring-gray-200"
                          aria-hidden
                        />
                      )}
                      <span className="min-w-0 truncate font-medium text-gray-900">
                        {selectedBank?.name ?? <span className="font-normal text-gray-400">Chọn ngân hàng…</span>}
                      </span>
                    </span>
                    <ChevronIcon open={bankOpen} />
                  </button>
                </LabeledField>
                {bankOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl"
                  >
                    <div className="border-b border-gray-100 px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/5"
                        placeholder="Tìm ngân hàng..."
                        value={bankQuery}
                        onChange={(e) => setBankQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <ul className="max-h-60 overflow-y-auto px-1.5 py-1.5">
                      {filteredBanks.map((b) => {
                        const active = b.code === state.bankInfo.bankCode;
                        return (
                          <li key={b.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setBankDuplicateError('');
                                onPatch({ bankInfo: { ...state.bankInfo, bankCode: b.code, bankName: b.name } });
                                setBankOpen(false);
                                setBankQuery('');
                                setBankTouched((prev) => ({ ...prev, bank: true }));
                              }}
                              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition ${active ? 'bg-gray-100 font-bold text-black ring-1 ring-gray-300' : 'text-gray-900 hover:bg-gray-50'}`}
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100">
                                <img
                                  src={b.logoUrl}
                                  alt={b.shortName}
                                  className="h-7 w-7 object-contain"
                                  onError={(e) => {
                                    const el = e.target as HTMLImageElement;
                                    el.style.display = 'none';
                                    el.parentElement!.innerHTML = `<span class="text-[10px] font-bold text-gray-400">${b.code}</span>`;
                                  }}
                                />
                              </span>
                              <span className="min-w-0 truncate">{b.name}</span>
                            </button>
                          </li>
                        );
                      })}
                      {filteredBanks.length === 0 && <li className="px-3 py-3 text-center text-sm text-gray-400">Không tìm thấy ngân hàng</li>}
                    </ul>
                  </motion.div>
                )}
              </div>
              {bankTouched.bank && bankErrors.bank && (
                <p className="text-xs font-semibold text-red-600">{bankErrors.bank}</p>
              )}
              {bankDuplicateError && (
                <p className="text-xs font-semibold text-red-600">{bankDuplicateError}</p>
              )}

              <LabeledField
                id="step1-webhook-key"
                label="Mã kết nối nhận giao dịch tự động (Casso)"
                hint="Nếu bạn dùng Casso, dán mã bảo mật để hệ thống tự nhận diện tiền chuyển vào. Không dùng Casso thì để trống."
                action={(
                  <button
                    type="button"
                    onClick={() => setCassoGuideOpen(true)}
                    className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-800 ring-1 ring-orange-200 transition hover:bg-orange-200 hover:text-orange-900"
                  >
                    Bấm để xem cách lấy mã Casso
                  </button>
                )}
              >
                <input
                  id="step1-webhook-key"
                  className={fieldBox}
                  placeholder="Dán mã bảo mật Casso"
                  value={state.bankInfo.webhookKey}
                  onChange={(e) => onPatch({ bankInfo: { ...state.bankInfo, webhookKey: e.target.value } })}
                  onBlur={() => setBankTouched((prev) => ({ ...prev, webhookKey: true }))}
                  aria-describedby="step1-webhook-key-hint"
                />
                {bankTouched.webhookKey && bankErrors.webhookKey && (
                  <p className="text-xs font-semibold text-red-600">{bankErrors.webhookKey}</p>
                )}
                {checkingWebhookKey && (
                  <p className="text-xs text-slate-400 mt-1">Đang kiểm tra mã Casso...</p>
                )}
                {!checkingWebhookKey && webhookKeyDupError && (
                  <p className="text-xs font-semibold text-red-600 mt-1">{webhookKeyDupError}</p>
                )}
              </LabeledField>
            </div>
        </SectionBlock>
        </div>
      </div>
      </div>

      <StepFooter
        canNext={canNext && !checkingBankDup && !checkingBankDupLive && !bankDuplicateError && !webhookKeyDupError && !checkingWebhookKey}
        onNext={handleStepNext}
        failMessage={
          checkingBankDup || checkingBankDupLive || checkingWebhookKey
            ? 'Đang kiểm tra trùng tài khoản...'
            : bankDuplicateError || webhookKeyDupError || failMessage
        }
      />

      <AnimatePresence>
        {cassoGuideOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setCassoGuideOpen(false)} aria-hidden />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="casso-guide-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 md:px-6">
                <div>
                  <h2 id="casso-guide-title" className="text-xl font-bold tracking-tight text-gray-900">
                    Hướng dẫn lấy mã kết nối Casso
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCassoGuideOpen(false)}
                  aria-label="Đóng"
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                  </svg>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    Webhook key Casso là mã bảo mật do Casso tự sinh khi bạn tạo tích hợp Webhook/Webhook V2.
                    Hệ thống dùng key này để xác thực chữ ký webhook do Casso gửi về.
                  </p>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-2 font-semibold text-gray-900">Cách lấy Webhook key Casso:</p>
                    <ol className="list-decimal space-y-1 pl-5">
                      <li>Đăng nhập: <a href="https://casso.vn/" target="_blank" rel="noreferrer" className="text-blue-700 underline">https://casso.vn/</a></li>
                      <li>Vào Kết nối &gt; Tích hợp &gt; Thêm tích hợp</li>
                      <li>Chọn Webhook hoặc Webhook V2</li>
                      <li>Nhập Webhook URL: <code className="select-all rounded bg-gray-200 px-1.5 py-0.5 text-xs font-bold text-gray-900">https://trust-fund-me-be.vercel.app/api/casso</code></li>
                      <li>Sao chép “Key bảo mật” do Casso tạo</li>
                      <li>Dán key đó vào ô này</li>
                      <li>Bấm “Gọi thử” để test và sau đó bấm “Lưu”</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">Tài liệu chính thức:</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      <li><a href="https://developer.casso.vn/webhook/thiet-lap-webhook-thu-cong" target="_blank" rel="noreferrer" className="text-blue-700 underline">https://developer.casso.vn/webhook/thiet-lap-webhook-thu-cong</a></li>
                      <li><a href="https://developer.casso.vn/casso-api/api/thiet-lap-webhook" target="_blank" rel="noreferrer" className="text-blue-700 underline">https://developer.casso.vn/casso-api/api/thiet-lap-webhook</a></li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <p className="font-semibold">Lưu ý:</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      <li>Webhook URL bắt buộc phải là đường dẫn public HTTPS</li>
                      <li>Không dùng localhost, 127.0.0.1 hoặc IP nội bộ</li>
                      <li>Nếu dùng Cloudflare hoặc anti-DDoS, cần whitelist IP của Casso</li>
                      <li>Không chia sẻ key này cho người khác</li>
                    </ul>
                  </div>
                </div>
              </div>

              <footer className="flex justify-end border-t border-gray-200 bg-white px-5 py-3 md:px-6">
                <button
                  type="button"
                  onClick={() => setCassoGuideOpen(false)}
                  className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Đã hiểu
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
