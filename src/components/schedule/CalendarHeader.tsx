'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface CalendarHeaderProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    view: 'Month' | 'Week' | 'Day';
    setView: (v: 'Month' | 'Week' | 'Day') => void;
}

const VIEW_LABELS: Record<string, string> = {
    Month: 'Tháng',
    Week: 'Tuần',
    Day: 'Ngày',
};

export const CalendarHeader = ({
    currentDate,
    onDateChange,
    view,
    setView,
}: CalendarHeaderProps) => {
    const goToPrev = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - 1);
        onDateChange(d);
    };
    const goToNext = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        onDateChange(d);
    };

    const monthLabel = currentDate.toLocaleString('vi-VN', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className="flex items-center justify-between gap-4 mb-5 px-1 shrink-0">
            {/* Left: View Toggle */}
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-2xl p-1 gap-0.5">
                {(['Month', 'Week', 'Day'] as const).map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${view === v
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {VIEW_LABELS[v]}
                    </button>
                ))}
            </div>

            {/* Center: Month Navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={goToPrev}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-gray-700 capitalize min-w-[160px] text-center">
                    {monthLabel} {year}
                </span>
                <button
                    onClick={goToNext}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Right: Close */}
            <div className="flex justify-end">
                <Link
                    href="/account/profile"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                    <X className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};
