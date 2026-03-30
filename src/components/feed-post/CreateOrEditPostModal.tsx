"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { feedPostService } from "@/services/feedPostService";
import { mediaService } from "@/services/mediaService";
import { expenditureService } from "@/services/expenditureService";
import { useAuth } from "@/contexts/AuthContextProxy";
import type { FeedPost } from "@/types/feedPost";

const DRAFT_KEY = "danbox_post_draft";
/** Từ 3 ảnh trở lên (hoặc flex rớt xuống 2 hàng) thì dùng swipe (scroll ngang) */
const SWIPE_THRESHOLD = 3;

export type CreateOrEditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  campaignsList: { id: number; title: string }[];
  campaignTitlesMap: Record<string, string>;
  /** Khi có = chế độ chỉnh sửa: pre-fill form, submit gọi update */
  initialData?: (FeedPost & { expenditureId?: number | null; category?: string | null }) | null;
  onPostCreated?: () => void;
  onPostUpdated?: () => void;
};

export default function CreateOrEditPostModal({
  isOpen,
  onClose,
  campaignsList,
  campaignTitlesMap,
  initialData,
  onPostCreated,
  onPostUpdated,
}: CreateOrEditPostModalProps) {
  const { user } = useAuth();
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // "none" = không liên kết, "CAMPAIGN" = liên kết chiến dịch, "EXPENDITURE" = liên kết đợt chi tiêu
  const [linkType, setLinkType] = useState<"none" | "CAMPAIGN" | "EXPENDITURE">("none");
  const [linkedCampaignId, setLinkedCampaignId] = useState("");
  /** expenditureId chỉ set khi user chọn expenditure trong dropdown */
  const [selectedExpenditureId, setSelectedExpenditureId] = useState<number | null>(null);
  const [expendituresOfCampaign, setExpendituresOfCampaign] = useState<{ id: number; plan: string }[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; mediaId: number }[]>([]);
  /** Ảnh đang upload: preview local, xong thì done=true */
  const [uploadingItems, setUploadingItems] = useState<{ file: File; preview: string; done: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inFlightUploadsRef = useRef<Promise<{ url: string; mediaId: number } | void>[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    inFlightUploadsRef.current = [];
    if (initialData) {
      setTitle(initialData.title ?? "");
      setContent(initialData.content ?? "");
      if (initialData.targetId) {
        const rawTt = initialData.targetType;
        const tt: "none" | "CAMPAIGN" | "EXPENDITURE" =
          rawTt === "CAMPAIGN" || rawTt === "EXPENDITURE" ? rawTt : "none";
        setLinkType(tt);
        if (tt === "CAMPAIGN") {
          setLinkedCampaignId(String(initialData.targetId));
          setSelectedExpenditureId(null);
          setExpendituresOfCampaign([]);
        } else if (tt === "EXPENDITURE") {
          expenditureService
            .getById(initialData.targetId)
            .then((exp) => {
              setLinkedCampaignId(String(exp.campaignId));
              setSelectedExpenditureId(initialData.targetId ?? null);
              return expenditureService.getByCampaignId(String(exp.campaignId)).catch(() => []);
            })
            .then((exps) => {
              if (Array.isArray(exps)) {
                const sorted = [...exps].sort((a, b) => {
                  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  if (tb !== ta) return tb - ta;
                  return (b.id ?? 0) - (a.id ?? 0);
                });
                setExpendituresOfCampaign(sorted.map((e) => ({ id: e.id, plan: e.plan ?? "" })));
              }
            })
            .catch(() => {});
        } else {
          setLinkedCampaignId("");
          setSelectedExpenditureId(null);
          setExpendituresOfCampaign([]);
        }
      } else {
        setLinkType("none");
        setLinkedCampaignId("");
        setSelectedExpenditureId(null);
        setExpendituresOfCampaign([]);
      }
      setExistingImages([]);
      setUploadingItems([]);
    } else {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || "");
          setContent(draft.content || "");
          setLinkedCampaignId(draft.campaignId || "");
          setLinkType(
            draft.targetType === "CAMPAIGN" || draft.targetType === "EXPENDITURE"
              ? draft.targetType
              : "none"
          );
          setSelectedExpenditureId(null);
          setExpendituresOfCampaign([]);
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      } else {
        setTitle("");
        setContent("");
        setLinkType("none");
        setLinkedCampaignId("");
      }
      setExistingImages([]);
      setUploadingItems([]);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen || isEdit) return;
    const draft = { title, content, campaignId: linkedCampaignId, targetType: linkType };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, content, linkedCampaignId, linkType, isOpen, isEdit]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newItems: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      newItems.push({ file, preview: URL.createObjectURL(file) });
    }
    // Chỉ tạo preview — KHÔNG upload ngay. Upload trong handleSubmit sau khi có postId.
    setUploadingItems((prev) => [...prev, ...newItems.map((item) => ({ ...item, done: false }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAt = (kind: "url" | "uploading", index: number) => {
    if (kind === "url") {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setUploadingItems((prev) => {
        const next = [...prev];
        URL.revokeObjectURL(next[index].preview);
        next.splice(index, 1);
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đăng bài!");
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveTargetId =
        linkType === "CAMPAIGN"
          ? linkedCampaignId ? Number(linkedCampaignId) : null
          : linkType === "EXPENDITURE"
          ? selectedExpenditureId
          : null;

      const postTitle = title || content.slice(0, 50);

      if (isEdit && initialData?.id) {
        // === EDIT MODE ===
        const postId = Number(initialData.id);
        await feedPostService.update(postId, {
          title: postTitle,
          content,
          status: "PUBLISHED",
          targetId: effectiveTargetId ?? null,
          targetType: linkType === "none" ? null : linkType,
        });
        // Re-link existing images
        for (const img of existingImages) {
          if (img.mediaId) {
            try { await mediaService.updateMedia(img.mediaId, { postId }); } catch { /* noop */ }
          }
        }
        // Upload new images WITH postId, mark each as done
        for (const { file } of uploadingItems) {
          try { await feedPostService.uploadImage(file, postId); } catch (e) { console.error("Upload failed:", e); }
          setUploadingItems((prev) => prev.map((it) => it.file === file ? { ...it, done: true } : it));
        }
        if (!initialData?.title && title) localStorage.removeItem(DRAFT_KEY);
        onPostUpdated?.();
      } else {
        // === CREATE MODE: DRAFT → upload images → PUBLIC ===
        // Step 1: create post as DRAFT to get postId
        const newPost = await feedPostService.create({
          type: "DISCUSSION",
          visibility: "PUBLIC",
          title: postTitle,
          content,
          status: "DRAFT",
          targetId: effectiveTargetId ?? null,
          targetType: linkType === "none" ? null : linkType,
        });
        const postId = Number(newPost.id);

        // Step 2: upload all images with postId, mark each as done
        for (const { file } of uploadingItems) {
          try { await feedPostService.uploadImage(file, postId); } catch (e) { console.error("Upload failed:", e); }
          setUploadingItems((prev) => prev.map((it) => it.file === file ? { ...it, done: true } : it));
        }

        // Step 3: publish the post
        await feedPostService.update(postId, {
          title: postTitle,
          content,
          status: "PUBLISHED",
          visibility: "PUBLIC",
          targetId: effectiveTargetId ?? null,
          targetType: linkType === "none" ? null : linkType,
        });

        localStorage.removeItem(DRAFT_KEY);
        onPostCreated?.();
      }

      onClose();
      setTitle("");
      setContent("");
      setLinkedCampaignId("");
      setLinkType("none");
      setSelectedExpenditureId(null);
      setExpendituresOfCampaign([]);
      setExistingImages([]);
      setUploadingItems((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.preview));
        return [];
      });
      inFlightUploadsRef.current = [];
    } catch (error: unknown) {
      console.error(isEdit ? "Update post failed" : "Create post failed", error);
      const msg =
        (error as { response?: { status?: number; data?: { message?: string } } })?.response?.data?.message ??
        (error as Error)?.message ??
        (isEdit ? "Cập nhật thất bại." : "Đăng bài thất bại.");
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        alert(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="relative px-4 py-4 border-b border-zinc-200 dark:border-zinc-700 text-center">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-full text-zinc-500 hover:bg-zinc-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden flex-shrink-0">
              <img
                src={user?.avatarUrl || "/assets/img/defaul.jpg"}
                alt={user?.fullName || "User"}
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=User&background=random")
                }
              />
            </div>
            <div className="font-semibold text-zinc-900 dark:text-white">{user?.fullName || "Người dùng"}</div>
          </div>

          {/* Liên kết section */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <select
              value={linkType}
              onChange={(e) => {
                const val = e.target.value as "none" | "CAMPAIGN" | "EXPENDITURE";
                setLinkType(val);
                setLinkedCampaignId("");
                setSelectedExpenditureId(null);
                setExpendituresOfCampaign([]);
              }}
              className="text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 border-none focus:ring-1 focus:ring-[#ff5e14] cursor-pointer"
            >
              <option value="none">Liên kết...</option>
              <option value="CAMPAIGN">Chiến dịch</option>
              <option value="EXPENDITURE">Đợt chi tiêu</option>
            </select>

            {linkType === "CAMPAIGN" && (
              <select
                value={linkedCampaignId}
                onChange={(e) => setLinkedCampaignId(e.target.value)}
                className="text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 border-none focus:ring-1 focus:ring-[#ff5e14] cursor-pointer flex-1 min-w-[200px]"
              >
                <option value="">Chọn chiến dịch...</option>
                {campaignsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
            {linkType === "CAMPAIGN" && linkedCampaignId && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20,
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  fontSize: 13, fontWeight: 600, color: "#2563eb",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {campaignTitlesMap[linkedCampaignId] || `#${linkedCampaignId}`}
              </span>
            )}

            {linkType === "EXPENDITURE" && (
              <select
                value={linkedCampaignId}
                onChange={async (e) => {
                  const cId = e.target.value;
                  setLinkedCampaignId(cId);
                  setSelectedExpenditureId(null);
                  setExpendituresOfCampaign([]);
                  if (!cId) return;
                  const exps = await expenditureService.getByCampaignId(cId).catch(() => []);
                  if (Array.isArray(exps)) {
                    const sorted = [...exps].sort((a, b) => {
                      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      if (tb !== ta) return tb - ta;
                      return (b.id ?? 0) - (a.id ?? 0);
                    });
                    setExpendituresOfCampaign(sorted.map((exp) => ({ id: exp.id, plan: exp.plan ?? "" })));
                  }
                }}
                className="text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 border-none focus:ring-1 focus:ring-[#ff5e14] cursor-pointer"
              >
                <option value="">Chọn chiến dịch...</option>
                {campaignsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
            {linkType === "EXPENDITURE" && linkedCampaignId && expendituresOfCampaign.length > 0 && (
              <select
                value={selectedExpenditureId ?? ""}
                onChange={(e) => setSelectedExpenditureId(e.target.value ? Number(e.target.value) : null)}
                className="text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 border-none focus:ring-1 focus:ring-[#ff5e14] cursor-pointer flex-1 min-w-[200px]"
              >
                <option value="">Chọn đợt chi tiêu...</option>
                {expendituresOfCampaign.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.plan || `#${exp.id}`}
                  </option>
                ))}
              </select>
            )}
            {linkType === "EXPENDITURE" && linkedCampaignId && expendituresOfCampaign.length === 0 && (
              <span className="text-sm text-zinc-400 italic">Chưa có đợt chi tiêu</span>
            )}
            {linkType === "EXPENDITURE" && selectedExpenditureId && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20,
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  fontSize: 13, fontWeight: 600, color: "#059669",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {expendituresOfCampaign.find((e) => e.id === selectedExpenditureId)?.plan || `#${selectedExpenditureId}`}
              </span>
            )}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
            className="w-full text-lg font-bold text-zinc-900 dark:text-white placeholder-zinc-400 border-none outline-none focus:ring-0 bg-transparent mb-2 p-0"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[120px] text-base text-zinc-900 dark:text-white placeholder-zinc-500 border-none outline-none focus:ring-0 bg-transparent resize-none p-0"
            placeholder={`Bạn đang nghĩ gì thế, ${user?.fullName?.split(" ").pop() || "bạn"}?`}
          />

          {/* Ảnh: grid nếu ≤ SWIPE_THRESHOLD, swipe (scroll ngang) nếu nhiều hơn */}
          {(existingImages.length > 0 || uploadingItems.length > 0) && (() => {
            const totalCount = existingImages.length + uploadingItems.length;
            const useSwipe = totalCount >= SWIPE_THRESHOLD;
            const thumbClass =
              "relative aspect-[3/4] w-[120px] sm:w-[140px] rounded-lg overflow-hidden bg-black border border-zinc-200 dark:border-zinc-700 flex-shrink-0";
            const removeBtnClass =
              "absolute top-1 right-1 w-7 h-7 bg-zinc-900/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-zinc-900/70 transition-colors z-10";

            const renderThumb = (
              globalIndex: number,
              content: { type: "url"; url: string } | { type: "uploading"; preview: string; done: boolean }
            ) => (
              <div key={content.type === "url" ? `url-${globalIndex}-${content.url}` : `up-${content.preview}`} className={thumbClass}>
                {content.type === "url" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={content.url} alt="" className="absolute inset-0 w-full h-full object-contain" />
                ) : content.done ? (
                  <>
                    <img src={content.preview} alt="" className="absolute inset-0 w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-[1]">
                      <div className="w-7 h-7 bg-[#1A685B] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={content.preview} alt="" className="absolute inset-0 w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-[1]">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    globalIndex < existingImages.length
                      ? removeAt("url", globalIndex)
                      : removeAt("uploading", globalIndex - existingImages.length)
                  }
                  className={removeBtnClass}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );

            const items: ({ type: "url"; url: string } | { type: "uploading"; preview: string; done: boolean })[] = [
              ...existingImages.map(({ url }) => ({ type: "url" as const, url })),
              ...uploadingItems.map((item) => ({ type: "uploading" as const, preview: item.preview, done: item.done })),
            ];

            if (useSwipe) {
              return (
                <div className="w-full mb-4 mt-2 -mx-4">
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={24}
                    slidesPerView="auto"
                    pagination={{ clickable: true }}
                    className="!overflow-visible"
                    style={{ paddingLeft: 24, paddingRight: 24 }}
                  >
                    {items.map((item, i) => (
                      <SwiperSlide key={i} style={{ width: 120, flexShrink: 0 }}>
                        {renderThumb(i, item)}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              );
            }

            return (
              <div className="w-full mb-4 mt-2 flex flex-wrap gap-5">
                {items.map((item, i) => renderThumb(i, item))}
              </div>
            );
          })()}

          {/* Cả thanh click được để mở file picker */}
          <label className="flex items-center justify-between border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 mt-4 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Thêm vào bài viết</span>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
              multiple
            />
            <span className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-green-500 pointer-events-none">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </label>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!title.trim() && !content.trim()) || isSubmitting}
            className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 ${
              (title.trim() || content.trim()) && !isSubmitting
                ? "bg-[#ff5e14] hover:bg-[#e05312] shadow-md hover:shadow-lg"
                : "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500"
            }`}
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? (isEdit ? "Đang lưu..." : "Đang đăng...") : isEdit ? "Lưu thay đổi" : "Đăng bài"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
