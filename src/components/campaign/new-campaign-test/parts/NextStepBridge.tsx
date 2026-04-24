'use client';

/**
 * NextStepBridge — note nhỏ giải thích "tiền sẽ điền ở bước sau".
 *
 * Dùng ở cuối Bước 3, trước thanh nút điều hướng.
 */
export function NextStepBridge({
  message = 'Sau bước này, bạn sẽ phân bổ ngân sách cho từng giai đoạn ở Bước 4 — Dự toán.',
}: {
  message?: string;
}) {
  return (
    <div
      role="note"
      className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs leading-relaxed text-blue-900"
    >
      <InfoIcon />
      <p>{message}</p>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 6.75a.75.75 0 011.5 0v4.25a.75.75 0 01-1.5 0V6.75zM8 4a.9.9 0 100 1.8A.9.9 0 008 4z" />
    </svg>
  );
}
