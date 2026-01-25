"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { FeedPost, CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";
import type { CampaignDto } from "@/types/campaign";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Loader2, Send, Globe, Lock, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProxy";
import { campaignService } from "@/services/campaignService";
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
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "UPDATE",
    visibility: initialData?.visibility || "PUBLIC",
    status: initialData?.status || "PUBLISHED",
    budgetId: initialData?.budgetId || null,
  });

  // Mock file state
  const [files, setFiles] = useState<string[]>(
    initialData?.attachments?.map(a => a.url) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns: mine + others (can link to own or others' campaigns)
  useEffect(() => {
    let cancelled = false;
    setCampaignsLoading(true);
    const run = async () => {
      try {
        const [mine, all] = await Promise.all([
          user?.id ? campaignService.getByFundOwner(Number(user.id)).catch(() => []) : [] as CampaignDto[],
          campaignService.getAll().catch(() => []),
        ]);
        if (cancelled) return;
        const mineList = Array.isArray(mine) ? mine : [];
        const allList = Array.isArray(all) ? all : [];
        setMyCampaigns(mineList);
        setOtherCampaigns(allList.filter((c) => c.fundOwnerId !== user?.id).slice(0, 50));
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
            <X className="w-5 h-5 text-zinc-500" />
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
          <div className="relative group">
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="appearance-none pl-9 pr-8 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none accent-[#ff5e14]"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="FOLLOWERS">Followers</option>
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              {formData.visibility === 'PUBLIC' && <Globe className="w-4 h-4" />}
              {formData.visibility === 'PRIVATE' && <Lock className="w-4 h-4" />}
              {formData.visibility === 'FOLLOWERS' && <Users className="w-4 h-4" />}
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="appearance-none pl-3 pr-8 py-2 rounded-full bg-[#ff5e14]/10 text-[#ff5e14] text-sm font-medium hover:bg-[#ff5e14]/20 transition-colors cursor-pointer border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none accent-[#ff5e14]"
            >
              <option value="UPDATE">Update</option>
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="NEWS">News</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#ff5e14] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Title Input (Optional) */}
          <input
            type="text"
            placeholder="Post Title (Optional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-transparent text-xl font-bold placeholder:text-zinc-400 border-none px-0 focus:ring-0 p-0"
          />

          {/* Main Content - rich text (B, I, U) */}
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
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Campaigns & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Selector: my campaigns or others' (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Link to campaign
            </label>
            <div className="relative group">
              <select
                value={formData.budgetId != null ? String(formData.budgetId) : ""}
                onChange={(e) => setFormData({ ...formData, budgetId: e.target.value ? Number(e.target.value) : null })}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none text-zinc-700 dark:text-zinc-200 accent-[#ff5e14]"
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
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-xs text-zinc-400 ml-1">Optional. Link this post to your campaign or one you support.</p>
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Status
            </label>
            <div className="relative group">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-[#ff5e14]/30 outline-none text-zinc-700 dark:text-zinc-200 accent-[#ff5e14]"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <label className="p-2.5 text-[#ff5e14] bg-[#ff5e14]/10 hover:bg-[#ff5e14]/20 rounded-full cursor-pointer transition-colors active:scale-95">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <ImageIcon className="w-5 h-5" />
            </label>
            <span className="text-xs text-zinc-400">Tối đa {MAX_IMAGES} ảnh</span>
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{submitLabel}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
