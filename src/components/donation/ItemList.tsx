import { ExpenditureItem } from './types';
import ItemRow from './ItemRow';

type ItemListProps = {
    visibleItems: ExpenditureItem[];
    selectedItems: Record<string, number>;
    page: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemSelect: (itemId: string) => void;
    onQuantityChange: (itemId: string, diff: number) => void;
    amount: number;
};

export default function ItemList({
    visibleItems,
    selectedItems,
    page,
    itemsPerPage,
    onPageChange,
    onItemSelect,
    onQuantityChange,
    amount
}: ItemListProps) {
    const totalPages = Math.ceil(visibleItems.length / itemsPerPage);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Vật phẩm quy đổi</h3>

            <div className="mb-3 p-3 bg-red-50/50 border border-red-100 text-[#dc2626] text-xs leading-relaxed rounded-lg">
                <span className="font-bold"> 2 Cách quyên góp:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0 text-red-600/80">
                    <li><span className="font-bold text-red-700">Cách 1:</span> Nhập số tiền ở trên, hệ thống sẽ tự lọc các vật phẩm phù hợp.</li>
                    <li><span className="font-bold text-red-700">Cách 2:</span> Chọn trực tiếp vật phẩm bên dưới, tổng tiền sẽ tự cộng dồn.</li>
                </ul>
            </div>

            <div className="flex-1 flex flex-col justify-between min-h-0 border border-gray-200 bg-white overflow-hidden">
                <div className="divide-y divide-gray-100 overflow-y-auto custom-scrollbar flex-1">
                    {visibleItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">
                            {amount > 0 ? "Không có món nào phù hợp với mức giá này" : "Vui lòng nhập tiền hoặc chọn món"}
                        </div>
                    ) : (
                        visibleItems.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(item => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                quantity={selectedItems[item.id] || 0}
                                isSelected={(selectedItems[item.id] || 0) > 0}
                                onSelect={() => onItemSelect(item.id)}
                                onQuantityChange={(diff) => onQuantityChange(item.id, diff)}
                            />
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {visibleItems.length > 0 && (
                    <div className="p-3 flex items-center justify-between text-xs border-t border-gray-100 bg-gray-50">
                        <span className="text-gray-400 font-medium">
                            Trang {page} / {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => onPageChange(page - 1)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Trước
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => onPageChange(page + 1)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
