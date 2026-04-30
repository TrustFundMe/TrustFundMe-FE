"use client";

import { useMemo } from "react";
import type { CampaignPlan } from "./types";

type TimelineState = "completed" | "active" | "upcoming";

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

      return { ...plan, state, thresholdStart: min, thresholdEnd: max, requiredAmount: amount };
    });
  }, [plans, raisedAmount]);

  const totalGoal = timeline[timeline.length - 1]?.thresholdEnd || 0;
  const overallPercent = totalGoal > 0 ? Math.min(100, (raisedAmount / totalGoal) * 100) : 0;
  const completedCount = timeline.filter((t) => t.state === "completed").length;

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "16px 20px 14px",
        background: "#fff",
        marginBottom: 14,
        border: "1px solid rgba(15,23,42,0.10)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          Milestone
        </h4>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
          {completedCount}/{timeline.length} hoàn thành
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          height: 8,
          borderRadius: 99,
          background: "#e2e8f0",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${Math.max(overallPercent, overallPercent > 0 ? 2 : 0)}%`,
            borderRadius: 99,
            background: overallPercent >= 100 ? "#10b981" : "linear-gradient(90deg, #ff5e14, #f97316)",
            transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {timeline.slice(0, -1).map((item, i) => {
          const pos = totalGoal > 0 ? (item.thresholdEnd / totalGoal) * 100 : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${pos}%`,
                top: 0,
                width: 2,
                height: "100%",
                background: "#fff",
                transform: "translateX(-1px)",
                zIndex: 1,
              }}
            />
          );
        })}
      </div>

      {/* Labels — equal columns, not proportional */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${timeline.length}, 1fr)`, gap: 8 }}>
        {timeline.map((item, idx) => {
          const isActive = item.state === "active";
          const isCompleted = item.state === "completed";
          const labelColor = isActive ? "#ff5e14" : isCompleted ? "#10b981" : "#94a3b8";
          const isLast = idx === timeline.length - 1;

          return (
            <div
              key={item.id}
              style={{
                minWidth: 0,
                textAlign: isLast ? "right" : "left",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: labelColor,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={item.title || `Đợt ${idx + 1}`}
              >
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ marginRight: 3, verticalAlign: "-1px" }}>
                    <path d="M3 7.5L5.5 10L11 4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {item.title || `Đợt ${idx + 1}`}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#b0b8c4" }}>
                {(item.requiredAmount || 0).toLocaleString("vi-VN")}đ
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
          Đã huy động: <span style={{ color: "#0f172a", fontWeight: 800 }}>{raisedAmount.toLocaleString("vi-VN")}đ</span>
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: overallPercent > 0 ? "#ff5e14" : "#94a3b8" }}>
          {overallPercent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
