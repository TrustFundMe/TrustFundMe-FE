"use client";

import type { CampaignPlan } from "./types";

function accentForStatus(status: string) {
  switch (status) {
    case "DISBURSED": return "#10b981";
    case "APPROVED": return "#3b82f6";
    case "PENDING":
    case "PENDING_REVIEW": return "#f59e0b";
    case "REJECTED": return "#ef4444";
    case "CLOSED": return "#6b7280";
    default: return "#94a3b8";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "PENDING": return "Chờ xử lý";
    case "APPROVED": return "Đã duyệt";
    case "PENDING_REVIEW": return "Chờ duyệt";
    case "DISBURSED": return "Đã giải ngân";
    case "REJECTED": return "Từ chối";
    case "CLOSED": return "Hoàn tất";
    default: return status;
  }
}

function PlanCard({
  plan,
  index,
  onOpen,
}: {
  plan: CampaignPlan;
  index: number;
  onOpen: () => void;
}) {
  const status = plan.status || "PENDING";
  const accent = accentForStatus(status);

  return (
    <div
      style={{
        textAlign: "left",
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 200ms",
      }}
    >
      {/* Colored top accent */}
      <div style={{ height: 3, background: accent }} />

      <div style={{ padding: "12px 14px" }}>
        {/* Header row: title + amount */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: accent,
                  background: `${accent}15`,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                {plan.title}
              </span>
            </div>
            {plan.totalItems !== undefined && (
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, paddingLeft: 28 }}>
                {plan.categories?.length || 0} nhóm &middot; {plan.totalItems} hạng mục
              </div>
            )}
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
              {plan.amount.toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>VNĐ</div>
          </div>
        </div>

        {/* Status + date row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              background: `${accent}12`,
              padding: "2px 10px",
              borderRadius: 99,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {getStatusText(status)}
          </span>
          {plan.date && (
            <>
              <span style={{ fontSize: 10, color: "#cbd5e1" }}>&middot;</span>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                {plan.date}
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {plan.description && plan.description.trim().toLowerCase() !== plan.title.trim().toLowerCase() && (
          <div
            style={{
              marginTop: 8,
              color: "#64748b",
              lineHeight: 1.4,
              fontSize: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {plan.description}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <button
            type="button"
            onClick={onOpen}
            style={{
              border: "1px solid rgba(15,23,42,0.10)",
              background: "#fff",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: "#ff5e14",
              cursor: "pointer",
              transition: "background 150ms",
            }}
          >
            Mở hồ sơ chi tiêu
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PlansList({
  plans,
  onOpenPlan,
}: {
  plans: CampaignPlan[];
  onOpenPlan: (planId: string) => void;
}) {
  if (!plans || plans.length === 0) {
    return (
      <div
        style={{
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 14,
          padding: "20px 16px",
          background: "#fff",
        }}
      >
        <h4 style={{ marginBottom: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          Đợt chi tiêu
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Chưa có đợt chi tiêu nào.
        </p>
      </div>
    );
  }

  const totalBudget = plans.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 14,
        padding: "16px 14px",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <h4 style={{ marginBottom: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          Đợt chi tiêu
        </h4>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
          {plans.length} đợt
        </span>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
        Chỉ hiển thị bản tóm tắt. Bấm xem chi tiết khi cần.
      </p>

      {/* Total budget summary */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Tổng ngân sách dự kiến</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          {totalBudget.toLocaleString("vi-VN")} <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>VNĐ</span>
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plans.map((p, idx) => (
          <PlanCard
            key={p.id}
            plan={p}
            index={idx}
            onOpen={() => onOpenPlan(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
