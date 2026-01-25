'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export type RequestCategoryCardProps = {
  title: string;
  description: string;
  href: string;
  count: number;
  icon: LucideIcon;
  tone?: 'default' | 'amber' | 'sky' | 'emerald' | 'rose';
};

const toneStyles: Record<NonNullable<RequestCategoryCardProps['tone']>, { bg: string; icon: string; badge: string }> = {
  default: { bg: 'bg-gray-50', icon: 'text-gray-700', badge: 'bg-gray-900 text-white' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-700', badge: 'bg-amber-600 text-white' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-700', badge: 'bg-sky-600 text-white' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-700', badge: 'bg-emerald-600 text-white' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-700', badge: 'bg-rose-600 text-white' },
};

export default function RequestCategoryCard({
  title,
  description,
  href,
  count,
  icon: Icon,
  tone = 'default',
}: RequestCategoryCardProps) {
  const styles = toneStyles[tone];

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.bg}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-0.5 text-xs text-gray-500">{description}</div>
          </div>
        </div>

        <div className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold ${styles.badge}`}>
          {count}
        </div>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-1 w-0 rounded-full bg-gray-900 transition-all duration-300 group-hover:w-1/2" />
      </div>
    </Link>
  );
}
