"use client";

import { useRouter } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import type { CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import { createPostFeOnly } from "@/lib/feedPostFeOnly";

const SESSION_KEY_CREATED = "feed-posts-mock-created";

const CreateFeedPostPage = () => {
  const router = useRouter();
  const { user } = useAuth();

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
          content: data.content || "",
          type: data.type || "POST",
          visibility: data.visibility || "PUBLIC",
          status: data.status,
          budgetId: data.budgetId,
          attachments: data.attachments,
        },
        user
      );

      const existingRaw = sessionStorage.getItem(SESSION_KEY_CREATED);
      let existing: any[] = [];
      try {
        existing = existingRaw ? JSON.parse(existingRaw) : [];
        if (!Array.isArray(existing)) existing = [];
      } catch (e) { existing = []; }

      sessionStorage.setItem(SESSION_KEY_CREATED, JSON.stringify([mock, ...existing]));
    }
    router.push("/post");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <div className="bg-zinc-50 dark:bg-black min-h-screen py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                Share your journey
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Update your supporters, share news, or announce something big.
              </p>
            </div>

            <FeedPostForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Publish Post"
              isEdit={false}
            />
          </div>
        </div>
      </div>
    </DanboxLayout>
  );
};

export default CreateFeedPostPage;
