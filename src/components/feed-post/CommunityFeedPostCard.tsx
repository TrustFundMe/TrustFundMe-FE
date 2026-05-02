"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart, Eye, Pin, Lock, FileText, Building2, BadgeCheck,
} from "lucide-react";
import type { FeedPost } from "@/types/feedPost";

export const FEED_CAT_COLORS = [
  "#ff5e14", "#6366f1", "#0ea5e9", "#10b981",
  "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444",
];

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

export function CommunityFeedPostCard({
  post, author, authorAvatar, banned,
  catColor, isSeen: _isSeen, onVisible, onOpen, onToggleLike, isFollowerLocked = false, onFollowCampaign,
}: {
  post: FeedPost;
  author: string;
  authorAvatar?: string;
  banned: boolean;
  catColor?: string;
  isSeen: boolean;
  onVisible: (postId: string) => void;
  onOpen: () => void;
  onToggleLike?: (postId: string) => void;
  isFollowerLocked?: boolean;
  onFollowCampaign?: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

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

  const imgs = (post.attachments ?? []).filter(a => {
    const isImage = a.type === "image" || (a as any).mediaType === "PHOTO" || (a as any).mediaType === "VIDEO";
    return isImage && a.url;
  });
  const text = post.content.replace(/<[^>]*>/g, "").trim();
  const isEvidence = post.targetName?.startsWith('evidence');
  let evidencePlanName = post.targetName?.includes('|') ? post.targetName.split('|')[1] : null;
  if (!evidencePlanName && post.title?.includes('Cập nhật minh chứng chi tiêu:')) {
    evidencePlanName = post.title.replace('Cập nhật minh chứng chi tiêu: ', '').trim();
  }

  return (
    <article
      ref={cardRef}
      onClick={isFollowerLocked ? undefined : onOpen}
      data-post-id={String(post.id)}
      className={`relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300
        ${isEvidence 
          ? 'border-2 border-purple-200 dark:border-purple-800/50 shadow-sm hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:border-purple-300 hover:-translate-y-0.5' 
          : 'border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5'}
        ${isFollowerLocked ? "cursor-default" : ""}`}
    >
      {isEvidence && (
        <div className="absolute top-4 -right-1 z-10 pointer-events-none drop-shadow-md">
           <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[9px] font-extrabold uppercase tracking-widest py-1.5 pl-3 pr-3 rounded-l-full relative flex items-center gap-1.5">
             <BadgeCheck className="w-3.5 h-3.5" /> MINH CHỨNG
             <div className="absolute top-full right-0 w-0 h-0 border-t-[4px] border-t-purple-900 border-r-[4px] border-r-transparent"></div>
           </div>
        </div>
      )}
      <div className="flex items-start gap-3 p-4 pb-3 relative z-0">
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

        <div className="flex flex-col items-end gap-1 flex-shrink-0 max-w-[9rem] sm:max-w-none">
          {post.isPinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <Pin className="w-3 h-3 shrink-0" /> Đã ghim
            </span>
          )}
          <div className="flex flex-wrap justify-end gap-1">
            {post.status === "DRAFT" && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/35 text-amber-800 dark:text-amber-300 border border-amber-100/80 dark:border-amber-800/60"
                title="Bài chưa đăng công khai">
                Bản nháp
              </span>
            )}
            {post.visibility === "PRIVATE" && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 inline-flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700"
                title="Chỉ bạn xem được">
                <Lock className="w-3 h-3 shrink-0 opacity-70" />
                Riêng tư
              </span>
            )}
            {post.visibility === "FOLLOWERS" && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/60"
                title="Chỉ người theo dõi chiến dịch mới xem đầy đủ">
                <Lock className="w-3 h-3 shrink-0 opacity-70" />
                Chỉ follower
              </span>
            )}
            {post.isLocked && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1 border border-rose-100 dark:border-rose-900/50"
                title="Quản trị đã khóa tương tác với bài này">
                <Lock className="w-3 h-3 shrink-0" />
                Khóa tương tác
              </span>
            )}
          </div>
        </div>
      </div>

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
              {isEvidence ? (
                <>
                  <span className="text-purple-700 dark:text-purple-300 font-extrabold flex items-center gap-1">
                    Minh chứng cho
                  </span>
                  <span className="ml-[2px] font-bold text-purple-900 dark:text-purple-100">{evidencePlanName || `#${post.targetId}`}</span>
                </>
              ) : (
                post.targetName || `Đợt chi tiêu #${post.targetId}`
              )}
            </Link>
          ) : post.targetType === "CAMPAIGN" ? (
            <Link
              href={`/campaigns-details?id=${post.targetId}`}
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

      {post.title && (
        <div className="px-4 pb-2">
          <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white leading-snug line-clamp-2">
            {post.title}
          </h3>
        </div>
      )}

      {text && (
        <p className={`px-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed
          ${post.title ? "line-clamp-2 pb-2" : "line-clamp-3 pb-3"} ${isFollowerLocked ? "blur-[2px] select-none" : ""}`}>
          {text}
        </p>
      )}

      {imgs.length > 0 && (
        <div className={`w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mx-0
          ${imgs.length === 1 ? "aspect-[4/3]" : "aspect-video"}`}>
          {imgs.length === 1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgs[0].url}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: isFollowerLocked ? "blur(6px)" : "none" }}
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
                    style={{ filter: isFollowerLocked ? "blur(6px)" : "none" }}
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

      {isFollowerLocked && (
        <div className="px-4 pb-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Nội dung này dành cho người theo dõi campaign.</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Theo dõi để xem đầy đủ cập nhật mới nhất.</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFollowCampaign?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#ff5e14] text-white text-sm font-semibold hover:bg-[#e05312] transition-colors"
            >
              Theo dõi
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 mt-1 flex items-center gap-5 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleLike?.(post.id);
          }}
          disabled={isFollowerLocked}
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
