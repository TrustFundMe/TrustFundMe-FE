"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ImageCarousel from "./ImageCarousel";
import type { FeedPost } from "@/types/feedPost";

interface ThreadCardProps {
    post: FeedPost;
    onClick?: () => void;
    onLike?: () => void;
}

export default function ThreadCard({ post, onClick, onLike }: ThreadCardProps) {
    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffMs = now.getTime() - postDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return postDate.toLocaleDateString();
    };

    const imageUrls = post.attachments?.map((att) => att.url) || [];

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
        >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                        {post.author.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatTimeAgo(post.createdAt)}
                    </p>
                </div>
                {post.isPinned && (
                    <div className="text-[#ff5e14] text-xs font-semibold px-2 py-1 bg-[#ff5e14]/10 rounded">
                        Pinned
                    </div>
                )}
            </div>

            {/* Image Carousel */}
            {imageUrls.length > 0 && (
                <div onClick={onClick} className="cursor-pointer">
                    <ImageCarousel images={imageUrls} alt={post.title || "Post image"} />
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLike?.();
                    }}
                    className="flex items-center gap-1.5 group"
                    aria-label="Like"
                >
                    <svg
                        className={`w-6 h-6 transition-colors ${post.liked
                                ? "fill-[#ff5e14] text-[#ff5e14]"
                                : "text-zinc-700 dark:text-zinc-300 group-hover:text-[#ff5e14]"
                            }`}
                        fill={post.liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>

                <button
                    onClick={onClick}
                    className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] transition-colors group"
                    aria-label="Comment"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </button>

                <button
                    className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-[#ff5e14] transition-colors"
                    aria-label="Share"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                    {post.likeCount.toLocaleString()} likes
                </p>
                <p className="text-sm text-zinc-900 dark:text-white mb-1">
                    <span className="font-semibold mr-2">{post.author.name}</span>
                    <span
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </p>
                {post.replyCount > 0 && (
                    <button
                        onClick={onClick}
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                        View all {post.replyCount} comments
                    </button>
                )}
            </div>
        </motion.article>
    );
}
