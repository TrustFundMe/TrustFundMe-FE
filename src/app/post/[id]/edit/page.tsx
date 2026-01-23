"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import FeedPostForm from "@/components/feed-post/FeedPostForm";
import { feedPostService } from "@/services/feedPostService";
import type { FeedPostDto, FeedPost, UpdateFeedPostRequest } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import PageBanner from "@/components/PageBanner";

const mapFeedPostDtoToUi = (dto: FeedPostDto): FeedPost => {
  return {
    id: String(dto.id),
    author: {
      id: String(dto.authorId),
      name: `User #${dto.authorId}`,
      avatar: "/assets/img/about/01.jpg",
    },
    title: dto.title,
    content: dto.content,
    type: dto.type,
    visibility: dto.visibility,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    attachments: [],
    liked: false,
    likeCount: 0,
    flagged: false,
    comments: [],
    budgetId: dto.budgetId,
  };
};

const EditFeedPostPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const postId = params?.id as string;

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/sign-in?redirect=/post/${postId}/edit`);
      return;
    }

    let mounted = true;

    const loadPost = async () => {
      if (!postId || isNaN(Number(postId))) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const dto = await feedPostService.getById(Number(postId));
        if (!mounted) return;

        const uiPost = mapFeedPostDtoToUi(dto);

        // Check if user is the author
        if (user && user.id !== Number(uiPost.author.id)) {
          setError("You don't have permission to edit this post");
          setLoading(false);
          return;
        }

        setPost(uiPost);
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load post");
        console.error("Error loading post:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      loadPost();
    }

    return () => {
      mounted = false;
    };
  }, [postId, isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (data: UpdateFeedPostRequest) => {
    try {
      await feedPostService.update(Number(postId), data);
      router.push(`/post/${postId}`);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/post/${postId}`);
  };

  if (authLoading || loading) {
    return (
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </DanboxLayout>
    );
  }

  if (error || !post) {
    return (
      <DanboxLayout header={2} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error || "Post not found"}</div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={2} footer={2}>
      <PageBanner pageName="Edit Post" />
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <FeedPostForm
              initialData={post}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Update Post"
              isEdit={true}
            />
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default EditFeedPostPage;
