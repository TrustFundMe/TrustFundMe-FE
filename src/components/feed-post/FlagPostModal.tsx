"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Flag, AlertTriangle } from "lucide-react";
import { flagService } from "@/services/flagService";

interface FlagPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number;
  campaignId?: number;
}

const FLAG_REASONS = [
  "Nội dung sai sự thật hoặc lừa đảo",
  "Nội dung xúc phạm, thù ghét hoặc bạo lực",
  "Spam hoặc nội dung quảng cáo không phù hợp",
  "Vi phạm quyền riêng tư",
  "Lạm dụng hoặc quấy rối",
  "Nội dung khiêu dâm hoặc không phù hợp",
  "Lý do khác",
];

export default function FlagPostModal({ isOpen, onClose, postId, campaignId }: FlagPostModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalReason = selectedReason === "Lý do khác" ? customReason.trim() : selectedReason;

  const handleSubmit = async () => {
    if (!finalReason) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await flagService.submitFlag({
        postId: postId ?? null,
        campaignId: campaignId ?? null,
        reason: finalReason,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        style={{ position: "relative", background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden", zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(248,77,67,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Flag className="w-5 h-5" style={{ color: "#F84D43" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>Báo cáo bài viết</h3>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(0,0,0,0.5)", fontFamily: "var(--font-dm-sans)" }}>Báo cáo sẽ được gửi đến đội ngũ kiểm duyệt</p>
          </div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "rgba(0,0,0,0.06)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,104,91,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertTriangle className="w-7 h-7" style={{ color: "#1A685B" }} />
              </div>
              <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>Đã gửi báo cáo</h4>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(0,0,0,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                Cảm ơn bạn đã báo cáo. Đội ngũ kiểm duyệt sẽ xem xét trong thời gian sớm nhất.
              </p>
              <button type="button" onClick={onClose}
                style={{ background: "#1A685B", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}>
                Đóng
              </button>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}>Chọn lý do báo cáo:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {FLAG_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => { setSelectedReason(reason); if (reason !== "Lý do khác") setCustomReason(""); }}
                    style={{
                      border: `2px solid ${selectedReason === reason ? "#1A685B" : "rgba(0,0,0,0.1)"}`,
                      borderRadius: 8, padding: "10px 14px", cursor: "pointer", textAlign: "left",
                      background: selectedReason === reason ? "rgba(26,104,91,0.06)" : "#fff",
                      fontSize: 14, color: selectedReason === reason ? "#1A685B" : "#1a1a1a",
                      fontFamily: "var(--font-dm-sans)", fontWeight: selectedReason === reason ? 600 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {selectedReason === "Lý do khác" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Mô tả chi tiết lý do báo cáo..."
                  rows={3}
                  style={{
                    width: "100%", border: "2px solid rgba(0,0,0,0.1)", borderRadius: 8,
                    padding: "10px 14px", fontSize: 14, fontFamily: "var(--font-dm-sans)",
                    resize: "vertical", outline: "none", boxSizing: "border-box",
                    color: "#1a1a1a", marginBottom: 16,
                  }}
                />
              )}

              {error && (
                <p style={{ color: "#F84D43", fontSize: 13, margin: "0 0 12px", fontFamily: "var(--font-dm-sans)" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={onClose}
                  style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 500, background: "#fff", color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!finalReason || isSubmitting}
                  style={{
                    background: (!finalReason || isSubmitting) ? "rgba(248,77,67,0.4)" : "#F84D43",
                    color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px",
                    cursor: (!finalReason || isSubmitting) ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 600, fontFamily: "var(--font-dm-sans)", transition: "background 0.2s",
                  }}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
