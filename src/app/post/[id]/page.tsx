"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { CampaignDto } from "@/types/campaign";
import { AnimatePresence } from "framer-motion";

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
  /** Modal tạo/sửa bài — chỉ chiến dịch của user đang đăng nhập */
  const [myCampaignsList, setMyCampaignsList] = useState<{ id: number; title: string }[]>([]);
  const [campaignTitlesMap, setCampaignTitlesMap] = useState<Record<string, string>>({});
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
          id: m.id,
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
        if (dto.targetType === "EXPENDITURE") {
          // Fetch expenditure first, then campaign via exp.campaignId
          try {
            const exp = await expenditureService.getById(dto.targetId);
            setExpenditure(exp);

            if (exp.campaignId) {
              try {
                const campaign = await campaignService.getById(exp.campaignId);
                let coverImageUrl = campaign.coverImageUrl;
                if (!coverImageUrl) {
                  const firstImage = await mediaService.getCampaignFirstImage(campaign.id).catch(() => null);
                  coverImageUrl = firstImage?.url || campaign.coverImageUrl;
                }
                setPost((prev) =>
                  prev
                    ? {
                        ...prev,
                        campaign: {
                          id: String(campaign.id),
                          title: campaign.title ?? "",
                          image: String(coverImageUrl ?? "https://placehold.co/400x200?text=Campaign"),
                          raised: campaign.balance ?? 0,
                          goal: (campaign.balance ?? 0) > 0 ? campaign.balance ?? 0 : 1,
                          progress: (campaign.balance ?? 0) > 0 ? Math.min(100, Math.round(((campaign.balance ?? 0) / ((campaign.balance ?? 0) > 0 ? campaign.balance ?? 0 : 1)) * 100)) : 0,
                          status: campaign.status,
                        } as CampaignInfo,
                      }
                    : null
                );
              } catch {
                // no campaign
              }
            }
          } catch {
            setExpenditure(null);
          }
        } else {
          // CAMPAIGN type — fetch campaign directly with targetId
          try {
            const campaign = await campaignService.getById(dto.targetId);
            const raised = campaign.balance ?? 0;
            const goal = raised > 0 ? raised : 1;

            let coverImageUrl = campaign.coverImageUrl;
            if (!coverImageUrl) {
              const firstImage = await mediaService.getCampaignFirstImage(campaign.id).catch(() => null);
              coverImageUrl = firstImage?.url || campaign.coverImageUrl;
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
          setExpenditure(null);
        }
      }

      const [listRes] = await Promise.all([
        feedPostService.getAll().catch(() => []),
      ]);
      const list = Array.isArray(listRes) ? listRes : [];
      const allFeedPosts = list.map((p) => dtoToFeedPost(p));

      // Filter to posts from the same campaign
      const campaignId = dto.targetId;
      const sameCampaignPosts = campaignId != null
        ? allFeedPosts.filter((p) => p.id !== postId && p.targetId === campaignId)
        : allFeedPosts.filter((p) => p.id !== postId);
      setRelatedPosts(sameCampaignPosts.slice(0, 4));
      setCampaignTitlesMap(Object.fromEntries(
        allFeedPosts
          .filter((p) => p.targetId != null)
          .map((p) => [String(p.targetId), p.targetName || `Chiến dịch #${p.targetId}`])
      ));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error)?.message;
      if (status === 403) {
        setError("Bài viết này đã bị khóa và không thể xem.");
      } else if (status === 404) {
        setError("Không tìm thấy bài viết");
      } else {
        setError(errorMsg ?? "Không tải được bài viết");
      }
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!user?.id) {
      setMyCampaignsList([]);
      return;
    }
    campaignService
      .getByFundOwner(Number(user.id))
      .then((mine) =>
        setMyCampaignsList(mine.map((c) => ({ id: c.id, title: c.title ?? "" })))
      )
      .catch(() => setMyCampaignsList([]));
  }, [user]);

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
        <div className="flex justify-center items-center" style={{ minHeight: "calc(100vh - 120px)" }}>
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8">
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
            campaignsList={myCampaignsList}
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
