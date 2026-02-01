'use client';

import { useMemo, useState } from 'react';
import { Megaphone, Flag } from 'lucide-react';
import StaffDashboardCard from '@/components/staff/StaffDashboardCard';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import type {
  CampaignRequest,
  CampaignRequestType,
  FlagRequest,
  FlagTargetType,
  RequestStatus,
} from '@/components/staff/request/RequestTypes';
import { mockCampaignRequests, mockFlagRequests } from '@/components/staff/request/mock';

type TabType = 'CAMPAIGN' | 'FLAG';

const typeLabel: Record<CampaignRequestType, string> = {
  WITHDRAWAL: 'Withdrawal',
  SUSPEND_CAMPAIGN: 'Suspend campaign',
  RESUME_CAMPAIGN: 'Resume campaign',
  CREATE_VOTING: 'Create voting',
};

const targetLabel: Record<FlagTargetType, string> = {
  POST: 'Post',
  CAMPAIGN: 'Campaign',
  COMMENT: 'Comment',
};

export default function StaffRequestPage() {
  const [activeTab, setActiveTab] = useState<TabType>('CAMPAIGN');

  // Campaign States
  const [campaignRows, setCampaignRows] = useState<CampaignRequest[]>(mockCampaignRequests);
  const [campaignStatus, setCampaignStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(campaignRows[0]?.id);

  // Flag States
  const [flagRows, setFlagRows] = useState<FlagRequest[]>(mockFlagRequests);
  const [flagStatus, setFlagStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedFlagId, setSelectedFlagId] = useState<string | undefined>(flagRows[0]?.id);

  // Memoized Data
  const filteredCampaigns = useMemo(() => {
    if (campaignStatus === 'ALL') return campaignRows;
    return campaignRows.filter((r) => r.status === campaignStatus);
  }, [campaignRows, campaignStatus]);

  const selectedCampaign = useMemo(
    () => campaignRows.find((r) => r.id === selectedCampaignId) || null,
    [campaignRows, selectedCampaignId]
  );

  const filteredFlags = useMemo(() => {
    if (flagStatus === 'ALL') return flagRows;
    return flagRows.filter((r) => r.status === flagStatus);
  }, [flagRows, flagStatus]);

  const selectedFlag = useMemo(
    () => flagRows.find((r) => r.id === selectedFlagId) || null,
    [flagRows, selectedFlagId]
  );

  // Handlers
  const handleUpdateCampaignStatus = (id: string, next: RequestStatus) => {
    setCampaignRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  const handleUpdateFlagStatus = (id: string, next: RequestStatus) => {
    setFlagRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Folder Tabs Headers */}
      <div className="flex items-end px-6 gap-2 h-14">
        <button
          onClick={() => setActiveTab('CAMPAIGN')}
          className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeTab === 'CAMPAIGN'
            ? 'bg-white text-red-600 rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
            : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
            }`}
        >
          <div className="flex items-center gap-2">
            <Megaphone className={`h-4 w-4 ${activeTab === 'CAMPAIGN' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="whitespace-nowrap">Campaign Requests</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'CAMPAIGN' ? 'bg-red-50 text-red-600' : 'bg-gray-300 text-gray-600'
              }`}>
              {campaignRows.length}
            </span>
          </div>
          {/* Connector to merge tab with body */}
          {activeTab === 'CAMPAIGN' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
        </button>

        <button
          onClick={() => setActiveTab('FLAG')}
          className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeTab === 'FLAG'
            ? 'bg-white text-red-600 rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
            : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
            }`}
        >
          <div className="flex items-center gap-2">
            <Flag className={`h-4 w-4 ${activeTab === 'FLAG' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="whitespace-nowrap">Flag Reports</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'FLAG' ? 'bg-red-50 text-red-600' : 'bg-gray-300 text-gray-600'
              }`}>
              {flagRows.length}
            </span>
          </div>
          {/* Connector to merge tab with body */}
          {activeTab === 'FLAG' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
        </button>
      </div>

      {/* Folder Body Container */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {activeTab === 'CAMPAIGN' ? (
            <>
              {/* Filter Bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCampaignStatus(s)}
                    className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${campaignStatus === s
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Grid Layout - Full Height */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-hidden">
                <div className="lg:col-span-8 overflow-hidden flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Incoming Requests</h2>
                    <span className="text-xs font-medium text-gray-400">{filteredCampaigns.length} items</span>
                  </div>
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
                    <RequestTable
                      rows={filteredCampaigns}
                      selectedId={selectedCampaignId}
                      onSelect={(r) => setSelectedCampaignId(r.id)}
                      columns={[
                        {
                          key: 'type',
                          title: 'Type',
                          render: (r) => (
                            <span className="font-semibold text-gray-900">{typeLabel[r.type]}</span>
                          ),
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
                  </div>
                </div>

                <div className="lg:col-span-4 overflow-auto pb-4">
                  <RequestDetailPanel
                    request={selectedCampaign}
                    title={selectedCampaign ? typeLabel[selectedCampaign.type] : 'Request details'}
                    fields={[
                      { label: 'Created at', value: selectedCampaign?.createdAt },
                      {
                        label: 'Campaign',
                        value: selectedCampaign ? `#${selectedCampaign.campaignId} · ${selectedCampaign.campaignTitle}` : undefined,
                      },
                      { label: 'Requester', value: selectedCampaign?.requesterName },
                      { label: 'Amount', value: selectedCampaign?.amount ? `$${selectedCampaign.amount.toLocaleString()}` : '-' },
                      { label: 'Note', value: selectedCampaign?.note || '-' },
                    ]}
                    onApprove={(id) => handleUpdateCampaignStatus(id, 'APPROVED')}
                    onReject={(id) => handleUpdateCampaignStatus(id, 'REJECTED')}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFlagStatus(s)}
                    className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${flagStatus === s
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Grid Layout - Full Height */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-hidden">
                <div className="lg:col-span-8 overflow-hidden flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Incoming Flag Reports</h2>
                    <span className="text-xs font-medium text-gray-400">{filteredFlags.length} items</span>
                  </div>
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
                    <RequestTable
                      rows={filteredFlags}
                      selectedId={selectedFlagId}
                      onSelect={(r) => setSelectedFlagId(r.id)}
                      columns={[
                        {
                          key: 'targetType',
                          title: 'Target',
                          render: (r) => (
                            <span className="font-semibold text-gray-900">{targetLabel[r.targetType]}</span>
                          ),
                        },
                        {
                          key: 'reason',
                          title: 'Reason',
                          render: (r) => (
                            <div>
                              <div className="font-semibold text-gray-900 line-clamp-1">{r.reason}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{r.previewText || '-'}</div>
                            </div>
                          ),
                        },
                        {
                          key: 'reporter',
                          title: 'Reporter',
                          render: (r) => <span className="text-gray-700">{r.reporterName}</span>,
                        },
                        {
                          key: 'createdAt',
                          title: 'Created',
                          render: (r) => <span className="text-gray-500">{r.createdAt}</span>,
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 overflow-auto pb-4">
                  <RequestDetailPanel
                    request={selectedFlag}
                    title={selectedFlag ? `Flag · ${targetLabel[selectedFlag.targetType]}` : 'Report details'}
                    fields={[
                      { label: 'Created at', value: selectedFlag?.createdAt },
                      {
                        label: 'Target',
                        value: selectedFlag ? `${targetLabel[selectedFlag.targetType]} · ${selectedFlag.targetId}` : undefined,
                      },
                      { label: 'Reporter', value: selectedFlag?.reporterName },
                      { label: 'Reason', value: selectedFlag?.reason },
                      { label: 'Preview', value: selectedFlag?.previewText || '-' },
                    ]}
                    onApprove={(id) => handleUpdateFlagStatus(id, 'APPROVED')}
                    onReject={(id) => handleUpdateFlagStatus(id, 'REJECTED')}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
