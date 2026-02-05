"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostDetail from "@/components/feed-post/FeedPostDetail";
import RelatedPosts from "@/components/feed-post/RelatedPosts";
import CampaignCard from "@/components/feed-post/CampaignCard";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { feedPostService } from "@/services/feedPostService";
import { forumCategoryService } from "@/services/forumCategoryService";
import { campaignService } from "@/services/campaignService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import type { ForumCategory } from "@/types/forumCategory";
import { useAuth } from "@/contexts/AuthContextProxy";
import { AnimatePresence } from "framer-motion";

const FeedPostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const postId = params?.id as string;

  const [post, setPost] = useState<(FeedPost & { campaign?: unknown }) | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [campaignsList, setCampaignsList] = useState<{ id: number; title: string }[]>([]);
  const [campaignTitlesMap, setCampaignTitlesMap] = useState<Record<string, string>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
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
      const feedPost = dtoToFeedPost(dto) as FeedPost & { campaign?: unknown };
      setPost(feedPost);
      const authorId = String(dto.authorId);
      try {
        const authorRes = await fetch(`/api/users/${authorId}`, { credentials: "include" });
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          setPost((prev) =>
            prev
              ? {
                ...prev,
                author: {
                  ...prev.author,
                  name: authorData.fullName ?? authorData.name ?? prev.author.name,
                  avatar: authorData.avatarUrl ?? authorData.avatar ?? prev.author.avatar,
                },
              }
              : null
          );
        }
      } catch {
        // Giữ "Thành viên #id" nếu không lấy được user
      }
      if (dto.budgetId != null) {
        try {
          const campaign = await campaignService.getById(dto.budgetId);
          const raised = campaign.balance ?? 0;
          const goal = raised > 0 ? raised : 1;
          setPost((prev) =>
            prev
              ? {
                ...prev,
                campaign: {
                  id: String(campaign.id),
                  title: campaign.title ?? "",
                  image: campaign.coverImage ?? "https://placehold.co/400x200?text=Campaign",
                  raised,
                  goal,
                  progress: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0,
                },
              }
              : null
          );
        } catch {
          // Giữ không có campaign nếu không lấy được
        }
      }
      const [listRes, catsRes, campaignsRes] = await Promise.all([
        feedPostService.getAll(),
        forumCategoryService.getAll().catch(() => []),
        campaignService.getAll().catch(() => []),
      ]);
      const list = Array.isArray(listRes) ? listRes : [];
      setRelatedPosts(list.map((p) => dtoToFeedPost(p)).filter((p) => p.id !== postId).slice(0, 4));
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      const campaigns = Array.isArray(campaignsRes) ? campaignsRes : [];
      const titles: Record<string, string> = {};
      const cList: { id: number; title: string }[] = [];
      campaigns.forEach((c) => {
        titles[String(c.id)] = c.title ?? "";
        cList.push({ id: c.id, title: c.title ?? "" });
      });
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

  const canEdit = isAuthenticated && user && post && String(user.id) === String(post.author.id);

  const handleToggleLike = () => {
    // TODO: API like khi backend có
  };

  const handleToggleFlag = () => {
    // TODO: API báo cáo khi backend có
  };

  const handleEdit = () => {
    setEditModalOpen(true);
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
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[200px]">
          <div className="animate-spin w-8 h-8 border-4 border-[#ff5e14] border-t-transparent rounded-full" />
        </div>
      </DanboxLayout>
    );
  }

  if (!post) {
    return (
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            {error ?? "Không tìm thấy bài viết"}
          </div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={2} footer={2}>
      <section
        className="min-h-screen bg-zinc-50 dark:bg-zinc-900"
        style={{ padding: "24px 0", fontFamily: "var(--font-dm-sans)" }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-6 lg:gap-8">
            {/* Cột 1 (trái): Quay lại + Chủ đề */}
            <aside className="hidden lg:flex flex-col gap-4">
              <Link
                href="/post"
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Link>
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Chủ đề
                </p>
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/post"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Tất cả
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/post?category=${cat.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Cột 2 (giữa): Nội dung bài viết */}
            <div className="min-w-0">
              <div className="lg:hidden mb-4">
                <Link
                  href="/post"
                  className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </Link>
              </div>
              <FeedPostDetail
                post={post}
                onToggleLike={handleToggleLike}
                onToggleFlag={handleToggleFlag}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
              />
            </div>

            {/* Cột 3 (phải): Campaign + Bài liên quan */}
            <aside className="flex flex-col gap-6">
              {post.campaign && (
                <CampaignCard campaign={post.campaign} compact={false} />
              )}
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
            categories={categories}
            campaignsList={campaignsList}
            campaignTitlesMap={campaignTitlesMap}
            initialData={post}
            onPostUpdated={loadPost}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
};

export default FeedPostDetailPage;
