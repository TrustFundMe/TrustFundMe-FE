"use client";

import Image from "next/image";
import type { CampaignPlan } from "./types";

function AvatarStack({ avatars }: { avatars: string[] }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        bottom: 10,
        display: "flex",
        alignItems: "center",
      }}
    >
      {avatars.slice(0, 3).map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            overflow: "hidden",
            border: "2px solid #fff",
            marginLeft: idx === 0 ? 0 : -8,
            background: "rgba(0,0,0,0.06)",
          }}
        >
          <Image
            src={src}
            alt="avatar"
            width={24}
            height={24}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}

function accentForStatus(status: string) {
  switch (status) {
    case 'DISBURSED': return '#10b981'; // Emerald 500
    case 'APPROVED': return '#3b82f6'; // Blue 500
    case 'PENDING':
    case 'PENDING_REVIEW': return '#f59e0b'; // Amber 500
    case 'REJECTED': return '#ef4444'; // Red 500
    case 'CLOSED': return '#6b7280'; // Gray 500
    default: return '#10b981';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING': return 'Đang chờ xử lý';
    case 'APPROVED': return 'Đã duyệt';
    case 'PENDING_REVIEW': return 'Chờ duyệt';
    case 'DISBURSED': return 'Đã giải ngân';
    case 'REJECTED': return 'Bị từ chối';
    case 'CLOSED': return 'Đã hoàn tất';
    default: return status;
  }
}

function PlanCard({ plan, onOpen }: { plan: CampaignPlan; onOpen: () => void }) {
  const status = plan.status || 'PENDING';
  const accent = accentForStatus(status);

  const avatars =
    status === "DISBURSED" || status === "APPROVED"
      ? ["/assets/img/defaul.jpg"]
      : ["/assets/img/defaul.jpg"];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-100"
      style={{
        textAlign: "left",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 14,
        padding: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: accent,
        }}
      />

      <div style={{ paddingLeft: 8 }}>
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="fw-bold" style={{ lineHeight: 1.2, fontSize: 14 }}>
              {plan.title}
            </div>
          </div>

          <div className="fw-bold text-end" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
            {plan.amount.toLocaleString()} VNĐ
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mt-1">
          <span 
            style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              color: accent,
              background: `${accent}15`,
              padding: '2px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {getStatusText(status)}
          </span>
          <span style={{ fontSize: 11, opacity: 0.5 }}>•</span>
          <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 500 }}>
             {plan.date}
          </span>
        </div>

        <div style={{ marginTop: 8, opacity: 0.7, lineHeight: 1.45, fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {plan.description}
        </div>
      </div>

      {avatars.length ? <AvatarStack avatars={avatars} /> : null}
    </button>
  );
}

export default function PlansList({
  plans,
  onOpenPlan,
}: {
  plans: CampaignPlan[];
  onOpenPlan: (planId: string) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 16,
        padding: 16,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h4 style={{ marginBottom: 0, fontSize: 18, fontWeight: 700 }}>
          Kế hoạch chi tiêu
        </h4>

        <button
          type="button"
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            color: "var(--theme)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
          onClick={() => alert("Xem thêm kế hoạch (tính năng chưa thực hiện)")}
        >
          Xem thêm
        </button>
      </div>

      <div className="d-flex flex-column" style={{ gap: 10 }}>
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} onOpen={() => onOpenPlan(p.id)} />
        ))}
      </div>
    </div>
  );
}
