'use client';

import type { ReactNode } from 'react';

export default function StaffDashboardShell({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-4">


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">{children}</div>
    </section>
  );
}
