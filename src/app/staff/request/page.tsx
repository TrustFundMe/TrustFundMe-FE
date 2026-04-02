'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Megaphone, DollarSign, Shield, XCircle, ShieldCheck, History, X, Eye, CheckCircle, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import ExpenditureTab from '@/components/staff/request/ExpenditureTab';
import EvidenceTab from '@/components/staff/request/EvidenceTab';
import KYCTab from '@/components/staff/request/KYCTab';
import HistoryTab from '@/components/staff/request/HistoryTab';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import type {
  CampaignRequest,
  RequestStatus,
} from '@/components/staff/request/RequestTypes';


export default function StaffRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'EXPENDITURE' | 'EVIDENCE' | 'KYC' | 'HISTORY'>(
    targetTab === 'KYC' ? 'KYC' : targetTab === 'EVIDENCE' ? 'EVIDENCE' : targetTab === 'EXPENDITURE' ? 'EXPENDITURE' : targetTab === 'HISTORY' ? 'HISTORY' : 'CAMPAIGN'
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const [selectedUserIdForKyc, setSelectedUserIdForKyc] = useState<number | null>(
    searchParams.get('userId') ? Number(searchParams.get('userId')) : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [users, setUsers] = useState<Map<number, UserInfo>>(new Map());
  
  // Campaign States
  const [campaignRows, setCampaignRows] = useState<any[]>([]);
  const [campaignStatus, setCampaignStatus] = useState<RequestStatus | 'ALL' | 'DISABLED'>('ALL');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const targetCampaignId = searchParams.get('campaignId');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Fetch functions moved to component scope
  const fetchCampaigns = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch tasks assigned to this staff
      const tasks = await campaignService.getTasksByStaff(currentUser.id);
      const campaignTaskIds = new Set(
        tasks.filter(t => t.type === 'CAMPAIGN' && t.status !== 'COMPLETED').map(t => t.targetId)
      );

      const allCampaignsResp = await campaignService.getAll(currentPage, pageSize);
      const allCampaigns = allCampaignsResp.content || [];
      setTotalPages(allCampaignsResp.totalPages || 0);

      // Fetch users for campaign owners
      const allUsersResult = await userService.getAllUsers(0, 1000);
      const userMap = new Map<number, UserInfo>();
      if (allUsersResult.success && allUsersResult.data && allUsersResult.data.content) {
        allUsersResult.data.content.forEach(user => {
          userMap.set(user.id, user);
        });
      }
      setUsers(userMap);

      const mappedCampaigns: CampaignRequest[] = allCampaigns
        .filter(c => campaignTaskIds.has(c.id))
        .map(c => {
          // Map Backend Status to Frontend Request Status
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
            status: status,
            type: 'APPROVE_CAMPAIGN' as const,
            campaignId: c.id,
            campaignTitle: c.title,
            requesterName: owner?.fullName || `Chủ quỹ #${c.fundOwnerId}`,
            description: c.description || '',
            category: c.categoryName || '',
            rejectionReason: c.rejectionReason || undefined,
            kycVerified: c.kycVerified,
            bankVerified: c.bankVerified,
            fundOwnerId: c.fundOwnerId,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setCampaignRows(mappedCampaigns);

      // Auto-select from URL or first item
      if (targetCampaignId) {
        setSelectedCampaignId(`CAMP_${targetCampaignId}`);
      } else if (mappedCampaigns.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(mappedCampaigns[0].id);
      }

    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      toast.error('Không thể tải dữ liệu yêu cầu. Vui lòng thử lại sau.');
      setCampaignRows([]);
      setSelectedCampaignId(undefined);
    }
  };

  // Fetch ALL data from BE
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      fetchCampaigns().finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  // Handle tab from URL
  useEffect(() => {
    if (targetTab === 'KYC') {
      setActiveTab('KYC');
      const uid = searchParams.get('userId');
      if (uid) setSelectedUserIdForKyc(Number(uid));
    }
  }, [targetTab, searchParams]);

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
    setSelectedUserIdForKyc(userId);
    setActiveTab('KYC');
    router.replace(`/staff/request?tab=KYC&userId=${userId}`);
  };

  // Handlers
  const handleReviewCampaign = async (isApprove: boolean, reason?: string, campaignId?: number) => {
    const targetCampaign = campaignId
      ? campaignRows.find(r => r.campaignId === campaignId)
      : selectedCampaign;

    if (!targetCampaign || targetCampaign.type !== 'APPROVE_CAMPAIGN') return;

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


  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Folder Tabs Headers */}
      {!isModalOpen && (
        <div className="flex items-end px-6 gap-2 h-14">
          {[
            { id: 'CAMPAIGN', label: 'Duyệt chiến dịch', icon: Megaphone, count: campaignRows.length },
            { id: 'EXPENDITURE', label: 'Duyệt chi tiêu', icon: DollarSign },
            { id: 'EVIDENCE', label: 'Xác minh minh chứng', icon: Shield },
            { id: 'KYC', label: 'Xác thực người dùng (KYC)', icon: ShieldCheck },
            { id: 'HISTORY', label: 'Nhiệm vụ đã xong', icon: History },
          ].map((tab) => {
            const Icon = (tab as any).icon || Shield;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${isActive
                  ? 'bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
                  : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#db5945]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#db5945]/10 text-[#db5945]' : 'bg-gray-300 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                {isActive && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Folder Body Container */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {activeTab === 'CAMPAIGN' ? (
            <>


              {/* Campaign Filter Bar */}
              <div className="flex items-center gap-2 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DISABLED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCampaignStatus(s)}
                    className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${campaignStatus === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Đang chờ' : s === 'APPROVED' ? 'Đã duyệt' : s === 'REJECTED' ? 'Từ chối' : 'Vô hiệu hóa'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-hidden">
                <div className={`overflow-hidden flex flex-col gap-3 transition-all duration-500 ${selectedCampaignId ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                  <div className="flex items-center justify-between flex-shrink-0 px-1">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách nhiệm vụ duyệt chiến dịch</h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredCampaigns.length} kết quả</span>
                  </div>
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm transition-all duration-500">
                    <RequestTable
                      rows={filteredCampaigns}
                      selectedId={selectedCampaignId}
                      onSelect={(r) => setSelectedCampaignId(r.id)}
                      columns={[
                        {
                          key: 'campaign',
                          title: 'CHIẾN DỊCH',
                          render: (r: CampaignRequest) => (
                            <div>
                              <div className="font-black text-gray-900 text-xs uppercase tracking-tight line-clamp-1">{r.campaignTitle}</div>
                            </div>
                          ),
                        },
                        {
                          key: 'category',
                          title: 'LĨNH VỰC',
                          render: (r: CampaignRequest) => <span className="text-[10px] font-black text-gray-700 uppercase">{r.category || '-'}</span>,
                        },
                        {
                          key: 'requester',
                          title: 'NGƯỜI TẠO',
                          render: (r: CampaignRequest) => <span className="text-xs font-bold text-gray-700">{r.requesterName}</span>,
                        },
                        {
                          key: 'kyc',
                          title: 'XÁC THỰC KYC',
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
                                className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[10px] font-black text-red-700 uppercase tracking-wider ring-1 ring-inset ring-red-600/10 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-white"
                              >
                                <X className="h-4 w-4" />
                                CHƯA XÁC THỰC
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
                                  setSelectedCampaignId(r.id);
                                }}
                                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {r.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReviewCampaign(true, undefined, r.campaignId);
                                    }}
                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all border border-green-100"
                                    title="Duyệt nhanh"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCampaignId(r.id);
                                      toast('Vui lòng nhập lý do từ chối ở bảng bên phải', {
                                        icon: 'ℹ️',
                                        duration: 3000
                                      });
                                    }}
                                    className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100"
                                    title="Từ chối (Yêu cầu nhập lý do)"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                              {r.status === 'APPROVED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCampaignId(r.id);
                                    toast('Cuộn xuống dưới cùng ở bảng bên phải để vô hiệu hóa', {
                                      icon: '⚠️',
                                      duration: 4000
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100"
                                  title="Vô hiệu hóa"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ),
                        },
                      ]}
                    />
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

                {selectedCampaignId && (
                  <div className="lg:col-span-4 overflow-auto pb-4 custom-scrollbar animate-in slide-in-from-right-4 transition-all duration-500">
                    <RequestDetailPanel
                      request={selectedCampaign}
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
                        ? "Cần xác minh KYC trước khi duyệt chiến dịch"
                        : ""
                      }
                      rejectDisabledReason=""
                      actionLabel={selectedCampaign && !selectedCampaign.kycVerified ? "Đi tới Trang KYC" : ""}
                      onActionClick={() => selectedCampaign && handleNavigateToKYC(selectedCampaign.fundOwnerId)}
                      onApprove={(reason: string | undefined) => handleReviewCampaign(true, reason, selectedCampaign?.campaignId)}
                      onReject={(reason: string | undefined) => handleReviewCampaign(false, reason, selectedCampaign?.campaignId)}
                      onDisable={(reason: string | undefined) => handleDisableCampaign(selectedCampaign?.campaignId, reason)}
                    />
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'EXPENDITURE' ? (
            <ExpenditureTab onModalToggle={setIsModalOpen} />
          ) : activeTab === 'EVIDENCE' ? (
            <EvidenceTab />
          ) : activeTab === 'KYC' ? (
            <KYCTab initialUserId={selectedUserIdForKyc} onModalToggle={setIsModalOpen} />
          ) : (
            <HistoryTab />
          )}
        </div>
      </div>
    </div>
  );
}
