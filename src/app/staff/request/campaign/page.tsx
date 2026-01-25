'use client';

import { useMemo, useState } from 'react';
import StaffDashboardCard from '@/components/staff/StaffDashboardCard';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import type { CampaignRequest, CampaignRequestType, RequestStatus } from '@/components/staff/request/RequestTypes';
import { mockCampaignRequests } from '@/components/staff/request/mock';

const typeLabel: Record<CampaignRequestType, string> = {
  WITHDRAWAL: 'Withdrawal',
  SUSPEND_CAMPAIGN: 'Suspend campaign',
  RESUME_CAMPAIGN: 'Resume campaign',
  CREATE_VOTING: 'Create voting',
};

export default function StaffCampaignRequestsPage() {
  const [rows, setRows] = useState<CampaignRequest[]>(mockCampaignRequests);
  const [status, setStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | undefined>(rows[0]?.id);

  const filtered = useMemo(() => {
    if (status === 'ALL') return rows;
    return rows.filter((r) => r.status === status);
  }, [rows, status]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) || null,
    [rows, selectedId]
  );

  const updateStatus = (id: string, next: RequestStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  return (
    <section className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-gray-900">Campaign requests</div>
        <div className="mt-1 text-sm text-gray-500">Review and process campaign-related requests.</div>
      </div>

      <div className="flex items-center gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${
              status === s
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <StaffDashboardCard
            title="Incoming requests"
            right={<div className="text-xs font-semibold text-gray-500">{filtered.length} items</div>}
          >
            <RequestTable
              rows={filtered}
              selectedId={selectedId}
              onSelect={(r) => setSelectedId(r.id)}
              columns={[
                {
                  key: 'type',
                  title: 'Type',
                  render: (r) => <span className="font-semibold text-gray-900">{typeLabel[r.type]}</span>,
                },
                {
                  key: 'campaign',
                  title: 'Campaign',
                  render: (r) => (
                    <div>
                      <div className="font-semibold text-gray-900">#{r.campaignId}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{r.campaignTitle}</div>
                    </div>
                  ),
                },
                {
                  key: 'requester',
                  title: 'Requester',
                  render: (r) => <span className="text-gray-700">{r.requesterName}</span>,
                },
                {
                  key: 'createdAt',
                  title: 'Created',
                  render: (r) => <span className="text-gray-500">{r.createdAt}</span>,
                },
              ]}
            />
          </StaffDashboardCard>
        </div>

        <div className="lg:col-span-4">
          <RequestDetailPanel
            request={selected}
            title={selected ? typeLabel[selected.type] : 'Request details'}
            fields={[
              { label: 'Created at', value: selected?.createdAt },
              { label: 'Campaign', value: selected ? `#${selected.campaignId} · ${selected.campaignTitle}` : undefined },
              { label: 'Requester', value: selected?.requesterName },
              { label: 'Amount', value: selected?.amount ? `$${selected.amount.toLocaleString()}` : '-' },
              { label: 'Note', value: selected?.note || '-' },
            ]}
            onApprove={(id) => updateStatus(id, 'APPROVED')}
            onReject={(id) => updateStatus(id, 'REJECTED')}
          />
        </div>
      </div>
    </section>
  );
}
