"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostList from "@/components/feed-post/FeedPostList";
import CreatePostTrigger from "@/components/feed-post/CreatePostTrigger";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import { PhotoGallery } from "@/components/ui/gallery";
import { mockFeedPosts } from "@/components/feed-post/mockData";
import type { FeedPost } from "@/types/feedPost";
import type { CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import { createPostFeOnly, updatePostFeOnly } from "@/lib/feedPostFeOnly";

const SESSION_KEY_CREATED = "feed-posts-mock-created";
const SESSION_KEY_UPDATES = "feed-post-mock-updates";

const FeedPostsPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>(mockFeedPosts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    // Load pending (newly created) posts
    const raw = sessionStorage.getItem(SESSION_KEY_CREATED);
    let newPosts = [...mockFeedPosts];

    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          newPosts = [...list, ...newPosts];
        }
      } catch { /* ignore */ }
    }

    // Apply updates from session
    const updatesRaw = sessionStorage.getItem(SESSION_KEY_UPDATES);
    if (updatesRaw) {
      try {
        const updates = JSON.parse(updatesRaw);
        newPosts = newPosts.map(p => updates[p.id] ? updates[p.id] : p);
      } catch { /* ignore */ }
    }

    setPosts(newPosts);
  }, []);

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleSubmit = async (data: CreateFeedPostRequest | UpdateFeedPostRequest) => {
    try {
      const res = await fetch("/api/feed-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create post");
    } catch {
      const mock = createPostFeOnly(
        {
          title: data.title,
          content: data.content,
          type: data.type || "POST",
          visibility: data.visibility || "PUBLIC",
          status: data.status || "PUBLISHED",
          budgetId: data.budgetId,
          attachments: data.attachments,
        },
        user
      );
      setPosts((p) => [mock, ...p]);
    }
    setIsFormOpen(false);
  };

  const handleUpdateSubmit = async (data: CreateFeedPostRequest | UpdateFeedPostRequest) => {
    if (!editingPost) return;
    const updated = updatePostFeOnly(editingPost, {
      title: data.title,
      content: data.content,
      type: data.type,
      visibility: data.visibility,
      status: data.status,
      budgetId: data.budgetId,
      attachments: data.attachments,
    });
    const updatesRaw = sessionStorage.getItem(SESSION_KEY_UPDATES);
    const updates = updatesRaw ? JSON.parse(updatesRaw) : {};
    updates[updated.id] = updated;
    sessionStorage.setItem(SESSION_KEY_UPDATES, JSON.stringify(updates));
    setPosts((p) => p.map((post) => (post.id === updated.id ? updated : post)));
    setEditingPost(null);
  };

  const handleEdit = (post: FeedPost) => {
    setEditingPost(post);
    setIsFormOpen(false);
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-dm-sans">

        {/* Dynamic Hero Section */}
        <div className="relative bg-white dark:bg-zinc-900 pb-20 pt-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 -left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
            <div className="absolute top-0 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
          </div>
          <div className="container relative z-10 px-4 mx-auto">
            <div className="max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              <PhotoGallery animationDelay={0.3} />
            </div>
          </div>
        </div>

        {/* Feed Section */}
        <div className="container relative z-10 px-4 mx-auto -mt-10 pb-20">
          <div className="max-w-[614px] mx-auto">

            {isAuthenticated && (
              <div className="mb-6">
                {editingPost ? (
                  <FeedPostForm
                    initialData={editingPost}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingPost(null)}
                    submitLabel="Save Changes"
                    isEdit={true}
                    showFullEditorLink={false}
                  />
                ) : isFormOpen ? (
                  <FeedPostForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    submitLabel="Publish"
                    isEdit={false}
                    showFullEditorLink
                  />
                ) : (
                  <CreatePostTrigger onClick={() => { setEditingPost(null); setIsFormOpen(true); }} />
                )}
              </div>
            )}

            <FeedPostList posts={posts} onPostClick={handlePostClick} onEdit={handleEdit} loading={false} />
          </div>
        </div>

      </div>
    </DanboxLayout>
  );
};

export default FeedPostsPage;
