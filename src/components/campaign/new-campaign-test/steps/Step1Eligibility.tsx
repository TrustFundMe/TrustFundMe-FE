'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mockBanks } from '../mockData';
import { CredibilityFile, NewCampaignTestState } from '../types';
import LegalModal from '../parts/LegalModal';
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
  'w-full min-h-[48px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-1 focus:ring-black/5';

const bankTriggerBase =
  'flex w-full min-h-[48px] items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black/5';

function LabeledField({
  id,
  label,
  hint,
  children,
}: {
  /** Có `id` thì gắn `htmlFor` với control (input/button); bỏ qua khi khối chỉ đọc. */
  id?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const hintId = id ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
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
    <section className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
            {step}
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-black">{title}</h3>
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

function LockIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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
  const [refreshingStep1, setRefreshingStep1] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [checkingBankDup, setCheckingBankDup] = useState(false);
  const [checkingBankDupLive, setCheckingBankDupLive] = useState(false);
  const [bankDuplicateError, setBankDuplicateError] = useState('');
  const [bankTouched, setBankTouched] = useState<{ holder: boolean; number: boolean; bank: boolean }>({
    holder: false,
    number: false,
    bank: false,
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
    if (!user?.id) {
      setInitialLoading(false);
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
        : !/^\d+$/.test(bankNumberTrim)
          ? 'Số tài khoản chỉ được chứa chữ số.'
          : bankNumberTrim.length < 6 || bankNumberTrim.length > 50
            ? 'Số tài khoản phải từ 6-50 chữ số.'
            : '',
    bank: !bankCodeTrim ? 'Vui lòng chọn ngân hàng nhận tiền.' : '',
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

  const addBankProof = (files: FileList | File[] | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const additions: CredibilityFile[] = list.map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
      file,
    }));
    onPatch({ bankProofFiles: [...state.bankProofFiles, ...additions] });
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addBankProof(e.dataTransfer.files);
  };

  const handleStepNext = async () => {
    if (!canNext || checkingBankDup) return;
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
      onNext();
    } catch {
      setBankDuplicateError('Không kiểm tra được trùng tài khoản. Vui lòng thử lại.');
    } finally {
      setCheckingBankDup(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-3 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-black">Bước 1 — Kiểm tra cổng & tài khoản</h2>
        <button
          type="button"
          onClick={() => refreshStepOneData(true)}
          disabled={refreshingStep1 || initialLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshingStep1 ? 'Đang làm mới...' : 'Làm mới trạng thái'}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <SectionBlock step="1" title="Định danh & cổng vào">
          {(state.kycStatus === 'APPROVED' || state.kycStatus === 'PENDING') ? (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              role="status"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black">
                  <CheckBadgeIcon />
                </span>
                <div>
                  <p className="text-sm font-bold text-black">
                    {state.kycStatus === 'APPROVED' ? 'Định danh đã xác minh' : 'KYC đang chờ duyệt'}
                    {state.kycStatus === 'PENDING' && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                        chờ duyệt
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-700">
                    {state.kycStatus === 'NOT_SUBMITTED' ? 'Chưa xác minh KYC' : 'KYC chưa đạt'}
                  </p>
                  {state.kycRejectReason ? (
                    <p className="text-xs text-red-600 truncate">Lý do: {state.kycRejectReason}</p>
                  ) : (
                    <p className="text-xs text-red-600/90">Cần xác minh danh tính để tiếp tục.</p>
                  )}
                </div>
                <Link
                  href={KYC_PAGE_HREF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-gray-800 shrink-0"
                >
                  Xác minh ngay
                </Link>
              </div>
            </div>
          )}

          {(state.kycStatus === 'APPROVED' || state.kycStatus === 'PENDING') && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={KYC_PAGE_HREF}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50"
              >
                Xem thông tin KYC
              </Link>
            </div>
          )}

          {/* Silent refresh by design */}
        </SectionBlock>

        <SectionBlock step="2" title="Tài khoản ngân hàng nhận tiền">
          <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2.5">
                <p className="text-xs font-bold text-blue-800">
                  Theo quy định tại Nghị định 93/2021/NĐ-CP, mỗi chiến dịch phải sử dụng một tài khoản tiếp nhận tiền riêng biệt.
                </p>
              </div>
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
                hint="Nhập số tài khoản nhận giải ngân (chỉ chữ số)."
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
            </div>
        </SectionBlock>

        <SectionBlock step="3" title="Hồ sơ năng lực thiện nguyện">
          {user?.cvUrl ? (
            /* ── User already has CV — show summary only ── */
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Đã có hồ sơ năng lực</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={user.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50"
                >
                  Xem hồ sơ
                </a>
                <Link
                  href="/account/profile"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50"
                >
                  Thay đổi trên Profile
                </Link>
              </div>
            </div>
          ) : (
            /* ── No CV — redirect to profile page ── */
            <>
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <p className="text-xs leading-relaxed text-gray-500">
                  Hồ sơ chứng minh năng lực là yếu tố <strong className="text-black">bắt buộc</strong>.
                  Vui lòng cập nhật hồ sơ năng lực tại trang cá nhân trước khi tiếp tục.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/account/profile"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-gray-800"
                  >
                    Cập nhật hồ sơ trên trang cá nhân
                  </Link>
                </div>
              </div>
            </>
          )}
        </SectionBlock>
      </div>

      <StepFooter
        canNext={canNext && !checkingBankDup && !checkingBankDupLive}
        onNext={handleStepNext}
        failMessage={checkingBankDup || checkingBankDupLive ? 'Đang kiểm tra trùng tài khoản ngân hàng...' : failMessage}
      />
    </div>
  );
}
