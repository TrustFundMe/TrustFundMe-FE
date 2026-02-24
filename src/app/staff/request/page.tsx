'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import ExpenditureTab from '@/components/staff/request/ExpenditureTab';
import { campaignService } from '@/services/campaignService';
import type {
  CampaignRequest,
  RequestStatus,
} from '@/components/staff/request/RequestTypes';


export default function StaffRequestPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'EXPENDITURE'>('CAMPAIGN');
  const [isLoading, setIsLoading] = useState(false);

  // Campaign States
  const [campaignRows, setCampaignRows] = useState<CampaignRequest[]>([]);
  const [campaignStatus, setCampaignStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();



  // Fetch functions moved to component scope
  const fetchCampaigns = async () => {
    try {
      const allCampaigns = await campaignService.getAll();
      const mappedCampaigns: CampaignRequest[] = allCampaigns.map(c => {
        // Map Backend Status to Frontend Request Status
        let status: RequestStatus = 'PENDING';
        if (c.status === 'ACTIVE' || c.status === 'APPROVED') status = 'APPROVED';
        else if (c.status === 'CANCELLED' || c.status === 'REJECTED' || c.status === 'DELETED') status = 'REJECTED';
        else if (c.status === 'DRAFT') status = 'PENDING';
        else status = c.status as RequestStatus;

        return {
          id: `CAMP_${c.id}`,
          createdAt: c.createdAt || new Date().toISOString(),
          status: status,
          type: 'APPROVE_CAMPAIGN',
          campaignId: c.id,
          campaignTitle: c.title,
          requesterName: `Owner #${c.fundOwnerId}`,
          description: c.description || '',
          category: c.category || '',
          rejectionReason: c.rejectionReason || undefined,
          kycVerified: c.kycVerified,
          bankVerified: c.bankVerified,
          fundOwnerId: c.fundOwnerId,
        };
      });
      setCampaignRows(mappedCampaigns);

      if (mappedCampaigns.length > 0 && !selectedCampaignId) setSelectedCampaignId(mappedCampaigns[0].id);

    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    }
  };

  // Fetch ALL data from BE
  useEffect(() => {
    setIsLoading(true);
    fetchCampaigns().finally(() => setIsLoading(false));
  }, []);

  // Memoized Data
  const filteredCampaigns = useMemo(() => {
    if (campaignStatus === 'ALL') return campaignRows;
    return campaignRows.filter((r) => r.status === campaignStatus);
  }, [campaignRows, campaignStatus]);

  const selectedCampaign = useMemo(
    () => campaignRows.find((r) => r.id === selectedCampaignId) || null,
    [campaignRows, selectedCampaignId]
  );



  // Navigation Helper
  const handleNavigateToVerification = (userId: number, type: 'KYC' | 'BANK') => {
    router.push(`/staff/verification?userId=${userId}`);
    toast.success(`Redirecting to ${type} verification for user #${userId}`);
  };

  // Handlers
  const handleReviewCampaign = async (campaignId?: number, reason?: string, isApprove: boolean = true) => {
    const targetCampaign = campaignId
      ? campaignRows.find(r => r.campaignId === campaignId)
      : selectedCampaign;

    if (!targetCampaign || targetCampaign.type !== 'APPROVE_CAMPAIGN') return;

    try {
      const status = isApprove ? 'APPROVED' : 'REJECTED';
      await campaignService.reviewCampaign(targetCampaign.campaignId, status, reason);
      setCampaignRows((prev) => prev.map((r) => (r.id === targetCampaign.id ? { ...r, status } : r)));
      toast.success(`Campaign ${isApprove ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Failed to review campaign:', error);
      toast.error('Failed to update campaign status');
    }
  };



  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Folder Tabs Headers */}
      <div className="flex items-end px-6 gap-2 h-14">
        <button
          onClick={() => setActiveTab('CAMPAIGN')}
          className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeTab === 'CAMPAIGN'
            ? 'bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
            : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
            }`}
        >
          <div className="flex items-center gap-2">
            <Megaphone className={`h-4 w-4 ${activeTab === 'CAMPAIGN' ? 'text-[#db5945]' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="whitespace-nowrap">Campaign Requests</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'CAMPAIGN' ? 'bg-[#db5945]/10 text-[#db5945]' : 'bg-gray-300 text-gray-600'
              }`}>
              {campaignRows.length}
            </span>
          </div>
          {activeTab === 'CAMPAIGN' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
        </button>

        <button
          onClick={() => setActiveTab('EXPENDITURE')}
          className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeTab === 'EXPENDITURE'
            ? 'bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
            : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
            }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className={`h-4 w-4 ${activeTab === 'EXPENDITURE' ? 'text-[#db5945]' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="whitespace-nowrap">Expenditure Requests</span>

          </div>
          {activeTab === 'EXPENDITURE' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
        </button>
      </div>

      {/* Folder Body Container */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {activeTab === 'CAMPAIGN' ? (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3 flex-shrink-0">
                {[
                  { label: 'Tổng cộng', value: campaignRows.length, color: 'from-[#446b5f] to-[#6a8d83]' },
                  { label: 'Chờ duyệt', value: campaignRows.filter(r => r.status === 'PENDING').length, color: 'from-[#db5945] to-[#f19082]' },
                  { label: 'Đã duyệt', value: campaignRows.filter(r => r.status === 'APPROVED').length, color: 'from-[#446b5f] to-[#5a8075]' },
                  { label: 'Từ chối', value: campaignRows.filter(r => r.status === 'REJECTED').length, color: 'from-gray-500 to-gray-400' },
                ].map(s => (
                  <div key={s.label} className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white overflow-hidden`}>
                    <span className="text-white/70 text-xs font-medium block mb-1">{s.label}</span>
                    <p className="text-2xl font-black relative z-10">{s.value}</p>
                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0,20 C40,35 80,5 120,20 C160,35 180,10 200,20 L200,40 L0,40 Z" fill="white" fillOpacity="0.1" />
                      <path d="M0,28 C50,15 100,38 150,25 C170,20 185,30 200,28 L200,40 L0,40 Z" fill="white" fillOpacity="0.05" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Campaign Filter Bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCampaignStatus(s)}
                    className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${campaignStatus === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945]'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-hidden">
                <div className="lg:col-span-8 overflow-hidden flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Campaign Requests</h2>
                    <span className="text-xs font-medium text-gray-400">{filteredCampaigns.length} items</span>
                  </div>
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
                    <RequestTable
                      rows={filteredCampaigns}
                      selectedId={selectedCampaignId}
                      onSelect={(r) => setSelectedCampaignId(r.id)}
                      columns={[
                        {
                          key: 'campaign',
                          title: 'Campaign',
                          render: (r: CampaignRequest) => (
                            <div>
                              <div className="font-semibold text-gray-900 line-clamp-1">{r.campaignTitle}</div>
                              <div className="text-[10px] text-gray-500">ID: {r.campaignId}</div>
                            </div>
                          ),
                        },
                        {
                          key: 'category',
                          title: 'Category',
                          render: (r: CampaignRequest) => <span className="text-gray-700">{r.category || '-'}</span>,
                        },
                        {
                          key: 'requester',
                          title: 'Requester',
                          render: (r: CampaignRequest) => <span className="text-gray-700">{r.requesterName}</span>,
                        },
                        {
                          key: 'kyc',
                          title: 'KYC',
                          render: (r: CampaignRequest) => (
                            r.kycVerified ? (
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToVerification(r.fundOwnerId, 'KYC');
                                }}
                                className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 hover:bg-red-100 transition-colors"
                              >
                                Missing
                              </button>
                            )
                          ),
                        },
                        {
                          key: 'bank',
                          title: 'Bank',
                          render: (r: CampaignRequest) => (
                            r.bankVerified ? (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToVerification(r.fundOwnerId, 'BANK');
                                }}
                                className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 hover:bg-red-100 transition-colors"
                              >
                                Missing
                              </button>
                            )
                          ),
                        },
                        {
                          key: 'status',
                          title: 'Status',
                          render: (r: CampaignRequest) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : r.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {r.status}
                            </span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 overflow-auto pb-4">
                  <RequestDetailPanel
                    request={selectedCampaign}
                    title={selectedCampaign ? `Campaign · #${selectedCampaign.campaignId}` : 'Request details'}
                    fields={[
                      { label: 'Created at', value: selectedCampaign?.createdAt },
                      { label: 'Campaign', value: selectedCampaign?.campaignTitle },
                      { label: 'Owner', value: selectedCampaign?.requesterName },
                      { label: 'Category', value: selectedCampaign?.category || '-' },
                      { label: 'Description', value: selectedCampaign?.description || '-' },
                    ]}
                    approveDisabled={selectedCampaign ? (!selectedCampaign.kycVerified || !selectedCampaign.bankVerified) : false}
                    rejectDisabled={selectedCampaign ? (!selectedCampaign.kycVerified || !selectedCampaign.bankVerified) : false}
                    approveDisabledReason={selectedCampaign && (!selectedCampaign.kycVerified || !selectedCampaign.bankVerified)
                      ? "Please complete KYC and Bank Account verification before approving or rejecting this campaign"
                      : ""
                    }
                    rejectDisabledReason={selectedCampaign && (!selectedCampaign.kycVerified || !selectedCampaign.bankVerified)
                      ? "Please complete KYC and Bank Account verification before approving or rejecting this campaign"
                      : ""
                    }
                    actionLabel={selectedCampaign && (!selectedCampaign.kycVerified || !selectedCampaign.bankVerified)
                      ? "Verify KYC & Bank Now"
                      : ""
                    }
                    onActionClick={() => {
                      if (selectedCampaign) {
                        const type = !selectedCampaign.kycVerified ? 'KYC' : 'BANK';
                        handleNavigateToVerification(selectedCampaign.fundOwnerId, type);
                      }
                    }}
                    onApprove={(reason) => handleReviewCampaign(selectedCampaign?.campaignId, reason, true)}
                    onReject={(reason) => handleReviewCampaign(selectedCampaign?.campaignId, reason, false)}
                  />
                </div>
              </div>
            </>
          ) : (
            <ExpenditureTab />
          )}
        </div>
      </div>
    </div>
  );
}
