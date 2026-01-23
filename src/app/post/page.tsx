"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostList from "@/components/feed-post/FeedPostList";
import { PhotoGallery } from "@/components/ui/gallery";
import { mockFeedPosts } from "@/components/feed-post/mockData";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";

const FeedPostsPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [posts] = useState<FeedPost[]>(mockFeedPosts);

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    router.push("/post/create");
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <div
        className="font-dm-sans"
        style={{
          background: "#fafafa",
          minHeight: "100vh",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        {/* PhotoGallery Hero Section */}
        <div
          style={{
            background: "#ffffff",
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <PhotoGallery animationDelay={0.3} />
        </div>

        <FeedPostList posts={posts} onPostClick={handlePostClick} loading={false} />
      </div>
    </DanboxLayout>
  );
};

export default FeedPostsPage;
