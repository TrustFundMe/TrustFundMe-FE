import { Heart } from 'lucide-react';

type PaymentSummaryProps = {
    amount: number;
    tipPercent: number;
    onTipChange: (percent: number) => void;
    compact?: boolean;
};

export default function PaymentSummary({ amount, tipPercent, onTipChange, compact = false }: PaymentSummaryProps) {
    const tipAmount = Math.round((amount * tipPercent) / 100);
    const totalAmount = amount + tipAmount;

    return (
        <div>
            {/* Summary Card */}
            {!compact && (
                <>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tổng kết</h3>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden mb-4">
                        <div className="relative z-10 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tổng đóng góp</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight block">${totalAmount.toLocaleString('en-US').replace(/,/g, '.')}</span>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03]">
                            <Heart className="w-24 h-24" />
                        </div>
                    </div>
                </>
            )}

            {compact && (
                <div className="bg-white rounded-xl p-3 px-4 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden mb-3">
                    <div className="relative z-10 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng đóng góp</span>
                        <span className="text-lg font-black text-gray-900 tracking-tight">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="p-1 opacity-5">
                        <Heart className="w-10 h-10" />
                    </div>
                </div>
            )}

            {/* Tip Slider */}
            <div className={`${compact ? 'space-y-2' : 'mb-4 space-y-2'}`}>
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">Tip ({tipPercent}%)</span>
                    <span className="text-gray-900">+ {tipAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="relative h-4 flex items-center">
                    <input
                        type="range" min="0" max="30" step="5"
                        value={tipPercent}
                        onChange={(e) => onTipChange(Number(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#dc2626] z-10 relative"
                    />
                    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-[2px] pointer-events-none">
                        {[0, 5, 10, 15, 20, 25, 30].map((step) => (
                            <div key={step} className={`w-1 h-1 rounded-full ${step <= tipPercent ? 'bg-[#dc2626]' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
