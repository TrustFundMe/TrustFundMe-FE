'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Megaphone, DollarSign, Shield, XCircle, ShieldCheck, History, X, Eye, RefreshCw, HandCoins, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import CampaignNewFlowDetail from '@/components/staff/request/CampaignNewFlowDetail';
import ExpenditureRequestTab from '@/components/staff/request/ExpenditureRequestTab';
import EvidenceTab from '@/components/staff/request/EvidenceTab';
import HistoryTab from '@/components/staff/request/HistoryTab';
import SupportRequestManager from '@/components/staff/support/SupportRequestManager';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import type {
  CampaignRequest,
  RequestStatus,
} from '@/components/staff/request/RequestTypes';


export default function StaffRequestPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-[#f1f5f9] min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5e14] mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest">Đang tải yêu cầu...</p>
        </div>
      </div>
    }>
      <StaffRequestContent />
    </Suspense>
  );
}

function StaffRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'EXPENDITURE' | 'EVIDENCE' | 'HISTORY' | 'SUPPORT'>(
    targetTab === 'EVIDENCE' ? 'EVIDENCE' : targetTab === 'EXPENDITURE' ? 'EXPENDITURE' : targetTab === 'HISTORY' ? 'HISTORY' : targetTab === 'SUPPORT' ? 'SUPPORT' : 'CAMPAIGN'
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const targetId = searchParams.get('targetId');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [users, setUsers] = useState<Map<number, UserInfo>>(new Map());

  // Campaign States
  const [campaignRows, setCampaignRows] = useState<any[]>([]);
  const [campaignStatus, setCampaignStatus] = useState<RequestStatus | 'ALL' | 'DISABLED'>('ALL');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [sentCommitmentIds, setSentCommitmentIds] = useState<Set<number>>(new Set());
  const [signedCommitmentIds, setSignedCommitmentIds] = useState<Set<number>>(new Set());
  const targetCampaignId = activeTab === 'CAMPAIGN' ? (targetId || searchParams.get('campaignId')) : searchParams.get('campaignId');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Fetch campaign list — fast initial load (tasks + page 0 + users), then background fetch remaining pages
  const fetchCampaigns = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // 1. Get tasks assigned to this staff first
      const tasks = await campaignService.getTasksByStaff(currentUser.id);

      const campaignTaskIds = tasks
        .filter(t => t.type === 'CAMPAIGN' && t.status !== 'COMPLETED' && t.targetId)
        .map(t => t.targetId);

      if (campaignTaskIds.length === 0) {
        setCampaignRows([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch only the campaigns needed for these tasks in parallel
      // Use allSettled to be extremely resilient against individual 500 errors
      const validTaskIds = campaignTaskIds.filter(id => id != null && id !== 'undefined');

      const results = await Promise.allSettled(
        validTaskIds.slice(0, 100).map(id => campaignService.getById(id))
      );

      const validCampaigns = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(c => c !== null);

      // 3. Fetch users for these campaigns only
      const uniqueOwnerIds = [...new Set(validCampaigns.map(c => c.fundOwnerId).filter(id => id != null))];
      const userResults = await Promise.allSettled(
        uniqueOwnerIds.map(id => userService.getUserById(id))
      );

      const userInfos = userResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value?.success ? r.value.data : null)
        .filter(u => u != null);

      const userMap = new Map<number, UserInfo>();
      userInfos.forEach(u => {
        if (u) userMap.set(u.id, u);
      });
      setUsers(userMap);

      const buildCampaignRows = (campaigns: any[]): CampaignRequest[] =>
        campaigns.map(c => {
          let status: RequestStatus = 'PENDING';
          if (c.status === 'ACTIVE' || c.status === 'APPROVED') status = 'APPROVED';
          else if (c.status === 'CANCELLED' || c.status === 'REJECTED' || c.status === 'DELETED') status = 'REJECTED';
          else if (c.status === 'DRAFT' || c.status === 'PENDING_APPROVAL' || c.status === 'PENDING') status = 'PENDING';
          else if (c.status === 'DISABLED' || c.status === 'SUSPENDED') status = 'DISABLED' as RequestStatus;
          else status = c.status as RequestStatus;

          const owner = userMap.get(c.fundOwnerId);
          return {
            id: `CAMP_${c.id}`,
            createdAt: c.createdAt || new Date().toISOString(),
            status,
            type: 'APPROVE_CAMPAIGN' as const,
            campaignId: c.id,
            campaignTitle: c.title,
            requesterName: owner?.fullName || `Chủ quỹ #${c.fundOwnerId}`,
            description: c.description || '',
            category: c.categoryName || '',
            rejectionReason: c.rejectionReason || undefined,
            kycVerified: !!owner?.kycVerified,
            bankVerified: c.bankVerified,
            fundOwnerId: c.fundOwnerId,
          };
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setCampaignRows(buildCampaignRows(validCampaigns));
      setTotalPages(1); // Task-based view usually doesn't need pagination for now

      // Auto-select from URL
      if (targetCampaignId) {
        setSelectedCampaignId(`CAMP_${targetCampaignId}`);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      toast.error('Không thể tải danh sách yêu cầu. Vui lòng thử lại.');
      setCampaignRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi khi click vào một dòng — load chi tiết campaign
  const handleSelectCampaign = async (campaignRequest: CampaignRequest) => {
    setSelectedCampaignId(campaignRequest.id);
    setSelectedCampaignDetail(null);

    if (campaignRequest.newFlowData) {
      setIsLoadingDetail(false);
      return;
    }

    setIsLoadingDetail(true);
    try {
      const detail = await campaignService.getById(campaignRequest.campaignId);
      setSelectedCampaignDetail(detail);

      const isSigned = await campaignService.isCommitmentSigned(campaignRequest.campaignId);
      if (isSigned) {
        setSignedCommitmentIds(prev => new Set(prev).add(campaignRequest.campaignId));
      } else {
        if (detail.status === 'PENDING' && detail.updatedAt) {
          const startTime = new Date(detail.updatedAt).getTime();
          const deadline = startTime + (48 * 60 * 60 * 1000);
          if (new Date().getTime() > deadline) {
            toast.error('Chiến dịch đã quá hạn 48 giờ ký cam kết. Hệ thống sẽ tự động khóa!', { duration: 6000 });
            await campaignService.disableCampaign(detail.id, 'Quá thời hạn 48 giờ ký cam kết (tự động khóa)');
            detail.status = 'DISABLED';
            setCampaignRows(prev => prev.map(r => r.campaignId === detail.id ? { ...r, status: 'DISABLED' as any } : r));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load campaign detail:', err);
      toast.error('Không thể tải chi tiết chiến dịch.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Fetch ALL data from BE
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      fetchCampaigns().finally(() => setIsLoading(false));
    }
  }, [currentUser]);



  // Memoized Data
  const filteredCampaigns = useMemo(() => {
    if (campaignStatus === 'ALL') return campaignRows;
    return campaignRows.filter((r) => r.status === campaignStatus);
  }, [campaignRows, campaignStatus]);

  const selectedCampaign = useMemo(
    () => campaignRows.find((r) => r.id === selectedCampaignId) || null,
    [campaignRows, selectedCampaignId]
  );

  // Navigate to KYC verification tab
  const handleNavigateToKYC = (userId: number) => {
    router.push(`/staff/kyc?userId=${userId}`);
  };

  // Handlers
  const handleReviewCampaign = async (isApprove: boolean, reason?: string, campaignId?: number) => {
    const targetCampaign = campaignId
      ? campaignRows.find(r => r.campaignId === campaignId)
      : selectedCampaign;

    if (!targetCampaign || targetCampaign.type !== 'APPROVE_CAMPAIGN') return;

    if (isApprove && !targetCampaign.kycVerified) {
      toast.error('Người dùng chưa xác thực KYC');
      return;
    }

    try {
      const status = isApprove ? 'APPROVED' : 'REJECTED';
      await campaignService.reviewCampaign(targetCampaign.campaignId, status, reason);
      setCampaignRows((prev) => prev.map((r) => (r.id === targetCampaign.id ? { ...r, status } : r)));
      toast.success(isApprove ? 'Đã duyệt chiến dịch' : 'Đã từ chối chiến dịch');
    } catch (error) {
      console.error('Failed to review campaign:', error);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDisableCampaign = async (campaignId?: number, reason?: string) => {
    const targetCampaign = campaignId
      ? campaignRows.find(r => r.campaignId === campaignId)
      : selectedCampaign;

    if (!targetCampaign || targetCampaign.type !== 'APPROVE_CAMPAIGN') return;

    try {
      await campaignService.disableCampaign(targetCampaign.campaignId, reason || 'Vi phạm điều khoản');
      setCampaignRows((prev) => prev.map((r) => (r.id === targetCampaign.id ? { ...r, status: 'DISABLED' as RequestStatus } : r)));
      toast.success('Đã vô hiệu hóa chiến dịch');
    } catch (error) {
      console.error('Failed to disable campaign:', error);
      toast.error('Vô hiệu hóa thất bại');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'CAMPAIGN') fetchCampaigns();
    // Add other tab refreshes if needed, for now mostly campaigns
    toast.success('Đã tải lại dữ liệu');
  };

  const handleSendCommitmentEmail = async (campaignRequest: CampaignRequest) => {
    const loadingToast = toast.loading('Đang gửi yêu cầu ký cam kết...');
    try {
      await campaignService.sendCommitmentEmail(campaignRequest.campaignId);
      setSentCommitmentIds(prev => new Set(prev).add(campaignRequest.campaignId));
      toast.success(`Đã gửi mail yêu cầu ký cam kết cho chiến dịch "${campaignRequest.campaignTitle}"`, {
        id: loadingToast,
        duration: 4000
      });
    } catch (error: any) {
      const errorMessage = error.response?.data || 'Gửi mail thất bại. Vui lòng thử lại sau.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Gửi mail thất bại', {
        id: loadingToast,
        duration: 5000
      });
    }
  };


  return (
    <div className="flex flex-col flex-1 bg-[#f1f5f9] min-h-0">
      {/* Folder Tabs Headers */}
      {!isModalOpen && (
        <div className="flex items-end justify-between px-6 h-14">
          <div className="flex items-end gap-2 h-full">
            {[
              { id: 'CAMPAIGN', label: 'Duyệt chiến dịch', icon: Megaphone, count: campaignRows.length },
              { id: 'EXPENDITURE', label: 'Duyệt chi tiêu', icon: DollarSign },
              { id: 'EVIDENCE', label: 'Xác minh minh chứng', icon: Shield },
              { id: 'SUPPORT', label: 'Yêu cầu hỗ trợ', icon: HandCoins },
              { id: 'HISTORY', label: 'Nhiệm vụ đã xong', icon: History },
            ].map((tab) => {
              const Icon = (tab as any).icon || Shield;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${isActive
                    ? 'bg-white text-[#ff5e14] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
                    : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#ff5e14]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#ff5e14]/10 text-[#ff5e14]' : 'bg-gray-300 text-gray-600'}`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                  {isActive && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="mb-1 h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#ff5e14] hover:border-[#ff5e14]/20 transition shadow-sm group active:scale-95"
            title="Làm mới trang"
          >
            <RefreshCw className={`h-5 w-5 transition-transform group-hover:rotate-180 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Folder Body Container */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-lg border border-gray-100 overflow-hidden relative flex flex-col min-h-0 h-full">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6 bg-white min-h-0 h-full">
          {activeTab === 'CAMPAIGN' ? (
            <>


              {/* Campaign Filter Bar */}
              <div className="flex items-center gap-2 flex-shrink-0 bg-white p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DISABLED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCampaignStatus(s)}
                    className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${campaignStatus === s
                      ? 'border-[#ff5e14]/30 bg-[#ff5e14]/10 text-[#ff5e14] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Đang chờ' : s === 'APPROVED' ? 'Đã duyệt' : s === 'REJECTED' ? 'Từ chối' : 'Vô hiệu hóa'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 min-h-0">
                <div className="overflow-hidden flex flex-col gap-3 lg:col-span-12">
                  <div className="flex items-center justify-between flex-shrink-0 px-1">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách nhiệm vụ duyệt chiến dịch</h2>
                  </div>
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
                    {isLoading ? (
                      <div className="p-4 space-y-3 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-4 bg-gray-100 rounded w-[30%]" />
                            <div className="h-4 bg-gray-100 rounded w-[15%]" />
                            <div className="h-4 bg-gray-100 rounded w-[20%]" />
                            <div className="h-4 bg-gray-100 rounded w-[15%]" />
                            <div className="h-4 bg-gray-100 rounded w-[10%]" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RequestTable
                        rows={filteredCampaigns}
                        selectedId={selectedCampaignId}
                        onSelect={(r) => handleSelectCampaign(r)}
                        statusClassName={selectedCampaignId ? 'hidden 2xl:table-cell' : ''}
                        columns={[
                          {
                            key: 'campaign',
                            title: 'CHIẾN DỊCH',
                            render: (r: CampaignRequest) => (
                              <div>
                                <div className="font-black text-gray-900 text-xs uppercase tracking-tight line-clamp-1">{r.campaignTitle}</div>
                                {r.newFlowData && (
                                  <span className="inline-flex items-center mt-0.5 text-[8px] font-black text-brand bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider">
                                    Quy trình mới
                                  </span>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: 'category',
                            title: 'LĨNH VỰC',
                            className: selectedCampaignId ? 'hidden 2xl:table-cell' : 'whitespace-nowrap',
                            render: (r: CampaignRequest) => <span className="text-[10px] font-black text-gray-700 uppercase">{r.category || '-'}</span>,
                          },
                          {
                            key: 'requester',
                            title: 'NGƯỜI TẠO',
                            className: selectedCampaignId ? 'hidden 2xl:table-cell' : 'whitespace-nowrap',
                            render: (r: CampaignRequest) => <span className="text-xs font-bold text-gray-700">{r.requesterName}</span>,
                          },
                          {
                            key: 'kyc',
                            title: 'XÁC THỰC DANH TÍNH',
                            className: 'text-center',
                            render: (r: CampaignRequest) => (
                              r.kycVerified ? (
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[10px] font-black text-green-700 uppercase tracking-wider ring-1 ring-inset ring-green-600/20 shadow-sm border border-white">
                                  Đã xác thực
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToKYC(r.fundOwnerId);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 transition-all shadow-sm"
                                >
                                  <XCircle className="h-3 w-3" />
                                  CHƯA ĐỊNH DANH
                                </button>
                              )
                            ),
                          },
                          {
                            key: 'actions',
                            title: 'THAO TÁC',
                            className: 'text-center',
                            render: (r: CampaignRequest) => (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCampaign(r);
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-50 flex-shrink-0">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Trang {currentPage + 1} / {Math.ceil(filteredCampaigns.length / 10) || 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCampaigns.length / 10) - 1, p + 1))}
                        disabled={currentPage >= Math.ceil(filteredCampaigns.length / 10) - 1}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : activeTab === 'EXPENDITURE' ? (
            <ExpenditureRequestTab initialCampaignId={targetId ? Number(targetId) : null} />
          ) : activeTab === 'EVIDENCE' ? (
            <EvidenceTab />
          ) : activeTab === 'SUPPORT' ? (
            <SupportRequestManager onModalToggle={setIsModalOpen} />
          ) : (
            <HistoryTab />
          )}
        </div>

        {activeTab === 'CAMPAIGN' && selectedCampaignId && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4 md:p-6">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-none">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-none border border-gray-100 bg-white">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff5e14] border-t-transparent" />
                  <span className="text-xs font-bold text-gray-400">Đang tải chi tiết...</span>
                </div>
              ) : selectedCampaign?.newFlowData ? (
                <CampaignNewFlowDetail
                  request={selectedCampaign}
                  square
                  onClose={() => setSelectedCampaignId(undefined)}
                  onApprove={(reason) => handleReviewCampaign(true, reason, selectedCampaign.campaignId)}
                  onReject={(reason) => handleReviewCampaign(false, reason, selectedCampaign.campaignId)}
                  onDisable={(reason) => handleDisableCampaign(selectedCampaign.campaignId, reason)}
                  onSendCommitmentEmail={() => handleSendCommitmentEmail(selectedCampaign)}
                  commitmentSent={sentCommitmentIds.has(selectedCampaign.campaignId)}
                  commitmentSigned={signedCommitmentIds.has(selectedCampaign.campaignId)}
                  onNavigateToKYC={() => handleNavigateToKYC(selectedCampaign.fundOwnerId)}
                />
              ) : (
                <RequestDetailPanel
                  request={selectedCampaign}
                  square
                  title={selectedCampaign ? `Chi tiết chiến dịch` : 'Chi tiết nhiệm vụ'}
                  onClose={() => setSelectedCampaignId(undefined)}
                  fields={[
                    { label: 'Ngày tạo', value: selectedCampaign?.createdAt ? new Date(selectedCampaign.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật' },
                    { label: 'Tên chiến dịch', value: selectedCampaign?.campaignTitle },
                    { label: 'Chủ quản', value: selectedCampaign?.requesterName },
                    { label: 'Lĩnh vực', value: selectedCampaign?.category || 'Chưa cập nhật' },
                    { label: 'Mô tả', value: selectedCampaign?.description || 'Chưa cập nhật' },
                  ]}
                  approveDisabled={selectedCampaign ? !selectedCampaign.kycVerified : false}
                  rejectDisabled={false}
                  approveDisabledReason={selectedCampaign && !selectedCampaign.kycVerified
                    ? "Cần xác minh danh tính trước khi duyệt chiến dịch"
                    : ""
                  }
                  rejectDisabledReason=""
                  actionLabel={selectedCampaign && !selectedCampaign.kycVerified ? "Đi tới Xác thực danh tính" : ""}
                  onActionClick={() => selectedCampaign && handleNavigateToKYC(selectedCampaign.fundOwnerId)}
                  onApprove={(reason: string | undefined) => handleReviewCampaign(true, reason, selectedCampaign?.campaignId)}
                  onReject={(reason: string | undefined) => handleReviewCampaign(false, reason, selectedCampaign?.campaignId)}
                  onDisable={(reason: string | undefined) => handleDisableCampaign(selectedCampaign?.campaignId, reason)}
                  onSendCommitmentEmail={() => selectedCampaign && handleSendCommitmentEmail(selectedCampaign)}
                  commitmentSent={selectedCampaign ? sentCommitmentIds.has(selectedCampaign.campaignId) : false}
                  commitmentSigned={selectedCampaign ? signedCommitmentIds.has(selectedCampaign.campaignId) : false}
                  kycVerified={selectedCampaign?.kycVerified}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
