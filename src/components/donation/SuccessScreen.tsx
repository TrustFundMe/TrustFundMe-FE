import { CheckCircle2 } from 'lucide-react';

type SuccessScreenProps = {
    totalAmount: number;
    onReset: () => void;
};

export default function SuccessScreen({ totalAmount, onReset }: SuccessScreenProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn đã đóng góp {totalAmount.toLocaleString('vi-VN')}₫</p>
                <button onClick={onReset} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                    Đóng góp thêm
                </button>
            </div>
        </div>
    );
}
