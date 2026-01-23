"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import { feedPostService } from "@/services/feedPostService";
import type { CreateFeedPostRequest } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import PageBanner from "@/components/PageBanner";

const CreateFeedPostPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-in?redirect=/post/create");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (data: CreateFeedPostRequest) => {
    try {
      await feedPostService.create(data);
      router.push("/post");
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/post");
  };

  if (authLoading) {
    return (
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </DanboxLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DanboxLayout header={2} footer={2}>
      <PageBanner pageName="Create Post" />
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <FeedPostForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Create Post"
              isEdit={false}
            />
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default CreateFeedPostPage;
