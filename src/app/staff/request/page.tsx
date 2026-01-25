'use client';

import RequestCategoryCard from '@/components/staff/request/RequestCategoryCard';
import { Flag, ShieldCheck, Megaphone } from 'lucide-react';

const categories = [
  {
    title: 'Campaign requests',
    description: 'Withdrawals, suspend/resume, voting, and campaign actions',
    href: '/staff/request/campaign',
    count: 8,
    icon: Megaphone,
    tone: 'sky' as const,
  },
  {
    title: 'Flag reports',
    description: 'Review content/campaign flags and decide actions',
    href: '/staff/request/flag',
    count: 3,
    icon: Flag,
    tone: 'rose' as const,
  },
  {
    title: 'KYC & verification',
    description: 'Fund-owner KYC, bank verification and document checks',
    href: '/staff/request/kyc',
    count: 5,
    icon: ShieldCheck,
    tone: 'emerald' as const,
  },
];

export default function StaffRequestHomePage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-gray-900">Requests</div>
        <div className="mt-1 text-sm text-gray-500">
          Centralize all incoming staff requests by topic.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <RequestCategoryCard key={c.href} {...c} />
        ))}
      </div>
    </section>
  );
}
