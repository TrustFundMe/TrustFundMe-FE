"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import DanboxLayout from "@/layout/DanboxLayout";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { CommunityFeedPostCard, FEED_CAT_COLORS } from "@/components/feed-post/CommunityFeedPostCard";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { mediaService } from "@/services/mediaService";
import { likeService } from "@/services/likeService";
import { seenService } from "@/services/seenService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import {
  Search, Plus, MessageCircle, ArrowLeft, FilePenLine,
} from "lucide-react";

type StatusTab = "ALL" | "PUBLISHED" | "DRAFT";

const PAGE_SIZE = 80;

export default function MyFeedPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postMedia, setPostMedia] = useState<Record<string, { type: "image" | "file"; url: string; name?: string }[]>>({});
  const [enrichingPosts, setEnrichingPosts] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [modal, setModal] = useState(false);
  const [campaignTitles, setCampaignTitles] = useState<Record<string, string>>({});
  const [campaignsList, setCampaignsList] = useState<{ id: number; title: string }[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [initialSeenIds, setInitialSeenIds] = useState<Set<string>>(new Set());
  const [seenIdsLoaded, setSeenIdsLoaded] = useState(false);
  const seenTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await feedPostService.getMyPage({ status: "ALL", page: 0, size: PAGE_SIZE });
      const safeContent = Array.isArray(page?.content) ? page.content : [];
      const mapped = safeContent.map(dtoToFeedPost).sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
        const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
        return tb - ta;
      });
      setPosts(mapped);
      setCategories([...new Set(mapped.map(p => p.category).filter((c): c is string => Boolean(c)))]);

      if (user) {
        seenService.getSeenPostIds().then(dbSeen => {
          const strSeen = new Set<string>([...dbSeen].map(String));
          setSeenIds(strSeen);
          setInitialSeenIds(strSeen);
          setSeenIdsLoaded(true);
        }).catch(() => setSeenIdsLoaded(true));
      } else {
        setSeenIdsLoaded(true);
      }
    } catch {
      setPosts([]);
      setError("Không tải được danh sách bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    void loadMyPosts();
  }, [authLoading, isAuthenticated, user, router, loadMyPosts]);

  useEffect(() => {
    campaignService.getAll(0, 100).then((res: { content?: { id: number; title?: string; fundOwnerId?: number }[] } | null) => {
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

  useEffect(() => {
    const toFetch = posts.filter(p => {
      const id = String(p.id);
      return !postMedia[id] && !enrichingPosts.has(id);
    });
    if (toFetch.length === 0) return;

    toFetch.forEach(post => {
      const id = String(post.id);
      setEnrichingPosts(prev => new Set([...prev, id]));
      mediaService.getMediaByPostId(Number(id)).then(mediaList => {
        if (mediaList?.length) {
          const attachments = mediaList.map((m: { mediaType: string; url: string; fileName?: string }) => ({
            type: (m.mediaType === "PHOTO" || m.mediaType === "VIDEO") ? "image" as const : "file" as const,
            url: m.url,
            name: m.fileName,
          }));
          setPostMedia(prev => ({ ...prev, [id]: attachments }));
        }
      }).catch(() => {}).finally(() => {
        setEnrichingPosts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const markSeen = useCallback(async (postId: string) => {
    if (!user) return;
    const numId = Number(postId);
    if (isNaN(numId)) return;
    setSeenIds(prev => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    try {
      const result = await seenService.markSeen(numId);
      if (result.new) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, viewCount: (p.viewCount ?? 0) + 1 } : p));
      }
    } catch { /* ignore */ }
  }, [user]);

  const handleVisible = useCallback((postId: string) => {
    if (!user) return;
    if (seenIds.has(postId)) return;
    if (seenTimersRef.current.has(postId)) return;
    if (!seenIdsLoaded) return;
    const timer = setTimeout(() => {
      seenTimersRef.current.delete(postId);
      void markSeen(postId);
    }, 3000);
    seenTimersRef.current.set(postId, timer);
  }, [user, seenIds, seenIdsLoaded, markSeen]);

  useEffect(() => {
    return () => {
      seenTimersRef.current.forEach(t => clearTimeout(t));
      seenTimersRef.current.clear();
    };
  }, []);

  const handleToggleLike = useCallback(async (postId: string) => {
    let snapshot: { liked: boolean; likeCount: number } | null = null;
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
      if (snapshot) {
        const { liked, likeCount } = snapshot as { liked: boolean; likeCount: number };
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, liked, likeCount } : p))
        );
      }
    }
  }, []);

  const catMap: Record<string, string> = {};
  categories.forEach((c, i) => { catMap[c] = FEED_CAT_COLORS[i % FEED_CAT_COLORS.length]; });

  const displayPosts = posts.map(p => ({
    ...p,
    attachments: postMedia[String(p.id)] ?? p.attachments ?? [],
  }));

  let byStatus = displayPosts;
  if (statusTab === "PUBLISHED") byStatus = byStatus.filter(p => p.status === "PUBLISHED");
  if (statusTab === "DRAFT") byStatus = byStatus.filter(p => p.status === "DRAFT");

  const q = search.trim().toLowerCase();
  const filtered = q
    ? byStatus.filter(p => {
        const t = (p.title ?? "").toLowerCase();
        const c = p.content.replace(/<[^>]*>/g, "").toLowerCase();
        return t.includes(q) || c.includes(q);
      })
    : byStatus;

  const visible = [...filtered].sort((a, b) => {
    if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    const aUnseen = !initialSeenIds.has(String(a.id));
    const bUnseen = !initialSeenIds.has(String(b.id));
    if (aUnseen !== bUnseen) return aUnseen ? -1 : 1;
    const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
    const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
    return tb - ta;
  });

  if (authLoading) {
    return (
      <DanboxLayout header={4} footer={0}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center" style={{ paddingTop: 100 }}>
          <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#ff5e14] animate-spin" />
        </div>
      </DanboxLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DanboxLayout header={4} footer={0}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: 100 }}>
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
          <main className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-col gap-1">
              <Link
                href="/post"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-[#ff5e14] transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                Bảng tin cộng đồng
              </Link>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Bài viết của tôi</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Cùng giao diện thẻ bài như bảng tin — chỉ bài của bạn.</p>
            </div>

            <section
              className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900
                shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none p-3 sm:p-3.5 space-y-3"
              aria-label="Tìm và lọc bài của tôi"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm trong bài của bạn (tiêu đề, nội dung)…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/50
                    border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white
                    placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff5e14]/25
                    focus:border-[#ff5e14]/40 focus:bg-white dark:focus:bg-zinc-900 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "ALL" as const, label: "Tất cả" },
                    { id: "PUBLISHED" as const, label: "Đã đăng" },
                    { id: "DRAFT" as const, label: "Bản nháp" },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                      statusTab === tab.id
                        ? "bg-[#ff5e14] text-white border-[#ff5e14]"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="flex-1 min-w-[80px]" />
                <Link
                  href="/post/drafts"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200/90 dark:border-amber-800/80
                    bg-amber-50/70 dark:bg-amber-950/25 text-xs font-semibold text-amber-900 dark:text-amber-200"
                >
                  <FilePenLine className="w-3.5 h-3.5" />
                  Trang bản nháp
                </Link>
                <button
                  type="button"
                  onClick={() => setModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl bg-[#ff5e14] hover:bg-[#e8550f]
                    text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Đăng bài
                </button>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex flex-wrap items-center gap-2">
                {error}
                <button type="button" onClick={() => void loadMyPosts()} className="font-bold underline">Thử lại</button>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-24">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-[#ff5e14] animate-spin" />
              </div>
            )}

            {!loading && visible.length === 0 && !error && (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <MessageCircle className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                <p className="font-semibold text-zinc-500 dark:text-zinc-400">
                  {posts.length === 0 ? "Bạn chưa có bài viết nào" : "Không có bài nào khớp bộ lọc"}
                </p>
                {posts.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setModal(true)}
                    className="mt-2 px-5 py-2 bg-[#ff5e14] text-white text-sm font-semibold rounded-xl hover:bg-[#e8550f]"
                  >
                    Tạo bài đầu tiên
                  </button>
                )}
              </div>
            )}

            {!loading && visible.length > 0 && (
              <AnimatePresence mode="popLayout">
                {visible.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.16 }}
                  >
                    <CommunityFeedPostCard
                      post={post}
                      author={post.author?.name || "Bạn"}
                      authorAvatar={post.author?.avatar}
                      banned={false}
                      catColor={post.category ? catMap[post.category] : undefined}
                      isSeen={seenIds.has(String(post.id))}
                      onVisible={handleVisible}
                      onOpen={() => router.push(`/post/${post.id}`)}
                      onToggleLike={handleToggleLike}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
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
            onPostCreated={loadMyPosts}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
}
