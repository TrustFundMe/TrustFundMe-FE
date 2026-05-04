"use client";

import { useMemo, useState } from "react";
import type { CampaignPlan } from "./types";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";

type TimelineState = "completed" | "active" | "upcoming";

function getStatusLabel(status: string): string {
  switch ((status || "").toUpperCase()) {
    case "PENDING": return "Chờ xử lý";
    case "PENDING_REVIEW": return "Chờ duyệt";
    case "APPROVED": return "Đã duyệt";
    case "ALLOWED_EDIT": return "Yêu cầu chỉnh sửa";
    case "WITHDRAWAL_REQUESTED": return "Đã yêu cầu rút tiền";
    case "DISBURSED": return "Đã giải ngân";
    case "COMPLETED": return "Hoàn thành";
    case "CLOSED": return "Đã đóng";
    case "REJECTED": return "Từ chối";
    default: return status || "Chưa xác định";
  }
}

export default function MilestoneTimeline({
  plans,
  raisedAmount = 0,
}: {
  plans: CampaignPlan[];
  raisedAmount?: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const timeline = useMemo(() => {
    return plans.map((plan) => {
      const amount = Math.max(0, plan.amount || 0);
      const status = (plan.status || "").toUpperCase();

      let state: TimelineState = "upcoming";
      if (["DISBURSED", "COMPLETED", "CLOSED"].includes(status)) state = "completed";
      else if (["APPROVED", "WITHDRAWAL_REQUESTED", "PENDING_REVIEW", "PENDING", "ALLOWED_EDIT"].includes(status)) state = "active";

      return { ...plan, state, requiredAmount: amount };
    });
  }, [plans]);

  if (!plans || plans.length === 0) return null;

  const completedCount = timeline.filter((t) => t.state === "completed").length;

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "20px",
        background: "#fff",
        marginBottom: 14,
        border: "1px solid rgba(15,23,42,0.10)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          Tiến Độ Chi Tiêu
        </h4>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
          {completedCount}/{timeline.length} đợt đã hoàn thành
        </span>
      </div>

      {/* Vertical Timeline Wrapper */}
      <div style={{ position: "relative", paddingLeft: 24 }}>
        {/* Vertical Line */}
        <div 
          style={{ 
            position: "absolute", 
            left: 6, 
            top: 10, 
            bottom: 10, 
            width: 2, 
            background: "#f1f5f9",
            zIndex: 0
          }} 
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {timeline.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            const isCompleted = item.state === "completed";
            const isActive = item.state === "active";
            const isRejected = (item.status || "").toUpperCase() === "REJECTED";
            const accentColor = isRejected ? "#ef4444" : isCompleted ? "#10b981" : isActive ? "#ff5e14" : "#94a3b8";
            const bgAccent = isRejected ? "#fef2f2" : isCompleted ? "#ecfdf5" : isActive ? "#fff7ed" : "#f8fafc";

            return (
              <div key={item.id} style={{ position: "relative", zIndex: 1 }}>
                {/* Timeline Dot */}
                <div 
                  style={{ 
                    position: "absolute", 
                    left: -24, 
                    top: 4, 
                    width: 14, 
                    height: 14, 
                    borderRadius: "50%", 
                    background: accentColor,
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 1px rgba(15,23,42,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }} 
                >
                  {isCompleted && (
                    <svg width="6" height="6" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Content Card */}
                <div 
                  style={{
                    background: bgAccent,
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1px solid ${isActive ? "rgba(255,94,20,0.1)" : "rgba(15,23,42,0.05)"}`,
                  }}
                >
                  <div 
                    style={{ 
                      display: "flex", 
                      flexDirection: "column",
                      cursor: "pointer"
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: isActive ? "#ff5e14" : "#0f172a" }}>
                            {item.title.toLowerCase().includes(`đợt ${idx + 1}`) ? item.title : `Đợt ${idx + 1}: ${item.title}`}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                          <Calendar size={10} />
                          <span style={{ fontSize: 10, fontWeight: 600 }}>{item.date || "Chưa xác định"}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
                          {item.requiredAmount?.toLocaleString("vi-VN")}đ
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {getStatusLabel(item.status || "")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#ff5e14" : "#64748b" }}>
                        {isExpanded ? "Thu gọn" : "Xem chi tiết hạng mục"}
                      </span>
                      {isExpanded ? <ChevronUp size={12} color={isActive ? "#ff5e14" : "#94a3b8"} /> : <ChevronDown size={12} color={isActive ? "#ff5e14" : "#94a3b8"} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: `1px dashed ${isActive ? "rgba(255,94,20,0.2)" : "rgba(15,23,42,0.1)"}`,
                    }}>
                      {item.categories && item.categories.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {item.categories.map((cat, cIdx) => (
                            <div key={cat.id || cIdx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", background: "rgba(15,23,42,0.03)", padding: "4px 8px", borderRadius: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>{cat.name}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{cat.expectedAmount?.toLocaleString("vi-VN")}đ</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 4px" }}>
                                {cat.items.map((it, iIdx) => (
                                  <div key={it.id || iIdx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{it.name}</div>
                                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{it.expectedQuantity} x {it.expectedPrice?.toLocaleString("vi-VN")}đ</div>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                                      {((it.expectedQuantity || 0) * (it.expectedPrice || 0)).toLocaleString("vi-VN")}đ
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Chưa có chi tiết cho đợt này.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
