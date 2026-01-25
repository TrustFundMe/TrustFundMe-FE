'use client';

import type { ReactNode } from 'react';

export default function StaffDashboardCard({
  title,
  right,
  children,
  className,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className || ''}`}> 
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="text-xs font-semibold text-gray-800">{title}</div>
        {right}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
