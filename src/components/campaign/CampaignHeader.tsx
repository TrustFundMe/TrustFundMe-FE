"use client";

import { useMemo } from "react";
import type { Campaign } from "./types";
import CampaignActions from "./CampaignActions";
import CampaignImageSlider from "./CampaignImageSlider";
import CreatorInfo from "./CreatorInfo";

export default function CampaignHeader({
  campaign,
  onToggleLike,
  onToggleFollow,
  onToggleFlag,
}: {
  campaign: Campaign;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onToggleFlag: () => void;
}) {
  const sliderImages = useMemo(() => {
    const list = campaign.galleryImages?.length
      ? campaign.galleryImages
      : [campaign.coverImage];
    return list.filter(Boolean);
  }, [campaign.coverImage, campaign.galleryImages]);

  return (
    <div className="causes-details-items">
      <div style={{ marginBottom: 10 }}>
        <div className="mb-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 9999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(248, 77, 67, 0.08)",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            <i className="far fa-heart" style={{ opacity: 0.8 }} />
            {campaign.category.toUpperCase()}
          </span>
        </div>

        <h2
          style={{
            marginBottom: 0,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 800,
            lineHeight: 1.15,
            fontSize: 34,
          }}
        >
          {campaign.title}
        </h2>
      </div>

      <CampaignImageSlider images={sliderImages} alt={campaign.title} />

      <div className="details-content" style={{ paddingTop: 16 }}>
        <div style={{ marginTop: 8, marginBottom: 18 }}>
          <CreatorInfo user={campaign.creator} />
        </div>

        <div className="mt-4">
          <CampaignActions
            liked={campaign.liked}
            followed={campaign.followed}
            flagged={campaign.flagged}
            likeCount={campaign.likeCount}
            followerCount={campaign.followerCount}
            onToggleLike={onToggleLike}
            onToggleFollow={onToggleFollow}
            onToggleFlag={onToggleFlag}
          />
        </div>

        <div className="causes-contents mt-4">
          <p className="mb-0" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {campaign.description}
          </p>
        </div>
      </div>
    </div>
  );
}
