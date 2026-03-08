'use client';

import type { RequestStatus } from './RequestTypes';

const map: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  PENDING_REVIEW: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  CLOSED: { label: 'Yêu cầu rút tiền', className: 'bg-blue-50 text-blue-700 ring-blue-100' },
  WITHDRAWAL_REQUESTED: { label: 'Yêu cầu rút tiền', className: 'bg-blue-50 text-blue-700 ring-blue-100' },
  REJECTED: { label: 'Từ chối', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
  DISBURSED: { label: 'Đã giải ngân', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  DISABLED: { label: 'Đã vô hiệu hóa', className: 'bg-gray-50 text-gray-700 ring-gray-100' },
};

export default function RequestStatusPill({ status }: { status: RequestStatus }) {
  const config = map[status] || { label: status, className: 'bg-gray-50 text-gray-700 ring-gray-100' };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className
        }`}
    >
      {config.label}
    </span>
  );
}
