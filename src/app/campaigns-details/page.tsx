"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useEffect, useMemo, useState } from "react";

import CampaignDonateCard from "@/components/campaign/CampaignDonateCard";
import CampaignHeader from "@/components/campaign/CampaignHeader";
import CampaignCommentsCard from "@/components/campaign/CampaignCommentsCard";
import FollowersRow from "@/components/campaign/FollowersRow";
import PlansList from "@/components/campaign/PlansList";
import PostsFeed from "@/components/campaign/PostsFeed";
import {
  mockComments,
  mockPlans,
  mockPosts,
} from "@/components/campaign/mock";
import type { Campaign, CampaignPost } from "@/components/campaign/types";
import { useSearchParams } from "next/navigation";
import { campaignService } from "@/services/campaignService";
import type { CampaignDto } from "@/types/campaign";
import { mockCampaign } from "@/components/campaign/mock";
import { withFallbackImage } from "@/lib/image";

const mapCampaignDtoToUi = (dto: CampaignDto): Campaign => {
  return {
    id: String(dto.id),
    title: dto.title,
    category: dto.status ?? "Campaign",
    description: dto.description ?? "",
    coverImage: withFallbackImage(dto.coverImage, "/assets/img/campaign/1.jpg"),
    galleryImages: [withFallbackImage(dto.coverImage, "/assets/img/campaign/1.jpg")],
    goalAmount: 0,
    raisedAmount: dto.balance ?? 0,
    creator: {
      id: String(dto.fundOwnerId),
      name: `Fund Owner #${dto.fundOwnerId}`,
      avatar: "/assets/img/about/01.jpg",
    },
    followers: [],
    liked: false,
    followed: false,
    flagged: false,
    likeCount: 0,
    followerCount: 0,
    commentCount: 0,
  };
};

const CampaignDetailsPage = () => {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const campaignId = idParam ? Number(idParam) : NaN;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [posts] = useState<CampaignPost[]>(mockPosts);

  const comments = useMemo(() => [...mockComments], []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setError("");

      if (!Number.isFinite(campaignId) || campaignId <= 0) {
        setError("Invalid campaign id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const dto = await campaignService.getById(campaignId);
        if (!mounted) return;
        setCampaign(mapCampaignDtoToUi(dto));
      } catch {
        if (!mounted) return;
        setError("Failed to load campaign");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  if (loading) {
    return (
      <DanboxLayout>
        <div
          className="container"
          style={{ padding: "80px 0", fontFamily: "var(--font-dm-sans)" }}
        >
          <div>Loading...</div>
        </div>
      </DanboxLayout>
    );
  }

  // Backward compatibility: old UI used slug-like ids (e.g. community-kitchens-2)
  // If a non-numeric id is provided, fall back to mock data so the page still renders.
  if (!Number.isFinite(campaignId)) {
    return (
      <DanboxLayout>
        <div
          className="container"
          style={{ padding: "80px 0", fontFamily: "var(--font-dm-sans)" }}
        >
          <div style={{ marginBottom: 12, fontWeight: 700 }}>
            This campaign id is not numeric, so API fetch is skipped.
          </div>
          <div style={{ marginBottom: 24 }}>
            Please open a campaign from the campaigns list to use the real API id.
          </div>
        </div>
      </DanboxLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DanboxLayout>
        <div
          className="container"
          style={{ padding: "80px 0", fontFamily: "var(--font-dm-sans)" }}
        >
          <div>{error || "Campaign not found"}</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout>
      <section
        className="causes-details-section fix section-padding"
        style={{ paddingTop: 0, fontFamily: "var(--font-dm-sans)" }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
              gap: 48,
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <CampaignHeader
                campaign={campaign}
                onToggleLike={() =>
                  setCampaign((c) => ({
                    ...c,
                    liked: !c.liked,
                    likeCount: c.liked
                      ? Math.max(0, c.likeCount - 1)
                      : c.likeCount + 1,
                  }))
                }
                onToggleFollow={() =>
                  setCampaign((c) => ({
                    ...c,
                    followed: !c.followed,
                    followerCount: c.followed
                      ? Math.max(0, c.followerCount - 1)
                      : c.followerCount + 1,
                  }))
                }
                onToggleFlag={() =>
                  setCampaign((c) => ({ ...c, flagged: !c.flagged }))
                }
              />

              <div
                className="single-sidebar-widgets"
                style={{ marginTop: 24, marginBottom: 24 }}
              >
                <div className="widget-title">
                  <h4>Followers</h4>
                </div>
                <FollowersRow
                  followers={campaign.followers}
                  onClick={() => {
                    alert("Go to followers list page (route not implemented)");
                  }}
                />
              </div>

              <CampaignCommentsCard comments={comments} />

              <CampaignDonateCard
                raisedAmount={campaign.raisedAmount}
                goalAmount={campaign.goalAmount}
                onDonate={(amount) => alert(`Donate: $${amount}`)}
              />
            </div>

            <div style={{ minWidth: 0, marginTop: 86 }}>
              <div className="casues-sidebar-wrapper">
                <div style={{ marginBottom: 18 }}>
                  <PlansList
                    plans={mockPlans}
                    onOpenPlan={(planId) => {
                      alert(
                        `Go to plan details page: ${planId} (route not implemented)`,
                      );
                    }}
                  />
                </div>

                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    borderRadius: 16,
                    padding: 16,
                    background: "#fff",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ marginBottom: 14 }}
                  >
                    <div className="widget-title" style={{ marginBottom: 0 }}>
                      <h4 style={{ marginBottom: 0 }}>Posts</h4>
                    </div>

                    <button
                      type="button"
                      className="text-sm"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        color: "#0F5D51",
                        fontWeight: 700,
                      }}
                      onClick={() =>
                        alert("See more posts (route not implemented)")
                      }
                    >
                      See more
                    </button>
                  </div>

                  <PostsFeed
                    posts={posts}
                    campaignCreatorId={campaign.creator.id}
                    onOpenPost={(postId) =>
                      alert(
                        `Open post details: ${postId} (route not implemented)`,
                      )
                    }
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
};

export default CampaignDetailsPage;
