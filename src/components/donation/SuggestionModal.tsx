import { useEffect, useRef } from 'react';
import { SuggestionOption } from '@/utils/dpSuggestion';

type SuggestionModalProps = {
  suggestions: SuggestionOption[];
  onApply: (option: SuggestionOption) => void;
  onClose: () => void;
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

const CHIP_BORDER_COLORS = [
  'border-l-4 border-l-blue-500',
  'border-l-4 border-l-green-500',
  'border-l-4 border-l-orange-500',
  'border-l-4 border-l-purple-500',
  'border-l-4 border-l-teal-500',
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

export default function SuggestionModal({ suggestions, onApply, onClose, targetAmount, loading }: SuggestionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 bg-red-400 rounded-full"></div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-500">
                {loading ? 'Đang tạo gợi ý…' : 'Gợi ý tổ hợp vật phẩm'}
              </span>
              {loading && <span className="text-xs animate-pulse">✨</span>}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg font-bold"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Chọn số tiền <span className="font-bold text-gray-700">{targetAmount.toLocaleString('vi-VN')} ₫</span> — hệ thống gợi các tổ hợp phù hợp nhất bên dưới
          </p>
        </div>

        {/* Options list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {suggestions.map((opt, i) => {
            const colorClass = CHIP_COLORS[i % CHIP_COLORS.length];
            const borderClass = CHIP_BORDER_COLORS[i % CHIP_BORDER_COLORS.length];
            const textClass = CHIP_TEXT[i % CHIP_TEXT.length];
            const diffClass = opt.diff > 0 ? DIFF_POSITIVE : DIFF_NEGATIVE;
            const diffPrefix = opt.diff > 0 ? '+' : '';

            return (
              <button
                key={i}
                onClick={() => {
                  onApply(opt);
                  onClose();
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 ${colorClass} ${borderClass} transition-all hover:shadow-md hover:-translate-y-0.5 text-left`}
              >
                {/* Option number badge */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white ${textClass.replace('text-', 'bg-')}`}>
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Label */}
                  <p className={`text-[11px] font-extrabold uppercase tracking-wide mb-1 ${textClass}`}>
                    {opt.label || `Gợi ý ${i + 1}`}
                  </p>

                  {/* Items list */}
                  <div className="space-y-0.5 mb-2">
                    {opt.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="text-gray-400">·</span>
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <span className="text-gray-400">×</span>
                        <span className="font-bold text-gray-800">{item.quantity}</span>
                        <span className="text-gray-400 text-[10px]">
                          ({item.price.toLocaleString('vi-VN')} ₫/cái)
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-gray-900">
                        {opt.total.toLocaleString('vi-VN')} ₫
                      </span>
                      <span className={`text-[10px] font-semibold ${diffClass}`}>
                        {opt.diff === 0 ? '✓ Đúng target' : `${diffPrefix}${Math.abs(opt.diff).toLocaleString('vi-VN')} ₫`}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {opt.items.reduce((s, it) => s + it.quantity * it.price, 0) >= targetAmount ? '✓ Đủ' : 'Chưa đủ'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 text-center">
            Click vào gợi ý để áp dụng tổ hợp vật phẩm — hoặc bấm nút × / Esc để đóng
          </p>
        </div>
      </div>
    </div>
  );
}