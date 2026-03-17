"use client";

import { useMemo, useState } from "react";

function CircularProgress({ value }: { value: number }) {
  const size = 72;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ display: "block" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0,0,0,0.10)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F84D43"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 16,
            color: "#202426",
          }}
        >
          {progress}%
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, lineHeight: 1.2 }}>
          Tiến trình gây quỹ
        </div>
        <div style={{ opacity: 0.65, fontSize: 13 }}>
          Trạng thái gây quỹ hiện tại
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;

    return date.toLocaleDateString('vi-VN');
  } catch (e) {
    return dateString;
  }
}

export default function CampaignDonateCard({
  raisedAmount,
  goalAmount,
  progressPercentage,
  recentDonors = [],
  onDonate,
}: {
  raisedAmount: number;
  goalAmount: number;
  progressPercentage: number;
  recentDonors?: any[];
  onDonate: (amount: number) => void;
}) {
  const progress = progressPercentage;

  const [amount, setAmount] = useState<number>(50000);

  return (
    <div
      className="single-sidebar-widgets"
      style={{
        marginTop: 24,
        marginBottom: 24,
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 16,
      }}
    >
      <div style={{ padding: 16 }}>
        <CircularProgress value={progress} />

        {/* Quick-amount buttons */}
        <div
          style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
        >
          {[50000, 100000, 200000, 500000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              style={{
                border: "1px solid rgba(0,0,0,0.10)",
                background: amount === v ? "rgba(248, 77, 67, 0.10)" : "#fff",
                borderRadius: 9999,
                padding: "8px 12px",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {v >= 1000 ? `${v / 1000}k` : v}
            </button>
          ))}
        </div>

        {/* Input amount + Donate button — same row, no wrap */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 9999,
              padding: "6px 10px",
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={amount.toLocaleString("vi-VN")}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                setAmount(Number(rawValue) || 0);
              }}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
                textAlign: "right",
                fontWeight: 700,
              }}
            />
            <span style={{ opacity: 0.7, fontWeight: 700, fontSize: "12px" }}>VNĐ</span>
          </div>

          <button
            type="button"
            onClick={() => onDonate(amount)}
            style={{
              border: "none",
              borderRadius: 9999,
              padding: "10px 18px",
              background: "#202426",
              color: "#fff",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Donate
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div
          style={{ marginTop: 12, opacity: 0.75, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: 8 }}
        >
          <div style={{ whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 800 }}>{raisedAmount.toLocaleString()} VNĐ</span> đã quyên góp
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            Mục tiêu: <span style={{ fontWeight: 800 }}>{goalAmount.toLocaleString()} VNĐ</span>
          </div>
        </div>

        {/* Recent Donors Section */}
        <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: 8, marginBottom: 15 }}>
            <h5 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#202426", whiteSpace: "nowrap" }}>Người vừa ủng hộ</h5>
            <span style={{ fontSize: 12, color: "#F84D43", fontWeight: 700, whiteSpace: "nowrap" }}>Mới nhất</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentDonors.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-400 italic">Chưa có người ủng hộ nào</div>
            ) : (
              recentDonors.map((donor, i) => (
                <div key={i} className="d-flex align-items-center gap-3" style={{
                  padding: "8px",
                  borderRadius: "12px",
                  transition: "background 0.2s",
                  cursor: "default"
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#eee",
                    flexShrink: 0
                  }}>
                    <img
                      src={donor.donorAvatar || "/assets/img/defaul.jpg"}
                      alt={donor.donorName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/defaul.jpg";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#202426", marginBottom: 2 }}>
                      {donor.anonymous ? "Người ủng hộ ẩn danh" : donor.donorName}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                      {formatTimeAgo(donor.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: 800, fontSize: 13, color: "#1A685B" }}>
                    +{donor.amount.toLocaleString()} đ
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
