'use client';

import type { RequestStatus } from './RequestTypes';

const map: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export default function RequestStatusPill({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        map[status]
      }`}
    >
      {status}
    </span>
  );
}
