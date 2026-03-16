"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import DanboxLayout from "@/layout/DanboxLayout";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { expenditureService } from "@/services/expenditureService";
import { likeService } from "@/services/likeService";
import { mediaService } from "@/services/mediaService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import type { Expenditure } from "@/types/expenditure";
import { useAuth } from "@/contexts/AuthContextProxy";
import {
  Heart, MessageCircle, Eye, Plus, Search,
  Flame, Pin, Lock, FileText,
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
  campaign, campaignOff, expenditure, catColor, isSeen, onSeen, onOpen, onToggleLike,
}: {
  post: FeedPost;
  author: string;
  authorAvatar?: string;
  banned: boolean;
  campaign?: string;
  campaignOff?: boolean;
  expenditure?: { id: number; plan?: string };
  catColor?: string;
  isSeen: boolean;
  onSeen: () => void;
  onOpen: () => void;
  onToggleLike?: (postId: string) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

  // Facebook-style: mark seen when post is ≥50% in viewport for 1.5s
  useEffect(() => {
    if (isSeen) return; // already seen, skip observer
    const el = cardRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(onSeen, 1500);
        } else {
          if (timer) { clearTimeout(timer); timer = null; }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  // onSeen is stable (useCallback) so this is safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeen]);

  const imgs = (post.attachments ?? []).filter(a => a.type === "image" && a.url);
  const text = post.content.replace(/<[^>]*>/g, "").trim();
  const hot  = (post.viewCount ?? 0) >= 20 || (post.likeCount ?? 0) >= 10;

  return (
    <article
      ref={cardRef}
      onClick={onOpen}
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
          {hot && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Hot
            </span>
          )}
          {post.isLocked && <Lock className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </div>

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
            <img src={imgs[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="grid h-full gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${Math.min(imgs.length, 3)}, 1fr)` }}
            >
              {imgs.slice(0, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
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

      {/* ── Tags row: campaign + PE ── */}
      {(campaign || expenditure) && (
        <div className="px-4 pt-2.5 pb-1 flex items-center gap-2 flex-wrap">
          {/* Campaign tag */}
          {campaign && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              ${campaignOff
                ? "bg-red-50 text-red-400 line-through"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {campaign}
            </span>
          )}

          {/* PE (Expenditure) tag — direct link, stop propagation so card doesn't open */}
          {expenditure && (
            <Link
              href={`/account/campaigns/expenditures/${expenditure.id}`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400
                hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {expenditure.plan || `Minh chứng #${expenditure.id}`}
            </Link>
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

        <span className="flex items-center gap-1.5 text-zinc-500 text-sm">
          <MessageCircle className="w-[18px] h-[18px]" />
          <span className="tabular-nums">{post.replyCount ?? 0}</span>
        </span>

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
  const [categories, setCategories]         = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [authorNames, setAuthorNames]       = useState<Record<string, string>>({});
  const [authorAvatars, setAuthorAvatars]   = useState<Record<string, string>>({});
  const [authorBanned, setAuthorBanned]     = useState<Record<string, boolean>>({});
  const [campaignTitles, setCampaignTitles] = useState<Record<string, string>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>({});
  const [campaignsList, setCampaignsList]   = useState<{ id: number; title: string }[]>([]);
  const [expenditures, setExpenditures]     = useState<Record<string, Expenditure>>({});
  const [loading, setLoading]               = useState(true);
  const [modal, setModal]                   = useState(false);
  const [search, setSearch]                 = useState("");
  const [seenIds, setSeenIds]               = useState<Set<string>>(new Set()); // live — written to localStorage
  const [initialSeenIds, setInitialSeenIds] = useState<Set<string>>(new Set()); // snapshot at mount — used for filtering
  const [quickFilter, setQuickFilter]       = useState<"all" | "unseen" | "seen" | "hot">("all");

  const load = async () => {
    setLoading(true);
    try {
      const postsP = filterCampaignId
        ? feedPostService.getByCampaignId(filterCampaignId, { size: 50 }).then(r => r.content)
        : feedPostService.getAll();

      const [postsR, campaignsR] = await Promise.allSettled([
        postsP,
        campaignService.getAll(),
      ]);

      const campsData = campaignsR.status === "fulfilled" ? campaignsR.value : [];
      const titles: Record<string, string>  = {};
      const statuses: Record<string, string> = {};
      const list: { id: number; title: string }[] = [];
      campsData.forEach(c => {
        titles[String(c.id)]  = c.title ?? "";
        if (c.status) statuses[String(c.id)] = c.status;
        // Only add user's own campaigns to the create-post dropdown
        if (user?.id && Number(c.fundOwnerId) === Number(user.id)) {
          list.push({ id: c.id, title: c.title ?? "" });
        }
      });
      setCampaignTitles(titles);
      setCampaignStatuses(statuses);
      setCampaignsList(list);

      if (postsR.status === "fulfilled") {
        const raw    = Array.isArray(postsR.value) ? postsR.value : [];
        const mapped = raw.map(dtoToFeedPost).sort((a, b) => {
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
          const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
          return tb - ta;
        });

        // Fetch media for each post so cards show images (Instagram-style)
        const mediaByPost = await Promise.all(
          mapped.map((p) =>
            mediaService.getMediaByPostId(Number(p.id)).catch(() => [] as { url: string; fileName?: string }[])
          )
        );
        const withAttachments = mapped.map((p, i) => ({
          ...p,
          attachments: (mediaByPost[i] ?? []).map((m) => ({
            type: "image" as const,
            url: m.url,
            name: m.fileName,
          })),
        }));
        setPosts(withAttachments);
        setCategories([
          ...new Set(mapped.map(p => p.category).filter((c): c is string => Boolean(c))),
        ]);

        // Fetch author info
        const ids = [...new Set(mapped.map(p => String(p.author?.id)).filter(Boolean))];
        const userRes = await Promise.allSettled(
          ids.map(id =>
            fetch(`/api/users/${id}`, { credentials: "include" }).then(r => (r.ok ? r.json() : null))
          )
        );
        const names: Record<string, string>  = {};
        const avs:   Record<string, string>  = {};
        const bans:  Record<string, boolean> = {};
        ids.forEach((id, i) => {
          const r = userRes[i];
          if (r.status === "fulfilled" && r.value) {
            const n = r.value.fullName ?? r.value.name;
            if (n) names[id] = n;
            if (r.value.avatarUrl) avs[id] = r.value.avatarUrl;
            bans[id] = r.value.isActive === false;
          }
        });
        setAuthorNames(names);
        setAuthorAvatars(avs);
        setAuthorBanned(bans);

        // Fetch expenditure info for posts with expenditureId
        const expIds = [
          ...new Set(
            mapped
              .map(p => p.expenditureId)
              .filter((id): id is number => id != null)
          ),
        ];
        if (expIds.length > 0) {
          const expResults = await Promise.allSettled(
            expIds.map(id => expenditureService.getById(id))
          );
          const expMap: Record<string, Expenditure> = {};
          expIds.forEach((id, i) => {
            const r = expResults[i];
            if (r.status === "fulfilled") expMap[String(id)] = r.value;
          });
          setExpenditures(expMap);
        }
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load seen posts from localStorage once on mount
  // initialSeenIds is frozen for the session — filtering/display only updates on refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("feed_seen_posts");
      if (raw) {
        const s = new Set<string>(JSON.parse(raw));
        setSeenIds(s);
        setInitialSeenIds(s); // snapshot — won't change until next page load
      }
    } catch {
      // ignore
    }
  }, []);

  const markSeen = useCallback((postId: string) => {
    if (typeof window === "undefined") return;
    setSeenIds(prev => {
      if (prev.has(postId)) return prev; // no-op, avoid unnecessary re-render
      const next = new Set(prev);
      next.add(postId);
      try {
        window.localStorage.setItem("feed_seen_posts", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
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
  useEffect(() => { load().catch(() => setLoading(false)); }, [campaignIdParam]);

  // derived
  const isHot = (post: FeedPost): boolean =>
    (post.viewCount ?? 0) >= 20 || (post.likeCount ?? 0) >= 10;

  const catMap: Record<string, string> = {};
  categories.forEach((c, i) => { catMap[c] = CAT_COLORS[i % CAT_COLORS.length]; });

  // posts is already sorted by pinned-first + time desc (from load())
  // Do NOT re-sort here based on seenIds — that would cause posts to jump positions
  // seenIds is only used for FILTERING (quickFilter buttons), not sorting
  let base = posts;
  if (activeCategory) base = base.filter(p => p.category === activeCategory);

  if (quickFilter === "unseen") {
    base = base.filter(p => !initialSeenIds.has(String(p.id)));
  } else if (quickFilter === "seen") {
    base = base.filter(p => initialSeenIds.has(String(p.id)));
  } else if (quickFilter === "hot") {
    base = base.filter(p => isHot(p));
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? base.filter(p => {
        const t = (p.title ?? "").toLowerCase();
        const c = p.content.replace(/<[^>]*>/g, "").toLowerCase();
        const a = (authorNames[String(p.author?.id)] ?? "").toLowerCase();
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
    <DanboxLayout footer={0}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: 130 }}>
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

            {/* Category + quick filter pills (no overlay) */}
            <div className="flex flex-wrap gap-2 pb-2">
              <button
                onClick={() => { setActiveCategory(null); setQuickFilter("all"); }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === null && quickFilter === "all"
                    ? "text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                  }`}
                style={activeCategory === null && quickFilter === "all" ? { background: "#18181b" } : {}}
              >
                Tất cả ({posts.length})
              </button>
              {categories.map(cat => {
                const active = activeCategory === cat && quickFilter === "all";
                return (
                  <button
                    key={cat}
                    onClick={() => { setQuickFilter("all"); setActiveCategory(active ? null : cat); }}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${active
                        ? "text-white"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    style={active ? { background: catMap[cat] } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
              {[
                { id: "unseen" as const, label: "Chưa xem", active: "bg-emerald-500 text-white" },
                { id: "seen" as const, label: "Đã xem", active: "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" },
                { id: "hot" as const, label: "Đang hot", active: "bg-red-500 text-white" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setQuickFilter(f.id); setActiveCategory(null); }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${quickFilter === f.id ? f.active : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"}`}
                >
                  {f.label}
                </button>
              ))}
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

            {/* Loading */}
            {loading && (
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
                  const aid    = String(post.author?.id ?? "");
                  const name   = authorNames[aid] || post.author?.name || "Ẩn danh";
                  const ava    = authorAvatars[aid] || post.author?.avatar;
                  const ban    = authorBanned[aid] ?? false;

                  // Campaign: only from campaignId (not from expenditureId)
                  const campId  = post.campaignId;
                  const camp    = campId ? campaignTitles[String(campId)] : undefined;
                  const campOff = campId ? campaignStatuses[String(campId)] === "DISABLED" : false;

                  // PE (Expenditure): from expenditureId
                  const expId  = post.expenditureId;
                  const expObj = expId ? expenditures[String(expId)] : undefined;
                  const expTag = expId
                    ? { id: expId, plan: expObj?.plan ?? undefined }
                    : undefined;

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
                        author={name}
                        authorAvatar={ava}
                        banned={ban}
                        campaign={camp}
                        campaignOff={campOff}
                        expenditure={expTag}
                        catColor={post.category ? catMap[post.category] : undefined}
                        isSeen={seenIds.has(String(post.id))}
                        onSeen={() => markSeen(String(post.id))}
                        onOpen={() => router.push(`/post/${post.id}`)}
                        onToggleLike={handleToggleLike}
                      />
                    </motion.div>
                  );
                })}
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
            categories={categories}
            campaignsList={campaignsList}
            campaignTitlesMap={campaignTitles}
            onPostCreated={load}
          />
        )}
      </AnimatePresence>
    </DanboxLayout>
  );
}
