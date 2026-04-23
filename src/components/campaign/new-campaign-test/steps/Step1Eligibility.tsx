'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { decree93SeparateAccountNotice, lawReferences, mockBanks } from '../mockData';
import { CredibilityFile, NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onNext: () => void;
  canNext: boolean;
}

/** Ô nhập dạng hộp — dễ nhận diện vùng bấm và nhập liệu */
const fieldBox =
  'w-full min-h-[52px] rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition duration-150 placeholder:text-gray-400 hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-orange-100';

const bankTriggerBase =
  'flex w-full min-h-[52px] items-center justify-between gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-left text-base text-gray-900 shadow-sm outline-none transition duration-150 hover:border-gray-300 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-orange-100';

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
        <p id={hintId} className="text-xs leading-snug text-gray-500">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function SectionBlock({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-neutral-50/90 p-4 ring-1 ring-gray-100 md:p-5">
      <div className="mb-3 flex items-center gap-3 border-l-4 border-brand pl-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand ring-1 ring-orange-100">
          {step}
        </span>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
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

function LegalInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-info-title"
        >
          <button type="button" className="absolute inset-0 bg-gray-900/50" onClick={onClose} aria-label="Đóng" />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <h2 id="legal-info-title" className="text-lg font-semibold text-gray-900">
                Thông tin pháp lý & SLA
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Đóng"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-gray-900">Tách biệt tài khoản (Nghị định 93/2021/NĐ-CP)</h3>
                <p className="mt-2 text-justify text-sm leading-relaxed text-gray-700">{decree93SeparateAccountNotice}</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-gray-900">Tham chiếu pháp lý</h3>
                <ul className="mt-2 space-y-1.5">
                  {lawReferences.map((law) => (
                    <li key={law} className="text-sm leading-snug text-gray-700">
                      {law}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-gray-900">Thời gian xử lý (mô phỏng)</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Duyệt chủ quỹ: 2–5 ngày làm việc. Duyệt chiến dịch: 1–3 ngày làm việc.
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Step1Eligibility({ state, onPatch, onNext, canNext }: Props) {
  const [bankQuery, setBankQuery] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const bankWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (bankWrapRef.current && !bankWrapRef.current.contains(e.target as Node)) setBankOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const withKycName = (info: NewCampaignTestState['bankInfo']): NewCampaignTestState['bankInfo'] => ({
    ...info,
    accountHolderName: state.kycFullName,
  });

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

  const addBankProof = () => {
    const next: CredibilityFile = {
      id: Math.random().toString(36).slice(2, 9),
      name: `sao-ke-${state.bankProofFiles.length + 1}.pdf`,
      sizeKb: 380 + state.bankProofFiles.length * 20,
    };
    onPatch({ bankProofFiles: [...state.bankProofFiles, next] });
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addBankProof();
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-7">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">Bước 1 — Kiểm tra cổng & tài khoản</h2>
      <p className="mt-1.5 text-base text-gray-700">Xác minh danh tính và tài khoản nhận tiền.</p>

      <div className="mt-5 space-y-4">
        <SectionBlock step="1" title="Định danh & cổng vào">
          {state.kycStatus === 'APPROVED' ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-start gap-3"
              role="status"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <CheckBadgeIcon />
              </span>
              <div>
                <p className="text-base font-semibold text-gray-900">Định danh đã xác minh</p>
                <p className="mt-1 text-base text-gray-800">
                  Tên KYC: <span className="font-semibold">{state.kycFullName}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="text-base text-red-700">KYC chưa đạt. Hoàn tất định danh trước khi tiếp tục.</div>
          )}
        </SectionBlock>

        <SectionBlock step="2" title="Tài khoản ngân hàng nhận tiền">
          <div className="space-y-6">
            <LabeledField
              label="Tên chủ tài khoản"
              hint="Trùng với tên KYC đã xác minh; không chỉnh sửa tại bước này."
            >
              <div
                className="flex min-h-[52px] items-center gap-3 rounded-xl border-2 border-gray-100 bg-gray-50/90 px-4 py-3 text-base font-medium text-gray-900"
                aria-readonly="true"
              >
                <LockIcon />
                <span>{state.kycFullName}</span>
              </div>
            </LabeledField>

            <LabeledField
              id="step1-account-number"
              label="Số tài khoản"
              hint="Bấm vào ô bên dưới và nhập số tài khoản nhận giải ngân (chỉ chữ số)."
            >
              <input
                id="step1-account-number"
                className={fieldBox}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ví dụ: 0123456789"
                value={state.bankInfo.accountNumber}
                onChange={(e) => onPatch({ bankInfo: withKycName({ ...state.bankInfo, accountNumber: e.target.value }) })}
                aria-describedby="step1-account-number-hint"
              />
            </LabeledField>

            <div className="relative" ref={bankWrapRef}>
              <LabeledField
                id="step1-bank-trigger"
                label="Ngân hàng"
                hint="Bấm để mở danh sách và chọn ngân hàng của bạn."
              >
                <button
                  type="button"
                  id="step1-bank-trigger"
                  aria-expanded={bankOpen}
                  aria-describedby="step1-bank-trigger-hint"
                  aria-haspopup="listbox"
                  onClick={() => setBankOpen((o) => !o)}
                  className={`${bankTriggerBase} ${bankOpen ? 'border-brand ring-2 ring-orange-100' : ''}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {selectedBank ? (
                      <img src={selectedBank.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-gray-100" />
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
                  className="absolute left-0 right-0 z-20 mt-2 max-h-56 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg"
                >
                  <div className="border-b border-gray-100 p-2">
                    <input
                      className={`${fieldBox} min-h-0 border-0 py-2 shadow-none ring-0 focus:ring-0`}
                      placeholder="Tìm ngân hàng"
                      value={bankQuery}
                      onChange={(e) => setBankQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto p-1">
                    {filteredBanks.map((b) => {
                      const active = b.code === state.bankInfo.bankCode;
                      return (
                        <li key={b.code}>
                          <button
                            type="button"
                            onClick={() => {
                              onPatch({ bankInfo: withKycName({ ...state.bankInfo, bankCode: b.code, bankName: b.name }) });
                              setBankOpen(false);
                              setBankQuery('');
                            }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${active ? 'bg-orange-50 font-semibold text-brand' : 'text-gray-900 hover:bg-gray-50'}`}
                          >
                            <img src={b.logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
                            <span className="min-w-0 truncate">{b.name}</span>
                          </button>
                        </li>
                      );
                    })}
                    {filteredBanks.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy</li>}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock step="3" title="Thông tin năng lực tài chính">
          <LabeledField
            label="Chứng từ năng lực tài chính"
            hint="Bấm hoặc kéo thả tệp (PDF, ảnh sao kê đã che số dư) vào khung bên dưới."
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
              className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-10 shadow-sm transition-colors hover:border-brand hover:bg-orange-50/50 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100"
            >
            <svg className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M12 16V8m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16.5A3.5 3.5 0 007.5 20h9A3.5 3.5 0 0020 16.5v-.04" strokeLinecap="round" />
            </svg>
            <p className="mt-2 text-base font-semibold text-gray-800">Kéo thả tệp vào đây hoặc bấm để chọn</p>
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
        </SectionBlock>

        <SectionBlock step="4" title="Cam kết pháp lý">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setLegalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition hover:border-brand hover:text-brand"
              aria-expanded={legalOpen}
            >
              <InfoIcon />
              Chi tiết
            </button>
          </div>

          <div className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-2 border-gray-400 text-brand accent-brand focus:ring-2 focus:ring-brand/30"
                checked={state.acknowledgements.legalRead}
                onChange={(e) => onPatch({ acknowledgements: { ...state.acknowledgements, legalRead: e.target.checked } })}
              />
              <span className="text-base leading-relaxed text-gray-900">Tôi đã đọc và hiểu các quy định pháp lý liên quan.</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-2 border-gray-400 text-brand accent-brand focus:ring-2 focus:ring-brand/30"
                checked={state.acknowledgements.slaAccepted}
                onChange={(e) => onPatch({ acknowledgements: { ...state.acknowledgements, slaAccepted: e.target.checked } })}
              />
              <span className="text-base leading-relaxed text-gray-900">Tôi đồng ý thời gian duyệt hồ sơ theo mô tả trong phần Chi tiết.</span>
            </label>
          </div>
        </SectionBlock>
      </div>

      <LegalInfoModal open={legalOpen} onClose={() => setLegalOpen(false)} />

      <div className="mt-10 flex justify-end border-t border-gray-100 pt-8">
        <motion.button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          whileHover={canNext ? { scale: 1.02 } : {}}
          whileTap={canNext ? { scale: 0.97 } : {}}
          className="rounded-full bg-brand px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          Tiếp tục
        </motion.button>
      </div>
    </div>
  );
}
