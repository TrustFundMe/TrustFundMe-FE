"use client";

import { useState } from "react";

export default function VoteCard({
  initialVote,
  onVote,
}: {
  initialVote: "yes" | "no" | null;
  onVote: (v: "yes" | "no") => void;
}) {
  const [vote, setVote] = useState<"yes" | "no" | null>(initialVote);

  return (
    <div className="single-sidebar-widgets">
      <div className="widget-title">
        <h4>Vote</h4>
      </div>

      <div style={{ opacity: 0.8 }}>
        Bạn có tin tưởng kế hoạch & tiến độ của campaign này không?
      </div>

      <div className="d-flex gap-2 flex-wrap" style={{ marginTop: 14 }}>
        <button
          type="button"
          className={`theme-btn ${vote === "yes" ? "bg-success" : ""}`}
          style={{ padding: "10px 14px" }}
          onClick={() => {
            setVote("yes");
            onVote("yes");
          }}
        >
          <i className="far fa-thumbs-up" /> Vote
        </button>

        <button
          type="button"
          className={`theme-btn ${vote === "no" ? "bg-danger" : ""}`}
          style={{ padding: "10px 14px" }}
          onClick={() => {
            setVote("no");
            onVote("no");
          }}
        >
          <i className="far fa-thumbs-down" /> Không vote
        </button>
      </div>

      <div style={{ marginTop: 12, opacity: 0.7 }}>
        Trạng thái: {vote === null ? "Chưa vote" : vote === "yes" ? "Đã vote" : "Không vote"}
      </div>
    </div>
  );
}
