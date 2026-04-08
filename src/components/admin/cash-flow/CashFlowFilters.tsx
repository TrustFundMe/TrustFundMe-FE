'use client';

import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface FilterCounts {
    type: {
        ALL: number;
        DONATION: number;
        WITHDRAWAL: number;
        REFUND: number;
    };
    fundType: { ALL: number; AUTHORIZED: number; ITEMIZED: number };
    status: { ALL: number; PAID: number; DISBURSED: number };
}

interface FilterLabels {
    type: {
        ALL: string;
        DONATION: string;
        WITHDRAWAL: string;
        REFUND: string;
    };
    fundType: { ALL: string; AUTHORIZED: string; ITEMIZED: string };
    status: { ALL: string; PAID: string; DISBURSED: string };
}

interface CashFlowFiltersProps {
    filters: {
        search: string;
        type: string;
        fundType: string;
        status: string;
        startDate: string;
        endDate: string;
        minPrice: string;
        maxPrice: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    onRefresh: () => void;
    filterCounts: FilterCounts;
    filterLabels: FilterLabels;
}

export const CashFlowFilters = ({ filters, onFilterChange, onClearFilters, onRefresh, filterCounts, filterLabels }: CashFlowFiltersProps) => {
    return (
        <div className="bg-white p-2 rounded-[16px] shadow-sm border border-gray-100">
            {/* Row 1: Title */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Dòng tiền hệ thống</h3>
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-100">
                        {filterCounts.type.ALL} giao dịch
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClearFilters}
                        className="text-[10px] font-black text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors border border-gray-100"
                    >
                        Xóa bộ lọc
                    </button>
                    <button
                        onClick={onRefresh}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors border border-indigo-100"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-8 gap-2">
                {/* Search */}
                <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Tìm mã GD, đối tác..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold w-full outline-none"
                    />
                </div>

                {/* Type Filter */}
                <div className="relative">
                    <select
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-8"
                    >
                        <option value="ALL">{filterLabels.type.ALL}</option>
                        <option value="DONATION">{filterLabels.type.DONATION} ({filterCounts.type.DONATION})</option>
                        <option value="WITHDRAWAL">{filterLabels.type.WITHDRAWAL} ({filterCounts.type.WITHDRAWAL})</option>
                        <option value="REFUND">{filterLabels.type.REFUND} ({filterCounts.type.REFUND})</option>
                    </select>
                    <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Fund Type Filter */}
                <div className="relative">
                    <select
                        value={filters.fundType}
                        onChange={(e) => onFilterChange('fundType', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-8"
                    >
                        <option value="ALL">{filterLabels.fundType.ALL}</option>
                        <option value="AUTHORIZED">{filterLabels.fundType.AUTHORIZED} ({filterCounts.fundType.AUTHORIZED})</option>
                        <option value="ITEMIZED">{filterLabels.fundType.ITEMIZED} ({filterCounts.fundType.ITEMIZED})</option>
                    </select>
                    <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-8"
                    >
                        <option value="ALL">{filterLabels.status.ALL}</option>
                        <option value="PAID">{filterLabels.status.PAID} ({filterCounts.status.PAID})</option>
                        <option value="DISBURSED">{filterLabels.status.DISBURSED} ({filterCounts.status.DISBURSED})</option>
                    </select>
                    <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Filters */}
                <div className="relative">
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFilterChange('startDate', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-gray-600"
                        title="Từ ngày"
                    />
                </div>
                <div className="relative">
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFilterChange('endDate', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-gray-600"
                        title="Đến ngày"
                    />
                </div>

                {/* Price Filters */}
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Giá từ..."
                        value={filters.minPrice}
                        onChange={(e) => onFilterChange('minPrice', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none"
                    />
                </div>
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Giá đến..."
                        value={filters.maxPrice}
                        onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none"
                    />
                </div>
            </div>
        </div>
    );
};
