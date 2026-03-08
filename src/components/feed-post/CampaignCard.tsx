"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, BellOff, AlertTriangle } from "lucide-react";
import { campaignService } from "@/services/campaignService";
import { useAuth } from "@/contexts/AuthContextProxy";

export type CampaignInfo = {
  id: string;
  title: string;
  image: string;
  raised: number;
  goal: number;
  progress: number;
  status?: string;
};

interface CampaignCardProps {
  campaign: CampaignInfo;
  compact?: boolean;
}

export default function CampaignCard({
  campaign,
  compact = true,
}: CampaignCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const progress = campaign.progress || Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
  const isDisabled = campaign.status === 'DISABLED';

  useEffect(() => {
    if (!isAuthenticated || compact) return;
    campaignService.isFollowing(Number(campaign.id)).then(setIsFollowing).catch(() => {});
  }, [campaign.id, isAuthenticated, compact]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || followLoading) return;
    setFollowLoading(true);
    const prev = isFollowing;
    setIsFollowing(!isFollowing);
    try {
      if (prev) {
        await campaignService.unfollowCampaign(Number(campaign.id));
      } else {
        await campaignService.followCampaign(Number(campaign.id));
      }
    } catch {
      setIsFollowing(prev);
    } finally {
      setFollowLoading(false);
    }
  };

  if (compact) {
    return (
      <Link
        href={`/campaigns-details?id=${campaign.id}`}
        className="block"
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#fafafa",
            border: `1px solid ${isDisabled ? "rgba(248, 77, 67, 0.4)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 8,
            overflow: "hidden",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f5f5";
            e.currentTarget.style.borderColor = isDisabled ? "rgba(248, 77, 67, 0.6)" : "rgba(26, 104, 91, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fafafa";
            e.currentTarget.style.borderColor = isDisabled ? "rgba(248, 77, 67, 0.4)" : "rgba(0,0,0,0.08)";
          }}
        >
          {isDisabled && (
            <div
              style={{
                background: "#F84D43",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                textAlign: "center",
                padding: "2px 4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Vô hiệu hóa
            </div>
          )}
          <div style={{ display: "flex", gap: 12, padding: 12 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                overflow: "hidden",
                flex: "0 0 auto",
                background: "#e5e5e5",
              }}
            >
              <Image
                src={campaign.image}
                alt={campaign.title}
                width={80}
                height={80}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#1A685B",
                  marginBottom: 4,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Related Campaign
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: 8,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {campaign.title}
              </div>
              <div
                style={{
                  height: 4,
                  background: "rgba(0,0,0,0.08)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#1A685B",
                    width: `${progress}%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.6)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {campaign.raised.toLocaleString('vi-VN')} / {campaign.goal.toLocaleString('vi-VN')} VNĐ
                <span style={{ fontWeight: 600, color: "#1A685B" }}>
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/campaigns-details?id=${campaign.id}`}
      className="block"
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: 16,
          paddingTop: isDisabled ? 0 : 16,
          background: "#fafafa",
          border: `1px solid ${isDisabled ? "rgba(248, 77, 67, 0.4)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 12,
          overflow: "hidden",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f5f5f5";
          e.currentTarget.style.borderColor = isDisabled ? "rgba(248, 77, 67, 0.6)" : "rgba(26, 104, 91, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fafafa";
          e.currentTarget.style.borderColor = isDisabled ? "rgba(248, 77, 67, 0.4)" : "rgba(0,0,0,0.08)";
        }}
      >
        {isDisabled && (
          <div
            style={{
              background: "#F84D43",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 16px",
              margin: "0 -16px 16px -16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            Chiến dịch đã bị vô hiệu hóa
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#1A685B",
            marginBottom: 12,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Chiến dịch liên quan
        </div>
        <div
          style={{
            width: "100%",
            height: 200,
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 12,
            background: "#e5e5e5",
          }}
        >
          <Image
            src={campaign.image}
            alt={campaign.title}
            width={400}
            height={200}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 12,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {campaign.title}
        </div>
        <div
          style={{
            height: 6,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#1A685B",
              width: `${progress}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          <span>
            {campaign.raised.toLocaleString('vi-VN')} / {campaign.goal.toLocaleString('vi-VN')} VNĐ
          </span>
          <span style={{ fontWeight: 600, color: "#1A685B" }}>
            {progress}%
          </span>
        </div>
      </div>
    </Link>
  );
}
