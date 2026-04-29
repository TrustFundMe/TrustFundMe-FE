'use client';

import { NewCampaignTestState } from './types';

interface Props {
  state: NewCampaignTestState;
  budgetTotal: number;
  milestoneTotal: number;
  onClose: () => void;
  fullScreen: boolean;
}

export default function CampaignPreviewPanel({ state, budgetTotal, milestoneTotal, onClose, fullScreen }: Props) {
  const target = state.campaignCore.targetAmount;
  const budgetPercent = target > 0 ? (budgetTotal / target) * 100 : 0;
  const raisedMock = Math.min(24000000, target * 0.08);
  const pct = target > 0 ? (raisedMock / target) * 100 : 0;
  const coverSrc = state.campaignCore.coverImageUrl || 'https://picsum.photos/1200/675';

  const containerClass = fullScreen
    ? 'max-h-[min(92dvh,900px)] w-full max-w-[min(1100px,96vw)] overflow-y-auto'
    : 'max-h-[min(88dvh,820px)] w-full max-w-[min(960px,96vw)] overflow-y-auto';

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
        aria-label="Đóng lớp nền"
      />
      <div
        className={`relative z-10 ${containerClass} rounded-[1.5rem] bg-white p-5 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.28)] ring-1 ring-zinc-200/80 md:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Nhà tài trợ thấy</p>
            <p className="mt-1 text-sm text-zinc-600">Bản xem thử, không công bố công khai khi ở chế độ mô phỏng.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Đóng
          </button>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-6">
          <div className="md:w-[min(44%,380px)] md:shrink-0">
            <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-200/90">
              <div className="aspect-video w-full bg-zinc-100">
                <img src={coverSrc} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold leading-snug text-zinc-950 md:text-xl">
                {state.campaignCore.title || 'Tên chiến dịch'}
              </h3>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-700 md:line-clamp-5">
                {state.campaignCore.objective || 'Mục tiêu gây quỹ sẽ hiển thị tại đây.'}
              </p>
            </div>

            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full bg-brand transition-transform" style={{ width: `${Math.min(100, pct).toFixed(0)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">
                Đã huy động mô phỏng:{' '}
                <span className="font-medium text-zinc-950">{raisedMock.toLocaleString('vi-VN')} đ</span> /{' '}
                {target.toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Metric label="Dự toán" value={`${budgetTotal.toLocaleString('vi-VN')} đ (${budgetPercent.toFixed(0)}%)`} />
              <Metric
                label="Milestones"
                value={state.fundMode === 'FLEXIBLE_CASH' ? 'N/A' : `${milestoneTotal.toLocaleString('vi-VN')} đ`}
              />
            </div>

            <div className="rounded-xl bg-zinc-50/90 p-3 text-xs text-zinc-950 ring-1 ring-zinc-100">
              Chính sách mục tiêu: chiến dịch có thể vượt mục tiêu trong phạm vi mục đích công bố; phần vượt được công khai
              cách phân bổ theo nội bộ mô phỏng nền tảng.
            </div>

            <div className="mt-auto">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Các mốc giải ngân (ngang)</p>
              <div className="mt-2 overflow-x-auto pb-1">
                <div className="flex min-w-0 items-stretch gap-0">
                  {state.milestones.length === 0 ? (
                    <p className="text-xs text-zinc-600">Không dùng milestone (quỹ linh hoạt) hoặc thêm ở bước trước.</p>
                  ) : (
                    state.milestones.map((m, index) => {
                      const milSum = (m.categories || []).reduce((sum, cat) => {
                        return sum + (cat.items || []).reduce((itemSum, item) => {
                          return itemSum + (item.expectedPrice || 0) * (item.expectedQuantity || 0);
                        }, 0);
                      }, 0);
                      return (
                        <div key={m.id} className="flex min-w-0 items-center">
                          <div className="w-40 shrink-0 rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-2.5">
                            <p className="line-clamp-2 text-xs font-medium text-zinc-950">{m.title}</p>
                            <p className="mt-1 text-[11px] text-zinc-600">{milSum.toLocaleString('vi-VN')} đ</p>
                          </div>
                          {index < state.milestones.length - 1 ? (
                            <div className="mx-1 h-px w-5 shrink-0 self-center bg-zinc-300" />
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-0.5 rounded-xl bg-white px-3 py-2.5 text-xs ring-1 ring-zinc-200/90">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-zinc-950">{value}</p>
    </div>
  );
}
