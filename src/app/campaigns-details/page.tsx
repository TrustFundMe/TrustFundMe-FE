'use client';

import DanboxLayout from '@/layout/DanboxLayout';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Calendar, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { CampaignDto, FundraisingGoal } from '@/types/campaign';

import CampaignDonateCard from '@/components/campaign/CampaignDonateCard';
import CampaignHeader from '@/components/campaign/CampaignHeader';
import MilestoneTimeline from '@/components/campaign/MilestoneTimeline';
import PlansList from '@/components/campaign/PlansList';
import PostsFeed from '@/components/campaign/PostsFeed';
import DonorsModal from '@/components/campaign/DonorsModal';
import TrustScoreLogsModal from '@/components/campaign/TrustScoreLogsModal';
import type { Campaign, CampaignPost, CampaignPlan, CampaignFollower, CampaignMedia } from '@/components/campaign/types';
import { feedPostService } from '@/services/feedPostService';
import type { FeedPostDto } from '@/types/feedPost';
import { useRouter, useSearchParams } from 'next/navigation';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { userService } from '@/services/userService';
import { withFallbackImage } from '@/lib/image';
import { usePermissions } from '@/hooks/usePermissions';
import { mediaService } from '@/services/mediaService';
import { paymentService, CampaignProgress, RecentDonor } from '@/services/paymentService';
import { flagService } from '@/services/flagService';
import { trustScoreService } from '@/services/trustScoreService';
import toast from 'react-hot-toast';

const CampaignAnalyticsChart = dynamic(() => import('@/components/campaign/CampaignAnalyticsChart'), {
  ssr: false,
});

const mapCampaignDtoToUi = (
  dto: CampaignDto,
  activeGoal: FundraisingGoal | null,
  owner?: { name: string; avatar: string },
  galleryUrls: string[] = [],
  coverUrl?: string,
  trustScore?: number,
  attachments?: CampaignMedia[]
): Campaign => {
  // Use coverUrl if provided by API, otherwise fallback to DTO's coverImageUrl string.
  const finalCover = coverUrl || dto.coverImageUrl || '';

  return {
    id: String(dto.id),
    title: dto.title,
    category: dto.categoryName || dto.category || 'Chiến dịch',
    categoryIconUrl: dto.categoryIconUrl,
    description: dto.description ?? '',
    coverImage: finalCover,
    galleryImages: galleryUrls.length > 0 ? galleryUrls : (finalCover ? [finalCover] : []),
    goalAmount: activeGoal ? activeGoal.targetAmount : 0,
    raisedAmount: dto.balance ?? 0,
    creator: {
      id: String(dto.fundOwnerId),
      name: owner?.name || `Người tạo #${dto.fundOwnerId}`,
      avatar: owner?.avatar || '/assets/img/defaul.jpg',
      trustScore,
    },
    followers: [],
    followed: false,
    flagged: false,
    followerCount: 0,
    commentCount: 0,
    // forward KYC flag from server
    kycVerified: dto.kycVerified ?? false,
    type: dto.type || 'general',
    status: dto.status,
    rejectionReason: dto.rejectionReason || undefined,
    attachments,
  };
};

function mapFeedPostDtoToCampaignPost(dto: FeedPostDto): CampaignPost {
  return {
    id: String(dto.id),
    author: {
      id: String(dto.authorId),
      name: dto.authorName || `Người dùng #${dto.authorId}`,
      avatar: dto.authorAvatar || '/assets/img/defaul.jpg',
    },
    content: dto.content,
    createdAt: dto.createdAt
      ? new Date(dto.createdAt).toLocaleDateString('vi-VN')
      : '',
    attachments: (dto.attachments || [])
      .filter((a) => a.url)
      .map((a) => ({
        type: (a.type?.toUpperCase() === 'IMAGE' ? 'image' : 'file') as 'image' | 'file',
        url: a.url!,
        name: a.fileName || (a as any).name,
      })),
    liked: dto.isLiked ?? false,
    likeCount: dto.likeCount ?? 0,
    flagged: false,
    comments: [],
  };
}

function formatVnDateRange(startDate?: string | null, endDate?: string | null, fallback?: string) {
  if (!startDate && !endDate) return fallback || '';
  const start = startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '';
  const end = endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '';
  if (start && end) return `${start} - ${end}`;
  return start || end || fallback || '';
}

function CampaignDetailsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignIdStr = searchParams?.get('id');
  const campaignId = campaignIdStr ? parseInt(campaignIdStr, 10) : null;

  const { isStaff, isAdmin } = usePermissions();
  const [showTrustScoreLogs, setShowTrustScoreLogs] = useState(false);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [plans, setPlans] = useState<CampaignPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followers, setFollowers] = useState<CampaignFollower[]>([]);
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [showDonorsModal, setShowDonorsModal] = useState(false);

  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const postsLoadedRef = useRef(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  
  const isDonationVisible = plans.some((p) => {
    if (p.status !== 'APPROVED') return false;
    const now = new Date();
    const start = p.startDate ? new Date(p.startDate) : null;
    const end = p.endDate ? new Date(p.endDate) : null;
    if (!start || !end) return false;
    return now >= start && now <= end;
  });


  useEffect(() => {
    let mounted = true;
    if (!campaignId) {
      setLoading(false);
      setError('ID chiến dịch không hợp lệ');
      return;
    }

    const fetchCampaign = async () => {
      setError('');

      try {
        setLoading(true);

        // Phase 1: Fetch critical data in parallel — campaign + owner + media + goal + progress
        const [dto, activeGoal, expenditures, mediaResult, progressData, recentDonorsData] = await Promise.all([
          campaignService.getById(campaignId),
          campaignService.getActiveGoalByCampaignId(campaignId),
          campaignService.getExpendituresByCampaignId(campaignId),
          mediaService.getMediaByCampaignId(campaignId).catch(() => []),
          paymentService.getCampaignProgress(campaignId).catch(() => null),
          paymentService.getRecentDonors(campaignId, 3).catch(() => []),
        ]);

        if (!mounted) return;

        // Process media immediately
        let galleryUrls: string[] = [];
        let finalCoverUrl = '';
        const mediaList = mediaResult as any[];
        const attachments: CampaignMedia[] = [];
        if (mediaList && mediaList.length > 0) {
          const coverMedia = mediaList.find(m => m.id === dto.coverImage);
          finalCoverUrl = coverMedia ? coverMedia.url : mediaList[0].url;
          const sortedMedia = [...mediaList].sort((a: any, b: any) => {
            if (a.id === dto.coverImage) return -1;
            if (b.id === dto.coverImage) return 1;
            return 0;
          });
          const photos: string[] = [];
          sortedMedia.forEach((m: any) => {
            const mediaType = m.mediaType || m.type || '';
            if (mediaType === 'PHOTO' || mediaType === 'VIDEO') {
              photos.push(m.url);
            }
            if (mediaType === 'FILE') {
              attachments.push({ id: m.id, type: 'FILE', url: m.url, name: m.fileName || m.name || `Tệp đính kèm` });
            }
          });
          galleryUrls = photos;
        }

        // Show campaign immediately with basic owner info (no extra fetch yet)
        const campaignData = mapCampaignDtoToUi(dto, activeGoal, undefined, galleryUrls, finalCoverUrl, undefined, attachments);
        setCampaign(campaignData);
        setProgress(progressData);
        setRecentDonors(recentDonorsData);
        setLoading(false); // Page visible now!

        // Process expenditure plans (only fetch categories if not nested)
        const expendituresNeedingCategories = (expenditures || []).filter(
          (exp: any) => !exp.categories || exp.categories.length === 0
        );
        const categoryEntries = await Promise.all(
          expendituresNeedingCategories.map(async (exp: any) => {
            try {
              const categories = await expenditureService.getCategories(exp.id);
              return [exp.id as number, categories as any[]] as const;
            } catch {
              return [exp.id as number, [] as any[]] as const;
            }
          }),
        );
        const categoryMap = new Map<number, any[]>(categoryEntries);

        const mappedPlans: CampaignPlan[] = (expenditures || []).map((exp: any) => {
          const rawCategories = (exp.categories && exp.categories.length > 0)
            ? exp.categories
            : (categoryMap.get(exp.id) || []);
          const normalizedCategories = rawCategories.map((cat: any) => ({
            id: cat.id,
            name: cat.name || 'Nhóm hạng mục',
            description: cat.description || '',
            expectedAmount: cat.expectedAmount || 0,
            actualAmount: cat.actualAmount || 0,
            items: (cat.items || []).map((item: any) => ({
              id: item.id,
              name: item.category || item.name || 'Hạng mục',
              expectedQuantity: item.quantity || item.expectedQuantity || 0,
              expectedPrice: item.expectedPrice || 0,
              actualQuantity: item.actualQuantity || 0,
              price: item.price || 0,
              note: item.note || '',
            })),
          }));
          const totalItems = normalizedCategories.reduce((sum: number, cat: any) => sum + (cat.items?.length || 0), 0);
          const firstCategoryDescription =
            normalizedCategories.find((cat: any) => (cat.description || '').trim())?.description || '';
          return {
            id: String(exp.id),
            title: exp.plan || 'Milestone',
            amount: exp.totalExpectedAmount || exp.totalAmount || 0,
            description: firstCategoryDescription,
            date: formatVnDateRange(exp.startDate, exp.endDate, exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('vi-VN') : ''),
            status: exp.status,
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            totalItems,
            categories: normalizedCategories,
          };
        });

        if (!mounted) return;
        setPlans(mappedPlans);

        // Phase 2: Non-blocking — owner details, follow info, flags, trust score, posts
        const [
          ownerResult,
          followResult,
          followersResult,
          myFlags,
          trustScoreResult,
          postsResult,
        ] = await Promise.all([
          userService.getUserById(dto.fundOwnerId).catch(() => null),
          Promise.all([
            campaignService.isFollowing(campaignId).catch(() => false),
            campaignService.getFollowerCount(campaignId).catch(() => 0)
          ]).catch(() => [false, 0]),
          campaignService.getFollowers(campaignId).catch(() => []),
          flagService.getMyFlags(0, 100).catch(() => [] as import('@/services/flagService').FlagDto[]),
          trustScoreService.getUserScore(dto.fundOwnerId).catch(() => null),
          feedPostService.getByCampaignId(campaignId, { size: 4 }).catch(() => null),
        ]);

        if (!mounted) return;

        const alreadyFlagged = (myFlags as import('@/services/flagService').FlagDto[])
          .some(f => f.campaignId === campaignId);

        const owner = { name: '', avatar: '/assets/img/defaul.jpg' };
        if (ownerResult?.success && ownerResult?.data) {
          owner.name = ownerResult.data.fullName;
          owner.avatar = ownerResult.data.avatarUrl || owner.avatar;
        }

        const followed = (followResult as [boolean, number])[0];
        const followerCount = (followResult as [boolean, number])[1];

        const followersList = followersResult as any[];
        const followersData: CampaignFollower[] = followersList.map((f: any) => ({
          userId: f.userId || 0,
          userName: f.userName || 'Người dùng',
          avatarUrl: f.avatarUrl || undefined,
          followedAt: f.followedAt || f.createdAt || new Date().toISOString(),
        }));

        const trustScore = trustScoreResult?.totalScore;
        const updatedCampaign = mapCampaignDtoToUi(dto, activeGoal, owner, galleryUrls, finalCoverUrl, trustScore, attachments);
        updatedCampaign.followed = followed;
        updatedCampaign.followerCount = followerCount;
        updatedCampaign.flagged = alreadyFlagged;
        setCampaign(updatedCampaign);
        setFollowers(followersData);

        if (postsResult) {
          setPosts(postsResult.content.map(mapFeedPostDtoToCampaignPost));
          setPostsTotal(postsResult.totalElements);
          postsLoadedRef.current = true;
        }
      } catch (err) {
        console.error('Fetch campaign detail error:', err);
        if (!mounted) return;
        setError('Không thể tải thông tin chiến dịch');
        setLoading(false);
      }
    };

    fetchCampaign();

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  if (loading) {
    return (
      <DanboxLayout header={4}>
        <section className="causes-details-section fix section-padding" style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}>
          <div className="container" style={{ padding: '80px 0' }}>
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 0.95fr)',
                gap: 30,
                alignItems: 'start',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="animate-pulse space-y-4">
                  <div className="h-[400px] w-full bg-slate-200 rounded-3xl"></div>
                  <div className="h-8 w-3/4 bg-slate-200 rounded-xl"></div>
                  <div className="h-6 w-1/2 bg-slate-200 rounded-xl"></div>
                  <div className="mt-8 h-20 w-full bg-slate-200 rounded-xl"></div>
                </div>
              </div>
              <div style={{ minWidth: 0, marginTop: 16 }}>
                <div className="animate-pulse space-y-6">
                  <div className="h-48 w-full bg-slate-200 rounded-3xl"></div>
                  <div className="h-64 w-full bg-slate-200 rounded-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </DanboxLayout>
    );
  }

  // Backward compatibility: old UI used slug-like ids (e.g. community-kitchens-2)
  // If a non-numeric id is provided, fall back to mock data so the page still renders.
  if (campaignId === null || isNaN(campaignId)) {
    return (
      <DanboxLayout header={4}>
        <div className="container" style={{ padding: '80px 0', fontFamily: 'var(--font-dm-sans)' }}>
          <div style={{ marginBottom: 12, fontWeight: 700 }}>
            ID chiến dịch không hợp lệ.
          </div>
          <div style={{ marginBottom: 24 }}>
            Vui lòng chọn một chiến dịch từ danh sách để xem thông tin thực tế.
          </div>
        </div>
      </DanboxLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DanboxLayout header={4}>
        <div className="container" style={{ padding: '80px 0', fontFamily: 'var(--font-dm-sans)' }}>
          <div>{error || 'Không tìm thấy chiến dịch'}</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={4}>
      <section
        className="causes-details-section fix section-padding"
        style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 0.95fr)',
              gap: 30,
              alignItems: 'start',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <CampaignHeader
                campaign={campaign}
                followers={followers}
                onShowTrustScore={() => setShowTrustScoreLogs(true)}
                onToggleFollow={async () => {
                  if (!campaignId) return;
                  try {
                    if (campaign.followed) {
                      await campaignService.unfollowCampaign(campaignId);
                    } else {
                      await campaignService.followCampaign(campaignId);
                    }
                    setCampaign((c) =>
                      c
                        ? {
                          ...c,
                          followed: !c.followed,
                          followerCount: c.followed
                            ? Math.max(0, c.followerCount - 1)
                            : c.followerCount + 1,
                        }
                        : c
                    );
                  } catch (error) {
                    console.error('Error toggling follow:', error);
                  }
                }}
                onToggleFlag={() => setCampaign((c) => (c ? { ...c, flagged: !c.flagged } : c))}
                onSubmitFlag={async (reason: string) => {
                  if (!campaignId) return;
                  try {
                    await flagService.flagCampaign(campaignId, reason);
                    toast.success('Đã gửi tố cáo thành công! Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
                  } catch (err: any) {
                    const msg = err?.response?.data?.message || err?.message || 'Gửi tố cáo thất bại.';
                    toast.error(msg);
                    throw err; // re-throw so modal stays open
                  }
                }}
              />


              <MilestoneTimeline
                plans={plans}
                raisedAmount={progress?.raisedAmount || campaign.raisedAmount || 0}
              />

              <div
                style={{
                  border: '1px solid rgba(15,23,42,0.10)',
                  borderRadius: 16,
                  background: '#fff',
                  padding: '16px 20px',
                  marginBottom: 14,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsStatsOpen((v) => !v)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Thống Kê Giao Dịch</span>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#64748b',
                      transition: 'transform 200ms',
                      transform: isStatsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▼
                  </span>
                </button>
                {isStatsOpen ? (
                  <div style={{ marginTop: 12 }}>
                    <CampaignAnalyticsChart campaignId={campaign.id} />
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ minWidth: 0, marginTop: 16 }}>
              <div className="casues-sidebar-wrapper campaign-detail-sidebar">
                <div style={{ marginBottom: 18 }}>
                  {campaign.status === 'DISABLED' ? (
                    <div className="p-8 rounded-3xl bg-red-50 border-2 border-red-200 border-dashed text-center space-y-4 animate-pulse">
                      <div className="inline-flex p-4 bg-red-100 rounded-full">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-red-700 uppercase tracking-tight">Chiến dịch tạm dừng</div>
                        <p className="text-xs font-bold text-red-900/60 mt-1">Hệ thống đã tạm dừng tiếp nhận đóng góp cho chiến dịch này.</p>
                      </div>

                      {campaign.rejectionReason && (
                        <div className="pt-4 border-t border-red-200">
                          <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-1">Lý do:</p>
                          <p className="text-sm text-red-700 italic">"{campaign.rejectionReason}"</p>
                        </div>
                      )}
                    </div>
                  ) : isDonationVisible ? (
                    <CampaignDonateCard
                      raisedAmount={progress?.raisedAmount || campaign.raisedAmount}
                      goalAmount={progress?.goalAmount || campaign.goalAmount}
                      progressPercentage={progress?.progressPercentage || 0}
                      donorCount={progress?.donorCount || 0}
                      recentDonors={recentDonors}
                      onDonate={(amount) => {
                        const fundType = campaign.type?.toUpperCase() === 'ITEMIZED' ? 'item' : 'general';
                        const params = new URLSearchParams({
                          campaignId: String(campaignId),
                          amount: String(amount),
                          fundType,
                        });
                        router.push(`/donation?${params.toString()}`);
                      }}
                      onMoreDonorsClick={() => setShowDonorsModal(true)}
                    />
                  ) : (
                    <div className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-200 border-dashed text-center space-y-4">
                      <div className="inline-flex p-4 bg-slate-100 rounded-full">
                        <Calendar className="h-8 w-8 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-700 uppercase tracking-tight">Tạm dừng nhận quyên góp</div>
                        <p className="text-xs font-bold text-slate-900/60 mt-1">Hiện không trong đợt chi tiêu được phê duyệt của chiến dịch này.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <PlansList
                    plans={plans}
                    onOpenPlan={(planId) => {
                      router.push(`/account/campaigns/expenditures/${planId}?campaignId=${campaignId}`);
                    }}
                  />
                </div>

                <div
                  style={{
                    border: '1px solid rgba(15,23,42,0.10)',
                    borderRadius: 14,
                    padding: '16px 14px',
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      Bài viết{postsTotal > 0 ? ` (${postsTotal})` : ''}
                    </h4>

                    {postsTotal > 4 && (
                      <button
                        type="button"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          fontSize: 12,
                          color: '#ff5e14',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/post?campaignId=${campaignId}`)}
                      >
                        Xem thêm
                      </button>
                    )}
                  </div>

                  {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                      Chưa có bài viết nào
                    </div>
                  ) : (
                    <PostsFeed
                      posts={posts}
                      campaignCreatorId={campaign.creator.id}
                      onOpenPost={(postId) => router.push(`/post/${postId}`)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 991px) {
            section :global(.container) > div {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }

            section :global(.container) > div > div:last-child {
              margin-top: 0 !important;
            }

            section :global(.casues-sidebar-wrapper) {
              margin-top: 10px;
            }
          }

          @media (min-width: 992px) {
            section :global(.campaign-detail-sidebar) {
              position: sticky;
              top: 92px;
            }
          }

          @media (max-width: 575px) {
            section :global(h2) {
              font-size: 26px !important;
            }

            section :global(.single-sidebar-widgets) {
              border-radius: 14px;
            }

            section :global(.widget-title h4) {
              font-size: 18px;
            }
          }
        `}</style>
      </section>

      {showDonorsModal && campaignId && (
        <DonorsModal
          campaignId={campaignId}
          onClose={() => setShowDonorsModal(false)}
        />
      )}

      {showTrustScoreLogs && campaign && (
        <TrustScoreLogsModal
          userId={campaign.creator.id}
          userName={campaign.creator.name}
          onClose={() => setShowTrustScoreLogs(false)}
        />
      )}
    </DanboxLayout>
  );
}

export default function CampaignDetailsPage() {
  return (
    <Suspense
      fallback={
        <DanboxLayout header={4}>
          <section className="causes-details-section fix section-padding" style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}>
            <div className="container" style={{ padding: '80px 0' }}>
              <div
                style={{
                  maxWidth: 1200,
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 0.95fr)',
                  gap: 30,
                  alignItems: 'start',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="animate-pulse space-y-4">
                    <div className="h-[400px] w-full bg-slate-200 rounded-3xl"></div>
                    <div className="h-8 w-3/4 bg-slate-200 rounded-xl"></div>
                    <div className="h-6 w-1/2 bg-slate-200 rounded-xl"></div>
                    <div className="mt-8 h-20 w-full bg-slate-200 rounded-xl"></div>
                  </div>
                </div>
                <div style={{ minWidth: 0, marginTop: 16 }}>
                  <div className="animate-pulse space-y-6">
                    <div className="h-48 w-full bg-slate-200 rounded-3xl"></div>
                    <div className="h-64 w-full bg-slate-200 rounded-3xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </DanboxLayout>
      }
    >
      <CampaignDetailsInner />
    </Suspense>
  );
}
