"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import { mockFeedPosts } from "@/components/feed-post/mockData";
import type { FeedPost, UpdateFeedPostRequest, CreateFeedPostRequest } from "@/types/feedPost";
import PageBanner from "@/components/PageBanner";
import { useAuth } from "@/contexts/AuthContextProxy";
import { updatePostFeOnly } from "@/lib/feedPostFeOnly";

const SESSION_KEY_CREATED = "feed-posts-mock-created";
const SESSION_KEY_UPDATES = "feed-post-mock-updates";

const EditFeedPostPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FE-Only Mode: Mock fetching
    const foundPost = mockFeedPosts.find((p) => p.id === postId);

    // Check if we have local updates for this post
    const updatesRaw = sessionStorage.getItem(SESSION_KEY_UPDATES);
    let updatedPost = foundPost;

    if (updatesRaw) {
      try {
        const updates = JSON.parse(updatesRaw);
        if (updates[postId]) {
          updatedPost = updates[postId];
        }
      } catch (e) { console.error(e); }
    }

    // Also check pending created posts not yet in mockData
    if (!foundPost) {
      const createdRaw = sessionStorage.getItem(SESSION_KEY_CREATED);
      if (createdRaw) {
        try {
          const createdList = JSON.parse(createdRaw);
          if (Array.isArray(createdList)) {
            const match = createdList.find((p: any) => p.id === postId);
            if (match) updatedPost = match;
          }
        } catch { /* ignore */ }
      }
    }

    // Simulate delay
    const timer = setTimeout(() => {
      setPost(updatedPost || null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [postId]);

  const handleSubmit = async (data: CreateFeedPostRequest | UpdateFeedPostRequest) => {
    if (!post) return;

    // FE-Only Mode: Mock Update
    try {
      const updated = updatePostFeOnly(post, {
        title: data.title,
        content: data.content,
        type: data.type,
        visibility: data.visibility,
        status: data.status,
        budgetId: data.budgetId,
        attachments: data.attachments,
      });

      // Update in local state
      setPost(updated);

      // Save to SessionStorage so list page can see it
      const updatesRaw = sessionStorage.getItem(SESSION_KEY_UPDATES);
      const updates = updatesRaw ? JSON.parse(updatesRaw) : {};
      updates[updated.id] = updated;
      sessionStorage.setItem(SESSION_KEY_UPDATES, JSON.stringify(updates));

      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));

      router.push("/post");
    } catch (e) {
      console.error("Mock update failed", e);
      alert("Failed to update post");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <DanboxLayout header={2} footer={2}>
        <PageBanner pageName="Edit Post" />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-zinc-500">Loading post...</div>
        </div>
      </DanboxLayout>
    );
  }

  if (!post) {
    return (
      <DanboxLayout header={2} footer={2}>
        <PageBanner pageName="Edit Post" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Post not found</div>
          <div className="text-center mt-4">
            <button onClick={() => router.back()} className="text-primary hover:underline">
              Go Back
            </button>
          </div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={2} footer={2}>
      <PageBanner pageName="Edit Post" />

      <div className="bg-zinc-50 dark:bg-black min-h-screen py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                Edit Post
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Update your post content.
              </p>
            </div>

            <FeedPostForm
              initialData={post}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Save Changes"
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </DanboxLayout>
  );
};

export default EditFeedPostPage;
