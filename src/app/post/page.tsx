"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import DanboxLayout from "@/layout/DanboxLayout";
import CreatePostTrigger from "@/components/feed-post/CreatePostTrigger";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { forumCategoryService } from "@/services/forumCategoryService";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { useAuth } from "@/contexts/AuthContextProxy";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import type { ForumCategory } from "@/types/forumCategory";

const ForumPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [authorNamesMap, setAuthorNamesMap] = useState<Record<string, string>>({});
  const [campaignTitlesMap, setCampaignTitlesMap] = useState<Record<string, string>>({});
  const [campaignsList, setCampaignsList] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, postsRes, campaignsRes] = await Promise.allSettled([
        forumCategoryService.getAll(),
        feedPostService.getAll(),
        campaignService.getAll(),
      ]);

      if (catsRes.status === "fulfilled") {
        setCategories(catsRes.value);
      } else {
        const err = catsRes.reason;
        const is503 = err?.response?.status === 503;
        if (!is503) console.error("Categories fetch failed", err);
        setCategories([
          { id: 1, name: "Chung", slug: "general", color: "#6366f1", displayOrder: 1, postCount: 42 },
          { id: 2, name: "Chiến dịch", slug: "campaigns", color: "#ff5e14", displayOrder: 2, postCount: 28 },
        ]);
      }

      const campaignsList = campaignsRes.status === "fulfilled" ? campaignsRes.value : [];
      const titles: Record<string, string> = {};
      const list: { id: number; title: string }[] = [];
      campaignsList.forEach((c) => {
        titles[String(c.id)] = c.title ?? "";
        list.push({ id: c.id, title: c.title ?? "" });
      });
      setCampaignTitlesMap(titles);
      setCampaignsList(list);

      if (postsRes.status === "fulfilled") {
        const list = Array.isArray(postsRes.value) ? postsRes.value : [];
        const feedPosts = list.map(dtoToFeedPost);
        setPosts(feedPosts);

        const authorIds = [...new Set(feedPosts.map((p) => String(p.author?.id)).filter(Boolean))];
        const userResults = await Promise.allSettled(
          authorIds.map((id) =>
            fetch(`/api/users/${id}`, { credentials: "include" }).then((r) =>
              r.ok ? r.json() : Promise.resolve(null)
            )
          )
        );

        const names: Record<string, string> = {};
        authorIds.forEach((id, i) => {
          const res = userResults[i];
          if (res.status === "fulfilled" && res.value) {
            const fullName = res.value.fullName ?? res.value.name;
            if (fullName) names[id] = fullName;
          }
        });
        setAuthorNamesMap(names);
      } else {
        const err = postsRes.reason;
        const is503 = err?.response?.status === 503;
        if (!is503) console.error("Posts fetch failed", err);
        setPosts([]);
      }
    } catch (error) {
      console.error("Load data error", error);
      setCategories([
        { id: 1, name: "Chung", slug: "general", color: "#6366f1", displayOrder: 1, postCount: 42 },
        { id: 2, name: "Chiến dịch", slug: "campaigns", color: "#ff5e14", displayOrder: 2, postCount: 28 },
      ]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => setLoading(false));
  }, [categorySlug]);

  const activeCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const activeCategoryId = activeCategory?.id;

  const categoryCounts: Record<number, number> = {};
  categories.forEach((cat) => {
    const isGeneral = cat.slug === "general" || cat.displayOrder === 1;
    categoryCounts[cat.id] = posts.filter((p) => {
      const pid = p.categoryId != null ? Number(p.categoryId) : null;
      if (isGeneral) return pid === null || pid === cat.id;
      return pid === cat.id;
    }).length;
  });

  const postsByCategory =
    activeCategoryId != null
      ? posts.filter((p) => {
        const pid = p.categoryId != null ? Number(p.categoryId) : null;
        const isGeneral = activeCategory?.slug === "general" || activeCategory?.displayOrder === 1;
        if (isGeneral) return pid === null || pid === Number(activeCategoryId);
        return pid === Number(activeCategoryId);
      })
      : posts;
  const q = searchQuery.trim().toLowerCase();
  const filteredPosts = q
    ? postsByCategory.filter((p) => {
      const title = (p.title ?? "").toLowerCase();
      const content = (p.content ?? "").replace(/<[^>]*>/g, "").toLowerCase();
      const authorName = (authorNamesMap[String(p.author?.id)] ?? p.author?.name ?? "").toLowerCase();
      return title.includes(q) || content.includes(q) || authorName.includes(q);
    })
    : postsByCategory;

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    if (isNaN(diffMs)) return "Vừa xong";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString("vi-VN");
  };

  return (
    <DanboxLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 font-sans">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Categories */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center gap-2 p-2 overflow-x-auto">
              <button
                onClick={() => router.push("/post")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!categorySlug
                  ? "bg-[#ff5e14] text-white"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
              >
                Tất cả chủ đề
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/post?category=${cat.slug}`)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categorySlug === cat.slug
                    ? "bg-[#ff5e14] text-white"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                  <span className="text-xs opacity-70">({categoryCounts[cat.id] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search - hàng riêng */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết theo tiêu đề, nội dung, tác giả..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#ff5e14] focus:border-transparent"
                aria-label="Tìm kiếm bài viết"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Tạo bài - hàng riêng */}
          <div className="mb-6">
            <CreatePostTrigger onClick={() => setIsModalOpen(true)} />
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-100 dark:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
              <div className="col-span-7">Chủ đề</div>
              <div className="col-span-2 text-center hidden md:block">Chiến dịch</div>
              <div className="col-span-1 text-center hidden md:block">Trả lời</div>
              <div className="col-span-1 text-center hidden md:block">Xem</div>
              <div className="col-span-1 text-right">Hoạt động</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-[#ff5e14] border-t-transparent rounded-full" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                {posts.length === 0 ? "Chưa có kết quả nào." : "Không tìm thấy bài viết phù hợp."}
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors items-center"
                  >
                    <div className="col-span-7 pr-4">
                      <div className="mb-1">
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#ff5e14] transition-colors">
                          {post.isPinned && <span className="inline-block mr-2">📌</span>}
                          {post.title || post.content.replace(/<[^>]*>/g, '').substring(0, 50) || "Thảo luận"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{post.author?.id ? (authorNamesMap[post.author.id] || post.author.name) : (post.author?.name || "Anonymous")}</span>
                        {categories.length > 0 && post.categoryId && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#999' }} />
                              {categories.find(c => Number(c.id) === Number(post.categoryId))?.name || 'General'}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                      </p>
                    </div>

                    <div className="col-span-2 text-center hidden md:flex justify-center">
                      {post.budgetId != null ? (
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                          {campaignTitlesMap[String(post.budgetId)] || `Chiến dịch #${post.budgetId}`}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </div>
                    <div className="col-span-1 text-center hidden md:block">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{post.replyCount || 0}</span>
                    </div>
                    <div className="col-span-1 text-center hidden md:block">
                      <span className="text-zinc-500">{post.viewCount || 0}</span>
                    </div>
                    <div className="col-span-1 text-right text-sm text-[#ff5e14]/80 font-medium">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateOrEditPostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            categories={categories}
            campaignsList={campaignsList}
            campaignTitlesMap={campaignTitlesMap}
            onPostCreated={loadData}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
};

export default ForumPage;
