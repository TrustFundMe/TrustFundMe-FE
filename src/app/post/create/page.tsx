"use client";

import { useRouter } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import type { CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";
import { feedPostService } from "@/services/feedPostService";

const CreateFeedPostPage = () => {
  const router = useRouter();

  const handleSubmit = async (data: CreateFeedPostRequest | UpdateFeedPostRequest) => {
    try {
      await feedPostService.create(data);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Đăng bài thất bại.";
      alert(msg);
      return;
    }
    router.push("/post");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DanboxLayout header={4} footer={2}>
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
