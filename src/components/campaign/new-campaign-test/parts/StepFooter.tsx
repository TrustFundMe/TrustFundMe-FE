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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
      <div className="flex items-center gap-2 text-xs font-semibold">
        {canNext ? (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </span>
            <span className="text-brand">{passMessage}</span>
          </>
        ) : (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
            </span>
            <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">{failMessage}</span>
          </>
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
