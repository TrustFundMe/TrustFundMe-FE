"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TrustPaginationProps {
    currentPage: number; // 0-indexed
    totalPages: number;
    onPageChange: (page: number) => void;
    totalElements: number;
    pageSize: number;
    className?: string;
    forceShow?: boolean;
}

export const TrustPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalElements,
    pageSize,
    className = "",
    forceShow = false
}: TrustPaginationProps) => {
    if (totalPages <= 0 && !forceShow) return null;

    return (
        <div className={`flex justify-between items-center px-4 h-10 border-t border-gray-100 text-[10px] font-black text-gray-400 bg-white select-none ${className}`}>
            <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
                <span className="uppercase tracking-widest whitespace-nowrap opacity-60">
                    Hiển thị
                </span>
                <span className="text-gray-900 tabular-nums">
                    {Math.min(pageSize, totalElements - (currentPage * pageSize))} / {totalElements}
                </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                    <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                </button>

                <div className="min-w-[50px] h-7 px-2 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-1 group">
                    <span className="text-[11px] tabular-nums font-black">{currentPage + 1}</span>
                    <span className="opacity-40 font-bold">/</span>
                    <span className="text-[11px] tabular-nums font-black opacity-80">{totalPages}</span>
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </button>
            </div>
        </div>
    );
};
