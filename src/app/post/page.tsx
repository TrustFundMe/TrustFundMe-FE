"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import DanboxLayout from "@/layout/DanboxLayout";
import CreatePostTrigger from "@/components/feed-post/CreatePostTrigger";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { forumCategoryService } from "@/services/forumCategoryService";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import type { ForumCategory } from "@/types/forumCategory";

// --- Thresholds for badges & activity coloring ---
const HOT_VIEWS = 20;
const HOT_REPLIES = 5;
const ACTIVE_REPLIES = 2;

function getBadge(post: FeedPost): { label: string; color: string; bg: string } | null {
  if ((post.viewCount ?? 0) >= HOT_VIEWS || (post.replyCount ?? 0) >= HOT_REPLIES)
    return { label: "Hot 🔥", color: "#b91c1c", bg: "#fef2f2" };
  if ((post.replyCount ?? 0) >= ACTIVE_REPLIES)
    return { label: "Sôi nổi", color: "#d97706", bg: "#fffbeb" };
  if (post.isPinned)
    return { label: "Ghim", color: "#1A685B", bg: "#f0fdf4" };
  return null;
}

function getReplyStyle(count: number): { color: string; fontWeight: number } {
  if (count >= HOT_REPLIES) return { color: "#16a34a", fontWeight: 700 };
  if (count >= ACTIVE_REPLIES) return { color: "#d97706", fontWeight: 600 };
  return { color: "#94a3b8", fontWeight: 400 };
}

function getViewStyle(count: number): { color: string } {
  if (count >= HOT_VIEWS) return { color: "#1A685B" };
  if (count >= 10) return { color: "#6366f1" };
  return { color: "#94a3b8" };
}

function formatTimeAgo(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  if (isNaN(diffMs)) return "Vừa xong";
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m}p`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString("vi-VN");
}

function AvatarStack({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name}
        title={name}
        className="w-6 h-6 rounded-full border-2 border-white object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=24&background=6366f1&color=fff`;
        }}
      />
    );
  }
  return (
    <div
      title={name}
      className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
      style={{ background: "#6366f1" }}
    >
      {initials}
    </div>
  );
}

const ForumPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [authorNamesMap, setAuthorNamesMap] = useState<Record<string, string>>({});
  const [authorAvatarsMap, setAuthorAvatarsMap] = useState<Record<string, string>>({});
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
        setCategories([
          { id: 1, name: "Chung", slug: "general", color: "#6366f1", displayOrder: 1, postCount: 42 },
          { id: 2, name: "Chiến dịch", slug: "campaigns", color: "#ff5e14", displayOrder: 2, postCount: 28 },
        ]);
      }

      const campaignsData = campaignsRes.status === "fulfilled" ? campaignsRes.value : [];
      const titles: Record<string, string> = {};
      const list: { id: number; title: string }[] = [];
      campaignsData.forEach((c) => {
        titles[String(c.id)] = c.title ?? "";
        list.push({ id: c.id, title: c.title ?? "" });
      });
      setCampaignTitlesMap(titles);
      setCampaignsList(list);

      if (postsRes.status === "fulfilled") {
        const rawList = Array.isArray(postsRes.value) ? postsRes.value : [];
        const feedPosts = rawList
          .map(dtoToFeedPost)
          .sort((a, b) => {
            // Pinned posts always first
            if ((a.isPinned ? 1 : 0) !== (b.isPinned ? 1 : 0))
              return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
            // Then by last activity (updatedAt) descending
            const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
            const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
            return tB - tA;
          });
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
        const avatars: Record<string, string> = {};
        authorIds.forEach((id, i) => {
          const res = userResults[i];
          if (res.status === "fulfilled" && res.value) {
            const fullName = res.value.fullName ?? res.value.name;
            if (fullName) names[id] = fullName;
            if (res.value.avatarUrl) avatars[id] = res.value.avatarUrl;
          }
        });
        setAuthorNamesMap(names);
        setAuthorAvatarsMap(avatars);
      } else {
        setPosts([]);
      }
    } catch {
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

  return (
    <DanboxLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 font-sans">
        <div className="container mx-auto px-4 py-6 max-w-7xl">

          {/* Category tabs */}
          <nav
            aria-label="Danh mục bài viết"
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-5"
          >
            <div className="flex items-center gap-1 p-2 overflow-x-auto" role="tablist">
              <button
                role="tab"
                aria-selected={!categorySlug}
                onClick={() => router.push("/post")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#ff5e14] focus-visible:outline-none ${
                  !categorySlug
                    ? "bg-[#ff5e14] text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                Tất cả chủ đề
                <span className={`ml-1.5 text-xs ${!categorySlug ? "opacity-80" : "text-zinc-400"}`}>
                  ({posts.length})
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={categorySlug === cat.slug}
                  onClick={() => router.push(`/post?category=${cat.slug}`)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#ff5e14] focus-visible:outline-none ${
                    categorySlug === cat.slug
                      ? "bg-[#ff5e14] text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <span className={`text-xs ${categorySlug === cat.slug ? "opacity-75" : "text-zinc-400"}`}>
                    ({categoryCounts[cat.id] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <label htmlFor="post-search" className="sr-only">Tìm kiếm bài viết</label>
              <input
                id="post-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết theo tiêu đề, nội dung, tác giả..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-[#ff5e14] focus:border-transparent text-sm"
              />
              <svg
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Create Post */}
          <div className="mb-5">
            <CreatePostTrigger onClick={() => setIsModalOpen(true)} />
          </div>

          {/* Post list table */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50 dark:bg-zinc-700/60 border-b border-zinc-200 dark:border-zinc-700">
              <div className="col-span-7 text-[11px] font-black uppercase tracking-widest text-zinc-400">Chủ đề</div>
              <div className="col-span-2 text-center hidden md:block text-[11px] font-black uppercase tracking-widest text-zinc-400">Chiến dịch</div>
              <div className="col-span-1 text-center hidden md:block text-[11px] font-black uppercase tracking-widest text-zinc-400">Trả lời</div>
              <div className="col-span-1 text-center hidden md:block text-[11px] font-black uppercase tracking-widest text-zinc-400">Xem</div>
              <div className="col-span-1 text-right text-[11px] font-black uppercase tracking-widest text-zinc-400">Hoạt động</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-8 h-8 border-4 border-[#ff5e14] border-t-transparent rounded-full" aria-label="Đang tải..." />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-400">
                <svg aria-hidden="true" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-semibold">
                  {posts.length === 0 ? "Chưa có bài viết nào." : "Không tìm thấy bài viết phù hợp."}
                </p>
              </div>
            ) : (
              <motion.div
                className="divide-y divide-zinc-100 dark:divide-zinc-700"
                initial={false}
              >
                {filteredPosts.map((post, idx) => {
                  const replyCount = post.replyCount ?? 0;
                  const badge = getBadge(post);
                  const replyStyle = getReplyStyle(replyCount);
                  const viewStyle = getViewStyle(post.viewCount ?? 0);
                  const authorId = String(post.author?.id ?? "");
                  const authorName = authorNamesMap[authorId] || post.author?.name || "Ẩn danh";
                  const authorAvatar = authorAvatarsMap[authorId] || post.author?.avatar;
                  const catColor = post.categoryId
                    ? categories.find((c) => Number(c.id) === Number(post.categoryId))?.color
                    : undefined;
                  const catName = post.categoryId
                    ? categories.find((c) => Number(c.id) === Number(post.categoryId))?.name
                    : undefined;

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.18 }}
                      onClick={() => router.push(`/post/${post.id}`)}
                      className={`grid grid-cols-12 gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/40 cursor-pointer transition-colors items-center group ${post.isPinned ? "bg-amber-50/40 dark:bg-amber-900/10" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem bài viết: ${post.title || "Thảo luận"}`}
                      onKeyDown={(e) => e.key === "Enter" && router.push(`/post/${post.id}`)}
                    >
                      {/* Subject column */}
                      <div className="col-span-7 pr-2">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Badges */}
                          {badge && (
                            <span
                              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                              style={{ color: badge.color, background: badge.bg }}
                            >
                              {badge.label}
                            </span>
                          )}
                          {post.isLocked && (
                            <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100">
                              🔒 Đóng
                            </span>
                          )}
                          {/* Title */}
                          <h3 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#ff5e14] transition-colors leading-snug">
                            {post.title || post.content.replace(/<[^>]*>/g, "").substring(0, 60) || "Thảo luận"}
                          </h3>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Author avatar + name */}
                          <div className="flex items-center gap-1.5">
                            <AvatarStack name={authorName} avatar={authorAvatar} />
                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                              {authorName}
                            </span>
                          </div>

                          {/* Category badge */}
                          {catName && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
                                style={{
                                  color: catColor ?? "#6b7280",
                                  background: catColor ? `${catColor}18` : "#f4f4f5",
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor ?? "#6b7280" }} />
                                {catName}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Content preview */}
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-1 leading-relaxed">
                          {post.content.replace(/<[^>]*>/g, "").substring(0, 120)}
                        </p>
                      </div>

                      {/* Campaign */}
                      <div className="col-span-2 hidden md:flex justify-center">
                        {post.budgetId != null ? (
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {campaignTitlesMap[String(post.budgetId)] || `#${post.budgetId}`}
                          </span>
                        ) : (
                          <span className="text-zinc-300 text-sm">—</span>
                        )}
                      </div>

                      {/* Reply count */}
                      <div className="col-span-1 hidden md:flex flex-col items-center">
                        <span
                          title={replyCount === 0 ? "Hãy là người đầu tiên trả lời!" : `${replyCount} trả lời`}
                          className="text-sm font-semibold cursor-default"
                          style={replyStyle}
                          aria-label={`${replyCount} trả lời`}
                        >
                          {replyCount}
                        </span>
                      </div>

                      {/* View count */}
                      <div className="col-span-1 hidden md:flex flex-col items-center">
                        <span
                          className="text-sm font-medium"
                          style={viewStyle}
                          aria-label={`${post.viewCount ?? 0} lượt xem`}
                        >
                          {post.viewCount ?? 0}
                        </span>
                      </div>

                      {/* Activity / time — shows last activity (comment/edit), falls back to createdAt */}
                      <div className="col-span-1 text-right">
                        <span
                          className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
                          title={new Date(post.updatedAt ?? post.createdAt).toLocaleString("vi-VN")}
                          aria-label={`Hoạt động ${formatTimeAgo(post.updatedAt ?? post.createdAt)}`}
                        >
                          {formatTimeAgo(post.updatedAt ?? post.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Footer count */}
            {!loading && filteredPosts.length > 0 && (
              <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-400 flex items-center justify-between">
                <span>
                  {filteredPosts.length} bài viết{q ? ` cho "${searchQuery}"` : ""}
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Nhiều reply
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Đang sôi nổi
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                    Ít tương tác
                  </span>
                </div>
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
