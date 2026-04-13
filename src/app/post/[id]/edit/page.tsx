"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DanboxLayout from "@/layout/DanboxLayout";
import CreateOrEditPostModal from "@/components/feed-post/CreateOrEditPostModal";
import { feedPostService } from "@/services/feedPostService";
import { campaignService } from "@/services/campaignService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";

const EditFeedPostPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [campaignsList, setCampaignsList] = useState<{ id: number; title: string }[]>([]);
  const [campaignTitlesMap, setCampaignTitlesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    const id = Number(postId);
    if (!postId || Number.isNaN(id)) {
      setPost(null);
      setError("ID bài viết không hợp lệ.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dto = await feedPostService.getById(id);
      setPost(dtoToFeedPost(dto));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setError("Không tìm thấy bài viết.");
      else if (status === 403) setError("Bạn không có quyền chỉnh sửa bài viết này.");
      else setError("Không tải được bài viết để chỉnh sửa.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCampaignsList([]);
      setCampaignTitlesMap({});
      return;
    }
    campaignService
      .getByFundOwner(Number(user.id))
      .then((mine) => setCampaignsList(mine.map((c) => ({ id: c.id, title: c.title ?? "" }))))
      .catch(() => setCampaignsList([]));

    campaignService
      .getAll(0, 100)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.content ?? []);
        const map: Record<string, string> = {};
        list.forEach((c: { id: number; title?: string }) => {
          map[String(c.id)] = c.title ?? "";
        });
        setCampaignTitlesMap(map);
      })
      .catch(() => setCampaignTitlesMap({}));
  }, [isAuthenticated, user?.id]);

  if (loading) {
    return (
      <DanboxLayout header={4} footer={2}>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-zinc-500">Đang tải bài viết...</div>
        </div>
      </DanboxLayout>
    );
  }

  if (!post) {
    return (
      <DanboxLayout header={4} footer={2}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error ?? "Không tìm thấy bài viết."}</div>
          <div className="text-center mt-4">
            <button onClick={() => router.back()} className="text-primary hover:underline">
              Quay lại
            </button>
          </div>
        </div>
      </DanboxLayout>
    );
  }

  return (
    <DanboxLayout header={4} footer={2}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <CreateOrEditPostModal
          isOpen={true}
          onClose={() => router.push("/post/drafts")}
          campaignsList={campaignsList}
          campaignTitlesMap={campaignTitlesMap}
          initialData={post}
          onPostUpdated={() => router.push("/post/drafts")}
        />
      </div>
    </DanboxLayout>
  );
};

export default EditFeedPostPage;
