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
  Heart, MessageCircle, Eye, Plus, Search,
  Pin, Lock, FileText, Building2,
} from "lucide-react";

// ─── utils ────────────────────────────────────────────────────────────────────

function ago(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 604800) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const CAT_COLORS = [
  "#ff5e14", "#6366f1", "#0ea5e9", "#10b981",
  "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444",
];

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Ava({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0 } as const;
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} style={style} className="object-cover"
        onError={e => {
          (e.target as HTMLImageElement).src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff5e14&color=fff&size=${size}`;
        }}
      />
    );
  return (
    <div
      style={{ ...style, background: "#ff5e14", fontSize: size * 0.35 }}
      className="flex items-center justify-center font-bold text-white"
    >
      {initials(name)}
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post, author, authorAvatar, banned,
  catColor, isSeen, onVisible, onOpen, onToggleLike,
}: {
  post: FeedPost;
  author: string;
  authorAvatar?: string;
  banned: boolean;
  catColor?: string;
  isSeen: boolean;
  onVisible: (postId: string) => void; // called once when post enters viewport
  onOpen: () => void;
  onToggleLike?: (postId: string) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

  // Notify parent when post enters viewport — re-check when seenIdsLoaded flips to true
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible(String(post.id));
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imgs = (post.attachments ?? []).filter(a => a.type === "image" && a.url);
  const text = post.content.replace(/<[^>]*>/g, "").trim();

  return (
    <article
      ref={cardRef}
      onClick={onOpen}
      data-post-id={String(post.id)}
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer
        border border-zinc-100 dark:border-zinc-800
        hover:border-zinc-200 dark:hover:border-zinc-700
        hover:shadow-md transition-all duration-200"
      style={{ opacity: isSeen ? 0.7 : 1, transition: "opacity 0.3s" }}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="relative mt-0.5">
          <Ava name={author} src={authorAvatar} size={38} />
          {post.isPinned && (
            <span className="absolute -bottom-1 -right-1 bg-[#ff5e14] rounded-full p-[3px]">
              <Pin className="w-2 h-2 text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-zinc-900 dark:text-white leading-none">
              {author}
            </span>
            {banned && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                Bị khóa
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 flex-wrap">
            <span>{ago(post.updatedAt ?? post.createdAt)}</span>
            {post.category && (
              <>
                <span>·</span>
                <span className="font-medium" style={{ color: catColor }}>
                  #{post.category}
                </span>
              </>
            )}
          </div>
        </div>

        {/* badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {post.isPinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Đã ghim
            </span>
          )}
          {post.isLocked && <Lock className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </div>

      {/* ── Target tag (EXPENDITURE or CAMPAIGN) ── */}
      {post.targetId && post.targetType && (
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          {post.targetType === "EXPENDITURE" ? (
            <Link
              href={`/account/campaigns/expenditures/${post.targetId}`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400
                hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              {post.targetName || `Minh chứng #${post.targetId}`}
            </Link>
          ) : post.targetType === "CAMPAIGN" ? (
            <Link
              href={`/campaign/${post.targetId}`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              {post.targetName || `Chiến dịch #${post.targetId}`}
            </Link>
          ) : null}
        </div>
      )}

      {/* ── Title ── */}
      {post.title && (
        <div className="px-4 pb-2">
          <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white leading-snug line-clamp-2">
            {post.title}
          </h3>
        </div>
      )}

      {/* ── Text preview ── */}
      {text && (
        <p className={`px-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed
          ${post.title ? "line-clamp-2 pb-2" : "line-clamp-3 pb-3"}`}>
          {text}
        </p>
      )}

      {/* ── Images ── */}
      {imgs.length > 0 && (
        <div className={`w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mx-0
          ${imgs.length === 1 ? "aspect-[4/3]" : "aspect-video"}`}>
          {imgs.length === 1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgs[0].url}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "none" }}
            />
          ) : (
            <div
              className="grid h-full gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${Math.min(imgs.length, 3)}, 1fr)` }}
            >
              {imgs.slice(0, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: "none" }}
                  />
                  {i === 2 && imgs.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{imgs.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="px-4 py-3 mt-1 flex items-center gap-5 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleLike?.(post.id);
          }}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-colors text-sm"
        >
          <Heart className={`w-[18px] h-[18px] ${post.liked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="tabular-nums">{post.likeCount ?? 0}</span>
        </button>

        <span className="flex items-center gap-1.5 text-zinc-400 text-sm">
          <Eye className="w-[18px] h-[18px]" />
          <span className="tabular-nums">{post.viewCount ?? 0}</span>
        </span>
      </div>
    </article>
  );
}

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

  // Load campaigns for create-post modal (independent from feed)
  useEffect(() => {
    campaignService.getAll().then((camps: { id: number; title?: string; fundOwnerId?: number }[]) => {
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
  categories.forEach((c, i) => { catMap[c] = CAT_COLORS[i % CAT_COLORS.length]; });

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

            {/* Top bar: search + post button */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm bài viết..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white
                    placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff5e14]/30
                    focus:border-[#ff5e14]/50 transition"
                />
              </div>
              {user && (
                <button
                  onClick={() => setModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5e14] hover:bg-[#e8550f]
                    text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng bài</span>
                </button>
              )}
            </div>


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
                      <PostCard
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
