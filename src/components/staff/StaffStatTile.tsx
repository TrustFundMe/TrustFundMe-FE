'use client';

import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
  title: string;
  value: string;
  deltaText: string;
  deltaDirection: 'up' | 'down';
  className?: string;
  icon?: ReactNode;
};

export default function StaffStatTile({
  title,
  value,
  deltaText,
  deltaDirection,
  className,
  icon,
}: Props) {
  const isUp = deltaDirection === 'up';

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm ${className || ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-500">{title}</div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-gray-900">{value}</div>
        </div>
        <div className="shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
            {icon || <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ring-1 ${
            isUp
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
              : 'bg-rose-50 text-rose-700 ring-rose-100'
          }`}
        >
          {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {deltaText}
        </span>
        <span className="text-gray-500">vs last month</span>
      </div>
    </div>
  );
}
