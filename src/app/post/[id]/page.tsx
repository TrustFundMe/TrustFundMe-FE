"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostDetail from "@/components/feed-post/FeedPostDetail";
import RelatedPosts from "@/components/feed-post/RelatedPosts";
import CampaignCard, { CampaignInfo } from "@/components/feed-post/CampaignCard";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import FlagPostModal from "@/components/feed-post/FlagPostModal";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { flagService } from "@/services/flagService";
import { mediaService } from "@/services/mediaService";
import { expenditureService } from "@/services/expenditureService";
import { seenService } from "@/services/seenService";
import type { Expenditure } from "@/types/expenditure";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import { AnimatePresence } from "framer-motion";

function CampaignThumb({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src ?? "");
  useEffect(() => { setImgSrc(src ?? ""); }, [src]);
  const DEFAULT_IMG = "/assets/img/campaign/1.png";
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden shadow-inner ring-1 ring-black/5 bg-zinc-100">
      <Image
        src={imgSrc || DEFAULT_IMG}
        alt={alt}
        width={40}
        height={40}
        unoptimized
        onError={() => { if (imgSrc) setImgSrc(""); }}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

const FeedPostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const isAuthRef = useRef(isAuthenticated);
  useEffect(() => { isAuthRef.current = isAuthenticated; }, [isAuthenticated]);
  const postId = params?.id as string;

  const [post, setPost] = useState<(FeedPost & { campaign?: CampaignInfo }) | null>(null);
  const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [campaignsList, setCampaignsList] = useState<{ id: number; title: string; coverImage?: string }[]>([]);
  const [campaignTitlesMap, setCampaignTitlesMap] = useState<Record<string, string>>({});
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    const id = postId ? Number(postId) : NaN;
    if (!postId || Number.isNaN(id)) {
      setPost(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dto = await feedPostService.getById(id);
      const feedPost = dtoToFeedPost(dto) as FeedPost & { campaign?: CampaignInfo };
      setPost(feedPost);

      // Mark this post as seen — only for logged-in users, idempotent on backend
      if (user) {
        seenService.markSeen(id).then(result => {
          if (result.new) {
            setPost(prev => prev ? { ...prev, viewCount: (prev.viewCount ?? 0) + 1 } : prev);
          }
        }).catch(() => { /* ignore */ });
      }

      // Fetch media attachments for this post from media-service
      mediaService.getMediaByPostId(id).then((mediaList) => {
        if (!mediaList?.length) return;
        const attachments = mediaList.map((m) => ({
          type: (m.mediaType === "PHOTO" || m.mediaType === "VIDEO") ? "image" as const : "file" as const,
          url: m.url,
          name: m.fileName,
        }));
        setPost((prev) => (prev ? { ...prev, attachments } : null));
      }).catch(() => { /* no media is fine */ });

      // Pre-load flagged state so the report button stays correct on refresh
      if (isAuthRef.current) {
        flagService.getMyFlags(0, 50).then((myFlags) => {
          const alreadyFlagged = myFlags.some((f) => f.postId === id);
          if (alreadyFlagged) {
            setPost((prev) => (prev ? { ...prev, flagged: true } : null));
          }
        }).catch(() => { /* ignore */ });
      }

      if (dto.targetId != null) {
        // Fetch campaign info for any linked post
        try {
          const campaign = await campaignService.getById(dto.targetId);
          const raised = campaign.balance ?? 0;
          const goal = raised > 0 ? raised : 1;

          let coverImageUrl = campaign.coverImage;
          if (!coverImageUrl) {
            const firstImage = await mediaService.getCampaignFirstImage(campaign.id).catch(() => null);
            coverImageUrl = firstImage?.url || campaign.coverImage;
          }

          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  campaign: {
                    id: String(campaign.id),
                    title: campaign.title ?? "",
                    image: String(coverImageUrl ?? "https://placehold.co/400x200?text=Campaign"),
                    raised,
                    goal,
                    progress: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0,
                    status: campaign.status,
                  } as CampaignInfo,
                }
              : null
          );
        } catch {
          // no campaign
        }

        // Fetch expenditure info if EXPENDITURE type
        if (dto.targetType === "EXPENDITURE") {
          try {
            const exp = await expenditureService.getById(dto.targetId);
            setExpenditure(exp);
          } catch {
            setExpenditure(null);
          }
        } else {
          setExpenditure(null);
        }
      }

      const [listRes, campaignsRes] = await Promise.all([
        feedPostService.getAll(),
        campaignService.getAll(0, 100).catch(() => ({ content: [] })),
      ]);
      const list = Array.isArray(listRes) ? listRes : [];
      const allFeedPosts = list.map((p) => dtoToFeedPost(p));

      // Filter to posts from the same campaign
      const campaignId = dto.targetId;
      const sameCampaignPosts = campaignId != null
        ? allFeedPosts.filter((p) => p.id !== postId && p.targetId === campaignId)
        : allFeedPosts.filter((p) => p.id !== postId);
      setRelatedPosts(sameCampaignPosts.slice(0, 4));
      setFeedPosts(allFeedPosts);
      setCategories([...new Set(allFeedPosts.map((p) => p.category).filter((c): c is string => Boolean(c)))]);
      const campaigns = (campaignsRes as { content?: typeof list }).content ?? [];
      const titles: Record<string, string> = {};
      const cList: { id: number; title: string; coverImage?: string }[] = [];
      const imgPromises = campaigns.map(async (c) => {
        titles[String(c.id)] = c.title ?? "";
        let coverImage = c.coverImage as string | undefined;
        if (!coverImage) {
          try {
            const firstImage = await mediaService.getCampaignFirstImage(c.id).catch(() => null);
            coverImage = firstImage?.url || undefined;
          } catch { /* ignore */ }
        }
        cList.push({ id: c.id, title: c.title ?? "", coverImage });
      });
      await Promise.all(imgPromises);
      setCampaignTitlesMap(titles);
      setCampaignsList(cList);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setError("Không tìm thấy bài viết");
      else setError((err as Error)?.message ?? "Không tải được bài viết");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // Restore scroll when modal closes — fix Radix Dialog scroll lock
  useEffect(() => {
    if (!editModalOpen && !flagModalOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scroll({ top: 0, left: 0 });
    }
  }, [editModalOpen, flagModalOpen]);

  const canEdit = isAuthenticated && user && post && String(user.id) === String(post.author.id);

  const handleToggleFlag = () => {
    if (!isAuthenticated) return;
    setFlagModalOpen(true);
  };

  const handleDelete = async () => {
    if (!post || !confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await feedPostService.delete(Number(postId));
      router.push("/post");
    } catch {
      alert("Xóa bài viết thất bại. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <DanboxLayout header={4} footer={2}>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[200px]">
          <div className="animate-spin w-8 h-8 border-4 border-[#ff5e14] border-t-transparent rounded-full" />
        </div>
      </DanboxLayout>
    );
  }

  if (!post) {
    return (
      <DanboxLayout header={4} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error ?? "Không tìm thấy bài viết"}</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={4} footer={2}>
      <section
        className="min-h-screen bg-zinc-50 dark:bg-zinc-900"
        style={{ padding: "24px 0", fontFamily: "var(--font-dm-sans)" }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-6 lg:gap-8">
            {/* Left sidebar: Quay lại + Chiến dịch */}
            <aside className="hidden lg:flex flex-col gap-4">
              <Link href="/post" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] font-medium text-sm">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Link>
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Chiến dịch khác</p>
                <nav className="flex flex-col gap-2">
                  {campaignsList.length === 0 ? (
                    <span className="px-3 py-2 text-sm text-zinc-400 italic">Chưa có chiến dịch</span>
                  ) : (
                    campaignsList.map((c) => {
                      const count = feedPosts.filter((p) => String(p.targetId) === String(c.id)).length;
                      return (
                        <Link key={c.id}
                          href={`/post?campaignId=${c.id}`}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 group transition-colors no-underline">
                          {/* Cover image */}
                          <CampaignThumb src={c.coverImage} alt={c.title} />
                          {/* Title + count */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate group-hover:text-[#ff5e14] transition-colors leading-tight">{c.title}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{count} bài viết</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </nav>
              </div>
            </aside>

            {/* Main: Nội dung bài viết */}
            <div className="min-w-0">
              <div className="lg:hidden mb-4">
                <Link href="/post" className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] font-medium text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </Link>
              </div>
              <FeedPostDetail
                post={post}
                expenditure={expenditure}
                onToggleFlag={handleToggleFlag}
                onEdit={canEdit ? () => setEditModalOpen(true) : undefined}
                onDelete={canEdit ? handleDelete : undefined}
                canEdit={!!canEdit}
              />
            </div>

            {/* Right sidebar: Campaign + Bài liên quan */}
            <aside className="flex flex-col gap-6">
              {post.campaign && <CampaignCard campaign={post.campaign} compact={false} />}
              <RelatedPosts posts={relatedPosts} currentPostId={postId} />
            </aside>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {editModalOpen && post && (
          <CreateOrEditPostModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            campaignsList={campaignsList}
            campaignTitlesMap={campaignTitlesMap}
            initialData={post}
            onPostUpdated={loadPost}
          />
        )}
        {flagModalOpen && post && (
          <FlagPostModal
            isOpen={flagModalOpen}
            onClose={() => setFlagModalOpen(false)}
            postId={Number(post.id)}
            campaignId={post.expenditureId ?? undefined}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
};

export default FeedPostDetailPage;
