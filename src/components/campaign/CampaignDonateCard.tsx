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
    <div className="d-flex align-items-center gap-3" style={{ flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
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
        <div className="fw-bold" style={{ lineHeight: 1.1 }}>
          Tiến trình gây quỹ
        </div>
        <div className="text-sm" style={{ opacity: 0.65 }}>
          Trạng thái gây quỹ hiện tại
        </div>
      </div>
    </div>
  );
}

export default function CampaignDonateCard({
  raisedAmount,
  goalAmount,
  onDonate,
}: {
  raisedAmount: number;
  goalAmount: number;
  onDonate: (amount: number) => void;
}) {
  const progress = useMemo(() => {
    const p = (raisedAmount / goalAmount) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }, [goalAmount, raisedAmount]);

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

        <div
          className="d-flex align-items-center gap-2 flex-wrap"
          style={{ marginTop: 14 }}
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

          <div
            style={{
              flex: "1 1 auto",
              minWidth: 140,
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
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
                textAlign: "right",
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
              padding: "10px 14px",
              background: "#202426",
              color: "#fff",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Donate
            <i className="far fa-arrow-right" />
          </button>
        </div>

        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginTop: 12, opacity: 0.75, fontSize: 14 }}
        >
          <div>
            <span style={{ fontWeight: 800 }}>{raisedAmount.toLocaleString()} VNĐ</span> đã quyên góp
          </div>
          <div>
            Mục tiêu: <span style={{ fontWeight: 800 }}>{goalAmount.toLocaleString()} VNĐ</span>
          </div>
        </div>

        {/* Recent Donors Section */}
        <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 20 }}>
          <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 15 }}>
            <h5 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#202426" }}>Người vừa ủng hộ</h5>
            <span style={{ fontSize: 12, color: "#F84D43", fontWeight: 700 }}>Mới nhất</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Nguyễn Văn A", amount: 500000, time: "2 phút trước", avatar: "/assets/img/about/02.jpg" },
              { name: "Trần Thị B", amount: 200000, time: "15 phút trước", avatar: "/assets/img/about/03.jpg" },
              { name: "Lê Văn C", amount: 1000000, time: "45 phút trước", avatar: "/assets/img/about/04.jpg" },
            ].map((donor, i) => (
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
                  <img src={donor.avatar} alt={donor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#202426", marginBottom: 2 }}>{donor.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{donor.time}</div>
                </div>
                <div style={{ textAlign: "right", fontWeight: 800, fontSize: 13, color: "#1A685B" }}>
                  +{donor.amount.toLocaleString()} đ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
