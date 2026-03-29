'use client';


import { ChevronLeft, ChevronRight, Heart, LayoutGrid, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import MyCampaignCard from '@/components/account/MyCampaignCard';
import { chatService } from '@/services/chatService';
import { useRouter } from 'next/navigation';
import { mediaService } from '@/services/mediaService';
import { useToast } from '@/components/ui/Toast';
import { userService, UserInfo } from '@/services/userService';

export default function CampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 6;
  const { toast } = useToast();


  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const targetId = searchParams?.get('id');

  // Fetch campaigns for the current page
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await campaignService.getUserCampaignsPaginated(user.id, currentPage - 1, itemsPerPage);
        let fetchedCampaigns = data.content;

        // If we have a targetId from notification, ensure it's in the list (prepend if not present)
        if (targetId && currentPage === 1) {
          const tId = parseInt(targetId);
          const isIncluded = fetchedCampaigns.some(c => c.id === tId);
          if (!isIncluded) {
            try {
              const targetCampaign = await campaignService.getById(tId);
              if (targetCampaign && targetCampaign.fundOwnerId === user.id) {
                fetchedCampaigns = [targetCampaign, ...fetchedCampaigns];
              }
            } catch (err) {
              console.error('Failed to fetch target campaign:', err);
            }
          }
        }

        setCampaigns(fetchedCampaigns);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error('Failed to fetch user campaigns:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchCampaigns();
  }, [user?.id, currentPage, targetId]);

  // Handle scrolling to target ID with retries
  useEffect(() => {
    if (!loading && targetId && campaigns.length > 0) {
      const tryScroll = (attempts = 0) => {
        const element = document.getElementById(`campaign-${targetId}`);
        if (element) {
          // Calculate offset to account for fixed header (approx 120px)
          const yOffset = -120;
          const rect = element.getBoundingClientRect();
          const y = rect.top + window.scrollY + yOffset;

          window.scrollTo({ top: y, behavior: 'smooth' });

          // Visual cue: Highlight the target campaign
          element.classList.add('ring-4', 'ring-orange-500', 'ring-offset-4', 'scale-[1.02]', 'transition-all', 'duration-500');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-orange-500', 'ring-offset-4', 'scale-[1.02]');
          }, 4000);
        } else if (attempts < 20) {
          // Retry because DOM might not be ready or rendered yet
          setTimeout(() => tryScroll(attempts + 1), 150);
        }
      };

      const timer = setTimeout(() => tryScroll(), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, targetId, campaigns]);

  // When using server-side pagination, filtered campaigns are just the campaigns on the current page
  const filteredCampaigns = useMemo(() =>
    campaigns.filter(c =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [campaigns, searchTerm]
  );

  // States for enriched data (goals, images)
  const [enrichedCampaigns, setEnrichedCampaigns] = useState<Record<number, CampaignDto>>({});
  const [enriching, setEnriching] = useState<Record<number, boolean>>({});
  const [campaignStaffMap, setCampaignStaffMap] = useState<Record<number, string>>({});

  // Fetch all staff names once
  useEffect(() => {
    const loadStaffs = async () => {
      try {
        const res = await userService.getAllStaff();
        if (res.success && res.data) {
          const map: Record<number, string> = {};
          res.data.forEach((s: UserInfo) => { if (s.id) map[s.id] = s.fullName || s.email || `Staff #${s.id}`; });
          setStaffNameMap(map);
        }
      } catch (err) {
        console.error('Failed to load staff list', err);
      }
    };
    loadStaffs();
  }, []);

  const [staffNameMap, setStaffNameMap] = useState<Record<number, string>>({});

  // paginatedCampaigns is directly the filtered results since we fetch by page
  const paginatedCampaigns = useMemo(() => filteredCampaigns, [filteredCampaigns]);

  // Separate effect: fetch tasks for pending campaigns and store staffId -> campaign map
  useEffect(() => {
    const pending = paginatedCampaigns.filter(c =>
      c.id && ['PENDING', 'PENDING_APPROVAL', 'PENDING_REVIEW'].includes(c.status?.toUpperCase() || '')
    );
    if (pending.length === 0) return;

    Promise.all(pending.map(async (c) => {
      if (!c.id) return;
      try {
        const task = await campaignService.getTaskByCampaign(c.id);
        if (task?.staffId) {
          setCampaignStaffMap(prev => {
            if (prev[c.id!]) return prev; // already resolved
            return { ...prev, [c.id!]: task.staffId };
          });
        }
      } catch { }
    }));
  }, [paginatedCampaigns]);

  // When staffNameMap is ready, resolve staffId -> name
  useEffect(() => {
    if (Object.keys(staffNameMap).length === 0) return;
    setCampaignStaffMap(prev => {
      const next: Record<number, string> = {};
      let changed = false;
      Object.entries(prev).forEach(([cid, val]) => {
        const id = Number(cid);
        if (typeof val === 'number') {
          // val is staffId, resolve to name
          const name = staffNameMap[val] || `Staff #${val}`;
          next[id] = name;
          changed = true;
        } else {
          // already a name string
          next[id] = val;
        }
      });
      return changed ? next : prev;
    });
  }, [staffNameMap]);

  useEffect(() => {
    const enrichVisible = async () => {
      const toEnrich = paginatedCampaigns.filter(c => c.id && !enrichedCampaigns[c.id] && !enriching[c.id]);
      if (toEnrich.length === 0) return;

      // Mark as enriching
      setEnriching(prev => {
        const next = { ...prev };
        toEnrich.forEach(c => { if (c.id) next[c.id] = true; });
        return next;
      });

      await Promise.all(toEnrich.map(async (c) => {
        if (!c.id) return;
        try {
          const goal = await campaignService.getActiveGoalByCampaignId(c.id).catch(() => null);
          let coverImageUrl = c.coverImageUrl;
          if (!coverImageUrl) {
            const firstImage = await mediaService.getCampaignFirstImage(c.id).catch(() => null);
            coverImageUrl = firstImage?.url || c.coverImageUrl;
          }
          setEnrichedCampaigns(prev => ({
            ...prev,
            [c.id!]: { ...c, activeGoal: goal, coverImageUrl }
          }));
        } catch (err) {
          console.error(`Failed to enrich ${c.id}`, err);
        } finally {
          setEnriching(prev => {
            const next = { ...prev };
            if (c.id) delete next[c.id];
            return next;
          });
        }
      }));
    };

    enrichVisible();
  }, [paginatedCampaigns, enrichedCampaigns, enriching]);

  const displayCampaigns = useMemo(() =>
    paginatedCampaigns.map(c => (c.id && enrichedCampaigns[c.id]) ? enrichedCampaigns[c.id] : c)
    , [paginatedCampaigns, enrichedCampaigns]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleChatClick = async (campaign: CampaignDto) => {
    if (!user?.id) return;

    try {
      console.log(`[Campaigns] Checking chat for campaign ${campaign.id}...`);
      const res = await chatService.getConversationByCampaignId(campaign.id);

      if (res.success && res.data) {
        console.log(`[Campaigns] Found existing conversation: ${res.data.id}`);
        router.push(`/account/chat?conversationId=${res.data.id}`);
      } else {
        console.log(`[Campaigns] No conversation found, creating new...`);
        const createRes = await chatService.createConversation(user.id, campaign.id);
        if (createRes.success && createRes.data) {
          console.log(`[Campaigns] Created new conversation: ${createRes.data.id}`);
          router.push(`/account/chat?conversationId=${createRes.data.id}`);
        } else {
          toast('Không thể tạo cuộc trò chuyện.', 'error');
        }
      }
    } catch (error) {
      console.error('[Campaigns] Error checking conversation:', error);
      toast('Đã xảy ra lỗi khi mở trò chuyện.', 'error');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters & Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-8">
            <div className="md:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm chiến dịch..."
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-700">Tổng số</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalElements}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative min-h-[400px]">
            {/* Subtle loading indicator for pagination */}
            {loading && !isInitialLoad && (
              <div className="absolute inset-x-0 -top-6 flex justify-center z-20">
                <div className="bg-white shadow-xl rounded-full px-5 py-1.5 flex items-center gap-2 border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                  <span className="text-xs font-bold text-gray-700">Đang cập nhật danh sách...</span>
                </div>
              </div>
            )}

            {loading && isInitialLoad ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-5" />
                  <p className="text-gray-600 font-bold text-lg">Đang tải chiến dịch...</p>
                </div>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className={`space-y-10 animate-in fade-in duration-700 ${loading ? 'opacity-40 pointer-events-none transition-opacity duration-300' : 'opacity-100 transition-opacity duration-500'}`}>
                <div className="grid grid-cols-1 gap-6">
                  {displayCampaigns.map((campaign) => (
                    <MyCampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      assignedReviewerName={campaign.id ? campaignStaffMap[campaign.id] : undefined}
                      hasStaff={!!(campaign.id && campaignStaffMap[campaign.id])}
                      onChatClick={() => {
                        console.log('[Campaigns] Clicked chat for campaign:', campaign.id);
                        handleChatClick(campaign);
                      }}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500">
                      Hiển thị <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalElements)}</span> trong tổng số <span className="text-gray-900">{totalElements}</span> chiến dịch
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page
                              ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-12 text-center animate-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-orange-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'Không tìm thấy chiến dịch phù hợp' : 'Bạn đã sẵn sàng để bắt đầu chưa?'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                  {searchTerm
                    ? "Hãy thử điều chỉnh từ khóa tìm kiếm để tìm thấy chiến dịch bạn cần."
                    : "Bạn chưa tạo chiến dịch nào. Hãy bắt đầu hành trình ngay hôm nay để tạo nên những thay đổi tuyệt vời."}
                </p>
                {!searchTerm && (
                  <Link
                    href="/campaign-creation"
                    className="inline-flex px-8 py-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all font-bold shadow-xl shadow-orange-100 hover:scale-105"
                  >
                    Bắt đầu chiến dịch đầu tiên
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
