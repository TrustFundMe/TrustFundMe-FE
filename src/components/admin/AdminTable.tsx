import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminTableProps {
    title?: ReactNode;
    headerContent: ReactNode;
    tableHeader: ReactNode;
    children: ReactNode;
    footerContent?: ReactNode;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
}

export default function AdminTable({
    title,
    headerContent,
    tableHeader,
    children,
    footerContent,
    isLoading,
    isEmpty,
    emptyMessage = "Không tìm thấy dữ liệu.",
    emptyIcon
}: AdminTableProps) {
    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            {title && (
                <div className="flex-shrink-0">
                    {title}
                </div>
            )}

            {/* Filter/Header Bar */}
            <div className="flex-shrink-0">
                {headerContent}
            </div>

            {/* Main Table Container */}
            <div className="flex flex-col rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative flex-1 min-h-0 overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[32px]">
                        <Loader2 className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Scrollable Area */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="min-w-full text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10">
                            <tr className="text-left bg-slate-50">
                                {tableHeader}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {children}

                            {!isLoading && isEmpty && (
                                <tr>
                                    <td colSpan={20} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                {emptyIcon || <span className="text-2xl">?</span>}
                                            </div>
                                            <p className="font-bold text-slate-500">{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Area */}
                {footerContent && (
                    <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 py-3">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
}
