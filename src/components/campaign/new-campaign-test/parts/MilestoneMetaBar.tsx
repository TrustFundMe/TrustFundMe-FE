'use client';

interface MilestoneMetaBarProps {
  count: number;
  /** Khuyến nghị số giai đoạn min/max. Mặc định 2–5. */
  recommendedMin?: number;
  recommendedMax?: number;
  /** Giới hạn cứng tối đa (mặc định 8). */
  hardMax?: number;
  /** Tất cả giai đoạn đã hợp lệ chưa? */
  valid: boolean;
}

/**
 * MilestoneMetaBar — thanh chip tóm tắt thay cho thanh progress tổng cũ.
 *
 *   [3 giai đoạn]   [Khuyến nghị 2–5]   [✓ Hợp lệ]
 */
export function MilestoneMetaBar({
  count,
  recommendedMin = 2,
  recommendedMax = 5,
  hardMax = 8,
  valid,
}: MilestoneMetaBarProps) {
  const inRecommended = count >= recommendedMin && count <= recommendedMax;
  const overHardMax = count > hardMax;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-brand ring-1 ring-orange-200">
        <span className="tabular-nums">{count}</span> giai đoạn
      </span>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${
          inRecommended
            ? 'bg-gray-50 text-gray-600 ring-gray-200'
            : overHardMax
              ? 'bg-red-50 text-red-700 ring-red-200'
              : 'bg-amber-50 text-amber-700 ring-amber-200'
        }`}
      >
        Khuyến nghị {recommendedMin}–{recommendedMax}
      </span>

      {valid ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckIcon /> Hợp lệ
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 ring-1 ring-amber-200">
          <WarnIcon /> Cần chỉnh
        </span>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M7.05 2.5a1.1 1.1 0 011.9 0l5.4 9.35A1.1 1.1 0 0113.4 13.6H2.6a1.1 1.1 0 01-.95-1.75L7.05 2.5zM8 6.4a.7.7 0 00-.7.7v2.6a.7.7 0 001.4 0V7.1A.7.7 0 008 6.4zm0 5.5a.85.85 0 100-1.7.85.85 0 000 1.7z" />
    </svg>
  );
}
