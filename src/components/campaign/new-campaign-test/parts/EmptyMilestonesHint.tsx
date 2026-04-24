'use client';

/**
 * EmptyMilestonesHint — banner gợi ý khi user mới mở Bước 3.
 *
 * Hiển thị khi `milestones.length === 1` và card đầu chưa được điền nhiều,
 * tự ẩn khi user thêm giai đoạn thứ 2 hoặc đã điền card 1.
 */
export function EmptyMilestonesHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900">
      <BulbIcon />
      <p>
        <span className="font-semibold">Một chiến dịch tốt thường có 2–5 giai đoạn rõ ràng.</span>{' '}
        Ví dụ: <em>Khẩn cấp → Mở rộng → Ổn định → Tổng kết</em>.
      </p>
    </div>
  );
}

function BulbIcon() {
  return (
    <svg
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 1.5a4.5 4.5 0 00-3 7.85V11a1 1 0 001 1h4a1 1 0 001-1V9.35A4.5 4.5 0 008 1.5zM6.5 13a.5.5 0 010-1h3a.5.5 0 010 1h-3zm.5 1.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" />
    </svg>
  );
}
