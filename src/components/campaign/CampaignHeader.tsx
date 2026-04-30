"use client";

import { useMemo } from "react";
import { FileText, ExternalLink } from "lucide-react";
import type { Campaign, CampaignFollower, CampaignMedia } from "./types";
import CampaignActions from "./CampaignActions";
import CampaignImageSlider from "./CampaignImageSlider";
import CreatorInfo from "./CreatorInfo";

export default function CampaignHeader({
  campaign,
  onToggleFollow,
  onToggleFlag,
  onSubmitFlag,
  onShowTrustScore,
  followers = [],
}: {
  campaign: Campaign;
  onToggleFollow: () => void;
  onToggleFlag: () => void;
  onSubmitFlag?: (reason: string) => Promise<void>;
  onShowTrustScore?: () => void;
  followers?: CampaignFollower[];
}) {
  const sliderImages = useMemo(() => {
    const list = campaign.galleryImages?.length
      ? campaign.galleryImages
      : [campaign.coverImage];
    return list.filter(Boolean);
  }, [campaign.coverImage, campaign.galleryImages]);

  const fileAttachments = useMemo(
    () => (campaign.attachments || []).filter((a) => a.type === "FILE"),
    [campaign.attachments]
  );

  const openFile = (file: CampaignMedia) => {
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <div style={{ marginTop: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 9999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255, 94, 20, 0.08)",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            {campaign.categoryIconUrl ? (
              <img
                src={campaign.categoryIconUrl}
                alt={campaign.category}
                style={{ width: 20, height: 20, objectFit: "contain" }}
              />
            ) : null}
            {campaign.category.toUpperCase()}
          </span>
        </div>

        <h2
          style={{
            marginBottom: 2,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 800,
            lineHeight: 1.12,
            fontSize: 34,
          }}
        >
          {campaign.title}
        </h2>
      </div>

      <CampaignImageSlider images={sliderImages} alt={campaign.title} />

      {fileAttachments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: 10, fontWeight: 900, color: "rgba(0,0,0,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Tệp đính kèm
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fileAttachments.map((file) => (
              <button
                key={file.id}
                onClick={() => openFile(file)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#f9fafb",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <FileText style={{ width: 16, height: 16, color: "#ff5e14" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name || "Tệp đính kèm"}
                  </p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Tải xuống để xem
                  </p>
                </div>
                <ExternalLink style={{ width: 16, height: 16, color: "rgba(0,0,0,0.2)", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ paddingTop: 16 }}>
        <div style={{ marginTop: 8, marginBottom: 18 }}>
          <CreatorInfo user={campaign.creator} onShowTrustScore={onShowTrustScore} />
        </div>

        <div style={{ marginTop: 16 }}>
          <CampaignActions
            followed={campaign.followed}
            flagged={campaign.flagged}
            followerCount={campaign.followerCount}
            followers={followers}
            onToggleFollow={onToggleFollow}
            onToggleFlag={onToggleFlag}
            onSubmitFlag={onSubmitFlag}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 0, fontFamily: "var(--font-dm-sans)" }}>
            {campaign.description}
          </p>
        </div>
      </div>
    </div>
  );
}
