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
    return (
        <div
            className="relative flex items-center p-3 transition-colors hover:bg-gray-50"
        >
            {/* Radio Circle */}
            <div
                className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${isSelected ? 'border-brand' : 'border-gray-300'
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) onDeselect();
                    else onSelect(quantity || 1);
                }}
            >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
            </div>

            {/* Content */}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-900 text-sm">
                            {item.name}
                        </div>
                        <div className="font-black text-brand text-sm">
                            — {item.price.toLocaleString('vi-VN')} ₫
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 line-clamp-1">{item.description}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-orange-50 text-brand">
                            Còn lại: {item.quantityLeft}
                        </span>
                    </div>
                </div>

            {/* Controls (Absolute Right) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {isSelected && (
                    <button
                        onClick={onDeselect}
                        className="w-9 h-9 flex items-center justify-center bg-orange-50 text-brand hover:bg-orange-100 rounded-2xl font-bold transition-all shadow-sm shadow-orange-100"
                        title="Bỏ chọn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <div className="flex items-center bg-slate-100/80 rounded-2xl p-1 gap-1">
                    <button
                        onClick={() => onQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white active:scale-90"
                    >
                        <Minus className="w-4 h-4 cursor-pointer" />
                    </button>
                    <span className="w-8 text-center font-black text-base text-slate-900">{quantity || 1}</span>
                    <button
                        onClick={() => onQuantityChange(1)}
                        disabled={quantity >= item.quantityLeft}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white active:scale-90"
                    >
                        <Plus className="w-4 h-4 cursor-pointer" />
                    </button>
                </div>
            </div>
        </div>
    );
}
