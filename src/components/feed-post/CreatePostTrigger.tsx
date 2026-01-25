"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Video, Smile } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreatePostTriggerProps {
  onClick?: () => void;
}

export default function CreatePostTrigger({ onClick }: CreatePostTriggerProps) {
  const router = useRouter();
  const handleClick = () => (onClick ? onClick() : router.push("/post/create"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[614px] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 mb-6"
    >
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 overflow-hidden">
          <img
            src="/assets/img/about/01.jpg"
            alt="User"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=User&background=random";
            }}
          />
        </div>
        <div
          onClick={handleClick}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2.5 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center"
        >
          <span className="text-zinc-500 font-medium">What&apos;s on your mind?</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 px-2">
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Photo/Video</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="hidden sm:flex items-center gap-2 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors"
        >
          <Video className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Live Video</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors"
        >
          <Smile className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Feeling/Activity</span>
        </button>
      </div>
    </motion.div>
  );
}
