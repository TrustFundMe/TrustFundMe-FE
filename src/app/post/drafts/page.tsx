"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DanboxLayout from "@/layout/DanboxLayout";
import { feedPostService } from "@/services/feedPostService";
import { dtoToFeedPost } from "@/lib/feedPostUtils";
import type { FeedPost } from "@/types/feedPost";

export default function DraftFeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await feedPostService.getMyPage({ status: "DRAFT", page: 0, size: 50 });
        const safeContent = Array.isArray(page?.content) ? page.content : [];
        setPosts(safeContent.map(dtoToFeedPost));
      } catch {
        setPosts([]);
        setError("Khong tai duoc danh sach draft. Vui long thu lai.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DanboxLayout header={4} footer={0}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-24">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Feed draft cua toi</h1>
            <Link href="/post/my" className="text-sm font-semibold text-[#ff5e14] hover:underline">
              Tat ca bai cua toi
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-zinc-500">Dang tai...</p>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm text-zinc-700"
              >
                Tai lai
              </button>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-zinc-500">Khong co bai draft.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}/edit`}
                  className="block rounded-xl border border-amber-200 bg-amber-50 p-4 hover:border-amber-300 dark:border-amber-900 dark:bg-amber-950/20"
                >
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">DRAFT</p>
                  <h2 className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">{post.title || "(Khong tieu de)"}</h2>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DanboxLayout>
  );
}
