'use client';

import type { ReactNode } from 'react';

export default function StaffDashboardShell({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Hey, Staff</div>
          <div className="text-xs text-gray-500">Monday, 24 February 2024</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            This Month
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Compare: Last Month
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Edit Widget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">{children}</div>
    </section>
  );
}
