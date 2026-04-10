import { Minus, Plus, Info } from 'lucide-react';
import { ExpenditureItem } from './types';

type ItemRowProps = {
    item: ExpenditureItem;
    quantity: number;
    isSelected: boolean;
    onSelect: () => void;
    onQuantityChange: (diff: number) => void;
};

export default function ItemRow({ item, quantity, isSelected, onSelect, onQuantityChange }: ItemRowProps) {
    const isLastItem = item.quantityLeft === quantity;
    const isReservedByOther = item.reservations === 1 && !isSelected;

    return (
        <div
            className={`relative flex items-center p-3 transition-colors ${isReservedByOther ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
            onClick={() => !isSelected && !isReservedByOther && onSelect()}
        >
            {/* Radio Circle */}
            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#dc2626]' : 'border-gray-300'
                }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 mr-4 flex items-center justify-between">
                <div>
                    <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 line-clamp-1">{item.description}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${item.reservations === 1 ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                            Còn lại: {item.quantityLeft}
                        </span>
                    </div>
                    {/* Hint khi đang giữ sản phẩm cuối */}
                    {isLastItem && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-orange-600 font-medium">
                            <Info className="w-3 h-3" />
                            Bỏ chọn để thay đổi số lượng
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">{item.price.toLocaleString('vi-VN')} ₫</div>
                </div>
            </div>

            {/* Controls (Absolute Right) */}
            {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            disabled={isLastItem}
                            onClick={() => onQuantityChange(-1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{quantity}</span>
                        <button
                            disabled={isLastItem}
                            onClick={() => onQuantityChange(1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
