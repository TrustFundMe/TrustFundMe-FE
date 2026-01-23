"use client";

import FeedPostCard from "./FeedPostCard";
import type { FeedPost } from "@/types/feedPost";

interface FeedPostListProps {
  posts: FeedPost[];
  onPostClick?: (postId: string) => void;
  loading?: boolean;
}

export default function FeedPostList({
  posts,
  onPostClick,
  loading = false,
}: FeedPostListProps) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 16 }}>
            No posts yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        minHeight: "100vh",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 614,
          padding: "0 20px",
        }}
      >
        {posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            onOpen={onPostClick}
          />
        ))}
      </div>
    </div>
  );
}
