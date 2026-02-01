"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ForumLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
    header?: ReactNode;
}

export default function ForumLayout({ children, sidebar, header }: ForumLayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            {/* Header */}
            {header && <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">{header}</div>}

            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block sticky top-0 h-screen">
                    {sidebar}
                </div>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="container mx-auto px-4 py-8 max-w-5xl"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay - TODO: implement mobile menu */}
        </div>
    );
}
