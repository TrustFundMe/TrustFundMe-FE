import { Heart } from 'lucide-react';

type PaymentSummaryProps = {
    amount: number;
    compact?: boolean;
};

export default function PaymentSummary({ amount, compact = false }: PaymentSummaryProps) {
    const totalAmount = amount;

    return (
        <div>
            {/* Summary Card */}
            {!compact && (
                <>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tổng kết</h3>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden mb-4">
                        <div className="relative z-10 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tổng đóng góp</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight block">{totalAmount.toLocaleString('vi-VN')} ₫</span>
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
        </div>
    );
}
