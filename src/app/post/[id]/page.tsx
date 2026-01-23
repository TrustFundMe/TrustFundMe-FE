"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostDetail from "@/components/feed-post/FeedPostDetail";
import RelatedPosts from "@/components/feed-post/RelatedPosts";
import CampaignCard from "@/components/feed-post/CampaignCard";
import { mockFeedPosts } from "@/components/feed-post/mockData";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";

const FeedPostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const postId = params?.id as string;

  const post = useMemo(() => {
    return mockFeedPosts.find((p) => p.id === postId) as FeedPost & { campaign?: any } | undefined;
  }, [postId]);

  const canEdit = isAuthenticated && user && post && user.id === Number(post.author.id);

  const handleToggleLike = () => {
    // Mock like toggle - in real app this would update state
  };

  const handleToggleFlag = () => {
    // Mock flag toggle
  };

  const handleEdit = () => {
    router.push(`/post/${postId}/edit`);
  };

  const handleDelete = () => {
    if (!post || !confirm("Are you sure you want to delete this post?")) {
      return;
    }
    router.push("/post");
  };

  if (!post) {
    return (
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Post not found</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={2} footer={2}>
      <section
        style={{
          padding: "40px 0",
          background: "#fafafa",
          minHeight: "100vh",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              gap: 32,
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {/* Main Content */}
            <div style={{ minWidth: 0 }}>
              <FeedPostDetail
                post={post}
                onToggleLike={handleToggleLike}
                onToggleFlag={handleToggleFlag}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
              />
            </div>

            {/* Sidebar */}
            <aside
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {/* Campaign Card */}
              {post.campaign && (
                <CampaignCard campaign={post.campaign} compact={false} />
              )}

              {/* Related Posts */}
              <RelatedPosts posts={mockFeedPosts} currentPostId={postId} />
            </aside>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 991px) {
            section :global(.container) > div {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
          }
        `}</style>
      </section>
    </DanboxLayout>
  );
};

export default FeedPostDetailPage;
