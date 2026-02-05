import { Minus, Plus } from 'lucide-react';
import { ExpenditureItem } from './types';

type ItemRowProps = {
    item: ExpenditureItem;
    quantity: number;
    isSelected: boolean;
    onSelect: () => void;
    onQuantityChange: (diff: number) => void;
};

export default function ItemRow({ item, quantity, isSelected, onSelect, onQuantityChange }: ItemRowProps) {
    return (
        <div
            className="relative flex items-center p-3 group cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => !isSelected && onSelect()}
        >
            {/* Radio Circle */}
            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#dc2626]' : 'border-gray-300'
                }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 mr-4 flex items-center justify-between">
                <div>
                    <div className="font-bold text-gray-900 text-sm">{item.name} <span className="text-gray-400 font-normal">/ {item.unit}</span></div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                </div>

                <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">${item.price.toLocaleString('en-US').replace(/,/g, '.')}</div>
                </div>
            </div>

            {/* Controls (Absolute Right) */}
            {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onQuantityChange(-1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-500 hover:text-gray-900 rounded font-bold transition-all"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{quantity}</span>
                        <button
                            onClick={() => onQuantityChange(1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-500 hover:text-gray-900 rounded font-bold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
