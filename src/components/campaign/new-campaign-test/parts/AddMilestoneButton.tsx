'use client';

interface AddMilestoneButtonProps {
  count: number;
  recommendedMax?: number;
  hardMax?: number;
  onAdd: () => void;
}

/**
 * AddMilestoneButton — nút "+ Thêm giai đoạn" có 3 trạng thái:
 *   - count < recommendedMax    → cam nổi bật
 *   - count >= recommendedMax   → xám + tooltip cảnh báo
 *   - count >= hardMax          → disabled
 */
export function AddMilestoneButton({
  count,
  recommendedMax = 5,
  hardMax = 8,
  onAdd,
}: AddMilestoneButtonProps) {
  const reachedHardMax = count >= hardMax;
  const overRecommended = count >= recommendedMax;

  const baseCls =
    'mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-3 text-sm font-semibold transition sm:w-auto sm:px-6';
  const stateCls = reachedHardMax
    ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
    : overRecommended
      ? 'border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-50'
      : 'border-orange-200 bg-orange-50/40 text-brand hover:bg-orange-50';

  const title = reachedHardMax
    ? `Tối đa ${hardMax} giai đoạn`
    : overRecommended
      ? `Đang vượt khuyến nghị ${recommendedMax} giai đoạn — cân nhắc gộp lại.`
      : 'Thêm một giai đoạn mới';

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={reachedHardMax}
      title={title}
      className={`${baseCls} ${stateCls}`}
    >
      <span className="text-base leading-none">+</span> Thêm giai đoạn
    </button>
  );
}
