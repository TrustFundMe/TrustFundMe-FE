'use client';

import { NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export default function Step4BankTerms({ state, onPatch, onPrev, onNext, canNext }: Props) {
  return (
    <div className="rounded-3xl border border-red-200 bg-white p-6">
      <h2 className="text-xl font-black text-black">Step 5 - Tài khoản nhận tiền</h2>
      <p className="mt-1 text-sm font-bold text-black">Xác nhận tài khoản thiện nguyện trước khi ký điều khoản.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Input
          label="Tên chủ tài khoản"
          value={state.bankInfo.accountHolderName}
          onChange={(v) => onPatch({ bankInfo: { ...state.bankInfo, accountHolderName: v.toUpperCase() } })}
        />
        <Input
          label="Số tài khoản"
          value={state.bankInfo.accountNumber}
          onChange={(v) => onPatch({ bankInfo: { ...state.bankInfo, accountNumber: v } })}
        />
        <Input
          label="Ngân hàng"
          value={state.bankInfo.bankName}
          onChange={(v) => onPatch({ bankInfo: { ...state.bankInfo, bankName: v } })}
        />
        <Input
          label="Chi nhánh"
          value={state.bankInfo.branch}
          onChange={(v) => onPatch({ bankInfo: { ...state.bankInfo, branch: v } })}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/30 p-4">
        <p className="text-xs font-black text-red-600">
          Rule cứng: tên chủ tài khoản phải match 100% với hồ sơ KYC. Không đúng thì không cho tiếp tục.
        </p>
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onPrev} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-black">
          Quay lại
        </button>
        <button type="button" disabled={!canNext} onClick={onNext} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-black/20">Tiếp tục tới ToS</button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-red-600">{label}</p>
      <input
        className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
