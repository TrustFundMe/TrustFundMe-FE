"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { feedPostService } from "@/services/feedPostService";
import { mediaService } from "@/services/mediaService";
import { useAuth } from "@/contexts/AuthContextProxy";
import type { FeedPost } from "@/types/feedPost";

const DRAFT_KEY = "danbox_post_draft";
/** Từ 3 ảnh trở lên (hoặc flex rớt xuống 2 hàng) thì dùng swipe (scroll ngang) */
const SWIPE_THRESHOLD = 3;

export type CreateOrEditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories?: string[];
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
  categories,
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
  const [categoryId, setCategoryId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [existingImages, setExistingImages] = useState<{ url: string; mediaId: number }[]>([]);
  /** Ảnh đang upload: preview local, xong thì chuyển sang existingImages */
  const [uploadingItems, setUploadingItems] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inFlightUploadsRef = useRef<Promise<{ url: string; mediaId: number } | void>[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    inFlightUploadsRef.current = [];
    if (initialData) {
      setTitle(initialData.title ?? "");
      setContent(initialData.content ?? "");
      setCategoryId(initialData.category ?? "");
      setCampaignId(initialData.expenditureId != null ? String(initialData.expenditureId) : "");
      setExistingImages([]);
      setUploadingItems([]);
    } else {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || "");
          setContent(draft.content || "");
          setCategoryId(draft.categoryId || "");
          setCampaignId(draft.campaignId || "");
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      } else {
        setTitle("");
        setContent("");
        setCategoryId("");
        setCampaignId("");
      }
      setExistingImages([]);
      setUploadingItems([]);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen || isEdit) return;
    const draft = { title, content, categoryId, campaignId };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, content, categoryId, campaignId, isOpen, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newItems: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      newItems.push({ file, preview: URL.createObjectURL(file) });
    }
    setUploadingItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    newItems.forEach(({ file, preview }) => {
      const p = feedPostService
        .uploadImage(file)
        .then((result) => {
          if (result?.url) setExistingImages((prev) => [...prev, result]);
          setUploadingItems((prev) => prev.filter((x) => x.preview !== preview));
          URL.revokeObjectURL(preview);
          return result;
        })
        .catch((err) => {
          console.error("Upload failed", file.name, err);
          setUploadingItems((prev) => prev.filter((x) => x.preview !== preview));
          URL.revokeObjectURL(preview);
        });
      inFlightUploadsRef.current.push(p);
    });
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
      const baseImages = [...existingImages];
      let allImages = baseImages;
      if (inFlightUploadsRef.current.length) {
        const results = await Promise.all(inFlightUploadsRef.current);
        const newImages = results.filter(
          (r): r is { url: string; mediaId: number } => Boolean(r?.url)
        );
        inFlightUploadsRef.current = [];
        setUploadingItems([]);
        setExistingImages((prev) => [...prev, ...newImages]);
        allImages = [...baseImages, ...newImages];
      }

      if (isEdit && initialData?.id) {
        await feedPostService.update(Number(initialData.id), {
          title: title || content.slice(0, 50),
          content,
            status: "PUBLISHED",
          campaignId: campaignId ? Number(campaignId) : null,
          expenditureId: campaignId ? Number(campaignId) : null,
          category: categoryId || undefined,
        });
        // Link any newly uploaded media to this post
        const postId = Number(initialData.id);
        await Promise.all(
          allImages
            .filter(({ mediaId }) => mediaId != null && !Number.isNaN(mediaId))
            .map(({ mediaId }) =>
              mediaService.updateMedia(mediaId, { postId }).catch(() => {})
            )
        );
        if (!initialData.title && title) localStorage.removeItem(DRAFT_KEY);
        onPostUpdated?.();
      } else {
        const newPost = await feedPostService.create({
          type: "DISCUSSION",
          visibility: "PUBLIC",
          title: title || content.slice(0, 50),
          content,
          status: "PUBLISHED",
          campaignId: campaignId ? Number(campaignId) : null,
          expenditureId: campaignId ? Number(campaignId) : null,
          category: categoryId || undefined,
        });
        // Link all uploaded media to the newly created post
        if (newPost?.id && allImages.length > 0) {
          const postId = Number(newPost.id);
          await Promise.all(
            allImages
              .filter(({ mediaId }) => mediaId != null && !Number.isNaN(mediaId))
              .map(({ mediaId }) =>
                mediaService.updateMedia(mediaId, { postId }).catch(() => {})
              )
          );
        }
        localStorage.removeItem(DRAFT_KEY);
        onPostCreated?.();
      }

      onClose();
      setTitle("");
      setContent("");
      setCategoryId("");
      setCampaignId("");
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden">
              <img
                src={user?.avatarUrl || "/assets/img/defaul.jpg"}
                alt={user?.fullName || "User"}
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=User&background=random")
                }
              />
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">{user?.fullName || "Người dùng"}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="Tag..."
                  list="category-suggestions"
                  className="mt-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded px-2 py-1 border-none focus:ring-1 focus:ring-[#ff5e14] outline-none"
                />
                {categories && categories.length > 0 && (
                  <datalist id="category-suggestions">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                )}
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="mt-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded px-2 py-1 border-none focus:ring-1 focus:ring-[#ff5e14] cursor-pointer max-w-[120px]"
                >
                  <option value="">Chiến dịch...</option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              {campaignId && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Chiến dịch: {campaignTitlesMap[campaignId] || `#${campaignId}`}
                </p>
              )}
            </div>
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
              content: { type: "url"; url: string } | { type: "uploading"; preview: string }
            ) => (
              <div key={content.type === "url" ? `url-${globalIndex}-${content.url}` : `up-${content.preview}`} className={thumbClass}>
                {content.type === "url" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={content.url} alt="" className="absolute inset-0 w-full h-full object-contain" />
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

            const items: ({ type: "url"; url: string } | { type: "uploading"; preview: string })[] = [
              ...existingImages.map(({ url }) => ({ type: "url" as const, url })),
              ...uploadingItems.map((item) => ({ type: "uploading" as const, preview: item.preview })),
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
