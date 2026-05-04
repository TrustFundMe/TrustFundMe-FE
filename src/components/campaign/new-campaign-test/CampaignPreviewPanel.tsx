'use client';

import { NewCampaignTestState } from './types';

interface Props {
  state: NewCampaignTestState;
  budgetTotal: number;
  milestoneTotal: number;
  onClose: () => void;
  fullScreen: boolean;
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN');
}

function formatDateVi(date?: string): string {
  if (!date) return '—';
  const parts = date.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return date;
}

function CircularProgress({ value }: { value: number }) {
  const size = 84;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(17,24,39,0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ff5e14"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-slate-800">
          {progress}%
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-bold leading-tight text-slate-900">Tiến trình gây quỹ</div>
        <div className="text-xs text-slate-500">Trạng thái mô phỏng</div>
      </div>
    </div>
  );
}

export default function CampaignPreviewPanel({ state, budgetTotal, milestoneTotal, onClose, fullScreen }: Props) {
  const target = milestoneTotal > 0 ? milestoneTotal : state.campaignCore.targetAmount;
  const raisedMock = Math.min(24000000, target * 0.08);
  const pct = target > 0 ? Math.round((raisedMock / target) * 100) : 0;
  const coverSrc = state.campaignCore.coverImageUrl || '';
  const milestones = state.milestones;

  const containerClass = fullScreen
    ? 'max-h-[min(94dvh,960px)] w-full max-w-[min(1140px,96vw)] overflow-y-auto'
    : 'max-h-[min(90dvh,880px)] w-full max-w-[min(1060px,96vw)] overflow-y-auto';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước giao diện nhà tài trợ"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default bg-zinc-950/40 transition-opacity"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div
        className={`relative z-10 ${containerClass} rounded-2xl bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.28)] ring-1 ring-zinc-200/80`}
      >
        {/* Header bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/95 px-5 py-3 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nhà tài trợ sẽ thấy</span>
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Bản xem thử</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition"
          >
            Đóng ✕
          </button>
        </div>

        <div className="p-5 md:p-6">
          {/* 2-column layout like campaign-detail */}
          <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr] items-start">
            {/* ── Left column: Header + Content ── */}
            <div className="min-w-0">
              {/* Category badge */}
              {state.campaignCore.category && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800">
                    {state.campaignCore.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-extrabold leading-tight text-zinc-950 md:text-3xl" style={{ fontFamily: 'var(--font-dm-sans, system-ui)', lineHeight: 1.15 }}>
                {state.campaignCore.title || 'Tên chiến dịch'}
              </h2>

              {/* Cover Image */}
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-zinc-200/80">
                {coverSrc ? (
                  <img src={coverSrc} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-zinc-100">
                    <svg className="h-12 w-12 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Creator mock */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-500">
                  ?
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Người tạo chiến dịch</p>
                  <p className="text-xs text-zinc-500">Chờ xác minh KYC</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-sm leading-relaxed text-zinc-700" style={{ fontFamily: 'var(--font-dm-sans, system-ui)' }}>
                  {state.campaignCore.objective || 'Mục tiêu gây quỹ sẽ hiển thị tại đây.'}
                </p>
              </div>

              {/* Milestone timeline */}
              {milestones.length > 0 && (
                <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-4">
                  <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-zinc-400">
                    Các đợt giải ngân
                  </h3>
                  <div className="space-y-3">
                    {milestones.map((m, idx) => {
                      const milSum = (m.categories || []).reduce((sum, cat) =>
                        sum + (cat.items || []).reduce((s, item) =>
                          s + (item.expectedPrice || 0) * (item.expectedQuantity || 0), 0
                        ), 0
                      );
                      return (
                        <div key={m.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                              {idx + 1}
                            </span>
                            {idx < milestones.length - 1 && (
                              <div className="mt-1 h-8 w-px bg-zinc-200" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-zinc-900">{m.title || `Đợt ${idx + 1}`}</p>
                              <span className="whitespace-nowrap text-sm font-bold tabular-nums text-orange-600">
                                {formatVnd(milSum)} đ
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                              <span>{formatDateVi(m.startDate)} → {formatDateVi(m.endDate)}</span>
                              <span>• {(m.categories || []).length} danh mục</span>
                            </div>
                            {/* Category list */}
                            {m.categories && m.categories.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {m.categories.map((cat) => (
                                  <div key={cat.id} className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                    <span className="font-medium text-zinc-600">{cat.name || '(Chưa đặt tên)'}</span>
                                    <span className="text-zinc-400">— {cat.items.length} hạng mục</span>
                                    <span className="font-bold tabular-nums text-orange-500">
                                      {formatVnd(cat.items.reduce((s, i) => s + (i.expectedPrice || 0) * (i.expectedQuantity || 0), 0))} đ
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column: Donate card mock ── */}
            <div className="lg:sticky lg:top-4">
              <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                {/* Circular progress */}
                <CircularProgress value={pct} />

                {/* Goal amount */}
                <div className="mt-4 rounded-xl bg-zinc-50 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mục tiêu</span>
                    <span className="text-lg font-extrabold tabular-nums text-zinc-900">{formatVnd(target)} đ</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div className="h-full rounded-full bg-[#ff5e14] transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Đã huy động (mô phỏng):{' '}
                    <span className="font-bold text-zinc-800">{formatVnd(raisedMock)} đ</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tổng đợt</p>
                    <p className="mt-0.5 text-sm font-extrabold text-zinc-900">{milestones.length} đợt</p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Thời gian</p>
                    <p className="mt-0.5 text-sm font-extrabold text-zinc-900">
                      {milestones.length > 0 ? formatDateVi(milestones[0]?.startDate) : '—'}
                    </p>
                  </div>
                </div>

                {/* Fake donate section */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex gap-2">
                    {[50000, 100000, 200000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="flex-1 rounded-full border border-zinc-200 bg-white py-1.5 text-[11px] font-bold tabular-nums text-zinc-700 hover:bg-zinc-50 transition"
                        disabled
                      >
                        {(amt / 1000)}k
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-400"
                      placeholder="Nhập số tiền..."
                    />
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1.5 rounded-full bg-[#ff5e14] px-5 py-2.5 text-sm font-bold text-white opacity-80"
                    >
                      Ủng hộ
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Fake recent donors */}
                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <p className="mb-2 text-xs font-bold text-zinc-400">Nhà tài trợ gần đây</p>
                  <div className="space-y-2.5">
                    {['Nguyễn Văn A', 'Trần Thị B'].map((name, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-500">
                          {name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-800">{name}</p>
                          <p className="text-[10px] text-zinc-400">Vừa xong</p>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-[#ff5e14]">
                          {formatVnd(i === 0 ? 200000 : 100000)} đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
