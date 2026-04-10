import { SuggestionOption } from '@/utils/dpSuggestion';

type SuggestionChipsProps = {
  suggestions: SuggestionOption[];
  onApply: (option: SuggestionOption) => void;
  targetAmount: number;
  loading?: boolean;
};

const CHIP_COLORS = [
  'bg-blue-50 border-blue-200 hover:bg-blue-100',
  'bg-green-50 border-green-200 hover:bg-green-100',
  'bg-orange-50 border-orange-200 hover:bg-orange-100',
  'bg-purple-50 border-purple-200 hover:bg-purple-100',
  'bg-teal-50 border-teal-200 hover:bg-teal-100',
];

const CHIP_TEXT = [
  'text-blue-700',
  'text-green-700',
  'text-orange-700',
  'text-purple-700',
  'text-teal-700',
];

const DIFF_POSITIVE = 'text-green-600';
const DIFF_NEGATIVE = 'text-red-500';
const DIFF_NEUTRAL = 'text-gray-400';

export default function SuggestionChips({ suggestions, onApply, targetAmount, loading }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-0.5 bg-red-400 rounded-full"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
          {loading ? 'Đang tạo gợi ý…' : `Gợi ý tổ hợp cho ${targetAmount.toLocaleString('vi-VN')} ₫`}
        </span>
        {loading && (
          <span className="text-[10px] text-gray-400 animate-pulse">✨</span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {suggestions.map((opt, i) => {
          const colorClass = CHIP_COLORS[i % CHIP_COLORS.length];
          const textClass = CHIP_TEXT[i % CHIP_TEXT.length];
          const diffClass = opt.diff > 0 ? DIFF_POSITIVE : opt.diff < 0 ? DIFF_NEGATIVE : DIFF_NEUTRAL;
          const diffPrefix = opt.diff > 0 ? '+' : '';
          const diffLabel = opt.diff === 0 ? '= Target' : `${diffPrefix}${opt.diff.toLocaleString('vi-VN')} ₫`;

          const itemLabel = opt.items
            .map((it) => `${it.name} ×${it.quantity}`)
            .join(' + ');

          return (
            <button
              key={i}
              onClick={() => onApply(opt)}
              className={`shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border-2 ${colorClass} transition-all cursor-pointer text-left min-w-[140px] max-w-[200px]`}
            >
              {/* Label */}
              <span className={`text-[9px] font-extrabold uppercase tracking-wide ${textClass} mb-1`}>
                {opt.label || `Gợi ý ${i + 1}`}
              </span>

              {/* Items summary */}
              <span className="text-[10px] text-gray-600 leading-tight line-clamp-2 mb-1 w-full">
                {itemLabel.length > 40 ? itemLabel.substring(0, 38) + '…' : itemLabel}
              </span>

              {/* Total + diff */}
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-sm font-extrabold text-gray-900">
                  {opt.total.toLocaleString('vi-VN')} ₫
                </span>
                <span className={`text-[9px] font-semibold ${diffClass}`}>
                  {diffLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
