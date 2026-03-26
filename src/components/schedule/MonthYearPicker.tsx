'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthYearPickerProps {
    currentDate: Date;
    onChange: (date: Date) => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthYearPicker = ({ currentDate, onChange }: MonthYearPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewYear, setViewYear] = useState(currentDate.getFullYear());

    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(viewYear, monthIndex, 1);
        onChange(newDate);
        setIsOpen(false);
    };

    const handlePrevYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        const now = new Date();
        if (viewYear > now.getFullYear() - 10) {
            setViewYear(viewYear - 1);
        }
    };

    const handleNextYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        const now = new Date();
        if (viewYear < now.getFullYear() + 10) {
            setViewYear(viewYear + 1);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100/50 transition-all text-gray-800"
            >
                <span className="text-sm font-black tracking-tight">
                    {MONTHS[currentMonth]} {currentDate.getFullYear()}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in duration-200">
                    {/* Year Selector */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevYear}
                            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#f74938] transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-black text-gray-800">{viewYear}</span>
                        <button
                            onClick={handleNextYear}
                            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#f74938] transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => handleMonthSelect(index)}
                                className={`py-2 text-[10px] font-bold rounded-xl transition-all ${index === currentMonth && viewYear === currentDate.getFullYear()
                                        ? 'bg-[#f74938] text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                            >
                                {month.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
