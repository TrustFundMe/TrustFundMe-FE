"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ForumCategory } from "@/types/forumCategory";

interface ForumSidebarProps {
    categories: ForumCategory[];
    activeSlug?: string;
    onCategoryClick?: (slug: string) => void;
}

export default function ForumSidebar({ categories, activeSlug, onCategoryClick }: ForumSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            <div className="sticky top-0 max-h-screen flex flex-col p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    {!isCollapsed && (
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Forum</h2>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <svg
                            className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                            />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                {!isCollapsed && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#ff5e14]/30 outline-none"
                        />
                    </div>
                )}

                {/* Categories */}
                <nav className="flex-1 overflow-y-auto space-y-1">
                    {filteredCategories.map((category) => {
                        const isActive = category.slug === activeSlug;
                        return (
                            <Link
                                key={category.id}
                                href={`/post?category=${category.slug}`}
                                onClick={(e) => {
                                    if (onCategoryClick) {
                                        e.preventDefault();
                                        onCategoryClick(category.slug);
                                    }
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                    ? "bg-[#ff5e14]/10 text-[#ff5e14] border-l-4 border-[#ff5e14]"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    }`}
                            >
                                {/* Category Color Indicator */}
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: category.color }}
                                />

                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 font-medium text-sm truncate">{category.name}</span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {category.postCount}
                                        </span>
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Create Thread Button */}
                {!isCollapsed && (
                    <Link
                        href="/post/create"
                        className="mt-4 w-full bg-[#ff5e14] hover:bg-[#e5540f] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Thread</span>
                    </Link>
                )}
            </div>
        </motion.aside>
    );
}
