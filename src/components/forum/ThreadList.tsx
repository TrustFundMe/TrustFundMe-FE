"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ThreadCard from "./ThreadCard";
import type { FeedPost } from "@/types/feedPost";

interface ThreadListProps {
    posts: FeedPost[];
    onPostClick?: (postId: string) => void;
    onLike?: (postId: string) => void;
    loading?: boolean;
}

export default function ThreadList({ posts, onPostClick, onLike, loading }: ThreadListProps) {
    const [sortBy, setSortBy] = useState<"latest" | "popular" | "trending">("latest");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-[#ff5e14] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-500 dark:text-zinc-400">No posts yet. Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sort Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Threads</h2>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#ff5e14]/30 outline-none"
                >
                    <option value="latest">Latest</option>
                    <option value="popular">Popular</option>
                    <option value="trending">Trending</option>
                </select>
            </div>

            {/* Thread Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ThreadCard
                            post={post}
                            onClick={() => onPostClick?.(post.id)}
                            onLike={() => onLike?.(post.id)}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
