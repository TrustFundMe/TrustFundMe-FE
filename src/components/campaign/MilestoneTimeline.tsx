"use client";

import { useMemo } from "react";
import type { CampaignPlan } from "./types";

type TimelineState = "completed" | "active" | "upcoming";

function getDisbursementLabel(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "DISBURSED") return "Đã giải ngân";
  if (s === "APPROVED") return "Đã duyệt chi";
  if (s === "PENDING_REVIEW" || s === "PENDING") return "Chờ duyệt";
  if (s === "REJECTED") return "Từ chối";
  if (s === "CLOSED") return "Hoàn tất";
  return "";
}

function getDisbursementColor(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "DISBURSED") return "#10b981";
  if (s === "APPROVED") return "#3b82f6";
  if (s === "PENDING_REVIEW" || s === "PENDING") return "#f59e0b";
  if (s === "REJECTED") return "#ef4444";
  if (s === "CLOSED") return "#6b7280";
  return "#94a3b8";
}

function stateColor(state: TimelineState) {
  if (state === "completed") return "#10b981";
  if (state === "active") return "#ff5e14";
  return "#cbd5e1";
}

function stateLabel(state: TimelineState) {
  if (state === "completed") return "Hoàn thành";
  if (state === "active") return "Đang thực hiện";
  return "Chưa mở";
}

export default function MilestoneTimeline({
  plans,
  raisedAmount = 0,
}: {
  plans: CampaignPlan[];
  raisedAmount?: number;
}) {
  if (!plans || plans.length === 0) return null;

  const timeline = useMemo(() => {
    let cumulative = 0;
    return plans.map((plan, idx) => {
      const amount = Math.max(0, plan.amount || 0);
      const min = cumulative;
      const max = cumulative + amount;
      cumulative = max;

      let state: TimelineState = "upcoming";
      if (raisedAmount >= max && amount > 0) state = "completed";
      else if (raisedAmount > min || idx === 0) state = "active";

      const segmentProgress =
        state === "completed"
          ? 100
          : state === "active" && amount > 0
          ? Math.min(100, Math.max(0, ((raisedAmount - min) / amount) * 100))
          : 0;

      return {
        ...plan,
        state,
        thresholdStart: min,
        thresholdEnd: max,
        requiredAmount: amount,
        missingToUnlock: Math.max(0, max - raisedAmount),
        segmentProgress,
      };
    });
  }, [plans, raisedAmount]);

  const totalGoal = timeline[timeline.length - 1]?.thresholdEnd || 0;
  const overallPercent = totalGoal > 0 ? Math.min(100, (raisedAmount / totalGoal) * 100) : 0;
  const completedCount = timeline.filter((t) => t.state === "completed").length;

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "20px 20px 16px",
        background: "#fff",
        marginBottom: 14,
        border: "1px solid rgba(15,23,42,0.10)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
            Milestone chiến dịch
          </h4>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
            {completedCount}/{timeline.length} mốc hoàn thành
          </p>
        </div>
        <div
          style={{
            background: overallPercent > 0 ? "#fff7ed" : "#f8fafc",
            border: `1px solid ${overallPercent > 0 ? "#fed7aa" : "#e2e8f0"}`,
            borderRadius: 10,
            padding: "6px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: overallPercent > 0 ? "#ea580c" : "#94a3b8" }}>
            {overallPercent.toFixed(0)}%
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
            tiến độ
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.max(overallPercent, overallPercent > 0 ? 2 : 0)}%`,
              background: "linear-gradient(90deg, #ff5e14, #f97316)",
              borderRadius: 99,
              transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
            Đã huy động: <span style={{ color: "#0f172a", fontWeight: 800 }}>{raisedAmount.toLocaleString("vi-VN")}đ</span>
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
            Tổng: <span style={{ color: "#0f172a", fontWeight: 800 }}>{totalGoal.toLocaleString("vi-VN")}đ</span>
          </span>
        </div>
      </div>

      {/* Vertical stepper timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {timeline.map((item, idx) => {
          const color = stateColor(item.state);
          const isActive = item.state === "active";
          const isCompleted = item.state === "completed";
          const isUpcoming = item.state === "upcoming";
          const isLast = idx === timeline.length - 1;
          const disbLabel = getDisbursementLabel(item.status);
          const disbColor = getDisbursementColor(item.status);

          return (
            <div key={item.id} style={{ display: "flex", gap: 14 }}>
              {/* Left: stepper line + node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                {/* Node */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isCompleted ? color : "#fff",
                    border: `3px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 0 4px ${color}20` : undefined,
                    transition: "all 300ms ease",
                  }}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7.5L5.5 10L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 900, color: isActive ? color : "#94a3b8" }}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 16,
                      background: isCompleted ? "#10b981" : "#e2e8f0",
                      borderRadius: 99,
                    }}
                  />
                )}
              </div>

              {/* Right: card content */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: isActive ? `1.5px solid ${color}40` : "1px solid rgba(15,23,42,0.08)",
                  background: isActive ? "#fffbf7" : isCompleted ? "#f0fdf4" : "#fafbfc",
                  padding: "12px 16px",
                  marginBottom: isLast ? 0 : 8,
                  position: "relative",
                }}
              >
                {/* State label */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: color,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isActive && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                    )}
                    {stateLabel(item.state)}
                  </span>
                  {disbLabel && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: disbColor,
                        background: `${disbColor}14`,
                        padding: "2px 8px",
                        borderRadius: 99,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {disbLabel}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isUpcoming ? "#94a3b8" : "#0f172a",
                    lineHeight: 1.3,
                    marginBottom: 2,
                  }}
                >
                  {item.title || `Đợt ${idx + 1}`}
                </div>

                {/* Date */}
                {item.date && (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10, fontWeight: 500 }}>
                    {item.date}
                  </div>
                )}

                {/* Amounts */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 120,
                      background: isUpcoming ? "#f1f5f9" : "#fff",
                      border: "1px solid rgba(15,23,42,0.06)",
                      borderRadius: 8,
                      padding: "8px 10px",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Mục tiêu</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isUpcoming ? "#94a3b8" : "#0f172a" }}>
                      {(item.requiredAmount || 0).toLocaleString("vi-VN")}
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginLeft: 3 }}>đ</span>
                    </div>
                  </div>
                  {!isCompleted && (
                    <div
                      style={{
                        flex: 1,
                        minWidth: 120,
                        background: isActive ? "#fff5f0" : isUpcoming ? "#f1f5f9" : "#fff",
                        border: `1px solid ${isActive ? "#fed7aa" : "rgba(15,23,42,0.06)"}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Còn thiếu</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: isActive ? "#ea580c" : "#94a3b8" }}>
                        {(item.missingToUnlock || 0).toLocaleString("vi-VN")}
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginLeft: 3 }}>đ</span>
                      </div>
                    </div>
                  )}
                  {isCompleted && (
                    <div
                      style={{
                        flex: 1,
                        minWidth: 120,
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#10b981" />
                        <path d="M5 8.5L7 10.5L11 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Đã đạt mốc</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for active */}
                {isActive && item.requiredAmount > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Tiến độ mốc này</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#ea580c" }}>
                        {item.segmentProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "#fee2e2", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${item.segmentProgress}%`,
                          background: "linear-gradient(90deg, #ff5e14, #f97316)",
                          borderRadius: 99,
                          transition: "width 600ms ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
