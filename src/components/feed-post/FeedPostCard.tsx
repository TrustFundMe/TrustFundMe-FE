"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import CampaignCard, { type CampaignInfo } from "./CampaignCard";
import { likeService } from "@/services/likeService";
import { commentService } from "@/services/commentService";

interface FeedPostCardProps {
  post: FeedPost;
  onOpen?: (postId: string) => void;
  onEdit?: (post: FeedPost) => void;
  onDelete?: (postId: string) => void;
}

export default function FeedPostCard({
  post,
  onOpen,
  onEdit,
  onDelete,
}: FeedPostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.replyCount);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const isAuthor = user?.id && String(user.id) === String(post.author.id);

  const imageAttachments = (post.attachments || []).filter((a) => a.type === "image");
  const seenUrls = new Set<string>();
  const images = imageAttachments.filter((a) => {
    if (seenUrls.has(a.url)) return false;
    seenUrls.add(a.url);
    return true;
  });
  const hasMedia = images.length > 0;
  const campaign = (post as any).campaign as CampaignInfo | undefined;
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content || "");

  const handleClick = () => {
    if (onOpen) {
      onOpen(post.id);
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const res = await likeService.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      // Rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    commentInputRef.current?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim() || isSubmittingComment) return;
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmittingComment(true);
    const content = commentText.trim();
    setCommentText("");
    try {
      await commentService.createComment(post.id, content);
      setLocalCommentCount((c) => c + 1);
    } catch {
      setCommentText(content);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return postDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        marginBottom: 24,
        overflow: "hidden",
        maxWidth: 614,
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(26, 104, 91, 0.1)",
                flex: "0 0 auto",
              }}
            >
              <Image
                src={post.author.avatar || "/assets/img/defaul.jpg"}
                alt={post.author.name}
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.2,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {post.author.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.6)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
          </div>
          {isAuthor && (
            <div className="relative">
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 8,
                  color: "rgba(0,0,0,0.6)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-100 dark:border-zinc-700 py-1 z-10 w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        if (onEdit) onEdit(post);
                        else router.push(`/post/${post.id}/edit`);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        if (onDelete) onDelete(post.id);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                    >
                      Xóa
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </fieldset>

      {/* Media */}
      {hasMedia && (
        <fieldset
          style={{
            margin: 0,
            padding: 0,
            border: "none",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className="post-card-image-swiper"
            style={{
              width: "100%",
              aspectRatio: "3/4",
              maxHeight: 400,
              background: "#000",
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            {images.slice(0, 9).map((att, i) => (
              <SwiperSlide key={`${att.url}-${i}`}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    background: "#000",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={post.title || `Image ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </fieldset>
      )}

      {/* Content */}
      <fieldset
        style={{
          margin: 0,
          padding: "16px",
          border: "none",
          borderBottom: campaign ? "1px solid rgba(0,0,0,0.08)" : "none",
          background: "#ffffff",
        }}
      >
        {post.title && (
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "#1a1a1a",
              marginBottom: 12,
              marginTop: 0,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {post.title}
          </h3>
        )}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#1a1a1a",
            whiteSpace: isHtml ? "normal" : "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "var(--font-dm-sans)",
          }}
          {...(isHtml
            ? { dangerouslySetInnerHTML: { __html: post.content || "" } }
            : { children: post.content })}
        />
      </fieldset>

      {/* Campaign */}
      {campaign && (
        <fieldset
          style={{
            margin: 0,
            padding: "16px",
            border: "none",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            background: "#ffffff",
          }}
        >
          <CampaignCard campaign={campaign} compact={true} />
        </fieldset>
      )}

      {/* Actions */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px 8px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Like Button with animation */}
          <motion.button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            whileTap={{ scale: 0.85 }}
            animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              border: "none",
              background: "transparent",
              cursor: isLiking ? "default" : "pointer",
              padding: 0,
              color: liked ? "#F84D43" : "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Heart
              className="w-6 h-6"
              style={{
                fill: liked ? "#F84D43" : "none",
                transition: "fill 0.2s, color 0.2s",
              }}
            />
          </motion.button>

          {/* Comment Button */}
          <motion.button
            type="button"
            onClick={handleCommentFocus}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: "rgba(0,0,0,0.6)",
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>

          {/* Share Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: "rgba(0,0,0,0.6)",
            }}
          >
            <Send className="w-6 h-6" />
          </motion.button>

          <div style={{ marginLeft: "auto" }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                color: "rgba(0,0,0,0.6)",
              }}
            >
              <Bookmark className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </fieldset>

      {/* Engagement */}
      <fieldset
        style={{
          margin: 0,
          padding: "0 16px 12px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <AnimatePresence mode="wait">
          {likeCount > 0 && (
            <motion.div
              key={likeCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#1a1a1a",
                marginBottom: 8,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {likeCount.toLocaleString()} lượt thích
            </motion.div>
          )}
        </AnimatePresence>

        {localCommentCount > 0 && (
          <button
            type="button"
            onClick={handleClick}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
              color: "rgba(0,0,0,0.6)",
              marginTop: 4,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Xem tất cả {localCommentCount} bình luận
          </button>
        )}

        <div
          style={{
            fontSize: 12,
            color: "rgba(0,0,0,0.5)",
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {formatTimeAgo(post.createdAt)}
        </div>
      </fieldset>

      {/* Comment Input */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px",
          border: "none",
          background: "#fafafa",
        }}
      >
        <form
          onSubmit={handleSubmitComment}
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <input
            ref={commentInputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment(e);
              }
            }}
            placeholder="Thêm bình luận..."
            disabled={isSubmittingComment}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              background: "transparent",
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
            }}
          />
          <motion.button
            type="submit"
            disabled={!commentText.trim() || isSubmittingComment}
            whileTap={{ scale: 0.95 }}
            style={{
              border: "none",
              background: "transparent",
              cursor: commentText.trim() && !isSubmittingComment ? "pointer" : "default",
              padding: 0,
              fontSize: 14,
              color: "#1A685B",
              fontWeight: 600,
              opacity: commentText.trim() && !isSubmittingComment ? 1 : 0.4,
              transition: "opacity 0.2s",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {isSubmittingComment ? "Đang gửi..." : "Đăng"}
          </motion.button>
        </form>
      </fieldset>
    </article>
  );
}
