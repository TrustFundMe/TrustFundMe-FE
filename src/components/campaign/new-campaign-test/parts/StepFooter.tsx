'use client';

interface StepFooterProps {
  canNext: boolean;
  onPrev?: () => void;
  onNext: () => void;
  nextLabel?: string;
  passMessage?: string;
  failMessage?: string;
}

export default function StepFooter({
  canNext,
  onPrev,
  onNext,
  nextLabel = 'Tiếp tục',
  passMessage = 'Đã hoàn tất — sẵn sàng tiếp tục',
  failMessage = 'Vui lòng hoàn tất các mục bên trên',
}: StepFooterProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
      <div className="min-w-0 flex-1 text-sm font-semibold">
        {canNext ? (
          <span className="text-brand">{passMessage}</span>
        ) : (
          <span className="inline-block max-w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            {failMessage}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
          >
            Quay lại
          </button>
        )}
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
