'use client';

import type { ReactNode } from 'react';

export default function FormSectionCard({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className || ''}`}>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
