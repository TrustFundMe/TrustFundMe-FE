"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { FeedPost, CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";
import type { CampaignDto } from "@/types/campaign";
import type { ForumCategory } from "@/types/forumCategory";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProxy";
import { campaignService } from "@/services/campaignService";
import { forumCategoryService } from "@/services/forumCategoryService";
import { RichTextEditor } from "./RichTextEditor";

interface FeedPostFormProps {
  initialData?: FeedPost;
  onSubmit: (data: CreateFeedPostRequest | UpdateFeedPostRequest) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isEdit?: boolean;
  showFullEditorLink?: boolean;
}

export default function FeedPostForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Post",
  isEdit = false,
  showFullEditorLink = false,
}: FeedPostFormProps) {
  const { user } = useAuth();
  const [myCampaigns, setMyCampaigns] = useState<CampaignDto[]>([]);
  const [otherCampaigns, setOtherCampaigns] = useState<CampaignDto[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "UPDATE",
    visibility: initialData?.visibility || "PUBLIC",
    status: initialData?.status || "PUBLISHED",
    budgetId: initialData?.budgetId || null,
    categoryId: initialData?.categoryId || null,
  });

  const [files, setFiles] = useState<string[]>(
    initialData?.attachments?.map(a => a.url) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns and categories
  useEffect(() => {
    let cancelled = false;
    setCampaignsLoading(true);
    const run = async () => {
      try {
        const [mine, all, cats] = await Promise.all([
          user?.id ? campaignService.getByFundOwner(Number(user.id)).catch(() => []) : [] as CampaignDto[],
          campaignService.getAll().catch(() => []),
          forumCategoryService.getAll().catch(() => []),
        ]);
        if (cancelled) return;
        const mineList = Array.isArray(mine) ? mine : [];
        const allList = Array.isArray(all) ? all : [];
        setMyCampaigns(mineList);
        setOtherCampaigns(allList.filter((c) => c.fundOwnerId !== user?.id).slice(0, 50));
        setCategories(Array.isArray(cats) ? cats : []);
      } finally {
        if (!cancelled) setCampaignsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const textOnly = formData.content.replace(/<[^>]+>/g, "").trim();
    if (!textOnly) {
      setError("Please write something to post.");
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateFeedPostRequest | UpdateFeedPostRequest = {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        type: formData.type,
        visibility: formData.visibility,
        status: formData.status,
        ...(formData.budgetId && { budgetId: formData.budgetId }),
        ...(formData.categoryId && { categoryId: formData.categoryId }),
        attachments: files.length ? files.map((url) => ({ type: "image" as const, url })) : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const MAX_IMAGES = 10;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files || []);
    if (chosen.length === 0) return;
    setFiles((prev) => {
      const rest = MAX_IMAGES - prev.length;
      if (rest <= 0) return prev;
      const toAdd = chosen.slice(0, rest).map((f) => URL.createObjectURL(f));
      return [...prev, ...toAdd];
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
          {isEdit ? "Edit Post" : "Create Post"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </motion.div>
        )}

        {/* Visibility & Type Selectors */}
        <div className="flex flex-wrap gap-2">
          <select
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            className="appearance-none px-4 pr-8 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none"
          >
            <option value="PUBLIC">🌐 Public</option>
            <option value="PRIVATE">🔒 Private</option>
            <option value="FOLLOWERS">👥 Followers</option>
          </select>

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="appearance-none px-4 pr-8 py-2 rounded-full bg-[#ff5e14]/10 text-[#ff5e14] text-sm font-medium hover:bg-[#ff5e14]/20 transition-colors cursor-pointer border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none"
          >
            <option value="UPDATE">📝 Update</option>
            <option value="ANNOUNCEMENT">📢 Announcement</option>
            <option value="NEWS">📰 News</option>
          </select>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Post Title (Optional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-transparent text-xl font-bold placeholder:text-zinc-400 border-none px-0 focus:ring-0 p-0"
          />

          {/* Main Content */}
          <RichTextEditor
            value={formData.content}
            onChange={(html) => setFormData((s) => ({ ...s, content: html }))}
            placeholder="What's on your mind?"
            minHeight="100px"
          />

          {/* Image Preview Grid */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4"
              >
                {files.map((url, i) => (
                  <motion.div
                    key={url}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative aspect-video rounded-xl overflow-hidden group"
                  >
                    <img src={url} alt={`attachment ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-500/80"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category & Campaign Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Category
            </label>
            <select
              value={formData.categoryId != null ? String(formData.categoryId) : ""}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : null })}
              className="w-full appearance-none px-4 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none text-zinc-700 dark:text-zinc-200"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Campaign Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Link to campaign
            </label>
            <select
              value={formData.budgetId != null ? String(formData.budgetId) : ""}
              onChange={(e) => setFormData({ ...formData, budgetId: e.target.value ? Number(e.target.value) : null })}
              className="w-full appearance-none px-4 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none text-zinc-700 dark:text-zinc-200"
            >
              <option value="">Don&apos;t link to a campaign</option>
              {campaignsLoading ? (
                <option disabled>Loading campaigns…</option>
              ) : (
                <>
                  {myCampaigns.length > 0 && (
                    <optgroup label="My campaigns">
                      {myCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </optgroup>
                  )}
                  {otherCampaigns.length > 0 && (
                    <optgroup label="Other campaigns">
                      {otherCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <label className="p-2.5 text-[#ff5e14] bg-[#ff5e14]/10 hover:bg-[#ff5e14]/20 rounded-full cursor-pointer transition-colors active:scale-95">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
            <span className="text-xs text-zinc-400">Max {MAX_IMAGES} images</span>
            {showFullEditorLink && (
              <Link
                href="/post/create"
                className="text-sm text-zinc-500 hover:text-[#ff5e14] transition-colors"
              >
                Full editor
              </Link>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !formData.content.replace(/<[^>]+>/g, "").trim()}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white shadow-lg shadow-[#ff5e14]/20 transition-all",
              loading || !formData.content.replace(/<[^>]+>/g, "").trim()
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed shadow-none"
                : "bg-[#ff5e14] hover:bg-[#ff5e14]/90 hover:shadow-[#ff5e14]/30 active:scale-95"
            )}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>{submitLabel}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
