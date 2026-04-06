"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import DanboxLayout from "@/layout/DanboxLayout";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { mediaService } from "@/services/mediaService";
import { likeService } from "@/services/likeService";
import { seenService } from "@/services/seenService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import {
  MessageCircle, Plus, Search,
  UserRound, FilePenLine,
} from "lucide-react";
import { CommunityFeedPostCard, FEED_CAT_COLORS } from "@/components/feed-post/CommunityFeedPostCard";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForumPage() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { user }      = useAuth();
  const campaignIdParam   = searchParams.get("campaignId");
  const filterCampaignId  = campaignIdParam ? Number(campaignIdParam) : null;

  const [posts, setPosts]                   = useState<FeedPost[]>([]);
  const [postMedia, setPostMedia]           = useState<Record<string, { type: "image" | "file"; url: string; name?: string }[]>>({});
  const [enrichingPosts, setEnrichingPosts] = useState<Set<string>>(new Set());
  const [categories, setCategories]         = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [campaignTitles, setCampaignTitles]  = useState<Record<string, string>>({});
  const [campaignsList, setCampaignsList]   = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading]               = useState(true);
  const [modal, setModal]                   = useState(false);
  const [search, setSearch]                 = useState("");
  const [seenIds, setSeenIds]               = useState<Set<string>>(new Set()); // live — written to localStorage
  const [initialSeenIds, setInitialSeenIds] = useState<Set<string>>(new Set()); // snapshot at mount — used for filtering
  const [seenIdsLoaded, setSeenIdsLoaded]   = useState(false); // guard: don't trigger observer until seenIds are fetched from DB
  const [quickFilter, setQuickFilter]       = useState<"all" | "unseen" | "seen" | "pinned">("all");
  // Scroll-based seen tracking
  const seenTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()); // postId → timer
  // Infinite scroll
  const [currentPage, setCurrentPage]       = useState(0);
  const [hasMore, setHasMore]              = useState(true);
  const [isLoadingMore, setIsLoadingMore]   = useState(false);
  const loadMoreRef                        = useRef<HTMLDivElement | null>(null);

  const PAGE_SIZE = 5;

  const loadInitial = async () => {
    setLoading(true);
    setCurrentPage(0);
    setHasMore(true);
    try {
      const raw = filterCampaignId
        ? await feedPostService.getByCampaignId(filterCampaignId, { page: 0, size: PAGE_SIZE }).then(r => ({ content: r.content, total: r.totalElements }))
        : await feedPostService.getPage({ page: 0, size: PAGE_SIZE }).then(r => ({ content: r.content, total: r.totalElements }));

      const mapped = (Array.isArray(raw.content) ? raw.content : []).map(dtoToFeedPost).sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
        const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
        return tb - ta;
      });

      setPosts(mapped);
      setHasMore(mapped.length >= PAGE_SIZE && mapped.length < raw.total);
      setCategories([
        ...new Set(mapped.map(p => p.category).filter((c): c is string => Boolean(c))),
      ]);

      // Fetch seen IDs from backend (read-only — do NOT auto-mark on load)
      if (user) {
        seenService.getSeenPostIds().then(dbSeen => {
          const strSeen = new Set<string>([...dbSeen].map(String));
          setSeenIds(strSeen);
          setInitialSeenIds(strSeen);
          setSeenIdsLoaded(true);
        }).catch(() => {
          setSeenIdsLoaded(true); // treat error as empty set — allow observer to run
        });
      } else {
        setSeenIdsLoaded(true); // not logged in — allow observer to run
      }
    } catch {
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || loading) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const raw = filterCampaignId
        ? await feedPostService.getByCampaignId(filterCampaignId, { page: nextPage, size: PAGE_SIZE })
        : await feedPostService.getPage({ page: nextPage, size: PAGE_SIZE });
      const mapped = (Array.isArray(raw.content) ? raw.content : []).map(dtoToFeedPost);
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filtered = mapped.filter(p => !existingIds.has(p.id));
        return [...prev, ...filtered].sort((a, b) => {
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
          const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
          return tb - ta;
        });
      });
      // Sync new post IDs into seenIds state so they can be tracked during scroll
      setSeenIds(prev => {
        const merged = new Set(prev);
        mapped.forEach(p => merged.add(String(p.id)));
        return merged;
      });
      setCurrentPage(nextPage);
      setHasMore(mapped.length >= PAGE_SIZE && mapped.length < raw.totalElements);
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Fetch media for posts that don't have it yet
  useEffect(() => {
    const toFetch = posts.filter(p => {
      const id = String(p.id);
      return !postMedia[id] && !enrichingPosts.has(id);
    });
    if (toFetch.length === 0) return;

    toFetch.forEach(post => {
      const id = String(post.id);
      setEnrichingPosts(prev => new Set([...prev, id]));
      console.log(`[/post] Fetching media for post ${id}`);
      mediaService.getMediaByPostId(Number(id)).then(mediaList => {
        console.log(`[/post] Media for post ${id}:`, mediaList?.length, "items", mediaList);
        if (mediaList?.length) {
          const attachments = mediaList.map((m: { mediaType: string; url: string; fileName?: string }) => ({
            type: (m.mediaType === "PHOTO" || m.mediaType === "VIDEO") ? "image" as const : "file" as const,
            url: m.url,
            name: m.fileName,
          }));
          setPostMedia(prev => ({ ...prev, [id]: attachments }));
        }
      }).catch((err) => {
        console.error(`[/post] Failed to fetch media for post ${id}:`, err);
      }).finally(() => {
        setEnrichingPosts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  // Load campaigns for create-post modal (independent from feed)
  useEffect(() => {
    campaignService.getAll(0, 100).then((res: { content?: { id: number; title?: string; fundOwnerId?: number }[]; totalElements?: number } | null) => {
      const camps = Array.isArray(res) ? res : (res?.content ?? []);
      const titles: Record<string, string> = {};
      const list: { id: number; title: string }[] = [];
      camps.forEach(c => {
        const title = c.title ?? "";
        titles[String(c.id)] = title;
        if (user?.id && Number(c.fundOwnerId) === Number(user.id)) {
          list.push({ id: c.id, title });
        }
      });
      setCampaignTitles(titles);
      setCampaignsList(list);
    }).catch(() => { /* non-critical */ });
  }, [user]);

  const markSeen = useCallback(async (postId: string) => {
    if (!user) return; // only track seen for logged-in users
    const numId = Number(postId);
    if (isNaN(numId)) return;
    // Optimistically add to seenIds
    setSeenIds(prev => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    // Only increment viewCount after BE confirms this is a new view
    try {
      const result = await seenService.markSeen(numId);
      if (result.new) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, viewCount: (p.viewCount ?? 0) + 1 } : p));
      }
    } catch {
      // non-critical
    }
  }, [user]);

  // Called by PostCard when it enters viewport — starts 3s timer
  const handleVisible = useCallback((postId: string) => {
    if (!user) return;
    if (seenIds.has(postId)) return;
    if (seenTimersRef.current.has(postId)) return;
    if (!seenIdsLoaded) return;
    const timer = setTimeout(() => {
      seenTimersRef.current.delete(postId);
      markSeen(postId);
    }, 3000);
    seenTimersRef.current.set(postId, timer);
  }, [user, seenIds, seenIdsLoaded]);

  // When seenIds are loaded, check visibility for posts already in viewport + set up scroll listener
  useEffect(() => {
    if (!seenIdsLoaded) return;
    const checkVisibility = () => {
      const allPosts = document.querySelectorAll("article[data-post-id]");
      allPosts.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const id = el.getAttribute("data-post-id");
          if (id) handleVisible(id);
        }
      });
    };
    checkVisibility(); // check immediately after seenIdsLoaded flips
    window.addEventListener("scroll", checkVisibility, { passive: true });
    return () => window.removeEventListener("scroll", checkVisibility);
  }, [seenIdsLoaded]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      seenTimersRef.current.forEach(t => clearTimeout(t));
      seenTimersRef.current.clear();
    };
  }, []);

  const handleToggleLike = useCallback(async (postId: string) => {
    let snapshot: { liked: boolean; likeCount: number } | null = null;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          snapshot = { liked: p.liked ?? false, likeCount: p.likeCount ?? 0 };
          return {
            ...p,
            liked: !p.liked,
            likeCount: Math.max(0, (p.likeCount ?? 0) + (p.liked ? -1 : 1)),
          };
        }
        return p;
      })
    );
    try {
      const res = await likeService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: res.liked, likeCount: res.likeCount } : p
        )
      );
    } catch {
      // Rollback on error
      if (snapshot) {
        const { liked, likeCount } = snapshot as { liked: boolean; likeCount: number };
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, liked, likeCount } : p))
        );
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadInitial().catch(() => setLoading(false)); }, [campaignIdParam]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, hasMore, isLoadingMore, filterCampaignId, loading]);


  const catMap: Record<string, string> = {};
  categories.forEach((c, i) => { catMap[c] = FEED_CAT_COLORS[i % FEED_CAT_COLORS.length]; });

  // Merge fetched media into posts for display
  const displayPosts = posts.map(p => ({
    ...p,
    attachments: postMedia[String(p.id)] ?? p.attachments ?? [],
  }));

  // displayPosts is already sorted by pinned-first + time desc (from load())
  // Do NOT re-sort here based on seenIds — that would cause posts to jump positions
  // seenIds is only used for FILTERING (quickFilter buttons), not sorting
  let base = displayPosts;
  if (activeCategory) base = base.filter(p => p.category === activeCategory);

  if (quickFilter === "unseen") {
    base = base.filter(p => !initialSeenIds.has(String(p.id)));
  } else if (quickFilter === "seen") {
    base = base.filter(p => initialSeenIds.has(String(p.id)));
  } else if (quickFilter === "pinned") {
    base = base.filter(p => !!p.isPinned);
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? base.filter(p => {
        const t = (p.title ?? "").toLowerCase();
        const c = p.content.replace(/<[^>]*>/g, "").toLowerCase();
        const a = (p.author?.name ?? "").toLowerCase();
        return t.includes(q) || c.includes(q) || a.includes(q);
      })
    : base;

  // Prioritize unread posts first (using initialSeenIds snapshot so positions don't jump)
  const visible = [...filtered].sort((a, b) => {
    if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    const aUnseen = !initialSeenIds.has(String(a.id));
    const bUnseen = !initialSeenIds.has(String(b.id));
    if (aUnseen !== bUnseen) return aUnseen ? -1 : 1;
    const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
    const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
    return tb - ta;
  });

  return (
    <DanboxLayout header={4} footer={0}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: 100 }}>
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
          {/* ── MAIN FEED ── */}
          <main className="flex-1 min-w-0 space-y-3">

            {/* Thanh công cụ: tìm kiếm + lối tắt — chữ Việt đầy đủ, phân tầng rõ */}
            <section
              className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900
                shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none p-3 sm:p-3.5"
              aria-label="Tìm và đăng bài">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm theo tiêu đề, nội dung hoặc tên tác giả…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/50
                      border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white
                      placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff5e14]/25
                      focus:border-[#ff5e14]/40 focus:bg-white dark:focus:bg-zinc-900 transition"
                  />
                </div>
                {user && (
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                    <Link
                      href="/post/my"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                        border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900
                        text-sm font-semibold text-zinc-800 dark:text-zinc-100
                        hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                    >
                      <UserRound className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden />
                      <span>Bài của tôi</span>
                    </Link>
                    <Link
                      href="/post/drafts"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                        border border-amber-200/90 dark:border-amber-800/80
                        bg-amber-50/70 dark:bg-amber-950/25
                        text-sm font-semibold text-amber-900 dark:text-amber-200
                        hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    >
                      <FilePenLine className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
                      <span>Bản nháp</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px]
                        bg-[#ff5e14] hover:bg-[#e8550f] active:scale-[0.99]
                        text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4 shrink-0" aria-hidden />
                      <span>Đăng bài</span>
                    </button>
                  </div>
                )}
              </div>
            </section>


            {/* Campaign filter banner */}
            {filterCampaignId && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30
                rounded-xl border border-blue-100 dark:border-blue-900">
                <span className="text-sm text-blue-700 dark:text-blue-300 flex-1 truncate">
                  {campaignTitles[String(filterCampaignId)]
                    ? `Chiến dịch: ${campaignTitles[String(filterCampaignId)]}`
                    : `Chiến dịch #${filterCampaignId}`}
                </span>
                <button
                  onClick={() => router.push("/post")}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  Bỏ lọc
                </button>
              </div>
            )}

            {/* Active category indicator */}
            {activeCategory && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: catMap[activeCategory] }}>
                  #{activeCategory}
                </span>
                <span className="text-sm text-zinc-400">· {visible.length} bài viết</span>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Bỏ lọc
                </button>
              </div>
            )}

            {/* Loading initial */}
            {loading && !isLoadingMore && (
              <div className="flex justify-center py-24">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-[#ff5e14] animate-spin" />
              </div>
            )}

            {/* Empty */}
            {!loading && visible.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <MessageCircle className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                <div>
                  <p className="font-semibold text-zinc-500 dark:text-zinc-400">
                    {posts.length === 0 ? "Chưa có bài viết nào" : "Không tìm thấy kết quả"}
                  </p>
                  {posts.length === 0 && user && (
                    <button
                      onClick={() => setModal(true)}
                      className="mt-4 px-5 py-2 bg-[#ff5e14] text-white text-sm font-semibold rounded-xl
                        hover:bg-[#e8550f] transition-colors"
                    >
                      Tạo bài đầu tiên
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Posts */}
            {!loading && visible.length > 0 && (
              <AnimatePresence mode="popLayout">
                {visible.map((post, idx) => {
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.025, duration: 0.16 }}
                    >
                      <CommunityFeedPostCard
                        post={post}
                        author={post.author?.name || "Ẩn danh"}
                        authorAvatar={post.author?.avatar}
                        banned={false}
                        catColor={post.category ? catMap[post.category] : undefined}
                        isSeen={seenIds.has(String(post.id))}
                        onVisible={handleVisible}
                        onOpen={() => router.push(`/post/${post.id}`)}
                        onToggleLike={handleToggleLike}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {isLoadingMore ? (
                <div className="w-6 h-6 rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-[#ff5e14] animate-spin" />
              ) : !hasMore && !loading ? (
                <span className="text-sm text-zinc-400">— Đã xem hết tất cả bài viết —</span>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <CreateOrEditPostModal
            isOpen={modal}
            onClose={() => setModal(false)}
            campaignsList={campaignsList}
            campaignTitlesMap={campaignTitles}
            onPostCreated={loadInitial}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
}
