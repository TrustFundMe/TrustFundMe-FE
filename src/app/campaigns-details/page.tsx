'use client';

import DanboxLayout from '@/layout/DanboxLayout';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { CampaignDto, FundraisingGoal } from '@/types/campaign';

import CampaignDonateCard from '@/components/campaign/CampaignDonateCard';
import CampaignHeader from '@/components/campaign/CampaignHeader';
import CampaignCommentsCard from '@/components/campaign/CampaignCommentsCard';
import FollowersRow from '@/components/campaign/FollowersRow';
import PlansList from '@/components/campaign/PlansList';
import PostsFeed from '@/components/campaign/PostsFeed';
import { mockComments, mockPlans, mockPosts } from '@/components/campaign/mock';
import type { Campaign, CampaignPost } from '@/components/campaign/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { campaignService } from '@/services/campaignService';
import { userService } from '@/services/userService';
import { withFallbackImage } from '@/lib/image';

import { mediaService } from '@/services/mediaService';

const mapCampaignDtoToUi = (
  dto: CampaignDto,
  activeGoal: FundraisingGoal | null,
  owner?: { name: string; avatar: string },
  galleryUrls: string[] = [],
  coverUrl?: string
): Campaign => {
  // Use coverUrl if provided by API, otherwise fallback to DTO's coverImageUrl string.
  const finalCover = coverUrl || dto.coverImageUrl || '';

  return {
    id: String(dto.id),
    title: dto.title,
    category: dto.categoryName || dto.category || 'Chiến dịch',
    description: dto.description ?? '',
    coverImage: finalCover,
    galleryImages: galleryUrls.length > 0 ? galleryUrls : (finalCover ? [finalCover] : []),
    goalAmount: activeGoal ? activeGoal.targetAmount : 0,
    raisedAmount: dto.balance ?? 0,
    creator: {
      id: String(dto.fundOwnerId),
      name: owner?.name || `Người tạo #${dto.fundOwnerId}`,
      avatar: owner?.avatar || '/assets/img/about/01.jpg',
    },
    followers: [],
    liked: false,
    followed: false,
    flagged: false,
    likeCount: 0,
    followerCount: 0,
    commentCount: 0,
    type: dto.type || 'general',
  };
};

function CampaignDetailsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignIdStr = searchParams.get('id');
  const campaignId = campaignIdStr ? parseInt(campaignIdStr, 10) : null;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [posts] = useState<CampaignPost[]>(mockPosts);

  const comments = useMemo(() => [...mockComments], []);

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
        const [dto, activeGoal] = await Promise.all([
          campaignService.getById(campaignId),
          campaignService.getActiveGoalByCampaignId(campaignId),
        ]);

        let owner = { name: '', avatar: '/assets/img/about/01.jpg' };
        try {
          const userRes = await userService.getUserById(dto.fundOwnerId);
          if (userRes.success && userRes.data) {
            owner.name = userRes.data.fullName;
            owner.avatar = userRes.data.avatarUrl || owner.avatar;
          }
        } catch (uErr) {
          console.warn('Failed to fetch owner info', uErr);
        }

        let galleryUrls: string[] = [];
        let finalCoverUrl = '';

        try {
          // Get media by Campaign ID to ensure all campaign images are fetched
          const mediaList = await mediaService.getMediaByCampaignId(campaignId);
          if (mediaList && mediaList.length > 0) {
            // Identify cover image by matching coverImage ID from DTO
            const coverMedia = mediaList.find(m => m.id === dto.coverImage);
            finalCoverUrl = coverMedia ? coverMedia.url : mediaList[0].url;

            // Sort to put cover image (coverImage ID) first
            const sortedMedia = [...mediaList].sort((a, b) => {
              if (a.id === dto.coverImage) return -1;
              if (b.id === dto.coverImage) return 1;
              return 0;
            });
            galleryUrls = sortedMedia.map(m => m.url);
          }
        } catch (mErr) {
          console.warn('Failed to fetch media list', mErr);
        }

        if (!mounted) return;
        setCampaign(mapCampaignDtoToUi(dto, activeGoal, owner, galleryUrls, finalCoverUrl));
      } catch {
        if (!mounted) return;
        setError('Không thể tải thông tin chiến dịch');
      } finally {
        if (!mounted) return;
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
      <DanboxLayout>
        <section className="causes-details-section fix section-padding" style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}>
          <div className="container" style={{ padding: '80px 0' }}>
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                gap: 48,
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
              <div style={{ minWidth: 0, marginTop: 86 }}>
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
      <DanboxLayout>
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
      <DanboxLayout>
        <div className="container" style={{ padding: '80px 0', fontFamily: 'var(--font-dm-sans)' }}>
          <div>{error || 'Không tìm thấy chiến dịch'}</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout>
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
              gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
              gap: 48,
              alignItems: 'start',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <CampaignHeader
                campaign={campaign}
                onToggleLike={() =>
                  setCampaign((c) =>
                    c
                      ? {
                        ...c,
                        liked: !c.liked,
                        likeCount: c.liked ? Math.max(0, c.likeCount - 1) : c.likeCount + 1,
                      }
                      : c
                  )
                }
                onToggleFollow={() =>
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
                  )
                }
                onToggleFlag={() => setCampaign((c) => (c ? { ...c, flagged: !c.flagged } : c))}
              />

              <div className="single-sidebar-widgets" style={{ marginTop: 24, marginBottom: 24 }}>
                <div className="widget-title">
                  <h4>Người theo dõi</h4>
                </div>
                <FollowersRow
                  followers={campaign.followers}
                  onClick={() => {
                    alert('Chức năng danh sách người theo dõi chưa thực hiện');
                  }}
                />
              </div>

              <CampaignCommentsCard comments={comments} />
            </div>

            <div style={{ minWidth: 0, marginTop: 86 }}>
              <div className="casues-sidebar-wrapper">
                <div style={{ marginBottom: 18 }}>
                  <CampaignDonateCard
                    raisedAmount={campaign.raisedAmount}
                    goalAmount={campaign.goalAmount}
                    onDonate={(amount) => {
                      const fundType = campaign.type?.toUpperCase() === 'ITEMIZED' ? 'item' : 'general';
                      const params = new URLSearchParams({
                        campaignId: String(campaignId),
                        amount: String(amount),
                        fundType,
                      });
                      router.push(`/donation?${params.toString()}`);
                    }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <PlansList
                    plans={mockPlans}
                    onOpenPlan={(planId) => {
                      alert(`Chi tiết kế hoạch: ${planId} (chưa thực hiện)`);
                    }}
                  />
                </div>

                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 16,
                    padding: 16,
                    background: '#fff',
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ marginBottom: 14 }}
                  >
                    <div className="widget-title" style={{ marginBottom: 0 }}>
                      <h4 style={{ marginBottom: 0 }}>Bài viết</h4>
                    </div>

                    <button
                      type="button"
                      className="text-sm"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        color: '#0F5D51',
                        fontWeight: 700,
                      }}
                      onClick={() => alert('Xem thêm bài viết (tính năng chưa thực hiện)')}
                    >
                      Xem thêm
                    </button>
                  </div>

                  <PostsFeed
                    posts={posts}
                    campaignCreatorId={campaign.creator.id}
                    onOpenPost={(postId) => alert(`Chi tiết bài viết: ${postId} (chưa thực hiện)`)}
                  />
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
              margin-top: 24px;
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
    </DanboxLayout>
  );
}

export default function CampaignDetailsPage() {
  return (
    <Suspense
      fallback={
        <DanboxLayout>
          <section className="causes-details-section fix section-padding" style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}>
            <div className="container" style={{ padding: '80px 0' }}>
              <div
                style={{
                  maxWidth: 1200,
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                  gap: 48,
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
                <div style={{ minWidth: 0, marginTop: 86 }}>
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
