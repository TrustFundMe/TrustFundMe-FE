'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mockBanks } from '../mockData';
import { CredibilityFile, NewCampaignTestState } from '../types';
import LegalModal from '../parts/LegalModal';
import { useAuth } from '@/contexts/AuthContextProxy';
import { kycService } from '@/services/kycService';
import { bankAccountService } from '@/services/bankAccountService';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onNext: () => void;
  canNext: boolean;
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
      {id ? (
        <label htmlFor={id} className="text-sm font-semibold text-gray-900">
          {label}
        </label>
      ) : (
        <span className="text-sm font-semibold text-gray-900">{label}</span>
      )}
      {hint ? (
        <p id={hintId} className="text-xs leading-snug text-gray-600">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function SectionBlock({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="mb-3.5 flex items-center gap-3 border-b border-gray-100 pb-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
          {step}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide text-black">{title}</h3>
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

export default function Step1Eligibility({ state, onPatch, onNext, canNext }: Props) {
  const [bankQuery, setBankQuery] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [kycChecking, setKycChecking] = useState(false);
  const [kycNotice, setKycNotice] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [kycImages, setKycImages] = useState<{ front?: string; back?: string; selfie?: string }>({});
  const bankWrapRef = useRef<HTMLDivElement>(null);
  const KYC_PAGE_HREF = '/account/profile';
  const { user } = useAuth();

  // Auto-fetch KYC + Bank on mount
  useEffect(() => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setInitialLoading(true);

      // Fetch KYC — independent, don't block bank
      try {
        const kyc = await kycService.getMyKyc();
        if (kyc) {
          const status = kyc.status === 'APPROVED' ? 'APPROVED' : kyc.status === 'PENDING' ? 'PENDING' : kyc.status === 'REJECTED' ? 'REJECTED' : 'NOT_SUBMITTED';
          onPatch({
            kycStatus: status,
            kycFullName: kyc.fullName || user.fullName || '',
            kycRejectReason: kyc.rejectionReason || '',
          });
          setKycImages({
            front: kyc.idImageFront || undefined,
            back: kyc.idImageBack || undefined,
            selfie: kyc.selfieImage || undefined,
          });
        } else {
          onPatch({ kycStatus: 'NOT_SUBMITTED', kycFullName: user.fullName || '' });
        }
      } catch (err: any) {
        console.warn('KYC fetch failed (may not exist yet):', err?.response?.status || err.message);
        // If KYC service fails (500/403/etc), assume NOT_SUBMITTED so user can still proceed
        onPatch({ kycStatus: 'NOT_SUBMITTED', kycFullName: user.fullName || '' });
      }

      // Fetch Bank Accounts — independent
      try {
        const banks = await bankAccountService.getMyBankAccounts();
        if (banks && banks.length > 0) {
          const primary = banks[0];
          onPatch({
            bankInfo: {
              accountHolderName: primary.accountHolderName,
              accountNumber: primary.accountNumber,
              bankCode: primary.bankCode,
              bankName: mockBanks.find(b => b.code === primary.bankCode)?.name || primary.bankCode,
              branch: '',
            },
          });
        }
      } catch (err: any) {
        console.warn('Bank fetch failed:', err?.response?.status || err.message);
      }

      setInitialLoading(false);
    };

    fetchUserData();
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

  const refreshKycStatus = async () => {
    if (!user?.id) return;
    setKycChecking(true);
    setKycNotice('');
    try {
      const kyc = await kycService.getByUserId(user.id);
      if (kyc) {
        const status = kyc.status === 'APPROVED' ? 'APPROVED' : kyc.status === 'PENDING' ? 'PENDING' : kyc.status === 'REJECTED' ? 'REJECTED' : 'NOT_SUBMITTED';
        onPatch({
          kycStatus: status,
          kycFullName: kyc.fullName || user.fullName || '',
          kycRejectReason: kyc.rejectionReason || '',
        });
        if (status === 'APPROVED') setKycNotice('KYC đã được duyệt.');
        else if (status === 'PENDING') setKycNotice('KYC đang chờ duyệt.');
        else if (status === 'REJECTED') setKycNotice('KYC chưa đạt. Vui lòng cập nhật hồ sơ.');
        else setKycNotice('Bạn chưa nộp KYC.');
      } else {
        onPatch({ kycStatus: 'NOT_SUBMITTED' });
        setKycNotice('Bạn chưa nộp KYC. Vui lòng vào trang KYC và gửi hồ sơ trước.');
      }
    } catch {
      setKycNotice('Không thể kiểm tra KYC. Vui lòng thử lại.');
    } finally {
      setKycChecking(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 md:p-5">
      <h2 className="text-lg font-bold tracking-tight text-black">Bước 1 — Kiểm tra cổng & tài khoản</h2>
      <p className="mt-1 text-sm text-gray-500">Xác minh danh tính và tài khoản nhận tiền.</p>

      <div className="mt-5 space-y-4">
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
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">chờ duyệt</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Tên KYC: <span className="font-bold text-black">{state.kycFullName}</span>
                  </p>
                </div>
              </div>
              {/* KYC ID Images */}
              {(kycImages.front || kycImages.back || kycImages.selfie) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                  {kycImages.front && (
                    <div className="flex flex-col items-center gap-1">
                      <img src={kycImages.front} alt="CCCD Mặt trước" className="h-20 w-32 rounded-lg border border-gray-200 object-cover" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Mặt trước</span>
                    </div>
                  )}
                  {kycImages.back && (
                    <div className="flex flex-col items-center gap-1">
                      <img src={kycImages.back} alt="CCCD Mặt sau" className="h-20 w-32 rounded-lg border border-gray-200 object-cover" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Mặt sau</span>
                    </div>
                  )}
                  {kycImages.selfie && (
                    <div className="flex flex-col items-center gap-1">
                      <img src={kycImages.selfie} alt="Ảnh chân dung" className="h-20 w-20 rounded-full border border-gray-200 object-cover" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Chân dung</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-bold text-black">
                  {state.kycStatus === 'NOT_SUBMITTED'
                    ? 'Bạn chưa xác minh danh tính (KYC).'
                    : 'KYC chưa đạt.'}
                </p>
                {state.kycRejectReason ? (
                  <p className="mt-1 text-xs text-gray-500">Lý do: {state.kycRejectReason}</p>
                ) : null}
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  Hoàn tất xác minh danh tính để tiếp tục tạo chiến dịch.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={KYC_PAGE_HREF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-gray-800"
                >
                  Xác minh KYC ngay
                </Link>
                <button
                  type="button"
                  onClick={refreshKycStatus}
                  disabled={kycChecking}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {kycChecking ? 'Đang kiểm tra...' : 'Làm mới trạng thái'}
                </button>
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
              <button
                type="button"
                onClick={refreshKycStatus}
                disabled={kycChecking}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {kycChecking ? 'Đang kiểm tra...' : 'Làm mới trạng thái'}
              </button>
            </div>
          )}

          {/* Mock controls removed — now using real API data */}
          {kycNotice ? <p className="mt-2 text-xs font-medium text-gray-700">{kycNotice}</p> : null}
        </SectionBlock>

        <SectionBlock step="2" title="Tài khoản ngân hàng nhận tiền">
          {state.bankInfo.accountNumber && state.bankInfo.bankCode ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tài khoản đã liên kết</p>
                <div className="space-y-1 text-sm text-black">
                  <p>Chủ TK: <span className="font-bold">{state.bankInfo.accountHolderName}</span></p>
                  <p>Số TK: <span className="font-bold">{state.bankInfo.accountNumber}</span></p>
                  <p>Ngân hàng: <span className="font-bold">{state.bankInfo.bankName}</span></p>
                </div>
              </div>
              <Link
                href={KYC_PAGE_HREF}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50"
              >
                Thay đổi tài khoản
              </Link>
            </div>
<<<<<<< HEAD
=======
          </div>
        </SectionBlock>

        <SectionBlock step="3" title="Hồ sơ năng lực thiện nguyện">
          <div className="mb-3 rounded-xl border border-orange-100 bg-orange-50/60 px-3.5 py-2.5">
            <p className="text-sm leading-relaxed text-gray-800">
              Hồ sơ chứng minh năng lực là yếu tố <strong>bắt buộc</strong> để xét duyệt độ uy tín.
              Tải biểu mẫu bên dưới, điền đầy đủ các phần (thông tin cá nhân, khảo sát kinh nghiệm thiện nguyện, lịch sử hoạt động), xuất ra PDF và tải lên.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="/templates/Mau_CV_Thien_Nguyen.docx"
                download
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-hover"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Tải biểu mẫu Hồ sơ Năng Lực (Word)
              </a>
            </div>
          </div>

          <LabeledField
            label="Tải lên hồ sơ năng lực"
            hint="Upload file PDF đã điền đầy đủ theo biểu mẫu trên. Hỗ trợ PNG, JPG cho ảnh bằng khen/giấy xác nhận."
          >
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={addBankProof}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  addBankProof();
                }
              }}
              className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 shadow-sm transition-colors hover:border-brand hover:bg-orange-50/50 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100"
            >
            <svg className="h-9 w-9 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M12 16V8m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16.5A3.5 3.5 0 007.5 20h9A3.5 3.5 0 0020 16.5v-.04" strokeLinecap="round" />
            </svg>
            <p className="mt-1.5 text-sm font-semibold text-gray-700">Kéo thả tệp hoặc bấm để tải lên</p>
            <p className="mt-0.5 text-xs text-gray-500">PDF, PNG, JPG — tối đa 10MB/tệp</p>
          </div>
          </LabeledField>
          {state.bankProofFiles.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {state.bankProofFiles.map((f) => (
                <motion.li
                  key={f.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between gap-2 border-b border-gray-100 py-2 text-base text-gray-900"
                >
                  <span className="truncate font-medium">{f.name}</span>
                  <span className="shrink-0 text-gray-600">{f.sizeKb} KB</span>
                </motion.li>
              ))}
            </ul>
>>>>>>> 21155da85a53d52b5b24a6bf00939309b1a62cc1
          ) : (
            <div className="space-y-4">
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
                  onChange={(e) => onPatch({ bankInfo: { ...state.bankInfo, accountHolderName: e.target.value } })}
                  aria-describedby="step1-holder-name-hint"
                />
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
                  onChange={(e) => onPatch({ bankInfo: { ...state.bankInfo, accountNumber: e.target.value } })}
                  aria-describedby="step1-account-number-hint"
                />
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
                                onPatch({ bankInfo: { ...state.bankInfo, bankCode: b.code, bankName: b.name } });
                                setBankOpen(false);
                                setBankQuery('');
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
            </div>
          )}
        </SectionBlock>

        <SectionBlock step="3" title="Hồ sơ năng lực thiện nguyện">
          {user?.cvUrl ? (
            /* ── User already has CV — show summary only ── */
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Đã có hồ sơ năng lực</p>
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
            /* ── No CV — show templates + upload ── */
            <>
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <p className="text-xs leading-relaxed text-gray-500">
                  Hồ sơ chứng minh năng lực là yếu tố <strong className="text-black">bắt buộc</strong>.
                  Tải biểu mẫu bên dưới, điền đầy đủ, xuất ra PDF và tải lên.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href="/templates/Mau_CV_Thien_Nguyen.docx"
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-gray-800"
                  >
                    Tải mẫu Word
                  </a>
                  <a
                    href="/templates/Mau_CV_Thien_Nguyen.pdf"
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-gray-50"
                  >
                    Tải mẫu PDF
                  </a>
                </div>
              </div>

              <LabeledField
                label="Tải lên hồ sơ năng lực"
                hint="Upload file PDF đã điền đầy đủ theo biểu mẫu trên. Hỗ trợ PNG, JPG cho ảnh bằng khen/giấy xác nhận."
              >
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) addBankProof(files);
                    };
                    input.click();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:border-black focus-visible:outline-none"
                >
                <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d="M12 16V8m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16.5A3.5 3.5 0 007.5 20h9A3.5 3.5 0 0020 16.5v-.04" strokeLinecap="round" />
                </svg>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">Kéo thả hoặc bấm để tải lên</p>
                <p className="mt-0.5 text-[10px] text-gray-400">PDF, PNG, JPG — tối đa 10MB/tệp</p>
              </div>
              </LabeledField>
              {state.bankProofFiles.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {state.bankProofFiles.map((f) => (
                    <motion.li
                      key={f.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between gap-2 border-b border-gray-100 py-2 text-base text-gray-900"
                    >
                      <span className="truncate font-medium">{f.name}</span>
                      <span className="shrink-0 text-gray-600">{f.sizeKb} KB</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm font-medium text-red-600">Cần ít nhất một tệp.</p>
              )}
            </>
          )}
        </SectionBlock>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="rounded-lg bg-black px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
