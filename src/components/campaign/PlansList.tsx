"use client";

import Image from "next/image";
import type { CampaignPlan } from "./types";

type PlanStatus = "disbursed" | "approved" | "voting" | "pending";

function getPlanStatus(planId: string): PlanStatus {
  return "disbursed"; // All plans passed from details page are disbursed
}

function accentForStatus(status: PlanStatus) {
  if (status === "disbursed") return "var(--theme)"; // Green
  if (status === "approved") return "var(--theme)";
  if (status === "pending") return "var(--theme-3)";
  return "#6b7280";
}

function VoteProgress({ approvePct, date }: { approvePct: number; date: string }) {
  const approve = Math.max(0, Math.min(100, approvePct));
  const oppose = 100 - approve;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 6,
          borderRadius: 9999,
          overflow: "hidden",
          display: "flex",
          border: "1px solid rgba(0,0,0,0.10)",
          background: "#fff",
        }}
      >
        <div style={{ width: `${oppose}%`, background: "#d1d5db" }} />
        <div style={{ width: `${approve}%`, background: "#fff" }} />
      </div>

      <div
        className="d-flex align-items-center justify-content-between"
        style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}
      >
        <div>Phản đối {oppose}%</div>
        <div>Đồng ý {approve}%</div>
      </div>

      <div className="text-sm" style={{ opacity: 0.7, marginTop: 6 }}>
        {date}
      </div>
    </div>
  );
}

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

function PlanCard({ plan, onOpen }: { plan: CampaignPlan; onOpen: () => void }) {
  const status = getPlanStatus(plan.id);
  const accent = accentForStatus(status);

  const avatars =
    status === "disbursed" || status === "approved"
      ? ["/assets/img/defaul.jpg"]
      : status === "voting"
        ? [
          "/assets/img/defaul.jpg",
          "/assets/img/defaul.jpg",
          "/assets/img/defaul.jpg",
        ]
        : [];

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
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div style={{ minWidth: 0 }}>
            <div className="fw-bold" style={{ lineHeight: 1.2 }}>
              {plan.title}
            </div>
          </div>

          <div className="fw-bold" style={{ whiteSpace: "nowrap" }}>
            {plan.amount.toLocaleString()} VNĐ
          </div>
        </div>

        <div style={{ marginTop: 8, opacity: 0.9, lineHeight: 1.45 }}>
          {plan.description}
        </div>

        {status === "pending" ? (
          <VoteProgress approvePct={62} date={plan.date} />
        ) : (
          <div
            className="text-sm"
            style={{
              opacity: 0.7,
              marginTop: 10,
              paddingRight: avatars.length ? 86 : 0,
            }}
          >
            {plan.date}
          </div>
        )}
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
