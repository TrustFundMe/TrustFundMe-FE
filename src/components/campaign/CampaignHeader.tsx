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
            {campaign.categoryIconUrl ? (
              <img
                src={campaign.categoryIconUrl}
                alt={campaign.category}
                className="h-5 w-5 object-contain"
              />
            ) : null}
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

      {/* Tệp đính kèm — ngay bên dưới ảnh */}
      {fileAttachments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3">
            Tệp đính kèm
          </h4>
          <div className="flex flex-col gap-2">
            {fileAttachments.map((file) => (
              <button
                key={file.id}
                onClick={() => openFile(file)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/8 bg-gray-50 hover:bg-gray-100 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="h-4 w-4 text-[#dc2626]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-black group-hover:text-[#dc2626] transition-colors truncate">
                    {file.name || "Tệp đính kèm"}
                  </p>
                  <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest">
                    Tải xuống để xem
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-black/20 group-hover:text-[#dc2626] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="details-content" style={{ paddingTop: 16 }}>
        <div style={{ marginTop: 8, marginBottom: 18 }}>
          <CreatorInfo user={campaign.creator} onShowTrustScore={onShowTrustScore} />
        </div>

        <div className="mt-4">
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

        <div className="causes-contents mt-4">
          <p className="mb-0" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {campaign.description}
          </p>
        </div>
      </div>
    </div>
  );
}
