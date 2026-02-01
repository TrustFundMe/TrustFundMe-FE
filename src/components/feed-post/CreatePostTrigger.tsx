"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContextProxy";

interface CreatePostTriggerProps {
  onClick?: () => void;
}

function getAvatarSrc(avatarUrl: string | undefined, fullName?: string | null): string {
  if (avatarUrl) return avatarUrl;
  const name = fullName?.trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
}

export default function CreatePostTrigger({ onClick }: CreatePostTriggerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const handleClick = () => (onClick ? onClick() : router.push("/post/create"));
  const avatarSrc = getAvatarSrc(user?.avatarUrl, user?.fullName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4"
    >
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
          <img
            src={avatarSrc}
            alt={user?.fullName ?? "User"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.src = getAvatarSrc(undefined, user?.fullName);
            }}
          />
        </div>
        <div
          onClick={handleClick}
          className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full px-4 py-2.5 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center"
        >
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Bạn đang nghĩ gì? Bắt đầu thảo luận mới...</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5 text-[#ff5e14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Thêm Ảnh</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5 text-[#ff5e14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>Thẻ tag</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5 text-[#ff5e14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Liên kết</span>
        </button>
      </div>
    </motion.div>
  );
}
