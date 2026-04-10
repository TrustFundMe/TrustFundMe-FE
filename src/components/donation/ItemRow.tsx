import { Minus, Plus, X, Info } from 'lucide-react';
import { ExpenditureItem } from './types';

type ItemRowProps = {
    item: ExpenditureItem;
    quantity: number;
    isSelected: boolean;
    onSelect: (qty: number) => void;
    onQuantityChange: (diff: number) => void;
    onDeselect: () => void;
};

export default function ItemRow({ item, quantity, isSelected, onSelect, onQuantityChange, onDeselect }: ItemRowProps) {
    const isLastItem = item.quantityLeft === quantity;
    const isReservedByOther = item.reservations === 1 && !isSelected;

    return (
        <div
            className={`relative flex items-center p-3 transition-colors ${isReservedByOther ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
            {/* Radio Circle */}
            <div
                className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${isSelected ? 'border-[#dc2626]' : 'border-gray-300'
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isReservedByOther) return;
                    if (isSelected) onDeselect();
                    else onSelect(quantity || 1);
                }}
            >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 mr-4 flex items-center justify-between">
                <div>
                    <div className="font-bold text-gray-900 text-sm">
                        {item.name}
                        {isReservedByOther && (
                            <span className="text-orange-500 text-[10px] ml-2 font-medium bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                [Đang được người khác thanh toán]
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 line-clamp-1">{item.description}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isReservedByOther ? 'bg-gray-100 text-gray-400' : (item.reservations === 1 ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-red-600')}`}>
                            Còn lại: {isReservedByOther ? 0 : item.quantityLeft}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">{item.price.toLocaleString('vi-VN')} ₫</div>
                </div>
            </div>

            {/* Controls (Absolute Right) */}
            {!isReservedByOther && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isSelected && (
                        <button
                            onClick={onDeselect}
                            className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg font-bold transition-all"
                            title="Bỏ chọn"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{quantity || 1}</span>
                        <button
                            onClick={() => onQuantityChange(1)}
                            disabled={quantity >= item.quantityLeft}
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
