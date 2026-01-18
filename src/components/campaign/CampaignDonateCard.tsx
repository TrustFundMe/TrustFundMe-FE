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
          Campaign progress
        </div>
        <div className="text-sm" style={{ opacity: 0.65 }}>
          Current fundraising status
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

  const [amount, setAmount] = useState<number>(10);

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
          {[10, 20, 50, 100].map((v) => (
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
              }}
            >
              ${v}
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
            <span style={{ opacity: 0.7, fontWeight: 700 }}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
              }}
            />
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
            <span style={{ fontWeight: 800 }}>${raisedAmount.toLocaleString()}</span> raised
          </div>
          <div>
            Goal: <span style={{ fontWeight: 800 }}>${goalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
