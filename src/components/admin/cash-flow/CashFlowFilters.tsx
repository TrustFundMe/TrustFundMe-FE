'use client';

import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface FilterCounts {
    type: { ALL: number; DONATION: number; WITHDRAWAL: number };
    fundType: { ALL: number; AUTHORIZED: number; ITEMIZED: number };
    status: { ALL: number; COMPLETED: number; PENDING: number; FLAGGED: number };
}

interface CashFlowFiltersProps {
    filters: {
        type: string;
        fundType: string;
        status: string;
        dateRange: string;
    };
    onFilterChange: (key: string, value: string) => void;
    filterCounts: FilterCounts;
}

export const CashFlowFilters = ({ filters, onFilterChange, filterCounts }: CashFlowFiltersProps) => {
    return (
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100">
            {/* Row 1: Title */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Dòng tiền hệ thống</h3>
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-100">
                        1.242 giao dịch
                    </span>
                </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-5 gap-2">
                {/* Search */}
                <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Tìm mã GD, đối tác..."
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
                        <option value="ALL">Tất cả ({filterCounts.type.ALL})</option>
                        <option value="DONATION">Donation ({filterCounts.type.DONATION})</option>
                        <option value="WITHDRAWAL">Withdrawal ({filterCounts.type.WITHDRAWAL})</option>
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
                        <option value="ALL">Tất cả ({filterCounts.fundType.ALL})</option>
                        <option value="AUTHORIZED">Quỹ ủy quyền ({filterCounts.fundType.AUTHORIZED})</option>
                        <option value="ITEMIZED">Quỹ vật phẩm ({filterCounts.fundType.ITEMIZED})</option>
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
                        <option value="ALL">Tất cả ({filterCounts.status.ALL})</option>
                        <option value="COMPLETED">Thành công ({filterCounts.status.COMPLETED})</option>
                        <option value="PENDING">Chờ duyệt ({filterCounts.status.PENDING})</option>
                        <option value="FLAGGED">Nghi vấn ({filterCounts.status.FLAGGED})</option>
                    </select>
                    <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Range */}
                <div className="relative">
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer">
                        <span className="text-gray-400">Khoảng ngày</span>
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};
